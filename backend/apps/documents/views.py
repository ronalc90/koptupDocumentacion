"""Documents views."""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Workspace, Document, DocumentVersion, DocumentComment,
    DocumentAttachment, DocumentHistory, DocumentReference
)
from .serializers import (
    WorkspaceSerializer, DocumentSerializer, DocumentVersionSerializer, DocumentCommentSerializer,
    DocumentAttachmentSerializer, DocumentHistorySerializer, DocumentReferenceSerializer
)


class WorkspaceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing workspaces.

    Endpoints:
    - GET /api/v1/documents/workspaces/ - List all workspaces
    - GET /api/v1/documents/workspaces/{id}/ - Get workspace detail
    - POST /api/v1/documents/workspaces/ - Create workspace
    - PUT/PATCH /api/v1/documents/workspaces/{id}/ - Update workspace
    - DELETE /api/v1/documents/workspaces/{id}/ - Delete workspace
    """

    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'is_active', 'organization']
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']

    def get_queryset(self):
        """Filter workspaces by organization."""
        queryset = super().get_queryset()
        if self.request.user.organization:
            queryset = queryset.filter(organization=self.request.user.organization)
        return queryset

    def perform_create(self, serializer):
        """Assign organization and created_by when creating workspace."""
        if not self.request.user.organization:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                'organization': ['El usuario debe pertenecer a una organización para crear espacios.']
            })

        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user
        )


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.filter(is_deleted=False)  # Excluir documentos eliminados
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['workspace', 'project', 'status', 'user_story', 'task', 'documentation_standard']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at']

    def perform_create(self, serializer):
        """Al crear un documento, asignar created_by y versión inicial."""
        document = serializer.save(
            created_by=self.request.user,
            last_modified_by=self.request.user,
            version='1.000'
        )

        # Crear snapshot inicial
        document.create_version_snapshot(
            user=self.request.user,
            changes_description='Versión inicial del documento'
        )

    def perform_update(self, serializer):
        """Al actualizar, incrementar versión y crear snapshot."""
        document = self.get_object()

        # Permitir que el usuario defina la versión manualmente
        custom_version = self.request.data.get('custom_version')
        changes_description = self.request.data.get('changes_description', 'Actualización del documento')

        if custom_version:
            # Validar formato de versión personalizada
            try:
                parts = custom_version.split('.')
                if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                    document.version = custom_version
                else:
                    # Si no es válido, incrementar automáticamente
                    document.increment_version()
            except:
                document.increment_version()
        else:
            # Incrementar versión automáticamente
            document.increment_version()

        # Actualizar last_modified_by
        serializer.save(
            last_modified_by=self.request.user,
            version=document.version
        )

        # Crear snapshot de la nueva versión
        document.create_version_snapshot(
            user=self.request.user,
            changes_description=changes_description
        )

    def perform_destroy(self, instance):
        """Soft delete: mover a papelera en lugar de eliminar."""
        instance.soft_delete(user=self.request.user)

    @action(detail=False, methods=['get'])
    def trash(self, request):
        """Listar documentos en la papelera."""
        trashed_docs = Document.objects.filter(is_deleted=True)
        serializer = self.get_serializer(trashed_docs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restaurar un documento de la papelera."""
        document = Document.objects.get(pk=pk)

        if not document.is_deleted:
            return Response(
                {'error': 'El documento no está en la papelera'},
                status=status.HTTP_400_BAD_REQUEST
            )

        document.restore()

        return Response(
            {'message': 'Documento restaurado exitosamente'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        """Eliminar permanentemente un documento (solo si está en papelera)."""
        document = Document.objects.get(pk=pk)

        if not document.is_deleted:
            return Response(
                {'error': 'Solo se pueden eliminar permanentemente documentos en la papelera'},
                status=status.HTTP_400_BAD_REQUEST
            )

        document.delete()  # Hard delete

        return Response(
            {'message': 'Documento eliminado permanentemente'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Obtener todas las versiones de un documento."""
        document = self.get_object()
        versions = document.versions.all().order_by('-created_at')
        serializer = DocumentVersionSerializer(versions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def revert_to_version(self, request, pk=None):
        """Revertir un documento a una versión anterior."""
        document = self.get_object()
        version_id = request.data.get('version_id')

        if not version_id:
            return Response(
                {'error': 'version_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            version = DocumentVersion.objects.get(id=version_id, document=document)

            # Guardar la versión actual antes de revertir
            document.create_version_snapshot(
                user=request.user,
                changes_description=f'Versión antes de revertir a {version.version_number}'
            )

            # Revertir contenido
            document.content = version.content
            document.content_html = version.content_html
            document.version = version.version_number
            document.last_modified_by = request.user
            document.save()

            # Crear snapshot de la reversión
            document.create_version_snapshot(
                user=request.user,
                changes_description=f'Revertido a versión {version.version_number}'
            )

            serializer = self.get_serializer(document)
            return Response(serializer.data)

        except DocumentVersion.DoesNotExist:
            return Response(
                {'error': 'Versión no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )


class DocumentVersionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentVersion.objects.all()
    serializer_class = DocumentVersionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document']


class DocumentCommentViewSet(viewsets.ModelViewSet):
    queryset = DocumentComment.objects.all()
    serializer_class = DocumentCommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document', 'is_resolved']


class DocumentAttachmentViewSet(viewsets.ModelViewSet):
    queryset = DocumentAttachment.objects.all()
    serializer_class = DocumentAttachmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document']


class DocumentHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentHistory.objects.all()
    serializer_class = DocumentHistorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document', 'action']


class DocumentReferenceViewSet(viewsets.ModelViewSet):
    queryset = DocumentReference.objects.all()
    serializer_class = DocumentReferenceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document', 'user_story', 'task']

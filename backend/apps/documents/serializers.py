"""Documents serializers."""
from rest_framework import serializers
from .models import (
    WorkspaceType, Workspace, Document, DocumentVersion, DocumentComment,
    DocumentAttachment, DocumentHistory, DocumentReference
)


class WorkspaceTypeSerializer(serializers.ModelSerializer):
    """Serializer for WorkspaceType model."""

    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = WorkspaceType
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'organization']

    def get_can_delete(self, obj):
        """Determina si el tipo puede ser eliminado."""
        # Los tipos de sistema no pueden eliminarse
        if obj.is_system:
            return False
        # Si tiene workspaces asociados, no puede eliminarse
        if obj.workspaces.filter(is_active=True).exists():
            return False
        return True


class WorkspaceSerializer(serializers.ModelSerializer):
    """Serializer for Workspace model."""

    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    document_count = serializers.SerializerMethodField()
    type_display = serializers.SerializerMethodField()

    # Campos dinámicos del WorkspaceType
    workspace_type_data = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'organization']

    def get_document_count(self, obj):
        """Retorna el número total de documentos en el workspace."""
        return obj.documents.filter(is_deleted=False).count()

    def get_type_display(self, obj):
        """Retorna el label del WorkspaceType si existe, sino usa get_type_display legacy."""
        if obj.workspace_type:
            return obj.workspace_type.label
        return obj.get_type_display() if obj.type else ''

    def get_workspace_type_data(self, obj):
        """Retorna los datos completos del WorkspaceType."""
        if obj.workspace_type:
            return {
                'id': obj.workspace_type.id,
                'key': obj.workspace_type.key,
                'label': obj.workspace_type.label,
                'description': obj.workspace_type.description,
                'icon': obj.workspace_type.icon,
                'color': obj.workspace_type.color,
            }
        return None


class DocumentSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True, required=False, allow_null=True)
    project_code = serializers.CharField(source='project.code', read_only=True, required=False, allow_null=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, required=False, allow_null=True)
    last_modified_by_name = serializers.CharField(source='last_modified_by.get_full_name', read_only=True, required=False, allow_null=True)
    deleted_by_name = serializers.CharField(source='deleted_by.get_full_name', read_only=True, required=False, allow_null=True)
    version_count = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = [
            'created_at', 'updated_at', 'created_by', 'last_modified_by',
            'is_deleted', 'deleted_at', 'deleted_by', 'version'
        ]

    def get_version_count(self, obj):
        """Retorna el número total de versiones del documento."""
        return obj.versions.count()


class DocumentVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = DocumentVersion
        fields = '__all__'
        read_only_fields = ['created_at']


class DocumentCommentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = DocumentComment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class DocumentAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = DocumentAttachment
        fields = '__all__'
        read_only_fields = ['uploaded_at']


class DocumentHistorySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)

    class Meta:
        model = DocumentHistory
        fields = '__all__'
        read_only_fields = ['performed_at']


class DocumentReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentReference
        fields = '__all__'
        read_only_fields = ['created_at']

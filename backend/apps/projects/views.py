"""Projects views."""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Client, Methodology, Project, ProjectMember, ProjectPhase, ProjectStatus
from .serializers import (
    ClientSerializer, MethodologySerializer, ProjectSerializer,
    ProjectMemberSerializer, ProjectPhaseSerializer, ProjectStatusSerializer
)


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['organization', 'is_active']
    search_fields = ['name', 'company', 'email']


class MethodologyViewSet(viewsets.ModelViewSet):
    queryset = Methodology.objects.all()
    serializer_class = MethodologySerializer
    permission_classes = [IsAuthenticated]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['organization', 'status', 'priority', 'client', 'methodology']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['created_at', 'start_date', 'name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProjectMemberViewSet(viewsets.ModelViewSet):
    queryset = ProjectMember.objects.all()
    serializer_class = ProjectMemberSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'user', 'is_active']


class ProjectPhaseViewSet(viewsets.ModelViewSet):
    queryset = ProjectPhase.objects.all()
    serializer_class = ProjectPhaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'is_completed']


class ProjectStatusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProjectStatus.objects.all()
    serializer_class = ProjectStatusSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project']

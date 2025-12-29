"""Projects serializers."""
from rest_framework import serializers
from .models import Client, Methodology, Project, ProjectMember, ProjectPhase, ProjectStatus


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class MethodologySerializer(serializers.ModelSerializer):
    class Meta:
        model = Methodology
        fields = '__all__'


class ProjectMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = ProjectMember
        fields = ['id', 'project', 'user', 'user_name', 'user_email', 'role', 'is_active', 'joined_at']


class ProjectPhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectPhase
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    methodology_name = serializers.CharField(source='methodology.name', read_only=True)
    project_manager_name = serializers.CharField(source='project_manager.get_full_name', read_only=True)
    members = ProjectMemberSerializer(many=True, read_only=True)
    phases = ProjectPhaseSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'organization', 'organization_name', 'name', 'code', 'description',
            'client', 'client_name', 'methodology', 'methodology_name', 'status', 'priority',
            'project_type', 'start_date', 'end_date', 'estimated_hours', 'actual_hours',
            'budget', 'repository_url', 'documentation_url', 'is_active',
            'project_manager', 'project_manager_name', 'members', 'phases',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProjectStatusSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = ProjectStatus
        fields = ['id', 'project', 'old_status', 'new_status', 'notes', 'changed_by', 'changed_by_name', 'changed_at']
        read_only_fields = ['changed_at']

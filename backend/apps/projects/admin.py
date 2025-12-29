"""Projects admin."""
from django.contrib import admin
from .models import Client, Methodology, Project, ProjectMember, ProjectPhase, ProjectStatus


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'email', 'organization', 'is_active']
    list_filter = ['is_active', 'organization']
    search_fields = ['name', 'company', 'email']


@admin.register(Methodology)
class MethodologyAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active']
    list_filter = ['is_active']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'status', 'priority', 'organization', 'created_at']
    list_filter = ['status', 'priority', 'organization', 'is_active']
    search_fields = ['name', 'code', 'description']


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'role', 'is_active']
    list_filter = ['is_active', 'role']


@admin.register(ProjectPhase)
class ProjectPhaseAdmin(admin.ModelAdmin):
    list_display = ['project', 'name', 'order', 'is_completed', 'completion_percentage']
    list_filter = ['is_completed']


@admin.register(ProjectStatus)
class ProjectStatusAdmin(admin.ModelAdmin):
    list_display = ['project', 'old_status', 'new_status', 'changed_by', 'changed_at']
    list_filter = ['old_status', 'new_status']

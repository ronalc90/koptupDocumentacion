"""Agile admin."""
from django.contrib import admin
from .models import Epic, UserStory, AcceptanceCriteria, Task, Sprint, SprintStory


@admin.register(Epic)
class EpicAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'owner']
    list_filter = ['status', 'priority', 'project']
    search_fields = ['title', 'description']


@admin.register(UserStory)
class UserStoryAdmin(admin.ModelAdmin):
    list_display = ['story_id', 'title', 'epic', 'status', 'priority', 'assigned_to']
    list_filter = ['status', 'priority', 'epic']
    search_fields = ['story_id', 'title', 'description']


@admin.register(AcceptanceCriteria)
class AcceptanceCriteriaAdmin(admin.ModelAdmin):
    list_display = ['user_story', 'order', 'is_met']
    list_filter = ['is_met']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user_story', 'task_type', 'status', 'assigned_to']
    list_filter = ['task_type', 'status']
    search_fields = ['title', 'description']


@admin.register(Sprint)
class SprintAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'start_date', 'end_date', 'is_active', 'is_completed']
    list_filter = ['is_active', 'is_completed', 'project']


@admin.register(SprintStory)
class SprintStoryAdmin(admin.ModelAdmin):
    list_display = ['sprint', 'user_story', 'added_at']
    list_filter = ['sprint']

"""Agile serializers."""
from rest_framework import serializers
from .models import Epic, UserStory, AcceptanceCriteria, Task, Sprint, SprintStory


class AcceptanceCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcceptanceCriteria
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    user_story_id = serializers.CharField(source='user_story.story_id', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class UserStorySerializer(serializers.ModelSerializer):
    epic_title = serializers.CharField(source='epic.title', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    acceptance_criteria = AcceptanceCriteriaSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = UserStory
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class EpicSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.code', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    user_stories = UserStorySerializer(many=True, read_only=True)

    class Meta:
        model = Epic
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class SprintSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.code', read_only=True)

    class Meta:
        model = Sprint
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class SprintStorySerializer(serializers.ModelSerializer):
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    story_title = serializers.CharField(source='user_story.title', read_only=True)

    class Meta:
        model = SprintStory
        fields = '__all__'
        read_only_fields = ['added_at']

"""Agile views."""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Epic, UserStory, AcceptanceCriteria, Task, Sprint, SprintStory
from .serializers import (
    EpicSerializer, UserStorySerializer, AcceptanceCriteriaSerializer,
    TaskSerializer, SprintSerializer, SprintStorySerializer
)


class EpicViewSet(viewsets.ModelViewSet):
    queryset = Epic.objects.all()
    serializer_class = EpicSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project', 'status', 'priority', 'owner']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'created_at']


class UserStoryViewSet(viewsets.ModelViewSet):
    queryset = UserStory.objects.all()
    serializer_class = UserStorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['epic', 'status', 'priority', 'assigned_to']
    search_fields = ['story_id', 'title', 'description']
    ordering_fields = ['order', 'created_at']


class AcceptanceCriteriaViewSet(viewsets.ModelViewSet):
    queryset = AcceptanceCriteria.objects.all()
    serializer_class = AcceptanceCriteriaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user_story', 'is_met']


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user_story', 'task_type', 'status', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'created_at']


class SprintViewSet(viewsets.ModelViewSet):
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'is_active', 'is_completed']


class SprintStoryViewSet(viewsets.ModelViewSet):
    queryset = SprintStory.objects.all()
    serializer_class = SprintStorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['sprint', 'user_story']

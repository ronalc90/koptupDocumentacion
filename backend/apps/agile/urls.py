"""Agile URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EpicViewSet, UserStoryViewSet, AcceptanceCriteriaViewSet,
    TaskViewSet, SprintViewSet, SprintStoryViewSet
)

router = DefaultRouter()
router.register(r'epics', EpicViewSet, basename='epic')
router.register(r'user-stories', UserStoryViewSet, basename='user-story')
router.register(r'acceptance-criteria', AcceptanceCriteriaViewSet, basename='acceptance-criteria')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'sprints', SprintViewSet, basename='sprint')
router.register(r'sprint-stories', SprintStoryViewSet, basename='sprint-story')

urlpatterns = [
    path('', include(router.urls)),
]

"""Projects URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientViewSet, MethodologyViewSet, ProjectViewSet,
    ProjectMemberViewSet, ProjectPhaseViewSet, ProjectStatusViewSet
)

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'methodologies', MethodologyViewSet, basename='methodology')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'members', ProjectMemberViewSet, basename='member')
router.register(r'phases', ProjectPhaseViewSet, basename='phase')
router.register(r'status-history', ProjectStatusViewSet, basename='status-history')

urlpatterns = [
    path('', include(router.urls)),
]

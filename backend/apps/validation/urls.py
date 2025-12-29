"""Validation URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ValidationRuleViewSet, ValidationResultViewSet, QAReviewViewSet,
    ValidationCheckpointViewSet, DocumentIssueViewSet
)

router = DefaultRouter()
router.register(r'rules', ValidationRuleViewSet, basename='rule')
router.register(r'results', ValidationResultViewSet, basename='result')
router.register(r'qa-reviews', QAReviewViewSet, basename='qa-review')
router.register(r'checkpoints', ValidationCheckpointViewSet, basename='checkpoint')
router.register(r'issues', DocumentIssueViewSet, basename='issue')

urlpatterns = [
    path('', include(router.urls)),
]

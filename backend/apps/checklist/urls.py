"""Checklist URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DeliveryChecklistViewSet, ChecklistItemViewSet, BlockingIssueViewSet,
    DeliveryCertificateViewSet, ChecklistTemplateViewSet
)

router = DefaultRouter()
router.register(r'checklists', DeliveryChecklistViewSet, basename='checklist')
router.register(r'items', ChecklistItemViewSet, basename='item')
router.register(r'blocking-issues', BlockingIssueViewSet, basename='blocking-issue')
router.register(r'certificates', DeliveryCertificateViewSet, basename='certificate')
router.register(r'templates', ChecklistTemplateViewSet, basename='template')

urlpatterns = [
    path('', include(router.urls)),
]

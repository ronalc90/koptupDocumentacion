"""Audit URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuditLogViewSet, ApprovalHistoryViewSet, AccessLogViewSet,
    ComplianceReportViewSet, DataRetentionPolicyViewSet, SecurityEventViewSet
)

router = DefaultRouter()
router.register(r'logs', AuditLogViewSet, basename='log')
router.register(r'approvals', ApprovalHistoryViewSet, basename='approval')
router.register(r'access', AccessLogViewSet, basename='access')
router.register(r'compliance-reports', ComplianceReportViewSet, basename='compliance-report')
router.register(r'retention-policies', DataRetentionPolicyViewSet, basename='retention-policy')
router.register(r'security-events', SecurityEventViewSet, basename='security-event')

urlpatterns = [
    path('', include(router.urls)),
]

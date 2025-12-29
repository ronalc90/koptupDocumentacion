"""Audit admin."""
from django.contrib import admin
from .models import AuditLog, ApprovalHistory, AccessLog, ComplianceReport, DataRetentionPolicy, SecurityEvent


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['action_type', 'resource_type', 'user', 'organization', 'timestamp']
    list_filter = ['action_type', 'resource_type', 'organization']
    search_fields = ['resource_name', 'description']


@admin.register(ApprovalHistory)
class ApprovalHistoryAdmin(admin.ModelAdmin):
    list_display = ['approval_type', 'resource_name', 'status', 'approver', 'requested_at']
    list_filter = ['approval_type', 'status']


@admin.register(AccessLog)
class AccessLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'resource_type', 'resource_name', 'action', 'accessed_at']
    list_filter = ['resource_type', 'action']


@admin.register(ComplianceReport)
class ComplianceReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'report_type', 'organization', 'status', 'created_at']
    list_filter = ['report_type', 'status']


@admin.register(DataRetentionPolicy)
class DataRetentionPolicyAdmin(admin.ModelAdmin):
    list_display = ['organization', 'data_type', 'retention_days', 'is_active']
    list_filter = ['is_active']


@admin.register(SecurityEvent)
class SecurityEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'severity', 'organization', 'is_resolved', 'occurred_at']
    list_filter = ['event_type', 'severity', 'is_resolved']

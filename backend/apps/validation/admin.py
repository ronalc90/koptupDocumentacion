"""Validation admin."""
from django.contrib import admin
from .models import ValidationRule, ValidationResult, QAReview, ValidationCheckpoint, DocumentIssue


@admin.register(ValidationRule)
class ValidationRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'rule_type', 'severity', 'is_active']
    list_filter = ['rule_type', 'severity', 'is_active']


@admin.register(ValidationResult)
class ValidationResultAdmin(admin.ModelAdmin):
    list_display = ['document', 'validation_rule', 'status', 'validated_at']
    list_filter = ['status']


@admin.register(QAReview)
class QAReviewAdmin(admin.ModelAdmin):
    list_display = ['document', 'reviewer', 'status', 'is_blocking', 'created_at']
    list_filter = ['status', 'is_blocking']


@admin.register(ValidationCheckpoint)
class ValidationCheckpointAdmin(admin.ModelAdmin):
    list_display = ['document', 'checkpoint_name', 'is_passed', 'passed_at']
    list_filter = ['is_passed']


@admin.register(DocumentIssue)
class DocumentIssueAdmin(admin.ModelAdmin):
    list_display = ['title', 'document', 'severity', 'status', 'assigned_to']
    list_filter = ['severity', 'status']

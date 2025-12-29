"""Checklist admin."""
from django.contrib import admin
from .models import DeliveryChecklist, ChecklistItem, BlockingIssue, DeliveryCertificate, ChecklistTemplate


@admin.register(DeliveryChecklist)
class DeliveryChecklistAdmin(admin.ModelAdmin):
    list_display = ['project', 'status', 'completion_percentage', 'is_certified', 'certified_at']
    list_filter = ['status', 'is_certified']


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'checklist', 'item_type', 'status', 'is_mandatory']
    list_filter = ['item_type', 'status', 'is_mandatory']


@admin.register(BlockingIssue)
class BlockingIssueAdmin(admin.ModelAdmin):
    list_display = ['title', 'checklist', 'severity', 'status', 'assigned_to']
    list_filter = ['severity', 'status']


@admin.register(DeliveryCertificate)
class DeliveryCertificateAdmin(admin.ModelAdmin):
    list_display = ['certificate_number', 'checklist', 'is_final', 'certificate_date']
    list_filter = ['is_final']


@admin.register(ChecklistTemplate)
class ChecklistTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'project_type', 'is_active', 'created_at']
    list_filter = ['is_active', 'project_type']

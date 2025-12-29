"""Documents admin."""
from django.contrib import admin
from .models import (
    Document, DocumentVersion, DocumentComment,
    DocumentAttachment, DocumentHistory, DocumentReference
)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'documentation_standard', 'status', 'version', 'created_at']
    list_filter = ['status', 'documentation_standard', 'project']
    search_fields = ['title', 'content']


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ['document', 'version_number', 'created_at', 'created_by']
    list_filter = ['created_at']


@admin.register(DocumentComment)
class DocumentCommentAdmin(admin.ModelAdmin):
    list_display = ['document', 'is_resolved', 'created_by', 'created_at']
    list_filter = ['is_resolved']


@admin.register(DocumentAttachment)
class DocumentAttachmentAdmin(admin.ModelAdmin):
    list_display = ['document', 'file_name', 'file_type', 'uploaded_at', 'uploaded_by']
    list_filter = ['file_type']


@admin.register(DocumentHistory)
class DocumentHistoryAdmin(admin.ModelAdmin):
    list_display = ['document', 'action', 'performed_by', 'performed_at']
    list_filter = ['action']


@admin.register(DocumentReference)
class DocumentReferenceAdmin(admin.ModelAdmin):
    list_display = ['document', 'user_story', 'task', 'reference_type']
    list_filter = ['reference_type']

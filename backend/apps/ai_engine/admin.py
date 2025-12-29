"""AI Engine admin."""
from django.contrib import admin
from .models import EmbeddedDocument, AIGenerationLog, AIFeedback, AIPromptTemplate, RAGConfiguration


@admin.register(EmbeddedDocument)
class EmbeddedDocumentAdmin(admin.ModelAdmin):
    list_display = ['documentation_example', 'documentation_standard', 'chunk_index', 'created_at']


@admin.register(AIGenerationLog)
class AIGenerationLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'document', 'status', 'tokens_used', 'created_at']
    list_filter = ['status']


@admin.register(AIFeedback)
class AIFeedbackAdmin(admin.ModelAdmin):
    list_display = ['generation_log', 'rating', 'was_useful', 'created_at']
    list_filter = ['rating', 'was_useful']


@admin.register(AIPromptTemplate)
class AIPromptTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'documentation_standard', 'organization', 'is_active']
    list_filter = ['is_active']


@admin.register(RAGConfiguration)
class RAGConfigurationAdmin(admin.ModelAdmin):
    list_display = ['organization', 'embedding_model', 'llm_model', 'is_active']
    list_filter = ['is_active']

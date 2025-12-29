"""Standards admin - AI-powered documentation generation system."""
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    DocumentationStandard,
    DocumentationExample,
    AIGenerationTest,
)


class DocumentationExampleInline(admin.TabularInline):
    """Inline para mostrar ejemplos dentro del estándar."""
    model = DocumentationExample
    extra = 1
    fields = ['title', 'input_prompt', 'complexity_level', 'is_featured', 'is_active', 'order']
    show_change_link = True


@admin.register(DocumentationStandard)
class DocumentationStandardAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'category',
        'organization',
        'requires_diagram_badge',
        'examples_count',
        'is_active',
        'created_at'
    ]
    list_filter = ['category', 'requires_diagram', 'diagram_type', 'is_active', 'organization']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    inlines = [DocumentationExampleInline]

    fieldsets = (
        ('Información Básica', {
            'fields': ('organization', 'name', 'category', 'description', 'icon', 'color')
        }),
        ('Configuración de IA', {
            'fields': ('ai_prompt_template', 'requires_diagram', 'diagram_type'),
            'description': 'Configura cómo la IA generará documentación basándose en los ejemplos'
        }),
        ('Estado', {
            'fields': ('is_active', 'created_at', 'updated_at', 'created_by')
        }),
    )

    def requires_diagram_badge(self, obj):
        if obj.requires_diagram:
            return format_html(
                '<span style="background-color: #4CAF50; color: white; padding: 3px 10px; border-radius: 3px;">✓ Sí ({})</span>',
                obj.diagram_type
            )
        return format_html('<span style="color: #999;">—</span>')
    requires_diagram_badge.short_description = 'Genera Diagramas'

    def examples_count(self, obj):
        count = obj.examples.filter(is_active=True).count()
        if count > 0:
            return format_html(
                '<span style="background-color: #2196F3; color: white; padding: 3px 10px; border-radius: 3px;">{} ejemplos</span>',
                count
            )
        return format_html('<span style="color: #f44336;">0 ejemplos</span>')
    examples_count.short_description = 'Ejemplos'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(DocumentationExample)
class DocumentationExampleAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'standard',
        'complexity_level',
        'is_featured_badge',
        'has_diagram',
        'order',
        'is_active',
        'created_at'
    ]
    list_filter = ['standard', 'complexity_level', 'is_featured', 'is_active', 'created_at']
    search_fields = ['title', 'input_prompt', 'generated_content', 'tags']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'preview_diagram']
    ordering = ['standard', 'order', '-created_at']

    fieldsets = (
        ('Información Básica', {
            'fields': ('standard', 'title', 'tags', 'complexity_level')
        }),
        ('Input - Lo que el usuario proporciona', {
            'fields': ('input_prompt',),
            'description': 'Enunciado o descripción que el usuario escribiría'
        }),
        ('Output - Lo que la IA debe generar', {
            'fields': ('generated_content', 'diagram_code', 'diagram_image', 'preview_diagram'),
            'description': 'Resultado esperado de la generación'
        }),
        ('Visibilidad y Orden', {
            'fields': ('is_featured', 'is_active', 'order')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )

    def is_featured_badge(self, obj):
        if obj.is_featured:
            return format_html('<span style="color: #FF9800;">⭐ Destacado</span>')
        return '—'
    is_featured_badge.short_description = 'Destacado'

    def has_diagram(self, obj):
        if obj.diagram_code or obj.diagram_image:
            return format_html('<span style="color: #4CAF50;">✓</span>')
        return format_html('<span style="color: #999;">—</span>')
    has_diagram.short_description = 'Diagrama'

    def preview_diagram(self, obj):
        if obj.diagram_image:
            return format_html(
                '<img src="{}" style="max-width: 400px; max-height: 300px;" />',
                obj.diagram_image.url
            )
        return 'Sin imagen'
    preview_diagram.short_description = 'Preview del Diagrama'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(AIGenerationTest)
class AIGenerationTestAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'standard',
        'prompt_preview',
        'status_badge',
        'generation_time',
        'rating_stars',
        'created_at',
        'created_by'
    ]
    list_filter = ['status', 'standard', 'ai_model_used', 'user_rating', 'created_at']
    search_fields = ['user_prompt', 'generated_content', 'user_feedback']
    readonly_fields = [
        'created_at',
        'updated_at',
        'created_by',
        'preview_generated_diagram',
        'full_generated_content'
    ]
    ordering = ['-created_at']

    fieldsets = (
        ('Prueba', {
            'fields': ('standard', 'user_prompt')
        }),
        ('Resultado de la Generación', {
            'fields': (
                'status',
                'ai_model_used',
                'generation_time_seconds',
                'full_generated_content',
                'generated_diagram_code',
                'generated_diagram_image',
                'preview_generated_diagram',
                'error_message'
            )
        }),
        ('Evaluación del Usuario', {
            'fields': ('user_rating', 'user_feedback')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )

    def prompt_preview(self, obj):
        return obj.user_prompt[:80] + '...' if len(obj.user_prompt) > 80 else obj.user_prompt
    prompt_preview.short_description = 'Prompt del Usuario'

    def status_badge(self, obj):
        colors = {
            'PENDING': '#FFC107',
            'PROCESSING': '#2196F3',
            'COMPLETED': '#4CAF50',
            'FAILED': '#f44336',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            colors.get(obj.status, '#999'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Estado'

    def generation_time(self, obj):
        if obj.generation_time_seconds:
            return f"{obj.generation_time_seconds:.2f}s"
        return '—'
    generation_time.short_description = 'Tiempo'

    def rating_stars(self, obj):
        if obj.user_rating:
            stars = '⭐' * obj.user_rating
            return format_html('<span style="font-size: 14px;">{}</span>', stars)
        return '—'
    rating_stars.short_description = 'Calificación'

    def full_generated_content(self, obj):
        if obj.generated_content:
            return format_html('<pre style="background: #f5f5f5; padding: 10px; max-height: 400px; overflow: auto;">{}</pre>', obj.generated_content)
        return 'Sin contenido generado'
    full_generated_content.short_description = 'Contenido Generado'

    def preview_generated_diagram(self, obj):
        if obj.generated_diagram_image:
            return format_html(
                '<img src="{}" style="max-width: 500px; max-height: 400px;" />',
                obj.generated_diagram_image.url
            )
        return 'Sin diagrama generado'
    preview_generated_diagram.short_description = 'Preview del Diagrama Generado'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

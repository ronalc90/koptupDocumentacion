"""Standards models - AI-powered documentation generation system."""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import Organization, User


class DocumentationStandard(models.Model):
    """
    Estándar de documentación - Define una categoría de documentación.
    Ejemplos: Casos de Uso, Diagramas UML, APIs REST, Base de Datos, etc.
    """

    CATEGORY_CHOICES = [
        ('USE_CASE', 'Casos de Uso'),
        ('UML_DIAGRAM', 'Diagramas UML'),
        ('API_REST', 'APIs REST'),
        ('DATABASE', 'Base de Datos'),
        ('ARCHITECTURE', 'Arquitectura'),
        ('USER_MANUAL', 'Manual de Usuario'),
        ('TECHNICAL_SPEC', 'Especificación Técnica'),
        ('TEST_PLAN', 'Plan de Pruebas'),
        ('DEPLOYMENT', 'Despliegue'),
        ('OTHER', 'Otro'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='standards'
    )
    name = models.CharField(max_length=200, help_text="Nombre del estándar (ej: Casos de Uso)")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(
        help_text="Descripción de qué tipo de documentación cubre este estándar"
    )
    icon = models.CharField(max_length=50, blank=True, default='📄')
    color = models.CharField(max_length=7, default='#667eea')

    # AI Generation Settings
    ai_prompt_template = models.TextField(
        blank=True,
        help_text="Plantilla de prompt para generación con IA. Usa {input} para el texto del usuario."
    )
    requires_diagram = models.BooleanField(
        default=False,
        help_text="¿Este estándar genera diagramas visuales?"
    )
    diagram_type = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ('MERMAID', 'Mermaid'),
            ('PLANTUML', 'PlantUML'),
            ('DRAWIO', 'Draw.io'),
            ('IMAGE', 'Imagen'),
        ]
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_standards'
    )

    class Meta:
        db_table = 'documentation_standards'
        unique_together = ['organization', 'name']
        ordering = ['category', 'name']
        verbose_name = 'Estándar de Documentación'
        verbose_name_plural = 'Estándares de Documentación'

    def __str__(self):
        return f"{self.name} ({self.organization.name})"


class DocumentationExample(models.Model):
    """
    Ejemplo de documentación - Muestra cómo debe verse el output final.
    Cada ejemplo incluye un 'enunciado' (input) y el 'documento generado' (output).
    """

    standard = models.ForeignKey(
        DocumentationStandard,
        on_delete=models.CASCADE,
        related_name='examples'
    )
    title = models.CharField(
        max_length=255,
        help_text="Título descriptivo del ejemplo (ej: Login de Usuario)"
    )

    # Input - Lo que el usuario proporciona
    input_prompt = models.TextField(
        help_text="Enunciado/descripción que el usuario proporciona para generar la documentación"
    )

    # Output - El resultado esperado
    generated_content = models.TextField(
        help_text="Contenido del documento generado (texto, markdown, etc.)"
    )
    diagram_code = models.TextField(
        blank=True,
        help_text="Código del diagrama (Mermaid, PlantUML, etc.) si aplica"
    )
    diagram_image = models.FileField(
        upload_to='examples/diagrams/',
        blank=True,
        null=True,
        help_text="Imagen del diagrama renderizado"
    )

    # Metadata
    tags = models.CharField(
        max_length=255,
        blank=True,
        help_text="Tags separados por comas para búsqueda (ej: autenticación, login, seguridad)"
    )
    complexity_level = models.CharField(
        max_length=20,
        choices=[
            ('SIMPLE', 'Simple'),
            ('MEDIUM', 'Medio'),
            ('COMPLEX', 'Complejo'),
        ],
        default='MEDIUM'
    )

    # Orden y visibilidad
    order = models.IntegerField(default=0, help_text="Orden de aparición")
    is_featured = models.BooleanField(
        default=False,
        help_text="¿Mostrar como ejemplo destacado?"
    )
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_examples'
    )

    class Meta:
        db_table = 'documentation_examples'
        ordering = ['order', '-created_at']
        verbose_name = 'Ejemplo de Documentación'
        verbose_name_plural = 'Ejemplos de Documentación'

    def __str__(self):
        return f"{self.title} - {self.standard.name}"


class AIGenerationTest(models.Model):
    """
    Prueba de generación con IA - Testing de cómo la IA genera docs.
    El usuario escribe solo el enunciado y la IA genera el documento basándose en los ejemplos.
    """

    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('PROCESSING', 'Procesando'),
        ('COMPLETED', 'Completado'),
        ('FAILED', 'Fallido'),
    ]

    standard = models.ForeignKey(
        DocumentationStandard,
        on_delete=models.CASCADE,
        related_name='ai_tests'
    )

    # Input del usuario - Solo el enunciado
    user_prompt = models.TextField(
        help_text="Enunciado que el usuario proporciona (ej: 'Sistema de login con email y contraseña')"
    )

    # Output generado por IA
    generated_content = models.TextField(
        blank=True,
        help_text="Contenido generado por la IA"
    )
    generated_diagram_code = models.TextField(
        blank=True,
        help_text="Código del diagrama generado (si aplica)"
    )
    generated_diagram_image = models.FileField(
        upload_to='ai_tests/diagrams/',
        blank=True,
        null=True,
        help_text="Imagen del diagrama renderizado"
    )

    # Metadatos de la generación
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    ai_model_used = models.CharField(
        max_length=100,
        blank=True,
        help_text="Modelo de IA utilizado (ej: gpt-4, claude-3, etc.)"
    )
    generation_time_seconds = models.FloatField(
        null=True,
        blank=True,
        help_text="Tiempo que tardó la generación en segundos"
    )
    error_message = models.TextField(blank=True)

    # Evaluación del usuario
    user_rating = models.IntegerField(
        null=True,
        blank=True,
        help_text="Calificación del usuario (1-5)"
    )
    user_feedback = models.TextField(
        blank=True,
        help_text="Comentarios del usuario sobre la generación"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='ai_tests'
    )

    class Meta:
        db_table = 'ai_generation_tests'
        ordering = ['-created_at']
        verbose_name = 'Prueba de Generación IA'
        verbose_name_plural = 'Pruebas de Generación IA'

    def __str__(self):
        return f"Test: {self.user_prompt[:50]}... ({self.status})"

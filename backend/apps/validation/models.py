"""Validation models."""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User
from apps.documents.models import Document
from apps.standards.models import DocumentationStandard


class ValidationRule(models.Model):
    """Automated validation rules for documents."""

    RULE_TYPE_CHOICES = [
        ('SECTION_EXISTS', 'Sección existe'),
        ('SECTION_NOT_EMPTY', 'Sección no vacía'),
        ('MIN_LENGTH', 'Longitud mínima'),
        ('MAX_LENGTH', 'Longitud máxima'),
        ('REGEX_MATCH', 'Coincidencia regex'),
        ('WORD_COUNT', 'Conteo de palabras'),
        ('COHERENCE', 'Coherencia con historias'),
        ('TRACEABILITY', 'Trazabilidad'),
        ('FORMAT_CHECK', 'Verificación de formato'),
    ]

    SEVERITY_CHOICES = [
        ('INFO', 'Información'),
        ('WARNING', 'Advertencia'),
        ('ERROR', 'Error'),
        ('CRITICAL', 'Crítico'),
    ]

    documentation_standard = models.ForeignKey(
        DocumentationStandard,
        on_delete=models.CASCADE,
        related_name='validation_rules',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=255)
    rule_type = models.CharField(max_length=30, choices=RULE_TYPE_CHOICES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='ERROR')
    description = models.TextField()
    validation_logic = models.JSONField(default=dict)
    error_message = models.TextField()
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'validation_rules'
        ordering = ['order']

    def __str__(self):
        return f"{self.name} - {self.severity}"


class ValidationResult(models.Model):
    """Results of automated validation."""

    STATUS_CHOICES = [
        ('PASSED', 'Aprobado'),
        ('FAILED', 'Fallido'),
        ('WARNING', 'Advertencia'),
        ('SKIPPED', 'Omitido'),
    ]

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='validation_results'
    )
    validation_rule = models.ForeignKey(
        ValidationRule,
        on_delete=models.CASCADE,
        related_name='results'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    message = models.TextField()
    details = models.JSONField(default=dict)
    validated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'validation_results'
        ordering = ['-validated_at']

    def __str__(self):
        return f"{self.document.title} - {self.validation_rule.name}: {self.status}"


class QAReview(models.Model):
    """Manual QA review of documents."""

    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('IN_REVIEW', 'En revisión'),
        ('APPROVED', 'Aprobado'),
        ('REJECTED', 'Rechazado'),
        ('CHANGES_REQUESTED', 'Cambios solicitados'),
    ]

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='qa_reviews'
    )
    reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='qa_reviews_performed'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    comments = models.TextField(blank=True)
    checklist_data = models.JSONField(default=dict)
    is_blocking = models.BooleanField(default=False)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'qa_reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f"QA Review - {self.document.title} - {self.status}"


class ValidationCheckpoint(models.Model):
    """Checkpoints in the validation process."""

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='checkpoints'
    )
    checkpoint_name = models.CharField(max_length=255)
    is_passed = models.BooleanField(default=False)
    passed_at = models.DateTimeField(null=True, blank=True)
    validated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'validation_checkpoints'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.document.title} - {self.checkpoint_name}"


class DocumentIssue(models.Model):
    """Issues found during validation or review."""

    SEVERITY_CHOICES = [
        ('LOW', 'Baja'),
        ('MEDIUM', 'Media'),
        ('HIGH', 'Alta'),
        ('CRITICAL', 'Crítica'),
    ]

    STATUS_CHOICES = [
        ('OPEN', 'Abierto'),
        ('IN_PROGRESS', 'En progreso'),
        ('RESOLVED', 'Resuelto'),
        ('WONT_FIX', 'No se corregirá'),
    ]

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='issues'
    )
    qa_review = models.ForeignKey(
        QAReview,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issues'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    section_reference = models.CharField(max_length=255, blank=True)
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_issues'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_issues'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_issues'
    )

    class Meta:
        db_table = 'document_issues'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.severity}"

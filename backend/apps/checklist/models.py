"""Checklist models for delivery certification."""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User
from apps.projects.models import Project


class DeliveryChecklist(models.Model):
    """Main delivery checklist for a project."""

    STATUS_CHOICES = [
        ('IN_PROGRESS', 'En progreso'),
        ('COMPLETED', 'Completado'),
        ('BLOCKED', 'Bloqueado'),
        ('CERTIFIED', 'Certificado'),
    ]

    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name='delivery_checklist'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_certified = models.BooleanField(default=False)
    certified_at = models.DateTimeField(null=True, blank=True)
    certified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='certified_deliveries'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'delivery_checklists'

    def __str__(self):
        return f"Checklist - {self.project.code}"


class ChecklistItem(models.Model):
    """Individual item in the delivery checklist."""

    ITEM_TYPE_CHOICES = [
        ('STORIES_CLOSED', 'Historias cerradas'),
        ('DOCUMENTATION_APPROVED', 'Documentación aprobada'),
        ('QA_VALIDATED', 'QA validado'),
        ('DELIVERY_DOCUMENT', 'Acta de entrega'),
        ('CUSTOM', 'Personalizado'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('IN_PROGRESS', 'En progreso'),
        ('COMPLETED', 'Completado'),
        ('FAILED', 'Fallido'),
        ('NA', 'No aplica'),
    ]

    checklist = models.ForeignKey(
        DeliveryChecklist,
        on_delete=models.CASCADE,
        related_name='items'
    )
    item_type = models.CharField(max_length=30, choices=ITEM_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    is_mandatory = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    order = models.IntegerField(default=0)
    validation_criteria = models.JSONField(default=dict)
    validation_result = models.JSONField(default=dict)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='completed_checklist_items'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'checklist_items'
        ordering = ['order']

    def __str__(self):
        return f"{self.title} - {self.status}"


class BlockingIssue(models.Model):
    """Issues blocking delivery certification."""

    SEVERITY_CHOICES = [
        ('MINOR', 'Menor'),
        ('MAJOR', 'Mayor'),
        ('CRITICAL', 'Crítico'),
        ('BLOCKER', 'Bloqueante'),
    ]

    STATUS_CHOICES = [
        ('OPEN', 'Abierto'),
        ('IN_PROGRESS', 'En progreso'),
        ('RESOLVED', 'Resuelto'),
    ]

    checklist = models.ForeignKey(
        DeliveryChecklist,
        on_delete=models.CASCADE,
        related_name='blocking_issues'
    )
    checklist_item = models.ForeignKey(
        ChecklistItem,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='blocking_issues'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MAJOR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_blocking_issues'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_blocking_issues'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_blocking_issues'
    )

    class Meta:
        db_table = 'blocking_issues'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.severity}"


class DeliveryCertificate(models.Model):
    """Official delivery certificate/document."""

    checklist = models.OneToOneField(
        DeliveryChecklist,
        on_delete=models.CASCADE,
        related_name='certificate'
    )
    certificate_number = models.CharField(max_length=100, unique=True)
    certificate_date = models.DateTimeField(auto_now_add=True)
    project_summary = models.TextField()
    deliverables = models.JSONField(default=list)
    certifications = models.JSONField(default=dict)
    signatures = models.JSONField(default=dict)
    pdf_file = models.FileField(upload_to='certificates/', null=True, blank=True)
    is_final = models.BooleanField(default=True)
    issued_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='issued_certificates'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'delivery_certificates'
        ordering = ['-created_at']

    def __str__(self):
        return f"Certificate {self.certificate_number} - {self.checklist.project.code}"


class ChecklistTemplate(models.Model):
    """Template for delivery checklists."""

    name = models.CharField(max_length=255)
    description = models.TextField()
    project_type = models.CharField(max_length=100, blank=True)
    template_data = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        db_table = 'checklist_templates'
        ordering = ['name']

    def __str__(self):
        return self.name

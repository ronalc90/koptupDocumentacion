"""Audit and compliance models."""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User, Organization
from apps.projects.models import Project


class AuditLog(models.Model):
    """Immutable audit log of all system actions."""

    ACTION_TYPES = [
        ('CREATE', 'Crear'),
        ('READ', 'Leer'),
        ('UPDATE', 'Actualizar'),
        ('DELETE', 'Eliminar'),
        ('APPROVE', 'Aprobar'),
        ('REJECT', 'Rechazar'),
        ('EXPORT', 'Exportar'),
        ('IMPORT', 'Importar'),
        ('LOGIN', 'Iniciar sesión'),
        ('LOGOUT', 'Cerrar sesión'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='audit_logs'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=100)
    resource_name = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    request_data = models.JSONField(default=dict)
    response_data = models.JSONField(default=dict)
    status_code = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['organization', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]

    def __str__(self):
        return f"{self.action_type} - {self.resource_type} by {self.user}"


class ApprovalHistory(models.Model):
    """History of all approvals in the system."""

    APPROVAL_TYPES = [
        ('DOCUMENT', 'Documento'),
        ('USER_STORY', 'Historia de usuario'),
        ('QA_REVIEW', 'Revisión QA'),
        ('DELIVERY', 'Entrega'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('APPROVED', 'Aprobado'),
        ('REJECTED', 'Rechazado'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='approval_history'
    )
    approval_type = models.CharField(max_length=20, choices=APPROVAL_TYPES)
    resource_id = models.CharField(max_length=100)
    resource_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    approver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='approvals_made'
    )
    requester = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='approvals_requested'
    )
    comments = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)
    requested_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'approval_history'
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.approval_type} - {self.resource_name} - {self.status}"


class AccessLog(models.Model):
    """Logs of user access to sensitive resources."""

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='access_logs'
    )
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=100)
    resource_name = models.CharField(max_length=255)
    action = models.CharField(max_length=50)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    accessed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'access_logs'
        ordering = ['-accessed_at']
        indexes = [
            models.Index(fields=['user', 'accessed_at']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]

    def __str__(self):
        return f"{self.user} accessed {self.resource_type} at {self.accessed_at}"


class ComplianceReport(models.Model):
    """Generated compliance reports."""

    REPORT_TYPES = [
        ('ISO27001', 'ISO 27001'),
        ('SOC2', 'SOC 2'),
        ('GDPR', 'GDPR'),
        ('CUSTOM', 'Personalizado'),
    ]

    STATUS_CHOICES = [
        ('GENERATING', 'Generando'),
        ('COMPLETED', 'Completado'),
        ('FAILED', 'Fallido'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='compliance_reports'
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='compliance_reports'
    )
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='GENERATING')
    report_data = models.JSONField(default=dict)
    file = models.FileField(upload_to='compliance_reports/', null=True, blank=True)
    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='generated_compliance_reports'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'compliance_reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.report_type} - {self.title}"


class DataRetentionPolicy(models.Model):
    """Data retention policies per organization."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='retention_policies'
    )
    data_type = models.CharField(max_length=100)
    retention_days = models.IntegerField()
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'data_retention_policies'
        unique_together = ['organization', 'data_type']

    def __str__(self):
        return f"{self.organization.name} - {self.data_type} - {self.retention_days} days"


class SecurityEvent(models.Model):
    """Security-related events."""

    EVENT_TYPES = [
        ('FAILED_LOGIN', 'Intento de login fallido'),
        ('UNAUTHORIZED_ACCESS', 'Acceso no autorizado'),
        ('PERMISSION_DENIED', 'Permiso denegado'),
        ('DATA_EXPORT', 'Exportación de datos'),
        ('SUSPICIOUS_ACTIVITY', 'Actividad sospechosa'),
    ]

    SEVERITY_LEVELS = [
        ('LOW', 'Baja'),
        ('MEDIUM', 'Media'),
        ('HIGH', 'Alta'),
        ('CRITICAL', 'Crítica'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='security_events'
    )
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='security_events'
    )
    description = models.TextField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    details = models.JSONField(default=dict)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_security_events'
    )
    occurred_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'security_events'
        ordering = ['-occurred_at']
        indexes = [
            models.Index(fields=['organization', 'severity', 'occurred_at']),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.severity} at {self.occurred_at}"

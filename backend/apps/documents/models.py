"""Documents models."""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User, Organization
from apps.projects.models import Project
from apps.agile.models import UserStory, Task
from apps.standards.models import DocumentationStandard


class WorkspaceType(models.Model):
    """
    Tipo de Workspace - Define categorías personalizables de espacios de trabajo.
    Puede ser global (organization=null) o específico de una organización.
    """

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='workspace_types',
        null=True,
        blank=True,
        help_text="Organización propietaria. Si es null, el tipo es global/predeterminado."
    )
    key = models.CharField(
        max_length=50,
        help_text="Clave única del tipo (ej: TECHNICAL, CUSTOM_TYPE)"
    )
    label = models.CharField(
        max_length=200,
        help_text="Nombre visible del tipo (ej: Documentación Técnica)"
    )
    description = models.TextField(
        blank=True,
        help_text="Descripción del propósito y uso de este tipo de espacio"
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        default='Folder',
        help_text="Nombre del icono Material-UI"
    )
    color = models.CharField(
        max_length=7,
        default='#667eea',
        help_text="Color en formato hexadecimal"
    )
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(
        default=False,
        help_text="Los tipos de sistema no pueden ser eliminados"
    )
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_workspace_types'
    )

    class Meta:
        db_table = 'workspace_types'
        ordering = ['order', 'label']
        unique_together = ['organization', 'key']

    def __str__(self):
        if self.organization:
            return f"{self.label} ({self.organization.name})"
        return f"{self.label} (Global)"


class Workspace(models.Model):
    """
    Workspace model - Categorizes documents into different knowledge areas.

    Examples:
    - Documentación Técnica: API docs, architecture, technical specs
    - Procesos: SOPs, workflows, procedures
    - Guías: User guides, tutorials, how-tos
    - Base de Conocimiento: FAQs, troubleshooting, best practices
    """

    # Mantener TYPE_CHOICES para compatibilidad con datos antiguos (migration path)
    TYPE_CHOICES = [
        ('TECHNICAL', 'Documentación Técnica'),
        ('PROCESSES', 'Procesos'),
        ('GUIDES', 'Guías'),
        ('KNOWLEDGE_BASE', 'Base de Conocimiento'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='workspaces'
    )
    name = models.CharField(max_length=255)

    # Nuevo campo: relación con WorkspaceType
    workspace_type = models.ForeignKey(
        WorkspaceType,
        on_delete=models.PROTECT,
        related_name='workspaces',
        null=True,
        blank=True,
        help_text="Tipo de workspace (nueva implementación)"
    )

    # Campo legacy - mantener por compatibilidad durante migración
    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        null=True,
        blank=True,
        help_text="Tipo legacy - usar workspace_type en su lugar"
    )

    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Material-UI icon name
    color = models.CharField(max_length=20, blank=True)  # Hex color code
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_workspaces'
    )

    class Meta:
        db_table = 'workspaces'
        ordering = ['order', 'name']
        unique_together = ['organization', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Document(models.Model):
    """Main document model."""

    STATUS_CHOICES = [
        ('EN_REVISION', 'En revisión'),
        ('APROBADO', 'Aprobado'),
        ('RECHAZADO', 'Rechazado'),
    ]

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.PROTECT,
        related_name='documents',
        null=True,
        blank=True
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True
    )
    documentation_standard = models.ForeignKey(
        DocumentationStandard,
        on_delete=models.PROTECT,
        related_name='documents',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    content_html = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='EN_REVISION')
    version = models.CharField(max_length=20, default='1.0')
    user_story = models.ForeignKey(
        UserStory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents'
    )
    task = models.ForeignKey(
        Task,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents'
    )
    is_locked = models.BooleanField(default=False)
    locked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='locked_documents'
    )
    locked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_documents'
    )
    last_modified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='modified_documents'
    )
    # Soft delete / Papelera
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_documents'
    )

    class Meta:
        db_table = 'documents'
        ordering = ['-updated_at']

    def __str__(self):
        if self.project:
            return f"{self.project.code} - {self.title}"
        return self.title

    def increment_version(self):
        """Incrementa la versión del documento automáticamente."""
        try:
            # Parsear la versión actual (ej: "1.0" -> "1.001", "1.001" -> "1.002")
            parts = self.version.split('.')
            major = int(parts[0])
            minor = int(parts[1]) if len(parts) > 1 else 0

            # Incrementar minor
            minor += 1

            # Formatear como X.YYY (donde YYY es con padding de 3 dígitos)
            self.version = f"{major}.{minor:03d}"
        except (ValueError, IndexError):
            # Si hay algún error parseando, empezar desde 1.001
            self.version = "1.001"

        return self.version

    def create_version_snapshot(self, user=None, changes_description=''):
        """Crea un snapshot de la versión actual en DocumentVersion."""
        from .models import DocumentVersion

        DocumentVersion.objects.create(
            document=self,
            version_number=self.version,
            content=self.content,
            content_html=self.content_html,
            changes_description=changes_description,
            created_by=user
        )

    def soft_delete(self, user=None):
        """Marca el documento como eliminado (papelera)."""
        from django.utils import timezone

        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save()

    def restore(self):
        """Restaura un documento de la papelera."""
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save()


class DocumentVersion(models.Model):
    """Version history for documents."""

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    version_number = models.CharField(max_length=20)
    content = models.TextField()
    content_html = models.TextField(blank=True)
    changes_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        db_table = 'document_versions'
        ordering = ['-created_at']
        unique_together = ['document', 'version_number']

    def __str__(self):
        return f"{self.document.title} - v{self.version_number}"


class DocumentComment(models.Model):
    """Comments on documents."""

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    content = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        db_table = 'document_comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment on {self.document.title}"


class DocumentAttachment(models.Model):
    """File attachments for documents."""

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    file = models.FileField(upload_to='document_attachments/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    file_type = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        db_table = 'document_attachments'
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.file_name


class DocumentHistory(models.Model):
    """Audit trail for document changes."""

    ACTION_CHOICES = [
        ('CREATE', 'Creado'),
        ('EDIT', 'Editado'),
        ('VERSION', 'Nueva versión'),
        ('STATUS_CHANGE', 'Cambio de estado'),
        ('LOCK', 'Bloqueado'),
        ('UNLOCK', 'Desbloqueado'),
        ('DELETE', 'Eliminado'),
    ]

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='history'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField()
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    performed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_history'
        ordering = ['-performed_at']

    def __str__(self):
        return f"{self.document.title} - {self.action}"


class DocumentReference(models.Model):
    """References between documents and user stories/tasks."""

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='references'
    )
    user_story = models.ForeignKey(
        UserStory,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='document_references'
    )
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='document_references'
    )
    reference_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_references'

    def __str__(self):
        return f"{self.document.title} references"

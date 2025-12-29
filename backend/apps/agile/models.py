"""Agile models - Epics, User Stories, Tasks."""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User
from apps.projects.models import Project


class Epic(models.Model):
    """Epic - high-level business objective."""

    STATUS_CHOICES = [
        ('BACKLOG', 'Backlog'),
        ('PLANNED', 'Planificada'),
        ('IN_PROGRESS', 'En progreso'),
        ('COMPLETED', 'Completada'),
        ('CANCELLED', 'Cancelada'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Baja'),
        ('MEDIUM', 'Media'),
        ('HIGH', 'Alta'),
        ('CRITICAL', 'Crítica'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='epics'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='BACKLOG')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    business_value = models.TextField(blank=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='owned_epics'
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    order = models.IntegerField(default=0)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_epics'
    )

    class Meta:
        db_table = 'epics'
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.project.code} - {self.title}"


class UserStory(models.Model):
    """User Story - specific functionality from user perspective."""

    STATUS_CHOICES = [
        ('BACKLOG', 'Backlog'),
        ('TODO', 'Por hacer'),
        ('IN_PROGRESS', 'En progreso'),
        ('IN_REVIEW', 'En revisión'),
        ('TESTING', 'En pruebas'),
        ('DONE', 'Completada'),
        ('BLOCKED', 'Bloqueada'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Baja'),
        ('MEDIUM', 'Media'),
        ('HIGH', 'Alta'),
        ('CRITICAL', 'Crítica'),
    ]

    epic = models.ForeignKey(
        Epic,
        on_delete=models.CASCADE,
        related_name='user_stories'
    )
    story_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    as_a = models.CharField(max_length=255, help_text="Como [tipo de usuario]")
    i_want = models.TextField(help_text="Quiero [acción]")
    so_that = models.TextField(help_text="Para [beneficio]")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='BACKLOG')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    story_points = models.IntegerField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_stories'
    )
    order = models.IntegerField(default=0)
    is_archived = models.BooleanField(default=False)
    documentation_required = models.BooleanField(default=True)
    documentation_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_stories'
    )

    class Meta:
        db_table = 'user_stories'
        ordering = ['order', '-created_at']
        verbose_name = 'User Story'
        verbose_name_plural = 'User Stories'

    def __str__(self):
        return f"{self.story_id} - {self.title}"


class AcceptanceCriteria(models.Model):
    """Acceptance criteria for user stories."""

    user_story = models.ForeignKey(
        UserStory,
        on_delete=models.CASCADE,
        related_name='acceptance_criteria'
    )
    description = models.TextField()
    is_met = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'acceptance_criteria'
        ordering = ['order']
        verbose_name = 'Acceptance Criterion'
        verbose_name_plural = 'Acceptance Criteria'

    def __str__(self):
        return f"{self.user_story.story_id} - Criterion {self.order}"


class Task(models.Model):
    """Technical task for implementing a user story."""

    STATUS_CHOICES = [
        ('TODO', 'Por hacer'),
        ('IN_PROGRESS', 'En progreso'),
        ('IN_REVIEW', 'En revisión'),
        ('DONE', 'Completada'),
        ('BLOCKED', 'Bloqueada'),
    ]

    TASK_TYPE_CHOICES = [
        ('DEVELOPMENT', 'Desarrollo'),
        ('TESTING', 'Testing'),
        ('DOCUMENTATION', 'Documentación'),
        ('REVIEW', 'Revisión'),
        ('BUG', 'Bug'),
        ('REFACTOR', 'Refactorización'),
    ]

    user_story = models.ForeignKey(
        UserStory,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    task_type = models.CharField(max_length=20, choices=TASK_TYPE_CHOICES, default='DEVELOPMENT')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    order = models.IntegerField(default=0)
    is_documented = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tasks'
    )

    class Meta:
        db_table = 'tasks'
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.user_story.story_id} - {self.title}"


class Sprint(models.Model):
    """Sprint for agile development."""

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='sprints'
    )
    name = models.CharField(max_length=255)
    goal = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sprints'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.project.code} - {self.name}"


class SprintStory(models.Model):
    """Association between sprints and user stories."""

    sprint = models.ForeignKey(
        Sprint,
        on_delete=models.CASCADE,
        related_name='sprint_stories'
    )
    user_story = models.ForeignKey(
        UserStory,
        on_delete=models.CASCADE,
        related_name='sprint_assignments'
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sprint_stories'
        unique_together = ['sprint', 'user_story']

    def __str__(self):
        return f"{self.sprint.name} - {self.user_story.story_id}"

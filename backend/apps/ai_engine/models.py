"""AI Engine models."""
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User, Organization
from apps.standards.models import DocumentationStandard, DocumentationExample
from apps.documents.models import Document


class EmbeddedDocument(models.Model):
    """Stores embeddings of template documents for RAG."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='embedded_documents'
    )
    documentation_example = models.ForeignKey(
        DocumentationExample,
        on_delete=models.CASCADE,
        related_name='embeddings',
        null=True,
        blank=True
    )
    documentation_standard = models.ForeignKey(
        DocumentationStandard,
        on_delete=models.CASCADE,
        related_name='embeddings',
        null=True,
        blank=True
    )
    chunk_text = models.TextField()
    chunk_index = models.IntegerField()
    embedding_vector = models.JSONField()  # Store as JSON for simplicity, use pgvector in production
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'embedded_documents'
        ordering = ['chunk_index']
        indexes = [
            models.Index(fields=['organization', 'documentation_standard']),
        ]

    def __str__(self):
        if self.documentation_example:
            return f"{self.documentation_example.title} - Chunk {self.chunk_index}"
        return f"Embedding - Chunk {self.chunk_index}"


class AIGenerationLog(models.Model):
    """Logs all AI generation requests and responses."""

    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('IN_PROGRESS', 'En progreso'),
        ('SUCCESS', 'Exitoso'),
        ('FAILED', 'Fallido'),
    ]

    document = models.ForeignKey(
        Document,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_generations'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    documentation_standard = models.ForeignKey(
        DocumentationStandard,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    prompt = models.TextField()
    context = models.JSONField(default=dict)
    generated_content = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    error_message = models.TextField(blank=True)
    tokens_used = models.IntegerField(default=0)
    execution_time = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    model_used = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'ai_generation_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"AI Generation {self.id} - {self.status}"


class AIFeedback(models.Model):
    """User feedback on AI-generated content."""

    RATING_CHOICES = [
        (1, 'Muy malo'),
        (2, 'Malo'),
        (3, 'Regular'),
        (4, 'Bueno'),
        (5, 'Excelente'),
    ]

    generation_log = models.ForeignKey(
        AIGenerationLog,
        on_delete=models.CASCADE,
        related_name='feedback'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    rating = models.IntegerField(choices=RATING_CHOICES)
    comments = models.TextField(blank=True)
    was_useful = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_feedback'
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback {self.rating}/5 for Generation {self.generation_log.id}"


class AIPromptTemplate(models.Model):
    """Reusable prompt templates for AI generation."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='prompt_templates'
    )
    documentation_standard = models.ForeignKey(
        DocumentationStandard,
        on_delete=models.CASCADE,
        related_name='prompt_templates',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    prompt_template = models.TextField()
    variables = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        db_table = 'ai_prompt_templates'
        ordering = ['name']

    def __str__(self):
        if self.documentation_standard:
            return f"{self.name} - {self.documentation_standard.name}"
        return f"{self.name}"


class RAGConfiguration(models.Model):
    """Configuration for RAG (Retrieval-Augmented Generation) per organization."""

    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name='rag_config'
    )
    pinecone_index_name = models.CharField(max_length=255, blank=True)
    embedding_model = models.CharField(max_length=100, default='text-embedding-ada-002')
    llm_model = models.CharField(max_length=100, default='gpt-4')
    temperature = models.DecimalField(max_digits=3, decimal_places=2, default=0.7)
    max_tokens = models.IntegerField(default=2000)
    chunk_size = models.IntegerField(default=1000)
    chunk_overlap = models.IntegerField(default=200)
    top_k_results = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rag_configurations'

    def __str__(self):
        return f"RAG Config - {self.organization.name}"

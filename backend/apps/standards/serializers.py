"""Standards serializers - AI-powered documentation generation."""
from rest_framework import serializers
from .models import (
    DocumentationStandard,
    DocumentationExample,
    AIGenerationTest,
)


class DocumentationExampleSerializer(serializers.ModelSerializer):
    """Documentation example serializer."""
    standard_name = serializers.CharField(source='standard.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = DocumentationExample
        fields = [
            'id', 'standard', 'standard_name', 'title', 'input_prompt',
            'generated_content', 'diagram_code', 'diagram_image',
            'tags', 'complexity_level', 'order', 'is_featured', 'is_active',
            'created_at', 'updated_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']


class DocumentationStandardListSerializer(serializers.ModelSerializer):
    """Documentation standard list serializer - simplified for list views."""
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    examples_count = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = DocumentationStandard
        fields = [
            'id', 'name', 'category', 'category_display', 'description',
            'icon', 'color', 'requires_diagram', 'diagram_type',
            'examples_count', 'organization', 'organization_name',
            'is_active', 'created_at'
        ]
        read_only_fields = ['created_at', 'organization']

    def get_examples_count(self, obj):
        return obj.examples.filter(is_active=True).count()


class DocumentationStandardDetailSerializer(serializers.ModelSerializer):
    """Documentation standard detail serializer - includes examples."""
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    examples = DocumentationExampleSerializer(many=True, read_only=True)
    examples_count = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = DocumentationStandard
        fields = [
            'id', 'organization', 'organization_name', 'name', 'category',
            'category_display', 'description', 'icon', 'color',
            'ai_prompt_template', 'requires_diagram', 'diagram_type',
            'is_active', 'examples', 'examples_count',
            'created_at', 'updated_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'organization']

    def get_examples_count(self, obj):
        return obj.examples.filter(is_active=True).count()


class AIGenerationTestSerializer(serializers.ModelSerializer):
    """AI generation test serializer."""
    standard_name = serializers.CharField(source='standard.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AIGenerationTest
        fields = [
            'id', 'standard', 'standard_name', 'user_prompt',
            'generated_content', 'generated_diagram_code', 'generated_diagram_image',
            'status', 'status_display', 'ai_model_used', 'generation_time_seconds',
            'error_message', 'user_rating', 'user_feedback',
            'created_at', 'updated_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = [
            'generated_content', 'generated_diagram_code', 'generated_diagram_image',
            'status', 'ai_model_used', 'generation_time_seconds', 'error_message',
            'created_at', 'updated_at', 'created_by'
        ]


class GenerateDocumentationInputSerializer(serializers.Serializer):
    """Input serializer for generating documentation."""
    standard_id = serializers.IntegerField(required=True)
    user_prompt = serializers.CharField(required=True, max_length=5000)
    task_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_standard_id(self, value):
        if not DocumentationStandard.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Estándar no encontrado o inactivo")
        return value


class GenerateProjectDocumentationInputSerializer(serializers.Serializer):
    """Input serializer for generating project documentation."""
    project_id = serializers.IntegerField(required=True)

    def validate_project_id(self, value):
        from apps.projects.models import Project
        if not Project.objects.filter(id=value).exists():
            raise serializers.ValidationError("Proyecto no encontrado")
        return value

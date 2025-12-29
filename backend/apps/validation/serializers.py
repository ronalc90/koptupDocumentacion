"""Validation serializers."""
from rest_framework import serializers
from .models import ValidationRule, ValidationResult, QAReview, ValidationCheckpoint, DocumentIssue


class ValidationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationRule
        fields = '__all__'


class ValidationResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationResult
        fields = '__all__'


class QAReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    document_title = serializers.CharField(source='document.title', read_only=True)

    class Meta:
        model = QAReview
        fields = '__all__'


class ValidationCheckpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationCheckpoint
        fields = '__all__'


class DocumentIssueSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = DocumentIssue
        fields = '__all__'

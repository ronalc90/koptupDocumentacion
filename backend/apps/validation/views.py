"""Validation views."""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import ValidationRule, ValidationResult, QAReview, ValidationCheckpoint, DocumentIssue
from .serializers import (
    ValidationRuleSerializer, ValidationResultSerializer,
    QAReviewSerializer, ValidationCheckpointSerializer, DocumentIssueSerializer
)


class ValidationRuleViewSet(viewsets.ModelViewSet):
    queryset = ValidationRule.objects.all()
    serializer_class = ValidationRuleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['standard_rule', 'rule_type', 'severity', 'is_active']


class ValidationResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ValidationResult.objects.all()
    serializer_class = ValidationResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document', 'validation_rule', 'status']


class QAReviewViewSet(viewsets.ModelViewSet):
    queryset = QAReview.objects.all()
    serializer_class = QAReviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document', 'reviewer', 'status', 'is_blocking']


class ValidationCheckpointViewSet(viewsets.ModelViewSet):
    queryset = ValidationCheckpoint.objects.all()
    serializer_class = ValidationCheckpointSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document', 'is_passed']


class DocumentIssueViewSet(viewsets.ModelViewSet):
    queryset = DocumentIssue.objects.all()
    serializer_class = DocumentIssueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document', 'qa_review', 'severity', 'status', 'assigned_to']

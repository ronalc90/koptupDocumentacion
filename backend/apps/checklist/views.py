"""Checklist views."""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import DeliveryChecklist, ChecklistItem, BlockingIssue, DeliveryCertificate, ChecklistTemplate
from .serializers import (
    DeliveryChecklistSerializer, ChecklistItemSerializer, BlockingIssueSerializer,
    DeliveryCertificateSerializer, ChecklistTemplateSerializer
)


class DeliveryChecklistViewSet(viewsets.ModelViewSet):
    queryset = DeliveryChecklist.objects.all()
    serializer_class = DeliveryChecklistSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'status', 'is_certified']


class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.all()
    serializer_class = ChecklistItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['checklist', 'item_type', 'status', 'is_mandatory']


class BlockingIssueViewSet(viewsets.ModelViewSet):
    queryset = BlockingIssue.objects.all()
    serializer_class = BlockingIssueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['checklist', 'severity', 'status', 'assigned_to']


class DeliveryCertificateViewSet(viewsets.ModelViewSet):
    queryset = DeliveryCertificate.objects.all()
    serializer_class = DeliveryCertificateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['checklist', 'is_final']


class ChecklistTemplateViewSet(viewsets.ModelViewSet):
    queryset = ChecklistTemplate.objects.all()
    serializer_class = ChecklistTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'project_type']

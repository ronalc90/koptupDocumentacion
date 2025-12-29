"""Checklist serializers."""
from rest_framework import serializers
from .models import DeliveryChecklist, ChecklistItem, BlockingIssue, DeliveryCertificate, ChecklistTemplate


class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = '__all__'


class BlockingIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockingIssue
        fields = '__all__'


class DeliveryChecklistSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.code', read_only=True)
    items = ChecklistItemSerializer(many=True, read_only=True)
    blocking_issues = BlockingIssueSerializer(many=True, read_only=True)

    class Meta:
        model = DeliveryChecklist
        fields = '__all__'


class DeliveryCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryCertificate
        fields = '__all__'


class ChecklistTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistTemplate
        fields = '__all__'

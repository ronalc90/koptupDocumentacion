"""AI Engine serializers."""
from rest_framework import serializers
from .models import EmbeddedDocument, AIGenerationLog, AIFeedback, AIPromptTemplate, RAGConfiguration


class AIGenerationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIGenerationLog
        fields = '__all__'


class AIFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIFeedback
        fields = '__all__'


class AIPromptTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIPromptTemplate
        fields = '__all__'


class RAGConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RAGConfiguration
        fields = '__all__'

"""AI Engine views."""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AIGenerationLog, AIFeedback, AIPromptTemplate, RAGConfiguration
from .serializers import (
    AIGenerationLogSerializer, AIFeedbackSerializer,
    AIPromptTemplateSerializer, RAGConfigurationSerializer
)


class AIGenerationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AIGenerationLog.objects.all()
    serializer_class = AIGenerationLogSerializer
    permission_classes = [IsAuthenticated]


class AIFeedbackViewSet(viewsets.ModelViewSet):
    queryset = AIFeedback.objects.all()
    serializer_class = AIFeedbackSerializer
    permission_classes = [IsAuthenticated]


class AIPromptTemplateViewSet(viewsets.ModelViewSet):
    queryset = AIPromptTemplate.objects.all()
    serializer_class = AIPromptTemplateSerializer
    permission_classes = [IsAuthenticated]


class RAGConfigurationViewSet(viewsets.ModelViewSet):
    queryset = RAGConfiguration.objects.all()
    serializer_class = RAGConfigurationSerializer
    permission_classes = [IsAuthenticated]

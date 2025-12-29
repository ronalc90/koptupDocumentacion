"""AI Engine URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AIGenerationLogViewSet, AIFeedbackViewSet,
    AIPromptTemplateViewSet, RAGConfigurationViewSet
)

router = DefaultRouter()
router.register(r'generation-logs', AIGenerationLogViewSet, basename='generation-log')
router.register(r'feedback', AIFeedbackViewSet, basename='feedback')
router.register(r'prompt-templates', AIPromptTemplateViewSet, basename='prompt-template')
router.register(r'rag-configs', RAGConfigurationViewSet, basename='rag-config')

urlpatterns = [
    path('', include(router.urls)),
]

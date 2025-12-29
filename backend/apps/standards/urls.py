"""Standards URLs - AI-powered documentation generation system."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentationStandardViewSet,
    DocumentationExampleViewSet,
    AIGenerationTestViewSet,
    DocumentationGenerationView,
    ProjectDocumentationGenerationView,
    DiagramGenerationView,
)

router = DefaultRouter()
router.register(r'standards', DocumentationStandardViewSet, basename='documentation-standard')
router.register(r'examples', DocumentationExampleViewSet, basename='documentation-example')
router.register(r'ai-tests', AIGenerationTestViewSet, basename='ai-generation-test')

urlpatterns = [
    path('', include(router.urls)),
    path('generate/', DocumentationGenerationView.as_view(), name='generate-documentation'),
    path('generate-project/', ProjectDocumentationGenerationView.as_view(), name='generate-project-documentation'),
    path('generate-diagram/', DiagramGenerationView.as_view(), name='generate-diagram'),
]

"""Documents URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkspaceTypeViewSet, WorkspaceViewSet, DocumentViewSet, DocumentVersionViewSet, DocumentCommentViewSet,
    DocumentAttachmentViewSet, DocumentHistoryViewSet, DocumentReferenceViewSet
)

router = DefaultRouter()
router.register(r'workspace-types', WorkspaceTypeViewSet, basename='workspace-type')
router.register(r'workspaces', WorkspaceViewSet, basename='workspace')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'versions', DocumentVersionViewSet, basename='version')
router.register(r'comments', DocumentCommentViewSet, basename='comment')
router.register(r'attachments', DocumentAttachmentViewSet, basename='attachment')
router.register(r'history', DocumentHistoryViewSet, basename='history')
router.register(r'references', DocumentReferenceViewSet, basename='reference')

urlpatterns = [
    path('', include(router.urls)),
]

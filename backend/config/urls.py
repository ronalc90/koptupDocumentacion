"""URL Configuration."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Documentation Platform API",
        default_version='v1',
        description="API for Corporate Documentation Management Platform",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@docplatform.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # API endpoints
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/standards/', include('apps.standards.urls')),
    path('api/v1/projects/', include('apps.projects.urls')),
    path('api/v1/agile/', include('apps.agile.urls')),
    path('api/v1/documents/', include('apps.documents.urls')),
    path('api/v1/ai/', include('apps.ai_engine.urls')),
    path('api/v1/validation/', include('apps.validation.urls')),
    path('api/v1/checklist/', include('apps.checklist.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

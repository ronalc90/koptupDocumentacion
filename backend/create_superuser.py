#!/usr/bin/env python
"""Create superuser script."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User, Organization

# Create organization
org, _ = Organization.objects.get_or_create(
    slug='test-org',
    defaults={
        'name': 'Test Organization',
        'description': 'Organization for testing',
        'subscription_plan': 'PROFESSIONAL',
        'max_users': 100,
        'max_projects': 50,
        'max_storage_gb': 500
    }
)

# Create superuser
if not User.objects.filter(email='admin@test.com').exists():
    user = User.objects.create_superuser(
        email='admin@test.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        organization=org
    )
    print(f'Superuser created: {user.email}')
else:
    print('Superuser already exists')

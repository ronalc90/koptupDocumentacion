# Generated migration for Workspace model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('documents', '0003_document_deleted_at_document_deleted_by_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Workspace',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('type', models.CharField(choices=[('TECHNICAL', 'Documentación Técnica'), ('PROCESSES', 'Procesos'), ('GUIDES', 'Guías'), ('KNOWLEDGE_BASE', 'Base de Conocimiento')], max_length=50)),
                ('description', models.TextField(blank=True)),
                ('icon', models.CharField(blank=True, max_length=50)),
                ('color', models.CharField(blank=True, max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_workspaces', to=settings.AUTH_USER_MODEL)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workspaces', to='users.organization')),
            ],
            options={
                'db_table': 'workspaces',
                'ordering': ['order', 'name'],
            },
        ),
        migrations.AddField(
            model_name='document',
            name='workspace',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='documents', to='documents.workspace'),
        ),
        migrations.AlterUniqueTogether(
            name='workspace',
            unique_together={('organization', 'name')},
        ),
    ]

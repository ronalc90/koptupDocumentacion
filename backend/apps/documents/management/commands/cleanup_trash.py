"""
Management command to clean up trashed documents older than 30 days.

Usage:
    python manage.py cleanup_trash

This command should be run periodically (e.g., daily via cron job)
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.documents.models import Document


class Command(BaseCommand):
    help = 'Elimina permanentemente documentos en la papelera por más de 30 días'

    def handle(self, *args, **options):
        # Calcular fecha límite (30 días atrás)
        thirty_days_ago = timezone.now() - timedelta(days=30)

        # Buscar documentos eliminados hace más de 30 días
        old_trashed_docs = Document.objects.filter(
            is_deleted=True,
            deleted_at__lt=thirty_days_ago
        )

        count = old_trashed_docs.count()

        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('No hay documentos para eliminar en la papelera.')
            )
            return

        # Mostrar documentos que serán eliminados
        self.stdout.write(f'\nSe eliminarán {count} documento(s):')
        for doc in old_trashed_docs:
            self.stdout.write(
                f'  - ID: {doc.id}, Título: {doc.title}, '
                f'Eliminado el: {doc.deleted_at.strftime("%Y-%m-%d %H:%M")}'
            )

        # Eliminar permanentemente
        old_trashed_docs.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ {count} documento(s) eliminado(s) permanentemente.'
            )
        )

"""Script para crear los tipos de workspace globales por defecto."""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.documents.models import WorkspaceType

# Tipos globales por defecto
DEFAULT_TYPES = [
    {
        'key': 'TECHNICAL',
        'label': 'Documentación Técnica',
        'description': 'Espacio dedicado a documentación técnica, arquitectura de software, APIs, bases de datos y especificaciones del sistema.',
        'icon': 'Code',
        'color': '#2196F3',
        'is_system': True,
        'order': 1,
    },
    {
        'key': 'PROCESSES',
        'label': 'Procesos',
        'description': 'Organiza procesos de negocio, flujos de trabajo, procedimientos operativos y metodologías organizacionales.',
        'icon': 'AccountTree',
        'color': '#4CAF50',
        'is_system': True,
        'order': 2,
    },
    {
        'key': 'GUIDES',
        'label': 'Guías',
        'description': 'Manuales de usuario, tutoriales, guías de implementación y documentación de ayuda para usuarios finales.',
        'icon': 'MenuBook',
        'color': '#FF9800',
        'is_system': True,
        'order': 3,
    },
    {
        'key': 'KNOWLEDGE_BASE',
        'label': 'Base de Conocimiento',
        'description': 'Centro de recursos compartidos, mejores prácticas, lecciones aprendidas y documentación colaborativa del equipo.',
        'icon': 'Lightbulb',
        'color': '#9C27B0',
        'is_system': True,
        'order': 4,
    },
]

def create_default_types():
    """Crea los tipos globales por defecto si no existen."""
    created_count = 0
    updated_count = 0

    for type_data in DEFAULT_TYPES:
        key = type_data['key']

        # Buscar si ya existe un tipo global con esta clave
        existing_type = WorkspaceType.objects.filter(
            key=key,
            organization__isnull=True
        ).first()

        if existing_type:
            # Actualizar el tipo existente
            for field, value in type_data.items():
                setattr(existing_type, field, value)
            existing_type.save()
            updated_count += 1
            print(f"✓ Actualizado: {type_data['label']}")
        else:
            # Crear nuevo tipo
            WorkspaceType.objects.create(
                organization=None,  # Tipo global
                **type_data
            )
            created_count += 1
            print(f"✓ Creado: {type_data['label']}")

    print(f"\n✅ Resumen:")
    print(f"   - Tipos creados: {created_count}")
    print(f"   - Tipos actualizados: {updated_count}")
    print(f"   - Total de tipos globales: {WorkspaceType.objects.filter(organization__isnull=True).count()}")

if __name__ == '__main__':
    print("🚀 Creando tipos de workspace globales por defecto...\n")
    create_default_types()

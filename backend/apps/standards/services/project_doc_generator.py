"""
Servicio para generar documentación automática de proyectos completos.

Este servicio toma un proyecto con todas sus tareas y genera documentación
comprensiva usando IA, incluyendo casos de uso, diagramas, arquitectura, etc.
"""

import time
from typing import Dict, List
from apps.projects.models import Project
from apps.agile.models import Task
from apps.standards.models import DocumentationStandard
from .ai_generator import AIDocumentationGenerator


class ProjectDocumentationGenerator:
    """
    Genera documentación completa para un proyecto basándose en sus tareas.

    Flujo:
    1. Recibe un proyecto
    2. Analiza todas las tareas del proyecto
    3. Genera documentación por cada estándar aplicable (casos de uso, arquitectura, etc.)
    4. Retorna documentación completa y organizada
    """

    def __init__(self):
        self.ai_generator = AIDocumentationGenerator()

    def generate_project_documentation(self, project: Project) -> Dict:
        """
        Genera documentación completa del proyecto.

        Args:
            project: Instancia de Project

        Returns:
            Dict con documentación generada por categoría
        """
        start_time = time.time()

        # Obtener todas las tareas del proyecto
        tasks = project.tasks.all()

        if not tasks.exists():
            return {
                'success': False,
                'error': 'El proyecto no tiene tareas para documentar'
            }

        # Preparar contexto del proyecto
        project_context = self._build_project_context(project, tasks)

        # Obtener estándares disponibles
        standards = DocumentationStandard.objects.filter(
            organization=project.organization,
            is_active=True
        ).order_by('category')

        # Generar documentación por cada estándar
        documentation_by_standard = {}

        for standard in standards:
            try:
                # Construir prompt específico para el estándar
                prompt = self._build_standard_prompt(
                    project_context,
                    standard,
                    tasks
                )

                # Generar con IA
                result = self.ai_generator.generate(
                    standard=standard,
                    user_prompt=prompt
                )

                documentation_by_standard[standard.category] = {
                    'standard_name': standard.name,
                    'standard_id': standard.id,
                    'content': result['content'],
                    'diagram_code': result.get('diagram_code', ''),
                    'model_used': result.get('model_used'),
                }
            except Exception as e:
                print(f"Error generating {standard.name}: {str(e)}")
                documentation_by_standard[standard.category] = {
                    'standard_name': standard.name,
                    'error': str(e)
                }

        generation_time = time.time() - start_time

        return {
            'success': True,
            'project_id': project.id,
            'project_name': project.name,
            'documentation': documentation_by_standard,
            'generation_time': generation_time,
            'tasks_count': tasks.count(),
        }

    def _build_project_context(self, project: Project, tasks) -> Dict:
        """Construye el contexto del proyecto con toda la información relevante."""
        return {
            'name': project.name,
            'description': project.description or '',
            'status': project.status,
            'sprint': project.sprint.name if project.sprint else 'No asignado',
            'tasks_count': tasks.count(),
            'tasks_by_status': {
                'pending': tasks.filter(status='PENDING').count(),
                'in_progress': tasks.filter(status='IN_PROGRESS').count(),
                'completed': tasks.filter(status='COMPLETED').count(),
            },
            'tasks_summary': [
                {
                    'id': task.id,
                    'title': task.title,
                    'description': task.description or '',
                    'status': task.status,
                    'priority': task.priority,
                    'assignee': task.assigned_to.get_full_name() if task.assigned_to else 'Sin asignar',
                }
                for task in tasks[:20]  # Limitar a primeras 20 tareas
            ]
        }

    def _build_standard_prompt(
        self,
        project_context: Dict,
        standard: DocumentationStandard,
        tasks
    ) -> str:
        """Construye un prompt específico para cada tipo de estándar."""

        base_info = f"""
Proyecto: {project_context['name']}
Descripción: {project_context['description']}
Estado: {project_context['status']}
Total de tareas: {project_context['tasks_count']}

Resumen de tareas:
"""

        # Agregar las tareas principales
        for task in project_context['tasks_summary']:
            base_info += f"\n- [{task['status']}] {task['title']}"
            if task['description']:
                base_info += f": {task['description'][:100]}"

        # Personalizar según el tipo de estándar
        category = standard.category

        if category == 'USE_CASE':
            return f"""{base_info}

Genera casos de uso detallados para este proyecto, incluyendo todos los actores, flujos principales y alternativos basándote en las tareas listadas."""

        elif category == 'UML_DIAGRAM':
            return f"""{base_info}

Genera diagramas UML (clases, secuencia, etc.) que representen la arquitectura y flujos del sistema basándote en las tareas."""

        elif category == 'API_REST':
            return f"""{base_info}

Documenta las APIs REST necesarias para este proyecto, incluyendo endpoints, métodos HTTP, parámetros y respuestas."""

        elif category == 'ARCHITECTURE':
            return f"""{base_info}

Describe la arquitectura del sistema, componentes principales, tecnologías, patrones de diseño y flujo de datos."""

        elif category == 'DATABASE':
            return f"""{base_info}

Diseña el modelo de base de datos necesario, incluyendo tablas, relaciones, índices y consideraciones de performance."""

        elif category == 'TEST_PLAN':
            return f"""{base_info}

Crea un plan de pruebas completo con casos de prueba unitarios, de integración y end-to-end."""

        elif category == 'DEPLOYMENT':
            return f"""{base_info}

Documenta el proceso de despliegue, infraestructura, configuraciones y pasos de deployment."""

        else:
            return f"""{base_info}

Genera documentación técnica completa para este proyecto según el estándar {standard.name}."""


def generate_project_documentation(project_id: int) -> Dict:
    """
    Helper function para generar documentación de proyecto.

    Usage:
        from apps.standards.services import generate_project_documentation

        result = generate_project_documentation(project_id=123)
        print(result['documentation'])
    """
    from apps.projects.models import Project

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return {
            'success': False,
            'error': f'Proyecto con ID {project_id} no encontrado'
        }

    generator = ProjectDocumentationGenerator()
    return generator.generate_project_documentation(project)

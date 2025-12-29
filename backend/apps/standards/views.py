"""Standards views - AI-powered documentation generation."""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import (
    DocumentationStandard,
    DocumentationExample,
    AIGenerationTest,
)
from .serializers import (
    DocumentationStandardListSerializer,
    DocumentationStandardDetailSerializer,
    DocumentationExampleSerializer,
    AIGenerationTestSerializer,
    GenerateDocumentationInputSerializer,
    GenerateProjectDocumentationInputSerializer,
)
from .services import AIDocumentationGenerator, ProjectDocumentationGenerator


class DocumentationStandardViewSet(viewsets.ModelViewSet):
    """
    ViewSet para estándares de documentación.

    Endpoints:
    - GET /api/v1/standards/ - Lista de estándares
    - GET /api/v1/standards/{id}/ - Detalle con ejemplos
    - POST /api/v1/standards/ - Crear estándar
    - PUT/PATCH /api/v1/standards/{id}/ - Actualizar
    - DELETE /api/v1/standards/{id}/ - Eliminar
    """
    queryset = DocumentationStandard.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'requires_diagram', 'diagram_type', 'is_active', 'organization']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'category', 'created_at']
    ordering = ['category', 'name']

    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentationStandardListSerializer
        return DocumentationStandardDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filtrar por organización del usuario
        if self.request.user.organization:
            queryset = queryset.filter(organization=self.request.user.organization)
        return queryset

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            organization=self.request.user.organization
        )


class DocumentationExampleViewSet(viewsets.ModelViewSet):
    """
    ViewSet para ejemplos de documentación.

    Endpoints:
    - GET /api/v1/examples/ - Lista de ejemplos
    - GET /api/v1/examples/{id}/ - Detalle
    - GET /api/v1/examples/?standard={id} - Ejemplos de un estándar
    - POST /api/v1/examples/ - Crear ejemplo
    """
    queryset = DocumentationExample.objects.all()
    serializer_class = DocumentationExampleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['standard', 'complexity_level', 'is_featured', 'is_active']
    search_fields = ['title', 'input_prompt', 'generated_content', 'tags']
    ordering_fields = ['order', 'title', 'created_at']
    ordering = ['standard', 'order', '-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filtrar por organización del usuario (a través del estándar)
        if self.request.user.organization:
            queryset = queryset.filter(
                standard__organization=self.request.user.organization
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AIGenerationTestViewSet(viewsets.ModelViewSet):
    """
    ViewSet para pruebas de generación con IA.

    Endpoints:
    - GET /api/v1/ai-tests/ - Lista de pruebas
    - GET /api/v1/ai-tests/{id}/ - Detalle
    - POST /api/v1/ai-tests/ - Crear nueva prueba (genera automáticamente)
    - PATCH /api/v1/ai-tests/{id}/ - Actualizar (ej: rating, feedback)
    """
    queryset = AIGenerationTest.objects.all()
    serializer_class = AIGenerationTestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['standard', 'status', 'user_rating']
    search_fields = ['user_prompt', 'generated_content']
    ordering_fields = ['created_at', 'generation_time_seconds', 'user_rating']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filtrar por organización del usuario
        if self.request.user.organization:
            queryset = queryset.filter(
                standard__organization=self.request.user.organization
            )
        return queryset

    def perform_create(self, serializer):
        """
        Al crear una prueba, genera automáticamente la documentación.
        """
        # Guardar el test como PENDING
        test = serializer.save(
            created_by=self.request.user,
            status='PENDING'
        )

        # Generar la documentación
        try:
            test.status = 'PROCESSING'
            test.save()

            # Usar el servicio de generación
            generator = AIDocumentationGenerator()
            result = generator.generate(
                standard=test.standard,
                user_prompt=test.user_prompt
            )

            # Actualizar el test con los resultados
            test.generated_content = result['content']
            test.generated_diagram_code = result.get('diagram_code', '')
            test.ai_model_used = result['model_used']
            test.generation_time_seconds = result['generation_time']
            test.status = 'COMPLETED'
            test.save()

        except Exception as e:
            test.status = 'FAILED'
            test.error_message = str(e)
            test.save()


class DocumentationGenerationView(APIView):
    """
    API View para generación de documentación.

    Endpoint principal:
    - POST /api/v1/standards/generate/

    Input:
    {
        "standard_id": 1,
        "user_prompt": "Sistema de login con email",
        "task_id": 123  // Opcional, si se genera desde una task
    }

    Output:
    {
        "content": "# Documentación generada...",
        "diagram_code": "graph TD...",
        "model_used": "gpt-4",
        "generation_time": 3.5
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Genera documentación basándose en un estándar y prompt del usuario.
        """
        # Validar input
        serializer = GenerateDocumentationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        standard_id = serializer.validated_data['standard_id']
        user_prompt = serializer.validated_data['user_prompt']
        task_id = serializer.validated_data.get('task_id')

        try:
            # Obtener el estándar
            standard = DocumentationStandard.objects.get(
                id=standard_id,
                organization=request.user.organization,
                is_active=True
            )

            # Generar la documentación
            generator = AIDocumentationGenerator()
            result = generator.generate(
                standard=standard,
                user_prompt=user_prompt
            )

            # Si se proporcionó task_id, asociar el documento generado
            if task_id:
                # TODO: Crear el documento y asociarlo a la task
                # from apps.documents.models import Document
                # Document.objects.create(...)
                pass

            return Response({
                'success': True,
                'data': result
            }, status=status.HTTP_200_OK)

        except DocumentationStandard.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Estándar no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ProjectDocumentationGenerationView(APIView):
    """
    API View para generación de documentación de proyecto completo.

    Endpoint:
    - POST /api/v1/standards/generate-project/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Genera documentación completa de un proyecto con todas sus tareas.
        """
        # Validar input
        serializer = GenerateProjectDocumentationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project_id = serializer.validated_data['project_id']

        try:
            from apps.projects.models import Project

            # Obtener el proyecto
            project = Project.objects.get(id=project_id)

            # Verificar permisos (el usuario debe pertenecer a la misma organización)
            if project.organization != request.user.organization:
                return Response({
                    'success': False,
                    'error': 'No tienes permisos para documentar este proyecto'
                }, status=status.HTTP_403_FORBIDDEN)

            # Generar la documentación
            generator = ProjectDocumentationGenerator()
            result = generator.generate_project_documentation(project)

            if not result.get('success'):
                return Response(result, status=status.HTTP_400_BAD_REQUEST)

            return Response(result, status=status.HTTP_200_OK)

        except Project.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Proyecto no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DiagramGenerationView(APIView):
    """
    API View para generación de diagramas Mermaid desde texto.

    Endpoint:
    - POST /api/v1/standards/generate-diagram/

    Input:
    {
        "text": "El usuario se autentica, luego accede al dashboard...",
        "diagram_type": "flowchart"  // flowchart, sequence, architecture, entity
    }

    Output:
    {
        "success": true,
        "diagram_code": "graph TD\n    A[Usuario] --> B[Login]...",
        "diagram_type": "mermaid"
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Genera un diagrama Mermaid basándose en texto descriptivo.
        """
        text = request.data.get('text', '')
        diagram_type = request.data.get('diagram_type', 'flowchart')

        if not text:
            return Response({
                'success': False,
                'error': 'El campo "text" es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Generar el diagrama usando IA
            from .services.ai_generator import AIDocumentationGenerator
            import os

            api_key = os.getenv('OPENAI_API_KEY')

            # Construir prompt específico para generar diagrama
            prompt = self._build_diagram_prompt(text, diagram_type)

            if api_key:
                try:
                    from openai import OpenAI
                    client = OpenAI(api_key=api_key)

                    response = client.chat.completions.create(
                        model="gpt-4",
                        messages=[
                            {"role": "system", "content": "Eres un experto en crear diagramas Mermaid. Generas código Mermaid válido y bien estructurado basándote en descripciones de texto."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.7,
                        max_tokens=1000
                    )

                    diagram_code = response.choices[0].message.content

                    # Limpiar el código si viene con bloques de código markdown
                    import re
                    match = re.search(r'```(?:mermaid)?\n?(.*?)\n?```', diagram_code, re.DOTALL)
                    if match:
                        diagram_code = match.group(1).strip()

                except Exception as e:
                    print(f"Error usando OpenAI: {e}")
                    diagram_code = self._generate_mock_diagram(text, diagram_type)
            else:
                diagram_code = self._generate_mock_diagram(text, diagram_type)

            return Response({
                'success': True,
                'diagram_code': diagram_code,
                'diagram_type': 'mermaid'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _build_diagram_prompt(self, text: str, diagram_type: str) -> str:
        """Construye el prompt para generar el diagrama."""
        type_instructions = {
            'flowchart': 'Crea un diagrama de flujo (flowchart) usando sintaxis "graph TD" que represente el proceso descrito.',
            'sequence': 'Crea un diagrama de secuencia usando sintaxis "sequenceDiagram" que muestre las interacciones entre los actores.',
            'architecture': 'Crea un diagrama de arquitectura usando sintaxis "graph LR" que muestre los componentes del sistema.',
            'entity': 'Crea un diagrama de entidad-relación usando sintaxis "erDiagram" que muestre el modelo de datos.',
        }

        instruction = type_instructions.get(diagram_type, type_instructions['flowchart'])

        return f"""{instruction}

Texto a diagramar:
"{text}"

INSTRUCCIONES:
- Genera SOLO el código Mermaid, sin explicaciones adicionales
- Usa nombres descriptivos para los nodos
- Incluye decisiones, flujos alternativos si son relevantes
- El diagrama debe ser claro y fácil de entender
- NO incluyas bloques de código markdown (```), solo el código Mermaid directo

Ejemplo de salida esperada:
graph TD
    A[Inicio] --> B[Proceso]
    B --> C{{Decisión?}}
    C -->|Sí| D[Acción 1]
    C -->|No| E[Acción 2]
    D --> F[Fin]
    E --> F

Genera el diagrama:"""

    def _generate_mock_diagram(self, text: str, diagram_type: str) -> str:
        """Genera un diagrama mock cuando no hay API key."""
        # Intentar extraer conceptos clave del texto para un diagrama más relevante
        words = text.lower().split()

        if diagram_type == 'sequence':
            return """sequenceDiagram
    participant Usuario
    participant Sistema
    participant BaseDatos
    Usuario->>Sistema: Solicitud
    Sistema->>BaseDatos: Consulta
    BaseDatos-->>Sistema: Datos
    Sistema-->>Usuario: Respuesta"""

        elif diagram_type == 'architecture':
            return """graph LR
    A[Cliente] --> B[API Gateway]
    B --> C[Servicio 1]
    B --> D[Servicio 2]
    C --> E[(Base de Datos)]
    D --> E"""

        elif diagram_type == 'entity':
            return """erDiagram
    USUARIO ||--o{ PEDIDO : realiza
    PEDIDO ||--|{ ITEM : contiene
    PRODUCTO ||--o{ ITEM : referencia"""

        else:  # flowchart por defecto
            return """graph TD
    A[Inicio] --> B[Proceso]
    B --> C{Decisión}
    C -->|Opción 1| D[Resultado A]
    C -->|Opción 2| E[Resultado B]
    D --> F[Fin]
    E --> F"""


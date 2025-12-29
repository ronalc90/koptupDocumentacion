"""
AI Documentation Generator Service

Este servicio genera documentación automáticamente usando IA,
basándose en ejemplos proporcionados en los estándares.
"""

import time
import os
from typing import Dict, List, Optional
from django.conf import settings


class AIDocumentationGenerator:
    """
    Genera documentación usando IA basándose en ejemplos.

    Flujo:
    1. Recibe un estándar y un prompt del usuario
    2. Obtiene ejemplos relevantes del estándar
    3. Construye un prompt completo con few-shot learning
    4. Llama a la API de IA (OpenAI, Claude, etc.)
    5. Retorna el documento generado
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4"):
        """
        Inicializa el generador.

        Args:
            api_key: API key para el servicio de IA (OpenAI, Anthropic, etc.)
            model: Modelo a usar (gpt-4, claude-3-opus, etc.)
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self.model = model
        self.max_examples = 5  # Máximo de ejemplos a incluir en el prompt

    def generate(
        self,
        standard,
        user_prompt: str,
        examples: Optional[List] = None
    ) -> Dict:
        """
        Genera documentación basándose en un estándar y prompt del usuario.

        Args:
            standard: Instancia de DocumentationStandard
            user_prompt: Texto del usuario describiendo lo que necesita
            examples: Lista opcional de ejemplos (si no se provee, se obtienen del standard)

        Returns:
            Dict con:
                - content: Contenido generado
                - diagram_code: Código del diagrama (si aplica)
                - model_used: Modelo de IA usado
                - generation_time: Tiempo de generación en segundos
        """
        start_time = time.time()

        # Obtener ejemplos si no se proporcionaron
        if examples is None:
            examples = list(
                standard.examples.filter(is_active=True)
                .order_by('-is_featured', 'order')[:self.max_examples]
            )

        # Construir el prompt completo
        full_prompt = self._build_prompt(standard, user_prompt, examples)

        # Generar con IA
        result = self._call_ai_api(full_prompt, standard)

        generation_time = time.time() - start_time

        return {
            'content': result.get('content', ''),
            'diagram_code': result.get('diagram_code', ''),
            'model_used': self.model,
            'generation_time': generation_time
        }

    def _build_prompt(self, standard, user_prompt: str, examples: List) -> str:
        """
        Construye el prompt completo usando few-shot learning.

        El prompt incluye:
        1. Descripción del estándar
        2. Ejemplos de Input → Output
        3. El nuevo input del usuario
        """
        # Comenzar con el template del estándar o uno por defecto
        base_template = standard.ai_prompt_template or self._get_default_template()

        # Construir sección de ejemplos
        examples_section = self._build_examples_section(examples)

        # Construir instrucciones para diagrama
        diagram_instruction = ""
        if standard.requires_diagram:
            diagram_type_examples = {
                'MERMAID': '''
EJEMPLO DE DIAGRAMA MERMAID:
```mermaid
graph TD
    A[Usuario] --> B[Autenticación]
    B --> C{Credenciales OK?}
    C -->|Sí| D[Dashboard]
    C -->|No| E[Error]
```''',
            }

            example_diagram = diagram_type_examples.get(standard.diagram_type, '')

            diagram_instruction = f"""
## ⚠️ CRÍTICO - DIAGRAMA OBLIGATORIO ⚠️

Este tipo de documentación REQUIERE OBLIGATORIAMENTE un diagrama {standard.diagram_type}.

{example_diagram}

INSTRUCCIONES PARA EL DIAGRAMA (OBLIGATORIAS):
1. DEBES crear un diagrama técnico relevante al tema
2. El diagrama DEBE estar en un bloque de código markdown
3. USA EXACTAMENTE este formato: ```mermaid
4. Coloca el diagrama AL FINAL del documento
5. El diagrama debe ser detallado con al menos 5 nodos
6. DEBES incluir una sección "## Diagrama" antes del código

FORMATO OBLIGATORIO (NO OMITIR):
... tu contenido aquí ...

## Diagrama

```mermaid
graph TD
    A[Nodo 1] --> B[Nodo 2]
    B --> C{{Decisión}}
    C -->|Opción 1| D[Resultado 1]
    C -->|Opción 2| E[Resultado 2]
```

⚠️ IMPORTANTE: Si no incluyes el diagrama, la respuesta será rechazada.
"""

        # Construir el prompt completo
        prompt = f"""Eres un experto en documentación técnica de software empresarial, similar a Microsoft Docs.

# Estándar: {standard.name}
{standard.description}

{examples_section}

# Tu Tarea

Genera NUEVA documentación COMPLETA Y PROFESIONAL para:

"{user_prompt}"

INSTRUCCIONES CRÍTICAS:
- Crea documentación de NIVEL EMPRESARIAL (similar a Microsoft, Amazon AWS, Google Cloud docs)
- USA formato Markdown con estructura jerárquica clara (##, ###, ####)
- INCLUYE bloques de información destacados:
  * 💡 **Sugerencia**: Para tips útiles
  * ⚠️ **Advertencia**: Para cosas importantes
  * 📝 **Nota**: Para información adicional
- AGREGA ejemplos prácticos con código cuando sea relevante
- USA tablas para comparaciones
- INCLUYE listas numeradas para procedimientos
- Sé TÉCNICO pero CLARO
- NO copies los ejemplos, CREA contenido nuevo
- NO incluyas meta-secciones como "Ejemplo X" o "Input del usuario"
- NO incluyas enlaces vacíos o placeholders como [texto](#) - si mencionas recursos relacionados, ponlos como texto simple sin enlaces
- NO crees secciones de "Referencias" o "Enlaces relacionados" con links ficticios
- El contenido debe ser completamente autónomo y no referenciar documentación externa que no existe
{diagram_instruction}

Comienza tu respuesta INMEDIATAMENTE con el título principal (ej: "# Understanding Infrastructure..." o "# Guía de...").
"""
        return prompt

    def _build_examples_section(self, examples: List) -> str:
        """Construye la sección de ejemplos para few-shot learning."""
        if not examples:
            return ""

        examples_text = "# Ejemplos de Referencia\n\n"
        examples_text += "A continuación se muestran ejemplos de cómo debe verse la documentación:\n\n"

        for i, example in enumerate(examples, 1):
            examples_text += f"## Ejemplo {i}: {example.title}\n\n"
            examples_text += f"**Input del usuario:**\n{example.input_prompt}\n\n"
            examples_text += f"**Output esperado:**\n{example.generated_content}\n\n"

            if example.diagram_code:
                examples_text += f"**Diagrama:**\n```\n{example.diagram_code}\n```\n\n"

            examples_text += "---\n\n"

        return examples_text

    def _get_default_template(self) -> str:
        """Template por defecto si el estándar no tiene uno."""
        return """Genera documentación técnica profesional y detallada.
Sigue las mejores prácticas de la industria."""

    def _call_ai_api(self, prompt: str, standard) -> Dict:
        """
        Llama a la API de IA para generar el contenido.

        Args:
            prompt: Prompt completo construido
            standard: Estándar de documentación

        Returns:
            Dict con 'content' y opcionalmente 'diagram_code'
        """
        if not self.api_key:
            return self._mock_generation(prompt, standard)

        try:
            # Intentar usar OpenAI
            from openai import OpenAI

            client = OpenAI(api_key=self.api_key)

            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Eres un experto en documentación técnica de software. Generas documentación clara, profesional y detallada."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )

            generated_text = response.choices[0].message.content

            # Separar contenido y diagrama si es necesario
            content, diagram_code = self._parse_generated_text(generated_text, standard)

            return {
                'content': content,
                'diagram_code': diagram_code
            }
        except ImportError:
            print("Warning: openai package not installed. Using mock generation.")
            return self._mock_generation(prompt, standard)
        except Exception as e:
            print(f"Error calling OpenAI API: {str(e)}")
            print("Falling back to mock generation.")
            return self._mock_generation(prompt, standard)

    def _mock_generation(self, prompt: str, standard) -> Dict:
        """
        Generación mock para testing sin API key.
        Retorna un ejemplo basado en el tipo de estándar.
        """
        # Simulación básica basada en la categoría
        content = f"""# Documentación Generada (MOCK)

Este es un ejemplo de documentación generada automáticamente.

## Descripción
Esta documentación fue generada usando el estándar: {standard.name}

## Detalles
- Categoría: {standard.get_category_display()}
- Requiere diagrama: {'Sí' if standard.requires_diagram else 'No'}

## Contenido
La generación real se realizará cuando se configure una API key válida en las variables de entorno.

Para habilitar la generación real:
1. Configurar OPENAI_API_KEY en el entorno
2. O pasar api_key al inicializar AIDocumentationGenerator
"""

        diagram_code = ""
        if standard.requires_diagram:
            if standard.diagram_type == 'MERMAID':
                diagram_code = """graph TD
    A[Inicio] --> B{Decisión}
    B -->|Sí| C[Acción 1]
    B -->|No| D[Acción 2]
    C --> E[Fin]
    D --> E
"""
            elif standard.diagram_type == 'PLANTUML':
                diagram_code = """@startuml
actor Usuario
participant Sistema
database BD

Usuario -> Sistema: Acción
Sistema -> BD: Consulta
BD --> Sistema: Resultado
Sistema --> Usuario: Respuesta
@enduml
"""

        return {
            'content': content,
            'diagram_code': diagram_code
        }

    def _parse_generated_text(self, text: str, standard) -> tuple:
        """
        Parsea el texto generado para separar contenido y diagrama.

        Args:
            text: Texto generado por la IA
            standard: Estándar usado

        Returns:
            Tuple (content, diagram_code)
        """
        if not standard.requires_diagram:
            return text, ""

        # Buscar bloques de código que podrían ser diagramas
        import re

        # Intentar múltiples patrones para mayor robustez
        if standard.diagram_type == 'MERMAID':
            # Patrón 1: con etiqueta mermaid
            pattern1 = r'```mermaid\n(.*?)\n```'
            match = re.search(pattern1, text, re.DOTALL)

            if match:
                diagram_code = match.group(1).strip()
                # Remover el bloque del diagrama del contenido
                content = re.sub(pattern1, '', text, flags=re.DOTALL).strip()
                return content, diagram_code

            # Patrón 2: buscar cualquier bloque de código después de "## Diagrama"
            pattern2 = r'##\s*Diagrama[^\n]*\n+```[a-z]*\n(.*?)\n```'
            match = re.search(pattern2, text, re.DOTALL | re.IGNORECASE)

            if match:
                diagram_code = match.group(1).strip()
                # Remover la sección del diagrama completa del contenido
                content = re.sub(pattern2, '', text, flags=re.DOTALL | re.IGNORECASE).strip()
                return content, diagram_code

            # Patrón 3: buscar bloques que parezcan Mermaid (contienen graph, sequenceDiagram, etc.)
            pattern3 = r'```[a-z]*\n((?:graph|sequenceDiagram|classDiagram|erDiagram|gantt|flowchart).*?)\n```'
            match = re.search(pattern3, text, re.DOTALL)

            if match:
                diagram_code = match.group(1).strip()
                # Remover el bloque del diagrama del contenido
                content = re.sub(pattern3, '', text, flags=re.DOTALL).strip()
                return content, diagram_code

            # Patrón 4: buscar texto que contenga sintaxis mermaid sin bloques de código
            # Esto captura cuando la IA genera el diagrama sin los backticks
            pattern4 = r'(?:^|\n)((?:graph|sequenceDiagram|classDiagram|erDiagram|gantt|flowchart)\s+.*?)(?=\n##|\n#|$)'
            match = re.search(pattern4, text, re.DOTALL | re.MULTILINE)

            if match:
                diagram_code = match.group(1).strip()
                # Remover el diagrama del contenido
                content = re.sub(pattern4, '', text, flags=re.DOTALL | re.MULTILINE).strip()
                return content, diagram_code

        elif standard.diagram_type == 'PLANTUML':
            pattern = r'```plantuml\n(.*?)\n```'
            match = re.search(pattern, text, re.DOTALL)

            if match:
                diagram_code = match.group(1).strip()
                content = re.sub(pattern, '', text, flags=re.DOTALL).strip()
                return content, diagram_code

        # Si no se encontró diagrama pero se requiere, retornar todo como contenido
        # y un diagrama vacío (se mostrará advertencia al usuario)
        return text, ""


# Función helper para uso rápido
def generate_documentation(standard, user_prompt: str, examples=None) -> Dict:
    """
    Helper function para generar documentación rápidamente.

    Usage:
        from apps.standards.services import generate_documentation

        result = generate_documentation(
            standard=my_standard,
            user_prompt="Sistema de login con email"
        )

        print(result['content'])
        print(result['diagram_code'])
    """
    generator = AIDocumentationGenerator()
    return generator.generate(standard, user_prompt, examples)

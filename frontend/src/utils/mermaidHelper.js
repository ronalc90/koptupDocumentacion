/**
 * Utilidades para trabajar con diagramas Mermaid
 */

/**
 * Procesa el contenido HTML y convierte los marcadores de Mermaid en divs renderizables
 * @param {string} htmlContent - Contenido HTML que puede contener marcadores de Mermaid
 * @returns {string} - Contenido HTML con los marcadores convertidos a divs Mermaid
 */
export const processMermaidMarkers = (htmlContent) => {
  return htmlContent.replace(
    /\[MERMAID_DIAGRAM_START\]([\s\S]*?)\[MERMAID_DIAGRAM_END\]/g,
    (match, mermaidCode) => {
      console.log('Diagrama Mermaid encontrado:', mermaidCode);
      return `<div class="mermaid" style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 16px 0;">${mermaidCode.trim()}</div>`;
    }
  );
};

/**
 * Plantillas predefinidas de diagramas Mermaid
 */
export const mermaidTemplates = {
  flowchart: `graph TD
    A[Inicio] --> B{Decisión}
    B -->|Sí| C[Proceso 1]
    B -->|No| D[Proceso 2]
    C --> E[Fin]
    D --> E`,

  sequence: `sequenceDiagram
    participant Usuario
    participant Sistema
    participant BaseDatos
    Usuario->>Sistema: Solicitud
    Sistema->>BaseDatos: Consulta
    BaseDatos-->>Sistema: Datos
    Sistema-->>Usuario: Respuesta`,

  architecture: `graph LR
    A[Frontend] --> B[API Gateway]
    B --> C[Backend]
    C --> D[Base de Datos]
    C --> E[Cache]`,

  entity: `erDiagram
    USUARIO ||--o{ DOCUMENTO : crea
    USUARIO {
        int id
        string nombre
        string email
    }
    DOCUMENTO {
        int id
        string titulo
        text contenido
        date fecha
    }`,

  default: `graph TD
    A[Nodo 1] --> B[Nodo 2]`,
};

/**
 * Obtiene el código de plantilla Mermaid para un tipo específico
 * @param {string} templateId - ID de la plantilla
 * @returns {string} - Código Mermaid de la plantilla
 */
export const getMermaidTemplate = (templateId) => {
  return mermaidTemplates[templateId] || mermaidTemplates.default;
};

/**
 * Crea un marcador de diagrama Mermaid que será procesado al guardar
 * @param {string} mermaidCode - Código Mermaid
 * @returns {string} - Marcador que será procesado después
 */
export const createMermaidMarker = (mermaidCode) => {
  return `[MERMAID_DIAGRAM_START]${mermaidCode}[MERMAID_DIAGRAM_END]`;
};

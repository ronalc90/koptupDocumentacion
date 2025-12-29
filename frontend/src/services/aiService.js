import api from './api';

/**
 * Servicio para interactuar con el Asistente de IA
 */

/**
 * Enviar mensaje al chat de IA
 * @param {string} message - Mensaje del usuario
 * @param {Array} conversationHistory - Historial de conversación
 * @returns {Promise} Respuesta del chat
 */
export const sendChatMessage = async (message, conversationHistory = []) => {
  try {
    const response = await api.post('/standards/chat/', {
      message,
      conversation_history: conversationHistory,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Generar diagrama Mermaid desde texto
 * @param {string} text - Descripción del diagrama
 * @param {string} diagramType - Tipo de diagrama (flowchart, sequence, architecture, entity)
 * @returns {Promise} Código del diagrama
 */
export const generateDiagram = async (text, diagramType = 'flowchart') => {
  try {
    const response = await api.post('/standards/generate-diagram/', {
      text,
      diagram_type: diagramType,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating diagram:', error);
    throw error;
  }
};

/**
 * Generar documentación técnica con IA
 * @param {number} standardId - ID del estándar de documentación
 * @param {string} userPrompt - Descripción de lo que se necesita documentar
 * @returns {Promise} Documentación generada
 */
export const generateDocumentation = async (standardId, userPrompt) => {
  try {
    const response = await api.post('/standards/generate/', {
      standard_id: standardId,
      user_prompt: userPrompt,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
};

/**
 * Obtener lista de estándares de documentación disponibles
 * @returns {Promise} Lista de estándares
 */
export const getDocumentationStandards = async () => {
  try {
    const response = await api.get('/standards/standards/');
    return response.data;
  } catch (error) {
    console.error('Error fetching documentation standards:', error);
    throw error;
  }
};

/**
 * Guardar documento generado
 * @param {Object} documentData - Datos del documento
 * @returns {Promise} Documento guardado
 */
export const saveDocument = async (documentData) => {
  try {
    const response = await api.post('/documents/documents/', documentData);
    return response.data;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};

/**
 * Obtener workspaces disponibles
 * @returns {Promise} Lista de workspaces
 */
export const getWorkspaces = async () => {
  try {
    const response = await api.get('/documents/workspaces/');
    return response.data;
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    throw error;
  }
};

export default {
  sendChatMessage,
  generateDiagram,
  generateDocumentation,
  getDocumentationStandards,
  saveDocument,
  getWorkspaces,
};

import api from './api';

/**
 * Standards Service - AI-powered documentation generation
 *
 * New system based on examples library for AI generation:
 * - DocumentationStandards: Categories of documentation (Use Cases, UML, APIs, etc.)
 * - DocumentationExamples: Input → Output examples for AI learning
 * - AIGenerationTests: Testing system with user ratings
 */
const standardsService = {
  // ==================== Documentation Standards ====================

  /**
   * Get list of documentation standards
   * @param {Object} params - Query parameters (category, requires_diagram, etc.)
   */
  getStandards: async (params = {}) => {
    const res = await api.get('/standards/standards/', { params });
    return res.data;
  },

  /**
   * Get a single documentation standard with examples
   * @param {number} id - Standard ID
   */
  getStandard: async (id) => {
    const res = await api.get(`/standards/standards/${id}/`);
    return res.data;
  },

  /**
   * Create a new documentation standard
   * @param {Object} data - Standard data
   */
  createStandard: async (data) => {
    const res = await api.post('/standards/standards/', data);
    return res.data;
  },

  /**
   * Update a documentation standard
   * @param {number} id - Standard ID
   * @param {Object} data - Updated data
   */
  updateStandard: async (id, data) => {
    const res = await api.put(`/standards/standards/${id}/`, data);
    return res.data;
  },

  /**
   * Delete a documentation standard
   * @param {number} id - Standard ID
   */
  deleteStandard: async (id) => {
    const res = await api.delete(`/standards/standards/${id}/`);
    return res.data;
  },

  // ==================== Documentation Examples ====================

  /**
   * Get list of documentation examples
   * @param {Object} params - Query parameters (standard, complexity_level, etc.)
   */
  getExamples: async (params = {}) => {
    const res = await api.get('/standards/examples/', { params });
    return res.data;
  },

  /**
   * Get a single example
   * @param {number} id - Example ID
   */
  getExample: async (id) => {
    const res = await api.get(`/standards/examples/${id}/`);
    return res.data;
  },

  /**
   * Create a new example
   * @param {Object} data - Example data with input_prompt and generated_content
   */
  createExample: async (data) => {
    const res = await api.post('/standards/examples/', data);
    return res.data;
  },

  /**
   * Update an example
   * @param {number} id - Example ID
   * @param {Object} data - Updated data
   */
  updateExample: async (id, data) => {
    const res = await api.put(`/standards/examples/${id}/`, data);
    return res.data;
  },

  /**
   * Delete an example
   * @param {number} id - Example ID
   */
  deleteExample: async (id) => {
    const res = await api.delete(`/standards/examples/${id}/`);
    return res.data;
  },

  // ==================== AI Generation ====================

  /**
   * Generate documentation using AI based on examples
   * @param {Object} data - { standard_id, user_prompt, task_id? }
   * @returns {Object} { content, diagram_code, model_used, generation_time }
   */
  generateDocumentation: async (data) => {
    const res = await api.post('/standards/generate/', data);
    return res.data;
  },

  /**
   * Alias for generateDocumentation (shorter name)
   */
  generate: async (data) => {
    const res = await api.post('/standards/generate/', data);
    return res.data;
  },

  /**
   * Get all standards (alias for getStandards)
   */
  getAll: async (params = {}) => {
    const res = await api.get('/standards/standards/', { params });
    return res.data;
  },

  // ==================== AI Generation Tests ====================

  /**
   * Get list of AI generation tests
   * @param {Object} params - Query parameters (standard, status, user_rating, etc.)
   */
  getAITests: async (params = {}) => {
    const res = await api.get('/standards/ai-tests/', { params });
    return res.data;
  },

  /**
   * Get a single AI test
   * @param {number} id - Test ID
   */
  getAITest: async (id) => {
    const res = await api.get(`/standards/ai-tests/${id}/`);
    return res.data;
  },

  /**
   * Create and run a new AI generation test
   * @param {Object} data - { standard, user_prompt }
   * @returns {Object} Test result with generated content
   */
  createAITest: async (data) => {
    const res = await api.post('/standards/ai-tests/', data);
    return res.data;
  },

  /**
   * Update AI test (e.g., add user rating and feedback)
   * @param {number} id - Test ID
   * @param {Object} data - { user_rating?, user_feedback? }
   */
  updateAITest: async (id, data) => {
    const res = await api.patch(`/standards/ai-tests/${id}/`, data);
    return res.data;
  },

  /**
   * Delete an AI test
   * @param {number} id - Test ID
   */
  deleteAITest: async (id) => {
    const res = await api.delete(`/standards/ai-tests/${id}/`);
    return res.data;
  },

  // ==================== Project Documentation Generation ====================

  /**
   * Generate complete documentation for a project with all its tasks
   * @param {number} projectId - Project ID
   * @returns {Object} { success, project_id, project_name, documentation, generation_time, tasks_count }
   */
  generateProjectDocumentation: async (projectId) => {
    const res = await api.post('/standards/generate-project/', { project_id: projectId });
    return res.data;
  },

  // ==================== Diagram Generation ====================

  /**
   * Generate a Mermaid diagram from descriptive text
   * @param {Object} data - { text, diagram_type }
   * @param {string} data.text - Descriptive text to convert to diagram
   * @param {string} data.diagram_type - Type of diagram (flowchart, sequence, architecture, entity)
   * @returns {Object} { success, diagram_code, diagram_type }
   */
  generateDiagram: async (data) => {
    const res = await api.post('/standards/generate-diagram/', data);
    return res.data;
  },
};

export default standardsService;

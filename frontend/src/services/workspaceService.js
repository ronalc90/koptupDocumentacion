import api from './api';

/**
 * Workspace Service - Manage documentation workspaces
 *
 * Workspaces categorize documents into different knowledge areas:
 * - Technical Documentation
 * - Processes
 * - Guides
 * - Knowledge Base
 */
const workspaceService = {
  /**
   * Get all workspaces for the current organization
   * @param {Object} params - Query parameters (type, is_active, etc.)
   * @returns {Promise<Array>} List of workspaces
   */
  getAll: async (params = {}) => {
    const response = await api.get('/documents/workspaces/', { params });
    return response.data;
  },

  /**
   * Get a single workspace by ID
   * @param {number} id - Workspace ID
   * @returns {Promise<Object>} Workspace details
   */
  getById: async (id) => {
    const response = await api.get(`/documents/workspaces/${id}/`);
    return response.data;
  },

  /**
   * Create a new workspace
   * @param {Object} data - Workspace data
   * @returns {Promise<Object>} Created workspace
   */
  create: async (data) => {
    const response = await api.post('/documents/workspaces/', data);
    return response.data;
  },

  /**
   * Update a workspace
   * @param {number} id - Workspace ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated workspace
   */
  update: async (id, data) => {
    const response = await api.put(`/documents/workspaces/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a workspace
   * @param {number} id - Workspace ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    const response = await api.delete(`/documents/workspaces/${id}/`);
    return response.data;
  },
};

export default workspaceService;

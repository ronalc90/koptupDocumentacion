/**
 * Workspace Type Service
 * Handles API calls for workspace type management
 */

import api from './api';

const workspaceTypeService = {
  /**
   * Get all workspace types (global + organization-specific)
   * @returns {Promise} Array of workspace types
   */
  getAll: async (params = {}) => {
    const response = await api.get('/documents/workspace-types/', { params });
    return response.data;
  },

  /**
   * Get a single workspace type by ID
   * @param {number} id - Workspace type ID
   * @returns {Promise} Workspace type object
   */
  getById: async (id) => {
    const response = await api.get(`/documents/workspace-types/${id}/`);
    return response.data;
  },

  /**
   * Create a new workspace type
   * @param {Object} data - Workspace type data
   * @returns {Promise} Created workspace type
   */
  create: async (data) => {
    const response = await api.post('/documents/workspace-types/', data);
    return response.data;
  },

  /**
   * Update an existing workspace type
   * @param {number} id - Workspace type ID
   * @param {Object} data - Updated data
   * @returns {Promise} Updated workspace type
   */
  update: async (id, data) => {
    const response = await api.patch(`/documents/workspace-types/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a workspace type (soft delete)
   * @param {number} id - Workspace type ID
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await api.delete(`/documents/workspace-types/${id}/`);
    return response.data;
  },
};

export default workspaceTypeService;

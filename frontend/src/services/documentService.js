import api from './api';

const documentService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/documents/documents/', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/documents/documents/${id}/`);
    return response.data;
  },

  create: async (documentData) => {
    const response = await api.post('/documents/documents/', documentData);
    return response.data;
  },

  update: async (id, documentData) => {
    const response = await api.put(`/documents/documents/${id}/`, documentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/documents/documents/${id}/`);
    return response.data;
  },

  // Version management
  getVersions: async (id) => {
    const response = await api.get(`/documents/documents/${id}/versions/`);
    return response.data;
  },

  revertToVersion: async (id, versionId, changesDescription = '') => {
    const response = await api.post(`/documents/documents/${id}/revert_to_version/`, {
      version_id: versionId,
      changes_description: changesDescription
    });
    return response.data;
  },

  // Trash management
  getTrash: async () => {
    const response = await api.get('/documents/documents/trash/');
    return response.data;
  },

  restore: async (id) => {
    const response = await api.post(`/documents/documents/${id}/restore/`);
    return response.data;
  },

  permanentDelete: async (id) => {
    const response = await api.delete(`/documents/documents/${id}/permanent_delete/`);
    return response.data;
  },

  getComments: async (documentId) => {
    const response = await api.get(`/documents/comments/?document=${documentId}`);
    return response.data;
  },

  addComment: async (commentData) => {
    const response = await api.post('/documents/comments/', commentData);
    return response.data;
  },

  getAttachments: async (documentId) => {
    const response = await api.get(`/documents/attachments/?document=${documentId}`);
    return response.data;
  },

  uploadAttachment: async (formData) => {
    const response = await api.post('/documents/attachments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default documentService;

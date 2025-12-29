import api from './api';

const projectService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/projects/projects/', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/projects/${id}/`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post('/projects/projects/', projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await api.put(`/projects/projects/${id}/`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/projects/${id}/`);
    return response.data;
  },

  getClients: async () => {
    const response = await api.get('/projects/clients/');
    return response.data;
  },

  getMethodologies: async () => {
    const response = await api.get('/projects/methodologies/');
    return response.data;
  },

  getMembers: async (projectId) => {
    const response = await api.get(`/projects/members/?project=${projectId}`);
    return response.data;
  },

  getPhases: async (projectId) => {
    const response = await api.get(`/projects/phases/?project=${projectId}`);
    return response.data;
  },
};

export default projectService;

import api from './api';

const checklistService = {
  getChecklists: async (params = {}) => {
    const res = await api.get('/checklist/checklists/', { params });
    return res.data;
  },
  createChecklist: async (data) => {
    const res = await api.post('/checklist/checklists/', data);
    return res.data;
  },
  updateChecklist: async (id, data) => {
    const res = await api.put(`/checklist/checklists/${id}/`, data);
    return res.data;
  },
  getItems: async (params = {}) => {
    const res = await api.get('/checklist/items/', { params });
    return res.data;
  },
  createItem: async (data) => {
    const res = await api.post('/checklist/items/', data);
    return res.data;
  },
  updateItem: async (id, data) => {
    const res = await api.put(`/checklist/items/${id}/`, data);
    return res.data;
  },
  getBlockingIssues: async (params = {}) => {
    const res = await api.get('/checklist/blocking-issues/', { params });
    return res.data;
  },
  createBlockingIssue: async (data) => {
    const res = await api.post('/checklist/blocking-issues/', data);
    return res.data;
  },
  getCertificates: async (params = {}) => {
    const res = await api.get('/checklist/certificates/', { params });
    return res.data;
  },
  createCertificate: async (data) => {
    const res = await api.post('/checklist/certificates/', data);
    return res.data;
  },
  getTemplates: async () => {
    const res = await api.get('/checklist/templates/');
    return res.data;
  },
};

export default checklistService;

import api from './api';

const validationService = {
  getResults: async (documentId) => {
    const res = await api.get(`/validation/results/?document=${documentId}`);
    return res.data;
  },
  getRules: async (params = {}) => {
    const res = await api.get('/validation/rules/', { params });
    return res.data;
  },
  getQAReviews: async (documentId) => {
    const res = await api.get(`/validation/qa-reviews/?document=${documentId}`);
    return res.data;
  },
  createQAReview: async (data) => {
    const res = await api.post('/validation/qa-reviews/', data);
    return res.data;
  },
  getCheckpoints: async (documentId) => {
    const res = await api.get(`/validation/checkpoints/?document=${documentId}`);
    return res.data;
  },
  createCheckpoint: async (data) => {
    const res = await api.post('/validation/checkpoints/', data);
    return res.data;
  },
  getIssues: async (documentId) => {
    const res = await api.get(`/validation/issues/?document=${documentId}`);
    return res.data;
  },
  createIssue: async (data) => {
    const res = await api.post('/validation/issues/', data);
    return res.data;
  },
};

export default validationService;

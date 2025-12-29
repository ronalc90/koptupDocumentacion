import api from './api';

const agileService = {
  getEpics: async (params = {}) => {
    const res = await api.get('/agile/epics/', { params });
    return res.data;
  },
  createEpic: async (data) => {
    const res = await api.post('/agile/epics/', data);
    return res.data;
  },
  getUserStories: async (params = {}) => {
    const res = await api.get('/agile/user-stories/', { params });
    return res.data;
  },
  createUserStory: async (data) => {
    const res = await api.post('/agile/user-stories/', data);
    return res.data;
  },
  getTasks: async (params = {}) => {
    const res = await api.get('/agile/tasks/', { params });
    return res.data;
  },
  createTask: async (data) => {
    const res = await api.post('/agile/tasks/', data);
    return res.data;
  },
  getSprints: async (params = {}) => {
    const res = await api.get('/agile/sprints/', { params });
    return res.data;
  },
  createSprint: async (data) => {
    const res = await api.post('/agile/sprints/', data);
    return res.data;
  },
};

export default agileService;

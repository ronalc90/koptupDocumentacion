import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/token/', credentials);
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  me: async () => {
    const response = await api.get('/auth/users/me/');
    return response.data;
  },

  changePassword: async (passwords) => {
    const response = await api.post('/auth/users/change_password/', passwords);
    return response.data;
  },

  register: async (data) => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },
};

export default authService;

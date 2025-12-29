import api from './api';

const auditService = {
  getLogs: async (params = {}) => {
    const res = await api.get('/audit/logs/', { params });
    return res.data;
  },
  getApprovals: async (params = {}) => {
    const res = await api.get('/audit/approvals/', { params });
    return res.data;
  },
  getAccess: async (params = {}) => {
    const res = await api.get('/audit/access/', { params });
    return res.data;
  },
  getComplianceReports: async (params = {}) => {
    const res = await api.get('/audit/compliance-reports/', { params });
    return res.data;
  },
  createComplianceReport: async (data) => {
    const res = await api.post('/audit/compliance-reports/', data);
    return res.data;
  },
  getRetentionPolicies: async (params = {}) => {
    const res = await api.get('/audit/retention-policies/', { params });
    return res.data;
  },
  createRetentionPolicy: async (data) => {
    const res = await api.post('/audit/retention-policies/', data);
    return res.data;
  },
  getSecurityEvents: async (params = {}) => {
    const res = await api.get('/audit/security-events/', { params });
    return res.data;
  },
  createSecurityEvent: async (data) => {
    const res = await api.post('/audit/security-events/', data);
    return res.data;
  },
};

export default auditService;

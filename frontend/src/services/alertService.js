import api from './api';

export const alertService = {
  async getAlerts(status) {
    const { data } = await api.get('/alerts', { params: status ? { status } : {} });
    return data; // { success, newCount, data: [...] }
  },
  async getAlert(id) {
    const { data } = await api.get(`/alerts/${id}`);
    return data;
  },
  async acknowledge(id) {
    const { data } = await api.patch(`/alerts/${id}/acknowledge`);
    return data;
  },
  async dismiss(id) {
    const { data } = await api.patch(`/alerts/${id}/dismiss`);
    return data;
  },
};

export default alertService;
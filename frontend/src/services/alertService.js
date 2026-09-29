import api from './api';

export const alertService = {
  async getAlerts() {
    const { data } = await api.get('/alerts');
    return data;
  },
};

export default alertService;
import api, { API_BASE_URL } from './api';

export const cameraService = {
  async getZones() {
    const { data } = await api.get('/zones');
    return data;
  },

  async getZone(zoneId) {
    const { data } = await api.get(`/zones/${zoneId}`);
    return data;
  },

  getStreamUrl() {
    const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
    return `${aiServiceUrl}/stream/live`;
  },

  // The AI service's own websocket - full per-frame analytics (detections
  // with confidence, risk breakdown, inference timing) that never gets
  // pushed to Node (that path is throttled/truncated for DB persistence).
  // Browser connects directly, same reasoning as the MJPEG stream above.
  getWsUrl() {
    const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
    return aiServiceUrl.replace(/^http/, 'ws') + '/ws/live';
  },

  async startMonitoring() {
    const { data } = await api.post('/monitoring/start');
    return data;
  },

  async stopMonitoring() {
    const { data } = await api.post('/monitoring/stop');
    return data;
  },

  async getMonitoringStatus() {
    const { data } = await api.get('/monitoring/status');
    return data;
  },

  async getHistory(zoneId, params = {}) {
    const { data } = await api.get(`/zones/${zoneId}/history`, { params });
    return data;
  },
};

export { API_BASE_URL };
export default cameraService;
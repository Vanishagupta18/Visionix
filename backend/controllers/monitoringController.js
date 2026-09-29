const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

exports.startMonitoring = async (req, res) => {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/monitoring/start`);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'AI service unreachable', details: err.message });
  }
};

exports.stopMonitoring = async (req, res) => {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/monitoring/stop`);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'AI service unreachable', details: err.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { data } = await axios.get(`${AI_SERVICE_URL}/status`, { timeout: 4000 });
    res.json(data);
  } catch (err) {
    // AI service being down is an expected, handleable state - not a 500.
    res.json({ monitoringActive: false, cameraConnected: false, aiServiceReachable: false });
  }
};
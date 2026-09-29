const express = require('express');
const router = express.Router();
const {
  getZones,
  createZone,
  getZoneById,
  getZoneReadings,
  getAlerts,
  resolveAlert,
} = require('../controllers/zoneController');

router.get('/zones', getZones);
router.post('/zones', createZone);
router.get('/zones/:id', getZoneById);
router.get('/zones/:id/readings', getZoneReadings);
router.get('/alerts', getAlerts);
router.patch('/alerts/:id/resolve', resolveAlert);

module.exports = router;
const express = require('express');
const multer = require('multer');
const router = express.Router();

const {
  createZone,
  getZones,
  getZoneById,
  processFrame,
  getZoneHistory,
  getAlerts,
} = require('../controllers/zoneController');

// Store uploaded frames in memory, then forward to the AI service
// (no need to persist raw frames to disk for the core flow)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/zones', createZone);
router.get('/zones', getZones);
router.get('/zones/:id', getZoneById);

router.post('/zones/:zoneId/process-frame', upload.single('file'), processFrame);
router.get('/zones/:zoneId/history', getZoneHistory);

router.get('/alerts', getAlerts);

module.exports = router;

const express = require('express');
const router = express.Router();
const { startMonitoring, stopMonitoring, getStatus } = require('../controllers/monitoringController');

router.post('/monitoring/start', startMonitoring);
router.post('/monitoring/stop', stopMonitoring);
router.get('/monitoring/status', getStatus);

module.exports = router;
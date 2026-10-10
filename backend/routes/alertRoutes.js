const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlert,
  acknowledgeAlert,
  dismissAlert,
  resolveAlert,
} = require('../controllers/alertController');

router.get('/alerts', getAlerts);
router.get('/alerts/:id', getAlert);
router.patch('/alerts/:id/acknowledge', acknowledgeAlert);
router.patch('/alerts/:id/dismiss', dismissAlert);
router.patch('/alerts/:id/resolve', resolveAlert);

module.exports = router;
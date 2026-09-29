const express = require('express');
const router = express.Router();
const ingestAuth = require('../middleware/ingestAuth');
const { ingestReading } = require('../controllers/ingestController');

router.post('/ingest/reading', ingestAuth, ingestReading);

module.exports = router;
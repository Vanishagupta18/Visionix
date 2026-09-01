const axios = require('axios');
const FormData = require('form-data');

const Zone = require('../models/Zone');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Zone CRUD
// ---------------------------------------------------------------------------

exports.createZone = async (req, res) => {
  try {
    const zone = await Zone.create(req.body);
    res.status(201).json(zone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getZones = async (req, res) => {
  const zones = await Zone.find({ isActive: true });
  res.json(zones);
};

exports.getZoneById = async (req, res) => {
  const zone = await Zone.findById(req.params.id);
  if (!zone) return res.status(404).json({ error: 'Zone not found' });
  res.json(zone);
};

// ---------------------------------------------------------------------------
// Core flow: receive an image for a zone, call the AI service, store the
// result, create an alert if needed, and push a live update via Socket.io.
// ---------------------------------------------------------------------------

exports.processFrame = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const zone = await Zone.findById(zoneId);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });

    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

    // Forward the image to the FastAPI AI service
    const form = new FormData();
    form.append('file', req.file.buffer, req.file.originalname);

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, form, {
      headers: form.getHeaders(),
    });

    const { count, status } = aiResponse.data;

    // Save the reading
    const reading = await Reading.create({ zone: zone._id, count, status });

    // If dangerous, create an alert
    let alert = null;
    if (status === 'Dangerous') {
      alert = await Alert.create({
        zone: zone._id,
        count,
        message: `${zone.name} crossed dangerous crowd threshold (${count} people)`,
      });
    }

    // Push live update to any connected dashboards
    const io = req.app.get('io');
    if (io) {
      io.emit('zone-update', {
        zoneId: zone._id,
        zoneName: zone.name,
        count,
        status,
        timestamp: reading.createdAt,
        alert: alert ? true : false,
      });
    }

    res.json({ reading, alert });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to process frame', details: err.message });
  }
};

// ---------------------------------------------------------------------------
// History for the trend graph
// ---------------------------------------------------------------------------

exports.getZoneHistory = async (req, res) => {
  const { zoneId } = req.params;
  const readings = await Reading.find({ zone: zoneId }).sort({ createdAt: 1 }).limit(200);
  res.json(readings);
};

// ---------------------------------------------------------------------------
// Alerts list
// ---------------------------------------------------------------------------

exports.getAlerts = async (req, res) => {
  const alerts = await Alert.find().populate('zone', 'name').sort({ createdAt: -1 }).limit(100);
  res.json(alerts);
};

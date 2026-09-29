const Zone = require('../models/Zone');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');

// GET /api/zones
exports.getZones = async (req, res, next) => {
  try {
    const zones = await Zone.find().sort({ name: 1 });
    res.json({ success: true, data: zones });
  } catch (err) {
    next(err);
  }
};

// POST /api/zones
exports.createZone = async (req, res, next) => {
  try {
    const { name, location, videoSource, thresholds } = req.body;
    const zone = await Zone.create({ name, location, videoSource, thresholds });
    res.status(201).json({ success: true, data: zone });
  } catch (err) {
    next(err);
  }
};

// GET /api/zones/:id
exports.getZoneById = async (req, res, next) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });

    const latestReading = await Reading.findOne({ zone: zone._id }).sort({ timestamp: -1 });
    res.json({ success: true, data: { zone, latestReading } });
  } catch (err) {
    next(err);
  }
};

// GET /api/zones/:id/readings?from=&to=&limit=
exports.getZoneReadings = async (req, res, next) => {
  try {
    const { from, to, limit = 200 } = req.query;
    const query = { zone: req.params.id };
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }
    const readings = await Reading.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    res.json({ success: true, data: readings });
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts?resolved=false
exports.getAlerts = async (req, res, next) => {
  try {
    const { resolved } = req.query;
    const query = {};
    if (resolved !== undefined) query.resolved = resolved === 'true';
    const alerts = await Alert.find(query).populate('zone', 'name location').sort({ createdAt: -1 });
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id/resolve
exports.resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};
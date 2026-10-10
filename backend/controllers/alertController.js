const Alert = require('../models/Alert');
require('../models/Zone'); // populate ke liye model registered hona chahiye

// GET /api/alerts?status=active|resolved|dismissed
exports.getAlerts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const alerts = await Alert.find(filter)
      .populate('zone', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    const newCount = await Alert.countDocuments({ status: 'active', acknowledged: false });

    res.json({ success: true, newCount, data: alerts });
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts/:id
exports.getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('zone', 'name');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id/acknowledge
exports.acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true, acknowledgedAt: new Date() },
      { new: true }
    ).populate('zone', 'name');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    const io = req.app.get('io');
    if (io) io.emit('alert-updated', alert);
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id/dismiss   (Dismiss as False Positive)
exports.dismissAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'dismissed', dismissedAt: new Date() },
      { new: true }
    ).populate('zone', 'name');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    const io = req.app.get('io');
    if (io) io.emit('alert-updated', alert);
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};
// PATCH /api/alerts/:id/resolve  (purane frontend ke liye, same route naam)
exports.resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    ).populate('zone', 'name');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    const io = req.app.get('io');
    if (io) io.emit('alert-updated', alert);
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};
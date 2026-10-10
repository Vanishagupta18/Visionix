const Zone = require('../models/Zone');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');

const DISMISS_COOLDOWN_MS = 2 * 60 * 1000;

// POST /api/ingest/reading   (called by the Python AI service)
exports.ingestReading = async (req, res, next) => {
  try {
    const {
      zoneName, count, status, timestamp,
      riskScore, riskLabel, density, countSource, crowdMode,
      weaponDetected, signals,
    } = req.body;

    if (!zoneName || count === undefined || !status) {
      return res.status(400).json({ success: false, message: 'zoneName, count, status required' });
    }

    const when = timestamp ? new Date(timestamp) : new Date();

    const zone = await Zone.findOneAndUpdate(
      { name: zoneName },
      { currentCount: count, currentStatus: status, lastUpdated: when },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const reading = await Reading.create({ zone: zone._id, count, status, timestamp: when });

    // signals: weapon, fight, ... (koi bhi naya model bas yahan key add karta hai)
    const sig = { ...(signals && typeof signals === 'object' ? signals : {}) };
    if (weaponDetected === true && !sig.weapon) sig.weapon = { detected: true };
    const activeSignals = Object.fromEntries(
      Object.entries(sig).filter(([, v]) => v && v.detected)
    );
    const activeNames = Object.keys(activeSignals).map((k) => k.toUpperCase());
    const suffix = activeNames.length ? ` - ${activeNames.join(', ')} DETECTED` : '';

    const io = req.app.get('io');
    const elevated = status === 'Crowded' || status === 'Dangerous' || activeNames.length > 0;
    const severity = riskLabel || status;

    const liveFields = {
      count, severity, riskScore, density, countSource, crowdMode, reading: reading._id,
    };

    if (elevated) {
      const open = await Alert.findOne({ zone: zone._id, status: 'active' });

      if (open) {
        Object.assign(open, liveFields);
        // jo signal ek baar mila wo incident mein sticky rehta hai
        open.signals = { ...(open.signals || {}), ...activeSignals };
        open.weaponDetected = !!(open.signals.weapon && open.signals.weapon.detected);
        open.markModified('signals');
        const names = Object.keys(open.signals).map((k) => k.toUpperCase());
        open.message = `${zone.name} is ${severity} (${count} people)${names.length ? ` - ${names.join(', ')} DETECTED` : ''}`;
        await open.save();
        if (io) io.emit('alert-updated', open);
      } else {
        const recentlyDismissed = await Alert.findOne({
          zone: zone._id,
          status: 'dismissed',
          dismissedAt: { $gte: new Date(Date.now() - DISMISS_COOLDOWN_MS) },
        });

        if (!recentlyDismissed) {
          const alert = await Alert.create({
            zone: zone._id,
            ...liveFields,
            signals: activeSignals,
            weaponDetected: !!activeSignals.weapon,
            message: `${zone.name} is ${severity} (${count} people)${suffix}`,
          });
          if (io) io.emit('new-alert', alert);
        }
      }
    } else {
      const result = await Alert.updateMany(
        { zone: zone._id, status: 'active' },
        { status: 'resolved', resolvedAt: new Date() }
      );
      if (io && result.modifiedCount > 0) io.emit('alert-resolved', { zone: zone._id });
    }

    res.status(201).json({ success: true, data: reading });
  } catch (err) {
    next(err);
  }
};
const Zone = require('../models/Zone');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');

// POST /api/ingest/reading   (called by the Python AI service)
// body: { zoneName, count, status, timestamp }
exports.ingestReading = async (req, res, next) => {
  try {
    const { zoneName, count, status, timestamp } = req.body;
    if (!zoneName || count === undefined || !status) {
      return res.status(400).json({ success: false, message: 'zoneName, count, status required' });
    }

    // upsert the zone so the Python service can push readings even for
    // zones that haven't been manually created in Mongo yet
    const zone = await Zone.findOneAndUpdate(
      { name: zoneName },
      {
        currentCount: count,
        currentStatus: status,
        lastUpdated: timestamp ? new Date(timestamp) : new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const reading = await Reading.create({
      zone: zone._id,
      count,
      status,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    // auto-create an alert on Crowded/Dangerous transitions
    if (status === 'Crowded' || status === 'Dangerous') {
      const existingOpen = await Alert.findOne({ zone: zone._id, resolved: false, status });
      if (!existingOpen) {
        await Alert.create({
          zone: zone._id,
          status,
          count,
          message: `${zone.name} is ${status} (${count} people detected)`,
        });
      }
    } else {
      // status back to Safe — auto-resolve any open alerts for this zone
      await Alert.updateMany(
        { zone: zone._id, resolved: false },
        { resolved: true, resolvedAt: new Date() }
      );
    }

    res.status(201).json({ success: true, data: reading });
  } catch (err) {
    next(err);
  }
};
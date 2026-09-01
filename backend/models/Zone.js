const mongoose = require('mongoose');

// A "Zone" represents one monitored location / video source / camera.
// In Phase 1 there will usually be just one zone; Phase 2 adds more.
const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },          // e.g. "Zone 1 - Entrance"
    description: { type: String },
    safeThreshold: { type: Number, default: 50 },      // count below this = Safe
    crowdedThreshold: { type: Number, default: 150 },  // count below this = Crowded, else Dangerous
    latitude: { type: Number },                        // optional, for future map view
    longitude: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Zone', zoneSchema);

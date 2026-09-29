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

    // --- Live status snapshot, written on every ingested reading. Lets the
    // dashboard show "what's happening right now" with one findById()
    // instead of a sorted Reading query on every page load. ---
    currentCount: { type: Number, default: 0 },
    currentStatus: { type: String, enum: ['Safe', 'Crowded', 'Dangerous'], default: 'Safe' },
    countSource: { type: String, enum: ['YOLO', 'CSRNet'], default: 'YOLO' },
    crowdMode: { type: String, enum: ['YOLO', 'CSRNET'], default: 'YOLO' },
    density: { type: Number },            // people per square metre
    riskScore: { type: Number },          // 0-100
    riskLabel: { type: String, enum: ['Safe', 'Warning', 'High Risk', 'Critical'] },
    cameraStatus: { type: String, enum: ['connected', 'disconnected', 'stopped'], default: 'stopped' },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Zone', zoneSchema);
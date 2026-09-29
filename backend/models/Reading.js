const mongoose = require('mongoose');

// One Reading = one AI prediction result for one zone at one point in time.
// This is what powers the historical trend graph.
const readingSchema = new mongoose.Schema(
  {
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    count: { type: Number, required: true },
    status: { type: String, enum: ['Safe', 'Crowded', 'Dangerous'], required: true },

    // --- Additive fields, populated by the live pipeline (live_service.py).
    // Left undefined for readings created via the older per-frame upload
    // flow (zoneController.processFrame), which only ever sent count/status. ---
    countSource: { type: String, enum: ['YOLO', 'CSRNet'] },
    crowdMode: { type: String, enum: ['YOLO', 'CSRNET'] },
    density: { type: Number },
    riskScore: { type: Number },
    riskLabel: { type: String, enum: ['Safe', 'Warning', 'High Risk', 'Critical'] },
    cameraStatus: { type: String, enum: ['connected', 'disconnected', 'stopped'] },
    inferenceMs: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

readingSchema.index({ zone: 1, timestamp: -1 });

module.exports = mongoose.model('Reading', readingSchema);
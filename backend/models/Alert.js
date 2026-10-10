const mongoose = require('mongoose');

// An Alert is created on a Safe -> elevated transition and resolved on the
// way back to Safe - not recreated every frame while the condition holds.
const alertSchema = new mongoose.Schema(
  {
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    count: { type: Number, required: true },
    severity: { type: String, enum: ['Crowded', 'Dangerous', 'Warning', 'High Risk', 'Critical'] },
    message: { type: String },
    reading: { type: mongoose.Schema.Types.ObjectId, ref: 'Reading' },

    // lifecycle: active -> resolved (auto, back to Safe) or dismissed (operator, false positive)
    status: { type: String, enum: ['active', 'resolved', 'dismissed'], default: 'active', index: true },
    resolvedAt: { type: Date },
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: { type: Date },
    dismissedAt: { type: Date },

    // live AI data shown on the Alerts page
    riskScore: { type: Number },
    density: { type: Number },            // people per m^2
    countSource: { type: String },        // 'YOLO' or 'CSRNet'
    crowdMode: { type: String },          // 'YOLO' or 'CSRNET'
    weaponDetected: { type: Boolean, default: false },
    signals: { type: mongoose.Schema.Types.Mixed, default: {} }, // weapon, fight, ... (future models)
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
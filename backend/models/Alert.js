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

    status: { type: String, enum: ['active', 'resolved'], default: 'active', index: true },
    resolvedAt: { type: Date },
    acknowledged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
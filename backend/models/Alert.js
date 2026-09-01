const mongoose = require('mongoose');

// An Alert is created whenever a Reading crosses into "Dangerous".
const alertSchema = new mongoose.Schema(
  {
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },
    count: { type: Number, required: true },
    message: { type: String },
    acknowledged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);

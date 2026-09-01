const mongoose = require('mongoose');

// One Reading = one AI prediction result for one zone at one point in time.
// This is what powers the historical trend graph.
const readingSchema = new mongoose.Schema(
  {
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },
    count: { type: Number, required: true },
    status: { type: String, enum: ['Safe', 'Crowded', 'Dangerous'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reading', readingSchema);

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Visonix] MongoDB connected');
  } catch (err) {
    console.error('[Visonix] MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

// Simple shared-secret check so only your Python service can push readings.
const ingestAuth = (req, res, next) => {
  const key = req.headers['x-ingest-key'];
  if (!key || key !== process.env.INGEST_API_KEY) {
    return res.status(401).json({ success: false, message: 'Invalid ingest key' });
  }
  next();
};

module.exports = ingestAuth;
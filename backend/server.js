require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const zoneRoutes = require('./routes/zoneRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Make io available inside controllers via req.app.get('io')
app.set('io', io);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Visonix Backend' });
});

app.use('/api', zoneRoutes);

io.on('connection', (socket) => {
  console.log('[Visonix] Dashboard connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('[Visonix] Dashboard disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[Visonix] Backend running on port ${PORT}`);
  });
});

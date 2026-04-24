require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const chatHandler = require('./socket/chatHandler');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Serve frontend in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));
app.use((req, res) => {
  res.sendFile(path.resolve(frontendDistPath, 'index.html'));
});

// Socket.io
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
chatHandler(io);

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI;

if (!DB_URI) {
  console.error('CRITICAL: MONGO_URI is not set in .env');
  process.exit(1);
}

mongoose.connect(DB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Email configured for: ${process.env.SMTP_USER || 'NOT CONFIGURED'}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

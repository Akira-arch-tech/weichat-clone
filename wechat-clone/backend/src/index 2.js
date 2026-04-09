const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS configuration
const corsOptions = {
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:80', 'http://localhost'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:80', 'http://localhost'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Setup socket handlers
const setupSocket = require('./socket');
setupSocket(io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/moments', require('./routes/moments'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

server.listen(PORT, () => {
  console.log(`微信克隆后端服务已启动，端口: ${PORT}`);
  console.log(`允许的前端域名: ${FRONTEND_URL}`);
});

module.exports = { app, server };

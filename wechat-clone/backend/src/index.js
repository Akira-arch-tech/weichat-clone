const express = require('express');
const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// 演示环境：反射请求 Origin，便于部署到任意公网域名（生产可改为固定白名单）
const corsOptions = {
  origin: true,
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
    origin: true,
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

// 单端口部署：托管前端构建产物（React Router）
const STATIC_WEB_ROOT = process.env.STATIC_WEB_ROOT;
if (STATIC_WEB_ROOT && fs.existsSync(STATIC_WEB_ROOT)) {
  const absWeb = path.resolve(STATIC_WEB_ROOT);
  app.use(express.static(absWeb, { index: false }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(absWeb, 'index.html'), (err) => (err ? next(err) : undefined));
  });
}

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: '接口不存在' });
  }
  res.status(404).type('text').send('Not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

server.listen(PORT, () => {
  console.log(`微信克隆后端服务已启动，端口: ${PORT}`);
  if (STATIC_WEB_ROOT && fs.existsSync(STATIC_WEB_ROOT)) {
    console.log(`静态站点目录: ${path.resolve(STATIC_WEB_ROOT)}`);
  } else {
    console.log(`参考前端地址 FRONTEND_URL: ${FRONTEND_URL}`);
  }
});

module.exports = { app, server };

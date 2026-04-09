const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// Register
router.post('/register', (req, res) => {
  const { phone, nickname, password } = req.body;

  if (!phone || !nickname || !password) {
    return res.status(400).json({ error: '请填写所有必填字段' });
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: '手机号格式不正确' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6位' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existingUser) {
    return res.status(400).json({ error: '该手机号已注册' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const wechatId = 'wx_' + phone.slice(-8) + Math.random().toString(36).slice(-4);

  const result = db.prepare(
    'INSERT INTO users (phone, nickname, password_hash, wechat_id) VALUES (?, ?, ?, ?)'
  ).run(phone, nickname, passwordHash, wechatId);

  const user = db.prepare('SELECT id, phone, nickname, avatar, wechat_id, bio, region, cover_photo, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user });
});

// Login
router.post('/login', (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: '请填写手机号和密码' });
  }

  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user) {
    return res.status(401).json({ error: '手机号或密码错误' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: '手机号或密码错误' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare(
    'SELECT id, phone, nickname, avatar, wechat_id, bio, region, cover_photo, created_at FROM users WHERE id = ?'
  ).get(req.userId);

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  res.json(user);
});

module.exports = router;

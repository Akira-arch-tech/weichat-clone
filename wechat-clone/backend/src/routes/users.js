const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

// Search users
router.get('/search', authMiddleware, (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.json([]);
  }

  const searchTerm = `%${q.trim()}%`;
  const users = db.prepare(
    `SELECT id, phone, nickname, avatar, wechat_id, bio, region
     FROM users
     WHERE (nickname LIKE ? OR phone LIKE ? OR wechat_id LIKE ?) AND id != ?
     LIMIT 20`
  ).all(searchTerm, searchTerm, searchTerm, req.userId);

  res.json(users);
});

// Update profile
router.put('/profile', authMiddleware, (req, res) => {
  const { nickname, bio, region, wechat_id } = req.body;

  const updates = [];
  const values = [];

  if (nickname !== undefined) {
    if (!nickname.trim()) {
      return res.status(400).json({ error: '昵称不能为空' });
    }
    updates.push('nickname = ?');
    values.push(nickname.trim());
  }

  if (bio !== undefined) {
    updates.push('bio = ?');
    values.push(bio);
  }

  if (region !== undefined) {
    updates.push('region = ?');
    values.push(region);
  }

  if (wechat_id !== undefined) {
    const existing = db.prepare('SELECT id FROM users WHERE wechat_id = ? AND id != ?').get(wechat_id, req.userId);
    if (existing) {
      return res.status(400).json({ error: '该微信号已被使用' });
    }
    updates.push('wechat_id = ?');
    values.push(wechat_id);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: '没有需要更新的字段' });
  }

  values.push(req.userId);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const user = db.prepare(
    'SELECT id, phone, nickname, avatar, wechat_id, bio, region, cover_photo, created_at FROM users WHERE id = ?'
  ).get(req.userId);

  res.json(user);
});

// Update avatar
router.put('/avatar', authMiddleware, (req, res) => {
  const { avatar } = req.body;
  if (!avatar) {
    return res.status(400).json({ error: '头像URL不能为空' });
  }

  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar, req.userId);

  const user = db.prepare(
    'SELECT id, phone, nickname, avatar, wechat_id, bio, region, cover_photo, created_at FROM users WHERE id = ?'
  ).get(req.userId);

  res.json(user);
});

// Update cover photo
router.put('/cover', authMiddleware, (req, res) => {
  const { cover_photo } = req.body;
  if (!cover_photo) {
    return res.status(400).json({ error: '封面图URL不能为空' });
  }

  db.prepare('UPDATE users SET cover_photo = ? WHERE id = ?').run(cover_photo, req.userId);

  const user = db.prepare(
    'SELECT id, phone, nickname, avatar, wechat_id, bio, region, cover_photo, created_at FROM users WHERE id = ?'
  ).get(req.userId);

  res.json(user);
});

module.exports = router;

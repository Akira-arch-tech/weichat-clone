const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

// Get my friend list (accepted)
router.get('/', authMiddleware, (req, res) => {
  const friends = db.prepare(
    `SELECT u.id, u.phone, u.nickname, u.avatar, u.wechat_id, u.bio, u.region,
            f.id as friendship_id, f.created_at as friend_since
     FROM friendships f
     JOIN users u ON u.id = f.friend_id
     WHERE f.user_id = ? AND f.status = 'accepted'
     ORDER BY u.nickname ASC`
  ).all(req.userId);

  res.json(friends);
});

// Send friend request
router.post('/add', authMiddleware, (req, res) => {
  const { userId, message } = req.body;

  if (!userId) {
    return res.status(400).json({ error: '请指定要添加的用户' });
  }

  if (userId === req.userId) {
    return res.status(400).json({ error: '不能添加自己为好友' });
  }

  const targetUser = db.prepare('SELECT id, nickname FROM users WHERE id = ?').get(userId);
  if (!targetUser) {
    return res.status(404).json({ error: '用户不存在' });
  }

  // Check if already friends or pending
  const existing = db.prepare(
    'SELECT * FROM friendships WHERE user_id = ? AND friend_id = ?'
  ).get(req.userId, userId);

  if (existing) {
    if (existing.status === 'accepted') {
      return res.status(400).json({ error: '已经是好友了' });
    } else {
      return res.status(400).json({ error: '已发送过好友请求，等待对方确认' });
    }
  }

  // Check if the other person already sent a request
  const reverseExisting = db.prepare(
    'SELECT * FROM friendships WHERE user_id = ? AND friend_id = ?'
  ).get(userId, req.userId);

  if (reverseExisting) {
    if (reverseExisting.status === 'accepted') {
      return res.status(400).json({ error: '已经是好友了' });
    } else {
      // Auto-accept
      const acceptBoth = db.transaction(() => {
        db.prepare('UPDATE friendships SET status = ? WHERE user_id = ? AND friend_id = ?')
          .run('accepted', userId, req.userId);
        db.prepare('INSERT OR IGNORE INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)')
          .run(req.userId, userId, 'accepted');
      });
      acceptBoth();
      return res.json({ message: '好友请求已自动接受', status: 'accepted' });
    }
  }

  db.prepare(
    'INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)'
  ).run(req.userId, userId, 'pending');

  res.json({ message: '好友请求已发送', status: 'pending' });
});

// Get pending friend requests (received)
router.get('/requests', authMiddleware, (req, res) => {
  const requests = db.prepare(
    `SELECT f.id, f.user_id, f.created_at,
            u.nickname, u.avatar, u.wechat_id, u.region, u.bio
     FROM friendships f
     JOIN users u ON u.id = f.user_id
     WHERE f.friend_id = ? AND f.status = 'pending'
     ORDER BY f.created_at DESC`
  ).all(req.userId);

  res.json(requests);
});

// Accept friend request
router.put('/:id/accept', authMiddleware, (req, res) => {
  const friendship = db.prepare(
    'SELECT * FROM friendships WHERE id = ? AND friend_id = ? AND status = ?'
  ).get(req.params.id, req.userId, 'pending');

  if (!friendship) {
    return res.status(404).json({ error: '好友请求不存在' });
  }

  const acceptBoth = db.transaction(() => {
    db.prepare('UPDATE friendships SET status = ? WHERE id = ?')
      .run('accepted', req.params.id);

    db.prepare('INSERT OR IGNORE INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)')
      .run(req.userId, friendship.user_id, 'accepted');
  });

  acceptBoth();

  res.json({ message: '已接受好友请求' });
});

// Reject friend request
router.put('/:id/reject', authMiddleware, (req, res) => {
  const friendship = db.prepare(
    'SELECT * FROM friendships WHERE id = ? AND friend_id = ? AND status = ?'
  ).get(req.params.id, req.userId, 'pending');

  if (!friendship) {
    return res.status(404).json({ error: '好友请求不存在' });
  }

  db.prepare('DELETE FROM friendships WHERE id = ?').run(req.params.id);

  res.json({ message: '已拒绝好友请求' });
});

// Get contact detail
router.get('/:id', authMiddleware, (req, res) => {
  const user = db.prepare(
    'SELECT id, phone, nickname, avatar, wechat_id, bio, region, cover_photo, created_at FROM users WHERE id = ?'
  ).get(req.params.id);

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  // Check friendship status
  const friendship = db.prepare(
    'SELECT * FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)'
  ).get(req.userId, req.params.id, req.params.id, req.userId);

  res.json({ ...user, friendship });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

function getOrCreateConversation(user1Id, user2Id) {
  const minId = Math.min(user1Id, user2Id);
  const maxId = Math.max(user1Id, user2Id);

  let conv = db.prepare(
    'SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ?'
  ).get(minId, maxId);

  if (!conv) {
    const result = db.prepare(
      'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)'
    ).run(minId, maxId);
    conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(result.lastInsertRowid);
  }

  return conv;
}

// Get conversations list
router.get('/conversations', authMiddleware, (req, res) => {
  const conversations = db.prepare(
    `SELECT c.id, c.last_message, c.last_message_time,
            CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END as other_user_id,
            u.nickname, u.avatar, u.wechat_id,
            COUNT(CASE WHEN m.is_read = 0 AND m.sender_id != ? THEN 1 END) as unread_count
     FROM conversations c
     JOIN users u ON u.id = (CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END)
     LEFT JOIN messages m ON m.conversation_id = c.id
     WHERE c.user1_id = ? OR c.user2_id = ?
     GROUP BY c.id
     ORDER BY c.last_message_time DESC NULLS LAST`
  ).all(req.userId, req.userId, req.userId, req.userId, req.userId);

  res.json(conversations);
});

// Get message history with a user
router.get('/:userId', authMiddleware, (req, res) => {
  const otherUserId = parseInt(req.params.userId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const conv = getOrCreateConversation(req.userId, otherUserId);

  const messages = db.prepare(
    `SELECT m.*, u.nickname as sender_nickname, u.avatar as sender_avatar
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at DESC
     LIMIT ? OFFSET ?`
  ).all(conv.id, limit, offset);

  res.json(messages.reverse());
});

// Send message
router.post('/:userId', authMiddleware, (req, res) => {
  const { content, type = 'text' } = req.body;
  const toUserId = parseInt(req.params.userId);

  if (!content) {
    return res.status(400).json({ error: '消息内容不能为空' });
  }

  const conv = getOrCreateConversation(req.userId, toUserId);

  const result = db.prepare(
    'INSERT INTO messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, ?)'
  ).run(conv.id, req.userId, content, type);

  db.prepare(
    'UPDATE conversations SET last_message = ?, last_message_time = ? WHERE id = ?'
  ).run(content, new Date().toISOString(), conv.id);

  const message = db.prepare(
    `SELECT m.*, u.nickname as sender_nickname, u.avatar as sender_avatar
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.id = ?`
  ).get(result.lastInsertRowid);

  // Emit socket event (handled by socket module via global io)
  if (global.io) {
    global.io.to(`user_${toUserId}`).emit('receive_message', {
      message,
      from: req.userId
    });
  }

  res.json(message);
});

// Mark messages as read
router.put('/:userId/read', authMiddleware, (req, res) => {
  const otherUserId = parseInt(req.params.userId);

  const conv = getOrCreateConversation(req.userId, otherUserId);

  db.prepare(
    'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?'
  ).run(conv.id, req.userId);

  res.json({ message: '已标记为已读' });
});

module.exports = router;
module.exports.getOrCreateConversation = getOrCreateConversation;

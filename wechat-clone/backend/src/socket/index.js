const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

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

function setupSocket(io) {
  global.io = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('未授权'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Token无效'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`用户 ${socket.userId} 已连接`);

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // User joins their room explicitly
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
    });

    // Send message
    socket.on('send_message', (data) => {
      const { toUserId, content, type = 'text' } = data;

      if (!toUserId || !content) return;

      try {
        const conv = getOrCreateConversation(socket.userId, toUserId);

        const result = db.prepare(
          'INSERT INTO messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, ?)'
        ).run(conv.id, socket.userId, content, type);

        db.prepare(
          'UPDATE conversations SET last_message = ?, last_message_time = ? WHERE id = ?'
        ).run(content, new Date().toISOString(), conv.id);

        const message = db.prepare(
          `SELECT m.*, u.nickname as sender_nickname, u.avatar as sender_avatar
           FROM messages m
           JOIN users u ON u.id = m.sender_id
           WHERE m.id = ?`
        ).get(result.lastInsertRowid);

        // Send to recipient
        io.to(`user_${toUserId}`).emit('receive_message', {
          message,
          from: socket.userId
        });

        // Also echo to sender (for confirmation)
        socket.emit('message_sent', { message });
      } catch (err) {
        console.error('发送消息错误:', err);
        socket.emit('error', { message: '发送消息失败' });
      }
    });

    // Typing indicators
    socket.on('typing', (data) => {
      const { toUserId } = data;
      if (toUserId) {
        io.to(`user_${toUserId}`).emit('user_typing', {
          fromUserId: socket.userId
        });
      }
    });

    socket.on('stop_typing', (data) => {
      const { toUserId } = data;
      if (toUserId) {
        io.to(`user_${toUserId}`).emit('user_stop_typing', {
          fromUserId: socket.userId
        });
      }
    });

    // Mark messages as read
    socket.on('mark_read', (data) => {
      const { conversationId } = data;
      if (conversationId) {
        db.prepare(
          'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?'
        ).run(conversationId, socket.userId);
      }
    });

    socket.on('disconnect', () => {
      console.log(`用户 ${socket.userId} 已断开连接`);
    });
  });
}

module.exports = setupSocket;

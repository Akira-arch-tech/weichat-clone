const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

function getMomentWithDetails(momentId, currentUserId) {
  const moment = db.prepare(
    `SELECT m.*, u.nickname, u.avatar
     FROM moments m
     JOIN users u ON u.id = m.user_id
     WHERE m.id = ?`
  ).get(momentId);

  if (!moment) return null;

  const likes = db.prepare(
    `SELECT ml.user_id, u.nickname
     FROM moment_likes ml
     JOIN users u ON u.id = ml.user_id
     WHERE ml.moment_id = ?`
  ).all(momentId);

  const comments = db.prepare(
    `SELECT mc.*, u.nickname, u.avatar,
            ru.nickname as reply_to_nickname
     FROM moment_comments mc
     JOIN users u ON u.id = mc.user_id
     LEFT JOIN moment_comments rc ON rc.id = mc.reply_to_id
     LEFT JOIN users ru ON ru.id = rc.user_id
     WHERE mc.moment_id = ?
     ORDER BY mc.created_at ASC`
  ).all(momentId);

  let images = [];
  try {
    images = JSON.parse(moment.images || '[]');
  } catch (e) {
    images = [];
  }

  return {
    ...moment,
    images,
    likes,
    comments,
    liked_by_me: likes.some(l => l.user_id === currentUserId)
  };
}

// Get feed (my + friends posts)
router.get('/', authMiddleware, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const moments = db.prepare(
    `SELECT DISTINCT m.id
     FROM moments m
     WHERE m.user_id = ?
       OR m.user_id IN (
         SELECT friend_id FROM friendships
         WHERE user_id = ? AND status = 'accepted'
       )
     ORDER BY m.created_at DESC
     LIMIT ? OFFSET ?`
  ).all(req.userId, req.userId, limit, offset);

  const result = moments.map(row => getMomentWithDetails(row.id, req.userId));

  res.json(result.filter(Boolean));
});

// Get user's posts
router.get('/user/:userId', authMiddleware, (req, res) => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const moments = db.prepare(
    `SELECT id FROM moments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(userId, limit, offset);

  const result = moments.map(row => getMomentWithDetails(row.id, req.userId));

  res.json(result.filter(Boolean));
});

// Create post
router.post('/', authMiddleware, (req, res) => {
  const { content, images = [] } = req.body;

  if (!content && (!images || images.length === 0)) {
    return res.status(400).json({ error: '内容或图片不能为空' });
  }

  if (images.length > 9) {
    return res.status(400).json({ error: '最多上传9张图片' });
  }

  const result = db.prepare(
    'INSERT INTO moments (user_id, content, images) VALUES (?, ?, ?)'
  ).run(req.userId, content || '', JSON.stringify(images));

  const moment = getMomentWithDetails(result.lastInsertRowid, req.userId);

  res.json(moment);
});

// Toggle like
router.post('/:id/like', authMiddleware, (req, res) => {
  const momentId = parseInt(req.params.id);

  const moment = db.prepare('SELECT id FROM moments WHERE id = ?').get(momentId);
  if (!moment) {
    return res.status(404).json({ error: '动态不存在' });
  }

  const existingLike = db.prepare(
    'SELECT id FROM moment_likes WHERE moment_id = ? AND user_id = ?'
  ).get(momentId, req.userId);

  if (existingLike) {
    db.prepare('DELETE FROM moment_likes WHERE moment_id = ? AND user_id = ?')
      .run(momentId, req.userId);
    res.json({ liked: false, message: '已取消点赞' });
  } else {
    db.prepare('INSERT INTO moment_likes (moment_id, user_id) VALUES (?, ?)')
      .run(momentId, req.userId);
    res.json({ liked: true, message: '已点赞' });
  }
});

// Add comment
router.post('/:id/comment', authMiddleware, (req, res) => {
  const momentId = parseInt(req.params.id);
  const { content, replyToId } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: '评论内容不能为空' });
  }

  const moment = db.prepare('SELECT id FROM moments WHERE id = ?').get(momentId);
  if (!moment) {
    return res.status(404).json({ error: '动态不存在' });
  }

  const result = db.prepare(
    'INSERT INTO moment_comments (moment_id, user_id, reply_to_id, content) VALUES (?, ?, ?, ?)'
  ).run(momentId, req.userId, replyToId || null, content.trim());

  const comment = db.prepare(
    `SELECT mc.*, u.nickname, u.avatar
     FROM moment_comments mc
     JOIN users u ON u.id = mc.user_id
     WHERE mc.id = ?`
  ).get(result.lastInsertRowid);

  res.json(comment);
});

// Delete post
router.delete('/:id', authMiddleware, (req, res) => {
  const momentId = parseInt(req.params.id);

  const moment = db.prepare('SELECT * FROM moments WHERE id = ? AND user_id = ?').get(momentId, req.userId);
  if (!moment) {
    return res.status(404).json({ error: '动态不存在或没有权限' });
  }

  const deleteAll = db.transaction(() => {
    db.prepare('DELETE FROM moment_comments WHERE moment_id = ?').run(momentId);
    db.prepare('DELETE FROM moment_likes WHERE moment_id = ?').run(momentId);
    db.prepare('DELETE FROM moments WHERE id = ?').run(momentId);
  });

  deleteAll();

  res.json({ message: '已删除' });
});

module.exports = router;

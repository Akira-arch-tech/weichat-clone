const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持图片格式（JPG、PNG、GIF、WebP）'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// Upload image
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择要上传的图片' });
  }

  const url = `${BASE_URL}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// Upload avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择要上传的头像' });
  }

  const url = `${BASE_URL}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小不能超过10MB' });
    }
    return res.status(400).json({ error: '文件上传失败' });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;

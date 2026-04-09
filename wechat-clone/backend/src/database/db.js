const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'wechat.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDB() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      nickname TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      wechat_id TEXT UNIQUE,
      bio TEXT DEFAULT '',
      region TEXT DEFAULT '',
      cover_photo TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, friend_id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      last_message TEXT DEFAULT '',
      last_message_time DATETIME,
      UNIQUE(user1_id, user2_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS moments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT,
      images TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS moment_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      moment_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(moment_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS moment_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      moment_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      reply_to_id INTEGER,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed demo users
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count === 0) {
    const demoUsers = [
      { phone: '13800000001', nickname: '张伟', wechat_id: 'zhangwei001', region: '北京', bio: '生活就是要快乐' },
      { phone: '13800000002', nickname: '李娜', wechat_id: 'lina002', region: '上海', bio: '摄影爱好者' },
      { phone: '13800000003', nickname: '王芳', wechat_id: 'wangfang003', region: '广州', bio: '美食探索者' },
      { phone: '13800000004', nickname: '刘洋', wechat_id: 'liuyang004', region: '深圳', bio: '代码改变世界' },
      { phone: '13800000005', nickname: '陈静', wechat_id: 'chenjing005', region: '成都', bio: '爱旅行爱生活' },
    ];

    const insertUser = db.prepare(
      'INSERT INTO users (phone, nickname, password_hash, wechat_id, region, bio) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const passwordHash = bcrypt.hashSync('123456', 10);

    const insertMany = db.transaction((users) => {
      for (const user of users) {
        insertUser.run(user.phone, user.nickname, passwordHash, user.wechat_id, user.region, user.bio);
      }
    });

    insertMany(demoUsers);

    // Create friendships between demo users
    const insertFriendship = db.prepare(
      'INSERT OR IGNORE INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)'
    );

    const friendPairs = [
      [1, 2], [1, 3], [1, 4], [2, 3], [2, 5], [3, 4], [4, 5]
    ];

    const insertFriendships = db.transaction((pairs) => {
      for (const [uid, fid] of pairs) {
        insertFriendship.run(uid, fid, 'accepted');
        insertFriendship.run(fid, uid, 'accepted');
      }
    });

    insertFriendships(friendPairs);

    // Create conversations and seed messages
    const insertConv = db.prepare(
      'INSERT OR IGNORE INTO conversations (user1_id, user2_id, last_message, last_message_time) VALUES (?, ?, ?, ?)'
    );
    const insertMsg = db.prepare(
      'INSERT INTO messages (conversation_id, sender_id, content, type, is_read) VALUES (?, ?, ?, ?, ?)'
    );
    const updateConv = db.prepare(
      'UPDATE conversations SET last_message = ?, last_message_time = ? WHERE id = ?'
    );

    const seedConversations = db.transaction(() => {
      // Conv between user 1 and 2
      insertConv.run(1, 2, '好的，明天见！', new Date().toISOString());
      const conv12 = db.prepare('SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 2').get();
      insertMsg.run(conv12.id, 1, '嗨，最近怎么样？', 'text', 1);
      insertMsg.run(conv12.id, 2, '挺好的，你呢？', 'text', 1);
      insertMsg.run(conv12.id, 1, '我最近在学习新技术', 'text', 1);
      insertMsg.run(conv12.id, 2, '好的，明天见！', 'text', 1);
      updateConv.run('好的，明天见！', new Date().toISOString(), conv12.id);

      // Conv between user 1 and 3
      insertConv.run(1, 3, '周末一起去吃火锅吧', new Date(Date.now() - 3600000).toISOString());
      const conv13 = db.prepare('SELECT id FROM conversations WHERE user1_id = 1 AND user2_id = 3').get();
      insertMsg.run(conv13.id, 3, '你好！', 'text', 1);
      insertMsg.run(conv13.id, 1, '你好，最近有什么好吃的推荐吗？', 'text', 1);
      insertMsg.run(conv13.id, 3, '周末一起去吃火锅吧', 'text', 0);
      updateConv.run('周末一起去吃火锅吧', new Date(Date.now() - 3600000).toISOString(), conv13.id);

      // Conv between user 2 and 4
      insertConv.run(2, 4, '代码已经提交了', new Date(Date.now() - 7200000).toISOString());
      const conv24 = db.prepare('SELECT id FROM conversations WHERE user1_id = 2 AND user2_id = 4').get();
      insertMsg.run(conv24.id, 4, '嗨，那个项目你看了吗？', 'text', 1);
      insertMsg.run(conv24.id, 2, '代码已经提交了', 'text', 1);
      updateConv.run('代码已经提交了', new Date(Date.now() - 7200000).toISOString(), conv24.id);
    });

    seedConversations();

    // Seed moments
    const insertMoment = db.prepare(
      'INSERT INTO moments (user_id, content, images) VALUES (?, ?, ?)'
    );
    const insertLike = db.prepare(
      'INSERT OR IGNORE INTO moment_likes (moment_id, user_id) VALUES (?, ?)'
    );
    const insertComment = db.prepare(
      'INSERT INTO moment_comments (moment_id, user_id, content) VALUES (?, ?, ?)'
    );

    const seedMoments = db.transaction(() => {
      const m1 = insertMoment.run(1, '今天天气真好，出去走走！🌞', '[]');
      const m2 = insertMoment.run(2, '新拍的照片，感觉还不错 📷', JSON.stringify([]));
      const m3 = insertMoment.run(3, '今天做了一道新菜，味道超棒！🍜', '[]');
      const m4 = insertMoment.run(4, '终于把这个功能做完了，累死了💻', '[]');
      const m5 = insertMoment.run(5, '成都的天气最近真的很舒服 🌈', '[]');
      const m6 = insertMoment.run(1, '周末愉快！和朋友们一起聚餐 🎉', '[]');

      // Add likes
      insertLike.run(m1.lastInsertRowid, 2);
      insertLike.run(m1.lastInsertRowid, 3);
      insertLike.run(m1.lastInsertRowid, 4);
      insertLike.run(m2.lastInsertRowid, 1);
      insertLike.run(m2.lastInsertRowid, 5);
      insertLike.run(m3.lastInsertRowid, 1);
      insertLike.run(m3.lastInsertRowid, 2);
      insertLike.run(m4.lastInsertRowid, 2);
      insertLike.run(m5.lastInsertRowid, 1);
      insertLike.run(m5.lastInsertRowid, 3);
      insertLike.run(m6.lastInsertRowid, 2);
      insertLike.run(m6.lastInsertRowid, 3);
      insertLike.run(m6.lastInsertRowid, 5);

      // Add comments
      insertComment.run(m1.lastInsertRowid, 2, '好棒！在哪里？');
      insertComment.run(m1.lastInsertRowid, 1, '就在附近公园~');
      insertComment.run(m3.lastInsertRowid, 1, '看起来好好吃！');
      insertComment.run(m3.lastInsertRowid, 2, '教我做！');
      insertComment.run(m4.lastInsertRowid, 1, '辛苦了！');
      insertComment.run(m4.lastInsertRowid, 5, '大神！');
    });

    seedMoments();

    console.log('数据库初始化完成，演示数据已创建');
  }
}

initDB();

module.exports = db;

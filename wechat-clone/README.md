# 微信克隆 (WeChat Clone)

一个基于 React + Node.js 的微信克隆项目，实现了微信核心功能，包括即时通讯、朋友圈、通讯录等。

## 项目介绍

本项目是微信主要功能的全栈克隆实现，采用移动端优先设计（最大宽度 390px），模拟真实微信的 UI 风格和交互体验。

## 功能列表

### 账号系统
- ✅ 手机号注册（11位）
- ✅ 账号密码登录
- ✅ JWT Token 认证（7天有效期）
- ✅ 5个演示账号预置

### 即时通讯（微信）
- ✅ 会话列表（头像、昵称、最后消息、时间、未读数）
- ✅ 实时 1v1 聊天（Socket.io）
- ✅ 文字消息
- ✅ 图片消息（上传显示）
- ✅ 语音消息（UI占位）
- ✅ 消息气泡（右绿左白）
- ✅ 每5分钟显示时间戳
- ✅ 长按菜单（复制、转发、删除 UI）
- ✅ 新消息自动滚动到底部
- ✅ 正在输入提示

### 通讯录
- ✅ 字母分组列表（A-Z + #）
- ✅ 搜索联系人
- ✅ 发送好友申请（附带消息）
- ✅ 接受/拒绝好友申请
- ✅ 联系人详情页
- ✅ 好友申请角标提示

### 发现
- ✅ 朋友圈入口
- ✅ 视频号、直播
- ✅ 扫一扫、摇一摇
- ✅ 附近的人、购物、游戏

### 朋友圈
- ✅ 好友动态 Feed（按时间倒序）
- ✅ 发布纯文字动态
- ✅ 发布图文动态（最多9张图）
- ✅ 点赞（显示点赞人昵称）
- ✅ 评论（支持回复）
- ✅ 封面图 + 头像展示

### 我（Profile）
- ✅ 个人信息卡片（头像、昵称、微信号、二维码）
- ✅ 功能菜单（收藏、朋友圈、视频号、卡包、表情）
- ✅ 设置入口

### 设置
- ✅ 账号与安全、通知、隐私、通用、关于微信
- ✅ 编辑个人资料（昵称、签名、地区、微信号）
- ✅ 更换头像
- ✅ 退出登录

## 技术栈

### 前端
- React 18 + Vite 5
- TailwindCSS 3
- Zustand（状态管理）
- React Router DOM v6
- Axios（HTTP 请求）
- Socket.io-client（实时通讯）

### 后端
- Node.js + Express 4
- Socket.io 4（WebSocket 实时通讯）
- better-sqlite3（SQLite 数据库）
- bcryptjs（密码加密）
- jsonwebtoken（JWT 认证）
- multer（文件上传）

### 数据库
- SQLite（文件存储：`backend/data/wechat.db`）

### 部署
- Docker + Docker Compose
- Nginx（前端静态文件 + 反向代理）

## 本地运行

### 前置要求
- Node.js 18+
- npm 或 yarn

### 安装依赖并启动

**方式一：分别启动（推荐开发）**

```bash
# 1. 启动后端
cd wechat-clone/backend
npm install
npm run dev
# 后端运行在 http://localhost:3001

# 2. 新开终端，启动前端
cd wechat-clone/frontend
npm install
npm run dev
# 前端运行在 http://localhost:5173
```

**方式二：同时启动**

```bash
# 安装根目录依赖管理工具（可选）
# 后端
cd backend && npm install && npm run dev &
# 前端
cd ../frontend && npm install && npm run dev
```

### 访问
打开浏览器访问 `http://localhost:5173`

## Docker 部署

### 前置要求
- Docker 20+
- Docker Compose v2+

### 一键部署

```bash
cd wechat-clone
docker-compose up -d
```

### 访问
- 前端：`http://localhost`（端口 80）
- 后端 API：`http://localhost:3001`

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看后端日志
docker-compose logs -f backend

# 查看前端日志
docker-compose logs -f frontend
```

### 停止服务

```bash
docker-compose down
```

## 演示账号

首次启动时自动创建以下演示账号：

| 手机号 | 密码 | 昵称 | 地区 |
|--------|------|------|------|
| 13800000001 | 123456 | 张伟 | 北京 |
| 13800000002 | 123456 | 李娜 | 上海 |
| 13800000003 | 123456 | 王芳 | 广州 |
| 13800000004 | 123456 | 刘洋 | 深圳 |
| 13800000005 | 123456 | 陈静 | 成都 |

> 演示账号之间已预置好友关系、聊天记录和朋友圈内容

## 二次开发指南

### 项目结构说明

```
wechat-clone/
├── frontend/src/
│   ├── api/index.js          # API 请求封装（axios）
│   ├── socket.js             # Socket.io 客户端单例
│   ├── store/index.js        # Zustand 全局状态
│   ├── pages/                # 页面组件
│   └── components/           # 通用组件
├── backend/src/
│   ├── database/db.js        # SQLite 初始化 + 数据库操作
│   ├── middleware/auth.js    # JWT 认证中间件
│   ├── routes/               # API 路由
│   └── socket/index.js       # Socket.io 事件处理
└── docker-compose.yml
```

### 添加新功能

1. **新 API 接口**：在 `backend/src/routes/` 下创建路由文件，在 `backend/src/index.js` 中注册
2. **新数据库表**：在 `backend/src/database/db.js` 的 `initDB()` 函数中添加 `CREATE TABLE` 语句
3. **新前端页面**：在 `frontend/src/pages/` 下创建组件，在 `frontend/src/App.jsx` 中添加路由
4. **新全局状态**：在 `frontend/src/store/index.js` 中添加 state 和 actions

### 环境变量

**后端**（`backend/.env`）：
```env
PORT=3001
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:3001
```

**前端**（`frontend/.env`）：
```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### 数据库管理

SQLite 数据库文件位于 `backend/data/wechat.db`，可用 [DB Browser for SQLite](https://sqlitebrowser.org/) 查看和编辑。

### 生产部署注意事项

1. 修改 `JWT_SECRET` 为强随机字符串
2. 配置 HTTPS（建议使用 Nginx + Let's Encrypt）
3. 定期备份 `backend/data/` 和 `backend/uploads/` 目录
4. 考虑将文件上传迁移至对象存储（如 OSS、S3）

## License

MIT

# WeChat Clone Demo（微信克隆演示项目）

一个基于 **React + Node.js** 的全栈演示项目，目标是复刻微信核心交互流程（聊天、通讯录、朋友圈、个人中心等），用于学习与产品 demo 展示。

## 项目定位

- 这是一个**学习 / 演示用途**的 clone 项目，不是微信官方客户端。
- 重点在于展示：  
  1) 前端交互体验  
  2) 后端 API 与实时通信  
  3) 前后端协作的数据流

---

## 功能概览

### 账号系统
- 手机号注册（11位）
- 账号密码登录
- JWT 认证（7天有效）
- 预置演示账号

### 即时通讯
- 会话列表（头像、昵称、最后消息、时间、未读）
- 1v1 实时聊天（Socket.io）
- 文本 / 图片消息
- 输入中提示、自动滚动到底部

### 通讯录
- 联系人字母分组
- 搜索联系人
- 发送 / 接收好友申请
- 联系人详情页

### 朋友圈
- 动态 Feed（时间倒序）
- 发布文字 / 图文动态
- 点赞、评论、回复

### 我 / 设置
- 个人资料展示与编辑
- 头像修改
- 账号设置与退出登录

---

## 技术栈

### 前端（Frontend）
- React 18
- Vite 5
- TailwindCSS 3
- Zustand
- React Router DOM
- Axios
- Socket.io-client

### 后端（Backend）
- Node.js
- Express
- Socket.io
- SQLite（better-sqlite3）
- bcryptjs
- jsonwebtoken
- multer

---

## 目录结构

```text
wechat-clone/
├── frontend/                 # 前端工程（页面、组件、状态管理）
├── backend/                  # 后端工程（API、鉴权、数据库、Socket）
├── docs/                     # 产品文档（PRD/流程/演示脚本）
├── docker-compose.yml        # Docker 一键启动（如需）
└── README.md
本地启动（开发模式）
需安装：Node.js 18+、npm

1) 启动后端
cd backend
npm install
npm run dev
后端默认地址：http://localhost:3001

2) 启动前端（新开一个终端）
cd frontend
npm install
npm run dev
前端默认地址：http://localhost:5173

3) 浏览器访问
http://localhost:5173
Docker 启动（可选）
docker-compose up -d
常见地址：

前端：http://localhost
后端 API：http://localhost:3001
停止服务：

docker-compose down
演示账号（Demo）
首次启动后会自动创建（若项目脚本已包含初始化逻辑）

手机号	密码	昵称
13800000001
123456
张伟
13800000002
123456
李娜
13800000003
123456
王芳
13800000004
123456
刘洋
13800000005
123456
陈静
环境变量说明
后端 backend/.env
PORT=3001
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:3001
前端 frontend/.env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
数据与文件
数据库默认位于：backend/data/
上传文件默认位于：backend/uploads/
仓库通过 .gitignore 忽略运行期文件（仅保留需要的演示数据）
产品 Demo 说明（建议）
为方便面试/汇报演示，建议按以下路径讲解：

登录（账号系统）
聊天（实时消息）
通讯录（好友关系）
朋友圈（内容互动）
我 / 设置（个人资料）
Roadmap（后续可选）
群聊能力
消息已读回执
消息撤回
更完整的异常状态处理（空态、失败态、无网态）
CI/CD 自动化部署
License
MIT


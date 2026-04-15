import axios from 'axios';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && window.location.hostname.includes('github.io'));
const DEMO_STATE_KEY = 'wechat_demo_state_v1';

function getApiBase() {
  const v = import.meta.env.VITE_API_URL;
  if (v !== undefined && v !== '') return v;
  return import.meta.env.DEV ? 'http://localhost:3001' : '';
}

const BASE_URL = getApiBase();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wechat_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wechat_token');
      localStorage.removeItem('wechat_user');
      const loginPath = `${import.meta.env.BASE_URL}login`;
      window.location.href = loginPath;
    }
    return Promise.reject(error);
  },
);

function ok(data) {
  return Promise.resolve({ data });
}

function apiError(message, status = 400) {
  const err = new Error(message);
  err.response = { status, data: { error: message } };
  return Promise.reject(err);
}

function nowIso() {
  return new Date().toISOString();
}

function createDemoState() {
  const users = [
    { id: 1, phone: '13800000001', nickname: '张伟', password: '123456', avatar: '', wechat_id: 'zhangwei001', region: '北京', bio: '生活就是要快乐', cover_photo: '' },
    { id: 2, phone: '13800000002', nickname: '李娜', password: '123456', avatar: '', wechat_id: 'lina002', region: '上海', bio: '摄影爱好者', cover_photo: '' },
    { id: 3, phone: '13800000003', nickname: '王芳', password: '123456', avatar: '', wechat_id: 'wangfang003', region: '广州', bio: '美食探索者', cover_photo: '' },
    { id: 4, phone: '13800000004', nickname: '刘洋', password: '123456', avatar: '', wechat_id: 'liuyang004', region: '深圳', bio: '代码改变世界', cover_photo: '' },
    { id: 5, phone: '13800000005', nickname: '陈静', password: '123456', avatar: '', wechat_id: 'chenjing005', region: '成都', bio: '爱旅行爱生活', cover_photo: '' },
  ];

  const friendships = [
    { id: 1, user_id: 1, friend_id: 2, status: 'accepted', created_at: nowIso() },
    { id: 2, user_id: 1, friend_id: 3, status: 'accepted', created_at: nowIso() },
    { id: 3, user_id: 2, friend_id: 3, status: 'accepted', created_at: nowIso() },
    { id: 4, user_id: 4, friend_id: 1, status: 'pending', created_at: nowIso() },
  ];

  const messages = [
    { id: 1, sender_id: 2, receiver_id: 1, content: '晚上一起吃饭吗？', type: 'text', is_read: 0, created_at: new Date(Date.now() - 3600_000).toISOString() },
    { id: 2, sender_id: 1, receiver_id: 2, content: '可以，7点见。', type: 'text', is_read: 1, created_at: new Date(Date.now() - 3500_000).toISOString() },
    { id: 3, sender_id: 3, receiver_id: 1, content: '周末去拍照吗？', type: 'text', is_read: 0, created_at: new Date(Date.now() - 7200_000).toISOString() },
  ];

  const moments = [
    {
      id: 1,
      user_id: 2,
      content: '今天的晚霞太美了！',
      images: [],
      created_at: new Date(Date.now() - 86_400_000).toISOString(),
      likes: [1, 3],
      comments: [{ id: 1, user_id: 1, reply_to_id: null, content: '确实很好看', created_at: new Date(Date.now() - 80_000_000).toISOString() }],
    },
    {
      id: 2,
      user_id: 1,
      content: '上线了一个可交互产品 demo，开心！',
      images: [],
      created_at: new Date(Date.now() - 30_000_000).toISOString(),
      likes: [2],
      comments: [],
    },
  ];

  return {
    nextUserId: 6,
    nextFriendshipId: 5,
    nextMessageId: 4,
    nextMomentId: 3,
    nextCommentId: 2,
    users,
    friendships,
    messages,
    moments,
  };
}

function getState() {
  const raw = localStorage.getItem(DEMO_STATE_KEY);
  if (raw) return JSON.parse(raw);
  const init = createDemoState();
  localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(init));
  return init;
}

function saveState(state) {
  localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
}

function getTokenUserId() {
  const token = localStorage.getItem('wechat_token') || '';
  const m = token.match(/^demo-token-(\d+)$/);
  return m ? Number(m[1]) : null;
}

function requireDemoUser(state) {
  const userId = getTokenUserId();
  if (!userId) return null;
  return state.users.find((u) => u.id === userId) || null;
}

function publicUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

function findFriendship(state, a, b) {
  return state.friendships.find((f) =>
    (f.user_id === a && f.friend_id === b) || (f.user_id === b && f.friend_id === a),
  );
}

function buildConversation(state, me, other) {
  const pairMessages = state.messages
    .filter((m) =>
      (m.sender_id === me.id && m.receiver_id === other.id) ||
      (m.sender_id === other.id && m.receiver_id === me.id),
    )
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const last = pairMessages[pairMessages.length - 1];
  const unread = pairMessages.filter((m) => m.sender_id === other.id && m.is_read === 0).length;
  const minId = Math.min(me.id, other.id);
  const maxId = Math.max(me.id, other.id);
  return {
    id: Number(`${minId}${maxId}`),
    user1_id: minId,
    user2_id: maxId,
    other_user_id: other.id,
    nickname: other.nickname,
    avatar: other.avatar,
    last_message: last?.content || '',
    last_message_time: last?.created_at || null,
    unread_count: unread,
  };
}

function buildMomentView(state, me, moment) {
  const author = state.users.find((u) => u.id === moment.user_id);
  return {
    id: moment.id,
    user_id: moment.user_id,
    nickname: author?.nickname || '用户',
    avatar: author?.avatar || '',
    content: moment.content,
    images: Array.isArray(moment.images) ? moment.images : [],
    created_at: moment.created_at,
    liked_by_me: moment.likes.includes(me.id),
    likes: moment.likes
      .map((uid) => state.users.find((u) => u.id === uid))
      .filter(Boolean)
      .map((u) => ({ id: u.id, nickname: u.nickname })),
    comments: moment.comments.map((c) => {
      const u = state.users.find((x) => x.id === c.user_id);
      const reply = c.reply_to_id ? state.users.find((x) => x.id === c.reply_to_id) : null;
      return {
        id: c.id,
        user_id: c.user_id,
        nickname: u?.nickname || '用户',
        reply_to_id: c.reply_to_id,
        reply_to_nickname: reply?.nickname || null,
        content: c.content,
        created_at: c.created_at,
      };
    }),
  };
}

function uploadFromFormData(formData, key) {
  const file = formData.get(key);
  if (!file) return null;
  return URL.createObjectURL(file);
}

const demoAPI = {
  auth: {
    register(data) {
      const state = getState();
      if (state.users.some((u) => u.phone === data.phone)) return apiError('手机号已注册', 409);
      const newUser = {
        id: state.nextUserId++,
        phone: data.phone,
        nickname: data.nickname,
        password: data.password,
        avatar: '',
        wechat_id: `wx${data.phone.slice(-6)}`,
        bio: '',
        region: '',
        cover_photo: '',
      };
      state.users.push(newUser);
      saveState(state);
      const token = `demo-token-${newUser.id}`;
      return ok({ token, user: publicUser(newUser) });
    },
    login(data) {
      const state = getState();
      const user = state.users.find((u) => u.phone === data.phone && u.password === data.password);
      if (!user) return apiError('账号或密码错误', 401);
      const token = `demo-token-${user.id}`;
      return ok({ token, user: publicUser(user) });
    },
    me() {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('登录状态已过期', 401);
      return ok(publicUser(me));
    },
  },
  users: {
    search(q) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const kw = String(q || '').toLowerCase();
      const list = state.users
        .filter((u) => u.id !== me.id && (u.nickname.toLowerCase().includes(kw) || u.phone.includes(kw)))
        .map(publicUser);
      return ok(list);
    },
    updateProfile(data) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      me.nickname = data.nickname ?? me.nickname;
      me.bio = data.bio ?? me.bio;
      me.region = data.region ?? me.region;
      me.wechat_id = data.wechat_id ?? me.wechat_id;
      saveState(state);
      return ok(publicUser(me));
    },
    updateAvatar(data) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      me.avatar = data.avatar || me.avatar;
      saveState(state);
      return ok(publicUser(me));
    },
    updateCover(data) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      me.cover_photo = data.cover_photo || me.cover_photo;
      saveState(state);
      return ok(publicUser(me));
    },
  },
  contacts: {
    getContacts() {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const ids = state.friendships
        .filter((f) => f.status === 'accepted' && (f.user_id === me.id || f.friend_id === me.id))
        .map((f) => (f.user_id === me.id ? f.friend_id : f.user_id));
      const list = state.users.filter((u) => ids.includes(u.id)).map(publicUser);
      return ok(list);
    },
    addContact(data) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const targetId = Number(data.userId);
      if (!state.users.some((u) => u.id === targetId)) return apiError('用户不存在', 404);
      const existing = findFriendship(state, me.id, targetId);
      if (existing) return apiError(existing.status === 'accepted' ? '已经是好友' : '申请已发送', 409);
      state.friendships.push({
        id: state.nextFriendshipId++,
        user_id: me.id,
        friend_id: targetId,
        status: 'pending',
        created_at: nowIso(),
      });
      saveState(state);
      return ok({ success: true });
    },
    getRequests() {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const reqs = state.friendships
        .filter((f) => f.friend_id === me.id && f.status === 'pending')
        .map((f) => {
          const from = state.users.find((u) => u.id === f.user_id);
          return { id: f.id, from_user_id: f.user_id, nickname: from?.nickname || '用户' };
        });
      return ok(reqs);
    },
    acceptRequest(id) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const req = state.friendships.find((f) => f.id === Number(id) && f.friend_id === me.id);
      if (!req) return apiError('申请不存在', 404);
      req.status = 'accepted';
      saveState(state);
      return ok({ success: true });
    },
    rejectRequest(id) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      state.friendships = state.friendships.filter((f) => !(f.id === Number(id) && f.friend_id === me.id));
      saveState(state);
      return ok({ success: true });
    },
    getContact(id) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const contact = state.users.find((u) => u.id === Number(id));
      if (!contact) return apiError('联系人不存在', 404);
      const relation = findFriendship(state, me.id, contact.id);
      return ok({
        ...publicUser(contact),
        friendship: relation ? { status: relation.status } : null,
      });
    },
  },
  messages: {
    getConversations() {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const friendIds = state.friendships
        .filter((f) => f.status === 'accepted' && (f.user_id === me.id || f.friend_id === me.id))
        .map((f) => (f.user_id === me.id ? f.friend_id : f.user_id));
      const convs = friendIds
        .map((id) => state.users.find((u) => u.id === id))
        .filter(Boolean)
        .map((friend) => buildConversation(state, me, friend))
        .sort((a, b) => new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0));
      return ok(convs);
    },
    getMessages(userId) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const targetId = Number(userId);
      const target = state.users.find((u) => u.id === targetId);
      if (!target) return apiError('会话不存在', 404);
      const list = state.messages
        .filter((m) =>
          (m.sender_id === me.id && m.receiver_id === targetId) ||
          (m.sender_id === targetId && m.receiver_id === me.id),
        )
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((m) => {
          const sender = state.users.find((u) => u.id === m.sender_id);
          return {
            ...m,
            conversation_id: Number(`${Math.min(me.id, targetId)}${Math.max(me.id, targetId)}`),
            sender_nickname: sender?.nickname || '用户',
            sender_avatar: sender?.avatar || '',
          };
        });
      return ok(list);
    },
    sendMessage(userId, data) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const targetId = Number(userId);
      if (!state.users.some((u) => u.id === targetId)) return apiError('接收方不存在', 404);
      const message = {
        id: state.nextMessageId++,
        sender_id: me.id,
        receiver_id: targetId,
        content: data.content,
        type: data.type || 'text',
        is_read: 0,
        created_at: nowIso(),
      };
      state.messages.push(message);
      saveState(state);
      return ok(message);
    },
    markRead(userId) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const targetId = Number(userId);
      state.messages.forEach((m) => {
        if (m.sender_id === targetId && m.receiver_id === me.id) m.is_read = 1;
      });
      saveState(state);
      return ok({ success: true });
    },
  },
  moments: {
    getFeed() {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const visibleIds = new Set([me.id]);
      state.friendships
        .filter((f) => f.status === 'accepted' && (f.user_id === me.id || f.friend_id === me.id))
        .forEach((f) => visibleIds.add(f.user_id === me.id ? f.friend_id : f.user_id));
      const feed = state.moments
        .filter((m) => visibleIds.has(m.user_id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((m) => buildMomentView(state, me, m));
      return ok(feed);
    },
    getUserMoments(userId) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const list = state.moments
        .filter((m) => m.user_id === Number(userId))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((m) => buildMomentView(state, me, m));
      return ok(list);
    },
    createMoment(data) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const row = {
        id: state.nextMomentId++,
        user_id: me.id,
        content: data.content || '',
        images: Array.isArray(data.images) ? data.images : [],
        created_at: nowIso(),
        likes: [],
        comments: [],
      };
      state.moments.unshift(row);
      saveState(state);
      return ok(buildMomentView(state, me, row));
    },
    toggleLike(id) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const row = state.moments.find((m) => m.id === Number(id));
      if (!row) return apiError('动态不存在', 404);
      if (row.likes.includes(me.id)) row.likes = row.likes.filter((uid) => uid !== me.id);
      else row.likes.push(me.id);
      saveState(state);
      return ok({ success: true });
    },
    addComment(id, data) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      const row = state.moments.find((m) => m.id === Number(id));
      if (!row) return apiError('动态不存在', 404);
      row.comments.push({
        id: state.nextCommentId++,
        user_id: me.id,
        reply_to_id: data.replyToId || null,
        content: data.content || '',
        created_at: nowIso(),
      });
      saveState(state);
      return ok({ success: true });
    },
    deleteMoment(id) {
      const state = getState();
      const me = requireDemoUser(state);
      if (!me) return apiError('未登录', 401);
      state.moments = state.moments.filter((m) => !(m.id === Number(id) && m.user_id === me.id));
      saveState(state);
      return ok({ success: true });
    },
  },
  upload: {
    uploadImage(formData) {
      const url = uploadFromFormData(formData, 'image');
      if (!url) return apiError('图片不能为空');
      return ok({ url });
    },
    uploadAvatar(formData) {
      const url = uploadFromFormData(formData, 'avatar');
      if (!url) return apiError('头像不能为空');
      return ok({ url });
    },
  },
};

export const authAPI = {
  register: (data) => (DEMO_MODE ? demoAPI.auth.register(data) : api.post('/api/auth/register', data)),
  login: (data) => (DEMO_MODE ? demoAPI.auth.login(data) : api.post('/api/auth/login', data)),
  me: () => (DEMO_MODE ? demoAPI.auth.me() : api.get('/api/auth/me')),
};

export const usersAPI = {
  search: (q) => (DEMO_MODE ? demoAPI.users.search(q) : api.get('/api/users/search', { params: { q } })),
  updateProfile: (data) => (DEMO_MODE ? demoAPI.users.updateProfile(data) : api.put('/api/users/profile', data)),
  updateAvatar: (data) => (DEMO_MODE ? demoAPI.users.updateAvatar(data) : api.put('/api/users/avatar', data)),
  updateCover: (data) => (DEMO_MODE ? demoAPI.users.updateCover(data) : api.put('/api/users/cover', data)),
};

export const contactsAPI = {
  getContacts: () => (DEMO_MODE ? demoAPI.contacts.getContacts() : api.get('/api/contacts')),
  addContact: (data) => (DEMO_MODE ? demoAPI.contacts.addContact(data) : api.post('/api/contacts/add', data)),
  getRequests: () => (DEMO_MODE ? demoAPI.contacts.getRequests() : api.get('/api/contacts/requests')),
  acceptRequest: (id) => (DEMO_MODE ? demoAPI.contacts.acceptRequest(id) : api.put(`/api/contacts/${id}/accept`)),
  rejectRequest: (id) => (DEMO_MODE ? demoAPI.contacts.rejectRequest(id) : api.put(`/api/contacts/${id}/reject`)),
  getContact: (id) => (DEMO_MODE ? demoAPI.contacts.getContact(id) : api.get(`/api/contacts/${id}`)),
};

export const messagesAPI = {
  getConversations: () => (DEMO_MODE ? demoAPI.messages.getConversations() : api.get('/api/messages/conversations')),
  getMessages: (userId, page = 1) => (DEMO_MODE ? demoAPI.messages.getMessages(userId, page) : api.get(`/api/messages/${userId}`, { params: { page } })),
  sendMessage: (userId, data) => (DEMO_MODE ? demoAPI.messages.sendMessage(userId, data) : api.post(`/api/messages/${userId}`, data)),
  markRead: (userId) => (DEMO_MODE ? demoAPI.messages.markRead(userId) : api.put(`/api/messages/${userId}/read`)),
};

export const momentsAPI = {
  getFeed: (page = 1) => (DEMO_MODE ? demoAPI.moments.getFeed(page) : api.get('/api/moments', { params: { page } })),
  getUserMoments: (userId, page = 1) => (DEMO_MODE ? demoAPI.moments.getUserMoments(userId, page) : api.get(`/api/moments/user/${userId}`, { params: { page } })),
  createMoment: (data) => (DEMO_MODE ? demoAPI.moments.createMoment(data) : api.post('/api/moments', data)),
  toggleLike: (id) => (DEMO_MODE ? demoAPI.moments.toggleLike(id) : api.post(`/api/moments/${id}/like`)),
  addComment: (id, data) => (DEMO_MODE ? demoAPI.moments.addComment(id, data) : api.post(`/api/moments/${id}/comment`, data)),
  deleteMoment: (id) => (DEMO_MODE ? demoAPI.moments.deleteMoment(id) : api.delete(`/api/moments/${id}`)),
};

export const uploadAPI = {
  uploadImage: (formData) => (DEMO_MODE ? demoAPI.upload.uploadImage(formData) : api.post('/api/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
  uploadAvatar: (formData) => (DEMO_MODE ? demoAPI.upload.uploadAvatar(formData) : api.post('/api/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
};

export default api;

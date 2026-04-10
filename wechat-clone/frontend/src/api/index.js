import axios from 'axios';

function getApiBase() {
  const v = import.meta.env.VITE_API_URL;
  if (v !== undefined && v !== '') return v;
  return import.meta.env.DEV ? 'http://localhost:3001' : '';
}

const BASE_URL = getApiBase();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wechat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wechat_token');
      localStorage.removeItem('wechat_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me')
};

// Users
export const usersAPI = {
  search: (q) => api.get('/api/users/search', { params: { q } }),
  updateProfile: (data) => api.put('/api/users/profile', data),
  updateAvatar: (data) => api.put('/api/users/avatar', data),
  updateCover: (data) => api.put('/api/users/cover', data)
};

// Contacts
export const contactsAPI = {
  getContacts: () => api.get('/api/contacts'),
  addContact: (data) => api.post('/api/contacts/add', data),
  getRequests: () => api.get('/api/contacts/requests'),
  acceptRequest: (id) => api.put(`/api/contacts/${id}/accept`),
  rejectRequest: (id) => api.put(`/api/contacts/${id}/reject`),
  getContact: (id) => api.get(`/api/contacts/${id}`)
};

// Messages
export const messagesAPI = {
  getConversations: () => api.get('/api/messages/conversations'),
  getMessages: (userId, page = 1) => api.get(`/api/messages/${userId}`, { params: { page } }),
  sendMessage: (userId, data) => api.post(`/api/messages/${userId}`, data),
  markRead: (userId) => api.put(`/api/messages/${userId}/read`)
};

// Moments
export const momentsAPI = {
  getFeed: (page = 1) => api.get('/api/moments', { params: { page } }),
  getUserMoments: (userId, page = 1) => api.get(`/api/moments/user/${userId}`, { params: { page } }),
  createMoment: (data) => api.post('/api/moments', data),
  toggleLike: (id) => api.post(`/api/moments/${id}/like`),
  addComment: (id, data) => api.post(`/api/moments/${id}/comment`, data),
  deleteMoment: (id) => api.delete(`/api/moments/${id}`)
};

// Upload
export const uploadAPI = {
  uploadImage: (formData) => api.post('/api/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadAvatar: (formData) => api.post('/api/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;

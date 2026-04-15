import { io } from 'socket.io-client';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && window.location.hostname.includes('github.io'));

function getSocketUrl() {
  const v = import.meta.env.VITE_SOCKET_URL;
  if (v !== undefined && v !== '') return v;
  if (import.meta.env.DEV) return 'http://localhost:3001';
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3001';
}

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket(token) {
  if (DEMO_MODE) {
    socket = {
      connected: false,
      on: () => {},
      off: () => {},
      emit: () => {},
      disconnect: () => {},
    };
    return socket;
  }

  if (socket && socket.connected) {
    return socket;
  }

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('Socket 已连接:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket 连接错误:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket 已断开:', reason);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default { getSocket, connectSocket, disconnectSocket };

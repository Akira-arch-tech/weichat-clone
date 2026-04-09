import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket(token) {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
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

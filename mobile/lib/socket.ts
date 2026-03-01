import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// NOTE: 10.0.2.2 is Android emulator localhost. Update for physical device or prod.
const SOCKET_URL = 'http://10.0.2.2:5000';

export const connectSocket = (userId: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    query: { userId },
    transports: ['websocket'],
    autoConnect: true,
    forceNew: true,
  });

  socket.on('connect', () => console.log('[socket] connected:', socket?.id));
  socket.on('disconnect', (reason) => console.log('[socket] disconnected:', reason));
  socket.on('connect_error', (err) => console.error('[socket] connection error:', err.message));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
    console.log('[socket] manually disconnected');
  }
};

export const getSocket = () => socket;

export const emit = (event: string, data?: any) => {
  if (socket?.connected) {
    socket.emit(event, data);
  } else {
    console.warn(`[socket] not connected — dropped event: ${event}`);
  }
};

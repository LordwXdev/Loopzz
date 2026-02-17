import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) socket = io(WS_URL, { transports: ['websocket', 'polling'], autoConnect: true });
  return socket;
};

export const disconnectSocket = () => { if (socket) { socket.disconnect(); socket = null; } };

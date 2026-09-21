import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl && import.meta.env.VITE_API_URL) {
      socketUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    }
    if (!socketUrl) {
      socketUrl = '/';
    }

    socket = io(socketUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

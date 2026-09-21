import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const isBrowser = typeof window !== 'undefined';
    const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl && import.meta.env.VITE_API_URL) {
      socketUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    }
    if (!socketUrl) {
      socketUrl = isLocalhost ? 'http://localhost:5000' : 'https://event-sphere-nnvq.onrender.com';
    }

    socket = io(socketUrl, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

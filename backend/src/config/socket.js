import { Server } from 'socket.io';

let ioInstance = null;

const defaultAllowedOrigins = [
  'https://event-sphere-blush-alpha.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

export const initSocket = (httpServer, origins = defaultAllowedOrigins) => {
  const allowedList = Array.isArray(origins) ? origins : [origins];
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedList.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    // User joins personal room for notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // User joins event room for live attendee count / updates
    socket.on('join_event', (eventId) => {
      if (eventId) {
        socket.join(`event_${eventId}`);
      }
    });

    socket.on('leave_event', (eventId) => {
      if (eventId) {
        socket.leave(`event_${eventId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

export const emitToUser = (userId, eventName, data) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId.toString()}`).emit(eventName, data);
  }
};

export const emitToEvent = (eventId, eventName, data) => {
  if (ioInstance && eventId) {
    ioInstance.to(`event_${eventId.toString()}`).emit(eventName, data);
  }
};

export const emitToAll = (eventName, data) => {
  if (ioInstance) {
    ioInstance.emit(eventName, data);
  }
};

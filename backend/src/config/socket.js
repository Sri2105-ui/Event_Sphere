import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (httpServer, allowedOrigin) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Accept requests from Vercel domains, configured origin, or dev server
        callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

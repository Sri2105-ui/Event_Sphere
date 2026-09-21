import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    if (user && user._id) {
      s.connect();
      s.emit('join_user', user._id);

      s.on('new_notification', (data) => {
        addToast(data.title ? `${data.title}: ${data.message}` : data.message, 'info');
        setUnreadCount((prev) => prev + 1);
      });

      s.on('attendee_checked_in', (data) => {
        if (user.role === 'organizer' || user.role === 'admin') {
          addToast(`🎟️ Checked in: ${data.attendeeName} (${data.checkedInCount}/${data.totalAttendees})`, 'success');
        }
      });
    } else {
      if (s.connected) {
        s.disconnect();
      }
    }

    return () => {
      s.off('new_notification');
      s.off('attendee_checked_in');
    };
  }, [user, addToast]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext) || {};
};

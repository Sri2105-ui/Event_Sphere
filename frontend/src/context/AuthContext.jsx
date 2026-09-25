import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('eventsphere_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('eventsphere_token') || '');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem('eventsphere_user', JSON.stringify(res.data.user));
        }
      } catch (error) {
        console.error('Session sync error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('eventsphere_token', res.data.token);
        localStorage.setItem('eventsphere_user', JSON.stringify(res.data.user));
        addToast(`Welcome back, ${res.data.user.name}!`, 'success');
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('eventsphere_token', res.data.token);
        localStorage.setItem('eventsphere_user', JSON.stringify(res.data.user));
        addToast('Registration successful! Welcome to EventSphere.', 'success');
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('eventsphere_token');
    localStorage.removeItem('eventsphere_user');
    addToast('You have been logged out.', 'info');
  };

  const quickDemoLogin = async (role) => {
    const creds = {
      admin: { email: 'admin@eventsphere.com', pass: 'admin123' },
      organizer: { email: 'organizer@eventsphere.com', pass: 'organizer123' },
      participant: { email: 'student@eventsphere.com', pass: 'student123' }
    };

    const target = creds[role] || creds.participant;
    return await login(target.email, target.pass);
  };

  const switchRole = async (targetRole) => {
    try {
      const res = await api.put('/auth/switch-role', { role: targetRole });
      if (res.data.success) {
        if (res.data.token) {
          setToken(res.data.token);
          localStorage.setItem('eventsphere_token', res.data.token);
        }
        setUser(res.data.user);
        localStorage.setItem('eventsphere_user', JSON.stringify(res.data.user));
        addToast(res.data.message || `Switched role to ${targetRole}!`, 'success');
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to switch role.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('eventsphere_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        quickDemoLogin,
        switchRole,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

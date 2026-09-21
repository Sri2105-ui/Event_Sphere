import axios from 'axios';

// Centralized API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Base API endpoint for all Axios requests
const rawUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const baseURL = rawUrl
  ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventsphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('eventsphere_token');
        localStorage.removeItem('eventsphere_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

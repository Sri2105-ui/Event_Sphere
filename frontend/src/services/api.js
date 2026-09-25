import axios from 'axios';

// Determine environment and backend URL with zero-config fallback
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Resolve the backend API root URL
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If envUrl is provided and we are on localhost, or envUrl is a remote URL
  if (envUrl) {
    const isEnvLocalhost = envUrl.includes('localhost') || envUrl.includes('127.0.0.1');
    if (isLocalhost || !isEnvLocalhost) {
      const raw = envUrl.replace(/\/+$/, '');
      return raw.endsWith('/api') ? raw : `${raw}/api`;
    }
  }
  // If deployed to Vercel or any cloud domain without VITE_API_URL set
  if (isBrowser && !isLocalhost) {
    return 'https://event-sphere-nnvq.onrender.com/api';
  }
  // Local development fallback
  return 'http://localhost:5000/api';
};

const baseURL = getApiBase();
export const API_URL = baseURL.replace(/\/api\/?$/, '');

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

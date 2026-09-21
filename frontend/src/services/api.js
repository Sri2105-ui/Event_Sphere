import axios from 'axios';

// Resolve base API URL dynamically (supports Vercel env variable & local Vite dev proxy)
const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const baseURL = rawApiUrl.startsWith('http') && !rawApiUrl.endsWith('/api')
  ? `${rawApiUrl.replace(/\/+$/, '')}/api`
  : rawApiUrl;

const api = axios.create({
  baseURL,
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

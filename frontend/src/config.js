const isDevelopment = process.env.NODE_ENV === 'development';

// Use relative URLs for API calls
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// Configure axios defaults
import axios from 'axios';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = false; // Set to false for JWT auth

// Add request interceptor to add Authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

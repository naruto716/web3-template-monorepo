import axios from 'axios';

// Base configuration for axios
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
client.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle auth errors
    if (error.response && error.response.status === 401) {
      // Clear token and user data on unauthorized
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default client; 
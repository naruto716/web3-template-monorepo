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
    // You can add auth tokens here
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
    // Handle common errors here
    return Promise.reject(error);
  }
);

export default client; 
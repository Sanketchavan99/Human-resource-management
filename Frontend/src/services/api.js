import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Adjust if backend port differs
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 or token refresh logic here if needed
    return Promise.reject(error);
  }
);

export default api;

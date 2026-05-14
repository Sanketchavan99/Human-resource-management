import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from API
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getCurrentUser();
      if (response?.data?.success && response?.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch current user', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (empCode) => {
    try {
      const response = await api.post('/auth/register', { empCode });

      // If backend returns token and user on login (not just OTP)
      if (response.data?.success && response.data?.token && response.data?.user) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      }

      return response;
    } catch (error) {
      console.log(error);
      return error.response;
    }
  };

  const verifyOtp = async (empCode, otp) => {
    try {
      const response = await api.post('/auth/verify-phone', { empCode, otp });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const setPassword = async (password) => {
    try {
      const response = await api.post('/auth/set-password', { password });
      if (response.data.success) {
        // Update user object to reflect password is now set
        const updatedUser = { ...user, hasPassword: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const loginWithPassword = async (empCode, password) => {
    try {
      const response = await api.post('/auth/login', { empCode, password });
      if (response.data?.success && response.data?.token && response.data?.user) {
        const { token, user } = response.data;
        user.hasPassword = true;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      }
      return response;
    } catch (error) {
      console.log(error);
      return error.response;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, verifyOtp, setPassword, loginWithPassword, logout, loading, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

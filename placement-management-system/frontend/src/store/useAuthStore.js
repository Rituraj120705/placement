import { create } from 'zustand';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      set({ user: userData, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Login failed' 
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { token, ...newUserData } = response.data;
      
      localStorage.setItem('token', token);
      set({ user: newUserData, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Registration failed' 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        get().logout();
        return;
      }
      
      const response = await api.get('/auth/profile');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      console.error(error);
      get().logout();
    }
  }
}));

import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  // Check auth status on initial load
  checkAuth: async () => {
    try {
      const res = await api.get('/users/isLoggedIn');

      set({
        user: res.data.data.user,
        isAuthenticated: res.data.isAuthenticated,
        loading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  // Login handler
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await api.post('/users/login', {
        email,
        password,
      });

      if (res.data.status === 'success') {
        set({
          user: res.data.data.user,
          isAuthenticated: true,
          loading: false,
        });
        return { success: true };
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Login failed';

      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Logout handler
  logout: async () => {
    try {
      await api.post('/users/logout');
      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));

export default useAuthStore;

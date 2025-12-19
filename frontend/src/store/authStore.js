import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  // Check auth status on initial load
  checkAuth: async () => {
    try {
      const res = await axios.get(
        'http://localhost:8000/api/v1/users/isLoggedIn',
        {
          withCredentials: true,
        }
      );
      set({
        user: res.data.data.user,
        isAuthenticated: res.data.isAuthenticated,
        loading: false,
      });
    } catch (error) {
      console.log(error);
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
      const res = await axios.post(
        'http://localhost:8000/api/v1/users/login',
        { email, password },
        { withCredentials: true }
      );

      if (res.data.status === 'success') {
        set({
          user: res.data.data.user,
          isAuthenticated: true,
          loading: false,
        });
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Logout handler
  logout: async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/v1/users/logout',
        {},
        {
          withCredentials: true,
        }
      );
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

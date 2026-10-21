import { defineStore } from 'pinia'
import { AuthService } from '../services/auth.service'
import Cookies from 'js-cookie'
import { resetAppCache } from '@/utils/resetAppCache'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null, // In-memory saja untuk keamanan
    isAuthenticated: false,
    privileges: [],
    isInitialLoading: true
  }),

  actions: {
    async login(credentials) {
      try {
        const data = await AuthService.login(credentials);
        this.setAuthData(data);
        return data;
      } catch (error) {
        console.log(error)
        this.clearAuthData();
        throw error;
      }
    },

    setAuthData({ user, token, privileges, refreshToken }, remember) {
      // Clear data cache dari user sebelumnya
      resetAppCache();

      this.user = user;
      this.accessToken = token;
      this.privileges = privileges;
      this.isAuthenticated = true;

      // Bersihkan data lama agar tidak konflik
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      Cookies.remove('refresh_token');

      // Simpan Access Token di LocalStorage & SessionStorage untuk demo
      localStorage.setItem('accessToken', token || 'mock-token-demo-superadmin-portfolio');
      sessionStorage.setItem('accessToken', token || 'mock-token-demo-superadmin-portfolio');
      if (user) localStorage.setItem('user', JSON.stringify(user));
      if (privileges) localStorage.setItem('privileges', JSON.stringify(privileges));
      Cookies.set('refresh_token', refreshToken || 'mock-refresh-token-demo', { expires: 7, sameSite: 'lax' });
    },

    clearAuthData() {
      this.user = null;
      this.accessToken = null;
      this.isAuthenticated = false;
      this.privileges = [];
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('privileges');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('token');
      Cookies.remove('refresh_token');

      // Clear all app Pinia stores and composable filters
      resetAppCache();
    },

    async attempt() {
      // 1. Ambil data dari storage (Gunakan accessToken sebagai prioritas kunci utama)
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('token');
      const refreshToken = Cookies.get('refresh_token');
      const savedUser = localStorage.getItem('user');
      const savedPrivileges = localStorage.getItem('privileges');



      // 2. Jika tidak ada token sama sekali, bersihkan dan berhenti
      if (!token && !refreshToken) {
        this.clearAuthData();
        this.isInitialLoading = false;
        return;
      }

      // 3. Pre-load data user dari storage jika ada
      if (savedUser) this.user = JSON.parse(savedUser);
      if (savedPrivileges) this.privileges = JSON.parse(savedPrivileges);

      try {
        // 4. Jalankan refresh token (Ambil profile atau jalankan refresh API)
        const data = await AuthService.getProfile(refreshToken);

        // 5. Update data user
        if (data.user) {
          this.user = data.user;
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        if (data.privileges && data.privileges.length > 0) {
          this.privileges = data.privileges;
          localStorage.setItem('privileges', JSON.stringify(data.privileges));
        }

        this.isAuthenticated = true;

        // 6. Simpan access token baru
        if (data.token) {
          this.accessToken = data.token;
          if (localStorage.getItem('accessToken') || localStorage.getItem('token')) {
            localStorage.setItem('accessToken', data.token);
          } else {
            sessionStorage.setItem('accessToken', data.token);
          }
        }

        if (data.refreshToken) {
          Cookies.set('refresh_token', data.refreshToken, { secure: true, sameSite: 'strict' });
        }

      } catch (error) {
        console.error("Session restoration failed:", error);
        
        // JANGAN hapus session jika errornya adalah rate limit (Too Many Requests)
        // karena session aslinya mungkin masih valid, hanya koneksinya dibatasi sementara.
        if (error.response?.status !== 429) {
          this.clearAuthData();
        }
      } finally {
        this.isInitialLoading = false;
      }
    },

    async logout() {
      try {
        await AuthService.logout();
      } finally {
        this.clearAuthData();
      }
    }
  },

    getters: {
      hasPrivilege: (state) => (privilege) => {
        if (!privilege) return true;
        if (state.user?.isAdmin || state.user?.is_superadmin) return true;

        const pLower = privilege.toLowerCase();

        // Check if user has the exact privilege (e.g. 'transaksi:read')
        // OR a broader module privilege (e.g. user has 'transaksi', sidebar asks for 'transaksi:read')
        return state.privileges.some(p => {
          const userPLower = p.toLowerCase();
          return userPLower === pLower ||
                 userPLower === pLower.split(':')[0] ||
                 pLower.startsWith(userPLower + ':') ||
                 userPLower.startsWith(pLower + ':');
        });
      },
    }
})

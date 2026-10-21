import axios from 'axios'
import Cookies from 'js-cookie'
// Import store-nya, tapi JANGAN dipanggil dulu di luar fungsi
import { useLoadingStore } from '@/plugins/stores/loading.store'

import { mockAxiosAdapter } from '@/api/mockApi'

// Pasang adapter mock pada axios global dan axiosInstance
axios.defaults.adapter = mockAxiosAdapter

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  adapter: mockAxiosAdapter,
})

// Request interceptor (Berjalan SEBELUM request berangkat ke backend)
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Panggil Loading Store di SINI (Lazy Calling)
    const loadingStore = useLoadingStore()
    loadingStore.startLoading()

    // 2. Pasang Token
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 3. Jika payload adalah FormData, hapus Content-Type agar Axios
    //    otomatis menetapkan 'multipart/form-data; boundary=...' yang benar.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    // Jika request gagal berangkat, matikan loading
    const loadingStore = useLoadingStore()
    loadingStore.finishLoading()
    return Promise.reject(error)
  }
)

// Response interceptor (Berjalan SETELAH backend membalas)
axiosInstance.interceptors.response.use(
  (response) => {
    // Request berhasil, matikan loading
    const loadingStore = useLoadingStore()
    loadingStore.finishLoading()
    return response
  },
  async (error) => {
    // Request gagal, matikan loading
    const loadingStore = useLoadingStore()
    loadingStore.finishLoading()

    // Mode Frontend-Only: Tangani error network / connection refused secara damai
    if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.warn('[Axios] Suppressed Network Error in demo mode:', error.message)
      return Promise.resolve({
        data: { success: true, data: [], message: 'Simulated success (Demo)' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config || {},
      })
    }

    const originalRequest = error.config;

    // Handle 429 Too Many Requests secara global
    if (error.response?.status === 429) {
      // Import Alert secara dinamis untuk menghindari circular dependency
      const { Alert } = await import('@/plugins/sweetalert')
      
      // Gunakan flag sederhana agar tidak spam toast jika banyak request kena limit barengan
      if (!window._isShowingRateLimitToast) {
        window._isShowingRateLimitToast = true
        Alert.toast('Terlalu banyak permintaan, silakan tunggu sebentar.', 'error')
        setTimeout(() => { window._isShowingRateLimitToast = false }, 5000)
      }
      
      return Promise.reject(error)
    }
    
    // Jika error 401 dan bukan sedang mencoba login/refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      // Cegah infinite loop
      originalRequest._retry = true;

      // Handle simultaneous 401 errors (Request Queueing)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;

      try {
        // Ambil token dari js-cookie (jika tidak httpOnly)
        // Jika httpOnly, browser akan mengirimkan cookie secara otomatis via withCredentials: true
        const refreshToken = Cookies.get('refresh_token');

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, 
          { refresh_token: refreshToken || undefined }, // Kirim jika ada, jika tidak biarkan cookie bekerja
          { 
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const { token, refresh_token: newRefreshToken } = response.data;

        // Simpan Access Token Baru
        const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
        storage.setItem('accessToken', token);

        // Update Refresh Token jika dikembalikan di body (dan bukan httpOnly)
        if (newRefreshToken && !Cookies.get('refresh_token')) {
          Cookies.set('refresh_token', newRefreshToken, { secure: true, sameSite: 'strict' });
        }

        // Jalankan Queue
        isRefreshing = false;
        processQueue(null, token);

        // Jalankan ulang request asli
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        console.error("Critical: Auth Session Expired", refreshError);
        
        // Bersihkan storage & redirect
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        Cookies.remove('refresh_token');
        
        // Hanya redirect jika tidak di halaman login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
)

// Helper untuk Queueing
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.config.headers.Authorization = `Bearer ${token}`;
      prom.resolve(axiosInstance(prom.config));
    }
  });
  refreshQueue = [];
};
export default axiosInstance

import axios from '@/plugins/axios';
import { mapAuthResponse } from '../mapper/auth.mapper';

export const AuthService = {
  async login(credentials) {
    const response = await axios.post('/auth/login', credentials);
    return mapAuthResponse(response.data);
  },

  async getProfile(refreshToken) {
    try {
      const response = await axios.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      return mapAuthResponse(response.data);
    } catch (error) {
      console.error("RefreshToken API Error:", error.response?.data || error.message);
      throw error;
    }
  },

  async logout() {
    return await axios.post('/auth/logout');
  }
};

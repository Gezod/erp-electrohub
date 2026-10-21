import axios from '@/plugins/axios';
import { UserMapper } from './user.mapper';

/**
 * UserService
 * Menangani komunikasi API tingkat sistem untuk manajemen akun dan hak akses.
 */
export const UserService = {
  /**
   * getAll
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/users', { params });
      const rawData = response.data?.data || [];
      const pagination = response.data?.pagination || null;

      return {
        data: rawData.map(UserMapper.toUI),
        pagination
      };
    } catch (error) {
      console.error('UserService.getAll error:', error);
      throw error;
    }
  },

  /**
   * getById
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/users/${id}`);
      return UserMapper.toUI(response.data);
    } catch (error) {
      console.error('UserService.getById error:', error);
      throw error;
    }
  },

  /**
   * create
   */
  create: async (formData, selectedIds = []) => {
    try {
      const payload = UserMapper.toPayloadCreate(formData, selectedIds);
      const response = await axios.post('/users', payload);
      return response.data;
    } catch (error) {
      console.error('UserService.create error:', error);
      throw error;
    }
  },

  /**
   * updateBasic
   */
  updateBasic: async (id, formData) => {
    try {
      const payload = UserMapper.toPayloadUpdateBasic(formData);
      const response = await axios.patch(`/users/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('UserService.updateBasic error:', error);
      throw error;
    }
  },

  /**
   * updateSuperadmin
   */
  updateSuperadmin: async (id, isSuperadmin) => {
    try {
      const payload = UserMapper.toPayloadUpdateSuperadmin(isSuperadmin);
      const response = await axios.patch(`/users/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('UserService.updateSuperadmin error:', error);
      throw error;
    }
  },

  /**
   * updatePassword
   */
  updatePassword: async (id, formData) => {
    try {
      const payload = UserMapper.toPayloadUpdatePassword(formData);
      const response = await axios.patch(`/users/${id}/password`, payload);
      return response.data;
    } catch (error) {
      console.error('UserService.updatePassword error:', error);
      throw error;
    }
  },

  /**
   * updatePermissions
   */
  updatePermissions: async (id, selectedIds) => {
    try {
      const payload = UserMapper.toPayloadPermissions(selectedIds);
      const response = await axios.put(`/users/${id}/permissions`, payload);
      return response.data;
    } catch (error) {
      console.error('UserService.updatePermissions error:', error);
      throw error;
    }
  },

  /**
   * deleteUser
   */
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('UserService.deleteUser error:', error);
      throw error;
    }
  },

  /**
   * getAllPermissions
   */
  getAllPermissions: async () => {
    try {
      const response = await axios.get('/permissions');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('UserService.getAllPermissions error:', error);
      throw error;
    }
  }
};

import axios from '@/plugins/axios';
import { PermissionsMapper } from './permissions.mapper';

/**
 * PermissionsService
 * Menangani komunikasi API untuk master data permissions.
 */
export const PermissionsService = {
  /**
   * getAll
   * Mendapatkan list permissions dengan dukungan filter.
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/permissions', { params });
      const rawData = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || null;

      return {
        data: Array.isArray(rawData) ? rawData.map(PermissionsMapper.toUI) : [],
        pagination
      };
    } catch (error) {
      console.error('PermissionsService.getAll error:', error);
      throw error;
    }
  },

  /**
   * create
   * Membuat permission baru di sistem.
   */
  create: async (formData) => {
    try {
      const payload = PermissionsMapper.toPayloadCreate(formData);
      const response = await axios.post('/permissions', payload);
      return response.data;
    } catch (error) {
      console.error('PermissionsService.create error:', error);
      throw error;
    }
  },

  /**
   * getById
   * Mendapatkan detail permission berdasarkan ID.
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/permissions/${id}`);
      const rawData = response.data?.data || response.data || {};
      return PermissionsMapper.toUI(rawData);
    } catch (error) {
      console.error('PermissionsService.getById error:', error);
      throw error;
    }
  },

  /**
   * update
   * Mengupdate data permission berdasarkan ID.
   */
  update: async (id, formData) => {
    try {
      const payload = PermissionsMapper.toPayloadCreate(formData);
      const response = await axios.put(`/permissions/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('PermissionsService.update error:', error);
      throw error;
    }
  },

  /**
   * delete
   * Menghapus permission berdasarkan ID.
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/permissions/${id}`);
      return response.data;
    } catch (error) {
      console.error('PermissionsService.delete error:', error);
      throw error;
    }
  }
};

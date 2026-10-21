import axios from '@/plugins/axios';
import { ChiefMapper } from './chief.mapper';

/**
 * ChiefService
 * Handler untuk interaksi API modul Organization Chiefs.
 */
export const ChiefService = {
  /**
   * getAll
   * Mendapatkan daftar pimpinan/chief dengan dukungan pagination server-side.
   * params: { page, limit, search, is_active }
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/chiefs', { params });

      const rawData = response.data?.data || [];
      const rawPagination = response.data?.pagination || response.data?.meta || null;

      return {
        data: rawData.map(ChiefMapper.toUI).filter(Boolean),
        pagination: ChiefMapper.toPagination(rawPagination, rawData.length),
      };
    } catch (error) {
      console.error('ChiefService.getAll Error:', error);
      throw error;
    }
  },

  /**
   * getById
   * Mendapatkan detail satu pimpinan.
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/chiefs/${id}`);
      return ChiefMapper.toUI(response.data?.data || response.data);
    } catch (error) {
      console.error('ChiefService.getById Error:', error);
      throw error;
    }
  },

  /**
   * create
   * Menambah pimpinan baru.
   */
  create: async (formData) => {
    try {
      const payload = ChiefMapper.toPayload(formData);
      const response = await axios.post('/chiefs', payload);
      return response.data;
    } catch (error) {
      console.error('ChiefService.create Error:', error);
      throw error;
    }
  },

  /**
   * update
   * Memperbarui informasi pimpinan.
   */
  update: async (id, formData) => {
    try {
      const payload = ChiefMapper.toPayload(formData);
      const response = await axios.put(`/chiefs/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('ChiefService.update Error:', error);
      throw error;
    }
  },

  /**
   * delete
   * Menghapus pimpinan berdasarkan ID.
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/chiefs/${id}`);
      return response.data;
    } catch (error) {
      console.error('ChiefService.delete Error:', error);
      throw error;
    }
  },
};

import axios from '@/plugins/axios';
import { UomMapper } from './uom.mapper';

/**
 * UomService
 * Handler untuk komunikasi API modul Master UOM.
 */
export const UomService = {
  /**
   * getAll
   * Mendapatkan daftar UOM dengan parameter query.
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/uom', { params });
      
      const rawData = response.data?.data || [];
      const pagination = response.data?.pagination || null;

      return {
        data: UomMapper.toUIList(rawData),
        pagination: pagination
      };
    } catch (error) {
      console.error('UomService.getAll Error:', error);
      throw error;
    }
  },

  /**
   * getById
   * Mendapatkan detail satu UOM.
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/uom/${id}`);
      return UomMapper.toUI(response.data);
    } catch (error) {
      console.error('UomService.getById Error:', error);
      throw error;
    }
  },

  /**
   * create
   * Membuat UOM baru.
   */
  create: async (formData) => {
    try {
      const payload = UomMapper.toPayload(formData);
      const response = await axios.post('/uom', payload);
      return response.data;
    } catch (error) {
      console.error('UomService.create Error:', error);
      throw error;
    }
  },

  /**
   * update
   * Memperbarui UOM berdasarkan ID.
   */
  update: async (id, formData) => {
    try {
      const payload = UomMapper.toPayload(formData);
      const response = await axios.put(`/uom/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('UomService.update Error:', error);
      throw error;
    }
  },

  /**
   * delete
   * Menghapus UOM berdasarkan ID.
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/uom/${id}`);
      return response.data;
    } catch (error) {
      console.error('UomService.delete Error:', error);
      throw error;
    }
  }
};

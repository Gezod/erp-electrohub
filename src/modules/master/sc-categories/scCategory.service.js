import axios from '@/plugins/axios';
import { ScCategoryMapper } from './scCategory.mapper';

/**
 * ScCategoryService
 * Handler komunikasi API untuk Master Kategori SKU (Supply Chain).
 */
export const ScCategoryService = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/sc/categories', { params });
      const rawData = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      const pagination = response.data?.pagination || null;

      return {
        data: rawData.map(ScCategoryMapper.toUI),
        pagination: pagination
      };
    } catch (error) {
      console.error('ScCategoryService.getAll Error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`/sc/categories/${id}`);
      const raw = response.data?.data || response.data;
      return ScCategoryMapper.toUI(raw);
    } catch (error) {
      console.error('ScCategoryService.getById Error:', error);
      throw error;
    }
  },

  create: async (formData) => {
    try {
      const payload = ScCategoryMapper.toPayload(formData);
      const response = await axios.post('/sc/categories', payload);
      return response.data;
    } catch (error) {
      console.error('ScCategoryService.create Error:', error);
      throw error;
    }
  },

  update: async (id, formData) => {
    try {
      const payload = ScCategoryMapper.toPayload(formData);
      const response = await axios.put(`/sc/categories/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('ScCategoryService.update Error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`/sc/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('ScCategoryService.delete Error:', error);
      throw error;
    }
  }
};

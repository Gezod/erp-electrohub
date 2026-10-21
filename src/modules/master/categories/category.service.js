import axios from '@/plugins/axios';
import { CategoryMapper } from './category.mapper';

/**
 * CategoryService
 * Handler untuk komunikasi API modul Master Category.
 */
export const CategoryService = {
  /**
   * getAll
   * Mendapatkan daftar kategori dengan parameter query (pagination, search, stock_category).
   */
  getAll: async (params = {}) => {
    try {
      // params: { page, limit, search, stock_category }
      const response = await axios.get('/categories', { params });
      
      const rawData = response.data?.data || [];
      const pagination = response.data?.pagination || null;

      return {
        data: rawData.map(CategoryMapper.toUI),
        pagination: pagination
      };
    } catch (error) {
      console.error('CategoryService.getAll Error:', error);
      throw error;
    }
  },

  /**
   * getById
   * Mendapatkan detail satu kategori (beserta children).
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/categories/${id}`);
      return CategoryMapper.toUI(response.data);
    } catch (error) {
      console.error('CategoryService.getById Error:', error);
      throw error;
    }
  },

  /**
   * create
   * Membuat kategori baru. Payload bisa membawa array children untuk mass create sub-kategori.
   */
  create: async (formData) => {
    try {
      const payload = CategoryMapper.toPayload(formData);
      const response = await axios.post('/categories', payload);
      return response.data;
    } catch (error) {
      console.error('CategoryService.create Error:', error);
      throw error;
    }
  },

  /**
   * update
   * Memperbarui kategori induk (berdasarkan ID).
   */
  update: async (id, formData) => {
    try {
      const payload = CategoryMapper.toPayload(formData);
      const response = await axios.put(`/categories/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('CategoryService.update Error:', error);
      throw error;
    }
  },

  /**
   * delete
   * Soft delete kategori berdasarkan ID.
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('CategoryService.delete Error:', error);
      throw error;
    }
  }
};

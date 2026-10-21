import axios from '@/plugins/axios';
import { CategoryMapper } from '../mapper/category.mapper';

/**
 * Category Service
 * Mengambil data kategori dan sub-kategori dari API.
 */
export const CategoryService = {
  /**
   * Fetch all categories and sub-categories.
   * Menggunakan mapper untuk menstandarisasi output.
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/categories', { params });
      
      // Ambil array data dari response
      const rawData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      
      return CategoryMapper.toUI(rawData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

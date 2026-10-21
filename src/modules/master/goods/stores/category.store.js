import { defineStore } from 'pinia';
import { CategoryService } from '@/modules/master/goods/services/category.service';

/**
 * Category Store
 * Menyimpan state kategori dan sub-kategori untuk digunakan secara global.
 */
export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    isLoading: false,
  }),

  actions: {
    /**
     * fetchCategories
     * Mengambil data dari service dan menyimpannya ke state categories.
     */
    async fetchCategories(params = {}) {
      const hasParams = Object.keys(params).length > 0;
      
      // Return jika sudah ada data dan tidak ada params
      if (!hasParams && this.categories.length > 0) return this.categories;

      this.isLoading = true;
      try {
        const data = await CategoryService.getAll(params);
        this.categories = data;
        return data;
      } catch (error) {
        console.error('Error in category store:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

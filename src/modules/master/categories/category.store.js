import { defineStore } from 'pinia';
import { CategoryService } from './category.service';
import { CategoryMapper } from './category.mapper';

/**
 * useCategoryStore
 * State management untuk modul Master Category.
 */
export const useCategoryStore = defineStore('master-categories-module', {
  state: () => ({
    categories: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    isLoading: false,
    currentCategory: null // Menyimpan data kategori yang sedang diedit/dilihat detailnya
  }),

  actions: {
    /**
     * fetchCategories
     * Mengambil daftar data dari backend berdasarkan filter yang dikirim dari UI.
     */
    async fetchCategories(params = {}) {
      this.isLoading = true;
      try {
        const result = await CategoryService.getAll(params);
        // Map and Flatten the nested structure
        this.categories = CategoryMapper.toUIFlatten(result.data || []);
        if (result.pagination) {
          this.pagination = result.pagination;
        }
      } catch (error) {
        console.error('Pinia: fetchCategories failed', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchCategoryById
     * Mengambil detail lengkap kategori (termasuk children) untuk form edit.
     */
    async fetchCategoryById(id) {
      this.isLoading = true;
      try {
        this.currentCategory = await CategoryService.getById(id);
        return this.currentCategory;
      } catch (error) {
        console.error('Pinia: fetchCategoryById failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createCategory
     * Menangani proses submit data kategori baru.
     */
    async createCategory(formData) {
      this.isLoading = true;
      try {
        const response = await CategoryService.create(formData);
        return response;
      } catch (error) {
        console.error('Pinia: createCategory failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateCategory
     * Menangani proses update data kategori induk.
     */
    async updateCategory(id, formData) {
      this.isLoading = true;
      try {
        const response = await CategoryService.update(id, formData);
        return response;
      } catch (error) {
        console.error('Pinia: updateCategory failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteCategory
     * Menangani proses soft delete.
     */
    async deleteCategory(id) {
      try {
        await CategoryService.delete(id);
      } catch (error) {
        console.error('Pinia: deleteCategory failed', error);
        throw error;
      }
    }
  }
});

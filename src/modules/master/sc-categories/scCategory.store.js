import { defineStore } from 'pinia';
import { ScCategoryService } from './scCategory.service';

/**
 * useScCategoryStore
 * State management untuk modul Master Kategori SKU (Supply Chain).
 */
export const useScCategoryStore = defineStore('sc-categories-module', {
  state: () => ({
    categories: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    isLoading: false,
    currentCategory: null
  }),

  actions: {
    async fetchCategories(params = {}) {
      this.isLoading = true;
      try {
        const result = await ScCategoryService.getAll(params);
        this.categories = result.data || [];
        if (result.pagination) {
          this.pagination = result.pagination;
        }
      } catch (error) {
        console.error('Pinia: fetchCategories failed', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCategoryById(id) {
      this.isLoading = true;
      try {
        this.currentCategory = await ScCategoryService.getById(id);
        return this.currentCategory;
      } catch (error) {
        console.error('Pinia: fetchCategoryById failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createCategory(formData) {
      this.isLoading = true;
      try {
        const response = await ScCategoryService.create(formData);
        await this.fetchCategories();
        return response;
      } catch (error) {
        console.error('Pinia: createCategory failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateCategory(id, formData) {
      this.isLoading = true;
      try {
        const response = await ScCategoryService.update(id, formData);
        await this.fetchCategories();
        return response;
      } catch (error) {
        console.error('Pinia: updateCategory failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteCategory(id) {
      try {
        await ScCategoryService.delete(id);
        await this.fetchCategories();
      } catch (error) {
        console.error('Pinia: deleteCategory failed', error);
        throw error;
      }
    }
  }
});

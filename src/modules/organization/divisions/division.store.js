import { defineStore } from 'pinia';
import { DivisionService } from './division.service';

/**
 * useDivisionStore
 * State management untuk modul Organization Divisions.
 */
export const useDivisionStore = defineStore('organization-divisions-module', {
  state: () => ({
    divisions: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    isLoading: false
  }),

  actions: {
    /**
     * fetchDivisions
     * Mengambil daftar divisi dari server dan menyimpan metadata paginasi.
     */
    async fetchDivisions(params = {}) {
      this.isLoading = true;
      try {
        const result = await DivisionService.getAll(params);
        this.divisions = result.data || [];
        
        const page = Number(params.page) || this.pagination.currentPage || 1;
        const limit = Number(params.limit) || this.pagination.dataPerPage || 10;
        
        if (result.pagination) {
          this.pagination = {
            currentPage: Number(result.pagination.currentPage || result.pagination.page || page),
            dataPerPage: Number(result.pagination.dataPerPage || result.pagination.limit || limit),
            totalData: Number(result.pagination.totalData || result.pagination.total || this.divisions.length),
            totalPages: Number(result.pagination.totalPages || Math.ceil((result.pagination.totalData || result.pagination.total || this.divisions.length) / limit) || 1),
          };
        } else {
          this.pagination = {
            currentPage: page,
            dataPerPage: limit,
            totalData: this.divisions.length,
            totalPages: Math.ceil(this.divisions.length / limit) || 1,
          };
        }
      } catch (error) {
        console.error('Pinia: fetchDivisions failed', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchDivisionById
     * Mengambil detail satu divisi.
     */
    async fetchDivisionById(id) {
      this.isLoading = true;
      try {
        return await DivisionService.getById(id);
      } catch (error) {
        console.error('Pinia: fetchDivisionById failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createDivision
     * Menangani proses submit divisi baru.
     */
    async createDivision(formData) {
      this.isLoading = true;
      try {
        return await DivisionService.create(formData);
      } catch (error) {
        console.error('Pinia: createDivision failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateDivision
     * Menangani proses update data divisi.
     */
    async updateDivision(id, formData) {
      this.isLoading = true;
      try {
        return await DivisionService.update(id, formData);
      } catch (error) {
        console.error('Pinia: updateDivision failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteDivision
     * Menghapus divisi.
     */
    async deleteDivision(id) {
      try {
        await DivisionService.delete(id);
      } catch (error) {
        console.error('Pinia: deleteDivision failed', error);
        throw error;
      }
    }
  }
});

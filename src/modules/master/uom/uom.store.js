import { defineStore } from 'pinia';
import { UomService } from './uom.service';

/**
 * useUomStore
 * State management untuk modul Master UOM.
 */
export const useUomStore = defineStore('master-uom-module', {
  state: () => ({
    uoms: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    isLoading: false,
    currentUom: null
  }),

  actions: {
    /**
     * fetchUoms
     * Mengambil daftar data dari backend.
     */
    async fetchUoms(params = {}) {
      this.isLoading = true;
      try {
        const result = await UomService.getAll(params);
        this.uoms = result.data;
        if (result.pagination) {
          this.pagination = result.pagination;
        }
      } catch (error) {
        console.error('Pinia: fetchUoms failed', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchUomById
     * Mengambil detail satu UOM.
     */
    async fetchUomById(id) {
      this.isLoading = true;
      try {
        this.currentUom = await UomService.getById(id);
        return this.currentUom;
      } catch (error) {
        console.error('Pinia: fetchUomById failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createUom
     * Menangani proses submit data baru.
     */
    async createUom(formData) {
      this.isLoading = true;
      try {
        const response = await UomService.create(formData);
        return response;
      } catch (error) {
        console.error('Pinia: createUom failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateUom
     * Menangani proses update data.
     */
    async updateUom(id, formData) {
      this.isLoading = true;
      try {
        const response = await UomService.update(id, formData);
        return response;
      } catch (error) {
        console.error('Pinia: updateUom failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteUom
     * Menangani proses delete.
     */
    async deleteUom(id) {
      try {
        await UomService.delete(id);
      } catch (error) {
        console.error('Pinia: deleteUom failed', error);
        throw error;
      }
    }
  }
});

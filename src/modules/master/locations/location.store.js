import { defineStore } from 'pinia';
import { LocationService } from './location.service';

/**
 * useLocationStore
 * State management untuk modul Master Lokasi menggunakan Pinia.
 */
export const useLocationStore = defineStore('master-locations-module', {
  state: () => ({
    locations: [],
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
     * fetchLocations
     * Mengambil daftar lokasi dari server.
     */
    async fetchLocations(params = {}) {
      this.isLoading = true;
      try {
        const result = await LocationService.getAll(params);
        this.locations = result.data || [];
        if (result.pagination) {
          this.pagination = result.pagination;
        }
      } catch (error) {
        console.error('Pinia: fetchLocations failed', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchLocationById
     * Mengambil detail satu lokasi (untuk edit/detail view).
     */
    async fetchLocationById(id) {
      this.isLoading = true;
      try {
        return await LocationService.getById(id);
      } catch (error) {
        console.error('Pinia: fetchLocationById failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createLocation
     * Memproses pembuatan data lokasi baru.
     */
    async createLocation(formData) {
      this.isLoading = true;
      try {
        return await LocationService.create(formData);
      } catch (error) {
        console.error('Pinia: createLocation failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateLocation
     * Memproses pembaruan data lokasi yang sudah ada.
     */
    async updateLocation(id, formData) {
      this.isLoading = true;
      try {
        return await LocationService.update(id, formData);
      } catch (error) {
        console.error('Pinia: updateLocation failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteLocation
     * Menghapus lokasi berdasarkan ID.
     */
    async deleteLocation(id) {
      try {
        await LocationService.delete(id);
      } catch (error) {
        console.error('Pinia: deleteLocation failed', error);
        throw error;
      }
    }
  }
});

import { defineStore } from 'pinia';
import { PositionService } from './position.service';
import { PositionMapper } from './position.mapper';

/**
 * usePositionStore
 * State management untuk modul Master Position menggunakan Pinia.
 */
export const usePositionStore = defineStore('master-positions-module', {
  state: () => ({
    positions: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    isLoading: false,
    error: null
  }),

  actions: {
    /**
     * fetchPositions
     * Mengambil daftar posisi dari server dan menyimpan metadata paginasi.
     */
    async fetchPositions(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await PositionService.getAll(params);
        this.positions = (result.data || []).map(PositionMapper.toUI);
        if (result.pagination) {
          this.pagination = result.pagination;
        }
      } catch (error) {
        this.error = 'Gagal memuat data posisi';
        console.error('Pinia: fetchPositions failed', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchById
     * Mengambil detail satu posisi berdasarkan ID (untuk edit view).
     */
    async fetchById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await PositionService.getById(id);
        // Jika API return { data: {...} }, gunakan result.data
        const rawData = result.data || result;
        return PositionMapper.toUI(rawData);
      } catch (error) {
        this.error = 'Gagal memuat detail posisi';
        console.error('Pinia: fetchById failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createPosition
     * Memproses pembuatan data posisi baru.
     */
    async createPosition(formData) {
      this.isLoading = true;
      this.error = null;
      try {
        const payload = PositionMapper.toPayload(formData);
        return await PositionService.create(payload);
      } catch (error) {
        this.error = 'Gagal membuat posisi baru';
        console.error('Pinia: createPosition failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updatePosition
     * Memproses pembaruan data posisi yang sudah ada.
     */
    async updatePosition(id, formData) {
      this.isLoading = true;
      this.error = null;
      try {
        const payload = PositionMapper.toPayload(formData);
        return await PositionService.update(id, payload);
      } catch (error) {
        this.error = 'Gagal memperbarui posisi';
        console.error('Pinia: updatePosition failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deletePosition
     * Menghapus posisi berdasarkan ID.
     */
    async deletePosition(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await PositionService.delete(id);
      } catch (error) {
        this.error = 'Gagal menghapus posisi';
        console.error('Pinia: deletePosition failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

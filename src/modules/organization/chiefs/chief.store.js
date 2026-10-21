import { defineStore } from 'pinia';
import { ChiefService } from './chief.service';

/**
 * useChiefStore
 * State management untuk modul Organization Chiefs menggunakan Pinia.
 */
export const useChiefStore = defineStore('organization-chiefs-module', {
  state: () => ({
    chiefs: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10,
    },
    isLoading: false,
  }),

  actions: {
    /**
     * fetchChiefs
     * Mengambil daftar pimpinan dari server dan menyimpan metadata paginasi.
     */
    async fetchChiefs(params = {}) {
      this.isLoading = true;
      try {
        const result = await ChiefService.getAll(params);
        this.chiefs = result.data || [];

        const page = Number(params.page) || this.pagination.currentPage || 1;
        const limit = Number(params.limit) || this.pagination.dataPerPage || 10;

        if (result.pagination) {
          this.pagination = {
            currentPage: Number(result.pagination.currentPage || result.pagination.page || page),
            dataPerPage: Number(result.pagination.dataPerPage || result.pagination.limit || limit),
            totalData: Number(result.pagination.totalData ?? result.pagination.total ?? this.chiefs.length),
            totalPages: Number(
              result.pagination.totalPages ||
                Math.ceil(
                  Number(result.pagination.totalData ?? result.pagination.total ?? this.chiefs.length) / limit
                ) ||
                1
            ),
          };
        } else {
          this.pagination = {
            currentPage: page,
            dataPerPage: limit,
            totalData: this.chiefs.length,
            totalPages: Math.ceil(this.chiefs.length / limit) || 1,
          };
        }
      } catch (error) {
        console.error('Pinia: fetchChiefs failed', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchChiefById
     * Mengambil detail satu pimpinan.
     */
    async fetchChiefById(id) {
      this.isLoading = true;
      try {
        return await ChiefService.getById(id);
      } catch (error) {
        console.error('Pinia: fetchChiefById failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createChief
     * Menambah data pimpinan baru.
     */
    async createChief(formData) {
      this.isLoading = true;
      try {
        return await ChiefService.create(formData);
      } catch (error) {
        console.error('Pinia: createChief failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateChief
     * Memperbarui data pimpinan.
     */
    async updateChief(id, formData) {
      this.isLoading = true;
      try {
        return await ChiefService.update(id, formData);
      } catch (error) {
        console.error('Pinia: updateChief failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteChief
     * Menghapus pimpinan.
     */
    async deleteChief(id) {
      try {
        await ChiefService.delete(id);
      } catch (error) {
        console.error('Pinia: deleteChief failed', error);
        throw error;
      }
    },
  },
});

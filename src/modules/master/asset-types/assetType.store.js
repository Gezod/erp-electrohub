import { defineStore } from 'pinia';
import { AssetTypeService } from './assetType.service';

/**
 * useAssetTypeStore
 * State management untuk modul Master Asset Type.
 */
export const useAssetTypeStore = defineStore('master-asset-types-module', {
  state: () => ({
    assetTypes: [],
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
     * fetchAssetTypes
     * Mengambil daftar tipe aset berdasarkan parameter pagination dari server.
     */
    async fetchAssetTypes(params = {}) {
      this.isLoading = true;
      try {
        const result = await AssetTypeService.getAll(params);
        this.assetTypes = result.data;
        if (result.pagination) {
          this.pagination = result.pagination;
        }
      } catch (error) {
        console.error('Pinia: fetchAssetTypes failed', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchAssetTypeById
     * Mengambil detail lengkap tipe aset (biasanya untuk form edit).
     */
    async fetchAssetTypeById(id) {
      this.isLoading = true;
      try {
        return await AssetTypeService.getById(id);
      } catch (error) {
        console.error('Pinia: fetchAssetTypeById failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createAssetType
     * Menangani proses submit data tipe aset baru.
     */
    async createAssetType(formData) {
      this.isLoading = true;
      try {
        const response = await AssetTypeService.create(formData);
        return response;
      } catch (error) {
        console.error('Pinia: createAssetType failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateAssetType
     * Menangani proses update data tipe aset.
     */
    async updateAssetType(id, formData) {
      this.isLoading = true;
      try {
        const response = await AssetTypeService.update(id, formData);
        return response;
      } catch (error) {
        console.error('Pinia: updateAssetType failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteAssetType
     * Menangani proses penghapusan data.
     */
    async deleteAssetType(id) {
      try {
        await AssetTypeService.delete(id);
      } catch (error) {
        console.error('Pinia: deleteAssetType failed', error);
        throw error;
      }
    }
  }
});

import { defineStore } from 'pinia';
import { AssetService } from './asset.service';
import { AssetMapper } from './asset.mapper';

/**
 * useAssetStore
 * Pinia store for Assets module.
 */
export const useAssetStore = defineStore('transaction-asset-module', {
  state: () => ({
    assets: [],
    assetDetail: null,
    stats: null,
    transfers: [],
    maintenances: [],
    adjustments: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10,
    },
    isLoading: false,
    error: null,
  }),

  getters: {
    totalAssetCount: (state) => state.pagination.totalData || 0,
  },

  actions: {
    /** Fetch assets list */
    async fetchAssets(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await AssetService.getAll(params);
        this.assets = response.data || [];

        if (response.meta) {
          this.pagination = {
            currentPage: response.meta.page || 1,
            dataPerPage: response.meta.limit || 10,
            totalData: response.meta.total || 0,
            totalPages: response.meta.totalPages || 1,
          };
        } else if (response.pagination) {
          this.pagination = response.pagination;
        }
      } catch (err) {
        this.error = err.message || 'Gagal memuat daftar aset';
        console.error('Store: fetchAssets failed', err);
      } finally {
        this.isLoading = false;
      }
    },

    /** Fetch asset detail */
    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const response = await AssetService.getById(id);
        this.assetDetail = response.data || response;
        return this.assetDetail;
      } catch (err) {
        console.error('Store: fetchDetail failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Fetch asset stats */
    async fetchStats(params = {}) {
      try {
        const response = await AssetService.getStats(params);
        this.stats = response.data || response;
        return this.stats;
      } catch (err) {
        console.error('Store: fetchStats failed', err);
      }
    },

    /** Fetch adjustments history for an asset */
    async fetchAdjustments(id, params = {}) {
      try {
        const response = await AssetService.getAdjustments(id, params);
        this.adjustments = response.data || response;
        return this.adjustments;
      } catch (err) {
        console.error('Store: fetchAdjustments failed', err);
      }
    },

    /** Create asset */
    async createAsset(formData) {
      this.isLoading = true;
      try {
        const payload = AssetMapper.toCreatePayload(formData);
        return await AssetService.create(payload);
      } catch (err) {
        console.error('Store: createAsset failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Update asset */
    async updateAsset(id, formData) {
      this.isLoading = true;
      try {
        const payload = AssetMapper.toUpdatePayload(formData);
        return await AssetService.update(id, payload);
      } catch (err) {
        console.error('Store: updateAsset failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Deactivate asset (soft delete) */
    async deleteAsset(id) {
      this.isLoading = true;
      try {
        await AssetService.delete(id);
        await this.fetchAssets({
          page: this.pagination.currentPage,
          limit: this.pagination.dataPerPage,
        });
      } catch (err) {
        console.error('Store: deleteAsset failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Adjust asset */
    async adjustAsset(id, payload) {
      this.isLoading = true;
      try {
        const response = await AssetService.adjust(id, payload);
        await this.fetchDetail(id);
        return response;
      } catch (err) {
        console.error('Store: adjustAsset failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Transfer asset */
    async transferAsset(id, payload) {
      this.isLoading = true;
      try {
        const response = await AssetService.transfer(id, payload);
        await this.fetchDetail(id);
        return response;
      } catch (err) {
        console.error('Store: transferAsset failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Add maintenance */
    async addMaintenance(id, payload) {
      this.isLoading = true;
      try {
        const response = await AssetService.addMaintenance(id, payload);
        await this.fetchDetail(id);
        return response;
      } catch (err) {
        console.error('Store: addMaintenance failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Export to CSV */
    async exportToCSV(params = {}) {
      try {
        const data = await AssetService.exportCSV(params);
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Asset_Export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error('Store: exportToCSV failed', err);
        throw err;
      }
    }
  },
});

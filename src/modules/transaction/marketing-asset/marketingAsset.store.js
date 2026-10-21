import { defineStore } from 'pinia';
import { MarketingAssetService } from './marketingAsset.service';
import { MarketingAssetMapper } from './marketingAsset.mapper';

export const useMarketingAssetStore = defineStore('marketing-asset-module', {
  state: () => ({
    assets: [],
    assetDetail: null,
    stats: null,
    transfers: [],
    pagination: { totalData: 0, currentPage: 1, totalPages: 1, dataPerPage: 10 },
    isLoading: false,
  }),

  actions: {
    async fetchAssets(params = {}) {
      this.isLoading = true;
      try {
        const res = await MarketingAssetService.getAll(params);
        this.assets = res.data || [];
        if (res.pagination) this.pagination = res.pagination;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDetail(id) {
      this.isLoading = true;
      try {
        this.assetDetail = await MarketingAssetService.getById(id);
        const transferRes = await MarketingAssetService.getTransfers(id);
        // Controller membungkus lewat ok(res, data) → payload ada di .data
        this.transfers = transferRes?.data || (Array.isArray(transferRes) ? transferRes : []);
        return this.assetDetail;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchStats(params = {}) {
      try {
        const res = await MarketingAssetService.getStats(params);
        this.stats = res?.data || res;
        return this.stats;
      } catch (err) {
        console.error('Store: fetchStats failed', err);
      }
    },

    async createAsset(formData) {
      this.isLoading = true;
      try {
        return await MarketingAssetService.create(MarketingAssetMapper.toCreatePayload(formData));
      } finally {
        this.isLoading = false;
      }
    },

    async updateAsset(id, formData) {
      this.isLoading = true;
      try {
        return await MarketingAssetService.update(id, MarketingAssetMapper.toUpdatePayload(formData));
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Soft delete. Refresh list DAN stats — kalau stats tidak ikut di-refresh,
     * kartu "Nonaktif" jadi basi setelah menghapus.
     */
    async deleteAsset(id) {
      this.isLoading = true;
      try {
        await MarketingAssetService.delete(id);
      } finally {
        this.isLoading = false;
      }
    },

    async adjust(id, payload) {
      const res = await MarketingAssetService.adjust(id, payload);
      await this.fetchDetail(id);
      return res;
    },

    async exportToCSV(params = {}) {
      const data = await MarketingAssetService.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Aset_Marketing_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  },
});

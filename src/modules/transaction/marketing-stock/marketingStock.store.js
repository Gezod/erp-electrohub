import { defineStore } from 'pinia';
import { MarketingStockService } from './marketingStock.service';
import { downloadFile } from '@/utils/file';

export const useMarketingStockStore = defineStore('marketing-stock-module', {
  state: () => ({
    stocks: [],
    stockDetail: null,
    movements: [],
    pagination: { totalData: 0, currentPage: 1, totalPages: 1, dataPerPage: 10 },
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchStocks(params = {}) {
      this.isLoading = true;
      try {
        const res = await MarketingStockService.getAll(params);
        this.stocks = res.data || [];
        if (res.pagination) this.pagination = res.pagination;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchDetail — Simpan bentuk snake_case mentah (bukan toUIDetail),
     * detail.vue membacanya langsung. Error dilempar supaya halaman bisa redirect.
     */
    async fetchDetail(id) {
      this.isLoading = true;
      try {
        this.stockDetail = await MarketingStockService.getById(id);
        return this.stockDetail;
      } catch (err) {
        console.error('Store: fetchDetail failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** fetchMovements */
    async fetchMovements(id, params = {}) {
      this.isLoading = true;
      try {
        const res = await MarketingStockService.getMovements(id, { limit: params.limit || 50, ...params });
        this.movements = res.data || [];
      } catch (err) {
        console.error('Store: fetchMovements failed', err);
        this.movements = [];
      } finally {
        this.isLoading = false;
      }
    },

    async addMovement(id, form) {
      this.isLoading = true;
      try {
        const res = await MarketingStockService.addMovement(id, form);
        await Promise.all([this.fetchDetail(id), this.fetchMovements(id)]);
        return res;
      } finally {
        this.isLoading = false;
      }
    },

    async createStock(form) {
      this.isLoading = true;
      try {
        return await MarketingStockService.create(form);
      } finally {
        this.isLoading = false;
      }
    },

    async updateStock(id, form) {
      this.isLoading = true;
      try {
        return await MarketingStockService.update(id, form);
      } finally {
        this.isLoading = false;
      }
    },

    async exportStockToCSV(params = {}) {
      this.isLoading = true;
      try {
        const blob = await MarketingStockService.exportStockCSV(params);
        downloadFile(blob, `Marketing_Stock_Report_${new Date().getTime()}.csv`);
      } catch (err) {
        console.error('exportStockToCSV error', err);
        this.error = 'Gagal mengekspor data stok.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async exportMovementsToCSV(params = {}) {
      this.isLoading = true;
      try {
        const blob = await MarketingStockService.exportMovementCSV(params);
        downloadFile(blob, `Marketing_Stock_Movement_Report_${new Date().getTime()}.csv`);
      } catch (err) {
        console.error('exportMovementsToCSV error', err);
        this.error = 'Gagal mengekspor data mutasi.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

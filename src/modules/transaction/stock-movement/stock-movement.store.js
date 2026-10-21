import { defineStore } from 'pinia';
import { StockMovementLogService } from './stock-movement.service';
import { StockMovementLogMapper } from './stock-movement.mapper';

/**
 * useStockMovementLogStore
 * State untuk halaman "Log Pergerakan Stok" (gabungan stok + perolehan aset).
 */
export const useStockMovementLogStore = defineStore('transaction-stock-movement-module', {
  state: () => ({
    items: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10,
    },
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchItems(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await StockMovementLogService.getAll(params);
        const mapped = StockMovementLogMapper.toUIList(response);
        this.items = mapped.data;
        this.pagination = mapped.pagination;
      } catch (err) {
        this.error = 'Gagal memuat log pergerakan stok';
        console.error('Store: fetchItems (stock-movement-log) failed', err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});

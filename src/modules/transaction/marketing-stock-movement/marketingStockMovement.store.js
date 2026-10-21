import { defineStore } from 'pinia';
import { MarketingStockMovementLogService } from './marketingStockMovement.service';
import { MarketingStockMovementLogMapper } from './marketing-stock-movement.mapper';

/**
 * useMarketingStockMovementLogStore
 * State untuk halaman "Log Pergerakan Stok" Marketing (gabungan stok + perolehan aset).
 */
export const useMarketingStockMovementLogStore = defineStore('marketing-stock-movement-module', {
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
        const response = await MarketingStockMovementLogService.getAll(params);
        const mapped = MarketingStockMovementLogMapper.toUIList(response);
        this.items = mapped.data;
        this.pagination = mapped.pagination;
      } catch (err) {
        this.error = 'Gagal memuat log pergerakan stok marketing';
        console.error('Store: fetchItems (marketing-stock-movement-log) failed', err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});

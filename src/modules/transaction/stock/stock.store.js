import { defineStore } from 'pinia';
import { StockService } from './stock.service';
import { StockMapper } from './stock.mapper';
import { downloadFile } from '@/utils/file';

/**
 * useStockStore
 * Pinia store for Stock Monitor & Movements state management.
 * Aligned with API spec pagination (meta.page, meta.total, meta.totalPages).
 */
export const useStockStore = defineStore('transaction-stock-module', {
  state: () => ({
    stocks: [],
    stockDetail: null,
    movements: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10,
    },
    movementPagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10,
    },
    isLoading: false,
    error: null,
  }),

  getters: {
    totalStockCount: (state) => state.pagination.totalData || 0,
  },

  actions: {
    /**
     * fetchStocks — List stocks with server-side filters & pagination
     */
    async fetchStocks(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await StockService.getAll(params);
        const rawData = response.data || [];
        this.stocks = rawData.map(StockMapper.toUIList);

        // API returns: { data, meta: { page, limit, total, totalPages } }
        if (response.meta) {
          this.pagination = {
            currentPage: response.meta.page || 1,
            dataPerPage: response.meta.limit || 10,
            totalData: response.meta.total || 0,
            totalPages: response.meta.totalPages || 1,
          };
        } else if (response.pagination) {
          // Fallback for legacy format
          this.pagination = response.pagination;
        }
      } catch (err) {
        this.error = 'Gagal memuat monitor stok';
        console.error('Store: fetchStocks failed', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchDetail — Get single stock record
     */
    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const response = await StockService.getById(id);
        this.stockDetail = StockMapper.toUIDetail(response.data || response);
        return this.stockDetail;
      } catch (err) {
        console.error('Store: fetchDetail failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createStock — Create new stock record
     */
    async createStock(formData) {
      this.isLoading = true;
      try {
        const payload = StockMapper.toCreatePayload(formData);
        const response = await StockService.create(payload);
        return response;
      } catch (err) {
        console.error('Store: createStock failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateStock — Update stock (only qty_first, unit_cost)
     */
    async updateStock(id, formData) {
      this.isLoading = true;
      try {
        const payload = StockMapper.toUpdatePayload(formData);
        const response = await StockService.update(id, payload);
        await this.fetchDetail(id);
        return response;
      } catch (err) {
        console.error('Store: updateStock failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchMovements — Get movements for a specific stock
     */
    async fetchMovements(stockId, params = {}) {
      this.isLoading = true;
      try {
        const queryParams = { limit: params.limit || 20, ...params };
        const response = await StockService.getMovements(stockId, queryParams);
        const rawData = response.data || response || [];
        this.movements = Array.isArray(rawData) ? rawData.map(StockMapper.toMovementUI) : [];

        const meta = response.meta || response.pagination || response.data?.meta || response.data?.pagination;
        if (meta) {
          this.movementPagination = {
            currentPage: meta.currentPage || meta.page || 1,
            dataPerPage: meta.dataPerPage || meta.limit || 20,
            totalData: meta.totalData || meta.total || 0,
            totalPages: meta.totalPages || 1,
          };
        }
      } catch (err) {
        console.error('Store: fetchMovements failed', err);
        this.movements = [];
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * addMovement — Record a new stock movement
     */
    async addMovement(stockId, formData) {
      this.isLoading = true;
      try {
        const payload = StockMapper.toMovementPayload(formData);
        const response = await StockService.addMovement(stockId, payload);
        // Refresh detail and movements after mutation
        await Promise.all([
          this.fetchDetail(stockId),
          this.fetchMovements(stockId),
        ]);
        return response;
      } catch (err) {
        console.error('Store: addMovement failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteMovement — Delete movement with automatic reversal
     */
    async deleteMovement(stockId, movementId) {
      this.isLoading = true;
      try {
        const response = await StockService.deleteMovement(stockId, movementId);
        await Promise.all([
          this.fetchDetail(stockId),
          this.fetchMovements(stockId),
        ]);
        return response;
      } catch (err) {
        console.error('Store: deleteMovement failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async exportStockToCSV(params = {}) {
      this.isLoading = true;
      try {
        const blob = await StockService.exportStockCSV(params);
        const prefix = params.tipe === 'retur' ? 'Return_' : '';
        downloadFile(blob, `${prefix}Stock_Report_${new Date().getTime()}.csv`);
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
        const blob = await StockService.exportMovementCSV(params);
        const prefix = params.tipe === 'retur' ? 'Return_' : '';
        downloadFile(blob, `${prefix}Stock_Movement_Report_${new Date().getTime()}.csv`);
      } catch (err) {
        console.error('exportMovementsToCSV error', err);
        this.error = 'Gagal mengekspor data movement.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  },
});

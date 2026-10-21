import axios from '@/plugins/axios';

/**
 * StockMovementLogService
 * Log pergerakan gabungan (stok + perolehan aset) — read-only, paginated.
 * Backend: GET /api/ga/stock-movement-log
 */
export const StockMovementLogService = {
  getAll: async (params = {}) => {
    const response = await axios.get('ga/stock-movement-log', { params });
    return response.data;
  },
};

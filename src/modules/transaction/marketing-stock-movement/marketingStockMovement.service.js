import axios from '@/plugins/axios';

/**
 * MarketingStockMovementLogService
 * Log pergerakan gabungan Marketing (stok + perolehan aset) — read-only, paginated.
 * Backend: GET /api/marketing/stock-movement-log
 */
export const MarketingStockMovementLogService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/marketing/stock-movement-log', { params });
    return response.data;
  },
};

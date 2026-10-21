import axios from '@/plugins/axios';

/**
 * StockService
 * Handles API communication for Stock & Movements module.
 * Matches API spec: /stocks, /stocks/:id, /stocks/:id/movements, /movements, /stocks/snapshot
 */
export const StockService = {
  // ==================== STOCKS ====================

  /** List all stocks (paginated, filterable) */
  getAll: async (params = {}) => {
    const response = await axios.get('ga/stocks', { params });
    return response.data;
  },

  /** Get single stock detail */
  getById: async (id) => {
    const response = await axios.get(`ga/stocks/${id}`);
    return response.data;
  },

  /** Create stock record (good_id + location_id, optional qty_first, unit_cost) */
  create: async (payload) => {
    const response = await axios.post('ga/stocks', payload);
    return response.data;
  },

  /** Update stock (only qty_first, unit_cost allowed) */
  update: async (id, payload) => {
    const response = await axios.put(`ga/stocks/${id}`, payload);
    return response.data;
  },

  /** Get qty summary for good+location combination */
  getSummary: async (goodId, locationId) => {
    const response = await axios.get('ga/stocks/summary', {
      params: { good_id: goodId, location_id: locationId }
    });
    return response.data;
  },

  /** Get all low-stock records */
  getLowStock: async (params = {}) => {
    const response = await axios.get('ga/stocks/low-stock', { params });
    return response.data;
  },

  // ==================== MOVEMENTS ====================

  /** List movements for a specific stock */
  getMovements: async (stockId, params = {}) => {
    const response = await axios.get(`ga/stocks/${stockId}/movements`, { params });
    return response.data;
  },

  /** List all movements across stocks */
  getAllMovements: async (params = {}) => {
    const response = await axios.get('ga/stocks/movements/all', { params });
    return response.data;
  },

  /** Add a new movement to a stock */
  addMovement: async (stockId, payload) => {
    const response = await axios.post(`ga/stocks/${stockId}/movements`, payload);
    return response.data;
  },

  /** Delete a movement (with automatic reversal) */
  deleteMovement: async (stockId, movementId) => {
    const response = await axios.delete(`ga/stocks/${stockId}/movements/${movementId}`);
    return response.data;
  },

  // ==================== SNAPSHOT ====================

  /** Create monthly snapshot */
  createSnapshot: async (payload) => {
    const response = await axios.post('ga/stocks/snapshot', payload);
    return response.data;
  },

  /** Export Stock to CSV */
  exportStockCSV: async (params = {}) => {
    const response = await axios.get('ga/stocks/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  /** Export Movements to CSV */
  exportMovementCSV: async (params = {}) => {
    const response = await axios.get('ga/stocks/movements/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // ==================== IMPORT ====================

  downloadImportTemplate: async (tipe = 'biasa') => {
    const response = await axios.get('ga/stocks/import/template', {
      params: { tipe },
      responseType: 'blob',
    });
    return response.data;
  },

  previewImport: async (file, tipe = 'biasa') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipe', tipe);
    const response = await axios.post('ga/stocks/import/preview', formData, {
      params: { tipe },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },

  executeImport: async (rows, tipe = 'biasa') => {
    const response = await axios.post('ga/stocks/import/execute', { rows, tipe });
    return response.data;
  }
};

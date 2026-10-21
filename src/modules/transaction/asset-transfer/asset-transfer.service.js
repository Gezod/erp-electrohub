import axios from '@/plugins/axios';

/**
 * AssetTransferService
 * API communication for Asset Transfers module.
 * Base path: /ga/transfers
 */
export const AssetTransferService = {
  /** List all transfers (paginated, filterable) */
  getAll: async (params = {}) => {
    const response = await axios.get('ga/transfers', { params });
    return response.data;
  },

  /** Get transfer detail */
  getById: async (id) => {
    const response = await axios.get(`ga/transfers/${id}`);
    return response.data;
  },

  /** 
   * Unified Transfer (Asset or Stock)
   * Asset: provide asset_id, to_location_id, etc.
   * Stock: provide good_id, from_location_id, to_location_id, qty, etc.
   */
  create: async (payload) => {
    const response = await axios.post('ga/transfers', payload);
    return response.data;
  },

  /** Update transfer status (e.g. received) */
  updateStatus: async (id, payload) => {
    const response = await axios.patch(`ga/transfers/${id}/status`, payload);
    return response.data;
  },

  /** Delete transfer (only if draft/pending) */
  delete: async (id) => {
    const response = await axios.delete(`ga/transfers/${id}`);
    return response.data;
  },

  /**
   * Export to CSV
   * type=asset -> mutasi aset (punya asset_id), type=stock -> mutasi stok (tanpa asset_id).
   * Satu request = satu file, kedua tipe saling eksklusif.
   */
  exportCSV: async (params = {}) => {
    const response = await axios.get('ga/transfers/export', {
      params: { type: 'asset', ...params },
      responseType: 'blob'
    });
    return response.data;
  }
};

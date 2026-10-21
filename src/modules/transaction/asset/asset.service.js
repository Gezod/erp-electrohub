import axios from '@/plugins/axios';
import { AssetMapper } from './asset.mapper';

/**
 * AssetService
 * API communication for Assets module.
 * Base path: /ga/assets
 */
export const AssetService = {
  // ==================== ASSETS CRUD ====================

  /** List all assets (paginated, filterable) */
  getAll: async (params = {}) => {
    const response = await axios.get('ga/assets', { params });
    const rawData = response.data?.data || [];
    const pagination = response.data?.pagination || null;

    return {
      data: rawData.map(AssetMapper.toUIList),
      pagination
    };
  },

  /** Get asset detail (includes transfers & maintenances) */
  getById: async (id) => {
    const response = await axios.get(`ga/assets/${id}`);
    return {
      data: AssetMapper.toUIDetail(response.data?.data || response.data)
    };
  },

  /** Get asset statistics */
  getStats: async (params = {}) => {
    const response = await axios.get('ga/assets/stats', { params });
    return response.data;
  },

  /** Create new asset */
  create: async (payload) => {
    const response = await axios.post('ga/assets', payload);
    return response.data;
  },

  /** Update asset (partial) */
  update: async (id, payload) => {
    const response = await axios.put(`ga/assets/${id}`, payload);
    return response.data;
  },

  /** Deactivate asset (soft delete) */
  delete: async (id) => {
    const response = await axios.delete(`ga/assets/${id}`);
    return response.data;
  },

  // ==================== ADJUST & TRANSFER ====================

  /** Adjust condition, status, value, or location */
  adjust: async (id, payload) => {
    const response = await axios.patch(`ga/assets/${id}/adjust`, payload);
    return response.data;
  },

  /** Transfer asset to another location (explicit) */
  transfer: async (id, payload) => {
    const response = await axios.post(`ga/assets/${id}/transfer`, payload);
    return response.data;
  },

  // ==================== MAINTENANCE ====================

  /** Get maintenance history for asset */
  getMaintenances: async (id, params = {}) => {
    const response = await axios.get(`ga/assets/${id}/maintenance`, { params });
    return response.data;
  },

  /** Add maintenance record */
  addMaintenance: async (id, payload) => {
    const response = await axios.post(`ga/assets/${id}/maintenance`, payload);
    return response.data;
  },

  // ==================== TRANSFER & ADJUSTMENT HISTORY ====================
  
  /** Get adjustment history for specific asset */
  getAdjustments: async (id, params = {}) => {
    const response = await axios.get(`ga/assets/${id}/adjustments`, { params });
    return response.data;
  },

  /** Get transfer history for specific asset */
  getTransfers: async (id, params = {}) => {
    const response = await axios.get(`ga/assets/${id}/transfers`, { params });
    return response.data;
  },

  /** Get all transfers across assets */
  getAllTransfers: async (params = {}) => {
    const response = await axios.get('ga/transfers', { params });
    return response.data;
  },

  /** Export assets to CSV */
  exportCSV: async (params = {}) => {
    const response = await axios.get('ga/assets/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

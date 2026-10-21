import axios from '@/plugins/axios';

/**
 * RequestService
 * API communication for Request (Pengajuan) module.
 * Base path: /ga/requests
 */
export const RequestService = {
  /** List all requests (paginated, filterable) */
  getAll: async (params = {}) => {
    const response = await axios.get('ga/requests', { params });
    return response.data;
  },

  /** Get request detail (includes items, purchases, delivery info) */
  getById: async (id) => {
    const response = await axios.get(`ga/requests/${id}`);
    return response.data;
  },

  /** Check stock availability for all items */
  checkStock: async (id) => {
    const response = await axios.get(`ga/requests/${id}/stock-check`);
    return response.data;
  },

  /** Create new request */
  create: async (payload) => {
    const response = await axios.post('ga/requests', payload);
    return response.data;
  },

  /** Update request header (only status=dalam_pengajuan) */
  update: async (id, payload) => {
    const response = await axios.put(`ga/requests/${id}`, payload);
    return response.data;
  },

  /** Replace all items (only status=dalam_pengajuan) */
  updateItems: async (id, payload) => {
    const response = await axios.patch(`ga/requests/${id}/items`, payload);
    return response.data;
  },

  /** Update status (different payloads per transition) */
  updateStatus: async (id, payload) => {
    const response = await axios.patch(`ga/requests/${id}/status`, payload);
    return response.data;
  },

  /** Create purchase order from request */
  createPurchase: async (id, payload) => {
    const response = await axios.post(`ga/requests/${id}/purchase`, payload);
    return response.data;
  },

  /** Delete request (only status=dalam_pengajuan) */
  deleteRequest: async (id) => {
    const response = await axios.delete(`ga/requests/${id}`);
    return response.data;
  },

  /** Link manual item to master good */
  linkItemToMaster: async (id, detailId, goodId) => {
    const response = await axios.patch(`ga/requests/${id}/items/${detailId}/link-master`, { good_id: goodId });
    return response.data;
  },

  /** Assign PIC GA to all items */
  assignPic: async (id, picId) => {
    const response = await axios.patch(`ga/requests/${id}/assign-pic`, { pic_id: picId });
    return response.data;
  },

  /** Kandidat lokasi stok GLOBAL milik PIC Penyerah untuk seluruh item request */
  getStockLocations: async (id) => {
    const response = await axios.get(`ga/requests/${id}/stock-locations`);
    return response.data;
  },

  /** Set lokasi stok sumber GLOBAL untuk semua item request */
  setRequestSourceLocation: async (id, locationId) => {
    const response = await axios.patch(`ga/requests/${id}/source-location`, { location_id: locationId });
    return response.data;
  },

  /** Export to CSV */
  exportCSV: async (params = {}) => {
    const response = await axios.get('ga/requests/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

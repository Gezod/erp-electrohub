import axios from '@/plugins/axios';

/**
 * MaintenanceService
 * Menangani komunikasi API untuk modul Maintenance (Ticketing).
 */
export const MaintenanceService = {
  /**
   * getAll
   * Mengambil daftar maintenance dengan filter opsional.
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/maintenance', { params });
      return response.data;
    } catch (error) {
      console.error('MaintenanceService.getAll error:', error);
      throw error;
    }
  },

  /**
   * getById
   * Mengambil detail maintenance berdasarkan ID.
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/maintenance/${id}`);
      return response.data;
    } catch (error) {
      console.error('MaintenanceService.getById error:', error);
      throw error;
    }
  },

  /**
   * createHeader
   * Membuat entitas maintenance baru (JSON Payload).
   */
  createHeader: async (payload) => {
    try {
      console.log('--- MaintenanceService.createHeader: Payload ---', payload);
      const response = await axios.post('/maintenance', payload);
      console.log('--- MaintenanceService.createHeader: Success ---', response.data);
      return response.data;
    } catch (error) {
      console.error('--- MaintenanceService.createHeader: Error ---', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * updateHeader
   * Memperbarui informasi utama maintenance (JSON Payload).
   */
  updateHeader: async (id, payload) => {
    try {
      const response = await axios.put(`/maintenance/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('MaintenanceService.updateHeader error:', error);
      throw error;
    }
  },

  addProgress: async (id, formData) => {
    try {
      console.log(`--- MaintenanceService.addProgress: Sending FormData for Ticket ID ${id} ---`);
      const response = await axios.post(`/maintenance/${id}/progress`, formData);
      console.log('--- MaintenanceService.addProgress: Success ---', response.data);
      return response.data;
    } catch (error) {
      console.error('--- MaintenanceService.addProgress: Error ---', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * getProgress
   * Mengambil daftar progres untuk tiket tertentu.
   */
  getProgress: async (id) => {
    try {
      const response = await axios.get(`/maintenance/${id}/progress`);
      return response.data;
    } catch (error) {
      console.error('MaintenanceService.getProgress error:', error);
      throw error;
    }
  },

  /**
   * updateProgress
   * Memperbarui detail progres tertentu.
   */
  updateProgress: async (id, progressId, formData) => {
    try {
      const response = await axios.put(`/maintenance/${id}/progress/${progressId}`, formData);
      return response.data;
    } catch (error) {
      console.error('MaintenanceService.updateProgress error:', error);
      throw error;
    }
  },

  /**
   * delete
   * Menghapus tiket maintenance (hanya jika status open & stage request).
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/maintenance/${id}`);
      return response.data;
    } catch (error) {
      console.error('MaintenanceService.delete error:', error);
      throw error;
    }
  },

  /** Export to CSV */
  exportCSV: async (params = {}) => {
    try {
      const response = await axios.get('/maintenance/export', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('MaintenanceService.exportCSV error:', error);
      throw error;
    }
  }
};

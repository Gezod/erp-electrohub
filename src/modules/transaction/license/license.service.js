import axios from '@/plugins/axios';

/**
 * LicenseService
 * Menangani komunikasi API untuk modul Transaction Licenses.
 */
export const LicenseService = {
  /**
   * getAll - List dengan filter search & status_payment
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/licenses', { params });
      return response.data;
    } catch (error) {
      console.error('LicenseService.getAll error:', error);
      throw error;
    }
  },

  /**
   * getById
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/licenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('LicenseService.getById error:', error);
      throw error;
    }
  },

  /**
   * create
   */
  create: async (payload) => {
    try {
      const response = await axios.post('/licenses', payload);
      return response.data;
    } catch (error) {
      console.error('LicenseService.create error:', error);
      throw error;
    }
  },

  /**
   * update
   */
  update: async (id, payload) => {
    try {
      const response = await axios.put(`/licenses/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('LicenseService.update error:', error);
      throw error;
    }
  },

  /**
   * delete
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/licenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('LicenseService.delete error:', error);
      throw error;
    }
  },

  exportCSV: async (params = {}) => {
    try {
      const response = await axios.get('/licenses/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('LicenseService.exportCSV error:', error);
      throw error;
    }
  }
};

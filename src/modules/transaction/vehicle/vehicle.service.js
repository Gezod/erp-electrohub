import axios from '@/plugins/axios';

/**
 * VehicleService
 * Menangani komunikasi API untuk modul Transaction Vehicles.
 */
export const VehicleService = {
  /**
   * getAll - List dengan filter
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/vehicles', { params });
      return response.data;
    } catch (error) {
      console.error('VehicleService.getAll error:', error);
      throw error;
    }
  },

  /**
   * getById
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('VehicleService.getById error:', error);
      throw error;
    }
  },

  /**
   * create
   */
  create: async (payload) => {
    try {
      const response = await axios.post('/vehicles', payload);
      return response.data;
    } catch (error) {
      console.error('VehicleService.create error:', error);
      throw error;
    }
  },

  /**
   * update
   */
  update: async (id, payload) => {
    try {
      const response = await axios.put(`/vehicles/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('VehicleService.update error:', error);
      throw error;
    }
  },

  /**
   * delete
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('VehicleService.delete error:', error);
      throw error;
    }
  },

  exportCSV: async (params = {}) => {
    try {
      const response = await axios.get('/vehicles/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('VehicleService.exportCSV error:', error);
      throw error;
    }
  }
};

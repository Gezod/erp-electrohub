import axios from '@/plugins/axios';

/**
 * PositionService
 * Service untuk komunikasi API modul Master Position.
 */
export const PositionService = {
  /**
   * getAll
   * Mengambil daftar posisi dengan filter dan pagination.
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/positions', { params });
      return response.data;
    } catch (error) {
      console.error('PositionService.getAll error:', error);
      throw error;
    }
  },

  /**
   * getById
   * Mengambil detail satu posisi berdasarkan ID.
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/positions/${id}`);
      return response.data;
    } catch (error) {
      console.error('PositionService.getById error:', error);
      throw error;
    }
  },

  /**
   * create
   * Membuat posisi baru.
   */
  create: async (payload) => {
    try {
      const response = await axios.post('/positions', payload);
      return response.data;
    } catch (error) {
      console.error('PositionService.create error:', error);
      throw error;
    }
  },

  /**
   * update
   * Memperbarui posisi yang sudah ada.
   */
  update: async (id, payload) => {
    try {
      const response = await axios.put(`/positions/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('PositionService.update error:', error);
      throw error;
    }
  },

  /**
   * delete
   * Menghapus posisi berdasarkan ID.
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/positions/${id}`);
      return response.data;
    } catch (error) {
      console.error('PositionService.delete error:', error);
      throw error;
    }
  }
};

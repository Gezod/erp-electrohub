import axios from '@/plugins/axios';

/**
 * ScheduleService
 * Menangani komunikasi API untuk modul Transaction Schedules.
 */
export const ScheduleService = {
  /**
   * getAll
   * Mendapatkan daftar jadwal dengan filter.
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/schedules', { params });
      return response.data;
    } catch (error) {
      console.error('ScheduleService.getAll error:', error);
      throw error;
    }
  },

  /**
   * getById
   * Mendapatkan detail jadwal berdasarkan ID.
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('ScheduleService.getById error:', error);
      throw error;
    }
  },

  /**
   * create
   * Membuat jadwal baru.
   */
  create: async (payload) => {
    try {
      const response = await axios.post('/schedules', payload);
      return response.data;
    } catch (error) {
      console.error('ScheduleService.create error:', error);
      throw error;
    }
  },

  /**
   * update
   * Memperbarui jadwal.
   */
  update: async (id, payload) => {
    try {
      const response = await axios.put(`/schedules/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('ScheduleService.update error:', error);
      throw error;
    }
  },

  /**
   * delete
   * Menghapus jadwal secara permanen.
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('ScheduleService.delete error:', error);
      throw error;
    }
  },

  exportCSV: async (params = {}) => {
    try {
      const response = await axios.get('/schedules/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('ScheduleService.exportCSV error:', error);
      throw error;
    }
  }
};

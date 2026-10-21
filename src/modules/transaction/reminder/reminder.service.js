import axios from '@/plugins/axios';

/**
 * ReminderService
 * Menangani komunikasi API untuk modul Transaction Reminders.
 */
export const ReminderService = {
  /**
   * getAll - List dengan filter
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/reminders', { params });
      return response.data;
    } catch (error) {
      console.error('ReminderService.getAll error:', error);
      throw error;
    }
  },

  /**
   * getDueToday - Endpoint khusus untuk reminder jatuh tempo hari ini
   */
  getDueToday: async () => {
    try {
      const response = await axios.get('/reminders/due-today');
      return response.data;
    } catch (error) {
      console.error('ReminderService.getDueToday error:', error);
      throw error;
    }
  },

  /**
   * getById
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/reminders/${id}`);
      return response.data;
    } catch (error) {
      console.error('ReminderService.getById error:', error);
      throw error;
    }
  },

  /**
   * patch - Menggunakan PATCH untuk pembaruan parsial (Mark as Done)
   */
  patch: async (id, payload) => {
    try {
      const response = await axios.put(`/reminders/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('ReminderService.put error:', error);
      throw error;
    }
  },

  /**
   * update - Menggunakan PUT untuk pembaruan lengkap dari form.
   */
  update: async (id, payload) => {
    try {
      const response = await axios.put(`/reminders/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('ReminderService.update error:', error);
      throw error;
    }
  },

  /**
   * create
   */
  create: async (payload) => {
    try {
      const response = await axios.post('/reminders', payload);
      return response.data;
    } catch (error) {
      console.error('ReminderService.create error:', error);
      throw error;
    }
  },

  /**
   * delete
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/reminders/${id}`);
      return response.data;
    } catch (error) {
      console.error('ReminderService.delete error:', error);
      throw error;
    }
  }
};

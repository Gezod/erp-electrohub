import axios from '@/plugins/axios';

export const BroadcastService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/hr/broadcasts', { params });
    return {
      dashboard: response.data?.dashboard || null,
      data: response.data?.data || [],
      pagination: response.data?.pagination || null
    };
  },

  getById: async (id, params = {}) => {
    const response = await axios.get(`/hr/broadcasts/${id}`, { params });
    return response.data;
  },

  create: async (payload) => {
    const response = await axios.post('/hr/broadcasts', payload);
    return response.data;
  },

  retryFailed: async (id) => {
    const response = await axios.post(`/hr/broadcasts/${id}/retry`);
    return response.data;
  }
};

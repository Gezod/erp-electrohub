import axios from '@/plugins/axios';

export const RegulationService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/hr/regulations', { params });
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination || null
    };
  },

  getOne: async (id) => {
    const response = await axios.get(`/hr/regulations/${id}`);
    return response.data?.data;
  },

  create: async (payload) => {
    const response = await axios.post('/hr/regulations', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axios.patch(`/hr/regulations/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await axios.delete(`/hr/regulations/${id}`);
    return response.data;
  }
};

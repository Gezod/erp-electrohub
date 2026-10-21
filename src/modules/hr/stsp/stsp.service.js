import axios from '@/plugins/axios';

export const StspService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/hr/stsp', { params });
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination || null
    };
  },

  getOne: async (id) => {
    const response = await axios.get(`/hr/stsp/${id}`);
    return response.data?.data;
  },

  create: async (payload) => {
    const response = await axios.post('/hr/stsp', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axios.patch(`/hr/stsp/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await axios.delete(`/hr/stsp/${id}`);
    return response.data;
  }
};

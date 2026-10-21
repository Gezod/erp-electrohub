import axios from '@/plugins/axios';

export const ViolationService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/hr/violations', { params });
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination || null
    };
  },

  getOne: async (id) => {
    const response = await axios.get(`/hr/violations/${id}`);
    return response.data?.data;
  },

  create: async (payload) => {
    const response = await axios.post('/hr/violations', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axios.patch(`/hr/violations/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  remove: async (id) => {
    const response = await axios.delete(`/hr/violations/${id}`);
    return response.data;
  }
};

import axios from '@/plugins/axios';
import { StoreAssignmentMapper } from './storeAssignment.mapper';

export const StoreAssignmentService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/marketing/store-assignments', { params });
    const rawData = response.data?.data || [];
    return {
      data: rawData.map(StoreAssignmentMapper.toUIList),
      pagination: response.data?.pagination || null,
    };
  },

  getById: async (id) => {
    const response = await axios.get(`/marketing/store-assignments/${id}`);
    return StoreAssignmentMapper.toUIDetail(response.data);
  },

  create: async (payload) => {
    const response = await axios.post('/marketing/store-assignments', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axios.patch(`/marketing/store-assignments/${id}`, payload);
    return response.data;
  },

  unassign: async (id, payload = {}) => {
    const response = await axios.patch(`/marketing/store-assignments/${id}/unassign`, payload);
    return response.data;
  },
};

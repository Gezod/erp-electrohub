import axios from '@/plugins/axios';
import { AdminPusatRosterMapper } from './adminPusatRoster.mapper';

export const AdminPusatRosterService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/marketing/admin-pusat-roster', { params });
    const rawData = response.data?.data || [];
    return {
      data: rawData.map(AdminPusatRosterMapper.toUIList),
      pagination: response.data?.pagination || null,
    };
  },

  getById: async (id) => {
    const response = await axios.get(`/marketing/admin-pusat-roster/${id}`);
    return AdminPusatRosterMapper.toUIDetail(response.data);
  },

  create: async (payload) => {
    const response = await axios.post('/marketing/admin-pusat-roster', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axios.patch(`/marketing/admin-pusat-roster/${id}`, payload);
    return response.data;
  },

  unassign: async (id, payload = {}) => {
    const response = await axios.patch(`/marketing/admin-pusat-roster/${id}/unassign`, payload);
    return response.data;
  },
};

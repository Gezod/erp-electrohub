import axios from '@/plugins/axios';

export const MarketingTransferService = {
  getAll: async (params = {}) => (await axios.get('/marketing/transfers', { params })).data,
  getStats: async (params = {}) => (await axios.get('/marketing/transfers/stats', { params })).data,
  getById: async (id) => (await axios.get(`/marketing/transfers/${id}`)).data,
  create: async (payload) => (await axios.post('/marketing/transfers', payload)).data,
  approve: async (id, payload = {}) => (await axios.patch(`/marketing/transfers/${id}/approve`, payload)).data,
  tolak: async (id, payload = {}) => (await axios.patch(`/marketing/transfers/${id}/tolak`, payload)).data,
  kirim: async (id, payload = {}) => (await axios.patch(`/marketing/transfers/${id}/kirim`, payload)).data,
  terima: async (id, payload = {}) => (await axios.patch(`/marketing/transfers/${id}/terima`, payload)).data,
  cancel: async (id, payload = {}) => (await axios.patch(`/marketing/transfers/${id}/cancel`, payload)).data,
  exportCSV: async (params = {}) =>
    (await axios.get('/marketing/transfers/export', { params, responseType: 'blob' })).data,
};

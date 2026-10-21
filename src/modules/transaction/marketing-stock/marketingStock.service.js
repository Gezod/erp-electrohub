import axios from '@/plugins/axios';
import { MarketingStockMapper } from './marketingStock.mapper';

export const MarketingStockService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/marketing/stocks', { params });
    const rawData = response.data?.data || [];
    return {
      data: rawData.map(MarketingStockMapper.toUIList),
      pagination: response.data?.pagination || null,
    };
  },

  // Sengaja tidak lewat mapper — detail.vue membaca bentuk snake_case mentah
  getById: async (id) => (await axios.get(`/marketing/stocks/${id}`)).data,

  getMovements: async (id, params = {}) => {
    const response = await axios.get(`/marketing/stocks/${id}/movements`, { params });
    const rawData = response.data?.data || [];
    return {
      data: rawData.map(MarketingStockMapper.toMovementUI),
      pagination: response.data?.pagination || null,
    };
  },

  addMovement: async (id, form) => {
    const payload = MarketingStockMapper.toMovementPayload(form);
    const response = await axios.post(`/marketing/stocks/${id}/movements`, payload);
    return response.data;
  },

  /** Detail dalam bentuk camelCase — dipakai form modal untuk prefill edit */
  getDetailForForm: async (id) => {
    const response = await axios.get(`/marketing/stocks/${id}`);
    return MarketingStockMapper.toUIDetail(response.data);
  },

  create: async (form) => {
    const payload = MarketingStockMapper.toCreatePayload(form);
    const response = await axios.post('/marketing/stocks', payload);
    return response.data;
  },

  update: async (id, form) => {
    const payload = MarketingStockMapper.toUpdatePayload(form);
    const response = await axios.put(`/marketing/stocks/${id}`, payload);
    return response.data;
  },

  /** Export daftar stok ke CSV */
  exportStockCSV: async (params = {}) => {
    const response = await axios.get('/marketing/stocks/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /** Export mutasi stok ke CSV */
  exportMovementCSV: async (params = {}) => {
    const response = await axios.get('/marketing/stocks/movements/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

import axios from '@/plugins/axios';
import { MarketingAssetMapper } from './marketingAsset.mapper';

/**
 * MarketingAssetService
 * Base path: /marketing/assets
 * getAll/getById dialirkan lewat mapper — konsumen store selalu menerima camelCase.
 */
export const MarketingAssetService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/marketing/assets', { params });
    const rawData = response.data?.data || [];
    return {
      data: rawData.map(MarketingAssetMapper.toUIList),
      pagination: response.data?.pagination || null,
    };
  },

  getById: async (id) => {
    const response = await axios.get(`/marketing/assets/${id}`);
    return MarketingAssetMapper.toUIDetail(response.data?.data || response.data);
  },

  getStats: async (params = {}) => (await axios.get('/marketing/assets/stats', { params })).data,

  getTransfers: async (id) => (await axios.get(`/marketing/assets/${id}/transfers`)).data,

  create: async (payload) => (await axios.post('/marketing/assets', payload)).data,

  update: async (id, payload) => (await axios.put(`/marketing/assets/${id}`, payload)).data,

  /** Soft delete — backend men-set is_active = false */
  delete: async (id) => (await axios.delete(`/marketing/assets/${id}`)).data,

  adjust: async (id, payload) => (await axios.patch(`/marketing/assets/${id}/adjust`, payload)).data,

  transfer: async (id, payload) => (await axios.post(`/marketing/assets/${id}/transfer`, payload)).data,

  exportCSV: async (params = {}) =>
    (await axios.get('/marketing/assets/export', { params, responseType: 'blob' })).data,
};

import axios from '@/plugins/axios'
import { MarketingGoodsMapper } from './marketingGoods.mapper'

export const MarketingGoodsService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/marketing/goods', { params })
    const rawData = response.data?.data || []
    return {
      data: rawData.map(MarketingGoodsMapper.toUI),
      pagination: response.data?.pagination || null,
    }
  },

  getById: async (id) => {
    const response = await axios.get(`/marketing/goods/${id}`)
    return MarketingGoodsMapper.toUI(response.data)
  },

  create: async (form) => {
    const payload = MarketingGoodsMapper.toPayload(form)
    const response = await axios.post('/marketing/goods', payload)
    return response.data
  },

  update: async (id, form) => {
    const payload = MarketingGoodsMapper.toPayload(form)
    const response = await axios.put(`/marketing/goods/${id}`, payload)
    return response.data
  },

  delete: async (id) => {
    const response = await axios.delete(`/marketing/goods/${id}`)
    return response.data
  },
}

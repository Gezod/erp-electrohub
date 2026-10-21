import axios from '@/plugins/axios'
import { GoodsMapper } from '../mapper/goods.mapper'

export const GoodsService = {
  /**
   * Mengambil data barang dengan dukungan pagination dan filter dari API.
   * Response: { data: Array, pagination: Object }
   */
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/goods', { params })
      const rawData = response.data?.data || []
      const pagination = response.data?.pagination || null

      return {
        data: rawData.map(GoodsMapper.toUI),
        pagination: pagination,
      }
    } catch (error) {
      console.error('GoodsService.getAll Error:', error)
      throw error
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`/goods/${id}`)
      return GoodsMapper.toUI(response.data)
    } catch (error) {
      console.error('GoodsService.getById Error:', error)
      throw error
    }
  },

  create: async (formData) => {
    const payload = GoodsMapper.toPayload(formData)
    const response = await axios.post('/goods', payload)
    return response.data
  },

  update: async (id, formData) => {
    const payload = GoodsMapper.toPayload(formData)
    const response = await axios.put(`/goods/${id}`, payload)
    return response.data
  },

  delete: async (id) => {
    const response = await axios.delete(`/goods/${id}`)
    return response.data
  },

  downloadImportTemplate: async () => {
    const response = await axios.get('/goods/import/template', {
      responseType: 'blob',
    })
    return response.data
  },

  previewImport: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axios.post('/goods/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data?.data || response.data
  },

  executeImport: async (rows) => {
    const response = await axios.post('/goods/import/execute', { rows })
    return response.data
  },
}

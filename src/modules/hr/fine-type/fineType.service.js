import axios from '@/plugins/axios'

export const FineTypeService = {
  getAll: async (params = {}) => {
    const res = await axios.get('/hr/fine-types', { params })
    return { data: res.data?.data || [], pagination: res.data?.pagination || null }
  },
  getAllActive: async () => (await axios.get('/hr/fine-types/active')).data || [],
  getOne: async (id) => (await axios.get(`/hr/fine-types/${id}`)).data,
  create: async (payload) => (await axios.post('/hr/fine-types', payload)).data,
  update: async (id, payload) => (await axios.put(`/hr/fine-types/${id}`, payload)).data,
  remove: async (id) => (await axios.delete(`/hr/fine-types/${id}`)).data,
}

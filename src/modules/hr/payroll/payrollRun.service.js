import axios from '@/plugins/axios'

export const PayrollRunService = {
  getAll: async (params = {}) => {
    const res = await axios.get('/hr/payroll-runs', { params })
    return { data: res.data?.data || [], pagination: res.data?.pagination || null }
  },
  getOne: async (id) => (await axios.get(`/hr/payroll-runs/${id}`)).data,
  create: async (payload) => (await axios.post('/hr/payroll-runs', payload)).data,
  regenerate: async (id) => (await axios.post(`/hr/payroll-runs/${id}/regenerate`)).data,
  updateItem: async (id, itemId, payload) => (await axios.put(`/hr/payroll-runs/${id}/items/${itemId}`, payload)).data,
  finalize: async (id) => (await axios.post(`/hr/payroll-runs/${id}/finalize`)).data,
  markPaid: async (id, payload) => (await axios.post(`/hr/payroll-runs/${id}/paid`, payload)).data,
  remove: async (id) => (await axios.delete(`/hr/payroll-runs/${id}`)).data,
  slipUrl: (id, itemId) => {
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '')
    return `${base}/hr/payroll-runs/${id}/items/${itemId}/slip`
  },
}

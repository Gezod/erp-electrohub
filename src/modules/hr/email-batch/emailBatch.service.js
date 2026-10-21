import axios from '@/plugins/axios'

export const EmailBatchService = {
  getAll: async (params = {}) => {
    const res = await axios.get('/hr/email-batches', { params })
    return { data: res.data?.data || [], pagination: res.data?.pagination || null }
  },
  getOne: async (id, params = {}) => (await axios.get(`/hr/email-batches/${id}`, { params })).data,
  progress: async (id) => (await axios.get(`/hr/email-batches/${id}/progress`)).data,
  storeFromPayroll: async (payload) => (await axios.post('/hr/email-batches/payroll', payload)).data,
  storeFromExcel: async (formData) =>
    (
      await axios.post('/hr/email-batches/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data,
  retryFailed: async (id) => (await axios.post(`/hr/email-batches/${id}/retry`)).data,
  attachmentUrl: (batchId, recipientId) => {
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '')
    return `${base}/hr/email-batches/${batchId}/recipients/${recipientId}/file`
  },
}

import axios from '@/plugins/axios'

export const TrainingEmployeeService = {
  getAll: async (params = {}) => {
    const res = await axios.get('/hr/training-employees', { params })
    return { data: res.data?.data || [], pagination: res.data?.pagination || null }
  },
  getOne: async (id) => (await axios.get(`/hr/training-employees/${id}`)).data,
  create: async (payload) => (await axios.post('/hr/training-employees', payload)).data,
  update: async (id, payload) => (await axios.put(`/hr/training-employees/${id}`, payload)).data,
  remove: async (id) => (await axios.delete(`/hr/training-employees/${id}`)).data,
  downloadTemplate: async () =>
    (await axios.get('/hr/training-employees/template', { responseType: 'blob' })).data,
  importExcel: async (file) => {
    const formData = new FormData()
    formData.append('excel', file)
    return (
      await axios.post('/hr/training-employees/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data
  },
}

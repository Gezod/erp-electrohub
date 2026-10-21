import axios from '@/plugins/axios'

export const EmployeeFineService = {
  getAll: async (params = {}) => {
    const res = await axios.get('/hr/employee-fines', { params })
    return { data: res.data?.data || [], pagination: res.data?.pagination || null }
  },
  getOne: async (id) => (await axios.get(`/hr/employee-fines/${id}`)).data,
  create: async (payload) => (await axios.post('/hr/employee-fines', payload)).data,
  update: async (id, payload) => (await axios.put(`/hr/employee-fines/${id}`, payload)).data,
  remove: async (id) => (await axios.delete(`/hr/employee-fines/${id}`)).data,
}

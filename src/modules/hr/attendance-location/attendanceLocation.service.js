import axios from '@/plugins/axios'

export const AttendanceLocationService = {
  getAll: async (params = {}) => {
    const res = await axios.get('/hr/attendance-locations', { params })
    return { data: res.data?.data || [], pagination: res.data?.pagination || null }
  },
  getAllSimple: async () => (await axios.get('/hr/attendance-locations/all')).data || [],
  getOne: async (id) => (await axios.get(`/hr/attendance-locations/${id}`)).data,
  create: async (payload) => (await axios.post('/hr/attendance-locations', payload)).data,
  update: async (id, payload) => (await axios.put(`/hr/attendance-locations/${id}`, payload)).data,
  remove: async (id) => (await axios.delete(`/hr/attendance-locations/${id}`)).data,
}

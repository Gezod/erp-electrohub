import axios from '@/plugins/axios'

export const AttendanceHolidayService = {
  getAll: async (params = {}) => {
    const res = await axios.get('/hr/attendance-holidays', { params })
    return { data: res.data?.data || [], pagination: res.data?.pagination || null }
  },
  getOne: async (id) => (await axios.get(`/hr/attendance-holidays/${id}`)).data,
  create: async (payload) => (await axios.post('/hr/attendance-holidays', payload)).data,
  update: async (id, payload) => (await axios.put(`/hr/attendance-holidays/${id}`, payload)).data,
  remove: async (id) => (await axios.delete(`/hr/attendance-holidays/${id}`)).data,
  sync: async (year) => (await axios.post('/hr/attendance-holidays/sync', {}, { params: { year } })).data,
}

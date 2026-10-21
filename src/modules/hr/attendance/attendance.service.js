import axios from '@/plugins/axios'

export const AttendanceService = {
  rekap: async (params = {}) => (await axios.get('/hr/attendance/rekap', { params })).data,
  rekapShow: async (employeeId, params = {}) =>
    (await axios.get(`/hr/attendance/rekap/${employeeId}`, { params })).data,
  harian: async (params = {}) => (await axios.get('/hr/attendance/harian', { params })).data,
  harianShow: async (employeeId, date) => (await axios.get(`/hr/attendance/harian/${employeeId}/${date}`)).data,
  updateHarian: async (employeeId, date, payload) =>
    (await axios.put(`/hr/attendance/harian/${employeeId}/${date}`, payload)).data,
  exportRekap: async (params = {}) =>
    (await axios.get('/hr/attendance/rekap/export', { params, responseType: 'blob' })).data,
}

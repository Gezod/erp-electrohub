import axios from '@/plugins/axios'

export const AttendanceSettingService = {
  get: async () => (await axios.get('/hr/attendance-settings')).data,
  update: async (payload) =>
    (
      await axios.put('/hr/attendance-settings', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data,
}

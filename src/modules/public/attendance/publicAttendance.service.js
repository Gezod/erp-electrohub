import axios from '@/plugins/axios'

export const PublicAttendanceService = {
  cari: async (nama) => {
    try {
      const res = await axios.post('/hr/public/cari', { nama })
      return res.data
    } catch (err) {
      if (err.response?.status === 404) return err.response.data
      throw err
    }
  },
  absen: async (formData) => (await axios.post('/hr/public/absen', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data,
  holidayToday: async () => {
    try {
      return (await axios.get('/hr/public/holiday-today')).data
    } catch (err) {
      // Non-fatal — kiosk tetap bisa dipakai tanpa banner libur kalau endpoint ini gagal.
      return { is_holiday: false }
    }
  },
}

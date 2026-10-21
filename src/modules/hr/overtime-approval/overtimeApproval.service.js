import axios from '@/plugins/axios'

export const OvertimeApprovalService = {
  getAll: async (params = {}) => {
    const res = await axios.get('/hr/overtime-approvals', { params })
    return { data: res.data?.data || [], pagination: res.data?.pagination || null }
  },
  approve: async (id) => (await axios.patch(`/hr/overtime-approvals/${id}/approve`)).data,
  reject: async (id, alasan) => (await axios.patch(`/hr/overtime-approvals/${id}/reject`, { alasan })).data,
}

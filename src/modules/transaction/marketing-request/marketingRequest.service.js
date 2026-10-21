import axios from '@/plugins/axios';

export const MarketingRequestService = {
  getAll: async (params = {}) => (await axios.get('/marketing/requests', { params })).data,
  getById: async (id) => (await axios.get(`/marketing/requests/${id}`)).data,
  create: async (payload) => (await axios.post('/marketing/requests', payload)).data,
  update: async (id, payload) => (await axios.put(`/marketing/requests/${id}`, payload)).data,
  remove: async (id) => (await axios.delete(`/marketing/requests/${id}`)).data,
  updateStatus: async (id, payload) => (await axios.patch(`/marketing/requests/${id}/status`, payload)).data,
  escalate: async (id) => (await axios.patch(`/marketing/requests/${id}/escalate`)).data,
  updateProcessor: async (id, payload) => (await axios.patch(`/marketing/requests/${id}/processor`, payload)).data,
  getProcessorLocations: async (id, processorEmployeeId) => (await axios.get(`/marketing/requests/${id}/processor-locations`, { params: { processor_employee_id: processorEmployeeId || '' } })).data,
  getProcessorCandidates: async (id) => (await axios.get(`/marketing/requests/${id}/processor-candidates`)).data,
  getRequesterLocations: async (requesterEmployeeId) => (await axios.get('/marketing/requests/requester-locations', { params: { requester_employee_id: requesterEmployeeId || '' } })).data,
  createPurchase: async (id, payload) => (await axios.post(`/marketing/requests/${id}/create-purchase`, payload)).data,
  exportCSV: async (params = {}) =>
    (await axios.get('/marketing/requests/export', { params, responseType: 'blob' })).data,

  // ── Bukti Sebelum/Sesudah (multi file / multi link) ──────────────────────
  // Cocok dengan route POST /marketing/requests/:id/evidences (multer .fields
  // "evidence_before" / "evidence_after") — formData yang dikirim dari
  // MarketingRequestFormModal.vue sudah pakai nama field yang sama persis.
  // Content-Type sengaja TIDAK di-set manual — browser/axios otomatis mengisi
  // "multipart/form-data" beserta boundary-nya saat body berupa FormData asli.
  listEvidences: async (id) => (await axios.get(`/marketing/requests/${id}/evidences`)).data,
  addEvidences: async (id, formData) => (await axios.post(`/marketing/requests/${id}/evidences`, formData)).data,
  updateEvidenceItem: async (id, evidenceId, payload) => (await axios.patch(`/marketing/requests/${id}/evidences/${evidenceId}`, payload)).data,
  removeEvidence: async (id, evidenceId) => (await axios.delete(`/marketing/requests/${id}/evidences/${evidenceId}`)).data,
};

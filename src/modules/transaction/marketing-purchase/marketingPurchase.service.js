import axios from '@/plugins/axios';

export const MarketingPurchaseService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/marketing/purchases', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axios.get(`/marketing/purchases/${id}`);
    return response.data;
  },
  create: async (formData) => {
    const response = await axios.post('/marketing/purchases', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await axios.put(`/marketing/purchases/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  updateStatus: async (id, payload) => {
    const response = await axios.patch(`/marketing/purchases/${id}/status`, payload);
    return response.data;
  },
  updateEvidence: async (id, formData) => {
    const response = await axios.patch(`/marketing/purchases/${id}/evidence`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  /** List dokumen pendukung. Backend membalas ARRAY telanjang, urut created_at menaik. */
  getEvidences: async (id) => {
    const response = await axios.get(`/marketing/purchases/${id}/evidences`);
    return response.data;
  },
  /** Unggah dokumen pendukung (banyak file + link sekaligus). Balasan: objek purchase lengkap. */
  uploadEvidences: async (id, formData) => {
    const response = await axios.post(`/marketing/purchases/${id}/evidences`, formData, { timeout: 120000 });
    return response.data;
  },
  /** Ubah metadata satu dokumen (notes / file_name). Balasan: objek Evidence tunggal. */
  updateEvidenceMeta: async (id, evidenceId, payload) => {
    const response = await axios.patch(`/marketing/purchases/${id}/evidences/${evidenceId}`, payload);
    return response.data;
  },
  /** Hapus satu dokumen. Balasan: objek purchase lengkap (mirror ikut tersinkron). */
  deleteEvidence: async (id, evidenceId) => {
    const response = await axios.delete(`/marketing/purchases/${id}/evidences/${evidenceId}`);
    return response.data;
  },
  getStats: async (params = {}) => {
    const response = await axios.get('/marketing/purchases/stats', { params });
    return response.data;
  },
  hardDelete: async (id) => {
    const response = await axios.delete(`/marketing/purchases/${id}/hard-delete`);
    return response.data;
  },
  exportCSV: async (params = {}) => {
    const response = await axios.get('/marketing/purchases/export', { params, responseType: 'blob' });
    return response.data;
  },
};

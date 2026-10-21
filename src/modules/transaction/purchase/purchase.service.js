import axios from '@/plugins/axios';

/**
 * PurchaseService
 * API communication for Purchase (Pembelian) module.
 * Base path: /ga/purchases
 */
export const PurchaseService = {
  /** List all purchases (paginated, filterable) */
  getAll: async (params = {}) => {
    const response = await axios.get('/ga/purchases', { params });
    return response.data;
  },

  /** Get monthly statistics */
  getStats: async (params = {}) => {
    const response = await axios.get('/ga/purchases/stats', { params });
    return response.data;
  },

  /** Get purchase detail */
  getById: async (id) => {
    const response = await axios.get(`/ga/purchases/${id}`);
    return response.data;
  },

  /** Create new purchase (Status: draft) */
  create: async (formData) => {
    const response = await axios.post('/ga/purchases', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /** Update purchase header (Only in draft) */
  update: async (id, formData) => {
    const response = await axios.patch(`/ga/purchases/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /** Replace all items (Only in draft) */
  updateItems: async (id, payload) => {
    const response = await axios.patch(`/ga/purchases/${id}/items`, payload);
    return response.data;
  },

  /** Update status (Workflow transitions) */
  updateStatus: async (id, payload) => {
    const response = await axios.patch(`/ga/purchases/${id}/status`, payload);
    return response.data;
  },

  /**
   * List dokumen pendukung.
   * Backend membalas ARRAY telanjang (bukan envelope { data }), urut created_at menaik.
   */
  getEvidences: async (id) => {
    const response = await axios.get(`/ga/purchases/${id}/evidences`);
    return response.data;
  },

  /**
   * Unggah dokumen pendukung (banyak file + link sekaligus).
   * Balasan: objek purchase lengkap beserta array `evidences` terbaru.
   *
   * Jangan set Content-Type di sini — interceptor axios menghapusnya untuk
   * FormData agar browser mengisi boundary multipart yang benar.
   * Timeout dinaikkan karena instance axios global memakai 10s, terlalu pendek
   * untuk unggahan hingga 10 file x 5 MB.
   */
  uploadEvidences: async (id, formData) => {
    const response = await axios.post(`/ga/purchases/${id}/evidences`, formData, {
      timeout: 120000
    });
    return response.data;
  },

  /**
   * Ubah metadata satu dokumen (notes / file_name). file_url tidak bisa diubah.
   * Balasan: objek Evidence tunggal.
   */
  updateEvidenceMeta: async (id, evidenceId, payload) => {
    const response = await axios.patch(`/ga/purchases/${id}/evidences/${evidenceId}`, payload);
    return response.data;
  },

  /**
   * Hapus satu dokumen. Balasan: objek purchase lengkap setelah penghapusan
   * (mirror evidence_purchase/evidence_done otomatis ikut tersinkron).
   */
  deleteEvidence: async (id, evidenceId) => {
    const response = await axios.delete(`/ga/purchases/${id}/evidences/${evidenceId}`);
    return response.data;
  },

  /** Delete purchase (Only in draft) */
  delete: async (id) => {
    const response = await axios.delete(`/ga/purchases/${id}`);
    return response.data;
  },

  /** Hard Delete purchase (Superadmin only for Completed Purchases) */
  hardDelete: async (id) => {
    const response = await axios.delete(`/ga/purchases/${id}/hard-delete`);
    return response.data;
  },

  /** Export to CSV */
  exportCSV: async (params = {}) => {
    const response = await axios.get('/ga/purchases/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

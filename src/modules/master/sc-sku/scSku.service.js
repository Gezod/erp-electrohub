import axios from '@/plugins/axios';

export const ScSkuService = {
  // --- SKU CRUD ---
  getAll: async (params = {}) => (await axios.get('/sc/skus', { params })).data,
  getById: async (id) => (await axios.get(`/sc/skus/${id}`)).data,
  create: async (payload) => (await axios.post('/sc/skus', payload)).data,
  update: async (id, payload) => (await axios.put(`/sc/skus/${id}`, payload)).data,
  remove: async (id) => (await axios.delete(`/sc/skus/${id}`)).data,

  // --- Supplier Dropdown (untuk form SKU bahan baku) ---
  // Endpoint: GET /api/sc/suppliers?search=...&limit=20
  getSuppliers: async (params = {}) => {
    const res = await axios.get('/sc/suppliers', { params });
    return res.data;
  },

  // --- Kelompok Toko Dropdown (untuk distribusi SKU) ---
  // Endpoint: GET /api/sc/store-groups?search=...&limit=20
  getStoreGroups: async (params = {}) => {
    const res = await axios.get('/sc/store-groups', { params });
    return res.data;
  },
};

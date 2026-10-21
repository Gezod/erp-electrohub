import axios from '@/plugins/axios';

/**
 * ContactGroupService
 * Modul ini digunakan untuk mengelola daftar departemen/grup kontak secara dinamis (Master Template).
 */
export const ContactGroupService = {
  // --- Groups (Admin) ---
  getAllGroups: async () => {
    const response = await axios.get('/opa/contact-groups');
    return response.data;
  },

  createGroup: async (payload) => {
    const response = await axios.post('/opa/contact-groups', payload);
    return response.data;
  },

  updateGroup: async (id, payload) => {
    const response = await axios.put(`/opa/contact-groups/${id}`, payload);
    return response.data;
  },

  deleteGroup: async (id) => {
    const response = await axios.delete(`/opa/contact-groups/${id}`);
    return response.data;
  },

  // --- Items/Departments (Admin) ---
  createItem: async (payload) => {
    const response = await axios.post('/opa/contact-groups/items', payload);
    return response.data;
  },

  updateItem: async (id, payload) => {
    const response = await axios.put(`/opa/contact-groups/items/${id}`, payload);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await axios.delete(`/opa/contact-groups/items/${id}`);
    return response.data;
  },

  // --- Template (Public/User) ---
  getTemplateGroups: async () => {
    const response = await axios.get('/opa/store-contacts/template/groups');
    return response.data;
  }
};

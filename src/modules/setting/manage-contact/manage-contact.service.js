import axios from '@/plugins/axios';

export const ManageContactService = {
  getAll: async (params) => {
    const response = await axios.get('/manage-contacts', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/manage-contacts/${id}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await axios.post('/manage-contacts', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await axios.put(`/manage-contacts/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/manage-contacts/${id}`);
    return response.data;
  },

  getTemplateGroups: async () => {
    const response = await axios.get('/opa/store-contacts/template/groups');
    return response.data;
  }
};

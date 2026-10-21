import { defineStore } from 'pinia';
import { ManageContactService } from './manage-contact.service';

export const useManageContactStore = defineStore('manage-contact', {
  state: () => ({
    contacts: [],
    templateGroups: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchTemplateGroups() {
      this.isLoading = true;
      try {
        const response = await ManageContactService.getTemplateGroups();
        this.templateGroups = response.data || response;
        return this.templateGroups;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch template';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchContacts(params = {}) {
      this.isLoading = true;
      try {
        const result = await ManageContactService.getAll(params);
        this.contacts = result.data;
        if (result.pagination) this.pagination = result.pagination;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch contacts';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchContactById(id) {
      this.isLoading = true;
      try {
        return await ManageContactService.getById(id);
      } catch (err) {
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createContact(payload) {
      this.isLoading = true;
      try {
        return await ManageContactService.create(payload);
      } catch (err) {
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateContact(id, payload) {
      this.isLoading = true;
      try {
        return await ManageContactService.update(id, payload);
      } catch (err) {
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteContact(id) {
      this.isLoading = true;
      try {
        return await ManageContactService.delete(id);
      } catch (err) {
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

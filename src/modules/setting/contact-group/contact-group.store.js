import { defineStore } from 'pinia';
import { ContactGroupService } from './contact-group.service';

export const useContactGroupStore = defineStore('contact-group', {
  state: () => ({
    groups: [],
    templateGroups: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchGroups() {
      this.isLoading = true;
      try {
        const response = await ContactGroupService.getAllGroups();
        this.groups = response.data || response;
        return this.groups;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch groups';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTemplateGroups() {
      this.isLoading = true;
      try {
        const response = await ContactGroupService.getTemplateGroups();
        this.templateGroups = response.data || response;
        return this.templateGroups;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch template';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createGroup(payload) {
      this.isLoading = true;
      try {
        const response = await ContactGroupService.createGroup(payload);
        await this.fetchGroups();
        return response;
      } finally {
        this.isLoading = false;
      }
    },

    async updateGroup(id, payload) {
      this.isLoading = true;
      try {
        const response = await ContactGroupService.updateGroup(id, payload);
        await this.fetchGroups();
        return response;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteGroup(id) {
      this.isLoading = true;
      try {
        const response = await ContactGroupService.deleteGroup(id);
        await this.fetchGroups();
        return response;
      } finally {
        this.isLoading = false;
      }
    },

    // --- Items ---
    async createItem(payload) {
      this.isLoading = true;
      try {
        const response = await ContactGroupService.createItem(payload);
        await this.fetchGroups();
        return response;
      } finally {
        this.isLoading = false;
      }
    },

    async updateItem(id, payload) {
      this.isLoading = true;
      try {
        const response = await ContactGroupService.updateItem(id, payload);
        await this.fetchGroups();
        return response;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteItem(id) {
      this.isLoading = true;
      try {
        const response = await ContactGroupService.deleteItem(id);
        await this.fetchGroups();
        return response;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

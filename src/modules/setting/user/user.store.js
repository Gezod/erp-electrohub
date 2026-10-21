import { defineStore } from 'pinia';
import { UserService } from './user.service';

/**
 * useUserStore
 * State management untuk domain Akun & Hak Akses (IT/System).
 * Mengelola list user sistem, master permission, dan detail akun per user.
 */
export const useUserStore = defineStore('setting-user-module', {
  state: () => ({
    users: [],
    userDetail: null,
    masterPermissions: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    isLoading: false
  }),

  actions: {
    /**
     * fetchUsers
     */
    async fetchUsers(params = {}) {
      this.isLoading = true;
      try {
        const result = await UserService.getAll(params);
        this.users = result.data;
        if (result.pagination) {
          this.pagination = result.pagination;
        }
      } catch (error) {
        console.error('Pinia: fetchUsers failed', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchUserDetail
     */
    async fetchUserDetail(id) {
      this.isLoading = true;
      try {
        const detail = await UserService.getById(id);
        this.userDetail = detail;
        return detail;
      } catch (error) {
        console.error('Pinia: fetchUserDetail failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchMasterPermissions
     */
    async fetchMasterPermissions() {
      try {
        const permissions = await UserService.getAllPermissions();
        this.masterPermissions = permissions;
        return permissions;
      } catch (error) {
        console.error('Pinia: fetchMasterPermissions failed', error);
      }
    },

    /**
     * syncPermissions
     * Mengupdate hak akses user dan menyinkronkan state lokal.
     */
    async syncPermissions(id, selectedIds) {
      this.isLoading = true;
      try {
        const result = await UserService.updatePermissions(id, selectedIds);
        // Jika sedang melihat detail user yang sama, perbarui local permissions
        if (this.userDetail && this.userDetail.id === id) {
          await this.fetchUserDetail(id);
        }
        return result;
      } catch (error) {
        console.error('Pinia: syncPermissions failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createUser
     */
    async createUser(formData, permissionIds = []) {
      this.isLoading = true;
      try {
        const result = await UserService.create(formData, permissionIds);
        return result;
      } catch (error) {
        console.error('Pinia: createUser failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateUserBasic
     */
    async updateUserBasic(id, formData) {
      this.isLoading = true;
      try {
        const result = await UserService.updateBasic(id, formData);
        // Refresh detail if currently viewed
        if (this.userDetail && this.userDetail.id === id) {
          await this.fetchUserDetail(id);
        }
        return result;
      } catch (error) {
        console.error('Pinia: updateUserBasic failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateSuperadmin
     */
    async updateSuperadmin(id, isSuperadmin) {
      this.isLoading = true;
      try {
        const result = await UserService.updateSuperadmin(id, isSuperadmin);
        // Refresh detail if currently viewed
        if (this.userDetail && this.userDetail.id === id) {
          await this.fetchUserDetail(id);
        }
        return result;
      } catch (error) {
        console.error('Pinia: updateSuperadmin failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updatePassword
     */
    async updatePassword(id, formData) {
      this.isLoading = true;
      try {
        const result = await UserService.updatePassword(id, formData);
        return result;
      } catch (error) {
        console.error('Pinia: updatePassword failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteUser
     */
    async deleteUser(id) {
      this.isLoading = true;
      try {
        await UserService.deleteUser(id);
        this.users = this.users.filter((user) => user.id !== id);
      } catch (error) {
        console.error('Pinia: deleteUser failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

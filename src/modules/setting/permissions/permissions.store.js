import { defineStore } from 'pinia';
import { PermissionsService } from './permissions.service';

/**
 * usePermissionsStore
 * State management untuk Master Permissions.
 */
export const usePermissionsStore = defineStore('setting-permissions-module', {
  state: () => ({
    permissions: [],
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
     * fetchPermissions
     * Mengambil data permission dari API dengan filter (search, module, action).
     */
    async fetchPermissions(params = {}) {
      this.isLoading = true;
      try {
        const result = await PermissionsService.getAll(params);
        this.permissions = result.data;
        if (result.pagination) {
          this.pagination = result.pagination;
        }
      } catch (error) {
        console.error('Pinia: fetchPermissions failed', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createPermission
     * Menambah permission baru dan memperbarui list jika diperlukan.
     */
    async createPermission(formData) {
      this.isLoading = true;
      try {
        const result = await PermissionsService.create(formData);
        // Refresh list setelah berhasil tambah
        await this.fetchPermissions({ page: this.pagination.currentPage });
        return result;
      } catch (error) {
        console.error('Pinia: createPermission failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchPermissionById
     * Mengambil detail permission berdasarkan ID.
     */
    async fetchPermissionById(id) {
      this.isLoading = true;
      try {
        return await PermissionsService.getById(id);
      } catch (error) {
        console.error('Pinia: fetchPermissionById failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updatePermission
     * Mengupdate data permission berdasarkan ID.
     */
    async updatePermission(id, formData) {
      this.isLoading = true;
      try {
        const result = await PermissionsService.update(id, formData);
        await this.fetchPermissions({ page: this.pagination.currentPage });
        return result;
      } catch (error) {
        console.error('Pinia: updatePermission failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deletePermission
     * Menghapus data permission berdasarkan ID.
     */
    async deletePermission(id) {
      this.isLoading = true;
      try {
        const result = await PermissionsService.delete(id);
        await this.fetchPermissions({ page: this.pagination.currentPage });
        return result;
      } catch (error) {
        console.error('Pinia: deletePermission failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

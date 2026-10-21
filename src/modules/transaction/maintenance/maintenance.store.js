import { defineStore } from 'pinia';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceMapper } from './maintenance.mapper';
import { FileHelper } from '@/@core/utils/file';
import { downloadFile } from '@/utils/file';

/**
 * useMaintenanceStore
 * Mengelola state and logika bisnis untuk modul Maintenance (Ticketing).
 */
export const useMaintenanceStore = defineStore('transaction-maintenance-module', {
  state: () => ({
    maintenances: [],
    maintenanceDetail: null,
    totalCost: 0,
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    progressList: [],
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * getLocationName
     * Helper untuk mendapatkan nama lokasi berdasarkan ID dari master data.
     */
    getLocationName: (state) => (id) => {
      const loc = state.masterLocations.find(l => String(l.id) === String(id));
      return loc ? loc.name : 'Unknown Location';
    }
  },

  actions: {
    /**
     * fetchMaintenances
     * Memuat list maintenance dari API dengan format UI.
     */
    async fetchMaintenances(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await MaintenanceService.getAll(params);
        const rawData = response.data || [];
        this.maintenances = rawData.map(MaintenanceMapper.toUIList);
        this.totalCost = response.total_cost || 0;
        
        if (response.pagination) {
          this.pagination = response.pagination;
        }
      } catch (err) {
        this.error = err.message || 'Gagal memuat daftar maintenance';
        console.error('Pinia: fetchMaintenances failed', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchDetail
     * Memuat detail maintenance berdasarkan ID.
     */
    async fetchDetail(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await MaintenanceService.getById(id);
        this.maintenanceDetail = response.data || response;
        return this.maintenanceDetail;
      } catch (err) {
        this.error = err.message || 'Gagal memuat detail maintenance';
        console.error('Pinia: fetchDetail failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createTicket
     * Membuat tiket maintenance baru (Header saja).
     */
    async createTicket(headerData) {
      this.isLoading = true;
      this.error = null;
      try {
        const headerPayload = MaintenanceMapper.toPayloadHeader(headerData);
        const response = await MaintenanceService.createHeader(headerPayload);
        return response;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Gagal membuat tiket maintenance';
        console.error('Pinia: createTicket FAILED');
        console.dir(err.response?.data);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateHeader
     * Memperbarui informasi utama tiket.
     */
    async updateHeader(id, headerData) {
      this.isLoading = true;
      this.error = null;
      try {
        const payload = MaintenanceMapper.toPayloadUpdateHeader(headerData);
        const response = await MaintenanceService.updateHeader(id, payload);
        await this.fetchDetail(id);
        return response;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Gagal memperbarui tiket';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async submitProgress(id, progressData, photoFile) {
      this.isLoading = true;
      this.error = null;
      try {
        const formData = MaintenanceMapper.buildProgressPayload(progressData.stage, progressData, photoFile);
        const response = await MaintenanceService.addProgress(id, formData);
        
        // Refresh detail — progress is embedded in detail response
        await this.fetchDetail(id);
        
        return response;
      } catch (err) {
        this.error = err.message || 'Gagal mengirim progres maintenance';
        console.error('Pinia: submitProgress failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchProgressList
     * Memuat daftar progres untuk tiket tertentu.
     */
    async fetchProgressList(id) {
      this.isLoading = true;
      try {
        const response = await MaintenanceService.getProgress(id);
        this.progressList = response.data || [];
        return this.progressList;
      } catch (err) {
        console.error('Pinia: fetchProgressList failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateProgress
     * Memperbarui item progres tertentu.
     */
    async updateProgress(id, progressId, progressData, photoFile) {
      this.isLoading = true;
      this.error = null;
      try {
        const formData = MaintenanceMapper.buildUpdateProgressPayload(progressData, photoFile);
        const response = await MaintenanceService.updateProgress(id, progressId, formData);
        
        await Promise.all([
          this.fetchDetail(id),
          this.fetchProgressList(id)
        ]);
        
        return response;
      } catch (err) {
        this.error = err.message || 'Gagal memperbarui progres';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteTicket
     * Menghapus tiket (hanya berlaku untuk status open & stage request).
     */
    async deleteTicket(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await MaintenanceService.delete(id);
        return response;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Gagal menghapus tiket';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async exportToCSV(params = {}) {
      this.isLoading = true;
      try {
        const blob = await MaintenanceService.exportCSV(params);
        downloadFile(blob, `Maintenance_Report_${new Date().getTime()}.csv`);
      } catch (err) {
        console.error('exportToCSV error', err);
        this.error = 'Gagal mengekspor data maintenance.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

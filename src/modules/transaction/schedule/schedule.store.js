import { defineStore } from 'pinia';
import { ScheduleService } from './schedule.service';
import { ScheduleMapper } from './schedule.mapper';
import { downloadFile } from '@/utils/file';

/**
 * useScheduleStore
 * Pinia store untuk manajemen state Jadwal (Schedules).
 */
export const useScheduleStore = defineStore('transaction-schedule-module', {
  state: () => ({
    schedules: [],
    scheduleDetail: null,
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    isLoading: false,
    error: null
  }),

  actions: {
    /**
     * fetchSchedules
     * Memuat list jadwal dari API.
     */
    async fetchSchedules(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await ScheduleService.getAll(params);
        const rawData = response.data || [];
        this.schedules = rawData.map(ScheduleMapper.toUIList);
        
        if (response.pagination) {
          this.pagination = response.pagination;
        }
      } catch (err) {
        this.error = 'Gagal memuat daftar jadwal';
        console.error('Store: fetchSchedules failed', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchDetail
     * Memuat detail jadwal.
     */
    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const response = await ScheduleService.getById(id);
        this.scheduleDetail = ScheduleMapper.toUIDetail(response.data || response);
        return this.scheduleDetail;
      } catch (err) {
        console.error('Store: fetchDetail failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createSchedule
     */
    async createSchedule(formData) {
      this.isLoading = true;
      try {
        const payload = ScheduleMapper.toPayload(formData);
        const response = await ScheduleService.create(payload);
        return response;
      } catch (err) {
        console.error('Store: createSchedule failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateSchedule
     */
    async updateSchedule(id, formData) {
      this.isLoading = true;
      try {
        const payload = ScheduleMapper.toPayload(formData);
        const response = await ScheduleService.update(id, payload);
        return response;
      } catch (err) {
        console.error('Store: updateSchedule failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteSchedule
     */
    async deleteSchedule(id) {
      this.isLoading = true;
      try {
        await ScheduleService.delete(id);
        await this.fetchSchedules({ 
          page: this.pagination.currentPage, 
          limit: this.pagination.dataPerPage 
        });
      } catch (err) {
        console.error('Store: deleteSchedule failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async exportToCSV(params = {}) {
      this.isLoading = true;
      try {
        const blob = await ScheduleService.exportCSV(params);
        downloadFile(blob, `Data_Jadwal_${new Date().getTime()}.csv`);
      } catch (err) {
        console.error('Store: exportToCSV failed', err);
        this.error = 'Gagal mengekspor data jadwal';
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

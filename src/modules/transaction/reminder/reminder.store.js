import { defineStore } from 'pinia';
import { ReminderService } from './reminder.service';
import { ReminderMapper } from './reminder.mapper';

/**
 * useReminderStore
 * Pinia store untuk manajemen state Pengingat (Reminders).
 */
export const useReminderStore = defineStore('transaction-reminder-module', {
  state: () => ({
    reminders: [],
    reminderDetail: null,
    dueTodayItems: [],       // Khusus untuk endpoint /due-today
    dueTodayCount: 0,        // Jumlah reminder jatuh tempo hari ini
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
     * fetchReminders
     * Memuat list pengingat dari API.
     */
    async fetchReminders(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await ReminderService.getAll(params);
        const rawData = response.data || [];
        this.reminders = rawData.map(ReminderMapper.toUIList);
        
        if (response.pagination) {
          this.pagination = response.pagination;
        }
      } catch (err) {
        this.error = 'Gagal memuat daftar pengingat';
        console.error('Store: fetchReminders failed', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchDueToday
     * Memuat item pengingat yang jatuh tempo hari ini.
     */
    async fetchDueToday() {
      try {
        const response = await ReminderService.getDueToday();
        // API return [] directly if empty, or [{...}] if has data
        const rawData = Array.isArray(response) ? response : (response.data || []);
        this.dueTodayItems = rawData.map(ReminderMapper.toUIList);
        this.dueTodayCount = this.dueTodayItems.length;
      } catch (err) {
        console.error('Store: fetchDueToday failed', err);
      }
    },

    /**
     * fetchDetail
     * Memuat detail reminder.
     */
    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const response = await ReminderService.getById(id);
        this.reminderDetail = ReminderMapper.toUIDetail(response.data || response);
        return this.reminderDetail;
      } catch (err) {
        console.error('Store: fetchDetail failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateReminder
     * Memperbarui data reminder secara lengkap.
     */
    async updateReminder(id, formData) {
      this.isLoading = true;
      try {
        const payload = ReminderMapper.toPayload(formData);
        await ReminderService.update(id, payload);
        await this.fetchDueToday();
        return true;
      } catch (err) {
        console.error('Store: updateReminder failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * markAsDone
     * Menandai reminder selesai via PATCH.
     */
    async markAsDone(id) {
      this.isLoading = true;
      try {
        const payload = ReminderMapper.toMarkDonePayload();
        await ReminderService.patch(id, payload);
        // Refresh data
        await this.fetchDueToday();
        return true;
      } catch (err) {
        console.error('Store: markAsDone failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * reschedule
     * Memperbarui jadwal reminder via PATCH.
     */
    async reschedule(id, formData) {
      this.isLoading = true;
      try {
        const payload = ReminderMapper.toReschedulePayload(formData);
        await ReminderService.patch(id, payload);
        // Refresh data
        await this.fetchDueToday();
        return true;
      } catch (err) {
        console.error('Store: reschedule failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createReminder
     */
    async createReminder(formData) {
      this.isLoading = true;
      try {
        const payload = ReminderMapper.toPayload(formData);
        const response = await ReminderService.create(payload);
        return response;
      } catch (err) {
        console.error('Store: createReminder failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteReminder
     */
    async deleteReminder(id) {
      this.isLoading = true;
      try {
        await ReminderService.delete(id);
        await this.fetchDueToday();
      } catch (err) {
        console.error('Store: deleteReminder failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

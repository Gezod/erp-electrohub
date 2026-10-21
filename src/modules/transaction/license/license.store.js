import { defineStore } from 'pinia';
import { LicenseService } from './license.service';
import { LicenseMapper } from './license.mapper';
import { ReminderService } from '@/modules/transaction/reminder/reminder.service';
import { downloadFile } from '@/utils/file';

/**
 * useLicenseStore
 * Pinia store untuk manajemen state Lisensi (Licenses).
 */
export const useLicenseStore = defineStore('transaction-license-module', {
  state: () => ({
    licenses: [],
    licenseDetail: null,
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
     * fetchLicenses
     */
    async fetchLicenses(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await LicenseService.getAll(params);
        const rawData = response.data || [];
        this.licenses = rawData.map(LicenseMapper.toUIList);
        
        if (response.pagination) {
          this.pagination = response.pagination;
        }
      } catch (err) {
        this.error = 'Gagal memuat daftar lisensi';
        console.error('Store: fetchLicenses failed', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchDetail
     */
    async fetchDetail(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await LicenseService.getById(id);
        this.licenseDetail = LicenseMapper.toUIDetail(response.data || response);
        return this.licenseDetail;
      } catch (err) {
        this.error = 'Detail lisensi tidak ditemukan';
        console.error('Store: fetchDetail failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createLicense
     */
    async createLicense(formData) {
      this.isLoading = true;
      try {
        const payload = LicenseMapper.toPayload(formData);
        const response = await LicenseService.create(payload);

        // --- Otomatisasi Create Reminder (License Expiry) ---
        const createdId = response?.id || response?.data?.id;
        if (createdId && formData.dateExpired) {
          try {
            await ReminderService.create({
              reference_id: createdId,
              table_reference: 't_Licenses',
              reminder_type: 'license_expired',
              due_date: formData.dateExpired,
              alert_date_before: 7,
              description: `Expired: ${formData.appName} (${formData.numberLicense})`,
              status: formData.isDraft ? 'draft' : 'active'
            });
            console.log('License expiry reminder created');
          } catch (reminderErr) {
            console.error('Failed to create license reminder', reminderErr);
          }
        }

        return response;
      } catch (err) {
        console.error('Store: createLicense failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateLicense
     */
    async updateLicense(id, formData) {
      this.isLoading = true;
      try {
        const payload = LicenseMapper.toPayload(formData);
        const response = await LicenseService.update(id, payload);
        return response;
      } catch (err) {
        console.error('Store: updateLicense failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteLicense
     */
    async deleteLicense(id) {
      this.isLoading = true;
      try {
        await LicenseService.delete(id);
      } catch (err) {
        console.error('Store: deleteLicense failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async exportToCSV(params = {}) {
      this.isLoading = true;
      try {
        const blob = await LicenseService.exportCSV(params);
        downloadFile(blob, `Data_Lisensi_${new Date().getTime()}.csv`);
      } catch (err) {
        console.error('Store: exportToCSV failed', err);
        this.error = 'Gagal mengekspor data lisensi';
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

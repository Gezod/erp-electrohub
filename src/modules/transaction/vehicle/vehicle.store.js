import { defineStore } from 'pinia';
import { VehicleService } from './vehicle.service';
import { VehicleMapper } from './vehicle.mapper';
import { ReminderService } from '@/modules/transaction/reminder/reminder.service';
import { downloadFile } from '@/utils/file';

/**
 * useVehicleStore
 * Pinia store untuk manajemen state Kendaraan (Vehicles).
 */
export const useVehicleStore = defineStore('transaction-vehicle-module', {
  state: () => ({
    vehicles: [],
    vehicleDetail: null,
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
     * fetchVehicles
     */
    async fetchVehicles(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await VehicleService.getAll(params);
        const rawData = response.data || [];
        this.vehicles = rawData.map(VehicleMapper.toUIList);
        
        if (response.pagination) {
          this.pagination = response.pagination;
        }
      } catch (err) {
        this.error = 'Gagal memuat daftar kendaraan';
        console.error('Store: fetchVehicles failed', err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchDetail
     */
    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const response = await VehicleService.getById(id);
        this.vehicleDetail = VehicleMapper.toUIDetail(response.data || response);
        return this.vehicleDetail;
      } catch (err) {
        console.error('Store: fetchDetail failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createVehicle
     */
    async createVehicle(formData) {
      this.isLoading = true;
      try {
        const payload = VehicleMapper.toPayload(formData);
        const response = await VehicleService.create(payload);
        
        // --- Otomatisasi Create Reminder (STNK) ---
        const createdId = response?.id || response?.data?.id;
        if (createdId && formData.dateStnk) {
          try {
            await ReminderService.create({
              reference_id: createdId,
              table_reference: 't_Vehicles',
              reminder_type: 'stnk',
              due_date: formData.dateStnk,
              alert_date_before: 7,
              description: `STNK ${formData.plateNumber}: ${formData.nameStnk}`,
              status: 'active'
            });
            console.log('Vehicle STNK reminder created');
          } catch (reminderErr) {
            console.error('Failed to create vehicle reminder', reminderErr);
          }
        }

        return response;
      } catch (err) {
        console.error('Store: createVehicle failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateVehicle
     */
    async updateVehicle(id, formData) {
      this.isLoading = true;
      try {
        const payload = VehicleMapper.toPayload(formData);
        const response = await VehicleService.update(id, payload);
        return response;
      } catch (err) {
        console.error('Store: updateVehicle failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteVehicle
     */
    async deleteVehicle(id) {
      this.isLoading = true;
      try {
        await VehicleService.delete(id);
      } catch (err) {
        console.error('Store: deleteVehicle failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async exportToCSV(params = {}) {
      this.isLoading = true;
      try {
        const blob = await VehicleService.exportCSV(params);
        downloadFile(blob, `Data_Kendaraan_${new Date().getTime()}.csv`);
      } catch (err) {
        console.error('Store: exportToCSV failed', err);
        this.error = 'Gagal mengekspor data kendaraan';
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

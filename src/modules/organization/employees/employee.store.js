import { defineStore } from 'pinia';
import { EmployeeService } from './employee.service';
import { EmployeeMapper } from './employee.mapper';

/**
 * useEmployeeStore
 * State management terpusat untuk Manajemen Karyawan.
 */
export const useEmployeeStore = defineStore('organization-employees-module', {
  state: () => ({
    employees: [],
    employeeDetail: null,
    histories: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10,
    },
    isLoading: false,
  }),

  actions: {
    /**
     * fetchEmployees
     * Mengambil daftar karyawan untuk tampilan tabel utama.
     */
    async fetchEmployees(params = {}) {
      this.isLoading = true;
      try {
        const result = await EmployeeService.getAll(params);
        this.employees = result.data || [];

        const page = Number(params.page) || this.pagination.currentPage || 1;
        const limit = Number(params.limit) || this.pagination.dataPerPage || 10;

        if (result.pagination) {
          this.pagination = {
            currentPage: Number(result.pagination.currentPage || result.pagination.page || page),
            dataPerPage: Number(result.pagination.dataPerPage || result.pagination.limit || limit),
            totalData: Number(result.pagination.totalData ?? result.pagination.total ?? this.employees.length),
            totalPages: Number(
              result.pagination.totalPages ||
                Math.ceil(
                  Number(result.pagination.totalData ?? result.pagination.total ?? this.employees.length) / limit
                ) ||
                1
            ),
          };
        } else {
          this.pagination = {
            currentPage: page,
            dataPerPage: limit,
            totalData: this.employees.length,
            totalPages: Math.ceil(this.employees.length / limit) || 1,
          };
        }

        return this.employees;
      } catch (error) {
        console.error('Pinia: fetchEmployees failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchEmployeeDetail
     * Mengambil profil lengkap satu karyawan dan menyimpannya ke state detail.
     */
    async fetchEmployeeDetail(id) {
      this.isLoading = true;
      try {
        const detail = await EmployeeService.getById(id);
        this.employeeDetail = detail;
        this.histories = detail.histories || [];
        return detail;
      } catch (error) {
        console.error('Pinia: fetchEmployeeDetail failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createEmployee
     * Registrasi akun dan profil karyawan baru.
     */
    async createEmployee(formData) {
      this.isLoading = true;
      try {
        const result = await EmployeeService.create(formData);
        return result;
      } catch (error) {
        console.error('Pinia: createEmployee failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateEmployee
     * Memperbarui profil karyawan dan metadata mutasi.
     */
    async updateEmployee(id, formData) {
      this.isLoading = true;
      try {
        const result = await EmployeeService.updateEmployee(id, formData);
        if (this.employeeDetail && this.employeeDetail.id === id) {
          await this.fetchEmployeeDetail(id);
        }
        return result;
      } catch (error) {
        console.error('Pinia: updateEmployee failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchHistories
     * Sinkronisasi data riwayat terbaru dari server ke state.
     */
    async fetchHistories(id) {
      try {
        const histories = await EmployeeService.getHistories(id);
        this.histories = histories;
        return histories;
      } catch (error) {
        console.error('Pinia: fetchHistories failed', error);
        throw error;
      }
    },

    /**
     * createManualHistory
     * Menambahkan catatan riwayat secara manual.
     */
    async createManualHistory(id, payload) {
      try {
        const result = await EmployeeService.addManualHistory(id, payload);
        await this.fetchHistories(id);
        return result;
      } catch (error) {
        console.error('Pinia: createManualHistory failed', error);
        throw error;
      }
    },

    /**
     * deleteEmployee
     * Menghapus data karyawan secara permanen.
     */
    async deleteEmployee(id) {
      this.isLoading = true;
      try {
        await EmployeeService.delete(id);
        this.employees = this.employees.filter((emp) => emp.id !== id);
      } catch (error) {
        console.error('Pinia: deleteEmployee failed', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * uploadPhoto
     * Orchestrator untuk unggah foto karyawan.
     */
    async uploadPhoto(id, file) {
      try {
        const formData = EmployeeMapper.toPhotoFormData(file);
        const result = await EmployeeService.uploadPhoto(id, formData);

        if (this.employeeDetail && this.employeeDetail.id === id) {
          this.employeeDetail.photoUrl = result.data?.photo_url || result.photo_url;
        }

        return result;
      } catch (error) {
        console.error('Pinia: uploadPhoto failed', error);
        throw error;
      }
    },
  },
});

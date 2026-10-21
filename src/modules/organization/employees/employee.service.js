import axios from '@/plugins/axios';
import { EmployeeMapper } from './employee.mapper';
import { useAuthStore } from '../../auth/stores/auth.store';

/**
 * EmployeeService
 * Menangani komunikasi API untuk manajemen siklus hidup karyawan (HR Domain).
 */
export const EmployeeService = {
  /**
   * getAll
   * Mengambil daftar karyawan dengan pagination server-side.
   */
  getAll: async (params = {}) => {
    const authStore = useAuthStore();
    if (authStore.hasPrivilege('organization:read') || authStore.hasPrivilege('users:read')) {
      try {
        const sanitizedParams = { ...params };
        if (sanitizedParams.limit && Number(sanitizedParams.limit) > 100) {
          sanitizedParams.limit = 100;
        }
        const response = await axios.get('/users', { params: sanitizedParams });
        const rawData = response.data?.data || [];
        const rawPagination = response.data?.pagination || response.data?.meta || null;

        return {
          data: rawData.map(EmployeeMapper.toUI).filter(Boolean),
          pagination: EmployeeMapper.toPagination(rawPagination, rawData.length),
        };
      } catch (error) {
        console.error('EmployeeService.getAll error:', error);
        throw error;
      }
    }
    return { data: [], pagination: EmployeeMapper.toPagination(null, 0) };
  },

  /**
   * getById
   * Mengambil profil lengkap karyawan termasuk data nested employee & histories.
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/users/${id}`);
      return EmployeeMapper.toUI(response.data?.data || response.data);
    } catch (error) {
      console.error('EmployeeService.getById error:', error);
      throw error;
    }
  },

  /**
   * create
   * Pendaftaran akun & karyawan secara atomik.
   */
  create: async (formData) => {
    try {
      const payload = EmployeeMapper.toPayloadCreate(formData);
      const response = await axios.post('/users', payload);
      return response.data;
    } catch (error) {
      console.error('EmployeeService.create error:', error);
      throw error;
    }
  },

  /**
   * updateEmployee
   * Pembaruan data profil yang mendukung metadata mutasi (jabatan/lokasi).
   */
  updateEmployee: async (id, formData) => {
    try {
      const payload = EmployeeMapper.toPayloadUpdate(formData);
      const response = await axios.patch(`/users/${id}/employee`, payload);
      return response.data;
    } catch (error) {
      console.error('EmployeeService.updateEmployee error:', error);
      throw error;
    }
  },

  /**
   * getHistories
   * Mengambil riwayat perubahan data/jabatan karyawan secara spesifik.
   */
  getHistories: async (id) => {
    try {
      const response = await axios.get(`/users/${id}/employee/histories`);
      return response.data?.data || [];
    } catch (error) {
      console.error('EmployeeService.getHistories error:', error);
      throw error;
    }
  },

  /**
   * addManualHistory
   * Menambahkan entitas riwayat secara manual tanpa melakukan pembaruan profil utama.
   */
  addManualHistory: async (id, formData) => {
    try {
      const payload = EmployeeMapper.toPayloadHistory(formData);
      const response = await axios.post(`/users/${id}/employee/histories`, payload);
      return response.data;
    } catch (error) {
      console.error('EmployeeService.addManualHistory error:', error);
      throw error;
    }
  },

  /**
   * delete
   * Menghapus akun / data karyawan.
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('EmployeeService.delete error:', error);
      throw error;
    }
  },

  /**
   * uploadPhoto
   * Mengunggah foto profil karyawan menggunakan multipart/form-data.
   */
  uploadPhoto: async (id, formData) => {
    try {
      const response = await axios.post(`/users/${id}/employee/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('EmployeeService.uploadPhoto error:', error);
      throw error;
    }
  },
};

import axios from '@/plugins/axios';
import { LocationMapper } from './location.mapper';

/**
 * LocationService
 * Handler untuk interaksi dengan API Master Lokasi.
 */
export const LocationService = {
  /**
   * getAll
   * Mengambil daftar lokasi dengan dukungan pagination server-side.
   * Tidak mengirim parameter filter/search ke server (dilakukan di client).
   */
  getAll: async (params = {}) => {
    try {
      // params: { page, limit }
      const sanitizedParams = { ...params };
      if (sanitizedParams.limit && Number(sanitizedParams.limit) > 100) {
        sanitizedParams.limit = 100;
      }
      const response = await axios.get('/locations', { params: sanitizedParams });
      
      const rawData = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data?.data) ? response.data.data : (response.data?.locations || []));
      const pagination = response.data?.pagination || response.data?.meta || null;

      return {
        data: rawData.map(LocationMapper.toUI),
        pagination
      };
    } catch (error) {
      console.error('LocationService.getAll error:', error);
      throw error;
    }
  },

  /**
   * getById
   * Mengambil detail satu lokasi berdasarkan ID.
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/locations/${id}`);
      return LocationMapper.toUI(response.data);
    } catch (error) {
      console.error('LocationService.getById error:', error);
      throw error;
    }
  },

  /**
   * create
   * Membuat lokasi baru.
   */
  create: async (formData) => {
    const payload = LocationMapper.toPayload(formData);
    const response = await axios.post('/locations', payload);
    return response.data;
  },

  /**
   * update
   * Memperbarui data lokasi.
   */
  update: async (id, formData) => {
    const payload = LocationMapper.toPayload(formData);
    const response = await axios.put(`/locations/${id}`, payload);
    return response.data;
  },

  /**
   * delete
   * Menghapus lokasi.
   */
  delete: async (id) => {
    const response = await axios.delete(`/locations/${id}`);
    return response.data;
  }
};

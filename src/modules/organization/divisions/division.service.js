import axios from '@/plugins/axios';
import { DivisionMapper } from './division.mapper';

/**
 * DivisionService
 * Handler untuk interaksi API modul Organization Divisions.
 */
export const DivisionService = {
  /**
   * getAll
   * Mengambil daftar divisi dengan pagination server-side.
   * Mendukung parameter: { page, limit, search, chief_id }
   */
  getAll: async (params = {}) => {
    try {
      // params: { page, limit, search, chief_id, flat, is_active }
      const sanitizedParams = { ...params };
      if (sanitizedParams.limit && Number(sanitizedParams.limit) > 100) {
        sanitizedParams.limit = 100;
      }
      const response = await axios.get('/divisions', { params: sanitizedParams });
      
      const rawData = response.data?.data || [];
      const rawPagination = response.data?.pagination || response.data?.meta || null;

      return {
        data: DivisionMapper.toUIFlatten(rawData),
        pagination: DivisionMapper.toPagination(rawPagination, rawData.length),
      };
    } catch (error) {
      console.error('DivisionService.getAll error:', error);
      throw error;
    }
  },

  /**
   * getById
   * Mengambil detail lengkap satu divisi.
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/divisions/${id}`);
      return DivisionMapper.toUI(response.data?.data || response.data);
    } catch (error) {
      console.error('DivisionService.getById error:', error);
      throw error;
    }
  },

  /**
   * create
   * Membuat divisi baru.
   */
  create: async (formData) => {
    try {
      const payload = DivisionMapper.toPayload(formData);
      const response = await axios.post('/divisions', payload);
      return response.data;
    } catch (error) {
      console.error('DivisionService.create error:', error);
      throw error;
    }
  },

  /**
   * update
   * Memperbarui data divisi.
   */
  update: async (id, formData) => {
    try {
      const payload = DivisionMapper.toPayload(formData);
      const response = await axios.put(`/divisions/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('DivisionService.update error:', error);
      throw error;
    }
  },

  /**
   * delete
   * Menghapus divisi berdasarkan ID.
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/divisions/${id}`);
      return response.data;
    } catch (error) {
      console.error('DivisionService.delete error:', error);
      throw error;
    }
  }
};

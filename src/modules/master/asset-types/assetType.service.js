import axios from '@/plugins/axios';
import { AssetTypeMapper } from './assetType.mapper';

/**
 * AssetTypeService
 * Handler untuk komunikasi API modul Master Asset Type.
 */
export const AssetTypeService = {
  /**
   * getAll
   * Mendapatkan daftar tipe aset dengan dukungan pagination (bukan search API).
   */
  getAll: async (params = {}) => {
    try {
      // params: { page, limit }
      const response = await axios.get('/asset-types', { params });
      
      const rawData = response.data?.data || [];
      const pagination = response.data?.pagination || null;

      return {
        data: rawData.map(AssetTypeMapper.toUI),
        pagination
      };
    } catch (error) {
      console.error('AssetTypeService.getAll Error:', error);
      throw error;
    }
  },

  /**
   * getById
   * Mendapatkan detail satu tipe aset.
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`/asset-types/${id}`);
      return AssetTypeMapper.toUI(response.data);
    } catch (error) {
      console.error('AssetTypeService.getById Error:', error);
      throw error;
    }
  },

  /**
   * create
   * Membuat tipe aset baru.
   */
  create: async (formData) => {
    try {
      const payload = AssetTypeMapper.toPayload(formData);
      const response = await axios.post('/asset-types', payload);
      return response.data;
    } catch (error) {
      console.error('AssetTypeService.create Error:', error);
      throw error;
    }
  },

  /**
   * update
   * Memperbarui tipe aset.
   */
  update: async (id, formData) => {
    try {
      const payload = AssetTypeMapper.toPayload(formData);
      const response = await axios.put(`/asset-types/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('AssetTypeService.update Error:', error);
      throw error;
    }
  },

  /**
   * delete
   * Menghapus tipe aset berdasarkan ID.
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/asset-types/${id}`);
      return response.data;
    } catch (error) {
      console.error('AssetTypeService.delete Error:', error);
      throw error;
    }
  }
};

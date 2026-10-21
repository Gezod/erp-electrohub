import { defineStore } from 'pinia';
import { GoodsService } from '@/modules/master/goods/services/goods.service';

/**
 * useGoodsStore
 * Pinia store untuk mengelola state Master Barang.
 */
export const useGoodsStore = defineStore('goods', {
  state: () => ({
    goods: [],
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    isLoading: false,
    currentGood: null,
  }),

  actions: {
    /**
     * fetchGoods
     * Mengambil data barang dari service dengan dukungan pagination.
     */
    async fetchGoods(params = {}) {
      this.isLoading = true;
      try {
        const result = await GoodsService.getAll(params);
        this.goods = result.data;
        this.pagination = result.pagination;
      } catch (error) {
        console.error('Failed to fetch goods:', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * fetchGoodById
     * Mengambil detail satu barang untuk keperluan edit/view.
     */
    async fetchGoodById(id) {
      this.isLoading = true;
      try {
        this.currentGood = await GoodsService.getById(id);
        return this.currentGood;
      } catch (error) {
        console.error('Failed to fetch good details:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * createGood
     * Membuat data barang baru dan merefresh list.
     */
    async createGood(formData) {
      this.isLoading = true;
      try {
        const response = await GoodsService.create(formData);
        await this.fetchGoods(); 
        return response;
      } catch (error) {
        console.error('Failed to create good:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * updateGood
     * Memperbarui data barang dan merefresh list.
     */
    async updateGood(id, formData) {
      this.isLoading = true;
      try {
        const response = await GoodsService.update(id, formData);
        await this.fetchGoods();
        return response;
      } catch (error) {
        console.error('Failed to update good:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * deleteGood
     * Menghapus data barang dan merefresh list.
     */
    async deleteGood(id) {
      try {
        await GoodsService.delete(id);
        await this.fetchGoods();
      } catch (error) {
        console.error('Failed to delete good:', error);
        throw error;
      }
    }
  }
});

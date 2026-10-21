import { defineStore } from 'pinia'
import { MarketingGoodsService } from './marketingGoods.service'

export const useMarketingGoodsStore = defineStore('marketing-goods', {
  state: () => ({
    goods: [],
    pagination: { totalData: 0, currentPage: 1, totalPages: 1, dataPerPage: 10 },
    isLoading: false,
    currentGood: null,
  }),

  actions: {
    async fetchGoods(params = {}) {
      this.isLoading = true
      try {
        const result = await MarketingGoodsService.getAll(params)
        this.goods = result.data
        this.pagination = result.pagination || this.pagination
      } catch (error) {
        console.error('Failed to fetch marketing goods:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchGoodById(id) {
      this.isLoading = true
      try {
        this.currentGood = await MarketingGoodsService.getById(id)
        return this.currentGood
      } finally {
        this.isLoading = false
      }
    },

    async createGood(form) {
      const response = await MarketingGoodsService.create(form)
      await this.fetchGoods()
      return response
    },

    async updateGood(id, form) {
      const response = await MarketingGoodsService.update(id, form)
      await this.fetchGoods()
      return response
    },

    async deleteGood(id) {
      await MarketingGoodsService.delete(id)
      await this.fetchGoods()
    },
  },
})

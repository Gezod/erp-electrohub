import { defineStore } from 'pinia';
import { MarketingTransferService } from './marketingTransfer.service';
import { MarketingTransferMapper } from './marketingTransfer.mapper';

export const useMarketingTransferStore = defineStore('marketing-transfer-module', {
  state: () => ({
    transfers: [],
    transferDetail: null,
    pagination: { totalData: 0, currentPage: 1, totalPages: 1, dataPerPage: 10 },
    isLoading: false,
    stats: { by_status: {}, pending_approval_count: 0 },
  }),

  actions: {
    async fetchTransfers(params = {}) {
      this.isLoading = true;
      try {
        const res = await MarketingTransferService.getAll(params);
        this.transfers = (res.data || []).map(MarketingTransferMapper.toUIList);
        if (res.pagination) this.pagination = res.pagination;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const res = await MarketingTransferService.getById(id);
        this.transferDetail = MarketingTransferMapper.toUIDetail(res);
        return this.transferDetail;
      } finally {
        this.isLoading = false;
      }
    },

    async createTransfer(form) {
      const payload = MarketingTransferMapper.toPayload(form);
      return await MarketingTransferService.create(payload);
    },

    async fetchStats(params = {}) {
      try {
        const res = await MarketingTransferService.getStats(params);
        this.stats = {
          by_status: res?.by_status || {},
          pending_approval_count: res?.pending_approval_count || 0,
        };
      } catch (err) {
        console.error('fetchStats transfer marketing error', err);
      }
    },

    async approve(id, payload) {
      const res = await MarketingTransferService.approve(id, payload);
      await this.fetchDetail(id);
      return res;
    },

    async tolak(id, payload) {
      const res = await MarketingTransferService.tolak(id, payload);
      await this.fetchDetail(id);
      return res;
    },

    async kirim(id, payload) {
      const res = await MarketingTransferService.kirim(id, payload);
      await this.fetchDetail(id);
      return res;
    },

    async terima(id, payload) {
      const res = await MarketingTransferService.terima(id, payload);
      await this.fetchDetail(id);
      return res;
    },

    async cancel(id, payload) {
      const res = await MarketingTransferService.cancel(id, payload);
      await this.fetchDetail(id);
      return res;
    },

    async exportToCSV(params = {}) {
      const data = await MarketingTransferService.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Transfer_Marketing_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  },
});

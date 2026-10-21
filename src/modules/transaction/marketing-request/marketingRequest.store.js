import { defineStore } from 'pinia';
import { MarketingRequestService } from './marketingRequest.service';
import { MarketingRequestMapper } from './marketingRequest.mapper';

export const useMarketingRequestStore = defineStore('marketing-request-module', {
  state: () => ({
    requests: [],
    requestDetail: null,
    pagination: { totalData: 0, currentPage: 1, totalPages: 1, dataPerPage: 10 },
    isLoading: false,
  }),

  actions: {
    async fetchRequests(params = {}) {
      this.isLoading = true;
      try {
        const res = await MarketingRequestService.getAll(params);
        this.requests = (res.data || []).map(MarketingRequestMapper.toUIList);

        if (res.meta) {
          this.pagination = {
            currentPage: res.meta.page || 1,
            dataPerPage: res.meta.limit || 10,
            totalData: res.meta.total || 0,
            totalPages: res.meta.totalPages || 1,
          };
        } else if (res.pagination) {
          this.pagination = res.pagination;
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const res = await MarketingRequestService.getById(id);
        this.requestDetail = MarketingRequestMapper.toUIDetail(res.data || res);
        return this.requestDetail;
      } finally {
        this.isLoading = false;
      }
    },

    async createRequest(form, items) {
      const payload = MarketingRequestMapper.toPayload(form, items);
      return await MarketingRequestService.create(payload);
    },

    async updateRequest(id, form, items) {
      this.isLoading = true;
      try {
        const payload = MarketingRequestMapper.toPayload(form, items);
        const res = await MarketingRequestService.update(id, payload);
        return res;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteRequest(id) {
      this.isLoading = true;
      try {
        return await MarketingRequestService.remove(id);
      } finally {
        this.isLoading = false;
      }
    },

    async updateProcessor(id, payload) {
      this.isLoading = true;
      try {
        const res = await MarketingRequestService.updateProcessor(id, payload);
        await this.fetchDetail(id);
        return res;
      } finally {
        this.isLoading = false;
      }
    },

    async updateStatus(id, payload) {
      const res = await MarketingRequestService.updateStatus(id, payload);
      await this.fetchDetail(id);
      return res;
    },

    async escalate(id) {
      const res = await MarketingRequestService.escalate(id);
      await this.fetchDetail(id);
      return res;
    },

    async createPurchase(id, payload) {
      return await MarketingRequestService.createPurchase(id, payload);
    },

    async exportToCSV(params = {}) {
      const data = await MarketingRequestService.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Pengajuan_Marketing_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  },
});

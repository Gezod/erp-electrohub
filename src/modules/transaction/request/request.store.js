import { defineStore } from 'pinia';
import { RequestService } from './request.service';
import { RequestMapper } from './request.mapper';
import { downloadFile } from '@/utils/file';

/**
 * useRequestStore
 * Pinia store for Request (Pengajuan) module.
 */
export const useRequestStore = defineStore('transaction-request-module', {
  state: () => ({
    requests: [],
    requestDetail: null,
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10,
    },
    isLoading: false,
    stockCheckData: { items: [] },
    error: null,
  }),

  actions: {
    /** Fetch requests list */
    async fetchRequests(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await RequestService.getAll(params);
        const rawData = response.data || [];
        this.requests = rawData.map(RequestMapper.toUIList);

        if (response.meta) {
          this.pagination = {
            currentPage: response.meta.page || 1,
            dataPerPage: response.meta.limit || 10,
            totalData: response.meta.total || 0,
            totalPages: response.meta.totalPages || 1,
          };
        } else if (response.pagination) {
          this.pagination = response.pagination;
        }
      } catch (err) {
        this.error = err.message || 'Gagal memuat daftar permintaan';
        console.error('Store: fetchRequests failed', err);
      } finally {
        this.isLoading = false;
      }
    },

    /** Fetch request detail */
    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const response = await RequestService.getById(id);
        this.requestDetail = RequestMapper.toUIDetail(response.data || response);
        return this.requestDetail;
      } catch (err) {
        console.error('Store: fetchDetail failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Create request */
    async createRequest(headerData, itemsData) {
      this.isLoading = true;
      try {
        const payload = RequestMapper.toCreatePayload(headerData, itemsData);
        return await RequestService.create(payload);
      } catch (err) {
        console.error('Store: createRequest failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Update request */
    async updateRequest(id, headerData, itemsData) {
      this.isLoading = true;
      try {
        const payload = RequestMapper.toCreatePayload(headerData, itemsData);
        const { items, ...headerPayload } = payload;
        
        await Promise.all([
          RequestService.update(id, headerPayload),
          RequestService.updateItems(id, { items })
        ]);
        
        if (headerData.status && headerData.status !== 'draft') {
          await RequestService.updateStatus(id, { status: headerData.status });
        }
        return true;
      } catch (err) {
        console.error('Store: updateRequest failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Update status */
    async updateStatus(id, payload) {
      this.isLoading = true;
      try {
        const response = await RequestService.updateStatus(id, payload);
        await this.fetchDetail(id);
        return response;
      } catch (err) {
        console.error('Store: updateStatus failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async checkStock(id) {
      this.isLoading = true;
      try {
        const res = await RequestService.checkStock(id);
        this.stockCheckData = res?.data || res || { items: [] };
        return this.stockCheckData;
      } catch (err) {
        console.error('Store: checkStock failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Create purchase from request */
    async createPurchase(id, payload) {
      this.isLoading = true;
      try {
        const response = await RequestService.createPurchase(id, payload);
        await this.fetchDetail(id);
        return response;
      } catch (err) {
        console.error('Store: createPurchase failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Delete request */
    async deleteRequest(id) {
      this.isLoading = true;
      try {
        await RequestService.deleteRequest(id);
        await this.fetchRequests({
          page: this.pagination.currentPage,
          limit: this.pagination.dataPerPage,
        });
      } catch (err) {
        console.error('Store: deleteRequest failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Link manual item to master */
    async linkItemToMaster(id, detailId, goodId) {
      this.isLoading = true;
      try {
        await RequestService.linkItemToMaster(id, detailId, goodId);
        await this.fetchDetail(id);
      } catch (err) {
        console.error('Store: linkItemToMaster failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async assignPic(id, picId) {
      this.isLoading = true;
      try {
        const response = await RequestService.assignPic(id, picId);
        this.requestDetail = RequestMapper.toUIDetail(response.data || response);
        return this.requestDetail;
      } catch (err) {
        console.error('Store: assignPic failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Ambil kandidat lokasi stok GLOBAL PIC Penyerah untuk seluruh item request */
    async fetchStockLocations(id) {
      try {
        const res = await RequestService.getStockLocations(id);
        return res?.data || res || { multi: false, locations: [] };
      } catch (err) {
        console.error('Store: fetchStockLocations failed', err);
        throw err;
      }
    },

    /** Set lokasi stok sumber GLOBAL lalu refresh detail + stock-check */
    async setRequestSourceLocation(id, locationId) {
      this.isLoading = true;
      try {
        await RequestService.setRequestSourceLocation(id, locationId);
        const res = await RequestService.checkStock(id);
        this.stockCheckData = res?.data || res || { items: [] };
        await this.fetchDetail(id);
        return this.stockCheckData;
      } catch (err) {
        console.error('Store: setRequestSourceLocation failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async handleRefreshStock(id) {
      this.isLoading = true;
      try {
        const res = await RequestService.checkStock(id);
        this.stockCheckData = res?.data || res || { items: [] };
        await this.fetchDetail(id);
        return this.stockCheckData;
      } catch (err) {
        console.error('Store: handleRefreshStock failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async exportToCSV(params = {}) {
      this.isLoading = true;
      try {
        const blob = await RequestService.exportCSV(params);
        downloadFile(blob, `Request_Report_${new Date().getTime()}.csv`);
      } catch (err) {
        console.error('exportToCSV error', err);
        this.error = 'Gagal mengekspor data.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  },
});

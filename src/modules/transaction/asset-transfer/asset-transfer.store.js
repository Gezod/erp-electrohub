import { defineStore } from 'pinia';
import { AssetTransferService } from './asset-transfer.service';
import { AssetTransferMapper } from './asset-transfer.mapper';
import { downloadFile } from '@/utils/file';

export const useAssetTransferStore = defineStore('transaction-asset-transfer-module', {
  state: () => ({
    transfers: [],
    transferDetail: null,
    isLoading: false,
    error: null,
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    }
  }),

  actions: {
    async fetchTransfers(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await AssetTransferService.getAll(params);
        const rawData = res.data || (Array.isArray(res) ? res : []);
        this.transfers = rawData.map(AssetTransferMapper.toUIList);
        
        const meta = res.meta || res.pagination || res.data?.meta || res.data?.pagination;
        if (meta) {
          const totalData = meta.totalData ?? meta.total ?? 0;
          const dataPerPage = meta.dataPerPage ?? meta.limit ?? 10;
          const currentPage = meta.currentPage ?? meta.page ?? 1;
          const totalPages = meta.totalPages ?? (Math.ceil(totalData / dataPerPage) || 1);

          this.pagination = {
            totalData,
            currentPage,
            totalPages,
            dataPerPage
          };
        }
      } catch (err) {
        console.error('fetchTransfers error', err);
        this.error = 'Gagal memuat data perpindahan aset.';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const res = await AssetTransferService.getById(id);
        this.transferDetail = AssetTransferMapper.toUIDetail(res.data || res);
        return this.transferDetail;
      } catch (err) {
        console.error('fetchDetail error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createTransfer(form) {
      this.isLoading = true;
      try {
        const payload = AssetTransferMapper.toPayload(form);
        const res = await AssetTransferService.create(payload);
        return res;
      } catch (err) {
        console.error('createTransfer error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateStatus(id, payload) {
      this.isLoading = true;
      try {
        const res = await AssetTransferService.updateStatus(id, payload);
        await this.fetchDetail(id);
        return res;
      } catch (err) {
        console.error('updateStatus error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteTransfer(id) {
      this.isLoading = true;
      try {
        await AssetTransferService.delete(id);
        await this.fetchTransfers();
      } catch (err) {
        console.error('deleteTransfer error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async exportToCSV(params = {}) {
      this.isLoading = true;
      try {
        const blob = await AssetTransferService.exportCSV(params);
        const name = params.type === 'stock' ? 'Stock_Transfer_Report' : 'Asset_Transfer_Report';
        downloadFile(blob, `${name}_${new Date().getTime()}.csv`);
      } catch (err) {
        console.error('exportToCSV error', err);
        this.error = 'Gagal mengekspor data.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});

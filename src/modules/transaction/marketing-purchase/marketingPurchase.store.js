import { defineStore } from 'pinia';
import { MarketingPurchaseService } from './marketingPurchase.service';
import { MarketingPurchaseMapper } from './marketingPurchase.mapper';

export const useMarketingPurchaseStore = defineStore('marketing-purchase-module', {
  state: () => ({
    purchases: [],
    purchaseDetail: null,
    pagination: { totalData: 0, currentPage: 1, totalPages: 1, dataPerPage: 10 },
    isLoading: false,
    stats: null,
  }),

  actions: {
    async fetchPurchases(params = {}) {
      this.isLoading = true;
      try {
        const res = await MarketingPurchaseService.getAll(params);
        this.purchases = (res.data || []).map(MarketingPurchaseMapper.toUIList);
        if (res.pagination) this.pagination = res.pagination;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const res = await MarketingPurchaseService.getById(id);
        this.purchaseDetail = MarketingPurchaseMapper.toUIDetail(res);
        return this.purchaseDetail;
      } finally {
        this.isLoading = false;
      }
    },

    async createPurchase(form, items) {
      const payload = MarketingPurchaseMapper.toFormData(form, items);
      return await MarketingPurchaseService.create(payload);
    },

    async updatePurchase(id, form, items) {
      const payload = MarketingPurchaseMapper.toFormData(form, items);
      return await MarketingPurchaseService.update(id, payload);
    },

    async updateStatus(id, payload) {
      const res = await MarketingPurchaseService.updateStatus(id, payload);
      await this.fetchDetail(id); // Refresh detail after status change
      // action_results tidak persisten di DB (live receipt saja) — fetchDetail() di atas
      // meng-overwrite purchaseDetail dari GET /:id yang tidak membawanya, jadi harus
      // di-merge manual dari response PATCH ini supaya card hasil eksekusi terisi.
      if (this.purchaseDetail && res?.action_results) {
        this.purchaseDetail.actionResults = res.action_results;
      }
      return res;
    },

    async updateEvidence(id, formData) {
      const res = await MarketingPurchaseService.updateEvidence(id, formData);
      this.purchaseDetail = MarketingPurchaseMapper.toUIDetail(res);
      return res;
    },

    /**
     * Sinkronkan evidences + mirror dari balasan endpoint yang mengembalikan
     * objek purchase lengkap (POST dan DELETE /:id/evidences). Sengaja mem-PATCH
     * field turunan-evidence saja, bukan mengganti purchaseDetail bulat-bulat.
     */
    _applyPurchaseEvidences(res) {
      const data = res?.data || res;
      if (!data || !this.purchaseDetail) return false;
      if (!Array.isArray(data.evidences)) return false;

      this.purchaseDetail.evidences = data.evidences
        .map(MarketingPurchaseMapper.toUIEvidence)
        .filter(Boolean);
      this.purchaseDetail.evidencePurchase = data.evidence_purchase ?? null;
      this.purchaseDetail.evidenceDone = data.evidence_done ?? null;
      return true;
    },

    /** Ambil daftar dokumen. Endpoint ini membalas ARRAY telanjang. */
    async fetchEvidences(id) {
      const res = await MarketingPurchaseService.getEvidences(id);
      const list = (Array.isArray(res) ? res : res?.data || [])
        .map(MarketingPurchaseMapper.toUIEvidence)
        .filter(Boolean);
      if (this.purchaseDetail) this.purchaseDetail.evidences = list;
      return list;
    },

    /** Unggah banyak dokumen (file + link) sekaligus. */
    async uploadEvidences(id, payload) {
      if (!MarketingPurchaseMapper.hasEvidencePayload(payload)) {
        throw new Error('Tidak ada dokumen pendukung yang dikirim');
      }
      const body = MarketingPurchaseMapper.toEvidenceFormData(payload);
      const res = await MarketingPurchaseService.uploadEvidences(id, body);
      if (!this._applyPurchaseEvidences(res) && this.purchaseDetail) {
        await this.fetchEvidences(id); // fallback defensif
      }
      return res;
    },

    /** Ubah metadata satu dokumen. Balasan hanya satu objek Evidence. */
    async updateEvidenceMeta(id, evidenceId, payload) {
      const res = await MarketingPurchaseService.updateEvidenceMeta(id, evidenceId, payload);
      const updated = MarketingPurchaseMapper.toUIEvidence(res?.data || res);
      const list = this.purchaseDetail?.evidences;
      if (list && updated) {
        const idx = list.findIndex((e) => e.id === updated.id);
        if (idx !== -1) list.splice(idx, 1, updated);
      }
      return updated;
    },

    /** Hapus satu dokumen. Mirror otomatis bergeser di sisi backend. */
    async deleteEvidence(id, evidenceId) {
      const res = await MarketingPurchaseService.deleteEvidence(id, evidenceId);
      if (!this._applyPurchaseEvidences(res) && this.purchaseDetail) {
        await this.fetchEvidences(id); // fallback defensif
      }
      return res;
    },

    async fetchStats(params = {}) {
      try {
        this.stats = await MarketingPurchaseService.getStats(params);
      } catch (err) {
        console.error('fetchStats error', err);
      }
    },

    async hardDeletePurchase(id) {
      this.isLoading = true;
      try {
        return await MarketingPurchaseService.hardDelete(id);
      } finally {
        this.isLoading = false;
      }
    },

    async exportToCSV(params = {}) {
      const data = await MarketingPurchaseService.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Purchase_Marketing_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  },
});

import { defineStore } from 'pinia';
import { PurchaseService } from './purchase.service';
import { PurchaseMapper } from './purchase.mapper';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { downloadFile } from '@/utils/file';

export const usePurchaseStore = defineStore('transaction-purchase-module', {
  state: () => ({
    purchases: [],
    purchaseDetail: null,
    stats: null,
    pagination: {
      totalData: 0,
      currentPage: 1,
      totalPages: 1,
      dataPerPage: 10
    },
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchPurchases(params = {}) {
      this.isLoading = true;
      try {
        const res = await PurchaseService.getAll(params);
        // Handle both { data: [...] } and direct array [...]
        const rawData = res.data || (Array.isArray(res) ? res : []);
        console.log('Purchase raw data:', rawData);
        this.purchases = rawData.map(PurchaseMapper.toUIList);
        
        // Handle metadata from various common locations
        const meta = res.meta || res.pagination || res.data?.meta || res.data?.pagination;
        if (meta) {
          this.pagination = {
            totalData: meta.total || meta.totalData || 0,
            currentPage: meta.page || meta.currentPage || 1,
            totalPages: meta.totalPages || 1,
            dataPerPage: meta.limit || meta.dataPerPage || 10
          };
        }
      } catch (err) {
        console.error('fetchPurchases error', err);
        this.error = 'Gagal memuat data pembelian.';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchStats(params = {}) {
      try {
        // page/limit tidak relevan untuk agregat — buang agar query bersih.
        const { page, limit, ...statsParams } = params;
        const res = await PurchaseService.getStats(statsParams);
        this.stats = res.data || res;
      } catch (err) {
        console.error('fetchStats error', err);
      }
    },

    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const res = await PurchaseService.getById(id);
        // Handle both { data: { ... } } and direct object { ... }
        this.purchaseDetail = PurchaseMapper.toUIDetail(res.data || res);
        return this.purchaseDetail;
      } catch (err) {
        console.error('fetchDetail error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createPurchase(form, items) {
      this.isLoading = true;
      try {
        const payload = PurchaseMapper.toFormData(form, items);
        const res = await PurchaseService.create(payload);
        return res;
      } catch (err) {
        console.error('createPurchase error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updatePurchase(id, form, items = []) {
      this.isLoading = true;
      try {
        const payload = PurchaseMapper.toFormData(form, items);
        const res = await PurchaseService.update(id, payload);
        return res;
      } catch (err) {
        console.error('updatePurchase error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateItems(id, items) {
      this.isLoading = true;
      try {
        const payload = {
          items: items.map(it => ({
            good_id: it.goodId || null,
            item_name: it.itemName || it.search || '',
            qty_purchase: Number(it.qtyPurchase),
            unit_price: Number(it.unitPrice),
            notes: it.notes || null
          }))
        };
        const res = await PurchaseService.updateItems(id, payload);
        return res;
      } catch (err) {
        console.error('updateItems error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateStatus(id, payload) {
      this.isLoading = true;
      try {
        // Dokumen pendukung tidak lagi menumpang endpoint status, sehingga
        // payload selalu JSON polos (items dikirim sebagai array JSON asli).
        const res = await PurchaseService.updateStatus(id, payload);
        await this.fetchDetail(id); // Refresh detail after status change
        // action_results tidak persisten di DB (live receipt saja) — fetchDetail() di atas
        // meng-overwrite purchaseDetail dari GET /:id yang tidak membawanya, jadi harus
        // di-merge manual dari response PATCH ini supaya card "Hasil Eksekusi Transaksi" terisi.
        if (this.purchaseDetail && res?.action_results) {
          this.purchaseDetail.actionResults = res.action_results;
        }
        return res;
      } catch (err) {
        console.error('updateStatus error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Sinkronkan evidences + mirror dari balasan endpoint yang mengembalikan
     * objek purchase lengkap (POST dan DELETE /:id/evidences).
     *
     * Sengaja mem-PATCH field turunan-evidence saja, bukan mengganti
     * purchaseDetail bulat-bulat: tidak ada jaminan balasan endpoint evidence
     * menyertakan relasi (details/location/ga_pic/request) selengkap GET /:id,
     * dan mengganti seluruhnya berisiko mengosongkan tabel item.
     */
    _applyPurchaseEvidences(res) {
      const data = res?.data || res;
      if (!data || !this.purchaseDetail) return false;
      if (!Array.isArray(data.evidences)) return false;

      this.purchaseDetail.evidences = data.evidences
        .map(PurchaseMapper.toUIEvidence)
        .filter(Boolean);
      this.purchaseDetail.evidencePurchase = data.evidence_purchase ?? null;
      this.purchaseDetail.evidenceDone = data.evidence_done ?? null;
      return true;
    },

    /** Ambil daftar dokumen. Endpoint ini membalas ARRAY telanjang. */
    async fetchEvidences(id) {
      try {
        const res = await PurchaseService.getEvidences(id);
        const list = (Array.isArray(res) ? res : res?.data || [])
          .map(PurchaseMapper.toUIEvidence)
          .filter(Boolean);
        if (this.purchaseDetail) this.purchaseDetail.evidences = list;
        return list;
      } catch (err) {
        console.error('fetchEvidences error', err);
        throw err;
      }
    },

    /** Unggah banyak dokumen (file + link) sekaligus. */
    async uploadEvidences(id, payload) {
      if (!PurchaseMapper.hasEvidencePayload(payload)) {
        throw new Error('Tidak ada dokumen pendukung yang dikirim');
      }

      this.isLoading = true;
      try {
        const body = PurchaseMapper.toEvidenceFormData(payload);
        const res = await PurchaseService.uploadEvidences(id, body);
        // Balasan sudah memuat purchase lengkap — tidak perlu GET susulan.
        if (!this._applyPurchaseEvidences(res) && this.purchaseDetail) {
          await this.fetchEvidences(id); // fallback defensif
        }
        return res;
      } catch (err) {
        console.error('uploadEvidences error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Ubah metadata satu dokumen. Balasan hanya satu objek Evidence. */
    async updateEvidenceMeta(id, evidenceId, payload) {
      try {
        const res = await PurchaseService.updateEvidenceMeta(id, evidenceId, payload);
        const updated = PurchaseMapper.toUIEvidence(res?.data || res);
        const list = this.purchaseDetail?.evidences;
        if (list && updated) {
          const idx = list.findIndex(e => e.id === updated.id);
          if (idx !== -1) list.splice(idx, 1, updated);
        }
        return updated;
      } catch (err) {
        console.error('updateEvidenceMeta error', err);
        throw err;
      }
    },

    /** Hapus satu dokumen. Mirror otomatis bergeser di sisi backend. */
    async deleteEvidence(id, evidenceId) {
      this.isLoading = true;
      try {
        const res = await PurchaseService.deleteEvidence(id, evidenceId);
        if (!this._applyPurchaseEvidences(res) && this.purchaseDetail) {
          await this.fetchEvidences(id); // fallback defensif
        }
        return res;
      } catch (err) {
        console.error('deleteEvidence error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deletePurchase(id) {
      this.isLoading = true;
      try {
        await PurchaseService.delete(id);
      } catch (err) {
        console.error('deletePurchase error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async hardDeletePurchase(id) {
      this.isLoading = true;
      try {
        await PurchaseService.hardDelete(id);
      } catch (err) {
        console.error('hardDeletePurchase error', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async exportToCSV(params = {}) {
      this.isLoading = true;
      try {
        const blob = await PurchaseService.exportCSV(params);
        downloadFile(blob, `Purchase_Report_${new Date().getTime()}.csv`);
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

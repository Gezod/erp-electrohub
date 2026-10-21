import { defineStore } from 'pinia';
import { ScSkuService } from './scSku.service';
import { ScSkuMapper } from './scSku.mapper';

export const useScSkuStore = defineStore('sc-sku-module', {
  state: () => ({
    // Alias: items & skus menunjuk data yang sama (skus untuk backward compat)
    items: [],
    detail: null,
    pagination: { totalData: 0, currentPage: 1, totalPages: 1, dataPerPage: 10 },
    isLoading: false,
  }),

  getters: {
    // backward-compat alias agar composable useScSku & komponen lain tetap jalan
    skus: (state) => state.items,
  },

  actions: {
    // --- Fetch List ---
    async fetchItems(params = {}) {
      this.isLoading = true;
      try {
        const res = await ScSkuService.getAll(params);
        this.items = (res.data || []).map(ScSkuMapper.toUIList);
        if (res.pagination) {
          this.pagination = res.pagination;
        }
      } finally {
        this.isLoading = false;
      }
    },

    // Alias agar composable useScSku bisa panggil store.fetchSkus()
    async fetchSkus(params = {}) {
      return this.fetchItems(params);
    },

    // --- Fetch Detail ---
    async fetchDetail(id) {
      this.isLoading = true;
      try {
        const res = await ScSkuService.getById(id);
        this.detail = ScSkuMapper.toUIDetail(res.data || res);
        return this.detail;
      } finally {
        this.isLoading = false;
      }
    },

    // Alias agar ScSkuFormModal bisa panggil store.fetchSkuById()
    async fetchSkuById(id) {
      return this.fetchDetail(id);
    },

    // --- Create ---
    async createItem(form) {
      this.isLoading = true;
      try {
        const payload = ScSkuMapper.toPayload(form);
        const res = await ScSkuService.create(payload);
        return res;
      } finally {
        this.isLoading = false;
      }
    },

    // Alias agar ScSkuFormModal bisa panggil store.createSku()
    async createSku(form) {
      return this.createItem(form);
    },

    // --- Update ---
    async updateItem(id, form) {
      this.isLoading = true;
      try {
        const payload = ScSkuMapper.toPayload(form);
        const res = await ScSkuService.update(id, payload);
        return res;
      } finally {
        this.isLoading = false;
      }
    },

    // Alias agar ScSkuFormModal bisa panggil store.updateSku()
    async updateSku(id, form) {
      return this.updateItem(id, form);
    },

    // --- Delete ---
    async deleteItem(id) {
      this.isLoading = true;
      try {
        return await ScSkuService.remove(id);
      } finally {
        this.isLoading = false;
      }
    },

    // Alias agar index.vue bisa panggil store.deleteSku()
    async deleteSku(id) {
      return this.deleteItem(id);
    },
  },
});

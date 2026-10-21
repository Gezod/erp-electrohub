import { defineStore } from 'pinia';
import { PurchaseCartService } from './purchase-cart.service';
import { PurchaseCartMapper } from './purchase-cart.mapper';
import { PurchaseMapper } from '@/modules/transaction/purchase/purchase.mapper';

/**
 * usePurchaseCartStore
 * Pinia store for Keranjang Pembelian (Purchase Cart) module.
 */
export const usePurchaseCartStore = defineStore('transaction-purchase-cart-module', {
  state: () => ({
    items: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    /** Fetch the logged-in user's cart */
    async fetchCart() {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await PurchaseCartService.getAll();
        // Handle both { data: [...] } and direct array [...]
        const rawData = res.data || (Array.isArray(res) ? res : []);
        this.items = rawData.map(PurchaseCartMapper.toUIList);
      } catch (err) {
        console.error('Store: fetchCart failed', err);
        this.error = err.response?.data?.message || 'Gagal memuat keranjang pembelian.';
      } finally {
        this.isLoading = false;
      }
    },

    /** Add (or merge) a request-item line into the cart. Omit qty to add the full remaining qty_request. */
    async addItem(detailRequestId, qty = undefined) {
      this.isLoading = true;
      try {
        const payload = { detail_request_id: detailRequestId };
        if (qty !== undefined && qty !== null) payload.qty = Number(qty);
        const res = await PurchaseCartService.addItem(payload);
        await this.fetchCart();
        return PurchaseCartMapper.toUIList(res.data || res);
      } catch (err) {
        console.error('Store: addItem failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Increase qty of an existing cart line (amount must be > 0) */
    async increaseQty(cartItemId, amount) {
      this.isLoading = true;
      try {
        const res = await PurchaseCartService.increase(cartItemId, amount);
        await this.fetchCart();
        return PurchaseCartMapper.toUIList(res.data || res);
      } catch (err) {
        console.error('Store: increaseQty failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Remove a cart line entirely (the only way to reduce/undo a line) */
    async removeItem(cartItemId) {
      this.isLoading = true;
      try {
        const res = await PurchaseCartService.remove(cartItemId);
        await this.fetchCart();
        return res;
      } catch (err) {
        console.error('Store: removeItem failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /** Checkout the whole cart: creates one draft Purchase per distinct destination location */
    async checkout(picGa) {
      this.isLoading = true;
      try {
        const res = await PurchaseCartService.checkout(picGa);
        const rawData = res.data || (Array.isArray(res) ? res : []);
        const purchases = rawData.map(PurchaseMapper.toUIList);
        await this.fetchCart();
        return purchases;
      } catch (err) {
        console.error('Store: checkout failed', err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

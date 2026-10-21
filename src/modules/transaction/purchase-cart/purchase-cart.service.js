import axios from '@/plugins/axios';

/**
 * PurchaseCartService
 * API communication for Keranjang Pembelian (Purchase Cart) module.
 * Base path: /ga/purchase-cart
 *
 * NOTE: these endpoints use the raw ok()/created() response helpers
 * (res.json(data) directly) on the backend, NOT the paginated wrapper -
 * so response.data here IS the payload itself (array or object).
 */
export const PurchaseCartService = {
  /** Get the logged-in user's own cart (array of CartItem, sorted by location then created_at) */
  getAll: async () => {
    const response = await axios.get('/ga/purchase-cart');
    return response.data;
  },

  /** Add (or merge) an item into the cart from a request detail line */
  addItem: async (payload) => {
    const response = await axios.post('/ga/purchase-cart/items', payload);
    return response.data;
  },

  /** Increase qty of an existing cart line (amount must be > 0) */
  increase: async (id, amount) => {
    const response = await axios.patch(`/ga/purchase-cart/items/${id}/increase`, { amount });
    return response.data;
  },

  /** Remove a cart line entirely */
  remove: async (id) => {
    const response = await axios.delete(`/ga/purchase-cart/items/${id}`);
    return response.data;
  },

  /** Checkout the whole cart: creates one draft Purchase per distinct destination location */
  checkout: async (picGa) => {
    const response = await axios.post('/ga/purchase-cart/checkout', { pic_ga: picGa });
    return response.data;
  }
};

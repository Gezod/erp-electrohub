/**
 * LocalStorage Mock Engine
 * Mengelola persistensi data dummy di browser untuk operasi CRUD.
 */

const STORAGE_PREFIX = 'erp_mock_';
const MOCK_VERSION = 'v2_refangga_lintar';

// Auto-sync jika versi mock data diperbarui
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  if (localStorage.getItem('erp_mock_ver') !== MOCK_VERSION) {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(STORAGE_PREFIX) || k === 'user' || k === 'privileges') {
        localStorage.removeItem(k);
      }
    });
    localStorage.setItem('erp_mock_ver', MOCK_VERSION);
  }
}

export const storage = {
  get(key, defaultData = []) {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      this.set(key, defaultData);
      return defaultData;
    } catch (e) {
      console.warn(`[MockStorage] Error reading ${key}:`, e);
      return defaultData;
    }
  },

  set(key, data) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.warn(`[MockStorage] Error saving ${key}:`, e);
    }
  },

  getAll(key, defaultData = [], params = {}) {
    let items = [...this.get(key, defaultData)];

    // Filtering by exact keys if provided in params
    if (params) {
      const filterKeys = Object.keys(params).filter(
        k => !['page', 'limit', 'search', 'q', 'sort', 'order'].includes(k)
      );

      for (const k of filterKeys) {
        const val = params[k];
        if (val !== undefined && val !== null && val !== '') {
          items = items.filter(item => {
            if (val === 'true' || val === true) return item[k] === true || item[k] === 1;
            if (val === 'false' || val === false) return item[k] === false || item[k] === 0;
            return String(item[k]).toLowerCase() === String(val).toLowerCase();
          });
        }
      }

      // Search filtering
      const searchTerm = (params.search || params.q || '').trim().toLowerCase();
      if (searchTerm) {
        items = items.filter(item => {
          return Object.values(item).some(v => {
            if (typeof v === 'string' || typeof v === 'number') {
              return String(v).toLowerCase().includes(searchTerm);
            }
            if (typeof v === 'object' && v !== null) {
              return Object.values(v).some(subV => 
                (typeof subV === 'string' || typeof subV === 'number') &&
                String(subV).toLowerCase().includes(searchTerm)
              );
            }
            return false;
          });
        });
      }
    }

    const total = items.length;
    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || total || 10;
    const start = (page - 1) * limit;
    const paginatedItems = limit > 0 ? items.slice(start, start + limit) : items;

    return {
      data: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 1
      }
    };
  },

  getById(key, defaultData = [], id) {
    const items = this.get(key, defaultData);
    return items.find(item => String(item.id) === String(id)) || null;
  },

  create(key, defaultData = [], payload = {}) {
    const items = this.get(key, defaultData);
    const newId = payload.id || `id_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newItem = {
      ...payload,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    items.unshift(newItem);
    this.set(key, items);
    return newItem;
  },

  update(key, defaultData = [], id, payload = {}) {
    const items = this.get(key, defaultData);
    const index = items.findIndex(item => String(item.id) === String(id));
    if (index === -1) {
      return this.create(key, defaultData, { ...payload, id });
    }
    const updatedItem = {
      ...items[index],
      ...payload,
      id: items[index].id,
      updated_at: new Date().toISOString()
    };
    items[index] = updatedItem;
    this.set(key, items);
    return updatedItem;
  },

  delete(key, defaultData = [], id) {
    let items = this.get(key, defaultData);
    items = items.filter(item => String(item.id) !== String(id));
    this.set(key, items);
    return { success: true, message: 'Data berhasil dihapus' };
  },

  reset(key, defaultData) {
    this.set(key, defaultData);
  }
};

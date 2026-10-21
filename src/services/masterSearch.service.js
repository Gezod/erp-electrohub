import { GoodsService } from '@/modules/master/goods/services/goods.service';
import { CategoryService } from '@/modules/master/categories/category.service';
import { LocationService } from '@/modules/master/locations/location.service';
import { PositionService } from '@/modules/master/positions/position.service';
import { PositionMapper } from '@/modules/master/positions/position.mapper';
import { UomService } from '@/modules/master/uom/uom.service';
import { AssetTypeService } from '@/modules/master/asset-types/assetType.service';
import { DivisionService } from '@/modules/organization/divisions/division.service';
import { EmployeeService } from '@/modules/organization/employees/employee.service';
import { MarketingGoodsService } from '@/modules/master/marketing-goods/marketingGoods.service';
import { ScCategoryService } from '@/modules/master/sc-categories/scCategory.service';

/**
 * Master Registry Configurations
 * Memetakan setiap master module dengan:
 * - service fetcher (getAll)
 * - single item fetcher (getById)
 * - default filters (misal: is_active: true)
 * - default label formatter & value extractor
 * - placeholder & empty text
 */
const MASTER_REGISTRY = {
  // 1. Goods (Barang)
  goods: {
    fetchList: async (params) => {
      const res = await GoodsService.getAll(params);
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return raw.map((item) => {
        const name = item.good_name || item.goodName || item.name || '';
        const sub = [
          item.good_code || item.goodCode,
          item.merk && item.merk !== '-' ? item.merk : null,
        ].filter(Boolean).join(' • ');
        const label = sub ? `${name} (${sub})` : name;
        return {
          ...item,
          id: item.id || '',
          value: item.id || '',
          name: name,
          label: label,
        };
      });
    },
    fetchById: async (id) => {
      return await GoodsService.getById(id);
    },
    defaultFilters: { is_active: true },
    optionLabel: (item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (item.label) return item.label;
      const name = item.good_name || item.goodName || item.name || '';
      const sub = [
        item.good_code || item.goodCode,
        item.merk && item.merk !== '-' ? item.merk : null,
      ].filter(Boolean).join(' • ');
      return sub ? `${name} (${sub})` : name;
    },
    optionValue: 'id',
    searchPlaceholder: 'Cari nama, kode atau merk barang...',
    emptyText: 'Barang tidak ditemukan',
  },

  // 2. Categories (Kategori)
  categories: {
    fetchList: async (params) => {
      const res = await CategoryService.getAll(params);
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return raw.map((item) => {
        const name = item.name_category || item.name || item.label || '';
        return {
          ...item,
          id: item.id || '',
          value: item.id || '',
          name: name,
          label: name,
        };
      });
    },
    fetchById: async (id) => {
      return await CategoryService.getById(id);
    },
    defaultFilters: { is_active: true },
    optionLabel: (item) => item?.label || item?.name_category || item?.name || '',
    optionValue: 'id',
    searchPlaceholder: 'Cari nama atau deskripsi kategori...',
    emptyText: 'Kategori tidak ditemukan',
  },

  // 3. Locations (Lokasi)
  locations: {
    fetchList: async (params) => {
      const res = await LocationService.getAll(params);
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return raw.map((item) => {
        const name = item.location_name || item.name || item.label || '';
        const label = item.location_type ? `${name} (${item.location_type})` : name;
        return {
          ...item,
          id: item.id || '',
          value: item.id || '',
          name: name,
          label: label,
        };
      });
    },
    fetchById: async (id) => {
      return await LocationService.getById(id);
    },
    defaultFilters: { is_active: true },
    optionLabel: (item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (item.label) return item.label;
      const name = item.location_name || item.name || '';
      return item.location_type ? `${name} (${item.location_type})` : name;
    },
    optionValue: 'id',
    searchPlaceholder: 'Cari lokasi, kecamatan atau tipe...',
    emptyText: 'Lokasi tidak ditemukan',
  },

  // 4. Positions (Jabatan)
  positions: {
    fetchList: async (params) => {
      const res = await PositionService.getAll(params);
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return raw.map((item) => {
        const mapped = item.code !== undefined ? item : PositionMapper.toUI(item);
        const name = mapped.name || item.name || '';
        const code = mapped.code || item.code || '';
        const label = code ? `${name} (${code})` : name;
        return {
          ...item,
          ...mapped,
          id: mapped.id || item.id || '',
          value: mapped.id || item.id || '',
          name: name,
          label: label,
        };
      });
    },
    fetchById: async (id) => {
      const res = await PositionService.getById(id);
      return PositionMapper.toUI(res?.data || res);
    },
    defaultFilters: { is_active: true },
    optionLabel: (item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (item.label) return item.label;
      const name = item.name || '';
      const code = item.code || '';
      return code ? `${name} (${code})` : name;
    },
    optionValue: 'id',
    searchPlaceholder: 'Cari nama atau kode jabatan...',
    emptyText: 'Jabatan tidak ditemukan',
  },

  // 5. UoM (Satuan)
  uom: {
    fetchList: async (params) => {
      const res = await UomService.getAll(params);
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return raw.map((item) => {
        const name = item.name || '';
        const code = item.code || '';
        const label = code ? `${name} (${code})` : name;
        return {
          ...item,
          id: item.id || '',
          value: item.id || '',
          name: name,
          label: label,
        };
      });
    },
    fetchById: async (id) => {
      return await UomService.getById(id);
    },
    defaultFilters: { is_active: true },
    optionLabel: (item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (item.label) return item.label;
      const name = item.name || '';
      const code = item.code || '';
      return code ? `${name} (${code})` : name;
    },
    optionValue: 'id',
    searchPlaceholder: 'Cari nama atau kode satuan...',
    emptyText: 'Satuan tidak ditemukan',
  },

  // 6. Asset Types (Tipe Aset)
  'asset-types': {
    fetchList: async (params) => {
      const res = await AssetTypeService.getAll(params);
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return raw.map((item) => {
        const name = item.name_type || item.name || item.label || '';
        return {
          ...item,
          id: item.id || '',
          value: item.id || '',
          name: name,
          label: name,
        };
      });
    },
    fetchById: async (id) => {
      return await AssetTypeService.getById(id);
    },
    defaultFilters: { is_active: true },
    optionLabel: (item) => item?.label || item?.name_type || item?.name || '',
    optionValue: 'id',
    searchPlaceholder: 'Cari tipe aset...',
    emptyText: 'Tipe aset tidak ditemukan',
  },

  // 7. Divisions (Divisi Organisasi)
  divisions: {
    fetchList: async (params) => {
      const res = await DivisionService.getAll(params);
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return raw.map((item) => {
        const name = item.name || item.division_name || '';
        return {
          ...item,
          id: item.id || '',
          value: item.id || '',
          name: name,
          label: name,
        };
      });
    },
    fetchById: async (id) => {
      return await DivisionService.getById(id);
    },
    defaultFilters: { is_active: true },
    optionLabel: (item) => item?.label || item?.name || item?.division_name || '',
    optionValue: 'id',
    searchPlaceholder: 'Cari nama atau deskripsi divisi...',
    emptyText: 'Divisi tidak ditemukan',
  },

  // 8. Employees (Karyawan Organisasi)
  employees: {
    fetchList: async (params) => {
      const res = await EmployeeService.getAll(params);
      const rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return rawList.map((item) => {
        const mapped = item?.employeeId ? item : (EmployeeMapper.toUI(item) || item);
        const name = mapped.fullName || item.full_name || item.employee?.full_name || mapped.name || '';
        const pos = mapped.positionName || item.position?.name || item.employee?.position?.name || '';
        const nik = mapped.employeeNumber || item.employee_number || item.employee?.employee_number || mapped.nik || '';
        const sub = [pos, nik].filter(Boolean).join(' • ');
        const labelText = sub ? `${name} (${sub})` : name;
        const val = mapped.employeeId || item.employee_id || item.employee?.id || mapped.id || item.id || '';
        return {
          ...item,
          ...mapped,
          id: mapped.id || item.id || '',
          employeeId: val,
          value: val,
          label: labelText,
          name: name,
          full_name: name,
          fullName: name,
        };
      });
    },
    fetchById: async (id) => {
      try {
        const res = await EmployeeService.getById(id);
        const item = res?.data || res;
        const mapped = item?.employeeId ? item : (EmployeeMapper.toUI(item) || item);
        const name = mapped.fullName || item.full_name || item.employee?.full_name || mapped.name || '';
        const pos = mapped.positionName || item.position?.name || item.employee?.position?.name || '';
        const nik = mapped.employeeNumber || item.employee_number || item.employee?.employee_number || mapped.nik || '';
        const sub = [pos, nik].filter(Boolean).join(' • ');
        const labelText = sub ? `${name} (${sub})` : name;
        const val = mapped.employeeId || item.employee_id || item.employee?.id || mapped.id || item.id || '';
        return {
          ...item,
          ...mapped,
          id: mapped.id || item.id || '',
          employeeId: val,
          value: val,
          label: labelText,
          name: name,
          full_name: name,
          fullName: name,
        };
      } catch (e) {
        return null;
      }
    },
    defaultFilters: { status: 'active' },
    optionLabel: (item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (item.label) return item.label;
      const name = item.fullName || item.full_name || item.employee?.full_name || item.name || '';
      const pos = item.positionName || item.position?.name || item.employee?.position?.name || '';
      const nik = item.employeeNumber || item.employee_number || item.employee?.employee_number || item.nik || '';
      const sub = [pos, nik].filter(Boolean).join(' • ');
      return sub ? `${name} (${sub})` : name;
    },
    optionValue: (item) => item.value || item.employeeId || item.employee_id || item.employee?.id || item.id || '',
    searchPlaceholder: 'Cari nama, jabatan, atau nomor pegawai...',
    emptyText: 'Karyawan tidak ditemukan',
  },

  // 9. Marketing Goods (Barang Marketing)
  'marketing-goods': {
    fetchList: async (params) => {
      const res = await MarketingGoodsService.getAll(params);
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return raw.map((item) => {
        const name = item.good_name || item.goodName || item.name || '';
        const sub = [
          item.good_code || item.goodCode,
          item.uom_name || item.uomName || item.uom?.name,
        ].filter(Boolean).join(' • ');
        const label = sub ? `${name} (${sub})` : name;
        return {
          ...item,
          id: item.id || '',
          value: item.id || '',
          name: name,
          label: label,
        };
      });
    },
    fetchById: async (id) => {
      return await MarketingGoodsService.getById(id);
    },
    defaultFilters: { is_active: true },
    optionLabel: (item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (item.label) return item.label;
      const name = item.good_name || item.goodName || item.name || '';
      const sub = [
        item.good_code || item.goodCode,
        item.uom_name || item.uomName || item.uom?.name,
      ].filter(Boolean).join(' • ');
      return sub ? `${name} (${sub})` : name;
    },
    optionValue: 'id',
    searchPlaceholder: 'Cari nama atau kode barang marketing...',
    emptyText: 'Barang marketing tidak ditemukan',
  },

  // 10. SC Categories (Kategori SKU Supply Chain)
  'sc-categories': {
    fetchList: async (params) => {
      const res = await ScCategoryService.getAll(params);
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return raw.map((item) => {
        const name = item.name || '';
        const code = item.code || '';
        const label = code ? `${name} (${code})` : name;
        return {
          ...item,
          id: item.id || '',
          value: item.id || '',
          name,
          label: label || name,
        };
      });
    },
    fetchById: async (id) => {
      const res = await ScCategoryService.getById(id);
      return res?.data || res;
    },
    defaultFilters: {},
    optionLabel: (item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (item.label) return item.label;
      const name = item.name || item.name_category || '';
      const code = item.code || '';
      return code ? `${name} (${code})` : name;
    },
    optionValue: 'id',
    searchPlaceholder: 'Cari nama atau kode kategori SKU...',
    emptyText: 'Kategori SKU tidak ditemukan',
  },
};

// Aliases untuk mempermudah pemanggilan berbagai format penamaan
MASTER_REGISTRY['good'] = MASTER_REGISTRY['goods'];
MASTER_REGISTRY['category'] = MASTER_REGISTRY['categories'];
MASTER_REGISTRY['location'] = MASTER_REGISTRY['locations'];
MASTER_REGISTRY['position'] = MASTER_REGISTRY['positions'];
MASTER_REGISTRY['asset_types'] = MASTER_REGISTRY['asset-types'];
MASTER_REGISTRY['asset-type'] = MASTER_REGISTRY['asset-types'];
MASTER_REGISTRY['asset_type'] = MASTER_REGISTRY['asset-types'];
MASTER_REGISTRY['division'] = MASTER_REGISTRY['divisions'];
MASTER_REGISTRY['employee'] = MASTER_REGISTRY['employees'];
MASTER_REGISTRY['marketing_goods'] = MASTER_REGISTRY['marketing-goods'];
MASTER_REGISTRY['marketing-good'] = MASTER_REGISTRY['marketing-goods'];
MASTER_REGISTRY['marketing_good'] = MASTER_REGISTRY['marketing-goods'];
MASTER_REGISTRY['sc-category-sku'] = MASTER_REGISTRY['sc-categories'];
MASTER_REGISTRY['sc_categories'] = MASTER_REGISTRY['sc-categories'];
MASTER_REGISTRY['sc_category_sku'] = MASTER_REGISTRY['sc-categories'];

/**
 * Mendapatkan konfigurasi master berdasarkan key
 * @param {string} masterKey
 */
export function getMasterConfig(masterKey) {
  if (!masterKey) return null;
  const key = String(masterKey).toLowerCase().trim();
  return MASTER_REGISTRY[key] || null;
}

/**
 * Mencari data master via endpoint server-side dengan query parameter `search`
 * @param {string} masterKey - Key modul master (mis. 'goods', 'locations', 'categories')
 * @param {Object} options - Parameter pencarian { search, page, limit, filters }
 * @returns {Promise<Array>} Array of mapped items
 */
export async function searchMaster(masterKey, { search = '', page = 1, limit = 20, filters = {} } = {}) {
  const config = getMasterConfig(masterKey);
  if (!config) {
    console.warn(`[MasterSearch] Unknown master type: "${masterKey}"`);
    return [];
  }

  const queryParams = {
    page,
    limit,
    ...config.defaultFilters,
    ...filters,
  };

  const trimmed = typeof search === 'string' ? search.trim() : '';
  if (trimmed) {
    queryParams.search = trimmed;
  }

  try {
    return await config.fetchList(queryParams);
  } catch (error) {
    console.error(`[MasterSearch] Error fetching master "${masterKey}":`, error);
    return [];
  }
}

/**
 * Mengambil 1 item master berdasarkan ID (berguna untuk pre-populasi label saat edit mode)
 * @param {string} masterKey - Key modul master
 * @param {string|number} id - ID item
 * @returns {Promise<Object|null>} Single item object
 */
export async function getMasterItemById(masterKey, id) {
  if (!id) return null;
  const config = getMasterConfig(masterKey);
  if (!config || typeof config.fetchById !== 'function') return null;

  try {
    return await config.fetchById(id);
  } catch (error) {
    console.error(`[MasterSearch] Error fetching item by ID for "${masterKey}":`, error);
    return null;
  }
}

export const MasterSearchService = {
  get: getMasterConfig,
  search: searchMaster,
  getById: getMasterItemById,
};

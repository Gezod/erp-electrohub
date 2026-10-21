import { reactive, watch } from 'vue';
import { useScSkuStore } from '../scSku.store';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useScSku
 * Composable untuk menangani state filter, pencarian, dan pagination
 * pada modul Master SKU & Harga (Supply Chain).
 */
const filters = reactive({
  search: '',
  tipe_sku: '',
  category_id: '',
  is_active: '',       // sesuai API contract: 'true' | 'false' | ''
});

export function useScSku() {
  const store = useScSkuStore();

  /**
   * fetchData
   */
  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && store.items.length > 0) {
      return;
    }
    const params = {
      page,
      limit: store.pagination.dataPerPage || 10,
      search: filters.search || undefined,
      tipe_sku: filters.tipe_sku || undefined,
      category_id: filters.category_id || undefined,
      is_active: filters.is_active !== '' ? filters.is_active : undefined,
    };
    await store.fetchSkus(params);
  };

  /**
   * handlePageChange
   */
  const handlePageChange = (newPage) => {
    fetchData(newPage, true);
  };

  /**
   * resetFilters
   */
  const resetFilters = () => {
    filters.search = '';
    filters.tipe_sku = '';
    filters.category_id = '';
    filters.is_active = '';
    fetchData(1, true);
  };

  // Watchers untuk auto-search saat filter berubah
  watch(() => filters.search, () => fetchData(1, true));
  watch(() => filters.tipe_sku, () => fetchData(1, true));
  watch(() => filters.category_id, () => fetchData(1, true));
  watch(() => filters.is_active, () => fetchData(1, true));

  return {
    filters,
    store,
    fetchData,
    handlePageChange,
    resetFilters
  };
}

registerFilterReset(() => {
  filters.search = '';
  filters.tipe_sku = '';
  filters.category_id = '';
  filters.is_active = '';
});

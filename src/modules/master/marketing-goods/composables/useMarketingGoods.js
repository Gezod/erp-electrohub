import { reactive, watch } from 'vue';
import { useMarketingGoodsStore } from '../marketingGoods.store';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useMarketingGoods
 * Composable untuk menangani state filter, pencarian, dan pagination
 * pada modul Master Barang Marketing.
 */
const filters = reactive({
  search: '',
  tipe_barang: '',
  is_active: ''
});

export function useMarketingGoods() {
  const store = useMarketingGoodsStore();

  /**
   * fetchData
   */
  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && store.goods.length > 0) {
      return;
    }
    const params = {
      page,
      limit: store.pagination.dataPerPage || 10,
      search: filters.search || undefined,
      tipe_barang: filters.tipe_barang || undefined,
      is_active: filters.is_active !== '' ? filters.is_active : undefined
    };
    await store.fetchGoods(params);
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
    filters.tipe_barang = '';
    filters.is_active = '';
    fetchData(1, true);
  };

  // Watchers untuk auto-search saat filter berubah
  watch(
    () => filters.search,
    () => fetchData(1, true)
  );

  watch(
    () => filters.tipe_barang,
    () => fetchData(1, true)
  );

  watch(
    () => filters.is_active,
    () => fetchData(1, true)
  );

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
  filters.tipe_barang = '';
  filters.is_active = '';
});

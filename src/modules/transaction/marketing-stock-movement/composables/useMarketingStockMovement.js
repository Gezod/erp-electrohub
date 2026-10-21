import { reactive, watch, onMounted } from 'vue';
import { useMarketingStockMovementLogStore } from '../marketingStockMovement.store';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useMarketingStockMovementLog
 * Orkestrasi filter + fetch untuk halaman "Log Pergerakan Stok" Marketing.
 * `filters` sengaja di luar fungsi agar bertahan saat navigasi (pola modul transaksi lain,
 * mis. useStock). Wajib didaftarkan ke registerFilterReset() supaya ikut dibersihkan saat logout.
 */
const filters = reactive({
  kategori: 'semua', // 'semua' | 'stok' | 'aset' — tab switcher
  search: '',
  tipe: '',
  locationId: '',
  dateFrom: '',
  dateTo: '',
});

export function useMarketingStockMovementLog() {
  const store = useMarketingStockMovementLogStore();

  const fetchData = async (page = 1) => {
    const params = {
      page,
      limit: store.pagination.dataPerPage || 10,
      kategori: filters.kategori || 'semua',
    };
    if (filters.search) params.search = filters.search;
    if (filters.tipe) params.tipe = filters.tipe;
    if (filters.locationId) params.location_id = filters.locationId;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;

    await store.fetchItems(params);
  };

  const handlePageChange = (newPage) => fetchData(newPage);

  // Search di-debounce agar tidak request tiap ketikan (pola useMarketingStock).
  let searchTimeout = null;
  const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchData(1), 500);
  };

  const resetFilters = () => {
    filters.kategori = 'semua';
    filters.search = '';
    filters.tipe = '';
    filters.locationId = '';
    filters.dateFrom = '';
    filters.dateTo = '';
    fetchData(1);
  };

  // Ganti tab kategori → tipe yang tak relevan direset.
  watch(() => filters.kategori, () => {
    if (filters.kategori === 'aset' && filters.tipe !== 'asset_acquired') filters.tipe = '';
    if (filters.kategori === 'stok' && filters.tipe === 'asset_acquired') filters.tipe = '';
    fetchData(1);
  });

  watch(() => filters.search, () => {
    debouncedSearch();
  });

  watch(
    [
      () => filters.tipe,
      () => filters.locationId,
      () => filters.dateFrom,
      () => filters.dateTo,
    ],
    () => { fetchData(1); }
  );

  onMounted(() => {
    fetchData(store.pagination.currentPage || 1);
  });

  return { filters, store, fetchData, handlePageChange, resetFilters };
}

registerFilterReset(() => {
  filters.kategori = 'semua';
  filters.search = '';
  filters.tipe = '';
  filters.locationId = '';
  filters.dateFrom = '';
  filters.dateTo = '';
});

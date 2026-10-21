import { reactive, watch, onMounted } from 'vue';
import { useMarketingAssetStore } from '../marketingAsset.store';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useMarketingAsset
 * Composable halaman list Aset Marketing — meniru useAsset() GA.
 *
 * filters sengaja didefinisikan di luar fungsi agar bertahan saat navigasi
 * index → detail → index. Karena itu WAJIB didaftarkan ke registerFilterReset()
 * di bawah, kalau tidak filter bocor antar login.
 *
 * Debounce memakai setTimeout manual, bukan lodash/debounce — lodash tidak ada
 * di package.json (lihat CLAUDE.md frontend).
 */
const filters = reactive({
  search: '',
  locationId: '',
  condition: '',
  isActive: '',
});

export function useMarketingAsset() {
  const store = useMarketingAssetStore();

  // ─── Param builders ──────────────────────────────────────────────────────────

  /**
   * is_active dikirim sebagai STRING 'true'/'false' — backend membacanya
   * dengan perbandingan string (asset.service.js), boolean tidak akan cocok.
   */
  const buildParams = (page = 1) => {
    const params = { page, limit: store.pagination.dataPerPage || 10 };
    if (filters.search) params.search = filters.search;
    if (filters.locationId) params.location_id = filters.locationId;
    if (filters.condition) params.condition = filters.condition;
    if (filters.isActive !== '') params.is_active = filters.isActive;
    return params;
  };

  /** Filter yang sama, tanpa pagination — supaya kartu ikut konteks filter */
  const buildStatsParams = () => {
    const params = {};
    if (filters.locationId) params.location_id = filters.locationId;
    if (filters.condition) params.condition = filters.condition;
    if (filters.isActive !== '') params.is_active = filters.isActive;
    return params;
  };

  // ─── Fetch helpers ───────────────────────────────────────────────────────────

  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && store.assets.length > 0) {
      return; // pertahankan state saat kembali dari detail
    }
    await store.fetchAssets(buildParams(page));
  };

  const fetchStatsWithFilters = () => store.fetchStats(buildStatsParams());

  // ─── Event handlers ──────────────────────────────────────────────────────────

  let searchTimeout = null;
  const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchData(1, true), 500);
  };

  const handlePageChange = (newPage) => fetchData(newPage, true);

  const resetFilters = () => {
    filters.search = '';
    filters.locationId = '';
    filters.condition = '';
    filters.isActive = '';
    fetchData(1, true);
    fetchStatsWithFilters();
  };

  /** Dipanggil setelah create/update/delete — list dan kartu ikut segar */
  const refreshAfterSave = async () => {
    await fetchData(store.pagination.currentPage, true);
    await fetchStatsWithFilters();
  };

  const handleExport = () => store.exportToCSV(buildParams(1));

  // ─── Watchers ────────────────────────────────────────────────────────────────

  watch(() => filters.search, () => debouncedSearch());

  watch(
    [() => filters.locationId, () => filters.condition, () => filters.isActive],
    () => {
      fetchData(1, true);
      fetchStatsWithFilters();
    }
  );

  onMounted(() => {
    fetchData(1);
    fetchStatsWithFilters();
  });

  return {
    filters,
    store,
    fetchData,
    fetchStatsWithFilters,
    handlePageChange,
    resetFilters,
    handleExport,
    refreshAfterSave,
  };
}

registerFilterReset(() => {
  filters.search = '';
  filters.locationId = '';
  filters.condition = '';
  filters.isActive = '';
});

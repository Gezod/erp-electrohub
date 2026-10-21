import { reactive, watch, onMounted } from 'vue';
import { useAssetStore } from '../asset.store';
import debounce from 'lodash/debounce';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useAsset
 * Composable for asset list page with full filter support.
 * 
 * - filters state dibuat di luar fungsi agar tetap persist saat navigasi
 *   antar page dalam module yang sama (detail → kembali ke index).
 * - Stats selalu di-fetch dengan filter yang sedang aktif supaya
 *   kartu metrik mencerminkan konteks yang sedang di-filter user.
 */
const filters = reactive({
  search: '',
  locationId: '',
  condition: '',
  isActive: '',
  divisionId: '',
  // 'semua' | 'biasa' | 'opening' — bucket aset stok opening. 'semua' = tanpa filter.
  isStokOpening: 'semua',
  dateFrom: '',
  dateTo: '',
});

export function useAsset() {
  const assetStore = useAssetStore();

  // ─── Param builders ──────────────────────────────────────────────────────────

  /** Build full query params (list) dari filter aktif */
  const buildParams = (page = 1) => {
    const params = {
      page,
      limit: assetStore.pagination.dataPerPage || 10,
    };
    if (filters.search)          params.search      = filters.search;
    if (filters.locationId)      params.location_id = filters.locationId;
    if (filters.condition)       params.condition   = filters.condition;
    if (filters.isActive !== '') params.is_active   = filters.isActive;
    if (filters.divisionId)      params.division_id = filters.divisionId;
    if (filters.isStokOpening !== 'semua') params.tipe = filters.isStokOpening;
    if (filters.dateFrom)        params.date_from   = filters.dateFrom;
    if (filters.dateTo)          params.date_to     = filters.dateTo;
    return params;
  };

  /** Build stats params — filter sama, tanpa pagination */
  const buildStatsParams = () => {
    const params = {};
    if (filters.locationId)      params.location_id = filters.locationId;
    if (filters.condition)       params.condition   = filters.condition;
    if (filters.isActive !== '') params.is_active   = filters.isActive;
    if (filters.divisionId)      params.division_id = filters.divisionId;
    if (filters.isStokOpening !== 'semua') params.tipe = filters.isStokOpening;
    if (filters.dateFrom)        params.date_from   = filters.dateFrom;
    if (filters.dateTo)          params.date_to     = filters.dateTo;
    return params;
  };

  // ─── Fetch helpers ────────────────────────────────────────────────────────────

  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && assetStore.assets.length > 0) {
      return; // preserve state saat kembali dari detail/form
    }
    await assetStore.fetchAssets(buildParams(page));
  };

  /** Fetch stats dengan filter yang sedang aktif */
  const fetchStatsWithFilters = () => assetStore.fetchStats(buildStatsParams());

  // ─── Event handlers ───────────────────────────────────────────────────────────

  const debouncedSearch = debounce(() => {
    fetchData(1, true);
  }, 500);

  const handlePageChange = (newPage) => {
    fetchData(newPage, true);
  };

  const resetFilters = () => {
    filters.search     = '';
    filters.locationId = '';
    filters.condition  = '';
    filters.isActive   = '';
    filters.divisionId = '';
    filters.isStokOpening = 'semua';
    filters.dateFrom   = '';
    filters.dateTo     = '';
    fetchData(1, true);
    fetchStatsWithFilters();
  };

  /**
   * refreshAfterSave — dipanggil setelah create / update dari form modal.
   * Force-refresh list di halaman yang sedang aktif dan update stats
   * sesuai filter yang sedang digunakan user.
   */
  const refreshAfterSave = async () => {
    await fetchData(assetStore.pagination.currentPage, true);
    await fetchStatsWithFilters();
  };

  const handleExport = () => {
    return assetStore.exportToCSV(buildParams(1));
  };

  // ─── Watchers ─────────────────────────────────────────────────────────────────

  watch(() => filters.search, () => {
    debouncedSearch();
  });

  watch(
    [
      () => filters.locationId,
      () => filters.condition,
      () => filters.isActive,
      () => filters.divisionId,
      () => filters.isStokOpening,
      () => filters.dateFrom,
      () => filters.dateTo,
    ],
    () => {
      fetchData(1, true);
      fetchStatsWithFilters();
    }
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  onMounted(() => {
    fetchData(1);
    fetchStatsWithFilters();
  });

  return {
    filters,
    assetStore,
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
  filters.divisionId = '';
  filters.isStokOpening = 'semua';
  filters.dateFrom = '';
  filters.dateTo = '';
});

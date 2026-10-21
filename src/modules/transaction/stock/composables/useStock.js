import { reactive, watch, onMounted } from 'vue';
import { useStockStore } from '../stock.store';
import debounce from 'lodash/debounce';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useStock
 * Composable for stock list page logic with full filter support.
 * Dua kontrol UI (tab Bernilai/Return + filter bucket) diterjemahkan ke satu
 * query param `tipe` (biasa | opening | parfum | retur), boleh CSV.
 */
const TIPE_BERNILAI = 'biasa,opening,parfum';

// Terjemahkan state filter UI -> nilai query param `tipe`.
const resolveTipeParam = (f) => {
  if (f.isValued === 'return') return 'retur';
  if (f.isStokOpening === 'semua') return TIPE_BERNILAI;
  return f.isStokOpening; // 'biasa' | 'opening' | 'parfum'
};

const filters = reactive({
  search: '',
  locationId: '',
  goodId: '',
  employeeId: '',
  lowStock: false,
  // 'valued' | 'return' — used by index.vue tab switcher
  isValued: 'valued',
  // 'semua' | 'biasa' | 'opening' | 'parfum' — bucket stok. 'semua' = semua bucket bernilai.
  isStokOpening: 'semua',
  dateFrom: '',
  dateTo: '',
  movementType: '',
});

export function useStock(initialEmployeeId = '') {
  const stockStore = useStockStore();

  if (initialEmployeeId && !filters.employeeId) {
    filters.employeeId = initialEmployeeId;
  }

  const fetchData = async (page = 1, force = true) => {
    const params = {
      page,
      limit: stockStore.pagination.dataPerPage || 10,
    };
    if (filters.search) params.search = filters.search;
    if (filters.locationId) params.location_id = filters.locationId;
    if (filters.goodId) params.good_id = filters.goodId;
    if (filters.employeeId) params.employee_id = filters.employeeId;
    if (filters.lowStock) params.low_stock = 'true';
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;

    params.tipe = resolveTipeParam(filters);

    await stockStore.fetchStocks(params);
  };

  const debouncedSearch = debounce(() => {
    fetchData(1, true);
  }, 500);

  const handlePageChange = (newPage) => {
    fetchData(newPage, true);
  };

  const resetFilters = () => {
    filters.search = '';
    filters.locationId = '';
    filters.goodId = '';
    filters.employeeId = initialEmployeeId;
    filters.lowStock = false;
    filters.isStokOpening = 'semua';
    filters.dateFrom = '';
    filters.dateTo = '';
    fetchData(1, true);
  };

  const exportStock = () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.locationId) params.location_id = filters.locationId;
    if (filters.employeeId) params.employee_id = filters.employeeId;
    if (filters.lowStock) params.low_stock = 'true';
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;
    params.tipe = resolveTipeParam(filters);
    return stockStore.exportStockToCSV(params);
  };

  const exportMovements = () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.locationId) params.location_id = filters.locationId;
    if (filters.employeeId) params.pic_id = filters.employeeId;
    if (filters.goodId) params.good_id = filters.goodId;
    if (filters.movementType) params.movement_type = filters.movementType;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;
    params.tipe = resolveTipeParam(filters);
    return stockStore.exportMovementsToCSV(params);
  };

  // Watch search with debounce
  watch(() => filters.search, () => {
    debouncedSearch();
  });

  // Watch other filters — immediate fetch (including isValued tab switch)
  watch(
    [
      () => filters.locationId, 
      () => filters.goodId, 
      () => filters.employeeId, 
      () => filters.lowStock,
      () => filters.isValued,
      () => filters.isStokOpening,
      () => filters.dateFrom,
      () => filters.dateTo
    ],
    () => { fetchData(1, true); }
  );

  onMounted(() => {
    // Pertahankan halaman terakhir saat kembali dari detail/mutasi.
    // `filters` & Pinia store hidup di luar komponen, jadi currentPage masih valid.
    fetchData(stockStore.pagination.currentPage || 1);
  });

  return {
    filters,
    stockStore,
    fetchData,
    handlePageChange,
    resetFilters,
    exportStock,
    exportMovements,
  };
}

registerFilterReset(() => {
  filters.search = '';
  filters.locationId = '';
  filters.goodId = '';
  filters.employeeId = '';
  filters.lowStock = false;
  filters.isValued = 'valued';
  filters.isStokOpening = 'semua';
  filters.dateFrom = '';
  filters.dateTo = '';
  filters.movementType = '';
});

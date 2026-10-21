import { reactive, watch, onMounted } from 'vue';
import { useMarketingStockStore } from '../marketingStock.store';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useMarketingStock
 * Composable untuk halaman list Stock Monitoring Marketing.
 * Mendukung filter: search, location_id, good_id, employee_id, is_valued,
 * date_from, date_to, page, limit.
 */
const filters = reactive({
  search: '',
  locationId: '',
  goodId: '',
  employeeId: '',
  isValued: 'valued', // 'valued' | 'return' | 'all'
  dateFrom: '',
  dateTo: '',
});

export function useMarketingStock(initialEmployeeId = '') {
  const store = useMarketingStockStore();

  if (initialEmployeeId && !filters.employeeId) {
    filters.employeeId = initialEmployeeId;
  }

  const buildParams = () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.locationId) params.location_id = filters.locationId;
    if (filters.goodId) params.good_id = filters.goodId;
    if (filters.employeeId) params.employee_id = filters.employeeId;
    if (filters.isValued === 'valued') params.is_valued = true;
    else if (filters.isValued === 'return') params.is_valued = false;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;
    return params;
  };

  const fetchData = async (page = 1) => {
    await store.fetchStocks({
      ...buildParams(),
      page,
      limit: store.pagination.dataPerPage || 10,
    });
  };

  let searchTimeout = null;
  const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchData(1), 400);
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage);
  };

  const resetFilters = () => {
    filters.search = '';
    filters.locationId = '';
    filters.goodId = '';
    filters.employeeId = initialEmployeeId;
    filters.dateFrom = '';
    filters.dateTo = '';
    // Pertahankan tab isValued saat reset filter modal
    fetchData(1);
  };

  const exportStock = () => store.exportStockToCSV(buildParams());
  const exportMovements = () => store.exportMovementsToCSV(buildParams());

  // Search di-debounce
  watch(() => filters.search, () => {
    debouncedSearch();
  });

  // Filter lain & tab isValued
  watch(
    [
      () => filters.locationId,
      () => filters.goodId,
      () => filters.employeeId,
      () => filters.isValued,
      () => filters.dateFrom,
      () => filters.dateTo,
    ],
    () => {
      fetchData(1);
    }
  );

  onMounted(() => {
    fetchData(store.pagination.currentPage || 1);
  });

  return {
    filters,
    store,
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
  filters.isValued = 'valued';
  filters.dateFrom = '';
  filters.dateTo = '';
});

import { reactive, watch, onMounted } from 'vue';
import { useMaintenanceStore } from '../maintenance.store';
import debounce from 'lodash/debounce';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useMaintenance
 * Composable to handle logic for the maintenance list view.
 * Encapsulates filtering, searching, and pagination logic.
 */
const filters = reactive({
  search: '',
  status: '',
  pic_ga_id: '',
  date_from: '',
  date_to: '',
  divisions: []
});

export function useMaintenance() {
  const maintenanceStore = useMaintenanceStore();

  // --- State ---

  // --- Methods ---
  
  /**
   * fetchData
   * Triggers the store action to fetch data from the API.
   */
  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && maintenanceStore.maintenances.length > 0) {
      return;
    }
    const params = {
      page,
      limit: maintenanceStore.pagination.dataPerPage || 10,
      search: filters.search || '',
      status: filters.status || '',
      pic_ga_id: filters.pic_ga_id || '',
      date_from: filters.date_from || '',
      date_to: filters.date_to || '',
      divisions: filters.divisions && filters.divisions.length > 0 ? filters.divisions.join(',') : undefined
    };
    await maintenanceStore.fetchMaintenances(params);
  };

  /**
   * debouncedSearch
   * Delays search execution to reduce API calls.
   */
  const debouncedSearch = debounce(() => {
    fetchData(1, true);
  }, 500);

  /**
   * handlePageChange
   * Called when pagination updates.
   */
  const handlePageChange = (newPage) => {
    fetchData(newPage, true);
  };

  /**
   * resetFilters
   */
  const resetFilters = () => {
    filters.search = '';
    filters.status = '';
    filters.pic_ga_id = '';
    filters.date_from = '';
    filters.date_to = '';
    filters.divisions = [];
    fetchData(1, true);
  };

  const handleExport = () => {
    const params = {
      search: filters.search || '',
      status: filters.status || '',
      pic_ga_id: filters.pic_ga_id || '',
      date_from: filters.date_from || '',
      date_to: filters.date_to || '',
      divisions: filters.divisions && filters.divisions.length > 0 ? filters.divisions.join(',') : undefined
    };
    return maintenanceStore.exportToCSV(params);
  };

  // --- Watchers & Lifecycle ---

  // Watch for search keyword change
  watch(() => filters.search, () => {
    debouncedSearch();
  });

  // Watch for status filter change (immediate)
  watch(() => [filters.status, filters.pic_ga_id, filters.date_from, filters.date_to, filters.divisions], () => {
    fetchData(1, true);
  }, { deep: true });

  onMounted(async () => {
    fetchData(1);
  });

  return {
    filters,
    maintenanceStore,
    fetchData,
    handlePageChange,
    resetFilters,
    handleExport
  };
}

registerFilterReset(() => {
  filters.search = '';
  filters.status = '';
  filters.pic_ga_id = '';
  filters.date_from = '';
  filters.date_to = '';
  filters.divisions = [];
});

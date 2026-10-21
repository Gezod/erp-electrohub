import { reactive, watch } from 'vue';
import { useVehicleStore } from '../vehicle.store';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useVehicle
 * Composable untuk menangani logika filter, pencarian, dan pemuatan data
 * pada list Kendaraan.
 */
const filters = reactive({
  search: '',
  status: '',
  is_draft: ''
});

export function useVehicle() {
  const vehicleStore = useVehicleStore();

  /**
   * fetchData
   * Mengambil data dari store berdasarkan halaman dan filter saat ini.
   */
  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && vehicleStore.vehicles.length > 0) {
      return;
    }
    const params = {
      page,
      limit: vehicleStore.pagination.dataPerPage,
      search: filters.search || undefined,
      is_draft: filters.is_draft !== '' ? filters.is_draft : undefined
    };
    await vehicleStore.fetchVehicles(params);
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
    filters.status = '';
    filters.is_draft = '';
    fetchData(1, true);
  };

  // Watchers untuk auto-search saat filter berubah
  watch(
    () => filters.search,
    () => fetchData(1, true)
  );

  watch(
    () => filters.is_draft,
    () => fetchData(1, true)
  );

  return {
    filters,
    vehicleStore,
    fetchData,
    handlePageChange,
    resetFilters
  };
}

registerFilterReset(() => {
  filters.search = '';
  filters.status = '';
  filters.is_draft = '';
});

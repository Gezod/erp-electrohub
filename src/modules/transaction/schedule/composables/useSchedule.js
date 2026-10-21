import { reactive, watch, onMounted } from 'vue';
import { useScheduleStore } from '../schedule.store';
import debounce from 'lodash/debounce';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useSchedule
 * Composable untuk menangani logika filter dan pagination modul Jadwal.
 */
const filters = reactive({
  search: '',
  status: ''
});

export function useSchedule() {
  const scheduleStore = useScheduleStore();

  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && scheduleStore.schedules.length > 0) {
      return;
    }
    const params = {
      page,
      limit: scheduleStore.pagination.dataPerPage || 10,
      search: filters.search || '',
      status: filters.status || ''
    };
    await scheduleStore.fetchSchedules(params);
  };

  const debouncedSearch = debounce(() => {
    fetchData(1, true);
  }, 500);

  const handlePageChange = (newPage) => {
    fetchData(newPage, true);
  };

  const resetFilters = () => {
    filters.search = '';
    filters.status = '';
    fetchData(1, true);
  };

  watch(() => filters.search, () => {
    debouncedSearch();
  });

  watch(() => filters.status, () => {
    fetchData(1, true);
  });

  onMounted(() => {
    fetchData(1);
  });

  const handleExport = () => {
    const params = {
      search: filters.search || undefined,
      status: filters.status || undefined
    };
    return scheduleStore.exportToCSV(params);
  };

  return {
    filters,
    scheduleStore,
    fetchData,
    handlePageChange,
    resetFilters,
    handleExport
  };
}

registerFilterReset(() => {
  filters.search = '';
  filters.status = '';
});

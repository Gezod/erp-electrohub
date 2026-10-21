import { reactive, watch, onMounted } from 'vue';
import { useStoreAssignmentStore } from '../storeAssignment.store';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useStoreAssignment
 * Composable untuk modul Master Store Assignment.
 */
const DEFAULT_STATUS = 'aktif';

const filters = reactive({
  status: DEFAULT_STATUS,
  employeeId: '',
  storeLocationId: '',
});

export function useStoreAssignment() {
  const store = useStoreAssignmentStore();

  const buildParams = () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.employeeId) params.employee_id = filters.employeeId;
    if (filters.storeLocationId) params.store_location_id = filters.storeLocationId;
    return params;
  };

  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && store.assignments.length > 0) {
      return;
    }
    await store.fetchAssignments({
      ...buildParams(),
      page,
      limit: store.pagination.dataPerPage || 10,
    });
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage, true);
  };

  const resetFilters = () => {
    filters.status = DEFAULT_STATUS;
    filters.employeeId = '';
    filters.storeLocationId = '';
    fetchData(1, true);
  };

  watch(
    [() => filters.status, () => filters.employeeId, () => filters.storeLocationId],
    () => { fetchData(1, true); }
  );

  return {
    filters,
    store,
    fetchData,
    handlePageChange,
    resetFilters,
  };
}

registerFilterReset(() => {
  filters.status = DEFAULT_STATUS;
  filters.employeeId = '';
  filters.storeLocationId = '';
});

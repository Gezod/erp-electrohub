import { reactive, watch } from 'vue';
import { useAdminPusatRosterStore } from '../adminPusatRoster.store';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useAdminPusatRoster
 * Composable untuk modul Master Roster Admin Pusat.
 */
const DEFAULT_STATUS = 'aktif';

const filters = reactive({
  status: DEFAULT_STATUS,
  employeeId: '',
  officeLocationId: '',
});

export function useAdminPusatRoster() {
  const store = useAdminPusatRosterStore();

  const buildParams = () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.employeeId) params.employee_id = filters.employeeId;
    if (filters.officeLocationId) params.office_location_id = filters.officeLocationId;
    return params;
  };

  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && store.members.length > 0) {
      return;
    }
    await store.fetchMembers({
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
    filters.officeLocationId = '';
    fetchData(1, true);
  };

  watch(
    [() => filters.status, () => filters.employeeId, () => filters.officeLocationId],
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
  filters.officeLocationId = '';
});

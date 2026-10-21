import { reactive, watch } from 'vue';
import { useEmployeeStore } from '../employee.store';

export function useEmployee() {
  const employeeStore = useEmployeeStore();

  const filters = reactive({
    search: '',
    status: '',
    division_id: '',
    location_id: '',
  });

  const fetchEmployees = async (page = 1) => {
    employeeStore.pagination.currentPage = page;
    const params = {
      page,
      limit: employeeStore.pagination.dataPerPage || 10,
      search: filters.search.trim() || undefined,
      status: filters.status || undefined,
      division_id: filters.division_id || undefined,
      location_id: filters.location_id || undefined,
    };
    await employeeStore.fetchEmployees(params);
  };

  const handlePageChange = (newPage) => {
    fetchEmployees(newPage);
  };

  const resetFilters = () => {
    filters.search = '';
    filters.status = '';
    filters.division_id = '';
    filters.location_id = '';
    fetchEmployees(1);
  };

  let searchTimeout;
  watch(
    () => filters.search,
    () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        fetchEmployees(1);
      }, 400);
    }
  );

  watch(
    () => [filters.status, filters.division_id, filters.location_id],
    () => {
      fetchEmployees(1);
    }
  );

  return {
    filters,
    employeeStore,
    fetchEmployees,
    handlePageChange,
    resetFilters,
  };
}

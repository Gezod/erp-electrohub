import { reactive, watch } from 'vue';
import { useDivisionStore } from '../division.store';

export function useDivision() {
  const divisionStore = useDivisionStore();

  const filters = reactive({
    search: '',
    chief_id: '',
  });

  const fetchDivisions = async (page = 1) => {
    divisionStore.pagination.currentPage = page;
    const params = {
      page,
      limit: divisionStore.pagination.dataPerPage || 10,
      search: filters.search.trim() || undefined,
      chief_id: filters.chief_id || undefined,
    };
    await divisionStore.fetchDivisions(params);
  };

  const handlePageChange = (newPage) => {
    fetchDivisions(newPage);
  };

  const resetFilters = () => {
    filters.search = '';
    filters.chief_id = '';
    fetchDivisions(1);
  };

  let searchTimeout;
  watch(
    () => filters.search,
    () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        fetchDivisions(1);
      }, 400);
    }
  );

  watch(
    () => filters.chief_id,
    () => {
      fetchDivisions(1);
    }
  );

  return {
    filters,
    divisionStore,
    fetchDivisions,
    handlePageChange,
    resetFilters,
  };
}

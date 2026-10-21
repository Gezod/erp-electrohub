import { reactive, watch } from 'vue';
import { useChiefStore } from '../chief.store';

export function useChief() {
  const chiefStore = useChiefStore();

  const filters = reactive({
    search: '',
  });

  const fetchChiefs = async (page = 1) => {
    chiefStore.pagination.currentPage = page;
    const params = {
      page,
      limit: chiefStore.pagination.dataPerPage || 10,
      search: filters.search.trim() || undefined,
    };
    await chiefStore.fetchChiefs(params);
  };

  const handlePageChange = (newPage) => {
    fetchChiefs(newPage);
  };

  const resetFilters = () => {
    filters.search = '';
    fetchChiefs(1);
  };

  let searchTimeout;
  watch(
    () => filters.search,
    () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        fetchChiefs(1);
      }, 400);
    }
  );

  return {
    filters,
    chiefStore,
    fetchChiefs,
    handlePageChange,
    resetFilters,
  };
}

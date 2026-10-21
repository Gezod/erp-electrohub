import { reactive, computed, watch, onMounted } from 'vue';
import { useMarketingPurchaseStore } from '../marketingPurchase.store';
import { registerFilterReset } from '@/utils/filterRegistry';

const defaultFilters = () => ({
  search: '',
  status: '',
  location_id: '',
  source_type: '',
  date_from: '',
  date_to: '',
  payment: '',
  needs_approval: false,
  page: 1,
  limit: 10,
});

const filters = reactive(defaultFilters());

export function useMarketingPurchase() {
  const store = useMarketingPurchaseStore();

  const purchases = computed(() => store.purchases);
  const stats = computed(() => store.stats);
  const pagination = computed(() => store.pagination);
  const isLoading = computed(() => store.isLoading);

  const buildParams = (page = filters.page) => {
    return {
      page,
      limit: store.pagination.dataPerPage || 10,
      search: filters.search || undefined,
      status: filters.status || undefined,
      location_id: filters.location_id || undefined,
      source_type: filters.source_type || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      payment: filters.payment || undefined,
      needs_approval: filters.needs_approval ? 'true' : undefined,
    };
  };

  const reload = (page = filters.page) => {
    const params = buildParams(page);
    store.fetchPurchases(params);
    const { page: _p, limit: _l, ...statsParams } = params;
    store.fetchStats(statsParams);
  };

  const applyFilters = () => {
    filters.page = 1;
    reload(1);
  };

  const changePage = (newPage) => {
    filters.page = newPage;
    reload(newPage);
  };

  let searchTimeout = null;
  const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => applyFilters(), 400);
  };

  const resetFilters = () => {
    Object.assign(filters, defaultFilters());
    applyFilters();
  };

  watch(
    () => filters.search,
    () => {
      debouncedSearch();
    }
  );

  return {
    filters,
    purchases,
    stats,
    pagination,
    isLoading,
    store,
    reload,
    applyFilters,
    changePage,
    resetFilters,
  };
}

registerFilterReset(() => {
  Object.assign(filters, defaultFilters());
});

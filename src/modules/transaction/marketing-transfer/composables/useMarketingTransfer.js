import { reactive, watch, onMounted } from 'vue';
import { useMarketingTransferStore } from '../marketingTransfer.store';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useMarketingTransfer
 * Composable untuk state reaktif, filter, pagination modul Transfer Marketing.
 */
const filters = reactive({
  search: '',
  status: '',
  picId: '',
  dateFrom: '',
  dateTo: '',
  needsApproval: false,
});

export function useMarketingTransfer() {
  const store = useMarketingTransferStore();

  const buildParams = (page = 1) => {
    const params = {
      page,
      limit: store.pagination.dataPerPage || 10,
    };
    if (filters.search) params.search = filters.search;
    // Tab "Perlu Approval" mengabaikan filter status — backend menampilkan semua `diajukan`.
    if (filters.needsApproval) params.needs_approval = 'true';
    else if (filters.status) params.status = filters.status;
    if (filters.picId) params.pic_id = filters.picId;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;
    return params;
  };

  const fetchData = async (page = 1) => {
    const params = buildParams(page);
    await store.fetchTransfers(params);
    // stats bersifat global (tanpa paging) — buang page/limit sebelum dikirim.
    const statsParams = { ...params };
    delete statsParams.page;
    delete statsParams.limit;
    store.fetchStats(statsParams);
  };

  const handleExport = () => store.exportToCSV(buildParams(1));

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
    filters.status = '';
    filters.picId = '';
    filters.dateFrom = '';
    filters.dateTo = '';
    filters.needsApproval = false;
    fetchData(1);
  };

  watch(() => filters.search, () => {
    debouncedSearch();
  });

  watch(
    [
      () => filters.status,
      () => filters.picId,
      () => filters.dateFrom,
      () => filters.dateTo,
      () => filters.needsApproval,
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
    handleExport,
    handlePageChange,
    resetFilters,
  };
}

registerFilterReset(() => {
  filters.search = '';
  filters.status = '';
  filters.picId = '';
  filters.dateFrom = '';
  filters.dateTo = '';
  filters.needsApproval = false;
});

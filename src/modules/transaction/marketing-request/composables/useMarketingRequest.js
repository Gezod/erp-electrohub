import { reactive, watch, onMounted } from 'vue';
import { useMarketingRequestStore } from '../marketingRequest.store';
import debounce from 'lodash/debounce';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useMarketingRequest
 * Composable for marketing request list with full filter support.
 */
const filters = reactive({
  search: '',
  status: '',
  requestType: '',
  requesterType: '',
  locationId: '',
  dateFrom: '',
  dateTo: '',
});

export function useMarketingRequest() {
  const marketingRequestStore = useMarketingRequestStore();

  const buildParams = (page = 1) => {
    const params = {
      page,
      limit: marketingRequestStore.pagination.dataPerPage || 10,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.requestType) params.request_type = filters.requestType;
    if (filters.requesterType) params.requester_type = filters.requesterType;
    if (filters.locationId) params.requester_location_id = filters.locationId;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;
    return params;
  };

  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && marketingRequestStore.requests.length > 0) {
      return;
    }
    await marketingRequestStore.fetchRequests(buildParams(page));
  };

  const handleExport = () => marketingRequestStore.exportToCSV(buildParams(1));

  const debouncedSearch = debounce(() => { fetchData(1, true); }, 500);

  const handlePageChange = (newPage) => { fetchData(newPage, true); };

  const resetFilters = () => {
    filters.search = '';
    filters.status = '';
    filters.requestType = '';
    filters.requesterType = '';
    filters.locationId = '';
    filters.dateFrom = '';
    filters.dateTo = '';
    fetchData(1, true);
  };

  watch(() => filters.search, () => { debouncedSearch(); });
  watch([
    () => filters.status,
    () => filters.requestType,
    () => filters.requesterType,
    () => filters.locationId,
    () => filters.dateFrom,
    () => filters.dateTo,
  ], () => { fetchData(1, true); });

  onMounted(() => {
    // Pertahankan halaman terakhir saat kembali dari detail/form.
    fetchData(marketingRequestStore.pagination.currentPage || 1, true);
  });

  return { filters, marketingRequestStore, fetchData, handleExport, handlePageChange, resetFilters };
}

registerFilterReset(() => {
  filters.search = '';
  filters.status = '';
  filters.requestType = '';
  filters.requesterType = '';
  filters.locationId = '';
  filters.dateFrom = '';
  filters.dateTo = '';
});

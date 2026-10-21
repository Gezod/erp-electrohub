import { reactive, watch, onMounted } from 'vue';
import { useRequestStore } from '../request.store';
import debounce from 'lodash/debounce';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useRequest
 * Composable for request list with full filter support.
 */
const filters = reactive({
  search: '',
  status: '',
  tipe: '',
  locationId: '',
  checked_by: '',
  dateFrom: '',
  dateTo: '',
});

export function useRequest() {
  const requestStore = useRequestStore();

  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && requestStore.requests.length > 0) {
      return;
    }
    const params = {
      page,
      limit: requestStore.pagination.dataPerPage || 10,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.tipe) params.tipe = filters.tipe;
    if (filters.locationId) params.location_id = filters.locationId;
    if (filters.checked_by) params.checked_by = filters.checked_by;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;

    await requestStore.fetchRequests(params);
  };

  const debouncedSearch = debounce(() => { fetchData(1, true); }, 500);

  const handlePageChange = (newPage) => { fetchData(newPage, true); };

  const resetFilters = () => {
    filters.search = '';
    filters.status = '';
    filters.tipe = '';
    filters.locationId = '';
    filters.checked_by = '';
    filters.dateFrom = '';
    filters.dateTo = '';
    fetchData(1, true);
  };

  const handleExport = () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.tipe) params.tipe = filters.tipe;
    if (filters.locationId) params.location_id = filters.locationId;
    if (filters.checked_by) params.checked_by = filters.checked_by;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;

    return requestStore.exportToCSV(params);
  };

  watch(() => filters.search, () => { debouncedSearch(); });
  watch([
    () => filters.status,
    () => filters.tipe,
    () => filters.locationId,
    () => filters.checked_by,
    () => filters.dateFrom,
    () => filters.dateTo
  ], () => { fetchData(1, true); });

  onMounted(() => { 
    fetchData(1); 
  });

  return { filters, requestStore, fetchData, handlePageChange, resetFilters, handleExport };
}

registerFilterReset(() => {
  filters.search = '';
  filters.status = '';
  filters.tipe = '';
  filters.locationId = '';
  filters.checked_by = '';
  filters.dateFrom = '';
  filters.dateTo = '';
});

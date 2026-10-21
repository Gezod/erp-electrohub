import { reactive, watch } from 'vue';
import { useLicenseStore } from '../license.store';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useLicense
 * Composable untuk menangani logika filter dan pemuatan data
 * pada list Lisensi.
 */
const filters = reactive({
  search: '',
  status_payment: '',
  is_draft: ''
});

export function useLicense() {
  const licenseStore = useLicenseStore();

  /**
   * fetchData
   * Mengambil data dari store berdasarkan halaman dan filter saat ini.
   */
  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && licenseStore.licenses.length > 0) {
      return;
    }
    const params = {
      page,
      limit: licenseStore.pagination.dataPerPage,
      search: filters.search || undefined,
      status_payment: filters.status_payment || undefined,
      is_draft: filters.is_draft !== '' ? filters.is_draft : undefined
    };
    await licenseStore.fetchLicenses(params);
  };

  /**
   * handlePageChange
   */
  const handlePageChange = (newPage) => {
    fetchData(newPage, true);
  };

  /**
   * resetFilters
   */
  const resetFilters = () => {
    filters.search = '';
    filters.status_payment = '';
    filters.is_draft = '';
    fetchData(1, true);
  };

  // Watchers untuk auto-search saat filter berubah
  watch(
    () => filters.search,
    () => fetchData(1, true)
  );

  watch(
    () => filters.status_payment,
    () => fetchData(1, true)
  );

  watch(
    () => filters.is_draft,
    () => fetchData(1, true)
  );

  return {
    filters,
    licenseStore,
    fetchData,
    handlePageChange,
    resetFilters
  };
}

registerFilterReset(() => {
  filters.search = '';
  filters.status_payment = '';
  filters.is_draft = '';
});

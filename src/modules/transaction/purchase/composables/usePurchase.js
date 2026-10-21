import { reactive, computed, watch, onMounted } from 'vue';
import { usePurchaseStore } from '../purchase.store';
import { registerFilterReset } from '@/utils/filterRegistry';
import { Alert } from '@/plugins/sweetalert';

const defaultFilters = () => ({
  search: '',
  status: '',
  purchase_type: '',
  tipe: '',
  pic_ga: '',
  date_from: '',
  date_to: '',
  payment: '',
  needs_approval: false,
  min_amount: '',
  page: 1,
  limit: 10,
});

const filters = reactive(defaultFilters());

export function usePurchase() {
  const purchaseStore = usePurchaseStore();

  const purchases = computed(() => purchaseStore.purchases);
  const stats = computed(() => purchaseStore.stats);
  const pagination = computed(() => purchaseStore.pagination);
  const isLoading = computed(() => purchaseStore.isLoading);

  const reload = () => {
    purchaseStore.fetchPurchases(filters);
    purchaseStore.fetchStats(filters);
  };

  const applyFilters = () => {
    filters.page = 1;
    reload();
  };

  const changePage = (page) => {
    filters.page = page;
    purchaseStore.fetchPurchases(filters);
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

  const handleExport = async () => {
    const confirmed = await Alert.confirmExport(
      'Apakah Anda setuju untuk export data pembelian?',
      'Sistem akan mengunduh data pembelian ke perangkat Anda'
    );
    if (!confirmed) return;

    try {
      const { page, limit, ...exportParams } = filters;
      await purchaseStore.exportToCSV(exportParams);
      Alert.toast('Berhasil export data pembelian', 'File data pembelian berhasil diunduh ke perangkat Anda', 'success');
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan saat mengunduh file data pembelian';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.toast('Gagal export data pembelian', errorMessage, 'error');
    }
  };

  watch(() => filters.search, () => {
    debouncedSearch();
  });

  return {
    filters,
    purchases,
    stats,
    pagination,
    isLoading,
    purchaseStore,
    reload,
    applyFilters,
    changePage,
    resetFilters,
    handleExport,
  };
}

registerFilterReset(() => {
  Object.assign(filters, defaultFilters());
});

import { reactive, watch, onMounted } from 'vue';
import { useAssetTransferStore } from '../asset-transfer.store';
import { registerFilterReset } from '@/utils/filterRegistry';
import { Alert } from '@/plugins/sweetalert';

const filters = reactive({
  search: '',
  status: '',
  tipe: '',
  picId: '',
  dateFrom: '',
  dateTo: '',
});

export function useAssetTransfer() {
  const transferStore = useAssetTransferStore();

  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && transferStore.transfers.length > 0) {
      return;
    }
    const params = {
      page,
      limit: transferStore.pagination.dataPerPage || 10,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.tipe) params.tipe = filters.tipe;
    if (filters.picId) params.from_pic_id = filters.picId;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;

    await transferStore.fetchTransfers(params);
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage, true);
  };

  let searchTimeout = null;
  const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchData(1, true), 400);
  };

  const resetFilters = () => {
    filters.search = '';
    filters.status = '';
    filters.tipe = '';
    filters.picId = '';
    filters.dateFrom = '';
    filters.dateTo = '';
    fetchData(1, true);
  };

  watch(() => filters.search, () => {
    debouncedSearch();
  });

  watch(
    [
      () => filters.status,
      () => filters.tipe,
      () => filters.picId,
      () => filters.dateFrom,
      () => filters.dateTo,
    ],
    () => {
      fetchData(1, true);
    }
  );

  const resolveExportError = async (error, label) => {
    let errorMessage = `Terjadi kesalahan saat mengunduh file data ${label}`;
    if (error.response?.data instanceof Blob) {
      try {
        const json = JSON.parse(await error.response.data.text());
        if (json.message) {
          errorMessage = json.message;
        }
      } catch {
        // use default
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return errorMessage;
  };

  const runExport = async (type) => {
    const label = type === 'stock' ? 'mutasi stok' : 'mutasi aset';
    const confirmed = await Alert.confirmExport(
      `Apakah Anda setuju untuk export data ${label}?`,
      `Sistem akan mengunduh data ${label} dari monitoring mutasi aset`
    );
    if (!confirmed) return;
    try {
      const params = { type };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.tipe) params.tipe = filters.tipe;
      if (filters.picId) params.from_pic_id = filters.picId;
      await transferStore.exportToCSV(params);
      Alert.toast(`Berhasil export data ${label}`, `File data ${label} berhasil diunduh ke perangkat Anda`, 'success');
    } catch (error) {
      Alert.toast(`Gagal export data ${label}`, await resolveExportError(error, label), 'error');
    }
  };

  const handleExportAsset = () => runExport('asset');
  const handleExportStock = () => runExport('stock');

  onMounted(() => {
    fetchData(transferStore.pagination.currentPage || 1, true);
  });

  return {
    filters,
    transferStore,
    fetchData,
    handlePageChange,
    resetFilters,
    handleExportAsset,
    handleExportStock,
  };
}

registerFilterReset(() => {
  filters.search = '';
  filters.status = '';
  filters.tipe = '';
  filters.picId = '';
  filters.dateFrom = '';
  filters.dateTo = '';
});

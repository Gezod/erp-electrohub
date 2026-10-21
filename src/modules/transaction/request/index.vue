<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">

      <!-- ── Controls Bar ──────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <!-- Search Input -->
        <div class="relative w-full sm:w-80 group">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-500 transition-colors pointer-events-none" />
          <input v-model="filters.search" type="text" placeholder="Cari kode, nama pemohon, lokasi..."
            class="w-full pl-9 pr-4 bg-white dark:bg-gray-900 border border-border text-text-active rounded-md outline-none text-sm placeholder:text-text-placeholder focus:border-brand-500 transition-all h-10"
            @keyup.enter="fetchData(1, true)" />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Active filter indicator -->
          <span v-if="hasActiveFilters"
            class="text-xs text-brand-500 font-medium flex items-center gap-1 mr-1 select-none">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block"></span>
            Filter aktif
          </span>

          <!-- Export CSV button -->
          <ActionButton @click="handleExportCSV">
            <Download class="w-4 h-4" />
            <span class="hidden sm:inline">Export CSV</span>
          </ActionButton>

          <!-- Add Request Button (Glossy Black) -->
          <GlossyButton v-can="'requests:create'" @click="handleCreate">
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah Permintaan</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Filters Modal -->
      <FilterModal v-model="showFilter" title="Filter Permintaan" :schema="filterSchema" :model="localFilters"
        :has-active-filters="hasActiveFilters" @apply="applyFiltersFromModal" @reset="handleReset" />

      <!-- ── Data Table ──────────────────────────────────────── -->
      <DataTable :columns="tableColumns" :data="requestStore.requests" :loading="requestStore.isLoading"
        :server-side="true" :total-items="requestStore.pagination.totalData"
        :current-page="requestStore.pagination.currentPage" :items-per-page="requestStore.pagination.dataPerPage"
        permission-prefix="requests" :can-detail="() => isGaOrHrga"
        :can-edit="(item) => item.status === 'draft' || item.status === 'dalam_pengajuan'"
        :can-delete="(item) => item.status === 'draft' || item.status === 'dalam_pengajuan'" title="Permintaan Barang"
        subtitle="Pengajuan &amp; Permintaan Inventaris • GA"
        @detail="(item) => router.push({ name: 'RequestDetail', params: { id: item.id } })"
        @edit="(item) => handleEdit(item.id)" @delete="(item) => handleDelete(item.id)"
        @update:current-page="handlePageChange">
        <template #header-actions>
          <!-- Status Tabs -->
          <div
            class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md shrink-0 h-9 w-fit max-w-full overflow-x-auto">
            <button v-for="tab in statusTabs" :key="tab.key" @click="handleStatusTabClick(tab.key)" :class="[
              'flex items-center justify-center px-2.5 h-full rounded text-xs transition-all duration-200 border whitespace-nowrap shrink-0 cursor-pointer',
              activeStatusTab === tab.key
                ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
            ]">
              {{ tab.label }}
            </button>
          </div>

          <!-- Filter Button -->
          <button @click="showFilter = true"
            class="bg-white dark:bg-gray-900 border border-border text-text-active rounded-md px-3.5 flex items-center gap-1.5 font-medium text-sm h-9 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 duration-200 shrink-0">
            <FilterIcon class="w-4 h-4 text-text-active" />
            <span>Filter</span>
            <span v-if="hasActiveFilters" class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
          </button>
        </template>

        <!-- No -->
        <template #cell-no="{ index }">
          {{ ((Math.max(1, Number(requestStore.pagination?.currentPage || requestStore.pagination?.page || 1)) - 1) * Number(requestStore.pagination?.dataPerPage || requestStore.pagination?.limit || 10)) + index + 1 }}
        </template>

        <!-- Kode Pengajuan -->
        <template #cell-requestCode="{ item }">
          <div class="flex items-center gap-2 py-1">
            <router-link v-if="isGaOrHrga" :to="{ name: 'RequestDetail', params: { id: item.id } }"
              class="font-medium text-sm text-text-active hover:text-brand-500 hover:underline transition-all whitespace-nowrap">
              {{ item.requestCode }}
            </router-link>
            <span v-else class="font-medium text-sm text-text-active whitespace-nowrap">
              {{ item.requestCode }}
            </span>

            <span v-if="item.tipe && item.tipe !== 'biasa'" :class="[
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap',
              tipeBadgeClass(item.tipe)
            ]">
              {{ getTipeLabel(item.tipe) }}
            </span>
          </div>
        </template>

        <!-- Tanggal -->
        <template #cell-dateRequest="{ item }">
          <span class="text-sm text-text-muted whitespace-nowrap">
            {{ formatDate(item.dateRequest) }}
          </span>
        </template>

        <!-- Pemohon (Initial circle avatar + Bold name) -->
        <template #cell-employeeName="{ item }">
          <div class="flex items-center gap-2 py-1 select-none">
            <div
              class="w-7 h-7 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center text-xs font-bold shrink-0">
              {{ getInitial(item.employeeName) }}
            </div>
            <span class="font-medium text-sm text-text-active whitespace-nowrap">{{ item.employeeName }}</span>
          </div>
        </template>

        <!-- Divisi -->
        <template #cell-divisionName="{ item }">
          <span class="text-sm text-text-muted whitespace-nowrap">
            {{ item.divisionName || '-' }}
          </span>
        </template>

        <!-- Lokasi -->
        <template #cell-locationName="{ item }">
          <span class="text-sm font-medium text-text-active whitespace-nowrap">
            {{ item.locationName || '-' }}
          </span>
        </template>

        <!-- Jumlah Item -->
        <template #cell-itemCount="{ item }">
          <span class="text-sm font-medium text-text-active">
            {{ item.itemCount || 0 }} <span class="text-xs text-text-muted font-normal">Item</span>
          </span>
        </template>

        <!-- Status -->
        <template #cell-status="{ item }">
          <span :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize whitespace-nowrap gap-1',
            statusBadgeClass(item.status)
          ]">
            <CheckCircle v-if="item.status === 'diserahkan' || item.status === 'disetujui'" class="w-3 h-3 shrink-0" />
            <Info v-else-if="item.status === 'proses_ga'" class="w-3 h-3 shrink-0" />
            <ClipboardList v-else-if="item.status === 'dalam_pengajuan'" class="w-3 h-3 shrink-0" />
            <FileText v-else-if="item.status === 'draft'" class="w-3 h-3 shrink-0" />
            <X v-else-if="item.status === 'batal'" class="w-3 h-3 shrink-0" />
            <span>{{ getStatusLabel(item.status) }}</span>
          </span>
        </template>
      </DataTable>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <RequestFormModal v-model="showFormModal" :request-id="selectedRequestId" @saved="handleFormSaved" />
  </AdminLayout>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { isGaDivision } from '@/utils/division';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import RequestFormModal from './components/RequestFormModal.vue';
import { useRequest } from './composables/useRequest';
import { Alert } from '@/plugins/sweetalert';
import { FilterIcon } from '@/icons';
import {
  Search, Plus,
  Download, X, CheckCircle, Info, FileText, ClipboardList
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const { filters, requestStore, fetchData, handlePageChange, resetFilters, handleExport } = useRequest();
const isSuperAdmin = computed(() => authStore.user?.is_superadmin === true);

const showFormModal = ref(false);
const selectedRequestId = ref(null);
const showFilter = ref(false);
const activeStatusTab = ref('');

const statusTabs = [
  { key: '', label: 'Semua' },
  { key: 'draft', label: 'Draft' },
  { key: 'dalam_pengajuan', label: 'Pengajuan' },
  { key: 'proses_ga', label: 'Proses GA' },
  { key: 'disetujui', label: 'Disetujui' },
  { key: 'diserahkan', label: 'Diserahkan' },
  { key: 'batal', label: 'Batal' },
];

const handleStatusTabClick = (statusKey) => {
  activeStatusTab.value = statusKey;
  filters.status = statusKey;
  localFilters.status = statusKey;
  fetchData(1, true);
};

const handleCreate = () => {
  selectedRequestId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedRequestId.value = id;
  showFormModal.value = true;
};

const handleFormSaved = () => {
  fetchData(requestStore.pagination.currentPage, true);
};

const handleExportCSV = async () => {
  const confirmed = await Alert.confirmExport(
    'Apakah Anda setuju untuk export data permintaan barang?',
    'Sistem akan mengunduh data permintaan barang ke perangkat Anda'
  );
  if (confirmed) {
    try {
      await handleExport();
      Alert.toast('File data permintaan barang berhasil diunduh ke perangkat Anda', 'success');
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan saat mengunduh file data permintaan barang';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.toast(errorMessage, 'error');
    }
  }
};

const isGaOrHrga = computed(() => {
  if (authStore.user?.is_superadmin || authStore.user?.isAdmin || authStore.user?.is_admin) return true;
  return isGaDivision(authStore.user?.divisionName || authStore.user?.division_name);
});

const localFilters = reactive({
  search: '',
  status: '',
  tipe: '',
  checked_by: '',
  dateFrom: '',
  dateTo: '',
});

const hasActiveFilters = computed(() => {
  return !!(
    localFilters.search ||
    localFilters.status ||
    localFilters.tipe ||
    localFilters.checked_by ||
    localFilters.dateFrom ||
    localFilters.dateTo
  );
});

const filterSchema = computed(() => [
  {
    label: 'Cari Data',
    key: 'search',
    type: 'text',
    placeholder: 'Cari kode...'
  },
  {
    label: 'Pilih Status',
    key: 'status',
    type: 'select',
    options: [
      { label: 'Semua Status', value: '' },
      { label: 'Draft', value: 'draft' },
      { label: 'Dalam Pengajuan', value: 'dalam_pengajuan' },
      { label: 'Proses GA', value: 'proses_ga' },
      { label: 'Disetujui', value: 'disetujui' },
      { label: 'Diserahkan', value: 'diserahkan' },
      { label: 'Batal', value: 'batal' }
    ]
  },
  {
    label: 'Pilih Tipe',
    key: 'tipe',
    type: 'select',
    options: [
      { label: 'Semua Tipe', value: '' },
      { label: 'Biasa', value: 'biasa' },
      { label: 'Opening', value: 'opening' },
      { label: 'Parfum', value: 'parfum' }
    ]
  },
  ...(isSuperAdmin.value ? [{
    label: 'PIC GA',
    key: 'checked_by',
    type: 'searchable-select',
    master: 'employees',
    placeholder: 'Semua PIC'
  }] : []),
  {
    label: 'Dari Tanggal',
    key: 'dateFrom',
    type: 'date',
    placeholder: 'dd/mm/yyyy'
  },
  {
    label: 'Sampai Tanggal',
    key: 'dateTo',
    type: 'date',
    placeholder: 'dd/mm/yyyy'
  }
]);

watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.search = filters.search;
    localFilters.status = filters.status;
    localFilters.tipe = filters.tipe;
    localFilters.checked_by = filters.checked_by;
    localFilters.dateFrom = filters.dateFrom;
    localFilters.dateTo = filters.dateTo;
  }
});

const applyFiltersFromModal = () => {
  filters.search = localFilters.search;
  filters.status = localFilters.status;
  activeStatusTab.value = localFilters.status || '';
  filters.tipe = localFilters.tipe;
  filters.checked_by = localFilters.checked_by;
  filters.dateFrom = localFilters.dateFrom;
  filters.dateTo = localFilters.dateTo;
  showFilter.value = false;
};

const handleReset = () => {
  resetFilters();
  activeStatusTab.value = '';
  Object.assign(localFilters, {
    search: '',
    status: '',
    tipe: '',
    checked_by: '',
    dateFrom: '',
    dateTo: '',
  });
  showFilter.value = false;
};

const tableColumns = [
  { key: 'no', label: 'No', width: '50px' },
  { key: 'requestCode', label: 'Kode' },
  { key: 'dateRequest', label: 'Tanggal' },
  { key: 'employeeName', label: 'Pemohon' },
  { key: 'divisionName', label: 'Divisi' },
  { key: 'locationName', label: 'Lokasi' },
  { key: 'itemCount', label: 'Jumlah Item' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Aksi', align: 'right' },
];

const getStatusLabel = (s) => ({
  draft: 'Draft',
  dalam_pengajuan: 'Pengajuan',
  proses_ga: 'Proses GA',
  disetujui: 'Disetujui',
  diserahkan: 'Diserahkan',
  batal: 'Batal',
}[s] || s);

const statusBadgeClass = (s) => ({
  draft: 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  dalam_pengajuan: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  proses_ga: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  disetujui: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
  diserahkan: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400',
  batal: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
}[s] || 'bg-gray-100 border-gray-200 text-gray-700');

const getTipeLabel = (t) => ({
  opening: 'Opening',
  parfum: 'Parfum',
}[t] || t);

const tipeBadgeClass = (t) => ({
  opening: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  parfum: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400',
}[t] || 'bg-gray-100 border-gray-200 text-gray-700');

const getInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : '?';
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
};

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Permintaan?', 'Data yang dihapus tidak dapat dikembalikan.');
  if (confirmed) {
    try {
      await requestStore.deleteRequest(id);
      Alert.success('Berhasil', 'Permintaan berhasil dihapus.');
      fetchData(requestStore.pagination.currentPage, true);
    } catch (err) {
      Alert.error('Gagal', err.response?.data?.message || 'Terjadi kesalahan.');
    }
  }
};
</script>

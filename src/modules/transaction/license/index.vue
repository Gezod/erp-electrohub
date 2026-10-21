<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">

      <!-- ── Controls Bar ──────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full select-none">
        <!-- Left: Search Input -->
        <div class="relative w-full sm:w-80 group">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-500 transition-colors pointer-events-none" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Cari Nama Aplikasi atau No. Lisensi..."
            class="w-full pl-9 pr-4 bg-white dark:bg-gray-900 border border-border text-text-active rounded-md outline-none text-sm placeholder:text-text-placeholder focus:border-brand-500 transition-all h-10"
          />
        </div>

        <!-- Right: Actions Group -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Active filter indicator -->
          <span v-if="hasActiveFilters" class="text-xs text-brand-500 font-medium flex items-center gap-1 mr-1 select-none">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block"></span>
            Filter aktif
          </span>

          <!-- Export CSV -->
          <ActionButton @click="handleExportCSV">
            <Download class="w-4 h-4" />
            <span class="hidden sm:inline">Export CSV</span>
          </ActionButton>

          <!-- Tambah Lisensi (Glossy Black) -->
          <GlossyButton
            v-can="'licenses:create'"
            @click="handleCreate"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah Lisensi</span>
          </GlossyButton>
        </div>
      </div>

      <!-- ── Filters Modal ────────────────────────────────────── -->
      <FilterModal
        v-model="showFilter"
        title="Filter Lisensi"
        :schema="filterSchema"
        :model="filters"
        :has-active-filters="hasActiveFilters"
        @apply="showFilter = false"
        @reset="resetFilters"
      />

      <!-- ── Data Table ───────────────────────────────────────── -->
      <DataTable
        :columns="tableColumns"
        :data="licenseStore.licenses"
        :loading="licenseStore.isLoading"
        :server-side="true"
        :total-items="licenseStore.pagination.totalData"
        :current-page="licenseStore.pagination.currentPage"
        :items-per-page="licenseStore.pagination.dataPerPage"
        permission-prefix="licenses"
        title="Daftar Lisensi"
        subtitle="Kelola Perizinan & Sertifikasi • Transaksi"
        @edit="(item) => handleEdit(item.id)"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
      >
        <template #header-actions>
          <!-- Status Tabs -->
          <div class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md shrink-0 h-9 w-fit max-w-full overflow-x-auto">
            <button
              v-for="tab in statusTabs"
              :key="tab.key"
              @click="handleStatusTabClick(tab)"
              :class="[
                'flex items-center justify-center gap-1.5 px-2.5 h-full rounded text-xs transition-all duration-200 border whitespace-nowrap shrink-0 cursor-pointer',
                isTabActive(tab)
                  ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                  : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
              ]"
            >
              <span>{{ tab.label }}</span>
              <span
                v-if="tab.badge && tabBadgeCount(tab.key) > 0"
                class="min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-[10px] font-bold"
              >
                {{ tabBadgeCount(tab.key) > 99 ? '99+' : tabBadgeCount(tab.key) }}
              </span>
            </button>
          </div>

          <!-- Filter Button -->
          <button
            @click="showFilter = true"
            class="bg-white dark:bg-gray-900 border border-border text-text-active rounded-md px-3.5 flex items-center gap-1.5 font-medium text-sm h-9 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 duration-200 shrink-0"
          >
            <FilterIcon class="w-4 h-4 text-text-active" />
            <span>Filter</span>
            <span v-if="hasActiveFilters" class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
          </button>
        </template>

        <!-- No -->
        <template #cell-no="{ index }">
          {{ ((Math.max(1, Number(licenseStore.pagination?.currentPage || licenseStore.pagination?.page || 1)) - 1) * Number(licenseStore.pagination?.dataPerPage || licenseStore.pagination?.limit || 10)) + index + 1 }}
        </template>

        <!-- Nama Aplikasi -->
        <template #cell-appName="{ item }">
          <div class="flex flex-col items-start gap-0.5">
            <span class="text-sm font-semibold text-text-active">
              {{ item.appName }}
            </span>
            <span
              v-if="item.isRecurring"
              class="inline-flex items-center text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-tight"
            >
              Langganan Berulang
            </span>
          </div>
        </template>

        <!-- Nomor Lisensi -->
        <template #cell-numberLicense="{ item }">
          <span class="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs uppercase bg-gray-100 dark:bg-gray-800 text-text-active border border-border">
            {{ item.numberLicense }}
          </span>
        </template>

        <!-- Lokasi -->
        <template #cell-locationName="{ item }">
          <span class="text-sm font-medium text-text-active">
            {{ item.locationName || '-' }}
          </span>
        </template>

        <!-- Tanggal Expired -->
        <template #cell-dateExpired="{ item }">
          <div class="flex flex-col items-start leading-snug">
            <div class="flex items-center gap-1.5 text-sm" :class="isExpiringSoon(item.dateExpired) ? 'text-red-600 font-bold' : 'text-text-active font-medium'">
              <Calendar class="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>{{ formatDate(item.dateExpired) }}</span>
            </div>
            <span
              v-if="isExpiringSoon(item.dateExpired)"
              class="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-tight mt-0.5 flex items-center gap-1"
            >
              <AlertCircle class="w-3 h-3 shrink-0" />
              Mendekati Expired
            </span>
          </div>
        </template>

        <!-- Biaya Periode -->
        <template #cell-pricePeriode="{ item }">
          <span class="text-sm font-semibold text-text-active">
            {{ formatCurrency(item.pricePeriode) }}
          </span>
        </template>

        <!-- Status Pembayaran -->
        <template #cell-statusPayment="{ item }">
          <Badge
            :color="item.statusPayment === 'paid' ? 'success' : 'error'"
            variant="light"
            class="text-[11px] font-bold"
          >
            {{ item.statusPayment === 'paid' ? 'Lunas' : 'Belum Lunas' }}
          </Badge>
        </template>

        <!-- Status Lisensi -->
        <template #cell-status="{ item }">
          <Badge
            :color="item.isDraft ? 'light' : (item.isActive ? 'success' : 'error')"
            variant="light"
            class="text-[11px] font-bold"
          >
            {{ item.status }}
          </Badge>
        </template>
      </DataTable>

      <!-- ── License Form Modal Dialog ──────────────────────── -->
      <LicenseFormModal
        v-model="showFormModal"
        :license-id="selectedLicenseId"
        @saved="handleSaved"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import Badge from '@/components/ui/Badge.vue';
import LicenseFormModal from './components/LicenseFormModal.vue';
import { useLicense } from './composables/useLicense';
import { FilterIcon } from '@/icons';
import { Search, Plus, Download, Calendar, AlertCircle } from 'lucide-vue-next';
import { Alert } from '@/plugins/sweetalert';

const {
  filters,
  licenseStore,
  fetchData,
  handlePageChange,
  resetFilters
} = useLicense();

// --- Modal States ---
const showFormModal = ref(false);
const selectedLicenseId = ref(null);
const showFilter = ref(false);

const hasActiveFilters = computed(() => {
  return !!(filters.search || filters.status_payment || filters.is_draft);
});

// --- Status Tabs ---
const statusTabs = [
  { key: 'all', label: 'Semua' },
  { key: 'paid', label: 'Lunas' },
  { key: 'unpaid', label: 'Belum Lunas' },
  { key: 'draft', label: 'Draft', badge: true }
];

const isTabActive = (tab) => {
  if (tab.key === 'all') {
    return !filters.status_payment && !filters.is_draft;
  }
  if (tab.key === 'paid') {
    return filters.status_payment === 'paid' && !filters.is_draft;
  }
  if (tab.key === 'unpaid') {
    return filters.status_payment === 'unpaid' && !filters.is_draft;
  }
  if (tab.key === 'draft') {
    return filters.is_draft === 'true';
  }
  return false;
};

const tabBadgeCount = (statusKey) => {
  if (statusKey === 'draft') {
    return (licenseStore.licenses || []).filter((l) => l.isDraft).length;
  }
  return 0;
};

const handleStatusTabClick = (tab) => {
  if (tab.key === 'all') {
    filters.status_payment = '';
    filters.is_draft = '';
  } else if (tab.key === 'paid') {
    filters.status_payment = 'paid';
    filters.is_draft = 'false';
  } else if (tab.key === 'unpaid') {
    filters.status_payment = 'unpaid';
    filters.is_draft = 'false';
  } else if (tab.key === 'draft') {
    filters.status_payment = '';
    filters.is_draft = 'true';
  }
};

// --- Filter Modal Schema ---
const filterSchema = [
  {
    label: 'Kata Kunci',
    key: 'search',
    type: 'text',
    placeholder: 'Cari Nama Aplikasi atau No. Lisensi...'
  },
  {
    label: 'Status Pembayaran',
    key: 'status_payment',
    type: 'select',
    placeholder: 'Semua Status Bayar',
    options: [
      { label: 'Semua Status Bayar', value: '' },
      { label: 'Lunas', value: 'paid' },
      { label: 'Belum Lunas', value: 'unpaid' }
    ]
  },
  {
    label: 'Status Registrasi',
    key: 'is_draft',
    type: 'select',
    placeholder: 'Semua Status',
    options: [
      { label: 'Semua', value: '' },
      { label: 'Aktif / Terdaftar', value: 'false' },
      { label: 'Draft', value: 'true' }
    ]
  }
];

// --- Table Columns ---
const tableColumns = [
  { key: 'no',            label: 'No',              width: '60px' },
  { key: 'appName',       label: 'Nama Aplikasi' },
  { key: 'numberLicense', label: 'Nomor Lisensi' },
  { key: 'locationName',  label: 'Lokasi' },
  { key: 'dateExpired',   label: 'Tanggal Expired' },
  { key: 'pricePeriode',  label: 'Harga Periode' },
  { key: 'statusPayment', label: 'Status Bayar' },
  { key: 'status',        label: 'Status' },
  { key: 'action',        label: 'Aksi',            width: '90px' }
];

onMounted(() => {
  fetchData();
});

// --- Actions ---
const handleCreate = () => {
  selectedLicenseId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedLicenseId.value = id;
  showFormModal.value = true;
};

const handleSaved = () => {
  fetchData(licenseStore.pagination.currentPage || 1, true);
};

const handleDelete = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const app = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.appName : '';

  const isConfirmed = await Alert.confirmDelete(
    `Hapus Data Lisensi?`,
    `Data lisensi ${app ? `"${app}"` : ''} akan dihapus secara permanen dari sistem.`
  );

  if (isConfirmed) {
    try {
      await licenseStore.deleteLicense(id);
      Alert.toast('Data lisensi telah dihapus', 'success');
      fetchData(licenseStore.pagination.currentPage || 1, true);
    } catch (err) {
      Alert.error('Gagal', err.response?.data?.message || 'Gagal menghapus data lisensi');
    }
  }
};

const handleExportCSV = async () => {
  const confirmed = await Alert.confirmExport(
    'Export Data Lisensi?',
    'Sistem akan mengunduh data lisensi ke perangkat Anda.'
  );

  if (confirmed) {
    try {
      const params = {
        search: filters.search || undefined,
        status_payment: filters.status_payment || undefined,
        is_draft: filters.is_draft || undefined
      };
      await licenseStore.exportToCSV(params);
      Alert.toast('Berhasil export data lisensi', 'success');
    } catch (error) {
      Alert.toast('Gagal export data lisensi', error.response?.data?.message || error.message || 'Terjadi kesalahan', 'error');
    }
  }
};

// --- Helpers ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0);
};

const isExpiringSoon = (dateString) => {
  if (!dateString) return false;
  const expDate = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 30;
};
</script>

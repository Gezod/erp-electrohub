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
            placeholder="Cari Plat Nomor, Nama STNK..."
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

          <!-- Tambah Kendaraan (Glossy Black) -->
          <GlossyButton
            v-can="'vehicles:create'"
            @click="handleCreate"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah Kendaraan</span>
          </GlossyButton>
        </div>
      </div>

      <!-- ── Filters Modal ────────────────────────────────────── -->
      <FilterModal
        v-model="showFilter"
        title="Filter Kendaraan"
        :schema="filterSchema"
        :model="filters"
        :has-active-filters="hasActiveFilters"
        @apply="showFilter = false"
        @reset="resetFilters"
      />

      <!-- ── Data Table ───────────────────────────────────────── -->
      <DataTable
        :columns="tableColumns"
        :data="vehicleStore.vehicles"
        :loading="vehicleStore.isLoading"
        :server-side="true"
        :total-items="vehicleStore.pagination.totalData"
        :current-page="vehicleStore.pagination.currentPage"
        :items-per-page="vehicleStore.pagination.dataPerPage"
        permission-prefix="vehicles"
        title="Daftar Kendaraan"
        subtitle="Inventaris & Manajemen Armada • Transaksi"
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
              @click="handleStatusTabClick(tab.key)"
              :class="[
                'flex items-center justify-center gap-1.5 px-2.5 h-full rounded text-xs transition-all duration-200 border whitespace-nowrap shrink-0 cursor-pointer',
                (filters.is_draft || '') === tab.key
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
          {{ ((Math.max(1, Number(vehicleStore.pagination?.currentPage || vehicleStore.pagination?.page || 1)) - 1) * Number(vehicleStore.pagination?.dataPerPage || vehicleStore.pagination?.limit || 10)) + index + 1 }}
        </template>

        <!-- Plat Nomor -->
        <template #cell-plateNumber="{ item }">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs uppercase bg-gray-100 dark:bg-gray-800 text-text-active border border-border">
              {{ item.plateNumber }}
            </span>
          </div>
        </template>

        <!-- Jenis Kendaraan -->
        <template #cell-vehicleType="{ item }">
          <span class="text-sm font-medium text-text-active capitalize">
            {{ item.vehicleType || '-' }}
          </span>
        </template>

        <!-- Nama STNK -->
        <template #cell-nameStnk="{ item }">
          <span class="text-sm text-text-active font-medium">
            {{ item.nameStnk || '-' }}
          </span>
        </template>

        <!-- Tanggal STNK -->
        <template #cell-dateStnk="{ item }">
          <div class="flex items-center gap-1.5 text-sm text-text-active">
            <Calendar class="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span>{{ formatDate(item.dateStnk) }}</span>
          </div>
        </template>

        <!-- Tanggal Servis -->
        <template #cell-dateService="{ item }">
          <div class="flex items-center gap-1.5 text-sm text-text-active">
            <Clock class="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span>{{ formatDate(item.dateService) }}</span>
          </div>
        </template>

        <!-- Interval Servis -->
        <template #cell-intervalService="{ item }">
          <span class="text-sm text-text-active font-medium">
            {{ item.intervalService }}
          </span>
        </template>

        <!-- Status -->
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

      <!-- ── Vehicle Form Modal Dialog ──────────────────────── -->
      <VehicleFormModal
        v-model="showFormModal"
        :vehicle-id="selectedVehicleId"
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
import VehicleFormModal from './components/VehicleFormModal.vue';
import { useVehicle } from './composables/useVehicle';
import { FilterIcon } from '@/icons';
import { Search, Plus, Download, Calendar, Clock } from 'lucide-vue-next';
import { Alert } from '@/plugins/sweetalert';

const {
  filters,
  vehicleStore,
  fetchData,
  handlePageChange,
  resetFilters
} = useVehicle();

// --- Modal States ---
const showFormModal = ref(false);
const selectedVehicleId = ref(null);
const showFilter = ref(false);

const hasActiveFilters = computed(() => {
  return !!(filters.search || filters.is_draft);
});

// --- Status Tabs ---
const statusTabs = [
  { key: '', label: 'Semua' },
  { key: 'false', label: 'Aktif / Terdaftar' },
  { key: 'true', label: 'Draft', badge: true }
];

const tabBadgeCount = (statusKey) => {
  if (statusKey === 'true') {
    return (vehicleStore.vehicles || []).filter((v) => v.isDraft).length;
  }
  return 0;
};

const handleStatusTabClick = (statusKey) => {
  filters.is_draft = statusKey;
};

// --- Filter Modal Schema ---
const filterSchema = [
  {
    label: 'Kata Kunci',
    key: 'search',
    type: 'text',
    placeholder: 'Cari Plat Nomor, Nama STNK...'
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
  { key: 'no',              label: 'No',                 width: '60px' },
  { key: 'plateNumber',     label: 'Plat Nomor' },
  { key: 'vehicleType',     label: 'Jenis Kendaraan' },
  { key: 'nameStnk',        label: 'Nama STNK' },
  { key: 'dateStnk',        label: 'Masa Berlaku STNK' },
  { key: 'dateService',     label: 'Servis Terdekat' },
  { key: 'intervalService', label: 'Interval' },
  { key: 'status',          label: 'Status' },
  { key: 'action',          label: 'Aksi',               width: '90px' }
];

onMounted(() => {
  fetchData();
});

// --- Actions ---
const handleCreate = () => {
  selectedVehicleId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedVehicleId.value = id;
  showFormModal.value = true;
};

const handleSaved = () => {
  fetchData(vehicleStore.pagination.currentPage || 1, true);
};

const handleDelete = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const plate = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.plateNumber : '';

  const isConfirmed = await Alert.confirmDelete(
    `Hapus Data Kendaraan?`,
    `Data kendaraan ${plate ? `"${plate}"` : ''} akan dihapus secara permanen dari sistem.`
  );

  if (isConfirmed) {
    try {
      await vehicleStore.deleteVehicle(id);
      Alert.toast('Data kendaraan telah dihapus', 'success');
      fetchData(vehicleStore.pagination.currentPage || 1, true);
    } catch (err) {
      Alert.error('Gagal', err.response?.data?.message || 'Gagal menghapus data kendaraan');
    }
  }
};

const handleExportCSV = async () => {
  const confirmed = await Alert.confirmExport(
    'Export Data Kendaraan?',
    'Sistem akan mengunduh data kendaraan ke perangkat Anda.'
  );

  if (confirmed) {
    try {
      const params = {
        search: filters.search || undefined,
        is_draft: filters.is_draft || undefined
      };
      await vehicleStore.exportToCSV(params);
      Alert.toast('Berhasil export data kendaraan', 'success');
    } catch (error) {
      Alert.toast('Gagal export data kendaraan', error.response?.data?.message || error.message || 'Terjadi kesalahan', 'error');
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
  } catch (e) {
    return dateString;
  }
};
</script>

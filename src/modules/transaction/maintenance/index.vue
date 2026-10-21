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
            placeholder="Cari kode tiket atau item..."
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

          <!-- Tambah Pengajuan (Glossy Black) -->
          <GlossyButton
            v-can="'maintenance:create'"
            @click="handleCreate"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah Pengajuan</span>
          </GlossyButton>
        </div>
      </div>

      <!-- ── Stats Section ────────────────────────────────────── -->
      <MaintenanceStats />

      <!-- ── Filters Modal ────────────────────────────────────── -->
      <FilterModal
        v-model="showFilter"
        title="Filter Maintenance"
        :schema="filterSchema"
        :model="filters"
        :has-active-filters="hasActiveFilters"
        @apply="showFilter = false"
        @reset="resetFilters"
      />

      <!-- ── Data Table Section ───────────────────────────────── -->
      <DataTable
        :columns="tableColumns"
        :data="maintenanceStore.maintenances"
        :loading="maintenanceStore.isLoading"
        :server-side="true"
        :total-items="maintenanceStore.pagination.totalData"
        :current-page="maintenanceStore.pagination.currentPage"
        :items-per-page="maintenanceStore.pagination.dataPerPage"
        permission-prefix="maintenance"
        :can-edit="(item) => item.status?.toLowerCase() === 'draft'"
        :can-delete="(item) => item.status?.toLowerCase() === 'draft'"
        :can-detail="(item) => item.status?.toLowerCase() !== 'draft'"
        title="Daftar Maintenance"
        subtitle="Kelola Perbaikan & Pemeliharaan • Pemeliharaan & Armada"
        @detail="(item) => router.push({ name: 'MaintenanceDetail', params: { id: item.id } })"
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
                (filters.status || '') === tab.key
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
          {{ ((Math.max(1, Number(maintenanceStore.pagination?.currentPage || maintenanceStore.pagination?.page || 1)) - 1) * Number(maintenanceStore.pagination?.dataPerPage || maintenanceStore.pagination?.limit || 10)) + index + 1 }}
        </template>

        <!-- Kode Maintenance -->
        <template #cell-ticketNumber="{ item }">
          <span class="font-semibold text-sm text-text-active">{{ item.ticketNumber }}</span>
        </template>

        <!-- Tanggal -->
        <template #cell-date="{ item }">
          <span class="text-sm text-text-active font-normal">{{ formatDate(item.date) }}</span>
        </template>

        <!-- Lokasi -->
        <template #cell-location="{ item }">
          <span class="text-sm text-text-active font-medium">{{ item.location }}</span>
        </template>

        <!-- Item Kejadian -->
        <template #cell-eventItem="{ item }">
          <span class="text-sm text-text-active font-semibold">{{ item.eventItem }}</span>
        </template>

        <!-- Progres (segmented bar) -->
        <template #cell-progress="{ item }">
          <div class="flex flex-col gap-1 min-w-[130px]">
            <span class="text-xs text-text-muted font-medium">
              {{ getStageName(item.currentStage) }} • {{ getProgressValue(item.currentStage) }}%
            </span>
            <div class="flex gap-0.5">
              <div
                v-for="seg in 7"
                :key="seg"
                class="h-1.5 rounded-full flex-1 transition-all duration-500"
                :class="seg <= getSegmentsFilled(item.currentStage) ? 'glossy-table-segment-active' : 'glossy-table-segment-inactive'"
              />
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #cell-status="{ item }">
          <Badge :color="getStatusColor(item.status)" variant="light" class="uppercase text-[11px] font-bold">
            {{ item.status }}
          </Badge>
        </template>

        <!-- Pembayaran -->
        <template #cell-payment="{ item }">
          <span v-if="item.paymentAmount > 0" class="font-semibold text-sm text-text-active">
            {{ formatCurrency(item.paymentAmount) }}
          </span>
          <template v-else>
            <span v-if="item.status?.toLowerCase() === 'done'" class="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-tight">
              Tanpa Biaya 
            </span>
            <span v-else class="text-xs font-normal text-text-muted">
              Menunggu Estimasi 
            </span>
          </template>
        </template>
      </DataTable>

      <!-- ── Maintenance Form Modal Dialog ────────────────────── -->
      <MaintenanceFormModal
        v-model="showFormModal"
        :maintenance-id="selectedMaintenanceId"
        @saved="handleSaved"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import Badge from '@/components/ui/Badge.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import MaintenanceStats from './components/MaintenanceStats.vue';
import MaintenanceFormModal from './components/MaintenanceFormModal.vue';
import { useMaintenance } from './composables/useMaintenance';
import { Search, Plus, Download } from 'lucide-vue-next';
import { FilterIcon } from '@/icons';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { employeeIsGaDivision } from '@/utils/division';
import { Alert } from '@/plugins/sweetalert';

const router = useRouter();
const { filters, maintenanceStore, fetchData, handlePageChange, resetFilters, handleExport } = useMaintenance();
const authStore = useAuthStore();

// --- Modal State ---
const showFormModal = ref(false);
const selectedMaintenanceId = ref(null);
const showFilter = ref(false);

const isSuperadmin = computed(() =>
  authStore.user?.is_superadmin === true || authStore.user?.isSuperadmin === true || authStore.user?.isAdmin === true
);

const hasActiveFilters = computed(() => {
  return !!(
    filters.status ||
    filters.pic_ga_id ||
    (filters.divisions && filters.divisions.length > 0) ||
    filters.date_from ||
    filters.date_to
  );
});

// --- Status Tabs ---
const statusTabs = [
  { key: '', label: 'Semua' },
  { key: 'draft', label: 'Draft', badge: true },
  { key: 'open', label: 'Open' },
  { key: 'hold', label: 'Hold' },
  { key: 'done', label: 'Done' }
];

const tabBadgeCount = (statusKey) => {
  if (statusKey === 'draft') {
    return (maintenanceStore.maintenances || []).filter(
      (m) => m.status?.toLowerCase() === 'draft'
    ).length;
  }
  return 0;
};

const handleStatusTabClick = (statusKey) => {
  filters.status = statusKey;
};

// --- Filter Modal Schema ---
const filterSchema = computed(() => {
  const schema = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Semua Status',
      options: [
        { value: '', label: 'Semua Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'open', label: 'Open' },
        { value: 'hold', label: 'Hold' },
        { value: 'done', label: 'Done' }
      ]
    }
  ];

  if (isSuperadmin.value) {
    schema.push({
      key: 'pic_ga_id',
      label: 'PIC GA',
      type: 'searchable-select',
      master: 'employees',
      placeholder: 'Semua PIC GA'
    });
  }

  schema.push(
    {
      key: 'date_from',
      label: 'Dari Tanggal',
      type: 'date',
      placeholder: 'dd/mm/yyyy'
    },
    {
      key: 'date_to',
      label: 'Sampai Tanggal',
      type: 'date',
      placeholder: 'dd/mm/yyyy'
    }
  );

  return schema;
});

// --- Table Columns ---
const tableColumns = [
  { key: 'no',           label: 'No',             width: '60px' },
  { key: 'ticketNumber', label: 'Kode Maintenance' },
  { key: 'date',         label: 'Tanggal' },
  { key: 'eventItem',    label: 'Item Kejadian' },
  { key: 'location',     label: 'Lokasi' },
  { key: 'progress',     label: 'Progres' },
  { key: 'status',       label: 'Status' },
  { key: 'payment',      label: 'Pembayaran' },
  { key: 'action',       label: 'Aksi',            width: '90px' }
];

// --- Actions ---
const handleCreate = () => {
  selectedMaintenanceId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedMaintenanceId.value = id;
  showFormModal.value = true;
};

const handleSaved = () => {
  fetchData(maintenanceStore.pagination.currentPage || 1, true);
};

const handleDelete = async (item) => {
  const confirmed = await Alert.confirmDelete(
    `Hapus draft tiket "${item.ticketNumber || item.eventItem}"?`,
    'Data tiket maintenance draft yang dihapus tidak dapat dipulihkan kembali.'
  );
  if (confirmed) {
    try {
      await maintenanceStore.deleteTicket(item.id);
      Alert.toast('Draft maintenance berhasil dihapus', 'success');
      fetchData(maintenanceStore.pagination.currentPage || 1, true);
    } catch (err) {
      Alert.error('Gagal Menghapus', err.response?.data?.message || err.message || 'Terjadi kesalahan');
    }
  }
};

const handleExportCSV = async () => {
  const confirmed = await Alert.confirmExport(
    'Export Data Maintenance?',
    'Sistem akan mengunduh laporan data tiket maintenance ke perangkat Anda.'
  );
  if (confirmed) {
    try {
      await handleExport();
      Alert.toast('Berhasil export data maintenance', 'success');
    } catch (error) {
      Alert.toast('Gagal export data maintenance', error.message || 'Terjadi kesalahan', 'error');
    }
  }
};

// --- Helpers ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(dateString));
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(amount);
};

const getStatusColor = (status) => {
  const map = { draft: 'light', open: 'info', hold: 'warning', done: 'success' };
  return map[status?.toLowerCase()] || 'primary';
};

const stageMap = {
  request:   { label: 'Pengajuan',  pct: 20, segs: 1 },
  screening: { label: 'Screening',  pct: 40, segs: 2 },
  payment:   { label: 'Pembayaran', pct: 60, segs: 4 },
  work:      { label: 'Pengerjaan', pct: 80, segs: 6 },
  done:      { label: 'Selesai',    pct: 100, segs: 7 }
};

const getStageName      = (stage) => stageMap[stage?.toLowerCase()]?.label || '-';
const getProgressValue  = (stage) => stageMap[stage?.toLowerCase()]?.pct   || 0;
const getSegmentsFilled = (stage) => stageMap[stage?.toLowerCase()]?.segs  || 0;
</script>

<style scoped>
/* Glossy table progress segments */
.glossy-table-segment-active {
  background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 25.107 6' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.5'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-1.8521e-14 0.60422 -2.5284 3.6998e-17 12.554 -0.042236)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(255,255,255,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, rgb(104, 125, 234) 0%, rgb(104, 125, 234) 100%);
}
.glossy-table-segment-inactive {
  background-color: rgba(0, 0, 0, 0.1);
}
:root.dark .glossy-table-segment-inactive,
.dark .glossy-table-segment-inactive {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>

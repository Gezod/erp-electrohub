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
            placeholder="Cari perihal atau PIC..."
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

          <!-- Tambah Jadwal (Glossy Black) -->
          <GlossyButton
            v-can="'schedules:create'"
            @click="handleCreate"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah Jadwal</span>
          </GlossyButton>
        </div>
      </div>

      <!-- ── Filters Modal ────────────────────────────────────── -->
      <FilterModal
        v-model="showFilter"
        title="Filter Jadwal"
        :schema="filterSchema"
        :model="filters"
        :has-active-filters="hasActiveFilters"
        @apply="showFilter = false"
        @reset="resetFilters"
      />

      <!-- ── Data Table ───────────────────────────────────────── -->
      <DataTable
        :columns="tableColumns"
        :data="scheduleStore.schedules"
        :loading="scheduleStore.isLoading"
        :server-side="true"
        :total-items="scheduleStore.pagination.totalData"
        :current-page="scheduleStore.pagination.currentPage"
        :items-per-page="scheduleStore.pagination.dataPerPage"
        permission-prefix="schedules"
        title="Daftar Jadwal"
        subtitle="Agenda & Penjadwalan Aktivitas • Transaksi"
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
          {{ ((Math.max(1, Number(scheduleStore.pagination?.currentPage || scheduleStore.pagination?.page || 1)) - 1) * Number(scheduleStore.pagination?.dataPerPage || scheduleStore.pagination?.limit || 10)) + index + 1 }}
        </template>

        <!-- Tanggal & Jam -->
        <template #cell-dateSchedule="{ item }">
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-1.5 text-sm text-text-active font-semibold">
              <Calendar class="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span v-if="item.endDateSchedule && item.endDateSchedule !== item.dateSchedule">
                {{ formatDate(item.dateSchedule) }} s/d {{ formatDate(item.endDateSchedule) }}
              </span>
              <span v-else>
                {{ formatDate(item.dateSchedule) }}
              </span>
            </div>
            <div v-if="item.timeSchedule || item.endTimeSchedule" class="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 font-mono pl-5">
              <Clock class="w-3 h-3 text-brand-500 shrink-0" />
              <span v-if="item.timeSchedule && item.endTimeSchedule">
                {{ item.timeSchedule }} - {{ item.endTimeSchedule }} WIB
              </span>
              <span v-else-if="item.timeSchedule">
                {{ item.timeSchedule }} WIB
              </span>
              <span v-else>
                s/d {{ item.endTimeSchedule }} WIB
              </span>
            </div>
          </div>
        </template>

        <!-- Perihal -->
        <template #cell-perihal="{ item }">
          <div class="flex flex-col gap-0.5 items-start">
            <span :class="getPerihalBadgeClass(item.perihal)">
              {{ getPerihalLabel(item.perihal) }}
            </span>
            <span v-if="item.perihal === 'other' && item.otherPerihalDetail" class="text-xs text-text-muted font-medium italic mt-0.5">
              {{ item.otherPerihalDetail }}
            </span>
          </div>
        </template>

        <!-- Lokasi -->
        <template #cell-locationName="{ item }">
          <span class="text-sm text-text-active font-medium">{{ item.locationName || '-' }}</span>
        </template>

        <!-- Kode Maintenance -->
        <template #cell-kodeMaintenance="{ item }">
          <span v-if="!item.kodeMaintenance || item.kodeMaintenance === '-'" class="text-xs text-text-muted">
            Tidak ada kaitan
          </span>
          <span v-else class="text-xs text-brand-600 dark:text-brand-400 font-bold font-mono">
            {{ item.kodeMaintenance }}
          </span>
        </template>

        <!-- PIC Eksternal -->
        <template #cell-picExternal="{ item }">
          <span class="text-sm text-text-active font-medium">{{ item.picExternal || '-' }}</span>
        </template>

        <!-- Status -->
        <template #cell-status="{ item }">
          <span :class="getStatusBadgeClass(item.status)">
            {{ getStatusLabel(item.status) }}
          </span>
        </template>
      </DataTable>

      <!-- ── Schedule Form Modal Dialog ──────────────────────── -->
      <ScheduleFormModal
        v-model="showFormModal"
        :schedule-id="selectedScheduleId"
        @saved="handleSaved"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import ScheduleFormModal from './components/ScheduleFormModal.vue';
import { useSchedule } from './composables/useSchedule';
import { FilterIcon } from '@/icons';
import { Search, Plus, Download, Clock, Calendar } from 'lucide-vue-next';
import { Alert } from '@/plugins/sweetalert';

const { filters, scheduleStore, fetchData, handlePageChange, resetFilters, handleExport } = useSchedule();

// --- Modal States ---
const showFormModal = ref(false);
const selectedScheduleId = ref(null);
const showFilter = ref(false);

const hasActiveFilters = computed(() => {
  return !!(filters.status || filters.search);
});

// --- Status Tabs ---
const statusTabs = [
  { key: '', label: 'Semua' },
  { key: 'draft', label: 'Draft', badge: true },
  { key: 'need_reminder', label: 'Need Reminder' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'pending', label: 'Pending' },
  { key: 'done', label: 'Done' }
];

const tabBadgeCount = (statusKey) => {
  if (statusKey === 'draft') {
    return (scheduleStore.schedules || []).filter(
      (s) => s.status?.toLowerCase() === 'draft'
    ).length;
  }
  return 0;
};

const handleStatusTabClick = (statusKey) => {
  filters.status = statusKey;
};

// --- Filter Modal Schema ---
const filterSchema = [
  {
    label: 'Kata Kunci',
    key: 'search',
    type: 'text',
    placeholder: 'Cari perihal atau PIC...'
  },
  {
    label: 'Pilih Status',
    key: 'status',
    type: 'select',
    placeholder: 'Semua Status',
    options: [
      { label: 'Semua Status', value: '' },
      { label: 'Draft', value: 'draft' },
      { label: 'Need Reminder', value: 'need_reminder' },
      { label: 'Scheduled (Terjadwal)', value: 'scheduled' },
      { label: 'Pending', value: 'pending' },
      { label: 'Done', value: 'done' }
    ]
  }
];

// --- Table Columns ---
const tableColumns = [
  { key: 'no',              label: 'No',              width: '60px' },
  { key: 'dateSchedule',    label: 'Tanggal & Jam' },
  { key: 'perihal',         label: 'Perihal' },
  { key: 'locationName',    label: 'Lokasi' },
  { key: 'kodeMaintenance', label: 'Kaitan Tiket' },
  { key: 'picExternal',     label: 'PIC Eksternal' },
  { key: 'status',          label: 'Status' },
  { key: 'action',          label: 'Aksi',            width: '90px' }
];

// --- Actions ---
const handleCreate = () => {
  selectedScheduleId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedScheduleId.value = id;
  showFormModal.value = true;
};

const handleSaved = () => {
  fetchData(scheduleStore.pagination.currentPage || 1, true);
};

const handleDelete = async (item) => {
  const isConfirmed = await Alert.confirmDelete(
    `Hapus Jadwal?`,
    `Data jadwal untuk "${item.perihal || 'item'}" akan dihapus secara permanen.`
  );
  if (isConfirmed) {
    try {
      await scheduleStore.deleteSchedule(item.id);
      Alert.toast('Jadwal telah dihapus', 'success');
      fetchData(scheduleStore.pagination.currentPage || 1, true);
    } catch (err) {
      Alert.error('Gagal', err.response?.data?.message || 'Gagal menghapus jadwal');
    }
  }
};

const handleExportCSV = async () => {
  const confirmed = await Alert.confirmExport(
    'Export Data Jadwal?',
    'Sistem akan mengunduh data jadwal ke perangkat Anda.'
  );
  if (confirmed) {
    try {
      await handleExport();
      Alert.toast('Berhasil export data jadwal', 'success');
    } catch (error) {
      Alert.toast('Gagal export data jadwal', error.message || 'Terjadi kesalahan', 'error');
    }
  }
};

// --- Helpers ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  } catch (e) {
    return dateString;
  }
};

const perihalMap = {
  driver: 'Driver (Dalam Kota)',
  driver_luar_kota: 'Driver Luar Kota',
  driver_sog: 'Driver SOG',
  cctv_installation: 'Maintenance CCTV',
  set_cctv: 'Pemasangan CCTV',
  other: 'Lainnya'
};

const getPerihalLabel = (perihal) => {
  return perihalMap[perihal?.toLowerCase()] || perihal?.replace(/_/g, ' ') || 'Lainnya';
};

const getPerihalBadgeClass = (perihal) => {
  const normalized = perihal?.toLowerCase() || '';
  if (normalized === 'driver') {
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300';
  }
  if (normalized === 'driver_luar_kota') {
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300';
  }
  if (normalized === 'driver_sog') {
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300';
  }
  if (normalized === 'cctv_installation') {
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300';
  }
  if (normalized === 'set_cctv') {
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300';
  }
  return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-border dark:bg-gray-800 dark:text-gray-300';
};

const statusMap = {
  draft: 'Draft',
  need_reminder: 'Butuh Diingatkan',
  scheduled: 'Scheduled',
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Selesai',
  completed: 'Selesai'
};

const getStatusLabel = (status) => {
  return statusMap[status?.toLowerCase()] || status?.replace(/_/g, ' ') || '-';
};

const getStatusBadgeClass = (status) => {
  const normalized = status?.toLowerCase() || '';
  if (normalized === 'draft') {
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-border dark:bg-gray-800 dark:text-gray-300';
  }
  if (normalized === 'need_reminder') {
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300';
  }
  if (normalized === 'scheduled') {
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300';
  }
  if (normalized === 'pending') {
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300';
  }
  if (normalized === 'in_progress') {
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300';
  }
  if (normalized === 'done' || normalized === 'completed') {
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300';
  }
  return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-border dark:bg-gray-800 dark:text-gray-300';
};
</script>

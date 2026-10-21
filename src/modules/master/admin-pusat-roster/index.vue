<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">

      <!-- ── Controls Bar ──────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full select-none">
        <!-- Left: Quick Info -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-text-muted">
            Kurasi manual pemegang stok resmi Pusat & office-nya
          </span>
        </div>

        <!-- Right: Actions Group -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Active filter indicator -->
          <span v-if="hasActiveFilters" class="text-xs text-brand-500 font-medium flex items-center gap-1 mr-1 select-none">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block"></span>
            Filter aktif
          </span>

          <!-- Tambah Anggota Roster (Glossy Black) -->
          <GlossyButton
            v-can="'marketing-admin-pusat-roster:create'"
            @click="handleCreate"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah Anggota Roster</span>
          </GlossyButton>
        </div>
      </div>

      <!-- ── Filters Modal ────────────────────────────────────── -->
      <FilterModal
        v-model="showFilter"
        title="Filter Roster Admin Pusat"
        :schema="filterSchema"
        :model="filters"
        :has-active-filters="hasActiveFilters"
        @apply="showFilter = false"
        @reset="resetFilters"
      />

      <!-- ── Data Table ───────────────────────────────────────── -->
      <DataTable
        :columns="tableColumns"
        :data="store.members"
        :loading="store.isLoading"
        :server-side="true"
        :total-items="store.pagination.totalData"
        :current-page="store.pagination.currentPage"
        :items-per-page="store.pagination.dataPerPage"
        permission-prefix="marketing-admin-pusat-roster"
        title="Roster Admin Pusat"
        subtitle="Pemegang Stok Resmi Pusat ↔ Office • Master Data"
        :can-edit="(item) => item.status === 'aktif'"
        :can-delete="(item) => item.status === 'aktif'"
        delete-title="Nonaktifkan"
        @edit="(item) => handleEdit(item.id)"
        @delete="handleUnassign"
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
          {{ ((Math.max(1, Number(store.pagination?.currentPage || store.pagination?.page || 1)) - 1) * Number(store.pagination?.dataPerPage || store.pagination?.limit || 10)) + index + 1 }}
        </template>

        <!-- Employee / Admin Pusat -->
        <template #cell-employee="{ item }">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border border-border flex items-center justify-center text-xs font-bold text-text-active uppercase shrink-0">
              {{ item.employeeInitials || item.employee?.full_name?.charAt(0) || '?' }}
            </div>
            <div class="flex flex-col items-start leading-tight">
              <span class="text-sm font-semibold text-text-active">
                {{ item.employeeName || item.employee?.full_name || '-' }}
              </span>
              <span class="text-[11px] text-text-muted font-normal">
                {{ item.employeePosition || item.employee?.position?.name || 'Karyawan' }}
              </span>
            </div>
          </div>
        </template>

        <!-- Office -->
        <template #cell-office="{ item }">
          <div class="flex flex-col items-start leading-tight">
            <span class="text-sm font-semibold text-text-active">
              {{ item.officeName || item.office_location?.location_name || '-' }}
            </span>
            <span v-if="item.officeDistrict || item.office_location?.location_district" class="text-[11px] text-text-muted font-normal">
              {{ item.officeDistrict || item.office_location?.location_district }}
            </span>
          </div>
        </template>

        <!-- Tanggal Assign -->
        <template #cell-assigned_at="{ item }">
          <div class="flex flex-col items-start leading-tight">
            <span class="text-sm font-medium text-text-active">
              {{ formatDate(item.assignedAt || item.assigned_at) }}
            </span>
            <span v-if="item.status === 'nonaktif' && (item.unassignedAt || item.unassigned_at)" class="text-[10px] text-text-muted italic">
              Nonaktif: {{ formatDate(item.unassignedAt || item.unassigned_at) }}
            </span>
          </div>
        </template>

        <!-- Status -->
        <template #cell-status="{ item }">
          <Badge
            :color="item.status === 'aktif' ? 'success' : 'light'"
            variant="light"
            class="text-[11px] font-bold uppercase tracking-wider"
          >
            {{ item.status }}
          </Badge>
        </template>
      </DataTable>

      <!-- ── Admin Pusat Roster Form Modal Dialog ──────────────── -->
      <AdminPusatRosterFormModal
        v-model="showFormModal"
        :member-id="selectedMemberId"
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
import Badge from '@/components/ui/Badge.vue';
import AdminPusatRosterFormModal from './components/AdminPusatRosterFormModal.vue';
import { useAdminPusatRoster } from './composables/useAdminPusatRoster';
import { FilterIcon } from '@/icons';
import { Plus } from 'lucide-vue-next';
import { Alert } from '@/plugins/sweetalert';
import { getApiErrorMessage } from '@/utils/apiError';

const {
  filters,
  store,
  fetchData,
  handlePageChange,
  resetFilters
} = useAdminPusatRoster();

// --- Modal States ---
const showFormModal = ref(false);
const selectedMemberId = ref(null);
const showFilter = ref(false);

const hasActiveFilters = computed(() => {
  return !!(filters.status !== 'aktif' || filters.employeeId || filters.officeLocationId);
});

// --- Status Tabs ---
const statusTabs = [
  { key: 'aktif', label: 'Aktif' },
  { key: 'nonaktif', label: 'Nonaktif' },
  { key: '', label: 'Semua' }
];

const handleStatusTabClick = (statusKey) => {
  filters.status = statusKey;
};

// --- Filter Modal Schema ---
const filterSchema = computed(() => [
  {
    label: 'Status Anggota',
    key: 'status',
    type: 'select',
    placeholder: 'Semua Status',
    options: [
      { label: 'Semua Status', value: '' },
      { label: 'Aktif', value: 'aktif' },
      { label: 'Nonaktif', value: 'nonaktif' }
    ]
  },
  {
    label: 'Filter Karyawan',
    key: 'employeeId',
    type: 'searchable-select',
    master: 'employees',
    placeholder: 'Semua Karyawan'
  },
  {
    label: 'Filter Office',
    key: 'officeLocationId',
    type: 'searchable-select',
    master: 'locations',
    filters: { location_type: 'office' },
    placeholder: 'Semua Office'
  }
]);

// --- Table Columns ---
const tableColumns = [
  { key: 'no',          label: 'No',                              width: '60px' },
  { key: 'employee',    label: 'Admin Pusat' },
  { key: 'office',      label: 'Office' },
  { key: 'assigned_at', label: 'Tgl Assign' },
  { key: 'status',      label: 'Status' },
  { key: 'action',      label: 'Aksi',                            width: '90px' }
];

onMounted(() => {
  fetchData();
});

// --- Actions ---
const handleCreate = () => {
  selectedMemberId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedMemberId.value = id;
  showFormModal.value = true;
};

const handleSaved = () => {
  fetchData(store.pagination.currentPage || 1, true);
};

const handleUnassign = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const officeName = typeof itemOrId === 'object' && itemOrId !== null ? (itemOrId.officeName || itemOrId.office_location?.location_name || '') : '';

  const confirmed = await Alert.confirm(
    'Nonaktifkan Anggota Roster?',
    `Karyawan ini tidak akan lagi menjadi kandidat processor Admin Pusat untuk office ${officeName ? `"${officeName}"` : ''}.`
  );

  if (confirmed) {
    try {
      await store.unassign(id);
      Alert.toast('Anggota roster berhasil dinonaktifkan', 'success');
      fetchData(store.pagination.currentPage || 1, true);
    } catch (error) {
      Alert.error('Gagal', getApiErrorMessage(error));
    }
  }
};

const formatDate = (d) => {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return d;
  }
};
</script>

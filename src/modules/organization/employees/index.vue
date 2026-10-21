<template>
  <AdminLayout>
    <div class="mx-auto max-w-(--breakpoint-2xl) space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20"
          >
            <Users class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">
              Manajemen Karyawan
            </h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">
              Kelola Akun & Informasi Personal Pegawai &bull; ERP
            </p>
          </div>
        </div>
      </div>

      <!-- Controls Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-[16px] select-none">
        <!-- Left Side: Search Bar & Filter Button -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-[8px] flex-1 w-full">
          <div class="relative w-full sm:w-[350px] sm:max-w-full shrink-0 group">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] group-focus-within:text-brand-500 transition-colors pointer-events-none" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Cari berdasarkan Nama atau NIK..."
              class="w-full pl-[36px] pr-4 bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-gray-800 rounded-[6px] outline-none text-[13px] font-sans text-black dark:text-white placeholder:text-[#999] focus:border-brand-500 transition-all h-[40px]"
            />
          </div>
        </div>

        <!-- Right Side: Button Group -->
        <div class="flex flex-wrap items-center gap-[8px] w-full lg:w-auto shrink-0">
          <GlossyButton
            v-can="'organization:create'"
            @click="openCreateModal"
          >
            <Plus class="w-[20px] h-[20px] text-white relative z-10" />
            <span class="relative z-10 text-[13px] font-semibold whitespace-nowrap">Tambah Karyawan</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Filter Modal -->
      <FilterModal
        v-model="showFilter"
        title="Filter Karyawan"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        :is-dirty="isModalDirty"
        @apply="applyFiltersFromModal"
        @reset="handleResetFilters"
      />

      <!-- Data Table -->
      <DataTable
        title="Daftar Karyawan"
        subtitle="Data Personalia dan Penempatan Struktur Organisasi"
        :columns="tableColumns"
        :data="employeeStore.employees"
        :loading="employeeStore.isLoading"
        :server-side="true"
        :total-items="employeeStore.pagination.totalData"
        :current-page="employeeStore.pagination.currentPage"
        :items-per-page="employeeStore.pagination.dataPerPage"
        @update:current-page="handlePageChange"
      >
        <template #header-actions>
          <button
            @click="showFilter = true"
            class="bg-white dark:bg-gray-900 border border-solid border-[#e8e8e8] dark:border-gray-800 text-black dark:text-white rounded-[6px] px-[14px] py-[8px] flex items-center gap-[6px] font-sans font-medium text-[14px] sm:text-[16px] h-[40px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 duration-200"
          >
            <FilterIcon class="w-[20px] h-[20px] text-black dark:text-white" />
            <span>Filter</span>
          </button>
        </template>

        <!-- No. Cell -->
        <template #cell-no="{ index }">
          <span class="font-mono text-xs font-semibold text-text-muted">
            {{ ((Math.max(1, Number(employeeStore.pagination?.currentPage || employeeStore.pagination?.page || 1)) - 1) * Number(employeeStore.pagination?.dataPerPage || employeeStore.pagination?.limit || 10)) + index + 1 }}
          </span>
        </template>

        <!-- Full Name & Details Cell -->
        <template #cell-fullName="{ item }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-bg-2 border border-border flex items-center justify-center overflow-hidden text-text-muted shrink-0">
              <img v-if="item.photoUrl" :src="item.photoUrl" class="w-full h-full object-cover" />
              <User v-else class="w-4 h-4" />
            </div>
            <div class="flex flex-col min-w-0">
              <router-link
                :to="{ name: 'EmployeeDetail', params: { id: item.id } }"
                class="font-bold text-gray-800 dark:text-white hover:text-brand-500 transition-colors truncate"
              >
                {{ item.fullName }}
              </router-link>
              <div class="flex items-center gap-1.5 text-[11px] text-text-muted font-mono">
                <span>{{ item.employeeNumber || item.nik || '-' }}</span>
                <span>&bull;</span>
                <span class="font-sans text-brand-600 dark:text-brand-400 font-medium">
                  {{ item.isChief ? 'Chief Executive' : (item.positionName || '-') }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Email Cell -->
        <template #cell-email="{ item }">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
              {{ item.email || '-' }}
            </span>
            <span v-if="item.employeeEmail && item.employeeEmail !== item.email" class="text-[11px] text-text-muted">
              {{ item.employeeEmail }}
            </span>
          </div>
        </template>

        <!-- Placement Cell -->
        <template #cell-placement="{ item }">
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {{ item.isChief ? 'Direktorat Utama' : (item.divisionName || '-') }}
            </span>
            <span class="text-[11px] text-text-muted">
              {{ item.locationName || '-' }}
            </span>
          </div>
        </template>

        <!-- Status Cell -->
        <template #cell-status="{ item }">
          <span
            :class="statusClass(item.status)"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            {{ item.status }}
          </span>
        </template>

        <!-- Action Cell -->
        <template #cell-action="{ item }">
          <div class="relative flex items-center justify-end pr-2 gap-2">
            <button
              v-can="'organization:read'"
              @click="router.push({ name: 'EmployeeDetail', params: { id: item.id } })"
              class="w-[28px] h-[28px] flex items-center justify-center bg-[#e8e8e8]/70 dark:bg-gray-700 rounded-full text-[#444] dark:text-gray-300 hover:bg-[#d8d8d8] dark:hover:bg-gray-600 transition-all cursor-pointer"
              title="Lihat Detail Profil"
            >
              <Eye class="w-[14px] h-[14px]" />
            </button>
            <button
              v-can="'organization:update'"
              @click="openEditModal(item.id)"
              class="w-[28px] h-[28px] flex items-center justify-center bg-[#e8e8e8]/70 dark:bg-gray-700 rounded-full text-[#444] dark:text-gray-300 hover:bg-[#d8d8d8] dark:hover:bg-gray-600 transition-all cursor-pointer"
              title="Edit Data Karyawan"
            >
              <Pencil class="w-[14px] h-[14px]" />
            </button>
            <button
              v-can="'organization:delete'"
              @click="handleDelete(item.id)"
              class="w-[28px] h-[28px] flex items-center justify-center bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 rounded-full transition-all cursor-pointer"
              title="Hapus Karyawan"
            >
              <Trash2 class="w-[14px] h-[14px]" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Form Modal (Create / Edit) -->
      <EmployeeFormModal
        v-model="showFormModal"
        :employee-id="selectedEmployeeId"
        @saved="onModalSaved"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import EmployeeFormModal from './components/EmployeeFormModal.vue';
import { useEmployee } from './composables/useEmployee';
import { DivisionService } from '@/modules/organization/divisions/division.service';
import { LocationService } from '@/modules/master/locations/location.service';
import { Alert } from '@/plugins/sweetalert';
import { FilterIcon } from '@/icons';
import { Search, Plus, Eye, Pencil, Trash2, Users, User } from 'lucide-vue-next';

const router = useRouter();
const { filters, employeeStore, fetchEmployees, handlePageChange, resetFilters } = useEmployee();

const showFilter = ref(false);
const showFormModal = ref(false);
const selectedEmployeeId = ref(null);

const divisionsList = ref([]);
const locationsList = ref([]);

const localFilters = reactive({
  search: '',
  status: '',
  division_id: '',
  location_id: '',
});

const filterSchema = computed(() => [
  {
    label: 'Cari Karyawan',
    key: 'search',
    type: 'text',
    placeholder: 'Cari nama atau NIK...',
  },
  {
    label: 'Status Kepegawaian',
    key: 'status',
    type: 'select',
    placeholder: 'Semua Status',
    options: [
      { label: 'Semua Status', value: '' },
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Resigned', value: 'resigned' },
      { label: 'Terminated', value: 'terminated' },
    ],
  },
  {
    label: 'Divisi',
    key: 'division_id',
    type: 'select',
    searchable: true,
    placeholder: 'Semua Divisi',
    options: [
      { label: 'Semua Divisi', value: '' },
      ...divisionsList.value.map((d) => ({
        label: d.name,
        value: d.id,
      })),
    ],
  },
  {
    label: 'Lokasi Penempatan',
    key: 'location_id',
    type: 'select',
    searchable: true,
    placeholder: 'Semua Lokasi',
    options: [
      { label: 'Semua Lokasi', value: '' },
      ...locationsList.value.map((l) => ({
        label: l.location_name || l.name,
        value: l.id,
      })),
    ],
  },
]);

watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.search = filters.search;
    localFilters.status = filters.status;
    localFilters.division_id = filters.division_id;
    localFilters.location_id = filters.location_id;
  }
});

const hasActiveFilters = computed(() => {
  return !!(filters.search || filters.status || filters.division_id || filters.location_id);
});

const isModalDirty = computed(() => {
  return (
    localFilters.search !== filters.search ||
    localFilters.status !== filters.status ||
    localFilters.division_id !== filters.division_id ||
    localFilters.location_id !== filters.location_id
  );
});

const applyFiltersFromModal = () => {
  filters.search = localFilters.search;
  filters.status = localFilters.status;
  filters.division_id = localFilters.division_id;
  filters.location_id = localFilters.location_id;
  showFilter.value = false;
};

const handleResetFilters = () => {
  resetFilters();
  localFilters.search = '';
  localFilters.status = '';
  localFilters.division_id = '';
  localFilters.location_id = '';
  showFilter.value = false;
};

const tableColumns = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'fullName', label: 'Karyawan & Jabatan' },
  { key: 'email', label: 'Email' },
  { key: 'placement', label: 'Penempatan' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'action', label: '', align: 'right' },
];

const openCreateModal = () => {
  selectedEmployeeId.value = null;
  showFormModal.value = true;
};

const openEditModal = (id) => {
  selectedEmployeeId.value = id;
  showFormModal.value = true;
};

const onModalSaved = () => {
  fetchEmployees(employeeStore.pagination.currentPage || 1);
};

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm(
    'Hapus Data Karyawan?',
    'Segala data terkait akun dan profil karyawan akan dihapus secara permanen.'
  );

  if (confirmed) {
    try {
      await employeeStore.deleteEmployee(id);
      Alert.toast('Data karyawan berhasil dihapus.', 'success');
      await fetchEmployees(employeeStore.pagination.currentPage || 1);
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.';
      Alert.error('Gagal!', msg);
    }
  }
};

const statusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-400';
    case 'inactive':
      return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-400';
    case 'resigned':
      return 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20 dark:bg-slate-950/20 dark:text-slate-400';
    case 'terminated':
      return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/20 dark:text-rose-400';
    default:
      return 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20 dark:bg-gray-950/20 dark:text-gray-400';
  }
};

onMounted(async () => {
  try {
    const [divRes, locRes] = await Promise.all([
      DivisionService.getAll({ limit: 500, is_active: true }),
      LocationService.getAll({ limit: 500 }),
    ]);
    divisionsList.value = divRes.data || [];
    locationsList.value = locRes.data || [];
  } catch (err) {
    console.error('Failed to load filter dependencies', err);
  }
  fetchEmployees(1);
});
</script>

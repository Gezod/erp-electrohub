<template>
  <AdminLayout>
    <div class="mx-auto max-w-(--breakpoint-2xl) space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20"
          >
            <Network class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">
              Daftar Divisi
            </h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">
              Struktur Organisasi & Tata Kelola &bull; ERP
            </p>
          </div>
        </div>
      </div>

      <!-- Controls Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-[16px] select-none">
        <!-- Left Side: Search Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-[8px] flex-1 w-full">
          <div class="relative w-full sm:w-[350px] sm:max-w-full shrink-0 group">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] group-focus-within:text-brand-500 transition-colors pointer-events-none" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Cari nama divisi atau deskripsi..."
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
            <span class="relative z-10 text-[13px] font-semibold whitespace-nowrap">Tambah Divisi</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Filter Modal -->
      <FilterModal
        v-model="showFilter"
        title="Filter Divisi"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        :is-dirty="isModalDirty"
        @apply="applyFiltersFromModal"
        @reset="handleResetFilters"
      />

      <!-- DataTable -->
      <DataTable
        title="Struktur Divisi"
        subtitle="Daftar Divisi dan Penanggung Jawab"
        :columns="tableColumns"
        :data="divisionStore.divisions"
        :loading="divisionStore.isLoading"
        :server-side="true"
        :total-items="divisionStore.pagination.totalData"
        :current-page="divisionStore.pagination.currentPage"
        :items-per-page="divisionStore.pagination.dataPerPage"
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
            {{ ((Math.max(1, Number(divisionStore.pagination?.currentPage || divisionStore.pagination?.page || 1)) - 1) * Number(divisionStore.pagination?.dataPerPage || divisionStore.pagination?.limit || 10)) + index + 1 }}
          </span>
        </template>

        <!-- Name Cell -->
        <template #cell-name="{ item }">
          <span class="font-bold text-gray-800 dark:text-white">
            {{ item.name }}
          </span>
        </template>

        <!-- Description Cell -->
        <template #cell-description="{ item }">
          <p class="text-[13px] text-gray-600 dark:text-gray-300 font-normal leading-relaxed whitespace-normal break-words">
            {{ item.description || '-' }}
          </p>
        </template>

        <!-- Chief Cell -->
        <template #cell-chief_name="{ item }">
          <span class="font-medium text-gray-800 dark:text-gray-200">
            {{ item.chief_name }}
          </span>
        </template>

        <!-- Employee Count Cell -->
        <template #cell-employee_count="{ item }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/20 dark:text-blue-400">
            {{ item.employee_count }} Pegawai
          </span>
        </template>

        <!-- Action Cell -->
        <template #cell-action="{ item }">
          <div class="relative flex items-center justify-end pr-2 gap-2">
            <button
              v-can="'organization:update'"
              @click="openEditModal(item.id)"
              class="w-[28px] h-[28px] flex items-center justify-center bg-[#e8e8e8]/70 dark:bg-gray-700 rounded-full text-[#444] dark:text-gray-300 hover:bg-[#d8d8d8] dark:hover:bg-gray-600 transition-all cursor-pointer"
              title="Edit Divisi"
            >
              <Pencil class="w-[14px] h-[14px]" />
            </button>
            <button
              v-can="'organization:delete'"
              @click="handleDelete(item.id)"
              class="w-[28px] h-[28px] flex items-center justify-center bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 rounded-full transition-all cursor-pointer"
              title="Hapus Divisi"
            >
              <Trash2 class="w-[14px] h-[14px]" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Form Modal (Create / Edit) -->
      <DivisionFormModal
        v-model="showFormModal"
        :division-id="selectedDivisionId"
        @saved="onModalSaved"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import DivisionFormModal from './components/DivisionFormModal.vue';
import { useDivision } from './composables/useDivision';
import { useChiefStore } from '@/modules/organization/chiefs/chief.store';
import { Alert } from '@/plugins/sweetalert';
import { FilterIcon } from '@/icons';
import { Search, Plus, Pencil, Trash2, Network } from 'lucide-vue-next';

const { filters, divisionStore, fetchDivisions, handlePageChange, resetFilters } = useDivision();
const chiefStore = useChiefStore();

const showFilter = ref(false);
const showFormModal = ref(false);
const selectedDivisionId = ref(null);

const localFilters = reactive({
  search: '',
  chief_id: '',
});

const filterSchema = computed(() => [
  {
    label: 'Cari Divisi',
    key: 'search',
    type: 'text',
    placeholder: 'Cari nama atau deskripsi...',
  },
  {
    label: 'Kepala Divisi (Chief)',
    key: 'chief_id',
    type: 'select',
    searchable: true,
    placeholder: 'Semua Pimpinan',
    options: [
      { label: 'Semua Pimpinan', value: '' },
      ...chiefStore.chiefs.map((c) => ({
        label: `${c.employee_name || c.title || '-'} (${c.title || 'Chief'})`,
        value: c.id,
      })),
    ],
  },
]);

watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.search = filters.search;
    localFilters.chief_id = filters.chief_id;
  }
});

const hasActiveFilters = computed(() => {
  return !!(filters.search || filters.chief_id);
});

const isModalDirty = computed(() => {
  return (
    localFilters.search !== filters.search ||
    localFilters.chief_id !== filters.chief_id
  );
});

const applyFiltersFromModal = () => {
  filters.search = localFilters.search;
  filters.chief_id = localFilters.chief_id;
  showFilter.value = false;
};

const handleResetFilters = () => {
  resetFilters();
  localFilters.search = '';
  localFilters.chief_id = '';
  showFilter.value = false;
};

const tableColumns = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'name', label: 'Nama Divisi' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'chief_name', label: 'Chief' },
  { key: 'employee_count', label: 'Total Pegawai' },
  { key: 'action', label: '', align: 'right' },
];

const openCreateModal = () => {
  selectedDivisionId.value = null;
  showFormModal.value = true;
};

const openEditModal = (id) => {
  selectedDivisionId.value = id;
  showFormModal.value = true;
};

const onModalSaved = () => {
  fetchDivisions(divisionStore.pagination.currentPage || 1);
};

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm(
    'Hapus Divisi?',
    'Apakah Anda yakin ingin menghapus data divisi ini secara permanen?'
  );

  if (confirmed) {
    try {
      await divisionStore.deleteDivision(id);
      Alert.toast('Data divisi berhasil dihapus.', 'success');
      await fetchDivisions(divisionStore.pagination.currentPage || 1);
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data divisi.';
      Alert.error('Gagal!', msg);
    }
  }
};

onMounted(async () => {
  chiefStore.fetchChiefs({ limit: 500, is_active: true });
  fetchDivisions(1);
});
</script>

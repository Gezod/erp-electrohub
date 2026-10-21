<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">
      <!-- Tabs & Actions Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Left Side: Tabs Switcher (Stok Bernilai vs Stok Return) -->
        <div
          class="flex flex-wrap items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-lg w-full sm:w-fit shrink-0"
        >
          <button
            @click="filters.isValued = 'valued'"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200 border shrink-0 cursor-pointer',
              filters.isValued === 'valued'
                ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
            ]"
          >
            <DollarSign class="w-4 h-4 shrink-0" />
            <span>Stok Bernilai</span>
          </button>
          <button
            @click="filters.isValued = 'return'"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200 border shrink-0 cursor-pointer',
              filters.isValued === 'return'
                ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
            ]"
          >
            <PackageX class="w-4 h-4 shrink-0" />
            <span>Stok Return</span>
          </button>
        </div>

        <!-- Right Side: Export, Export Mutasi, Tambah Stok Buttons -->
        <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <!-- Unified Export Dropdown Button -->
          <DropdownMenu
            buttonClass="bg-white dark:bg-gray-900 border border-border text-text-active rounded-md px-3.5 py-2 flex items-center justify-center gap-1.5 font-medium text-sm h-10 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 duration-200"
            menuClass="absolute right-0 z-50 mt-2 w-44 bg-white dark:bg-gray-950 border border-border rounded-md overflow-hidden"
          >
            <template #icon>
              <Download class="w-4 h-4 text-text-active" />
              <span class="hidden sm:inline">Export</span>
              <ChevronDown class="w-4 h-4 text-text-muted ml-0.5" />
            </template>
            <template #menu>
              <button
                @click="handleExportStock"
                class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-text-muted hover:text-text-active hover:bg-gray-50 dark:hover:bg-white/5 transition duration-150 cursor-pointer"
              >
                <span>Export Stok</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5 text-text-muted shrink-0"
                >
                  <path
                    d="M17.9422 6.06754L7.94217 16.0675C7.88412 16.1256 7.81519 16.1717 7.73932 16.2032C7.66345 16.2347 7.58212 16.2508 7.49998 16.2508C7.41785 16.2508 7.33652 16.2347 7.26064 16.2032C7.18477 16.1717 7.11584 16.1256 7.05779 16.0675L2.68279 11.6925C2.56552 11.5753 2.49963 11.4162 2.49963 11.2503C2.49963 11.0845 2.56552 10.9254 2.68279 10.8082C2.80007 10.6909 2.95913 10.625 3.12498 10.625C3.29083 10.625 3.44989 10.6909 3.56717 10.8082L7.49998 14.7418L17.0578 5.18316C17.1751 5.06588 17.3341 5 17.5 5C17.6658 5 17.8249 5.06588 17.9422 5.18316C18.0594 5.30044 18.1253 5.4595 18.1253 5.62535C18.1253 5.7912 18.0594 5.95026 17.9422 6.06754Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <div class="h-px bg-border w-full" />
              <button
                @click="handleExportMovements"
                class="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-text-muted hover:text-text-active hover:bg-gray-50 dark:hover:bg-white/5 transition duration-150 cursor-pointer"
              >
                <span>Export Mutasi</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5 text-text-muted shrink-0"
                >
                  <path
                    d="M17.9422 6.06754L7.94217 16.0675C7.88412 16.1256 7.81519 16.1717 7.73932 16.2032C7.66345 16.2347 7.58212 16.2508 7.49998 16.2508C7.41785 16.2508 7.33652 16.2347 7.26064 16.2032C7.18477 16.1717 7.11584 16.1256 7.05779 16.0675L2.68279 11.6925C2.56552 11.5753 2.49963 11.4162 2.49963 11.2503C2.49963 11.0845 2.56552 10.9254 2.68279 10.8082C2.80007 10.6909 2.95913 10.625 3.12498 10.625C3.29083 10.625 3.44989 10.6909 3.56717 10.8082L7.49998 14.7418L17.0578 5.18316C17.1751 5.06588 17.3341 5 17.5 5C17.6658 5 17.8249 5.06588 17.9422 5.18316C18.0594 5.30044 18.1253 5.4595 18.1253 5.62535C18.1253 5.7912 18.0594 5.95026 17.9422 6.06754Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </template>
          </DropdownMenu>

          <!-- Import Stok Button -->
          <ActionButton
            v-can="'stock:create'"
            @click="showImportModal = true"
          >
            <Upload class="w-4 h-4" />
            <span>Import Stok</span>
          </ActionButton>

          <!-- Tambah Stok Button -->
          <GlossyButton v-can="'stock:create'" @click="openCreateModal">
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah Stok</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Filters Modal -->
      <FilterModal
        v-model="showFilter"
        title="Filter Stok"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        @apply="applyFilters"
        @reset="handleReset"
      />

      <!-- Info Banner (Dynamic based on Valued / Return pool) -->
      <div
        :class="[
          'flex flex-col gap-1 px-4 py-3 border border-dashed rounded-xl w-fit max-w-lg shadow-xs transition-all duration-300',
          filters.isValued === 'valued'
            ? 'bg-blue-50/60 dark:bg-indigo-950/20 border-blue-200 dark:border-indigo-800/40'
            : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
        ]"
      >
        <div class="flex items-center gap-1.5">
          <component
            :is="filters.isValued === 'valued' ? DollarSign : PackageX"
            :class="[
              'w-4 h-4 shrink-0',
              filters.isValued === 'valued' ? 'text-blue-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'
            ]"
          />
          <p
            :class="[
              'text-xs font-semibold',
              filters.isValued === 'valued' ? 'text-blue-700 dark:text-indigo-400' : 'text-amber-700 dark:text-amber-400'
            ]"
          >
            {{ filters.isValued === 'valued' ? 'Stok Bernilai (Valued)' : 'Stok Return (Unvalued)' }}
          </p>
        </div>
        <p
          :class="[
            'text-xs leading-normal pl-5.5',
            filters.isValued === 'valued' ? 'text-blue-600/80 dark:text-indigo-300/80' : 'text-amber-700/80 dark:text-amber-300/80'
          ]"
        >
          {{
            filters.isValued === 'valued'
              ? 'Stok ini memiliki nilai buku. Harga satuan digunakan untuk kalkulasi weighted average.'
              : 'Stok ini tidak memiliki nilai buku atau bernilai Rp 0. Biasanya berasal dari barang reject/return.'
          }}
        </p>
      </div>

      <!-- Single Reusable DataTable (Eliminates duplication) -->
      <DataTable
        :columns="activeColumns"
        :data="stockStore.stocks"
        :loading="stockStore.isLoading"
        :server-side="true"
        :total-items="stockStore.pagination.totalData"
        :current-page="stockStore.pagination.currentPage"
        :items-per-page="stockStore.pagination.dataPerPage"
        permission-prefix="stock"
        :show-delete="false"
        :title="tableTitle"
        :subtitle="tableSubtitle"
        @edit="(item) => openEditModal(item.id)"
        @update:current-page="handlePageChange"
      >
        <template #header-actions>
          <button
            @click="showFilter = true"
            class="bg-white dark:bg-gray-900 border border-solid border-border dark:border-border text-text-active rounded-md px-3.5 py-2 flex items-center gap-1.5 font-medium text-sm h-10 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 duration-200"
          >
            <FilterIcon class="w-4 h-4 text-text-active" />
            <span>Filter</span>
            <span v-if="hasActiveFilters" class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
          </button>
        </template>

        <template #cell-no="{ index }">
          {{ ((Math.max(1, Number(stockStore.pagination?.currentPage || stockStore.pagination?.page || 1)) - 1) * Number(stockStore.pagination?.dataPerPage || stockStore.pagination?.limit || 10)) + index + 1 }}
        </template>

        <template #cell-goodName="{ item }">
          <div class="flex flex-col">
            <span class="font-medium text-text-active leading-tight">
              {{ item.goodName }}
              <span
                v-if="item.tipe === 'opening' || item.tipe === 'parfum'"
                class="ml-1.5 inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 text-[10px] font-semibold rounded-full uppercase tracking-wide align-middle"
              >
                {{ item.tipe === 'parfum' ? 'Parfum' : 'Opening' }}
              </span>
            </span>
            <span class="text-xs text-text-muted mt-0.5 uppercase tracking-wide">
              {{ item.goodCode }}
            </span>
          </div>
        </template>

        <!-- Mutasi Link Prepend -->
        <template #action-prepend="{ item }">
          <router-link
            v-can="'stock:read'"
            :to="{ name: 'StockDetail', params: { id: item.id } }"
            class="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-muted hover:text-text-active cursor-pointer"
            title="Detail & Mutasi"
          >
            <History class="w-3.5 h-3.5" />
          </router-link>
        </template>
      </DataTable>

      <!-- Stock Form Modal Dialog (Create/Edit) -->
      <StockFormModal v-model="showFormModal" :stock-id="editingStockId" @saved="refreshStockTable" />

      <!-- Stock Import Modal Dialog -->
      <ImportStockModal v-model="showImportModal" @imported="refreshStockTable" />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import DropdownMenu from '@/components/common/DropdownMenu.vue';
import StockFormModal from './components/StockFormModal.vue';
import ImportStockModal from './components/ImportStockModal.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import { useStock } from './composables/useStock';
import { Alert } from '@/plugins/sweetalert';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { FilterIcon } from '@/icons';
import {
  DollarSign,
  PackageX,
  ChevronDown,
  Download,
  History,
  Upload,
  Plus
} from 'lucide-vue-next';

const authStore = useAuthStore();
const showImportModal = ref(false);

const stokOpeningTabs = [
  { key: 'semua', label: 'Semua' },
  { key: 'biasa', label: 'Stok Biasa' },
  { key: 'opening', label: 'Stok Opening' },
  { key: 'parfum', label: 'Parfum' },
];

const isSuperAdmin = computed(() => {
  const user = authStore.user;
  const isSuper = user?.is_superadmin === true || user?.isAdmin === true;
  const divName = (user?.divisionName || user?.division_name || '').toUpperCase();
  const isGA = divName.includes('GA') || divName.includes('GENERAL AFFAIRS');
  return isSuper || isGA;
});

const {
  filters,
  stockStore,
  fetchData,
  handlePageChange,
  resetFilters,
  exportStock,
  exportMovements
} = useStock(!isSuperAdmin.value ? authStore.user?.employee_id : '');

// --- Modal States ---
const showFormModal = ref(false);
const editingStockId = ref(null);

const openCreateModal = () => {
  editingStockId.value = null;
  showFormModal.value = true;
};

const openEditModal = (id) => {
  editingStockId.value = id;
  showFormModal.value = true;
};

const refreshStockTable = () => {
  fetchData(stockStore.pagination.currentPage || 1, true);
};

// --- Export Handlers ---
const handleExportStock = async () => {
  const confirmed = await Alert.confirmExport(
    'Apakah Anda setuju untuk export data stok?',
    'Sistem akan mengunduh data stok dari monitoring stok'
  );
  if (confirmed) {
    try {
      await exportStock();
      Alert.toast('Berhasil export data stok', 'File data stok berhasil diunduh ke perangkat Anda', 'success');
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan saat mengunduh file data stok';
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          if (json.message) {
            errorMessage = json.message;
          }
        } catch (e) {
          // ignore
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.toast('Gagal export data stok', errorMessage, 'error');
    }
  }
};

const handleExportMovements = async () => {
  const confirmed = await Alert.confirmExport(
    'Apakah Anda setuju untuk export data mutasi?',
    'Sistem akan mengunduh data mutasi dari monitoring stok'
  );
  if (confirmed) {
    try {
      await exportMovements();
      Alert.toast('Berhasil export mutasi stok', 'File mutasi stok berhasil diunduh ke perangkat Anda', 'success');
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan saat mengunduh file mutasi stok';
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          if (json.message) {
            errorMessage = json.message;
          }
        } catch (e) {
          // ignore
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.toast('Gagal export mutasi stok', errorMessage, 'error');
    }
  }
};

// --- Filters Modal & Schema ---
const showFilter = ref(false);
const locations = ref([]);
const employees = ref([]);

const localFilters = reactive({
  search: '',
  locationId: '',
  goodId: '',
  employeeId: '',
  lowStock: false,
  isStokOpening: 'semua',
  dateFrom: '',
  dateTo: '',
});

const hasActiveFilters = computed(() => {
  return !!(
    localFilters.search ||
    localFilters.locationId ||
    localFilters.employeeId ||
    localFilters.dateFrom ||
    localFilters.dateTo ||
    localFilters.lowStock ||
    (localFilters.isStokOpening && localFilters.isStokOpening !== 'semua')
  );
});

const filterSchema = computed(() => [
  {
    label: 'Cari Data',
    key: 'search',
    type: 'text',
    placeholder: 'Cari Nama, Kode, Merk'
  },
  {
    label: 'Jenis Stok',
    key: 'isStokOpening',
    type: 'select',
    options: stokOpeningTabs.map(opt => ({ label: opt.label, value: opt.key }))
  },
  {
    label: 'Lokasi',
    key: 'locationId',
    type: 'searchable-select',
    master: 'locations',
    placeholder: 'Semua Lokasi'
  },
  ...(isSuperAdmin.value
    ? [{
        label: 'Filter PIC',
        key: 'employeeId',
        type: 'searchable-select',
        master: 'employees',
        placeholder: 'Semua PIC'
      }]
    : []),
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
  },
  {
    label: 'Status',
    key: 'lowStock',
    type: 'checkbox',
    checkboxLabel: 'Low Stock Only'
  }
]);

watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.search = filters.search;
    localFilters.locationId = filters.locationId;
    localFilters.goodId = filters.goodId;
    localFilters.employeeId = filters.employeeId;
    localFilters.lowStock = filters.lowStock;
    localFilters.isStokOpening = filters.isStokOpening;
    localFilters.dateFrom = filters.dateFrom;
    localFilters.dateTo = filters.dateTo;
  }
});

const applyFilters = () => {
  filters.search = localFilters.search;
  filters.locationId = localFilters.locationId;
  filters.goodId = localFilters.goodId;
  filters.employeeId = localFilters.employeeId;
  filters.lowStock = localFilters.lowStock;
  filters.isStokOpening = localFilters.isStokOpening;
  filters.dateFrom = localFilters.dateFrom;
  filters.dateTo = localFilters.dateTo;
  showFilter.value = false;
};

const handleReset = () => {
  resetFilters();
  localFilters.search = '';
  localFilters.locationId = '';
  localFilters.goodId = '';
  localFilters.employeeId = '';
  localFilters.lowStock = false;
  localFilters.isStokOpening = 'semua';
  localFilters.dateFrom = '';
  localFilters.dateTo = '';
  showFilter.value = false;
};

// --- Table Columns Setup ---
const valuedColumns = [
  { key: 'no', label: 'No', width: '60px' },
  { key: 'goodName', label: 'Nama Barang' },
  { key: 'merk', label: 'Merk', hideOnMobile: true },
  { key: 'picName', label: 'PIC', hideOnMobile: true },
  { key: 'locationName', label: 'Lokasi' },
  { key: 'qtyFirst', label: 'Awal', hideOnMobile: true },
  { key: 'qtyIn', label: 'Masuk', hideOnMobile: true },
  { key: 'qtyOut', label: 'Keluar', hideOnMobile: true },
  { key: 'qtyCurrent', label: 'Sisa' },
  { key: 'unitCost', label: 'Harga Satuan' },
  { key: 'totalValue', label: 'Total Nilai' },
  { key: 'action', label: 'Aksi', width: '100px' },
];

const returnColumns = [
  { key: 'no', label: 'No', width: '60px' },
  { key: 'goodName', label: 'Nama Barang' },
  { key: 'merk', label: 'Merk', hideOnMobile: true },
  { key: 'picName', label: 'PIC', hideOnMobile: true },
  { key: 'locationName', label: 'Lokasi' },
  { key: 'qtyFirst', label: 'Awal', hideOnMobile: true },
  { key: 'qtyIn', label: 'Masuk', hideOnMobile: true },
  { key: 'qtyOut', label: 'Keluar', hideOnMobile: true },
  { key: 'qtyCurrent', label: 'Sisa' },
  { key: 'returnBadge', label: 'Status Nilai' },
  { key: 'action', label: 'Aksi', width: '100px' },
];

const activeColumns = computed(() => {
  return filters.isValued === 'valued' ? valuedColumns : returnColumns;
});

const tableTitle = computed(() => {
  return filters.isValued === 'valued' ? 'Stok Bernilai' : 'Stok Return';
});

const tableSubtitle = computed(() => {
  return filters.isValued === 'valued'
    ? 'Monitor dan kelola persediaan barang yang memiliki nilai buku'
    : 'Stok tanpa nilai buku atau bernilai Rp 0 (barang reject/return)';
});

</script>

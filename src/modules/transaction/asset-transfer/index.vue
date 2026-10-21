<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">

      <!-- ── Controls Bar ──────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <!-- Search Input -->
        <div class="relative w-full sm:w-80 group">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-500 transition-colors pointer-events-none" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Cari kode transfer, nama barang, PIC..."
            class="w-full pl-9 pr-4 bg-white dark:bg-gray-900 border border-border text-text-active rounded-md outline-none text-sm placeholder:text-text-placeholder focus:border-brand-500 transition-all h-10"
            @keyup.enter="fetchData(1, true)"
          />
        </div>

        <!-- Action Button Group -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Export Dropdown -->
          <DropdownMenu
            button-class="bg-white dark:bg-gray-900 border border-border text-text-active rounded-md px-3.5 flex items-center justify-center gap-1.5 font-medium text-sm h-10 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 duration-200"
            menu-class="absolute right-0 z-50 mt-2 w-52 bg-white dark:bg-gray-900 border border-border rounded-md shadow-xl overflow-hidden py-1"
          >
            <template #icon>
              <Download class="w-4 h-4 text-text-active" />
              <span class="hidden sm:inline">Export</span>
              <ChevronDown class="w-3.5 h-3.5 text-text-muted ml-0.5" />
            </template>
            <template #menu>
              <button
                @click="handleExportAsset"
                class="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-text-muted hover:text-text-active hover:bg-bg-active transition font-normal cursor-pointer"
              >
                <span>Export Mutasi Aset</span>
                <Download class="w-3.5 h-3.5 opacity-60 shrink-0" />
              </button>
              <div class="h-px bg-border w-full my-0.5" />
              <button
                @click="handleExportStock"
                class="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-text-muted hover:text-text-active hover:bg-bg-active transition font-normal cursor-pointer"
              >
                <span>Export Mutasi Stok</span>
                <Download class="w-3.5 h-3.5 opacity-60 shrink-0" />
              </button>
            </template>
          </DropdownMenu>

          <!-- Add Button (Glossy Black) -->
          <GlossyButton
            v-can="'asset-stock-transfer:create'"
            @click="openCreateModal"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Buat Mutasi</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Filters Modal -->
      <FilterModal
        v-model="showFilter"
        title="Filter Mutasi"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        @apply="applyFilters"
        @reset="handleReset"
      />

      <!-- ── Data Table ──────────────────────────────────────── -->
      <DataTable
        :columns="columns"
        :data="transferStore.transfers"
        :loading="transferStore.isLoading"
        :total-items="transferStore.pagination.totalData"
        :current-page="transferStore.pagination.currentPage"
        :items-per-page="transferStore.pagination.dataPerPage"
        title="Daftar Mutasi Aset"
        subtitle="Manajemen dan monitoring alur perpindahan aset inventaris dan stok"
        @update:current-page="handlePageChange"
        server-side
      >
        <template #header-actions>
          <!-- Status Tabs -->
          <div class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md shrink-0 h-9 w-fit">
            <button
              v-for="tab in statusTabs"
              :key="tab.key"
              @click="handleStatusTabClick(tab.key)"
              :class="[
                'flex items-center justify-center px-2.5 h-full rounded text-xs transition-all duration-200 border whitespace-nowrap shrink-0 cursor-pointer',
                filters.status === tab.key
                  ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                  : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Filter Button -->
          <button
            @click="showFilter = true"
            class="bg-white dark:bg-gray-900 border border-border text-text-active rounded-md px-3.5 flex items-center gap-1.5 font-medium text-sm h-9 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 duration-200"
          >
            <FilterIcon class="w-4 h-4 text-text-active" />
            <span>Filter</span>
            <span v-if="hasActiveFilters" class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
          </button>
        </template>

        <!-- No -->
        <template #cell-no="{ index }">
          {{ ((Math.max(1, Number(transferStore.pagination?.currentPage || transferStore.pagination?.page || 1)) - 1) * Number(transferStore.pagination?.dataPerPage || transferStore.pagination?.limit || 10)) + index + 1 }}
        </template>

        <!-- No Transfer + Tanggal -->
        <template #cell-code="{ item }">
          <div class="flex flex-col">
            <span class="font-medium text-text-active leading-tight">{{ item.code }}</span>
            <span class="text-xs text-text-muted mt-0.5">{{ formatDate(item.transferDate) }}</span>
          </div>
        </template>

        <!-- Barang / Tipe -->
        <template #cell-itemName="{ item }">
          <div class="flex flex-col items-start gap-1">
            <span class="font-medium text-text-active leading-tight">{{ item.itemName }}</span>
            <div class="flex items-center gap-1">
              <span
                :class="[
                  'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                  item.transferType === 'asset'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                ]"
              >
                {{ item.transferType === 'asset' ? 'Mutasi Aset' : 'Mutasi Stok' }}
              </span>
              <span
                v-if="item.tipe === 'opening' || item.tipe === 'parfum'"
                class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
              >
                {{ item.tipe === 'parfum' ? 'Parfum' : 'Opening' }}
              </span>
            </div>
          </div>
        </template>

        <!-- Qty -->
        <template #cell-qty="{ item }">
          <span class="font-medium text-text-active">
            {{ item.qty || 1 }} <span class="text-xs text-text-muted font-normal">Unit</span>
          </span>
        </template>

        <!-- Alur Mutasi (Asal -> Tujuan) -->
        <template #cell-route="{ item }">
          <div class="flex items-center gap-2 text-xs">
            <div class="flex flex-col">
              <span class="font-medium text-text-active">{{ item.fromLocationName }}</span>
              <span class="text-text-muted text-[11px]">{{ item.fromPicName }}</span>
            </div>
            <ArrowRight class="w-3.5 h-3.5 text-text-muted/70 shrink-0" />
            <div class="flex flex-col">
              <span class="font-medium text-text-active">{{ item.toLocationName }}</span>
              <span class="text-text-muted text-[11px]">{{ item.toPicName }}</span>
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #cell-status="{ item }">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize whitespace-nowrap',
              statusBadgeClass(item.status)
            ]"
          >
            {{ statusLabel(item.status) }}
          </span>
        </template>

        <!-- Aksi -->
        <template #cell-action="{ item }">
          <div class="flex items-center justify-end">
            <router-link
              v-can="'asset-stock-transfer:read'"
              :to="{ name: 'TranAssetTransferDetail', params: { id: item.id } }"
              class="p-1.5 rounded-md text-text-muted hover:text-text-active hover:bg-bg-active transition-colors cursor-pointer"
              title="Detail Mutasi"
            >
              <ChevronRight class="w-4 h-4" />
            </router-link>
          </div>
        </template>
      </DataTable>

      <!-- Asset Transfer Form Modal Dialog -->
      <AssetTransferFormModal
        v-model="showFormModal"
        :transfer-id="editingTransferId"
        @saved="fetchData(1, true)"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import DropdownMenu from '@/components/common/DropdownMenu.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import AssetTransferFormModal from './components/AssetTransferFormModal.vue';
import { useAssetTransfer } from './composables/useAssetTransfer';
import { FilterIcon } from '@/icons';
import {
  Plus, Search, Download, ChevronDown, ChevronRight, ArrowRight
} from 'lucide-vue-next';

const {
  filters,
  transferStore,
  fetchData,
  handlePageChange,
  resetFilters,
  handleExportAsset,
  handleExportStock,
} = useAssetTransfer();

const showFormModal = ref(false);
const editingTransferId = ref(null);

const statusTabs = [
  { key: '', label: 'Semua Status' },
  { key: 'draft', label: 'Draft' },
  { key: 'completed', label: 'Selesai' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

const handleStatusTabClick = (statusKey) => {
  filters.status = statusKey;
};

const openCreateModal = () => {
  editingTransferId.value = null;
  showFormModal.value = true;
};

// ── Filters Modal ─────────────────────────────────────────────────────────────
const showFilter = ref(false);

const localFilters = reactive({
  picId: '',
  tipe: '',
  dateFrom: '',
  dateTo: '',
});

const filterSchema = computed(() => [
  {
    label: 'PIC Penerima',
    key: 'picId',
    type: 'searchable-select',
    master: 'employees',
    placeholder: 'Semua PIC',
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
  {
    label: 'Dari Tanggal',
    key: 'dateFrom',
    type: 'date',
    placeholder: 'dd/mm/yyyy',
  },
  {
    label: 'Sampai Tanggal',
    key: 'dateTo',
    type: 'date',
    placeholder: 'dd/mm/yyyy',
  },
]);

const hasActiveFilters = computed(() => !!(localFilters.picId || localFilters.tipe || localFilters.dateFrom || localFilters.dateTo));

watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.picId = filters.picId;
    localFilters.tipe = filters.tipe;
    localFilters.dateFrom = filters.dateFrom;
    localFilters.dateTo = filters.dateTo;
  }
});

const applyFilters = () => {
  filters.picId = localFilters.picId;
  filters.tipe = localFilters.tipe;
  filters.dateFrom = localFilters.dateFrom;
  filters.dateTo = localFilters.dateTo;
  showFilter.value = false;
};

const handleReset = () => {
  resetFilters();
  localFilters.picId = '';
  localFilters.tipe = '';
  localFilters.dateFrom = '';
  localFilters.dateTo = '';
  showFilter.value = false;
};



const columns = [
  { key: 'no', label: 'No', width: '60px' },
  { key: 'code', label: 'No. Transfer', width: '180px' },
  { key: 'itemName', label: 'Barang / Tipe', width: '220px' },
  { key: 'qty', label: 'Jumlah', width: '100px' },
  { key: 'route', label: 'Alur Mutasi (Asal → Tujuan)', width: '320px' },
  { key: 'status', label: 'Status', width: '130px' },
  { key: 'notes', label: 'Keterangan' },
  { key: 'action', label: '', width: '50px' },
];

const statusBadgeClass = (s) => ({
  draft: 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  in_transit: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  received: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
}[s] || 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300');

const statusLabel = (s) => ({
  draft: 'Draft',
  pending: 'Menunggu',
  in_transit: 'Dalam Pengiriman',
  received: 'Diterima',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}[s] || s || '-');

const formatDate = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
};
</script>

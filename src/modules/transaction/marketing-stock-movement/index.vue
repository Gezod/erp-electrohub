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
            placeholder="Cari nama barang, lokasi, keterangan..."
            class="w-full pl-9 pr-4 bg-white dark:bg-gray-900 border border-border text-text-active rounded-md outline-none text-sm placeholder:text-text-placeholder focus:border-brand-500 transition-all h-10"
            @keyup.enter="fetchData(1)"
          />
        </div>
      </div>

      <!-- Filters Modal -->
      <FilterModal
        v-model="showFilter"
        title="Filter Mutasi Stok"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        @apply="applyFilters"
        @reset="handleReset"
      />

      <!-- ── Data Table ──────────────────────────────────────── -->
      <DataTable
        :columns="columns"
        :data="store.items"
        :loading="store.isLoading"
        :server-side="true"
        :total-items="store.pagination.totalData"
        :current-page="store.pagination.currentPage"
        :items-per-page="store.pagination.dataPerPage"
        title="Log Pergerakan Stok"
        subtitle="Riwayat pergerakan stok & perolehan aset Marketing, data terbaru di atas"
        @update:current-page="handlePageChange"
      >
        <template #header-actions>
          <!-- Kategori Tabs -->
          <div class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md shrink-0 h-9 w-fit">
            <button
              v-for="tab in kategoriTabs"
              :key="tab.key"
              @click="filters.kategori = tab.key"
              :class="[
                'flex items-center justify-center px-2.5 h-full rounded text-xs transition-all duration-200 border whitespace-nowrap shrink-0 cursor-pointer',
                filters.kategori === tab.key
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
          {{ ((Math.max(1, Number(store.pagination?.currentPage || store.pagination?.page || 1)) - 1) * Number(store.pagination?.dataPerPage || store.pagination?.limit || 10)) + index + 1 }}
        </template>

        <!-- Kategori Badge -->
        <template #cell-kategoriLabel="{ item }">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize whitespace-nowrap',
              item.kategori === 'aset'
                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
            ]"
          >
            {{ item.kategoriLabel }}
          </span>
        </template>

        <!-- Tipe Badge -->
        <template #cell-tipeLabel="{ item }">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 whitespace-nowrap">
            {{ item.tipeLabel }}
          </span>
        </template>

        <!-- Qty with conditional color -->
        <template #cell-qtyDisplay="{ item }">
          <span
            :class="[
              'font-semibold text-sm whitespace-nowrap',
              item.qtyIsNegative ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
            ]"
          >
            {{ item.qtyDisplay }}
          </span>
        </template>

        <!-- Avg Cost (Sebelum → Sesudah) -->
        <template #cell-avgCost="{ item }">
          <div class="flex items-center gap-1.5 text-sm whitespace-nowrap">
            <span class="text-text-muted">{{ item.avgCostBefore }}</span>
            <ArrowRight class="w-3.5 h-3.5 text-text-muted/60 shrink-0" />
            <span class="font-medium text-text-active">{{ item.avgCostAfter }}</span>
          </div>
        </template>
      </DataTable>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import { FilterIcon } from '@/icons';
import { ArrowRight, Search } from 'lucide-vue-next';
import { useMarketingStockMovementLog } from './composables/useMarketingStockMovement';
import { TIPE_LABEL, TIPE_OPTIONS } from './marketing-stock-movement.mapper';

const { filters, store, fetchData, handlePageChange, resetFilters } = useMarketingStockMovementLog();

const showFilter = ref(false);

const kategoriTabs = [
  { key: 'semua', label: 'Semua' },
  { key: 'stok', label: 'Stok' },
  { key: 'aset', label: 'Aset' },
];

const columns = [
  { key: 'no', label: 'No', width: '60px' },
  { key: 'tanggalLabel', label: 'Tanggal', width: '160px' },
  { key: 'kategoriLabel', label: 'Kategori', width: '100px' },
  { key: 'namaBarang', label: 'Nama Barang', width: '200px' },
  { key: 'tipeLabel', label: 'Tipe', width: '140px' },
  { key: 'qtyDisplay', label: 'Qty', width: '90px' },
  { key: 'avgCost', label: 'Avg Cost (Sebelum → Sesudah)', width: '250px' },
  { key: 'lokasi', label: 'Lokasi', width: '160px' },
  { key: 'keterangan', label: 'Keterangan', width: '240px' },
  { key: 'oleh', label: 'Oleh', width: '140px' },
];

const localFilters = reactive({
  tipe: '',
  locationId: '',
  dateFrom: '',
  dateTo: '',
});

const hasActiveFilters = computed(() => !!(
  localFilters.tipe || localFilters.locationId || localFilters.dateFrom || localFilters.dateTo
));

const filterSchema = computed(() => [
  {
    label: 'Tipe',
    key: 'tipe',
    type: 'select',
    options: [
      { label: 'Semua Tipe', value: '' },
      ...TIPE_OPTIONS.stok.map(t => ({ label: `[Stok] ${TIPE_LABEL[t]}`, value: t })),
      ...TIPE_OPTIONS.aset.map(t => ({ label: `[Aset] ${TIPE_LABEL[t]}`, value: t }))
    ]
  },
  {
    label: 'Lokasi',
    key: 'locationId',
    type: 'searchable-select',
    master: 'locations',
    placeholder: 'Semua Lokasi',
  },
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

// Sinkronkan localFilters saat modal dibuka
watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.tipe = filters.tipe;
    localFilters.locationId = filters.locationId;
    localFilters.dateFrom = filters.dateFrom;
    localFilters.dateTo = filters.dateTo;
  }
});

const applyFilters = () => {
  filters.tipe = localFilters.tipe;
  filters.locationId = localFilters.locationId;
  filters.dateFrom = localFilters.dateFrom;
  filters.dateTo = localFilters.dateTo;
  showFilter.value = false;
};

const handleReset = () => {
  resetFilters();
  localFilters.tipe = '';
  localFilters.locationId = '';
  localFilters.dateFrom = '';
  localFilters.dateTo = '';
  showFilter.value = false;
};

</script>

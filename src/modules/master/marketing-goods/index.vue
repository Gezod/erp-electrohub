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
            placeholder="Cari nama atau kode barang..."
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

          <!-- Tambah Barang (Glossy Black) -->
          <GlossyButton
            v-can="'marketing-goods:create'"
            @click="handleCreate"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah Barang</span>
          </GlossyButton>
        </div>
      </div>

      <!-- ── Filters Modal ────────────────────────────────────── -->
      <FilterModal
        v-model="showFilter"
        title="Filter Barang Marketing"
        :schema="filterSchema"
        :model="filters"
        :has-active-filters="hasActiveFilters"
        @apply="showFilter = false"
        @reset="resetFilters"
      />

      <!-- ── Data Table ───────────────────────────────────────── -->
      <DataTable
        :columns="tableColumns"
        :data="store.goods"
        :loading="store.isLoading"
        :server-side="true"
        :total-items="store.pagination.totalData"
        :current-page="store.pagination.currentPage"
        :items-per-page="store.pagination.dataPerPage"
        permission-prefix="marketing-goods"
        title="Daftar Barang Marketing"
        subtitle="Master Data • Modul Marketing Operasional"
        @edit="(item) => handleEdit(item.id)"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
      >
        <template #header-actions>
          <!-- Tipe Tabs -->
          <div class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md shrink-0 h-9 w-fit max-w-full overflow-x-auto">
            <button
              v-for="tab in tipeTabs"
              :key="tab.key"
              @click="handleTipeTabClick(tab.key)"
              :class="[
                'flex items-center justify-center gap-1.5 px-2.5 h-full rounded text-xs transition-all duration-200 border whitespace-nowrap shrink-0 cursor-pointer',
                (filters.tipe_barang || '') === tab.key
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

        <!-- Nama Barang & Kode -->
        <template #cell-good_name="{ item }">
          <div class="flex flex-col items-start gap-0.5">
            <span class="text-sm font-semibold text-text-active leading-tight">
              {{ item.good_name }}
            </span>
            <span class="text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider">
              {{ item.good_code || '-' }}
            </span>
          </div>
        </template>

        <!-- Tipe Barang -->
        <template #cell-tipe_barang="{ item }">
          <Badge
            :color="item.tipe_barang === 'permanent' ? 'primary' : 'light'"
            variant="light"
            class="text-[10px] font-bold uppercase tracking-wider"
          >
            {{ item.tipe_barang === 'permanent' ? 'Permanent · Aset' : 'Temporary · Stok' }}
          </Badge>
        </template>

        <!-- Satuan (UOM) -->
        <template #cell-uom_name="{ item }">
          <span class="text-sm font-medium text-text-active">
            {{ item.uom_name || item.uom?.name || '-' }}
          </span>
        </template>

        <!-- Tipe Aset -->
        <template #cell-asset_type_name="{ item }">
          <span class="text-sm font-medium text-text-active">
            {{ item.tipe_barang === 'permanent' ? (item.asset_type_name || item.asset_type?.name_type || '-') : '-' }}
          </span>
        </template>

        <!-- Status -->
        <template #cell-status="{ item }">
          <Badge
            :color="item.is_active ? 'success' : 'error'"
            variant="light"
            class="text-[11px] font-bold"
          >
            {{ item.is_active ? 'Aktif' : 'Tidak Aktif' }}
          </Badge>
        </template>
      </DataTable>

      <!-- ── Form Modal Dialog ────────────────────────────────── -->
      <MarketingGoodsFormModal
        v-model="showFormModal"
        :good-id="selectedGoodId"
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
import MarketingGoodsFormModal from './components/MarketingGoodsFormModal.vue';
import { useMarketingGoods } from './composables/useMarketingGoods';
import { FilterIcon } from '@/icons';
import { Search, Plus } from 'lucide-vue-next';
import { Alert } from '@/plugins/sweetalert';

const {
  filters,
  store,
  fetchData,
  handlePageChange,
  resetFilters
} = useMarketingGoods();

// --- Modal States ---
const showFormModal = ref(false);
const selectedGoodId = ref(null);
const showFilter = ref(false);

const hasActiveFilters = computed(() => {
  return !!(filters.search || filters.tipe_barang || filters.is_active);
});

// --- Tabs ---
const tipeTabs = [
  { key: '', label: 'Semua Tipe' },
  { key: 'permanent', label: 'Permanent (Aset)' },
  { key: 'temporary', label: 'Temporary (Stok)' }
];

const handleTipeTabClick = (key) => {
  filters.tipe_barang = key;
};

// --- Filter Modal Schema ---
const filterSchema = [
  {
    label: 'Kata Kunci',
    key: 'search',
    type: 'text',
    placeholder: 'Cari nama atau kode barang...'
  },
  {
    label: 'Tipe Barang',
    key: 'tipe_barang',
    type: 'select',
    placeholder: 'Semua Tipe',
    options: [
      { label: 'Semua Tipe', value: '' },
      { label: 'Permanent (Aset)', value: 'permanent' },
      { label: 'Temporary (Stok)', value: 'temporary' }
    ]
  },
  {
    label: 'Status Barang',
    key: 'is_active',
    type: 'select',
    placeholder: 'Semua Status',
    options: [
      { label: 'Semua Status', value: '' },
      { label: 'Aktif', value: 'true' },
      { label: 'Tidak Aktif', value: 'false' }
    ]
  }
];

// --- Table Columns ---
const tableColumns = [
  { key: 'no',              label: 'No',          width: '60px' },
  { key: 'good_name',       label: 'Barang' },
  { key: 'tipe_barang',     label: 'Tipe' },
  { key: 'uom_name',        label: 'Satuan' },
  { key: 'asset_type_name', label: 'Tipe Aset' },
  { key: 'status',          label: 'Status' },
  { key: 'action',          label: 'Aksi',        width: '90px' }
];

onMounted(() => {
  fetchData();
});

// --- Actions ---
const handleCreate = () => {
  selectedGoodId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedGoodId.value = id;
  showFormModal.value = true;
};

const handleSaved = () => {
  fetchData(store.pagination.currentPage || 1, true);
};

const handleDelete = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const name = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.good_name : '';

  const isConfirmed = await Alert.confirm(
    'Nonaktifkan Barang Marketing?',
    `Barang ${name ? `"${name}"` : ''} akan dinonaktifkan dari sistem.`
  );

  if (isConfirmed) {
    try {
      await store.deleteGood(id);
      Alert.toast('Barang marketing telah dinonaktifkan', 'success');
      fetchData(store.pagination.currentPage || 1, true);
    } catch (error) {
      Alert.error('Gagal', error.response?.data?.message || 'Gagal menonaktifkan barang marketing');
    }
  }
};
</script>

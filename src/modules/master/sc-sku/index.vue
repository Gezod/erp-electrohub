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
            placeholder="Cari kode atau nama SKU..."
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

          <!-- Tambah SKU (Glossy Black) -->
          <GlossyButton
            v-can="'sc-sku:create'"
            @click="handleCreate"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah SKU</span>
          </GlossyButton>
        </div>
      </div>

      <!-- ── Filters Modal ────────────────────────────────────── -->
      <FilterModal
        v-model="showFilter"
        title="Filter Master SKU & Harga"
        :schema="filterSchema"
        :model="filters"
        :has-active-filters="hasActiveFilters"
        @apply="showFilter = false"
        @reset="resetFilters"
      />

      <!-- ── Data Table ───────────────────────────────────────── -->
      <DataTable
        :columns="tableColumns"
        :data="store.items"
        :loading="store.isLoading"
        :server-side="true"
        :total-items="store.pagination.totalData"
        :current-page="store.pagination.currentPage"
        :items-per-page="store.pagination.dataPerPage"
        permission-prefix="sc-sku"
        title="Daftar Master SKU & Harga"
        subtitle="Supply Chain • Master Data SKU & Parameter Rantai Pasok"
        :delete-title="'Nonaktifkan SKU'"
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
                (filters.tipe_sku || '') === tab.key
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

        <!-- Kode SKU -->
        <template #cell-code="{ item }">
          <span class="text-xs font-mono font-bold text-text-active bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-border">
            {{ item.code }}
          </span>
        </template>

        <!-- Nama SKU -->
        <template #cell-name="{ item }">
          <div class="flex flex-col items-start gap-0.5">
            <span class="text-sm font-semibold text-text-active leading-tight">
              {{ item.name }}
            </span>
          </div>
        </template>

        <!-- Kategori (camelCase dari mapper) -->
        <template #cell-categoryName="{ item }">
          <span class="text-sm font-medium text-text-active">
            {{ item.categoryName || '-' }}
          </span>
        </template>

        <!-- Tipe SKU (camelCase dari mapper) -->
        <template #cell-tipeSku="{ item }">
          <Badge
            :color="item.tipeSku === 'raw_material' ? 'primary' : 'light'"
            variant="light"
            class="text-[10px] font-bold uppercase tracking-wider"
          >
            {{ item.tipeSku === 'raw_material' ? 'Bahan Baku' : 'Barang Jadi' }}
          </Badge>
        </template>

        <!-- Supplier (camelCase dari mapper) -->
        <template #cell-supplierName="{ item }">
          <span
            class="text-sm font-medium"
            :class="item.supplierName === 'Produksi Sendiri' ? 'text-text-muted italic' : 'text-text-active'"
          >
            {{ item.supplierName || '-' }}
          </span>
        </template>

        <!-- MOQ -->
        <template #cell-moq="{ item }">
          <span class="text-sm font-semibold font-mono text-text-active">
            {{ item.moq || 1 }} unit
          </span>
        </template>

        <!-- Harga Unit / camelCase dari mapper -->
        <template #cell-hargaUnit="{ item }">
          <span class="text-sm font-medium text-text-active">
            {{ item.hargaUnit !== null && item.hargaUnit !== undefined ? 'Rp ' + formatThousand(item.hargaUnit) : '-' }}
          </span>
        </template>

        <!-- Kelompok Toko (camelCase dari mapper) -->
        <template #cell-kelompokTokoName="{ item }">
          <span class="text-sm font-medium text-text-active">
            {{ item.kelompokTokoName || '-' }}
          </span>
        </template>

        <!-- Status (gunakan isActive boolean dari mapper, bukan item.status string) -->
        <template #cell-isActive="{ item }">
          <Badge
            :color="item.isActive ? 'success' : 'error'"
            variant="light"
            class="text-[11px] font-bold"
          >
            {{ item.isActive ? 'Aktif' : 'Nonaktif' }}
          </Badge>
        </template>
      </DataTable>

      <!-- ── Form Modal Dialog ────────────────────────────────── -->
      <ScSkuFormModal
        v-model="showFormModal"
        :sku-id="selectedSkuId"
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
import ScSkuFormModal from './components/ScSkuFormModal.vue';
import { useScSku } from './composables/useScSku';
import { FILTER_SCHEMA, TABLE_COLUMNS, TIPE_TABS } from './scSku.constants';
import { formatThousand } from '@/utils/format';
import { FilterIcon } from '@/icons';
import { Search, Plus } from 'lucide-vue-next';
import { Alert } from '@/plugins/sweetalert';

const {
  filters,
  store,
  fetchData,
  handlePageChange,
  resetFilters
} = useScSku();

// --- Modal States ---
const showFormModal = ref(false);
const selectedSkuId = ref(null);
const showFilter = ref(false);

const hasActiveFilters = computed(() => {
  return !!(filters.search || filters.tipe_sku || filters.category_id || filters.is_active);
});

// --- Tabs Configuration ---
const tipeTabs = TIPE_TABS;

const handleTipeTabClick = (key) => {
  filters.tipe_sku = key;
};

// --- Filter Modal Schema ---
const filterSchema = FILTER_SCHEMA;

// --- Table Columns ---
const tableColumns = TABLE_COLUMNS;

onMounted(() => {
  fetchData();
});

// --- Actions ---
const handleCreate = () => {
  selectedSkuId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedSkuId.value = id;
  showFormModal.value = true;
};

const handleSaved = () => {
  fetchData(store.pagination.currentPage || 1, true);
};

const handleDelete = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const name = typeof itemOrId === 'object' && itemOrId !== null ? (itemOrId.name || itemOrId.code) : '';

  const isConfirmed = await Alert.confirm(
    'Nonaktifkan SKU?',
    `SKU ${name ? `"${name}"` : ''} akan dinonaktifkan dari sistem (status inactive).`
  );

  if (isConfirmed) {
    try {
      await store.deleteSku(id);
      Alert.toast('SKU telah berhasil dinonaktifkan', 'success');
      fetchData(store.pagination.currentPage || 1, true);
    } catch (error) {
      // Business rule FR-B1.2: SKU yang sedang punya PO/request berstatus open TIDAK BOLEH dinonaktifkan
      const errorMsg = error.response?.data?.message || 'SKU tidak dapat dinonaktifkan karena sedang memiliki PO atau request berstatus open.';
      Alert.error('Gagal Menonaktifkan', errorMsg);
    }
  }
};
</script>

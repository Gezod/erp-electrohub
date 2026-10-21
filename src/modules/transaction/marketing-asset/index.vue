<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">
      <!-- ── Top Controls Bar ──────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div class="flex items-center gap-2">
          <span class="text-xs text-text-muted">
            Monitoring dan pengelolaan aset operasional marketing
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <!-- Export CSV -->
          <ActionButton @click="handleExportAsset">
            <Download class="w-4 h-4" />
            <span class="hidden sm:inline">Export CSV</span>
          </ActionButton>

          <!-- Tambah Aset -->
          <GlossyButton v-can="'marketing-assets:create'" @click="handleCreate">
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah Aset</span>
          </GlossyButton>
        </div>
      </div>

      <!-- ── Dashboard Aset (Stats Cards) ──────────────────────────── -->
      <MarketingAssetStats :stats="store.stats" />

      <!-- ── Filter Modal ──────────────────────────────────────────── -->
      <FilterModal
        v-model="showFilter"
        title="Filter Aset Marketing"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        :is-dirty="isModalDirty"
        @apply="applyFiltersFromModal"
        @reset="handleResetFilter"
      />

      <!-- ── Data Table ────────────────────────────────────────────── -->
      <DataTable
        :columns="tableColumns"
        :data="store.assets"
        :loading="store.isLoading"
        :server-side="true"
        :total-items="store.pagination.totalData"
        :current-page="store.pagination.currentPage"
        :items-per-page="store.pagination.dataPerPage"
        title="Daftar Aset Marketing"
        subtitle="Manajemen dan monitoring aset operasional marketing"
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
                filters.isActive === tab.key
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

        <!-- Kode Aset -->
        <template #cell-codeAsset="{ item }">
          <div class="flex flex-col items-start justify-center leading-tight py-1">
            <span class="font-mono font-bold text-sm text-text-active whitespace-nowrap">{{ item.codeAsset }}</span>
            <span v-if="item.dateAcquired" class="text-xs text-text-muted whitespace-nowrap mt-0.5">
              {{ formatDate(item.dateAcquired) }}
            </span>
          </div>
        </template>

        <!-- Nama Barang -->
        <template #cell-goodName="{ item }">
          <div class="flex flex-col">
            <router-link
              :to="{ name: 'MarketingAssetDetail', params: { id: item.id } }"
              class="font-medium text-sm text-text-active hover:text-brand-500 transition-colors leading-tight"
            >
              {{ item.goodName }}
            </router-link>
            <span class="text-xs text-text-muted mt-0.5 font-mono uppercase">
              {{ item.goodCode }}
            </span>
          </div>
        </template>

        <!-- Kondisi -->
        <template #cell-condition="{ item }">
          <Badge :color="conditionBadgeColor(item.condition)" variant="light" class="capitalize text-[11px] font-bold px-2 py-0.5">
            {{ conditionLabel(item.condition) }}
          </Badge>
        </template>

        <!-- Status -->
        <template #cell-isActive="{ item }">
          <Badge :color="item.isActive ? 'success' : 'error'" variant="light" class="capitalize text-[11px] font-bold px-2 py-0.5">
            {{ item.isActive ? 'Aktif' : 'Tidak Aktif' }}
          </Badge>
        </template>

        <!-- Aksi -->
        <template #cell-action="{ item }">
          <div class="flex items-center gap-1.5">
            <router-link
              v-can="'marketing-assets:read'"
              :to="{ name: 'MarketingAssetDetail', params: { id: item.id } }"
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-muted hover:text-text-active cursor-pointer shadow-xs"
              title="Detail Aset"
            >
              <Eye class="w-3.5 h-3.5" />
            </router-link>
            <button
              v-can="'marketing-assets:update'"
              type="button"
              @click="handleEdit(item.id)"
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-text-muted hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer shadow-xs"
              title="Edit Aset"
            >
              <Edit2 class="w-3.5 h-3.5" />
            </button>
            <button
              v-can="'marketing-assets:delete'"
              type="button"
              @click="handleDelete(item.id)"
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-text-muted hover:text-red-600 dark:hover:text-red-400 cursor-pointer shadow-xs"
              title="Nonaktifkan Aset"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Form Modal Dialog (Create/Edit) -->
      <MarketingAssetFormModal
        v-model="showFormModal"
        :asset-id="selectedAssetId"
        @saved="refreshAfterSave"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import Badge from '@/components/ui/Badge.vue';
import MarketingAssetStats from './components/MarketingAssetStats.vue';
import MarketingAssetFormModal from './components/MarketingAssetFormModal.vue';
import { useMarketingAsset } from './composables/useMarketingAsset';
import { Alert } from '@/plugins/sweetalert';
import { FilterIcon } from '@/icons';
import { Plus, Download, Eye, Edit2, Trash2 } from 'lucide-vue-next';

const { filters, store, handlePageChange, handleExport, refreshAfterSave } = useMarketingAsset();

const showFormModal = ref(false);
const selectedAssetId = ref(null);

// ── Filter modal ─────────────────────────────────────────────────────────────
const showFilter = ref(false);
const localFilters = reactive({
  search: '',
  condition: '',
  locationId: '',
});

const hasActiveFilters = computed(() => !!(filters.search || filters.condition || filters.locationId));

const isModalDirty = computed(() => {
  return (
    localFilters.search !== filters.search ||
    localFilters.condition !== filters.condition ||
    localFilters.locationId !== filters.locationId
  );
});

const filterSchema = computed(() => [
  {
    label: 'Cari Data',
    key: 'search',
    type: 'text',
    placeholder: 'Cari kode aset, nama barang...',
  },
  {
    label: 'Kondisi',
    key: 'condition',
    type: 'select',
    options: [
      { label: 'Semua Kondisi', value: '' },
      { label: 'Baik', value: 'baik' },
      { label: 'Rusak', value: 'rusak' },
      { label: 'Hilang', value: 'hilang' },
    ],
  },
  {
    label: 'Lokasi',
    key: 'locationId',
    type: 'searchable-select',
    master: 'locations',
    placeholder: 'Semua Lokasi',
  },
]);

watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.search = filters.search;
    localFilters.condition = filters.condition;
    localFilters.locationId = filters.locationId;
  }
});

const applyFiltersFromModal = () => {
  filters.search = localFilters.search;
  filters.condition = localFilters.condition;
  filters.locationId = localFilters.locationId;
  showFilter.value = false;
};

const handleResetFilter = () => {
  localFilters.search = '';
  localFilters.condition = '';
  localFilters.locationId = '';
  filters.search = '';
  filters.condition = '';
  filters.locationId = '';
  showFilter.value = false;
};

const statusTabs = [
  { key: '', label: 'Semua Status' },
  { key: 'true', label: 'Aktif' },
  { key: 'false', label: 'Tidak Aktif' },
];

const handleStatusTabClick = (statusKey) => {
  filters.isActive = statusKey;
};



// ── Kolom tabel ─────────────────────────────────────────────────────────────
const tableColumns = [
  { key: 'no', label: 'No', width: '60px' },
  { key: 'codeAsset', label: 'Kode Aset', width: '180px' },
  { key: 'goodName', label: 'Nama Barang' },
  { key: 'locationName', label: 'Lokasi' },
  { key: 'picName', label: 'PIC', hideOnMobile: true },
  { key: 'condition', label: 'Kondisi', width: '120px' },
  { key: 'isActive', label: 'Status', width: '120px' },
  { key: 'action', label: 'Aksi', width: '110px' },
];

// ── Badge helpers ────────────────────────────────────────────────────────────
const conditionBadgeColor = (c) => {
  const map = {
    baik: 'success',
    rusak: 'error',
    hilang: 'neutral',
  };
  return map[c] || 'neutral';
};

const conditionLabel = (c) => ({ baik: 'Baik', rusak: 'Rusak', hilang: 'Hilang' }[c] || c);

// ── Actions ──────────────────────────────────────────────────────────────────
const handleCreate = () => {
  selectedAssetId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedAssetId.value = id;
  showFormModal.value = true;
};

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm(
    'Nonaktifkan Aset?',
    'Aset akan dinonaktifkan (soft delete). Anda bisa mengaktifkannya kembali nanti.'
  );
  if (!confirmed) return;
  try {
    await store.deleteAsset(id);
    await refreshAfterSave();
    Alert.toast('Aset telah dinonaktifkan.', 'success');
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  }
};

const handleExportAsset = async () => {
  const confirmed = await Alert.confirmExport(
    'Apakah Anda setuju untuk export data aset marketing?',
    'Sistem akan mengunduh data aset marketing sesuai filter yang aktif'
  );
  if (!confirmed) return;
  try {
    await handleExport();
    Alert.toast('File data aset berhasil diunduh ke perangkat Anda', 'success');
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat mengunduh file data aset';
    if (error.response?.data instanceof Blob) {
      try {
        const json = JSON.parse(await error.response.data.text());
        if (json.message) errorMessage = json.message;
      } catch (e) {
        // biarkan pesan default
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    Alert.toast(errorMessage, 'error');
  }
};

const formatDate = (d) => {
  if (!d) return '';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
};
</script>

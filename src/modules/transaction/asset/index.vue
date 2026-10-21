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
            placeholder="Cari kode aset, nama barang, lokasi..."
            class="w-full pl-9 pr-4 bg-white dark:bg-gray-900 border border-border text-text-active rounded-md outline-none text-sm placeholder:text-text-placeholder focus:border-brand-500 transition-all h-10"
            @keyup.enter="fetchData(1, true)"
          />
        </div>

        <!-- Actions Group -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Export Excel button -->
          <ActionButton @click="handleExportAsset">
            <Download class="w-4 h-4" />
            <span class="hidden sm:inline">Export CSV</span>
          </ActionButton>

          <!-- Add Asset Button (Glossy Black) -->
          <GlossyButton
            v-can="'assets:create'"
            @click="handleCreate"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Tambah Aset</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Filters Modal -->
      <FilterModal
        v-model="showFilter"
        title="Filter Aset"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        @apply="applyFilters"
        @reset="handleReset"
      />

      <!-- ── Stats / Metric Cards ──────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3" v-if="assetStore.stats">
        <StatsCard
          :icon="Monitor"
          icon-color="text-[#444] dark:text-gray-300"
          heading="Total Aset"
          :value="assetStore.stats.total || 0"
          class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
        />
        <StatsCard
          :icon="CheckCircle"
          icon-color="text-[#444] dark:text-gray-300"
          heading="Kondisi Baik"
          :value="assetStore.stats.by_condition?.good || 0"
          class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
        />
        <StatsCard
          :icon="Wrench"
          icon-color="text-[#444] dark:text-gray-300"
          heading="Dalam Perbaikan"
          :value="assetStore.stats.by_condition?.service || 0"
          class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
        />
        <StatsCard
          :icon="AlertTriangle"
          icon-color="text-[#444] dark:text-gray-300"
          heading="Rusak"
          :value="assetStore.stats.by_condition?.broken || 0"
          class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
        />
        <StatsCard
          :icon="Tag"
          icon-color="text-[#444] dark:text-gray-300"
          heading="Terjual"
          :value="assetStore.stats.by_condition?.sold || 0"
          class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
        />
      </div>

      <!-- ── Data Table ──────────────────────────────────────── -->
      <DataTable
        :columns="tableColumns"
        :data="assetStore.assets"
        :loading="assetStore.isLoading"
        :server-side="true"
        :total-items="assetStore.pagination.totalData"
        :current-page="assetStore.pagination.currentPage"
        :items-per-page="assetStore.pagination.dataPerPage"
        permission-prefix="assets"
        title="Daftar Aset"
        subtitle="Manajemen dan monitoring aset inventaris perusahaan"
        @detail="(item) => router.push({ name: 'AssetDetail', params: { id: item.id } })"
        @edit="(item) => handleEdit(item.id)"
        @delete="(item) => handleDelete(item.id)"
        @update:current-page="handlePageChange"
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
                filters.isActive === tab.key
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
          {{ ((Math.max(1, Number(assetStore.pagination?.currentPage || assetStore.pagination?.page || 1)) - 1) * Number(assetStore.pagination?.dataPerPage || assetStore.pagination?.limit || 10)) + index + 1 }}
        </template>

        <!-- Kode Aset + tanggal perolehan -->
        <template #cell-codeAsset="{ item }">
          <div class="flex flex-col">
            <span class="font-medium text-text-active leading-tight">
              {{ item.codeAsset }}
              <span
                v-if="item.tipe === 'opening' || item.tipe === 'parfum'"
                class="ml-1.5 inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 text-[10px] font-semibold rounded-full uppercase tracking-wide align-middle"
              >
                {{ item.tipe === 'parfum' ? 'Parfum' : 'Opening' }}
              </span>
            </span>
            <span class="text-xs text-text-muted mt-0.5">
              {{ item.goodName && item.goodName !== '-' ? item.goodName : item.dateAcquiredFormatted }}
            </span>
          </div>
        </template>

        <!-- Kondisi badge -->
        <template #cell-condition="{ item }">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize whitespace-nowrap',
              conditionBadgeClass(item.condition)
            ]"
          >
            {{ conditionLabel(item.condition) }}
          </span>
        </template>

        <!-- Status badge -->
        <template #cell-isActive="{ item }">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider',
              item.isActive
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
            ]"
          >
            {{ item.isActive ? 'Aktif' : 'Tidak Aktif' }}
          </span>
        </template>
      </DataTable>

      <!-- Asset Form Modal Dialog -->
      <AssetFormModal
        v-model="showFormModal"
        :asset-id="selectedAssetId"
        @saved="refreshAfterSave"
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
import ActionButton from '@/components/ui/ActionButton.vue';
import StatsCard from '@/components/ui/StatsCard.vue';
import AssetFormModal from './components/AssetFormModal.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import { useAsset } from './composables/useAsset';
import { Alert } from '@/plugins/sweetalert';
import { FilterIcon } from '@/icons';
import {
  Search, Plus, CheckCircle, Wrench, AlertTriangle,
  Monitor, Download, Tag
} from 'lucide-vue-next';

const router = useRouter();
const { filters, assetStore, handlePageChange, resetFilters, handleExport, fetchData, refreshAfterSave } = useAsset();

const showFormModal = ref(false);
const selectedAssetId = ref(null);

const statusTabs = [
  { key: '', label: 'Semua Status' },
  { key: 'true', label: 'Aktif' },
  { key: 'false', label: 'Tidak Aktif' },
];

const stokOpeningTabs = [
  { key: 'semua', label: 'Semua' },
  { key: 'biasa', label: 'Aset Biasa' },
  { key: 'opening', label: 'Aset Stok Opening' },
  { key: 'parfum', label: 'Aset Parfum' },
];

const handleStatusTabClick = (statusKey) => {
  filters.isActive = statusKey;
};

// ── Filter modal ────────────────────────────────────────────────────────────
const showFilter = ref(false);

const localFilters = reactive({
  locationId: '',
  divisionId: '',
  isStokOpening: 'semua',
  dateFrom: '',
  dateTo: '',
  condition: '',
});

const filterSchema = computed(() => [
  {
    label: 'Cari Data',
    key: 'search',
    type: 'text',
    placeholder: 'Cari kode aset, nama barang, lokasi...'
  },
  {
    label: 'Lokasi',
    key: 'locationId',
    type: 'searchable-select',
    master: 'locations',
    placeholder: 'Semua Lokasi'
  },
  {
    label: 'Divisi',
    key: 'divisionId',
    type: 'searchable-select',
    master: 'divisions',
    placeholder: 'Semua Divisi'
  },
  {
    label: 'Jenis Aset',
    key: 'isStokOpening',
    type: 'select',
    options: stokOpeningTabs.map(o => ({ label: o.label, value: o.key }))
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
  },
  {
    label: 'Kondisi',
    key: 'condition',
    type: 'select',
    options: [
      { label: 'Semua Kondisi', value: '' },
      { label: 'Baik', value: 'good' },
      { label: 'Servis', value: 'service' },
      { label: 'Rusak', value: 'broken' },
      { label: 'Salah Input', value: 'incorrect' },
      { label: 'Terjual', value: 'sold' }
    ]
  }
]);

const hasActiveFilters = computed(() => {
  return !!(
    localFilters.locationId ||
    localFilters.divisionId ||
    localFilters.dateFrom ||
    localFilters.dateTo ||
    localFilters.condition ||
    (localFilters.isStokOpening && localFilters.isStokOpening !== 'semua')
  );
});

watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.locationId = filters.locationId;
    localFilters.divisionId = filters.divisionId;
    localFilters.isStokOpening = filters.isStokOpening;
    localFilters.dateFrom = filters.dateFrom;
    localFilters.dateTo = filters.dateTo;
    localFilters.condition = filters.condition;
  }
});

const applyFilters = () => {
  filters.locationId = localFilters.locationId;
  filters.divisionId = localFilters.divisionId;
  filters.isStokOpening = localFilters.isStokOpening;
  filters.dateFrom = localFilters.dateFrom;
  filters.dateTo = localFilters.dateTo;
  filters.condition = localFilters.condition;
  showFilter.value = false;
};

const handleReset = () => {
  resetFilters();
  localFilters.locationId = '';
  localFilters.divisionId = '';
  localFilters.isStokOpening = 'semua';
  localFilters.dateFrom = '';
  localFilters.dateTo = '';
  localFilters.condition = '';
  showFilter.value = false;
};



const handleExportAsset = async () => {
  const confirmed = await Alert.confirmExport(
    'Apakah Anda setuju untuk export data aset?',
    'Sistem akan mengunduh data aset dari monitoring aset'
  );
  if (confirmed) {
    try {
      await handleExport();
      Alert.toast('Berhasil export data aset', 'File data aset berhasil diunduh ke perangkat Anda', 'success');
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan saat mengunduh file data aset';
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
      Alert.toast('Gagal export data aset', errorMessage, 'error');
    }
  }
};

const handleCreate = () => {
  selectedAssetId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedAssetId.value = id;
  showFormModal.value = true;
};

const tableColumns = [
  { key: 'no',              label: 'No',              width: '60px'  },
  { key: 'codeAsset',       label: 'Kode Aset',       width: '180px' },
  { key: 'goodName',        label: 'Nama Barang' },
  { key: 'merk',            label: 'Merk',            hideOnMobile: true },
  { key: 'locationName',    label: 'Lokasi' },
  { key: 'divisionName',    label: 'Divisi',          hideOnMobile: true },
  { key: 'condition',       label: 'Kondisi' },
  { key: 'isActive',        label: 'Status' },
  { key: 'acquisitionCost', label: 'Nilai Perolehan' },
  { key: 'action',          label: 'Aksi',            width: '110px' },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────
const conditionBadgeClass = (c) => ({
  good: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  service: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  broken: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  incorrect: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  sold: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
}[c] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700');

const conditionLabel = (c) => ({ good: 'Baik', service: 'Servis', broken: 'Rusak', sold: 'Terjual', incorrect: 'Salah Input' }[c] || c || '-');

// ── Actions ───────────────────────────────────────────────────────────────────
const handleDelete = async (id) => {
  const confirmed = await Alert.confirm(
    'Nonaktifkan Aset?',
    'Aset akan dinonaktifkan (soft delete). Anda bisa mengaktifkannya kembali nanti.'
  );
  if (confirmed) {
    try {
      await assetStore.deleteAsset(id);
      Alert.success('Berhasil', 'Aset telah dinonaktifkan.');
      refreshAfterSave();
    } catch (error) {
      Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
    }
  }
};
</script>

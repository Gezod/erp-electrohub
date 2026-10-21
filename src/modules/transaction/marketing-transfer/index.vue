<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">
      <!-- Top Controls Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div class="flex items-center gap-2">
          <span class="text-xs text-text-muted">
            Mutasi stok dan perpindahan aset marketing antar lokasi &amp; PIC
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <!-- Export CSV -->
          <ActionButton @click="handleExportTransfer">
            <Download class="w-4 h-4" />
            <span class="hidden sm:inline">Export CSV</span>
          </ActionButton>

          <GlossyButton v-can="'marketing-transfers:create'" @click="openCreateModal">
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Buat Transfer</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Filter Modal -->
      <FilterModal
        v-model="showFilter"
        title="Filter Transfer Marketing"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        :is-dirty="isModalDirty"
        @apply="applyFiltersFromModal"
        @reset="handleResetFilter"
      />

      <!-- Data Table -->
      <DataTable
        :columns="columns"
        :data="store.transfers"
        :loading="store.isLoading"
        :total-items="store.pagination.totalData"
        :current-page="store.pagination.currentPage"
        :items-per-page="store.pagination.dataPerPage"
        title="Daftar Transfer Marketing"
        subtitle="Mutasi stok dan perpindahan aset marketing antar lokasi &amp; PIC"
        @update:current-page="handlePageChange"
        server-side
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
                activeTab === tab.key
                  ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                  : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
              ]"
            >
              <span>{{ tab.label }}</span>
              <span
                v-if="tab.badge && pendingApprovalCount > 0"
                class="min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-[10px] font-bold"
              >
                {{ pendingApprovalCount > 99 ? '99+' : pendingApprovalCount }}
              </span>
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

        <!-- No. Transfer -->
        <template #cell-code="{ item }">
          <div class="flex flex-col text-left py-1">
            <span class="font-mono font-bold text-sm text-text-active leading-tight">{{ item.code }}</span>
            <span v-if="item.transferDate" class="text-xs text-text-muted mt-0.5">{{ formatDate(item.transferDate) }}</span>
          </div>
        </template>

        <!-- Barang / Tipe -->
        <template #cell-itemName="{ item }">
          <div class="flex flex-col text-left py-1">
            <span class="font-medium text-sm text-text-active leading-tight">{{ item.itemName }}</span>
            <span
              class="text-[10px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded w-fit select-none font-mono"
              :class="item.transferType === 'asset'
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'"
            >
              {{ item.transferType === 'asset' ? 'Transfer Aset' : 'Transfer Stok' }}
            </span>
          </div>
        </template>

        <!-- Qty -->
        <template #cell-qty="{ item }">
          <div class="flex items-center font-mono py-1">
            <span class="font-bold text-sm text-text-active">{{ item.qty || 1 }}</span>
            <span class="text-xs text-text-muted ml-1">{{ item.transferType === 'asset' ? 'Unit' : item.uomName }}</span>
          </div>
        </template>

        <!-- Route (Asal > Tujuan) -->
        <template #cell-route="{ item }">
          <div class="flex items-center gap-2.5 text-left w-full py-1">
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-text-active leading-tight">{{ item.fromLocationName }}</span>
              <span class="text-xs text-text-muted mt-0.5">{{ item.fromPicName }}</span>
            </div>
            <div class="shrink-0 text-text-muted flex items-center justify-center">
              <ArrowRight class="w-4 h-4" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-text-active leading-tight">{{ item.toLocationName }}</span>
              <span class="text-xs text-text-muted mt-0.5">{{ item.toPicName }}</span>
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #cell-status="{ item }">
          <Badge :color="getStatusColor(item.status)" variant="light" class="capitalize text-[11px] font-bold px-2 py-0.5">
            {{ formatStatusLabel(item.status) }}
          </Badge>
        </template>

        <!-- Action -->
        <template #cell-action="{ item }">
          <router-link
            v-can="'marketing-transfers:read'"
            :to="{ name: 'MarketingTransferDetail', params: { id: item.id } }"
            class="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-muted hover:text-text-active cursor-pointer shadow-xs"
            title="Detail Transfer"
          >
            <ChevronRight class="w-4 h-4" />
          </router-link>
        </template>
      </DataTable>

      <!-- Form Modal -->
      <MarketingTransferFormModal
        v-model="showFormModal"
        :preselect-asset-id="preselectAssetId"
        @saved="fetchData(1)"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import Badge from '@/components/ui/Badge.vue';
import MarketingTransferFormModal from './components/MarketingTransferFormModal.vue';
import { useMarketingTransfer } from './composables/useMarketingTransfer';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { Alert } from '@/plugins/sweetalert';
import { FilterIcon } from '@/icons';
import { Plus, ChevronRight, ArrowRight, Download } from 'lucide-vue-next';

const { filters, store, fetchData, handleExport, handlePageChange, resetFilters } = useMarketingTransfer();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const canFilterAllPic = computed(
  () =>
    authStore.user?.is_superadmin ||
    authStore.user?.isAdmin ||
    (authStore.privileges || []).includes('marketing-transfers:read:all'),
);

const canApprove = computed(
  () =>
    authStore.user?.isAdmin ||
    authStore.user?.is_superadmin ||
    authStore.hasPrivilege('marketing-transfers:approve'),
);

const showFormModal = ref(false);
const preselectAssetId = ref(null);

const statusTabs = computed(() => [
  { key: '', label: 'Semua Status' },
  ...(canApprove.value ? [{ key: 'approval', label: 'Perlu Approval', badge: true }] : []),
  { key: 'diajukan', label: 'Diajukan' },
  { key: 'disetujui', label: 'Disetujui' },
  { key: 'dikirim', label: 'Dikirim' },
  { key: 'diterima', label: 'Diterima' },
]);

const activeTab = computed(() => (filters.needsApproval ? 'approval' : filters.status || ''));

const pendingApprovalCount = computed(() => store.stats?.pending_approval_count || 0);

const columns = [
  { key: 'no', label: 'No', width: '60px' },
  { key: 'code', label: 'No. Transfer', width: '180px' },
  { key: 'itemName', label: 'Barang / Aset', width: '220px' },
  { key: 'qty', label: 'Jumlah (Qty)', width: '120px' },
  { key: 'route', label: 'Alur Transfer (Asal > Tujuan)' },
  { key: 'status', label: 'Status', width: '150px' },
  { key: 'action', label: 'Aksi', width: '80px' },
];

// ── Filter Modal & Schema ───────────────────────────────────────────────────
const showFilter = ref(false);
const localFilters = reactive({
  search: '',
  picId: '',
  dateFrom: '',
  dateTo: '',
});

const hasActiveFilters = computed(() => !!(filters.search || filters.picId || filters.dateFrom || filters.dateTo));

const isModalDirty = computed(() => {
  return (
    localFilters.search !== filters.search ||
    localFilters.picId !== filters.picId ||
    localFilters.dateFrom !== filters.dateFrom ||
    localFilters.dateTo !== filters.dateTo
  );
});

const filterSchema = computed(() => [
  {
    label: 'Cari Data',
    key: 'search',
    type: 'text',
    placeholder: 'Cari kode transfer, barang, atau PIC...',
  },
  ...(canFilterAllPic.value
    ? [
        {
          label: 'Filter PIC',
          key: 'picId',
          type: 'searchable-select',
          master: 'employees',
          placeholder: 'Semua PIC',
        },
      ]
    : []),
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

watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.search = filters.search;
    localFilters.picId = filters.picId;
    localFilters.dateFrom = filters.dateFrom;
    localFilters.dateTo = filters.dateTo;
  }
});

const applyFiltersFromModal = () => {
  filters.search = localFilters.search;
  filters.picId = localFilters.picId;
  filters.dateFrom = localFilters.dateFrom;
  filters.dateTo = localFilters.dateTo;
  showFilter.value = false;
};

const handleResetFilter = () => {
  resetFilters();
  localFilters.search = '';
  localFilters.picId = '';
  localFilters.dateFrom = '';
  localFilters.dateTo = '';
  showFilter.value = false;
};

const handleStatusTabClick = (statusKey) => {
  if (statusKey === 'approval') {
    filters.needsApproval = true;
    filters.status = '';
  } else {
    filters.needsApproval = false;
    filters.status = statusKey;
  }
};

const getStatusColor = (s) => {
  const map = {
    diajukan: 'neutral',
    disetujui: 'info',
    ditolak: 'error',
    dikirim: 'warning',
    diterima: 'success',
    dibatalkan: 'error',
  };
  return map[s] || 'neutral';
};

const formatStatusLabel = (s) => {
  if (!s) return '-';
  return s.replace(/_/g, ' ');
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
};

const openCreateModal = () => {
  preselectAssetId.value = null;
  showFormModal.value = true;
};

const handleExportTransfer = async () => {
  const confirmed = await Alert.confirmExport(
    'Apakah Anda setuju untuk export data transfer marketing?',
    'Sistem akan mengunduh data transfer marketing sesuai filter yang aktif',
  );
  if (!confirmed) return;
  try {
    await handleExport();
    Alert.toast('File data transfer berhasil diunduh ke perangkat Anda', 'success');
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat mengunduh file data transfer';
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

onMounted(() => {

  // Preselect dari halaman detail aset jika ada query param
  const { assetId } = route.query;
  if (assetId) {
    preselectAssetId.value = String(assetId);
    showFormModal.value = true;
    router.replace({ name: 'MarketingTransferList' });
  }
});
</script>

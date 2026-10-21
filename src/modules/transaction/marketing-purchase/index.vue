<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">
      <!-- ── Top Controls Bar ──────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full select-none">
        <!-- Search Input -->
        <div class="relative w-full sm:w-80 group">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-500 transition-colors pointer-events-none" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Cari kode purchase, vendor, PIC..."
            class="w-full pl-9 pr-4 bg-white dark:bg-gray-900 border border-border text-text-active rounded-md outline-none text-sm placeholder:text-text-placeholder focus:border-brand-500 transition-all h-10"
            @keyup.enter="applyFilters"
          />
        </div>

        <!-- Actions Group -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Active filter indicator -->
          <span v-if="hasActiveFilters" class="text-xs text-brand-500 font-medium flex items-center gap-1 mr-1 select-none">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block"></span>
            Filter aktif
          </span>
            <ActionButton @click="handleExportPurchase">
              <Download class="w-4 h-4" />
              <span class="hidden sm:inline">Export CSV</span>
            </ActionButton>

          <!-- Buat Purchase Button (Glossy) -->
          <GlossyButton
            v-can="'marketing-purchases:create'"
            @click="handleCreate"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Buat Purchase</span>
          </GlossyButton>
        </div>
      </div>

<!-- ── Stats Cards ──────────────────────────────────────────── -->
<div v-if="stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">

  <!-- Pembelian Hari Ini -->
  <StatsCard
    :icon="CalendarCheck"
    icon-color="text-[#444] dark:text-gray-300"
    heading="Pembelian Hari Ini"
    :value="stats.today_count || 0"
    subtitle="Kalender hari ini"
    class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
  />

  <!-- Total Nilai Pembelian -->
  <StatsCard
    :icon="DollarSign"
    icon-color="text-[#444] dark:text-gray-300"
    heading="Total Nilai Pembelian"
    unit="Rp"
    :formatted-value="formatNumber(stats.total_amount)"
    subtitle="30 hari terakhir"
    class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
  />

  <!-- Selesai -->
  <StatsCard
    :icon="ShieldCheck"
    icon-color="text-[#444] dark:text-gray-300"
    heading="Selesai"
    :value="stats.by_status?.selesai || 0"
    subtitle="Transaksi berhasil"
    class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
  />

  <!-- Menunggu Diterima -->
  <StatsCard
    :icon="Calendar"
    icon-color="text-[#444] dark:text-gray-300"
    heading="Menunggu Diterima"
    :value="(stats.by_status?.draft || 0) + (stats.by_status?.diajukan || 0) + (stats.by_status?.disetujui || 0)"
    subtitle="Draft, Diajukan &amp; Disetujui"
    class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
  />
</div>

      <!-- ── Filter Modal ──────────────────────────────────────────── -->
      <FilterModal
        v-model="showFilter"
        title="Filter Purchase Marketing"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        :is-dirty="isModalDirty"
        @apply="applyFiltersFromModal"
        @reset="handleResetFilter"
      />

      <!-- ── Data Table ────────────────────────────────────────────── -->
      <DataTable
        title="Daftar Purchase Marketing"
        subtitle="Pemesanan &amp; pengadaan barang operasional marketing"
        :columns="tableColumns"
        :data="purchases"
        :loading="isLoading"
        :server-side="true"
        :total-items="pagination.totalData"
        :current-page="pagination.currentPage"
        :items-per-page="pagination.dataPerPage"
        @update:current-page="changePage"
      >
        <template #header-actions>
          <!-- Status Tabs (+ Perlu Approval) -->
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
          {{ ((Math.max(1, Number(pagination.currentPage || pagination.page || 1)) - 1) * Number(pagination.dataPerPage || pagination.limit || 10)) + index + 1 }}
        </template>

        <!-- Kode Purchase & Request -->
        <template #cell-code="{ item }">
          <div class="flex flex-col">
            <router-link
              :to="{ name: 'MarketingPurchaseDetail', params: { id: item.id } }"
              class="font-medium text-sm text-text-active hover:text-brand-500 transition-colors leading-tight"
            >
              {{ item.code }}
            </router-link>
            <span v-if="item.requestCode" class="text-xs text-text-muted mt-0.5">
              dari {{ item.requestCode }}
            </span>
          </div>
        </template>

        <!-- Total Nilai Pembelian -->
        <template #cell-priceFinalTotal="{ item }">
          <span class="font-medium text-sm text-text-active font-mono">
            Rp {{ formatNumber(item.priceFinalTotal || item.priceTotal) }}
          </span>
        </template>

        <!-- Status -->
        <template #cell-status="{ item }">
          <Badge :color="statusColor(item.status)" variant="light" class="capitalize text-[11px] font-bold px-2 py-0.5">
            {{ item.status }}
          </Badge>
        </template>

        <!-- Aksi -->
        <template #cell-action="{ item }">
          <div class="flex items-center justify-end gap-1.5">
            <router-link
              v-can="'marketing-purchases:read'"
              :to="{ name: 'MarketingPurchaseDetail', params: { id: item.id } }"
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-muted hover:text-text-active cursor-pointer shadow-xs"
              title="Detail Purchase"
            >
              <Eye class="w-3.5 h-3.5" />
            </router-link>
            <button
              v-if="['draft', 'diajukan'].includes(item.status)"
              v-can="'marketing-purchases:update'"
              type="button"
              @click="handleEdit(item.id)"
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-text-muted hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer shadow-xs"
              title="Edit Purchase"
            >
              <Edit2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Form Modal Dialog (Create/Edit) -->
      <MarketingPurchaseFormModal
        v-model="showFormModal"
        :purchase-id="selectedPurchaseId"
        @saved="reload"
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
import StatsCard from '@/components/ui/StatsCard.vue';
import Badge from '@/components/ui/Badge.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import MarketingPurchaseFormModal from './components/MarketingPurchaseFormModal.vue';
import { useMarketingPurchase } from './composables/useMarketingPurchase';
import { PURCHASE_WORKFLOW_STEPS } from './marketingPurchase.constants';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { LocationService } from '@/modules/master/locations/location.service';
import { Alert } from '@/plugins/sweetalert';
import { FilterIcon } from '@/icons';
import {
  ShoppingCart, Plus, DollarSign, Calendar, ShieldCheck,
  Search, Eye, Edit2, Download, CalendarCheck, CalendarRange, ListChecks
} from 'lucide-vue-next';

const {
  filters,
  purchases,
  stats,
  pagination,
  isLoading,
  store,
  reload,
  applyFilters,
  changePage,
  resetFilters,
} = useMarketingPurchase();

const authStore = useAuthStore();
const locationOptions = ref([]);

const showFormModal = ref(false);
const selectedPurchaseId = ref(null);

const canApprove = computed(() =>
  authStore.user?.isAdmin ||
  authStore.user?.is_superadmin ||
  authStore.hasPrivilege('marketing-purchases:approve_level_a')
);

const pendingApprovalCount = computed(() => stats.value?.pending_approval_count || 0);

// ── Breakdown Status Pembelian (dari stats.by_status — hasil groupBy backend, non-batal) ──
const PURCHASE_STATUS_LABELS = {
  draft: 'Draft',
  diajukan: 'Diajukan',
  disetujui: 'Disetujui',
  diterima: 'Diterima',
  selesai: 'Selesai',
};
const getStatusLabel = (s) => PURCHASE_STATUS_LABELS[s] || s;

const PURCHASE_STATUS_COLORS = {
  draft: 'rgb(156, 163, 175)',     // gray-400
  diajukan: 'rgb(245, 158, 11)',   // amber-500
  disetujui: 'rgb(59, 130, 246)',  // blue-500
  diterima: 'rgb(168, 85, 247)',   // purple-500
  selesai: 'rgb(34, 197, 94)',     // green-500
};
const statusBarColor = (s) => PURCHASE_STATUS_COLORS[s] || 'rgb(148, 163, 184)';

const statusBreakdownList = computed(() => {
  const statusMap = stats.value?.by_status || {};
  const entries = Object.entries(statusMap).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  if (!total) return [];

  return entries
    .map(([key, count]) => ({
      key,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
});

// ── Status Tabs ─────────────────────────────────────────────────────────────
const statusTabs = computed(() => [
  { key: '', label: 'Semua' },
  ...(canApprove.value ? [{ key: 'approval', label: 'Perlu Approval', badge: true }] : []),
  ...PURCHASE_WORKFLOW_STEPS,
]);

const activeTab = computed(() =>
  filters.needs_approval ? 'approval' : (filters.status || '')
);

const handleStatusTabClick = (key) => {
  if (key === 'approval') {
    filters.needs_approval = true;
    filters.status = '';
  } else {
    filters.needs_approval = false;
    filters.status = key;
  }
  localFilters.status = filters.status;
  applyFilters();
};

// ── Table Columns ───────────────────────────────────────────────────────────
const tableColumns = [
  { key: 'no', label: 'No', width: '60px' },
  { key: 'code', label: 'Kode Purchase' },
  { key: 'vendorName', label: 'Vendor / Toko', hideOnMobile: true },
  { key: 'locationName', label: 'Lokasi', hideOnMobile: true },
  { key: 'picName', label: 'PIC Marketing', hideOnMobile: true },
  { key: 'priceFinalTotal', label: 'Total Nilai' },
  { key: 'status', label: 'Status', width: '130px' },
  { key: 'action', label: 'Aksi', width: '90px', align: 'right' },
];

const statuses = ['draft', 'diajukan', 'disetujui', 'diterima', 'selesai', 'batal'];

const statusColor = (s) => ({
  draft: 'light',
  diajukan: 'warning',
  disetujui: 'info',
  diterima: 'info',
  selesai: 'success',
  batal: 'error',
}[s] || 'light');

const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n || 0);

// ── Filter Modal ────────────────────────────────────────────────────────────
const showFilter = ref(false);
const localFilters = reactive({
  search: '',
  status: '',
  location_id: '',
  source_type: '',
  date_from: '',
  date_to: '',
  payment: '',
});

const hasActiveFilters = computed(() => !!(
  filters.search || filters.status || filters.location_id ||
  filters.source_type || filters.date_from || filters.date_to || filters.payment
));

const isModalDirty = computed(() => {
  return (
    localFilters.search !== filters.search ||
    localFilters.status !== filters.status ||
    localFilters.location_id !== filters.location_id ||
    localFilters.source_type !== filters.source_type ||
    localFilters.date_from !== filters.date_from ||
    localFilters.date_to !== filters.date_to ||
    localFilters.payment !== filters.payment
  );
});

const filterSchema = computed(() => [
  {
    label: 'Cari Data',
    key: 'search',
    type: 'text',
    placeholder: 'Kode purchase, vendor...',
  },
  {
    label: 'Status',
    key: 'status',
    type: 'select',
    options: [
      { label: 'Semua Status', value: '' },
      ...statuses.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s })),
    ],
  },
  {
    label: 'Lokasi',
    key: 'location_id',
    type: 'select',
    searchable: true,
    placeholder: 'Semua Lokasi',
    options: [
      { label: 'Semua Lokasi', value: '' },
      ...locationOptions.value.map((l) => ({ label: l.location_name, value: l.id })),
    ],
  },
  {
    label: 'Sumber',
    key: 'source_type',
    type: 'select',
    options: [
      { label: 'Semua Sumber', value: '' },
      { label: 'Dari Pengajuan', value: 'dari_pengajuan' },
      { label: 'Tanpa Pengajuan', value: 'tanpa_pengajuan' },
    ],
  },
  {
    label: 'Pembayaran',
    key: 'payment',
    type: 'select',
    options: [
      { label: 'Semua Pembayaran', value: '' },
      { label: 'Kas Marketing', value: 'kas_marketing' },
      { label: 'Finance', value: 'finance' },
    ],
  },
  {
    label: 'Dari Tanggal',
    key: 'date_from',
    type: 'date',
    placeholder: 'dd/mm/yyyy',
  },
  {
    label: 'Sampai Tanggal',
    key: 'date_to',
    type: 'date',
    placeholder: 'dd/mm/yyyy',
  },
]);

watch(showFilter, (isOpen) => {
  if (isOpen) {
    Object.assign(localFilters, {
      search: filters.search,
      status: filters.status,
      location_id: filters.location_id,
      source_type: filters.source_type,
      date_from: filters.date_from,
      date_to: filters.date_to,
      payment: filters.payment,
    });
  }
});

const buildListParams = (page) => ({
  page, limit: store.pagination.dataPerPage || 10,
  search: filters.search || undefined, status: filters.status || undefined,
  location_id: filters.location_id || undefined, source_type: filters.source_type || undefined,
  date_from: filters.date_from || undefined, date_to: filters.date_to || undefined,
  payment: filters.payment || undefined,
  needs_approval: filters.needs_approval ? 'true' : undefined,
});

const fetchData = (page = 1) => {
  store.fetchPurchases(buildListParams(page));
};

const fetchLocationOptions = async () => {
  try {
    const res = await LocationService.getAll({ limit: 100 });
    locationOptions.value = res.data || [];
  } catch (err) {
    console.error('Gagal memuat daftar lokasi:', err);
  }
};

const handleExportPurchase = async () => {
  const confirmed = await Alert.confirmExport(
    'Apakah Anda setuju untuk export data purchase marketing?',
    'Sistem akan mengunduh data purchase marketing sesuai filter yang aktif',
  );
  if (!confirmed) return;
  try {
    await store.exportToCSV(buildListParams(1));
    Alert.toast('File data purchase berhasil diunduh ke perangkat Anda', 'success');
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat mengunduh file data purchase';
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

const applyFiltersFromModal = () => {
  Object.assign(filters, {
    search: localFilters.search,
    status: localFilters.status,
    location_id: localFilters.location_id,
    source_type: localFilters.source_type,
    date_from: localFilters.date_from,
    date_to: localFilters.date_to,
    payment: localFilters.payment,
  });
  if (localFilters.status) filters.needs_approval = false;
  showFilter.value = false;
  applyFilters();
};

const handleResetFilter = () => {
  Object.assign(localFilters, {
    search: '',
    status: '',
    location_id: '',
    source_type: '',
    date_from: '',
    date_to: '',
    payment: '',
  });
  resetFilters();
  showFilter.value = false;
};

// ── Modal Actions ───────────────────────────────────────────────────────────
const handleCreate = () => {
  selectedPurchaseId.value = null;
  showFormModal.value = true;
};

const handleEdit = (id) => {
  selectedPurchaseId.value = id;
  showFormModal.value = true;
};

onMounted(() => {
  reload(1);
  fetchLocationOptions();
});
</script>

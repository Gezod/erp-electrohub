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
            placeholder="Cari kode pembelian, vendor, PIC..."
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

          <!-- Export CSV button -->
          <ActionButton @click="handleExport">
            <Download class="w-4 h-4" />
            <span class="hidden sm:inline">Export CSV</span>
          </ActionButton>

          <!-- Add Purchase Button (Glossy Black) -->
          <GlossyButton
            v-can="'purchases:create'"
            @click="handleCreate"
          >
            <Plus class="w-4 h-4 text-white relative z-10" />
            <span class="relative z-10">Purchase Baru</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Filters Modal -->
      <FilterModal
        v-model="showFilter"
        title="Filter Pembelian"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        @apply="applyFiltersFromModal"
        @reset="handleReset"
      />

      <!-- ── Stats Cards ──────────────────────────────────────── -->
      <div v-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
        <StatsCard
          :icon="PackageSearch"
          icon-color="text-[#444] dark:text-gray-300"
          heading="Total Pembelian"
          :value="totalPurchaseCount"
          :subtitle="dashboardScopeLabel"
          class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
        />

        <StatsCard
          :icon="DollarSign"
          icon-color="text-[#444] dark:text-gray-300"
          heading="Total Nilai Pembelian"
          unit="Rp"
          :formatted-value="formatNumber(stats.total_amount)"
          :subtitle="dashboardScopeLabel"
          class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
        />

        <StatsCard
          :icon="Calendar"
          icon-color="text-[#444] dark:text-gray-300"
          heading="Menunggu Diterima"
          :value="(stats.by_status?.draft || 0) + (stats.by_status?.diajukan || 0)"
          subtitle="Draft & Diajukan"
          class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
        />

        <StatsCard
          :icon="ShieldCheck"
          icon-color="text-[#444] dark:text-gray-300"
          heading="Selesai"
          :value="stats.by_status?.selesai || 0"
          subtitle="Transaksi berhasil"
          class="rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xs"
        />
      </div>

      <!-- ── Data Table ──────────────────────────────────────── -->
      <DataTable
        :columns="tableColumns"
        :data="purchases"
        :loading="isLoading"
        :server-side="true"
        :total-items="pagination.totalData"
        :current-page="pagination.currentPage"
        :items-per-page="pagination.dataPerPage"
        title="Daftar Pembelian"
        subtitle="Manajemen Pengadaan & Inventori • GA"
        @update:current-page="changePage"
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
          {{ ((Math.max(1, Number(pagination.currentPage || pagination.page || 1)) - 1) * Number(pagination.dataPerPage || pagination.limit || 10)) + index + 1 }}
        </template>

        <!-- Kode & Tanggal -->
        <template #cell-code="{ item }">
          <div class="flex flex-col">
            <span class="font-medium text-text-active leading-tight">{{ item.code }}</span>
            <span class="text-xs text-text-muted mt-0.5">{{ formatDate(item.createdAt) }}</span>
          </div>
        </template>

        <!-- Sumber & Tipe -->
        <template #cell-sourceType="{ item }">
          <div class="flex flex-col items-start gap-1">
            <span
              :class="[
                'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
                sourceTypeBadgeClass(item.sourceType)
              ]"
            >
              {{ item.sourceType ? item.sourceType.replace('_', ' ') : '-' }}
            </span>
            <span class="text-[11px] text-text-muted font-medium capitalize">{{ item.purchaseType }}</span>
          </div>
        </template>

        <!-- Vendor / Toko -->
        <template #cell-vendorName="{ item }">
          <div class="flex flex-col">
            <span class="font-medium text-text-active leading-tight">{{ item.vendorName || '-' }}</span>
            <span class="text-xs text-text-muted mt-0.5">PIC: {{ item.picGaName || '-' }}</span>
          </div>
        </template>

        <!-- Total Nilai Awal -->
        <template #cell-priceTotal="{ item }">
          <div class="flex flex-col">
            <span class="font-medium text-text-active">Rp {{ formatNumber(item.priceTotal) }}</span>
            <span class="text-[11px] text-text-muted uppercase">{{ item.payment || '-' }}</span>
          </div>
        </template>

        <!-- Total Nilai Akhir -->
        <template #cell-priceFinalTotal="{ item }">
          <div class="flex flex-col">
            <span class="font-medium text-text-active">Rp {{ formatNumber(item.priceFinalTotal) }}</span>
            <span class="text-[11px] text-text-muted uppercase">{{ item.payment || '-' }}</span>
          </div>
        </template>

        <!-- Tanggal Selesai -->
        <template #cell-completedAt="{ item }">
          <span class="text-xs text-text-active">
            {{ item.completedAt ? formatDate(item.completedAt) : '-' }}
          </span>
        </template>

        <!-- Tipe Pembelian (Reguler / Opening / Parfum) -->
        <template #cell-stokOpening="{ item }">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
              item.tipe && item.tipe !== 'biasa'
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
                : 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
            ]"
          >
            {{ PURCHASE_TIPE_OPENING_LABEL[item.tipe] || 'Reguler' }}
          </span>
        </template>

        <!-- Status -->
        <template #cell-status="{ item }">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize whitespace-nowrap',
              statusBadgeClass(item.status)
            ]"
          >
            {{ item.status }}
          </span>
        </template>

        <!-- Aksi -->
        <template #cell-action="{ item }">
          <div class="flex items-center justify-end">
            <router-link
              v-can="'purchases:read'"
              :to="{ name: 'TranPurchaseDetail', params: { id: item.id } }"
              class="p-1.5 rounded-md text-text-muted hover:text-text-active hover:bg-bg-active transition-colors cursor-pointer"
              title="Detail Pembelian"
            >
              <ChevronRight class="w-4 h-4" />
            </router-link>
          </div>
        </template>
      </DataTable>

      <!-- Purchase Form Modal Dialog -->
      <PurchaseFormModal
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
import ActionButton from '@/components/ui/ActionButton.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import StatsCard from '@/components/ui/StatsCard.vue';
import PurchaseFormModal from './components/PurchaseFormModal.vue';
import { usePurchase } from './composables/usePurchase';
import { PURCHASE_WORKFLOW_STEPS, PURCHASE_TIPE_OPENING_OPTIONS, PURCHASE_TIPE_OPENING_LABEL } from './purchase.constants';
import { employeeIsGaDivision } from '@/utils/division';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { FilterIcon } from '@/icons';
import {
  Search, ChevronRight,
  PackageSearch, DollarSign, Calendar, Download,
  ShieldCheck, Plus,
} from 'lucide-vue-next';

const {
  filters,
  purchases,
  stats,
  pagination,
  isLoading,
  purchaseStore,
  reload,
  applyFilters,
  changePage,
  resetFilters,
  handleExport,
} = usePurchase();

const authStore = useAuthStore();
const isSuperAdmin = computed(() => authStore.user?.isAdmin === true || authStore.user?.is_superadmin === true);

const showFormModal = ref(false);
const selectedPurchaseId = ref(null);

const canApprove = computed(() => {
  return isSuperAdmin.value ||
    authStore.hasPrivilege('purchases:approve_level_a') ||
    authStore.hasPrivilege('purchases:approve_level_b');
});

const totalPurchaseCount = computed(() => stats.value?.total_purchases ?? stats.value?.total_this_month ?? 0);
const pendingApprovalCount = computed(() => stats.value?.pending_approval_count || 0);

const dashboardScopeLabel = computed(() => {
  if (filters.needs_approval) return 'Perlu Approval';
  if (!filters.status) return 'Semua status';
  return `Status: ${filters.status.charAt(0).toUpperCase()}${filters.status.slice(1)}`;
});

const handleCreate = () => {
  selectedPurchaseId.value = null;
  showFormModal.value = true;
};

// ── Filter Modal ────────────────────────────────────────────────────────────
const showFilter = ref(false);

const localFilters = reactive({
  search: '',
  status: '',
  tipe: '',
  pic_ga: '',
  date_from: '',
  date_to: '',
  min_amount: '',
  payment: '',
});

const filterSchema = computed(() => [
  {
    label: 'Cari Data',
    key: 'search',
    type: 'text',
    placeholder: 'Kode, vendor, merk...',
  },
  {
    label: 'Pilih Status',
    key: 'status',
    type: 'select',
    options: [
      { label: 'Semua Status', value: '' },
      { label: 'Draft', value: 'draft' },
      { label: 'Diajukan', value: 'diajukan' },
      { label: 'Disetujui', value: 'disetujui' },
      { label: 'Diterima', value: 'diterima' },
      { label: 'Selesai', value: 'selesai' },
      { label: 'Batal', value: 'batal' },
    ],
  },
  {
    label: 'Tipe Pembelian',
    key: 'tipe',
    type: 'select',
    options: PURCHASE_TIPE_OPENING_OPTIONS,
  },
  {
    label: 'Nominal',
    key: 'min_amount',
    type: 'checkbox',
    checkboxLabel: 'Hanya di atas Rp 5.000.000',
  },
  {
    label: 'Pembayaran',
    key: 'payment',
    type: 'select',
    options: [
      { label: 'Semua Pembayaran', value: '' },
      { label: 'Kas GA', value: 'kas_ga' },
      { label: 'Finance', value: 'finance' },
    ],
  },
  ...(isSuperAdmin.value
    ? [
        {
          label: 'PIC GA',
          key: 'pic_ga',
          type: 'searchable-select',
          master: 'employees',
          placeholder: 'Semua PIC',
        },
      ]
    : []),
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

const hasActiveFilters = computed(() => {
  return !!(
    localFilters.search ||
    localFilters.status ||
    localFilters.tipe ||
    localFilters.pic_ga ||
    localFilters.date_from ||
    localFilters.date_to ||
    localFilters.min_amount ||
    localFilters.payment
  );
});

watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.search = filters.search;
    localFilters.status = filters.status;
    localFilters.tipe = filters.tipe;
    localFilters.pic_ga = filters.pic_ga;
    localFilters.date_from = filters.date_from;
    localFilters.date_to = filters.date_to;
    localFilters.min_amount = filters.min_amount;
    localFilters.payment = filters.payment;
  }
});

const applyFiltersFromModal = () => {
  filters.search = localFilters.search;
  filters.status = localFilters.status;
  filters.tipe = localFilters.tipe;
  filters.pic_ga = localFilters.pic_ga;
  filters.date_from = localFilters.date_from;
  filters.date_to = localFilters.date_to;
  filters.min_amount = localFilters.min_amount;
  filters.payment = localFilters.payment;
  if (localFilters.status) filters.needs_approval = false;
  showFilter.value = false;
  applyFilters();
};

const handleReset = () => {
  localFilters.search = '';
  localFilters.status = '';
  localFilters.tipe = '';
  localFilters.pic_ga = '';
  localFilters.date_from = '';
  localFilters.date_to = '';
  localFilters.min_amount = '';
  localFilters.payment = '';
  resetFilters();
  showFilter.value = false;
};

// ── Status Tabs ─────────────────────────────────────────────────────────────
const statusTabs = computed(() => [
  { key: '', label: 'Semua' },
  ...(canApprove.value ? [{ key: 'approval', label: 'Perlu Approval', badge: true }] : []),
  ...PURCHASE_WORKFLOW_STEPS,
]);

const activeTab = computed(() =>
  filters.needs_approval ? 'approval' : filters.status || ''
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

const tableColumns = [
  { key: 'no', label: 'No', width: '60px' },
  { key: 'code', label: 'Kode & Tanggal', width: '180px' },
  { key: 'sourceType', label: 'Sumber & Tipe', hideOnMobile: true },
  { key: 'vendorName', label: 'Vendor / Toko' },
  { key: 'priceTotal', label: 'Total Nilai Awal' },
  { key: 'priceFinalTotal', label: 'Total Nilai Akhir' },
  { key: 'completedAt', label: 'Tanggal Selesai' },
  { key: 'stokOpening', label: 'Tipe Pembelian', align: 'center', width: '130px' },
  { key: 'status', label: 'Status', align: 'center', width: '120px' },
  { key: 'action', label: '', align: 'right', width: '60px' },
];

const statusBadgeClass = (s) => ({
  draft: 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  diajukan: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  disetujui: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
  diterima: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400',
  selesai: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  batal: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
}[s] || 'bg-gray-100 border-gray-200 text-gray-700');

const sourceTypeBadgeClass = (s) => ({
  dari_tiket: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400',
  tanpa_tiket: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
}[s] || 'bg-gray-100 border-gray-200 text-gray-700');

const formatDate = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
};

const formatNumber = (n) => {
  return new Intl.NumberFormat('id-ID').format(n || 0);
};

onMounted(() => {
  reload();
});
</script>

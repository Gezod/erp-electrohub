<template>
  <AdminLayout>
    <div class="mx-auto max-w-(--breakpoint-2xl) space-y-6">

      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <FileText class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">
              Pengajuan Marketing</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">
              Request Toko / Provinsi &bull; Auto-Processor via Store Assignment</p>
          </div>
        </div>
      </div>

      <!-- Controls Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-[16px] select-none">

        <!-- Left Side: Search Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-[8px] flex-1 w-full">
          <div class="relative w-full sm:w-[350px] sm:max-w-full shrink-0 group">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] group-focus-within:text-brand-500 transition-colors pointer-events-none" />
            <input v-model="filters.search" type="text" placeholder="Cari kode pengajuan..." class="w-full pl-[36px] pr-4 bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-gray-800 rounded-[6px] outline-none text-[13px] text-black dark:text-white placeholder:text-[#999] focus:border-brand-500 transition-all h-[40px]"/>
          </div>
        </div>

        <!-- Right Side: Button Group -->
        <div class="flex flex-wrap items-center gap-[8px] w-full lg:w-auto shrink-0">
          <ActionButton @click="handleExportRequest">
            <Download class="w-4 h-4" />
            <span class="hidden sm:inline">Export CSV</span>
          </ActionButton>
          <GlossyButton v-can="'marketing-requests:create'"@click="openCreateModal">
            <Plus class="w-[20px] h-[20px] text-white relative z-10" />
            <span class="relative z-10 text-[13px] font-semibold whitespace-nowrap">Buat Pengajuan</span>
          </GlossyButton>
        </div>
      </div>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Card 1: Pengajuan Hari Ini -->
        <div class="rounded-2xl border border-[#e8e8e8] dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Clock class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <template v-if="isLoadingSummary">
              <div class="h-7 w-12 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse mb-1.5"></div>
              <div class="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
            </template>
            <template v-else>
              <h3 class="text-2xl font-extrabold text-gray-800 dark:text-white leading-none">
                {{ summaryStats.todayCount }}
              </h3>
              <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1.5">
                Pengajuan Hari Ini
              </p>
            </template>
          </div>
        </div>

        <!-- Card 2: Pengajuan Bulan Ini -->
        <div class="rounded-2xl border border-[#e8e8e8] dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20 shrink-0">
            <CalendarRange class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <template v-if="isLoadingSummary">
              <div class="h-7 w-12 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse mb-1.5"></div>
              <div class="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
            </template>
            <template v-else>
              <h3 class="text-2xl font-extrabold text-gray-800 dark:text-white leading-none">
                {{ summaryStats.thisMonthCount }}
              </h3>
              <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1.5">
                Pengajuan Bulan Ini
              </p>
            </template>
          </div>
        </div>

        <!-- Card 3: Breakdown Status -->
        <div class="rounded-2xl border border-[#e8e8e8] dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            Breakdown Status
          </p>

          <!-- Loading skeleton -->
          <div v-if="isLoadingSummary" class="space-y-2.5">
            <div v-for="n in 3" :key="n" class="flex items-center gap-2">
              <div class="h-2.5 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0"></div>
              <div class="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
              <div class="h-2.5 w-6 rounded bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0"></div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="!statusBreakdownList.length" class="text-[12px] text-gray-400 dark:text-gray-500 py-2">
            Belum ada data pengajuan.
          </div>

          <!-- Data -->
          <div v-else class="space-y-2.5">
            <div v-for="status in statusBreakdownList":key="status.key" class="flex items-center gap-2">
              <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 w-24 shrink-0 truncate">
                {{ getStatusLabel(status.key) }}
              </span>
              <div class="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div class="h-full rounded-full transition-all":style="{ width: status.percentage + '%', backgroundColor: statusBarColor(status.key) }"
                ></div>
              </div>
              <span class="text-[10px] font-bold text-gray-700 dark:text-gray-200 w-6 text-right shrink-0">
                {{ status.count }}
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- Filters Modal -->
      <FilterModal v-model="showFilter"
        title="Filter Pengajuan"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveFilters"
        :is-dirty="isModalDirty"
        @apply="applyFiltersFromModal"
        @reset="handleReset"
      />

      <!-- Table Section -->
      <DataTable
        :columns="tableColumns"
        :data="marketingRequestStore.requests"
        :loading="marketingRequestStore.isLoading"
        :server-side="true"
        :total-items="marketingRequestStore.pagination.totalData"
        :current-page="marketingRequestStore.pagination.currentPage"
        :items-per-page="marketingRequestStore.pagination.dataPerPage"
        title="Daftar Pengajuan"
        subtitle="Pengajuan &amp; Permintaan Barang Marketing"
        @update:current-page="handlePageChange"
      >
        <template #header-actions>
          <button
            @click="showFilter = true"
            class="bg-white dark:bg-gray-900 border border-solid border-[#e8e8e8] dark:border-gray-800 text-black dark:text-white rounded-[6px] px-[14px] py-[8px] flex items-center gap-[6px] font-medium text-[14px] sm:text-[16px] h-[40px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 duration-200"
          >
            <FilterIcon class="w-[20px] h-[20px] text-black dark:text-white" />
            <span>Filter</span>
          </button>
        </template>

        <!-- Kode -->
        <template #cell-code="{ item }">
          <router-link
            :to="{ name: 'MarketingRequestDetail', params: { id: item.id } }"
            class="font-bold text-[14px] text-black dark:text-white hover:text-brand-600 hover:underline transition-all whitespace-nowrap leading-[18px]"
          >
            {{ item.code }}
          </router-link>
        </template>

        <!-- Tanggal -->
        <template #cell-dateRequest="{ item }">
          <span class="font-normal text-[14px] text-[#666] dark:text-gray-400 whitespace-nowrap leading-[18px]">
            {{ formatDate(item.dateRequest) }}
          </span>
        </template>

        <!-- Pemohon -->
        <template #cell-requesterName="{ item }">
          <div class="flex items-center py-1 select-none">
            <div class="w-[28px] h-[28px] rounded-full bg-[#acacac]/20 dark:bg-gray-800 flex items-center justify-center text-[12px] font-bold text-gray-600 dark:text-gray-300 shrink-0">
              {{ getInitial(item.requesterName) }}
            </div>
            <span class="font-bold text-[14px] text-black dark:text-white ml-2 whitespace-nowrap">{{ item.requesterName }}</span>
          </div>
        </template>

        <!-- Lokasi -->
        <template #cell-requesterLocationName="{ item }">
          <span class="font-bold text-[14px] text-black dark:text-white leading-[18px]">
            {{ item.requesterLocationName }}
          </span>
        </template>

        <!-- Jumlah Barang -->
        <template #cell-itemCount="{ item }">
          <span class="font-bold text-[14px] text-black dark:text-white leading-[18px] pl-3">
            {{ item.itemCount || 0 }}
          </span>
        </template>

        <!-- Kategori -->
        <template #cell-requestType="{ item }">
          <div
            :class="[
              'rounded-[999px] border border-solid px-[8px] py-[2px] text-[12px] font-medium inline-flex items-center justify-center gap-1 capitalize select-none whitespace-nowrap',
              requestTypeBadgeClass(item.requestType)
            ]"
          >
            {{ requestTypeLabel(item.requestType) }}
          </div>
        </template>

        <!-- Status -->
        <template #cell-status="{ item }">
          <div
            :class="[
              'rounded-[999px] border border-solid px-[8px] py-[2px] text-[12px] font-medium inline-flex items-center justify-center gap-1 capitalize select-none whitespace-nowrap',
              statusBadgeClass(item.status)
            ]"
          >
            <CheckCircle v-if="item.status === 'selesai'" class="w-[12px] h-[12px] shrink-0" />
            <Loader v-else-if="item.status === 'diproses'" class="w-[12px] h-[12px] shrink-0" />
            <Clock v-else-if="item.status === 'menunggu_pemenuhan'" class="w-[12px] h-[12px] shrink-0" />
            <ClipboardList v-else-if="item.status === 'diajukan'" class="w-[12px] h-[12px] shrink-0" />
            <FileText v-else-if="item.status === 'draft'" class="w-[12px] h-[12px] shrink-0" />
            <XCircle v-else-if="item.status === 'ditolak'" class="w-[12px] h-[12px] shrink-0" />
            <X v-else-if="item.status === 'batal'" class="w-[12px] h-[12px] shrink-0" />
            <span>{{ getStatusLabel(item.status) }}</span>
          </div>
        </template>

        <!-- Aksi -->
        <template #cell-action="{ item }">
          <div class="relative flex items-center justify-end pr-2 gap-2">
            <button
              v-if="item.status === 'draft' || item.status === 'diajukan'"
              v-can="'marketing-requests:update'"
              @click="openEditModal(item.id)"
              class="w-[28px] h-[28px] flex items-center justify-center bg-[#e8e8e8]/70 dark:bg-gray-700 rounded-full text-[#444] dark:text-gray-300 hover:bg-[#d8d8d8] dark:hover:bg-gray-600 transition-all cursor-pointer"
              title="Edit Pengajuan"
            >
              <Pencil class="w-[14px] h-[14px]" />
            </button>
            <router-link
              v-can="'marketing-requests:read'"
              :to="{ name: 'MarketingRequestDetail', params: { id: item.id } }"
              class="w-[28px] h-[28px] flex items-center justify-center bg-[#e8e8e8]/70 dark:bg-gray-700 rounded-full text-[#444] dark:text-gray-300 hover:bg-[#d8d8d8] dark:hover:bg-gray-600 transition-all cursor-pointer"
              title="Detail"
            >
              <Eye class="w-[14px] h-[14px]" />
            </router-link>
            <button
              v-if="item.status === 'draft' || item.status === 'diajukan'"
              v-can="'marketing-requests:delete'"
              @click="handleDelete(item.id)"
              class="w-[28px] h-[28px] flex items-center justify-center bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 rounded-full transition-all cursor-pointer"
              title="Hapus"
            >
              <Trash2 class="w-[14px] h-[14px]" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Form Modal for Create/Edit -->
    <MarketingRequestFormModal
      v-model="showFormModal"
      :request-id="selectedRequestId"
      @saved="onModalSaved"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import MarketingRequestFormModal from './components/MarketingRequestFormModal.vue';
import { useMarketingRequest } from './composables/useMarketingRequest';
import { useMarketingRequestSummary } from './composables/useMarketingRequestSummary';
import { Alert } from '@/plugins/sweetalert';
import { FilterIcon } from '@/icons';
import { LocationService } from '@/modules/master/locations/location.service';
import {
  Search, Plus, Eye, Pencil, Trash2, FileText, ClipboardList,
  X, ChevronDown, CheckCircle, XCircle, Loader, Clock, Download,
  CalendarRange
} from 'lucide-vue-next';

const router = useRouter();
const { filters, marketingRequestStore, handleExport, handlePageChange, resetFilters } = useMarketingRequest();
const { summaryStats, isLoadingSummary, fetchSummaryStats } = useMarketingRequestSummary();

const showFormModal = ref(false);
const selectedRequestId = ref(null);

const openCreateModal = () => {
  selectedRequestId.value = null;
  showFormModal.value = true;
};

const openEditModal = (id) => {
  selectedRequestId.value = id;
  showFormModal.value = true;
};

const onModalSaved = () => {
  marketingRequestStore.fetchRequests({
    page: marketingRequestStore.pagination.currentPage,
    limit: marketingRequestStore.pagination.dataPerPage,
    ...filters,
  });
  fetchSummaryStats();
};

const showFilter = ref(false);
const locations = ref([]);
const statuses = ['draft', 'diajukan', 'diproses', 'menunggu_pemenuhan', 'selesai', 'ditolak', 'batal'];

const localFilters = reactive({
  search: '',
  status: '',
  requestType: '',
  requesterType: '',
  locationId: '',
  dateFrom: '',
  dateTo: '',
});

const filterSchema = computed(() => [
  {
    label: 'Cari Data',
    key: 'search',
    type: 'text',
    placeholder: 'Cari kode...'
  },
  {
    label: 'Pilih Status',
    key: 'status',
    type: 'select',
    options: [
      { label: 'Semua Status', value: '' },
      ...statuses.map(s => ({ label: getStatusLabel(s), value: s }))
    ]
  },
  {
    label: 'Kategori',
    key: 'requestType',
    type: 'select',
    options: [
      { label: 'Semua Kategori', value: '' },
      { label: 'Barang', value: 'barang' },
      { label: 'Jasa', value: 'jasa' }
    ]
  },
  {
    label: 'Tipe Pemohon',
    key: 'requesterType',
    type: 'select',
    options: [
      { label: 'Semua Tipe', value: '' },
      { label: 'Toko', value: 'toko' },
      { label: 'Provinsi', value: 'provinsi' }
    ]
  },
  {
    label: 'Lokasi',
    key: 'locationId',
    type: 'select',
    searchable: true,
    placeholder: 'Semua Lokasi',
    options: [
      { label: 'Semua Lokasi', value: '' },
      ...locations.value.map(l => ({ label: l.location_name, value: l.id }))
    ]
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

watch(showFilter, (isOpen) => {
  if (isOpen) {
    localFilters.search = filters.search;
    localFilters.status = filters.status;
    localFilters.requestType = filters.requestType;
    localFilters.requesterType = filters.requesterType;
    localFilters.locationId = filters.locationId;
    localFilters.dateFrom = filters.dateFrom;
    localFilters.dateTo = filters.dateTo;
  }
});

const hasActiveFilters = ref(false);
watch(filters, () => {
  hasActiveFilters.value = !!(
    filters.search ||
    filters.status ||
    filters.requestType ||
    filters.requesterType ||
    filters.locationId ||
    filters.dateFrom ||
    filters.dateTo
  );
}, { immediate: true, deep: true });

const isModalDirty = computed(() => {
  return (
    localFilters.search !== filters.search ||
    localFilters.status !== filters.status ||
    localFilters.requestType !== filters.requestType ||
    localFilters.requesterType !== filters.requesterType ||
    localFilters.locationId !== filters.locationId ||
    localFilters.dateFrom !== filters.dateFrom ||
    localFilters.dateTo !== filters.dateTo
  );
});

const applyFiltersFromModal = () => {
  filters.search = localFilters.search;
  filters.status = localFilters.status;
  filters.requestType = localFilters.requestType;
  filters.requesterType = localFilters.requesterType;
  filters.locationId = localFilters.locationId;
  filters.dateFrom = localFilters.dateFrom;
  filters.dateTo = localFilters.dateTo;
  showFilter.value = false;
};

const handleReset = () => {
  resetFilters();
  Object.assign(localFilters, {
    search: '',
    status: '',
    requestType: '',
    requesterType: '',
    locationId: '',
    dateFrom: '',
    dateTo: '',
  });
  showFilter.value = false;
};

const tableColumns = [
  { key: 'code', label: 'Kode' },
  { key: 'dateRequest', label: 'Tanggal' },
  { key: 'requesterName', label: 'Pemohon' },
  { key: 'requesterLocationName', label: 'Lokasi' },
  { key: 'requestType', label: 'Kategori' },
  { key: 'itemCount', label: 'Jumlah Barang' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: '', align: 'right' },
];

const requestTypeLabel = (t) => ({ barang: 'Barang', jasa: 'Jasa' }[t] || t);
const requestTypeBadgeClass = (t) => ({
  barang: 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  jasa: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400',
}[t] || 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569]');

const getStatusLabel = (s) => ({
  draft: 'Draft',
  diajukan: 'Diajukan',
  diproses: 'Diproses',
  menunggu_pemenuhan: 'Menunggu Pemenuhan',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
  batal: 'Batal',
}[s] || s);

const statusBadgeClass = (s) => ({
  draft: 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  diajukan: 'bg-[#fffbeb] border-[#fef3c7] text-[#b45309]',
  diproses: 'bg-[#ebf8ff] border-[#ddf3ff] text-[#0069a6]',
  menunggu_pemenuhan: 'bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]',
  selesai: 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]',
  ditolak: 'bg-[#fef2f2] border-[#fee2e2] text-[#b91c1c]',
  batal: 'bg-[#fef2f2] border-[#fee2e2] text-[#b91c1c]',
}[s] || 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569]');

// Warna solid untuk progress bar breakdown status (selaras dengan statusBadgeClass di atas)
const statusBarColor = (s) => ({
  draft: 'rgb(156, 163, 175)',              // gray-400
  diajukan: 'rgb(245, 158, 11)',            // amber-500
  diproses: 'rgb(59, 130, 246)',            // blue-500
  menunggu_pemenuhan: 'rgb(249, 115, 22)',  // orange-500
  selesai: 'rgb(34, 197, 94)',              // green-500
  ditolak: 'rgb(239, 68, 68)',              // red-500
  batal: 'rgb(148, 163, 184)',              // slate-400
}[s] || 'rgb(148, 163, 184)');

// Breakdown status + percentage untuk Card 3 (dihitung dari summaryStats.statusBreakdown)
const statusBreakdownList = computed(() => {
  const breakdown = summaryStats.value?.statusBreakdown || [];
  const total = breakdown.reduce((sum, s) => sum + s.count, 0);
  if (!total) return [];

  return breakdown
    .filter(s => s.count > 0)
    .map(s => ({
      key: s.status,
      count: s.count,
      percentage: Math.round((s.count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
});

const getInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : '?';
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
};

const handleExportRequest = async () => {
  const confirmed = await Alert.confirmExport(
    'Apakah Anda setuju untuk export data pengajuan marketing?',
    'Sistem akan mengunduh data pengajuan marketing sesuai filter yang aktif',
  );
  if (!confirmed) return;
  try {
    await handleExport();
    Alert.toast('File data pengajuan berhasil diunduh ke perangkat Anda', 'success');
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat mengunduh file data pengajuan';
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

const fetchLocationOptions = async () => {
  try {
    const res = await LocationService.getAll({ limit: 100 });
    locations.value = res.data || [];
  } catch (err) {
    console.error('Gagal memuat daftar lokasi:', err);
  }
};

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Pengajuan?', 'Data yang dihapus tidak dapat dikembalikan.');
  if (confirmed) {
    try {
      await marketingRequestStore.deleteRequest(id);
      await marketingRequestStore.fetchRequests({
        page: marketingRequestStore.pagination.currentPage,
        limit: marketingRequestStore.pagination.dataPerPage,
      });
      Alert.success('Berhasil', 'Pengajuan berhasil dihapus.');
      fetchSummaryStats();
    } catch (err) {
      Alert.error('Gagal', err.response?.data?.message || 'Terjadi kesalahan.');
    }
  }
};

onMounted(() => {
  fetchSummaryStats();
  fetchLocationOptions();
});
</script>

<style scoped>
@reference "../../../assets/main.css";

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>

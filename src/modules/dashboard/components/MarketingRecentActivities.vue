<template>
  <DataTable
    title="Aktivitas Terbaru"
    subtitle="Daftar transaksi dan log operasional Marketing"
    :columns="tableColumns"
    :data="filteredActivities"
    items-per-page="5"
  >
    <!-- Header Actions (Search & Filter Controls) -->
    <template #header-actions>
      <div class="flex items-center gap-2.5 relative">
        <!-- Search Input -->
        <div class="relative w-44 sm:w-56">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search class="w-3.5 h-3.5 text-text-muted" />
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari referensi, PIC..."
            class="w-full pl-8 pr-3 py-1.5 border border-[#e8e8e8] dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-xs font-normal text-text-active placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
          />
        </div>

        <!-- Filter Button -->
        <button
          @click="toggleFilter"
          class="flex items-center gap-1.5 px-3 py-1.5 border border-[#e8e8e8] dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-text-muted hover:text-text-active hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer transition-colors outline-none"
        >
          <span>Filter</span>
          <FilterIcon class="w-3.5 h-3.5 text-text-muted" />
        </button>

        <!-- Floating Filter Dropdown -->
        <div v-if="showFilterDropdown" class="absolute right-0 top-10 z-20 w-44 bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-gray-800 rounded-xl shadow-lg p-1 space-y-0.5">
          <div class="text-[10px] text-text-muted font-bold tracking-wider px-2 py-1.5">Filter Modul</div>
          <button
            v-for="opt in ['all', 'Purchase']"
            :key="opt"
            @click="filterType = opt; showFilterDropdown = false"
            class="w-full text-left px-2 py-1.5 text-xs font-medium transition-colors"
            :class="filterType === opt ? 'bg-active-tab-active text-text-active font-semibold' : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-active'"
          >
            <span>{{ opt === 'all' ? 'Semua' : opt }}</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Custom Cell: Type -->
    <template #cell-type="{ item }">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg border border-[#e8e8e8] dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-text-muted shrink-0">
          <component :is="item.icon" class="w-4 h-4" />
        </div>
        <span class="text-[12px] font-medium uppercase tracking-wider text-text-muted">{{ item.type }}</span>
      </div>
    </template>

    <!-- Custom Cell: Reference / Item -->
    <template #cell-ref="{ item }">
      <div class="flex flex-col">
        <span class="text-[14px] font-medium text-text-active leading-snug">{{ item.ref }}</span>
        <span class="text-[12px] font-normal text-text-muted mt-0.5 truncate max-w-[220px]">{{ item.title }}</span>
      </div>
    </template>

    <!-- Custom Cell: PIC / Location -->
    <template #cell-pic="{ item }">
      <div class="flex flex-col">
        <span class="text-[14px] font-medium text-text-active leading-snug">{{ item.pic }}</span>
        <span class="text-[12px] font-normal text-text-muted mt-0.5 italic">{{ item.location }}</span>
      </div>
    </template>

    <!-- Custom Cell: Status & Date -->
    <template #cell-status="{ item }">
      <div class="flex flex-col items-start">
        <span
          :class="getStatusConfig(item.status).class"
          class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border uppercase tracking-wider"
        >
          <component :is="getStatusConfig(item.status).icon" class="w-3 h-3" />
          {{ getStatusConfig(item.status).label }}
        </span>
        <span class="text-[11px] text-text-muted mt-1 font-normal">{{ formatDate(item.date) }}</span>
      </div>
    </template>
  </DataTable>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  ShoppingBag, Search, Send, CheckCircle2, XCircle, AlertCircle, CircleDot
} from 'lucide-vue-next';
import FilterIcon from '@/icons/FilterIcon.vue';
import DataTable from '@/components/tables/DataTable.vue';

const props = defineProps({
  summary: { type: Object, default: () => ({}) },
});

const tableColumns = [
  { key: 'type', label: 'Type' },
  { key: 'ref', label: 'Reference / Item' },
  { key: 'pic', label: 'PIC / Lokasi' },
  { key: 'status', label: 'Status' },
];

const searchQuery = ref('');
const filterType = ref('all');
const showFilterDropdown = ref(false);

const toggleFilter = () => {
  showFilterDropdown.value = !showFilterDropdown.value;
};

const combinedActivities = computed(() => {
  const list = [];

  // Purchases (satu-satunya sumber data yang sudah aktif saat ini)
  (props.summary?.purchases?.recent || []).forEach((p) => {
    list.push({
      type: 'Purchase',
      icon: ShoppingBag,
      ref: p.purchase_code,
      title: p.vendor_name || 'Purchase Marketing',
      pic: p.pic?.full_name || '-',
      location: p.location?.location_name || '-',
      status: p.status,
      date: new Date(p.created_at),
    });
  });

  // TODO: gabungkan Request Marketing & Transfer Marketing di sini begitu
  // backend-nya sudah mengembalikan data recent (lihat dashboard.repository.js
  // bagian groupRequestsByStatus/findRecentRequests yang masih stub kosong).

  return list;
});

const filteredActivities = computed(() => {
  let list = [...combinedActivities.value];

  // Search Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((act) =>
      (act.ref && act.ref.toLowerCase().includes(q)) ||
      (act.title && act.title.toLowerCase().includes(q)) ||
      (act.pic && act.pic.toLowerCase().includes(q)) ||
      (act.location && act.location.toLowerCase().includes(q))
    );
  }

  // Module Type Filter
  if (filterType.value !== 'all') {
    list = list.filter((act) => act.type === filterType.value);
  }

  // Sorting (latest first)
  list.sort((a, b) => b.date - a.date);

  return list;
});

// Mapping of status badges with colors and icons
const getStatusConfig = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'diajukan') {
    return {
      label: 'Diajukan',
      icon: Send,
      class: 'bg-blue-50/60 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
    };
  }
  if (s === 'disetujui') {
    return {
      label: 'Disetujui',
      icon: CircleDot,
      class: 'bg-indigo-50/60 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
    };
  }
  if (s === 'diterima') {
    return {
      label: 'Diterima',
      icon: AlertCircle,
      class: 'bg-amber-50/60 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
    };
  }
  if (s === 'selesai') {
    return {
      label: 'Selesai',
      icon: CheckCircle2,
      class: 'bg-emerald-50/60 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
    };
  }
  if (s === 'batal') {
    return {
      label: 'Batal',
      icon: XCircle,
      class: 'bg-red-50/60 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
    };
  }
  return {
    label: 'Draft',
    icon: AlertCircle,
    class: 'bg-gray-50/60 text-gray-500 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20'
  };
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
</script>

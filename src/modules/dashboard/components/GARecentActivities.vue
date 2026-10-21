<template>
  <DataTable 
    title="Aktivitas Terbaru" 
    subtitle="Daftar transaksi dan log operasional terkini"
    :columns="tableColumns" 
    :data="filteredActivities"
    :items-per-page="5"
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
          class="flex items-center gap-1.5 px-3 py-1.5 border border-[#e8e8e8] dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-xs font-medium text-text-muted hover:text-text-active hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors outline-none"
        >
          <span>Filter</span>
          <FilterIcon class="w-3.5 h-3.5 text-text-muted" /> 
        </button>

        <!-- Floating Filter Dropdown -->
        <div v-if="showFilterDropdown" class="absolute right-0 top-10 z-20 w-44 bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-gray-800 rounded-xl shadow-xl p-2 space-y-1">
          <div class="text-[10px] text-text-muted font-bold tracking-wider px-2 py-1">Filter Modul</div>
          <button 
            v-for="opt in ['all', 'Request', 'Purchase', 'Maintenance']" 
            :key="opt"
            @click="filterType = opt; showFilterDropdown = false"
            class="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer"
            :class="filterType === opt ? 'bg-bg-active text-text-active font-semibold' : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-active'"
          >
            <span>{{ opt === 'all' ? 'Semua' : opt }}</span>
            <span v-if="filterType === opt">✓</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Custom Cell: Type -->
    <template #cell-type="{ item }">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg border border-[#e8e8e8] dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center text-text-muted shadow-sm">
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
  ClipboardList, ShoppingBag, Wrench, Search, 
  Send, CheckCircle2, XCircle, AlertCircle 
} from 'lucide-vue-next';

import FilterIcon from '@/icons/FilterIcon.vue';
import DataTable from '@/components/tables/DataTable.vue';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({})
  }
});

const tableColumns = [
  { key: 'type', label: 'Type' },
  { key: 'ref', label: 'Reference / Item' },
  { key: 'pic', label: 'PIC / Location' },
  { key: 'status', label: 'Status' }
];

const searchQuery = ref('');
const filterType = ref('all');
const showFilterDropdown = ref(false);

const toggleFilter = () => {
  showFilterDropdown.value = !showFilterDropdown.value;
};

const combinedActivities = computed(() => {
  const list = [];
  
  // Requests
  (props.stats.requests?.recent || []).forEach(r => {
    list.push({
      type: 'Request',
      icon: ClipboardList,
      ref: r.code_request || r.request_code,
      title: r.purpose || 'Material Request',
      pic: r.employee?.full_name || 'System',
      location: r.location?.location_name || '-',
      status: r.status,
      date: new Date(r.created_at)
    });
  });

  // Purchases
  (props.stats.purchases?.recent || []).forEach(p => {
    list.push({
      type: 'Purchase',
      icon: ShoppingBag,
      ref: p.purchase_code,
      title: p.vendor_name || 'Purchase Order',
      pic: p.ga_pic?.full_name || '-',
      location: p.location?.location_name || '-',
      status: p.status,
      date: new Date(p.created_at)
    });
  });

  // Maintenances
  (props.stats.maintenances?.recent || []).forEach(m => {
    list.push({
      type: 'Maintenance',
      icon: Wrench,
      ref: m.ticket_code,
      title: m.item_name || 'Repair Ticket',
      pic: m.pic_ga?.full_name || '-',
      location: m.location?.location_name || '-',
      status: m.status,
      date: new Date(m.created_at)
    });
  });

  return list;
});

const filteredActivities = computed(() => {
  let list = [...combinedActivities.value];
  
  // Search Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(act => 
      (act.ref && act.ref.toLowerCase().includes(q)) ||
      (act.title && act.title.toLowerCase().includes(q)) ||
      (act.pic && act.pic.toLowerCase().includes(q)) ||
      (act.location && act.location.toLowerCase().includes(q))
    );
  }
  
  // Module Type Filter
  if (filterType.value !== 'all') {
    list = list.filter(act => act.type === filterType.value);
  }
  
  // Sorting (latest first)
  list.sort((a, b) => b.date - a.date);
  
  return list;
});

// Mapping of status badges with colors and lucide icons
const getStatusConfig = (status) => {
  const s = (status || '').toLowerCase();
  
  if (s === 'diajukan' || s === 'dalam_pengajuan' || s === 'open') {
    return {
      label: 'Diajukan',
      icon: Send,
      class: 'bg-blue-50/60 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
    };
  }
  if (s === 'selesai' || s === 'done' || s === 'disetujui' || s === 'diserahkan') {
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
      class: 'bg-red-50/60 text-red-655 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
    };
  }
  
  return {
    label: s === 'proses_ga' ? 'Proses GA' : 'Proses',
    icon: AlertCircle,
    class: 'bg-amber-50/60 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
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

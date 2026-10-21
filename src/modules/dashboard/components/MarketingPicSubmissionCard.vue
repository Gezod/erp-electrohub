<template>
  <div class="rounded-2xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900 p-6 shadow-sm">
    <div class="flex items-center justify-between mb-2">
      <div>
        <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-1 tracking-wider flex items-center gap-2">
          <Trophy class="w-4 h-4 text-amber-500" /> Top Lokasi &mdash; Total Pengajuan
        </h3>
        <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
          Daftar lokasi dengan akumulasi volume pengajuan marketing tertinggi
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-xs text-gray-400 dark:text-gray-500 italic py-6 text-center">
      Memuat data...
    </div>

    <!-- Data List -->
    <div v-else class="space-y-3 mt-5">
      <div
        v-for="(item, idx) in displayList"
        :key="item.employee_id || item.id || idx"
        class="flex items-center gap-3"
      >
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
          :class="rankBadgeClass(idx)"
        >
          {{ idx + 1 }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-gray-800 dark:text-white truncate">
              {{ item.full_name || item.location_name }}
            </span>
          </div>
          <div class="flex items-center gap-2 mt-1.5">
            <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-brand-500 transition-all duration-500"
                :style="`width: ${pct(item)}%`"
              />
            </div>
            <span class="text-[13px] font-bold text-gray-800 dark:text-white shrink-0">
              {{ item.total_pengajuan || item.total }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { Trophy } from 'lucide-vue-next';
import { MarketingDashboardService } from '../dashboard.service';

const defaultDummyList = [
  { id: 'sub_01', full_name: 'Kantor Pusat Jakarta', location_name: 'Kantor Pusat Jakarta', total_pengajuan: 42, total: 42 },
  { id: 'sub_02', full_name: 'Gudang Logistik Cikarang', location_name: 'Gudang Logistik Cikarang', total_pengajuan: 31, total: 31 },
  { id: 'sub_03', full_name: 'Store Bandung Dago', location_name: 'Store Bandung Dago', total_pengajuan: 24, total: 24 },
  { id: 'sub_04', full_name: 'Store Surabaya Gubeng', location_name: 'Store Surabaya Gubeng', total_pengajuan: 19, total: 19 },
  { id: 'sub_05', full_name: 'Store Bali Kuta', location_name: 'Store Bali Kuta', total_pengajuan: 15, total: 15 },
  { id: 'sub_06', full_name: 'Store Medan Petisah', location_name: 'Store Medan Petisah', total_pengajuan: 11, total: 11 }
];

const picSubmissions = ref([]);
const isLoading = ref(false);

const displayList = computed(() => {
  return picSubmissions.value.length ? picSubmissions.value : defaultDummyList;
});

const maxCount = computed(() => {
  return Math.max(1, ...displayList.value.map((i) => Number(i.total_pengajuan || i.total) || 0));
});

const pct = (item) => {
  const val = Number(item.total_pengajuan || item.total) || 0;
  return Math.round((val / maxCount.value) * 100);
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const res = await MarketingDashboardService.getPicSubmissions({});
    const items = res?.data || res || [];
    if (Array.isArray(items) && items.length) {
      picSubmissions.value = items;
    } else {
      picSubmissions.value = defaultDummyList;
    }
  } catch (err) {
    picSubmissions.value = defaultDummyList;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const rankBadgeClass = (idx) => {
  if (idx === 0) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400';
  if (idx === 1) return 'bg-gray-150 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  if (idx === 2) return 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400';
  return 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500';
};
</script>

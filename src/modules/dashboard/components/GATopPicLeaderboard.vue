<template>
  <div class="rounded-2xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900 p-6 shadow-sm">
    <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-1 tracking-wider flex items-center gap-2">
      <Trophy class="w-4 h-4 text-amber-500" /> Top PIC — Dana Pembelian
    </h3>
    <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium mb-5">Seluruh tim, periode &amp; lokasi terpilih</p>

    <div v-if="items.length === 0" class="text-xs text-gray-400 dark:text-gray-500 italic py-6 text-center">
      Belum ada data pembelian pada periode ini.
    </div>

    <div v-else class="space-y-3">
      <div v-for="(item, idx) in items" :key="item.employee_id" class="flex items-center gap-3">
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
          :class="rankBadgeClass(idx)"
        >
          {{ idx + 1 }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-gray-800 dark:text-white truncate">{{ item.full_name }}</span>
            <span class="text-xs font-bold text-gray-800 dark:text-white shrink-0">Rp {{ formatNumber(item.total_spent) }}</span>
          </div>
          <div class="flex items-center gap-2 mt-1.5">
            <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div class="h-full rounded-full bg-brand-500" :style="{ width: `${pct(item)}%` }" />
            </div>
            <span class="text-[9px] text-gray-400 dark:text-gray-500 font-semibold shrink-0">{{ item.count }} PO</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Trophy } from 'lucide-vue-next';

const props = defineProps({
  topPic: {
    type: Array,
    default: () => []
  }
});

const items = computed(() => props.topPic || []);
const maxSpent = computed(() => Math.max(1, ...items.value.map((i) => Number(i.total_spent) || 0)));
const pct = (item) => Math.round(((Number(item.total_spent) || 0) / maxSpent.value) * 100);

const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(Math.round(Number(n) || 0));

const rankBadgeClass = (idx) => {
  if (idx === 0) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400';
  if (idx === 1) return 'bg-gray-150 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  if (idx === 2) return 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400';
  return 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500';
};
</script>

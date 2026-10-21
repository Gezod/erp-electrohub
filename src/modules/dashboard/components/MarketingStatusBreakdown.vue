<template>
  <div class="rounded-2xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900 p-6 shadow-sm">
    <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-6 tracking-wider">Rincian Status Marketing</h3>

    <div class="space-y-6">
      <div v-for="group in groups" :key="group.key">
        <div class="flex items-center justify-between mb-2.5">
          <span class="text-xs font-bold text-gray-600 dark:text-gray-300">{{ group.label }}</span>
          <span class="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{{ group.total }} total</span>
        </div>

        <div v-if="group.total === 0" class="text-[11px] text-gray-400 dark:text-gray-500 italic pb-1">
          Tidak ada data
        </div>
        <div v-else class="space-y-1.5">
          <div v-for="row in group.rows" :key="row.status" class="flex items-center gap-2.5">
            <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 w-24 shrink-0 truncate">{{ row.label }}</span>
            <div class="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :style="{ width: `${row.pct}%`, backgroundColor: row.color }"
              />
            </div>
            <span class="text-[10px] font-bold text-gray-700 dark:text-gray-200 w-6 text-right shrink-0">{{ row.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({})
  }
});

// Label & warna — urutan sesuai PURCHASE_WORKFLOW_STEPS (marketingPurchase.constants.js)
// plus 'batal' yang sengaja tidak masuk workflow normal tapi tetap status valid di enum.
const PURCHASE_STATUS = [
  { status: 'draft', label: 'Draft', color: '#9ca3af' },
  { status: 'diajukan', label: 'Diajukan', color: '#3b82f6' },
  { status: 'disetujui', label: 'Disetujui', color: '#8b5cf6' },
  { status: 'diterima', label: 'Diterima', color: '#06b6d4' },
  { status: 'selesai', label: 'Selesai', color: '#22c55e' },
  { status: 'batal', label: 'Batal', color: '#ef4444' },
];

// TODO: tambah REQUEST_STATUS di sini begitu Request Marketing sudah dikembalikan
// backend (lihat groupRequestsByStatus yang masih stub di dashboard.repository.js).

const buildGroup = (key, label, statusDefs, statsMap) => {
  const map = statsMap || {};
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  const rows = statusDefs
    .map((def) => ({ ...def, count: map[def.status] || 0 }))
    .filter((row) => row.count > 0)
    .map((row) => ({ ...row, pct: total > 0 ? Math.round((row.count / total) * 100) : 0 }));
  return { key, label, total, rows };
};

const groups = computed(() => [
  buildGroup('purchases', 'Pembelian Marketing', PURCHASE_STATUS, props.summary?.purchases?.status),
]);
</script>

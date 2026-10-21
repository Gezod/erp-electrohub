<template>
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-[10px] select-none" v-if="stats">
    <StatsCard
      v-for="card in cards"
      :key="card.id"
      :icon="card.icon"
      icon-color="text-[#444] dark:text-gray-300"
      :heading="card.heading"
      :value="card.value"
      class="rounded-[12px] border border-[#e8e8e8] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]"
    />
  </div>
</template>

<script setup>
/**
 * MarketingAssetStats — Dashboard Aset Marketing (5 kartu).
 * Markup & kelas mengikuti kartu GA, kecuali `bg-[#0f0f0f]` yang tidak disalin:
 * root StatsCard sudah `bg-white dark:bg-gray-900`, jadi kelas itu bertabrakan.
 */
import { computed } from 'vue';
import StatsCard from '@/components/ui/StatsCard.vue';
import { Monitor, CheckCircle, AlertTriangle, HelpCircle, XCircle } from 'lucide-vue-next';

const props = defineProps({
  stats: { type: Object, default: null },
});

const cards = computed(() => {
  const s = props.stats || {};
  return [
    { id: 'wg-mkt-total', icon: Monitor, heading: 'Total Aset', value: s.total || 0 },
    { id: 'wg-mkt-baik', icon: CheckCircle, heading: 'Kondisi Baik', value: s.by_condition?.baik || 0 },
    { id: 'wg-mkt-rusak', icon: AlertTriangle, heading: 'Rusak', value: s.by_condition?.rusak || 0 },
    { id: 'wg-mkt-hilang', icon: HelpCircle, heading: 'Hilang', value: s.by_condition?.hilang || 0 },
    { id: 'wg-mkt-nonaktif', icon: XCircle, heading: 'Nonaktif', value: s.by_active?.inactive || 0 },
  ];
});
</script>

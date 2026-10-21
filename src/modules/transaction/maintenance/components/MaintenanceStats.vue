<template>
  <!-- Stats Grid: 5 cards with uniform design and layout -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
    <MaintenanceStatCard
      v-for="stat in statCards"
      :key="stat.key"
      :icon="stat.icon"
      :heading="stat.heading"
      :unit="stat.unit"
      :value="stat.value"
      :formatted-value="stat.formattedValue"
      :suffix="stat.suffix"
      :subtitle="stat.subtitle"
      :progress-fraction="stat.progressFraction"
      :show-progress="stat.showProgress"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMaintenanceStore } from '../maintenance.store';
import { Wrench, AlertTriangle, Inbox } from 'lucide-vue-next';
import MaintenanceStatCard from './MaintenanceStatCard.vue';

const maintenanceStore = useMaintenanceStore();

// ─── Derived counts ────────────────────────────────────────────────────────────
const statusCounts = computed(() => {
  const list = maintenanceStore.maintenances || [];
  return {
    open: list.filter((m) => m.status?.toLowerCase() === 'open').length,
    hold: list.filter((m) => m.status?.toLowerCase() === 'hold').length,
    done: list.filter((m) => m.status?.toLowerCase() === 'done').length
  };
});

const total = computed(() => maintenanceStore.pagination.totalData || 0);

const totalFraction = computed(() => (total.value > 0 ? Math.min(total.value / 100, 1) : 0));
const openFraction = computed(() => (total.value > 0 ? statusCounts.value.open / total.value : 0));
const holdFraction = computed(() => (total.value > 0 ? statusCounts.value.hold / total.value : 0));
const doneFraction = computed(() => (total.value > 0 ? statusCounts.value.done / total.value : 0));
const costFraction = computed(() => (maintenanceStore.totalCost > 0 ? 1 : 0));

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// ─── Stat Cards Configuration ─────────────────────────────────────────────────
const statCards = computed(() => [
  {
    key: 'total-cost',
    icon: Inbox,
    heading: 'Total Biaya Perawatan',
    unit: 'Rp.',
    formattedValue: formatCurrency(maintenanceStore.totalCost),
    subtitle: '30 hari terakhir',
    progressFraction: costFraction.value,
    showProgress: true
  },
  {
    key: 'total-tickets',
    icon: Wrench,
    heading: 'Maintenance',
    value: total.value,
    suffix: 'item',
    subtitle: '30 hari terakhir',
    progressFraction: totalFraction.value,
    showProgress: true
  },
  {
    key: 'on-progress',
    icon: Wrench,
    heading: 'On Progress',
    value: statusCounts.value.open,
    suffix: 'item',
    subtitle: '30 hari terakhir',
    progressFraction: openFraction.value,
    showProgress: true
  },
  {
    key: 'on-hold',
    icon: Wrench,
    heading: 'Hold',
    value: statusCounts.value.hold,
    suffix: 'item',
    subtitle: '30 hari terakhir',
    progressFraction: holdFraction.value,
    showProgress: true
  },
  {
    key: 'completed',
    icon: AlertTriangle,
    heading: 'Selesai',
    value: statusCounts.value.done,
    suffix: 'item',
    subtitle: '30 hari terakhir',
    progressFraction: doneFraction.value,
    showProgress: true
  }
]);
</script>

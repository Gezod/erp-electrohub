<template>
  <div class="flex flex-col items-center justify-center w-full">
    <!-- Pie Chart Container (192px) -->
    <div class="relative size-[192px] flex items-center justify-center">

      <!-- Apexchart donut component -->
      <apexchart
        type="donut"
        width="192"
        height="192"
        :options="chartOptions"
        :series="series"
        class="z-0"
      />

      <!-- Outer White Circle Card (140px) inside donut hole -->
      <div class="absolute bg-white dark:bg-gray-900 shadow-[0px_0px_10px_rgba(0,0,0,0.06)] dark:shadow-[0px_0px_15px_rgba(0,0,0,0.5)] rounded-[9999px] size-[140px] flex items-center justify-center pointer-events-none z-10">
        <!-- Inner Dashed Accent Circle (118px) inside white card -->
        <div class="border border-dashed border-[#e8e8e8] dark:border-gray-700 rounded-[9999px] size-[118px] flex flex-col items-center justify-center leading-[1.2]">
          <p class="font-sans text-[#999] dark:text-gray-400 text-[12px] font-normal">
            Total Aktivitas
          </p>
          <p class="font-sans font-bold text-[26px] text-black dark:text-white">
            {{ totalActivities }}
          </p>
        </div>
      </div>

    </div>

    <!-- Legend -->
    <p v-if="isEmpty" class="text-xs text-gray-400 dark:text-gray-500 font-medium mt-5">Belum ada aktivitas</p>
    <div v-else class="content-stretch flex gap-[12px] items-center justify-center relative shrink-0 mt-5">
      <div v-for="(item, idx) in legendData" :key="idx" class="content-stretch flex gap-[8px] items-center relative shrink-0">
        <div class="relative shrink-0 size-[8px] rounded-full" :style="{ backgroundColor: item.color }" />
        <p class="[word-break:break-word] font-sans leading-[20px] not-italic relative shrink-0 text-[14px] text-black dark:text-gray-200 whitespace-nowrap">
          {{ item.label }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTheme } from '@/components/layout/ThemeProvider.vue';

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({})
  }
});

const { isDarkMode } = useTheme();

// Angka asli — tanpa fallback mockup. 0 tetap tampil sebagai 0.
const counts = computed(() => ({
  p: Object.values(props.summary?.purchases?.status || {}).reduce((a, b) => a + b, 0),
  r: Object.values(props.summary?.requests?.stats || {}).reduce((a, b) => a + b, 0),
  t: Object.values(props.summary?.transfers?.stats || {}).reduce((a, b) => a + b, 0),
}));

const totalActivities = computed(() => counts.value.p + counts.value.r + counts.value.t);
const isEmpty = computed(() => totalActivities.value === 0);

// Series order matched 1:1 dengan legend (Purchases, Requests, Transfers)
// Saat kosong, tampilkan satu ring abu-abu penuh alih-alih donut 3-warna dengan nilai 0 semua
// (yang bikin ApexCharts render aneh/kosong-tak-jelas).
const series = computed(() => isEmpty.value ? [1] : [
  counts.value.p,
  counts.value.r,
  counts.value.t
]);

const legendData = computed(() => [
  { label: 'Purchases', color: '#3b82f6' },
  { label: 'Requests', color: '#8b5cf6' },
  { label: 'Transfers', color: '#22c55e' },
]);

const chartOptions = computed(() => ({
  chart: {
    fontFamily: 'Inter',
    sparkline: { enabled: true },
    toolbar: { show: false }
  },
  colors: isEmpty.value ? [isDarkMode.value ? '#374151' : '#e8e8e8'] : ['#3b82f6', '#8b5cf6', '#22c55e'],
  stroke: {
    show: true,
    colors: [isDarkMode.value ? '#111827' : '#ffffff'],
    width: 3,
  },
  plotOptions: {
    pie: {
      expandOnClick: false,
      donut: {
        size: '80%', // to match the clean hollow space around the 140px center card
        labels: {
          show: false
        }
      }
    }
  },
  labels: ['Purchases', 'Requests', 'Transfers'],
  legend: { show: false },
  tooltip: {
    enabled: !isEmpty.value,
    theme: isDarkMode.value ? 'dark' : 'light',
    y: {
      formatter: function (val, { seriesIndex }) {
        if (seriesIndex === 0) return counts.value.p + ' items';
        if (seriesIndex === 1) return counts.value.r + ' items';
        if (seriesIndex === 2) return counts.value.t + ' items';
        return val;
      }
    }
  }
}));
</script>

<template>
  <div class="rounded-2xl border border-gray-150 bg-white dark:border-gray-850 dark:bg-gray-900 p-6 shadow-sm">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-sm font-bold text-gray-800 dark:text-white tracking-wider">
          Operational Trends
        </h3>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ periodLabel }}</p>
      </div>

      <div class="flex items-center gap-2 px-3.5 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-850 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <Calendar class="w-4 h-4 text-gray-400" />
        <span>6 Bulan Terakhir</span>
      </div>
    </div>

    <div v-if="hasData" class="h-[250px] md:h-[300px] w-full">
      <apexchart
        type="area"
        height="100%"
        :options="chartOptions"
        :series="series"
      />
    </div>
    <div v-else class="h-[250px] md:h-[300px] w-full flex items-center justify-center">
      <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">Belum ada data pembelian/pengajuan pada periode ini.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Calendar } from 'lucide-vue-next';
import { useTheme } from '@/components/layout/ThemeProvider.vue';

const props = defineProps({
  trends: {
    type: Array,
    default: () => []
  }
});

const { isDarkMode } = useTheme();

// `trends` = 6 titik agregat bulanan ASLI dari backend ({month, year, purchase, request}).
// Tidak ada fabrikasi data harian — grafik apa adanya sesuai granularitas yang tersedia.
const categories = computed(() => props.trends.map((t) => `${t.month} ${t.year}`));
const purchaseData = computed(() => props.trends.map((t) => t.purchase || 0));
const requestData = computed(() => props.trends.map((t) => t.request || 0));
const hasData = computed(() => purchaseData.value.some((v) => v > 0) || requestData.value.some((v) => v > 0));

const periodLabel = computed(() => {
  if (props.trends.length < 2) return '6 Bulan Terakhir';
  const first = props.trends[0];
  const last = props.trends[props.trends.length - 1];
  return `${first.month} ${first.year} - ${last.month} ${last.year}`;
});

const series = computed(() => [
  { name: 'Dana Pembelian', data: purchaseData.value },
  { name: 'Jumlah Request', data: requestData.value },
]);

// Nominal penuh (bukan disingkat) — konsisten dengan kartu ringkasan di atasnya.
const formatRupiah = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(Number(val) || 0));

const chartOptions = computed(() => ({
  chart: {
    fontFamily: 'Inter',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ['#3b82f6', '#ebc03f'],
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0.0,
      stops: [0, 90, 100]
    }
  },
  markers: {
    size: 3,
    hover: { size: 5, sizeOffset: 3 }
  },
  xaxis: {
    categories: categories.value,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: '#9ca3af', fontSize: '10px', fontWeight: 500 }
    }
  },
  yaxis: [
    {
      seriesName: 'Dana Pembelian',
      labels: {
        formatter: formatRupiah,
        style: { colors: '#9ca3af', fontSize: '10px' }
      },
    },
    {
      seriesName: 'Jumlah Request',
      opposite: true,
      labels: {
        formatter: (v) => Math.round(v),
        style: { colors: '#9ca3af', fontSize: '10px' }
      },
    },
  ],
  tooltip: {
    shared: true,
    intersect: false,
    theme: isDarkMode.value ? 'dark' : 'light',
    y: {
      formatter: (val, { seriesIndex }) => seriesIndex === 0 ? formatRupiah(val) : `${val} request`,
    },
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'right',
    fontSize: '11px',
    labels: { colors: isDarkMode.value ? '#9ca3af' : '#666' },
  },
  grid: {
    borderColor: isDarkMode.value ? '#1e293b' : '#f1f5f9',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } }
  }
}));
</script>

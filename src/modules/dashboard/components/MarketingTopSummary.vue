<template>
  <div class="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3 w-full">

    <!-- Card 1: Dana Pembelian -->
    <div class="bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-gray-800 border-solid content-stretch flex flex-col h-[216px] items-start min-w-px overflow-clip relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] dark:shadow-none w-full">
      <!-- Heading Wrapper -->
      <div class="content-stretch flex gap-[8px] items-center px-[16px] py-[12px] relative shrink-0 w-full border-b border-[#e8e8e8] dark:border-gray-800">
        <div class="relative shrink-0 size-[20px] flex items-center justify-center text-gray-400 dark:text-gray-500">
          <Wallet class="w-4 h-4" />
        </div>
        <p class="[word-break:break-word] font-sans font-medium leading-[20px] not-italic relative shrink-0 text-[#666] dark:text-gray-400 text-[14px] whitespace-nowrap">
          Dana Pembelian
        </p>
      </div>
      <!-- Content Block -->
      <div class="content-stretch flex flex-1 flex-col items-start justify-center min-h-px px-[16px] py-[12px] relative w-full overflow-hidden">
        <!-- Value and Change -->
        <div class="content-stretch flex flex-col gap-[2px] items-start justify-center relative shrink-0">
          <p class="[word-break:break-word] leading-[0] not-italic relative shrink-0 text-[0px] whitespace-nowrap">
            <span class="font-sans leading-[36px] text-[#a4a7ae] dark:text-gray-500 text-[24px]">Rp.</span><span class="font-sans font-bold leading-[36px] text-[24px] text-black dark:text-white">{{ purchasesTotal }}</span>
          </p>
          <div v-if="hasTrend" class="content-stretch flex gap-[8px] items-center relative shrink-0">
            <div class="content-stretch flex gap-[4px] items-center justify-center relative shrink-0">
              <ArrowUp
                class="w-4 h-4 transition-transform"
                :class="[trendIsUp ? 'text-[#1ac877]' : 'text-[#e35050] rotate-180']"
              />
              <p
                class="[word-break:break-word] font-sans font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center whitespace-nowrap"
                :class="trendIsUp ? 'text-[#1ac877]' : 'text-[#e35050]'"
              >
                {{ trendLabel }}
              </p>
            </div>
            <p class="[word-break:break-word] font-sans leading-[20px] not-italic relative shrink-0 text-[#999] dark:text-gray-500 text-[14px] whitespace-nowrap">
              vs bulan lalu
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: Purchase Committed (pengganti "Maintenance" milik GA — Marketing tidak punya modul ini) -->
    <div class="bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-gray-800 border-solid content-stretch flex flex-col h-[216px] items-start min-w-px overflow-clip relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] dark:shadow-none w-full">
      <!-- Heading Wrapper -->
      <div class="content-stretch flex gap-[8px] items-center px-[16px] py-[12px] relative shrink-0 w-full border-b border-[#e8e8e8] dark:border-gray-800">
        <div class="relative shrink-0 size-[20px] flex items-center justify-center text-gray-400 dark:text-gray-500">
          <ShoppingBag class="w-4 h-4" />
        </div>
        <p class="[word-break:break-word] font-sans font-medium leading-[20px] not-italic relative shrink-0 text-[#666] dark:text-gray-400 text-[14px] whitespace-nowrap">
          Purchase Committed
        </p>
      </div>
      <!-- Content Block -->
      <div class="content-stretch flex flex-1 flex-col items-start justify-between min-h-px px-[16px] py-[12px] relative w-full overflow-hidden">
        <!-- Value and Period -->
        <div class="content-stretch flex flex-col gap-[2px] items-start justify-center relative shrink-0">
          <div class="[word-break:break-word] content-stretch flex gap-[6px] items-start not-italic relative shrink-0 whitespace-nowrap">
            <p class="font-sans font-bold leading-[36px] relative shrink-0 text-[24px] text-black dark:text-white">
              {{ committedCount }}
            </p>
          </div>
          <div class="flex flex-col font-sans justify-center leading-[0] relative shrink-0 text-[#999] dark:text-gray-500 text-[20px]">
            <p class="leading-[36px]">PO</p>
          </div>
        </div>
        <div class="content-stretch flex flex-col items-start justify-center relative shrink-0">
          <div class="content-stretch flex items-center relative shrink-0">
            <p class="[word-break:break-word] font-sans leading-[20px] not-italic relative shrink-0 text-[#999] dark:text-gray-500 text-[14px] whitespace-nowrap">
              30 hari terakhir
            </p>
          </div>
        </div>
        <!-- Progress Bar segments -->
        <div class="content-stretch flex flex-col items-start relative shrink-0 w-full mt-auto">
          <div class="content-stretch flex gap-[3px] items-start relative shrink-0 w-full">
            <div
              v-for="i in 25"
              :key="i"
              class="flex-1 h-[24px] min-w-px relative rounded-[10px]"
              :style="i <= Math.min(25, committedCount) ? segmentTealStyle : segmentGreyStyle"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Card 3: Request Aktif -->
    <div class="bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-gray-800 border-solid content-stretch flex flex-col h-[216px] items-start min-w-px overflow-clip relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] dark:shadow-none w-full">
      <!-- Heading Wrapper -->
      <div class="content-stretch flex gap-[8px] items-center px-[16px] py-[12px] relative shrink-0 w-full border-b border-[#e8e8e8] dark:border-gray-800">
        <div class="relative shrink-0 size-[20px] flex items-center justify-center text-gray-400 dark:text-gray-500">
          <Send class="w-4 h-4" />
        </div>
        <p class="[word-break:break-word] flex-1 font-sans font-medium leading-[20px] min-w-px not-italic relative text-[#666] dark:text-gray-400 text-[14px]">
          Request Aktif
        </p>
      </div>
      <!-- Content Block -->
      <div class="content-stretch flex flex-1 flex-col items-start justify-center min-h-px px-[16px] py-[12px] relative w-full overflow-hidden">
        <!-- Value and Period -->
        <div class="content-stretch flex flex-col gap-[2px] items-start justify-center relative shrink-0">
          <div class="[word-break:break-word] content-stretch flex gap-[6px] items-start not-italic relative shrink-0 whitespace-nowrap">
            <p class="font-sans font-bold leading-[36px] relative shrink-0 text-[24px] text-black dark:text-white">
              {{ requestsActive }}
            </p>
          </div>
          <div class="flex flex-col font-sans justify-center leading-[0] relative shrink-0 text-[#999] dark:text-gray-500 text-[20px]">
            <p class="leading-[36px]">item</p>
          </div>
        </div>
        <div class="content-stretch flex flex-col items-start justify-center relative shrink-0">
          <div class="content-stretch flex items-center relative shrink-0">
            <p class="[word-break:break-word] font-sans leading-[20px] not-italic relative shrink-0 text-[#999] dark:text-gray-500 text-[14px] whitespace-nowrap">
              30 hari terakhir
            </p>
          </div>
        </div>
        <!-- Progress Bar segments -->
        <div class="content-stretch flex flex-col items-start relative shrink-0 w-full mt-auto">
          <div class="content-stretch flex gap-[3px] items-start relative shrink-0 w-full">
            <div
              v-for="i in 25"
              :key="i"
              class="flex-1 h-[24px] min-w-px relative rounded-[10px]"
              :style="i <= Math.min(25, requestsActive) ? segmentTealStyle : segmentGreyStyle"
            />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Wallet, ShoppingBag, Send, ArrowUp } from 'lucide-vue-next';
import { useTheme } from '@/components/layout/ThemeProvider.vue';

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({})
  }
});

const { isDarkMode } = useTheme();

// Nominal penuh (bukan disingkat 31.5B/17M) — pemisah ribuan gaya Indonesia.
const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(Math.round(Number(n) || 0));

const purchasesTotal = computed(() => formatNumber(props.summary?.purchases?.total_purchase_total ?? 0));
const committedCount = computed(() => props.summary?.purchases?.committed_count ?? 0);

// Request Aktif Marketing = belum selesai/dibatalkan/ditolak. Status asli tabel t_requests_marketing
// yang terkonfirmasi dari data: 'diajukan', 'diproses', 'menunggu_pemenuhan', 'selesai', 'batal', 'ditolak'
// — jadi "aktif" = total dikurangi 3 status akhir (selesai/batal/ditolak).
const requestsActive = computed(() => {
  const s = props.summary?.requests?.stats || {};
  return Object.entries(s)
    .filter(([status]) => !['batal', 'selesai', 'ditolak', 'terpenuhi'].includes(status))
    .reduce((sum, [, count]) => sum + (count || 0), 0);
});

// Delta % dana pembelian bulan ini vs bulan lalu — dihitung backend dari data real.
// null kalau belum cukup data (< 2 bulan) atau bulan lalu = 0 — badge disembunyikan.
const purchaseTrendPercent = computed(() => props.summary?.purchase_trend_percent);
const hasTrend = computed(() => purchaseTrendPercent.value !== null && purchaseTrendPercent.value !== undefined);
const trendIsUp = computed(() => (purchaseTrendPercent.value ?? 0) >= 0);
const trendLabel = computed(() => {
  const v = purchaseTrendPercent.value;
  if (v === null || v === undefined) return '';
  return `${v > 0 ? '+' : ''}${v}%`;
});

// Segment progress bar — warna segmen kosong disesuaikan tema supaya tidak jadi garis terang
// di kartu gelap.
const segmentTealStyle = {
  backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 7.04 24' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.5'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-5.1933e-15 2.4169 -0.70896 1.4799e-16 3.52 -0.16895)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(255,255,255,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, rgb(54, 123, 119) 0%, rgb(54, 123, 119) 100%)`
};

const segmentGreyStyle = computed(() => {
  const inactive = isDarkMode.value ? 'rgb(55, 65, 81)' : 'rgb(217, 217, 217)';
  return {
    backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 7.04 24' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.5'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-5.1933e-15 2.4169 -0.70896 1.4799e-16 3.52 -0.16895)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(255,255,255,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, ${inactive} 0%, ${inactive} 100%)`
  };
});
</script>

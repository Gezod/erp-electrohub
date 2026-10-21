<template>
  <admin-layout>
    <div class="space-y-6">

      <!-- Filter Bar -->
      <div class="rounded-2xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <p class="text-xs text-gray-400 dark:text-gray-500 font-medium shrink-0">
            <span v-if="summary.viewer?.canFilterByPic">Menampilkan data seluruh tim Marketing</span>
            <span v-else>Menampilkan data Anda sebagai PIC</span>
          </p>

          <div class="flex flex-wrap items-end gap-3">
            <div class="w-full sm:w-48">
              <label class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Lokasi</label>
              <SearchableSelect
                v-model="location_id"
                :options="locations"
                option-label="location_name"
                option-value="id"
                clearable
                empty-value=""
                placeholder="Semua Lokasi"
                search-placeholder="Cari lokasi..."
                empty-text="Lokasi tidak ditemukan"
              />
            </div>

            <div v-if="summary.viewer?.canFilterByPic" class="w-full sm:w-52">
              <label class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">PIC</label>
              <SearchableSelect
                v-model="pic_id"
                :options="summary.viewer.staffOptions"
                option-label="full_name"
                option-value="id"
                clearable
                empty-value=""
                placeholder="Semua Data"
                search-placeholder="Cari nama PIC..."
                empty-text="PIC tidak ditemukan"
              />
            </div>

            <div class="w-full sm:w-36">
              <label class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Dari Tanggal</label>
              <div class="h-11 px-3 flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <DatePicker v-model="date_from" placeholder="dd/mm/yyyy" />
              </div>
            </div>

            <div class="w-full sm:w-36">
              <label class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Sampai Tanggal</label>
              <div class="h-11 px-3 flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <DatePicker v-model="date_to" placeholder="dd/mm/yyyy" />
              </div>
            </div>

            <button
              v-if="hasActiveFilters"
              @click="resetFilters"
              class="h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw class="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      <p v-if="errorMsg" class="text-sm text-error-500">{{ errorMsg }}</p>

      <!-- Top Summary Metrics -->
      <MarketingTopSummary :summary="summary" />

      <!-- Main Analytics Section -->
      <div class="grid grid-cols-12 gap-6">

        <!-- ================= BARIS 1: ATAS ================= -->

        <!-- 1. Top Lokasi / Total Pengajuan (Kiri) -->
        <div class="col-span-12 lg:col-span-4 flex flex-col">
          <MarketingPicSubmissionCard class="h-full" />
        </div>

        <!-- 2. Distribusi (Tengah) -->
        <div class="col-span-12 lg:col-span-4">
          <div class="rounded-2xl border border-gray-150 bg-white p-6 dark:border-gray-850 dark:bg-gray-900 shadow-sm h-full flex flex-col">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-6 tracking-wider">Distribusi</h3>
            <div class="flex-1 flex items-center justify-center">
              <MarketingModuleDistribution :summary="summary" class="w-full" />
            </div>
          </div>
        </div>

        <!-- 3. Aksi Cepat (Kanan) -->
        <div class="col-span-12 lg:col-span-4">
          <div class="rounded-2xl border border-gray-150 bg-white p-6 dark:border-gray-850 dark:bg-gray-900 shadow-sm h-full flex flex-col">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-6 tracking-wider">Aksi Cepat</h3>
            <div class="space-y-4 flex-1">
              <router-link :to="{ name: 'MarketingRequestList' }" class="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-gray-200/60 dark:border-gray-800 transition-all shadow-sm hover:shadow">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <ClipboardPlus class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col text-left">
                    <span class="text-[10px] text-gray-400 dark:text-white mt-1 font-medium">Request Barang</span>
                    <span class="text-[10px] text-gray-400 dark:text-white mt-1 font-medium">Ajukan kebutuhan marketing</span>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </router-link>

              <router-link :to="{ name: 'MarketingPurchaseList' }" class="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-gray-200/60 dark:border-gray-800 transition-all shadow-sm hover:shadow">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Wallet class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col text-left">
                    <span class="text-[10px] text-gray-400 dark:text-white mt-1 font-medium">Proses Pembelian</span>
                    <span class="text-[10px] text-gray-400 dark:text-white mt-1 font-medium">Kelola status order</span>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </router-link>

              <router-link :to="{ name: 'MarketingTransferList' }" class="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-gray-200/60 dark:border-gray-800 transition-all shadow-sm hover:shadow">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Repeat class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col text-left">
                    <span class="text-[10px] text-gray-400 dark:text-white mt-1 font-medium">Transfer Barang</span>
                    <span class="text-[10px] text-gray-400 dark:text-white mt-1 font-medium">Pindahkan stok aset</span>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </router-link>
            </div>
          </div>
        </div>

        <!-- ================= BARIS 2: BAWAH ================= -->

        <!-- 1. Top PIC -->
        <div :class="['col-span-12 flex flex-col', summary.viewer?.canFilterByPic ? 'lg:col-span-6' : 'lg:col-span-9']">
          <MarketingTrendsChart :trends="summary.trends" class="h-full" />
        </div>

        <!-- 2. Rincian (Status Breakdown) -->
        <div class="col-span-12 lg:col-span-3 flex flex-col">
          <MarketingStatusBreakdown :summary="summary" class="h-full" />
        </div>

        <!-- 3. Trend Penjualan (Akan memanjang jika Top PIC disembunyikan) -->
        <div v-if="summary.viewer?.canFilterByPic" class="col-span-12 lg:col-span-3">
          <MarketingTopPicLeaderboard
            :top-pic="summary.top_pic"
            class="h-full"
          />
        </div>

        <!-- ================= YANG LAINNYA MENYESUAIKAN ================= -->

        <!-- Activities Table -->
        <div class="col-span-12">
          <MarketingRecentActivities :summary="summary" />
        </div>

      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import MarketingTopSummary from './components/MarketingTopSummary.vue';
import MarketingRecentActivities from './components/MarketingRecentActivities.vue';
import MarketingTrendsChart from './components/MarketingTrendsChart.vue';
import MarketingStatusBreakdown from './components/MarketingStatusBreakdown.vue';
import MarketingPicSubmissionCard from './components/MarketingPicSubmissionCard.vue';
import MarketingTopPicLeaderboard from './components/MarketingTopPicLeaderboard.vue';
import MarketingModuleDistribution from './components/MarketingModuleDistribution.vue';
import { MarketingDashboardService } from './dashboard.service';
import { LocationService } from '@/modules/master/locations/location.service';
import { RotateCcw, ChevronRight, ClipboardPlus, Wallet, Repeat } from 'lucide-vue-next';

const summary = ref({});
const pic_id = ref('');
const location_id = ref('');
const date_from = ref('');
const date_to = ref('');
const locations = ref([]);
const loading = ref(false);
const errorMsg = ref('');

const hasActiveFilters = computed(() => !!(pic_id.value || location_id.value || date_from.value || date_to.value));

const fetchSummary = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await MarketingDashboardService.getSummary({
      pic_id: pic_id.value,
      location_id: location_id.value,
      date_from: date_from.value,
      date_to: date_to.value,
    });
    summary.value = res.data || res;
  } catch (err) {
    errorMsg.value = err?.response?.data?.message || 'Gagal memuat dashboard Marketing.';
    console.error('Failed to fetch marketing dashboard summary', err);
  } finally {
    loading.value = false;
  }
};

const fetchLocations = async () => {
  try {
    const res = await LocationService.getAll({ limit: 200 });
    locations.value = res.data || [];
  } catch (err) {
    console.error('Failed to fetch locations', err);
  }
};

const resetFilters = () => {
  pic_id.value = '';
  location_id.value = '';
  date_from.value = '';
  date_to.value = '';
};

onMounted(() => {
  fetchSummary();
  fetchLocations();
});

watch([pic_id, location_id, date_from, date_to], () => {
  fetchSummary();
});
</script>

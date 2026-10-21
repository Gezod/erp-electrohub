<template>
  <admin-layout>
    <div class="space-y-6">

      <!-- Filter Bar -->
      <div class="rounded-2xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <p class="text-xs text-gray-400 dark:text-gray-500 font-medium shrink-0">
            <span v-if="summary.viewer?.canFilterByPic">Menampilkan data seluruh tim GA</span>
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

      <!-- Top Summary Metrics -->
      <GATopSummary :stats="summary" />

      <!-- Main Analytics Section -->
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 lg:col-span-8 space-y-6">
          <!-- Trends Visualization -->
          <GATrendsChart :trends="summary.trends" />

          <!-- Activities Table -->
          <GARecentActivities :stats="summary" />
        </div>

        <!-- Sidebar / Navigation Section -->
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <!-- Module Distribution (Radial Bar Chart) -->
          <div class="rounded-2xl border border-gray-150 bg-white p-6 dark:bg-gray-900 dark:border-gray-850 shadow-sm">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-6  tracking-wider">Distribusi</h3>
            <GAModuleDistribution :stats="summary" />
          </div>

          <!-- Top PIC Leaderboard (Manager/Chief saja) -->
          <GATopPicLeaderboard v-if="summary.viewer?.canFilterByPic" :top-pic="summary.top_pic" />

          <!-- Status Breakdown -->
          <GAStatusBreakdown :stats="summary" />

          <!-- Quick Actions -->
          <div class="rounded-2xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-6  tracking-wider">Aksi Cepat</h3>

            <div class="space-y-4">
              <!-- Request Barang -->
              <router-link :to="{ name: 'TranRequests' }" class="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-800 dark:text-white transition-all border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">
                    <ClipboardPlus class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-gray-800 dark:text-white">Request Barang</span>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium">Ajukan kebutuhan barang baru untuk departemen</span>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </router-link>

              <!-- Proses Pembelian -->
              <router-link :to="{ name: 'TranPurchases' }" class="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-800 dark:text-white transition-all border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">
                    <Wallet class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-gray-800 dark:text-white">Proses Pembelian</span>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium">Pantau dan kelola status order pembelian</span>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </router-link>

              <!-- Tiket Perbaikan -->
              <router-link :to="{ name: 'TranMaintenance' }" class="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-800 dark:text-white transition-all border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">
                    <Wrench class="w-5 h-5" />
                  </div>
                  <div class="flex flex-col text-left">
                    <span class="text-xs font-bold text-gray-800 dark:text-white">Tiket Perbaikan</span>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium">Laporkan kerusakan atau masalah peralatan</span>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </router-link>
            </div>
          </div>
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
import GATopSummary from './components/GATopSummary.vue';
import GARecentActivities from './components/GARecentActivities.vue';
import GATrendsChart from './components/GATrendsChart.vue';
import GAModuleDistribution from './components/GAModuleDistribution.vue';
import GAStatusBreakdown from './components/GAStatusBreakdown.vue';
import GATopPicLeaderboard from './components/GATopPicLeaderboard.vue';
import { GADashboardService } from './dashboard.service';
import { LocationService } from '@/modules/master/locations/location.service';
import {
  User, RotateCcw, Plus, ShoppingBag, Wrench,
  LayoutDashboard, PieChart, Zap, ChevronRight,
  ClipboardPlus, Wallet
} from 'lucide-vue-next';

const summary = ref({});
const pic_id = ref('');
const location_id = ref('');
const date_from = ref('');
const date_to = ref('');
const locations = ref([]);
const loading = ref(false);

const hasActiveFilters = computed(() => !!(pic_id.value || location_id.value || date_from.value || date_to.value));

const fetchSummary = async () => {
  loading.value = true;
  try {
    const res = await GADashboardService.getSummary({
      pic_id: pic_id.value,
      location_id: location_id.value,
      date_from: date_from.value,
      date_to: date_to.value,
    });
    summary.value = res.data || res;
  } catch (err) {
    console.error('Failed to fetch dashboard summary', err);
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

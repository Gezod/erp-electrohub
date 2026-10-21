<template>
  <AdminLayout>
    <div class="mx-auto max-w-(--breakpoint-2xl) space-y-6 text-gray-800 dark:text-white/90">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <Bell class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">
              Notifikasi Sistem</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">
              Pengingat & Pemberitahuan Jatuh Tempo &bull; Transaksi</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <FilterButton v-model:active="showFilter" />
        </div>
      </div>

      <!--  NOTIFIKASI JATUH TEMPO (PREMIUM CARDS) -->
      <div v-if="reminderStore.dueTodayCount > 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
            <h3 class="text-lg font-black tracking-tight text-gray-800 dark:text-white uppercase">
              Urgent Reminders <span
                class="ml-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs dark:bg-red-500/20 dark:text-red-400">{{
                  reminderStore.dueTodayCount }}</span>
            </h3>
          </div>
          <button @click="showDueTodayOnly = !showDueTodayOnly"
            class="text-sm font-bold text-blue-600 hover:text-blue-700 transition">
            {{ showDueTodayOnly ? 'Tampilkan Semua Data' : 'Filter Tabel' }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="item in reminderStore.dueTodayItems.slice(0, 3)" :key="item.id"
            class="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300">
            <!-- Background Decoration -->
            <div
              class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors">
            </div>

            <div class="relative z-10 flex flex-col h-full">
              <div class="flex justify-between items-start mb-4">
                <div :class="[
                  'p-3 rounded-2xl shadow-sm',
                  getReminderTypeBg(item.reminderType)
                ]">
                  <component :is="getReminderIcon(item.reminderType)" class="w-6 h-6" />
                </div>
                <Badge :color="isOverdue(item.dueDate) ? 'error' : 'warning'" variant="light" class="animate-pulse">
                  {{ getDueStatus(item.dueDate) }}
                </Badge>
              </div>

              <div class="flex-1">
                <h4 class="font-black text-gray-900 dark:text-white mb-1 line-clamp-1 capitalize">{{
                  item.reminderType.replace('_', ' ') }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-2 leading-relaxed">
                  {{ item.description }}
                </p>
              </div>

              <div class="mt-5 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Calendar class="w-3.5 h-3.5" />
                  {{ formatDate(item.dueDate) }}
                </div>
                <button @click="handleMarkDone(item.id)"
                  class="px-4 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all duration-200">
                  Selesaikan
                </button>
              </div>
            </div>
          </div>

          <!-- View More Card if > 3 -->
          <div v-if="reminderStore.dueTodayCount > 3" @click="showDueTodayOnly = true"
            class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
            <div
              class="w-12 h-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Plus class="w-6 h-6 text-gray-400" />
            </div>
            <span class="text-sm font-bold text-gray-500">Lihat {{ reminderStore.dueTodayCount - 3 }} Lainnya</span>
          </div>
        </div>
      </div>

      <!-- Reusable Filter Section -->
      <FilterCard :show="showFilter" cols="3">
        <!-- Search -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Search</label>
          <div class="relative">
            <input v-model="filters.search" type="text" placeholder="Ketik kata kunci..."
              class="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium" />
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <!-- Tipe Reminder -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Tipe</label>
          <select v-model="filters.reminder_type"
            class="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white font-semibold cursor-pointer">
            <option value="">Semua Tipe</option>
            <option value="stnk">STNK (Vehicle)</option>
            <option value="license_expired">Licenses</option>
            <option value="service_vehicle">Vehicle Service</option>
            <option value="cctv">CCTV</option>
            <option value="set_cctv">Pemasangan CCTV</option>
            <option value="schedule">Schedules</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
          <select v-model="filters.status"
            class="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white font-semibold cursor-pointer">
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="active">Aktif</option>
            <option value="done">Selesai</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <!-- Date Ranges -->
        <div class="md:col-span-2 flex gap-4">
          <div class="flex-1">
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Dari</label>
            <DatePicker v-model="filters.due_after" placeholder="Mulai Tanggal" />
          </div>
          <div class="flex-1">
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Sampai</label>
            <DatePicker v-model="filters.due_before" placeholder="Sampai Tanggal" />
          </div>
        </div>

        <template #footer>
          <p class="text-[10px] text-gray-400 font-medium italic">
            * Pencarian dilakukan pada deskripsi pengingat.
          </p>
          <button @click="resetFilters"
            class="text-xs font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1">
            <RotateCcw class="w-3.5 h-3.5" />
            Reset Filter
          </button>
        </template>
      </FilterCard>

      <!-- Table Section -->
      <div
        class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm overflow-hidden">
        <!-- Data Table -->
        <DataTable :columns="tableColumns" :data="displayedData" :loading="reminderStore.isLoading"
          :server-side="!showDueTodayOnly"
          :total-items="showDueTodayOnly ? reminderStore.dueTodayCount : reminderStore.pagination.totalData"
          :current-page="reminderStore.pagination.currentPage" :items-per-page="reminderStore.pagination.dataPerPage"
          @update:current-page="handlePageChange">
          <!-- Custom Cell: Tipe -->
          <template #cell-reminderType="{ item }">
            <Badge :color="getReminderTypeColor(item.reminderType)" variant="light" class="capitalize font-bold">
              {{ item.reminderType }}
            </Badge>
          </template>

          <!-- Custom Cell: Due Date -->
          <template #cell-dueDate="{ item }">
            <span
              :class="['text-sm font-semibold', isOverdue(item.dueDate) && item.status !== 'done' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300']">
              {{ formatDate(item.dueDate) }}
            </span>
          </template>

          <!-- Custom Cell: Alert Before -->
          <template #cell-alertDateBefore="{ item }">
            <div class="flex flex-wrap gap-1">
              <span v-for="day in item.alertDateBefore" :key="day"
                class="px-2 py-0.5 bg-brand-50/50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black rounded-md border border-brand-100/50 dark:border-brand-500/20">
                H-{{ day }}
              </span>
              <span v-if="!item.alertDateBefore?.length" class="text-gray-300 font-bold">-</span>
            </div>
          </template>

          <!-- Custom Cell: Reference -->
          <template #cell-tableReference="{ item }">
            <span
              class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">
              {{ item.tableReference }}
            </span>
          </template>

          <template #cell-description="{ item }">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1" :title="item.description">
              {{ item.description }}
            </span>
          </template>

          <!-- Custom Cell: Status -->
          <template #cell-status="{ item }">
            <Badge :color="getStatusColor(item.status)" variant="light" class="uppercase text-[10px] tracking-widest">
              {{ item.status }}
            </Badge>
          </template>

          <!-- Custom Cell: Action -->
          <template #cell-action="{ item }">
            <div class="flex items-center gap-4">
              <router-link v-can="'reminders:read'" :to="{ name: 'ReminderEdit', params: { id: item.id } }"
                class="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-sm transition">
                <Eye class="w-4 h-4" />
              </router-link>

              <template v-if="item.status !== 'done'">
                <button v-can="'reminders:update'" @click="handleMarkDone(item.id)"
                  class="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition">
                  Selesai
                </button>
              </template>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import Badge from '@/components/ui/Badge.vue';
import FilterButton from '@/components/common/FilterButton.vue';
import FilterCard from '@/components/common/FilterCard.vue';
import { Alert } from '@/plugins/sweetalert';
import { useReminder } from './composables/useReminder';
import DatePicker from '@/components/ui/DatePicker.vue';

import {
  Search, BellRing, AlertTriangle,
  CheckCircle2, Trash2, RotateCcw, Eye,
  Calendar, Plus, ShieldCheck, Car, Settings,
  Wrench, ClipboardList, Info, Bell
} from 'lucide-vue-next';

const showDueTodayOnly = ref(false);
const showFilter = ref(true);
const router = useRouter();
const { filters, reminderStore, handlePageChange, resetFilters, fetchData } = useReminder();

const tableColumns = [
  { key: 'reminderType', label: 'Tipe' },
  { key: 'tableReference', label: 'Referensi' },
  { key: 'dueDate', label: 'Jatuh Tempo' },
  { key: 'alertDateBefore', label: 'Pengingat' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Aksi' }
];

// --- Computed ---

const displayedData = computed(() => {
  return showDueTodayOnly.value ? reminderStore.dueTodayItems : reminderStore.reminders;
});

// --- Actions ---

const handleMarkDone = async (id) => {
  const confirmed = await Alert.confirm(
    'Tandai Selesai?',
    'Reminder ini akan ditandai sebagai "Selesai" dan tidak akan memicu notifikasi lagi.',
    'Ya, Selesai'
  );
  if (confirmed) {
    try {
      await reminderStore.markAsDone(id);
      Alert.success('Berhasil', 'Pengingat telah diselesaikan');
      fetchData(reminderStore.pagination.currentPage);
    } catch (error) {
      Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan sistem');
    }
  }
};

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Pengingat?', 'Data pengingat akan dihapus secara permanen.');
  if (confirmed) {
    try {
      await reminderStore.deleteReminder(id);
      Alert.success('Berhasil', 'Pengingat telah dihapus');
      fetchData(reminderStore.pagination.currentPage);
    } catch (err) {
      Alert.error('Gagal', err.response?.data?.message || 'Gagal menghapus data');
    }
  }
};


// --- Helpers ---

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString));
};

const getReminderTypeColor = (type) => {
  const map = {
    stnk: 'info',
    license_expired: 'warning',
    service_vehicle: 'primary',
    cctv: 'neutral',
    set_cctv: 'success',
    schedule: 'error',
    other: 'neutral'
  };
  return map[type?.toLowerCase()] || 'neutral';
};

const getStatusColor = (status) => {
  const map = {
    draft: 'neutral',
    active: 'info',
    done: 'success',
    overdue: 'error'
  };
  return map[status?.toLowerCase()] || 'neutral';
};

const getReminderIcon = (type) => {
  const map = {
    stnk: Car,
    license_expired: ShieldCheck,
    service_vehicle: Wrench,
    cctv: Settings,
    set_cctv: ClipboardList,
    schedule: Calendar
  };
  return map[type?.toLowerCase()] || Info;
};

const getReminderTypeBg = (type) => {
  const map = {
    stnk: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    license_expired: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    service_vehicle: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    cctv: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    set_cctv: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    schedule: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
  };
  return map[type?.toLowerCase()] || 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400';
};

const getDueStatus = (dueDate) => {
  if (!dueDate) return 'Unknown';
  const target = new Date(dueDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Due Today';
  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`;
  return `H-${diffDays}`;
};

const isOverdue = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date().setHours(0, 0, 0, 0);
};
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

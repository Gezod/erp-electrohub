<template>
  <AdminLayout>
    <div class="mx-auto max-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <Send class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">WhatsApp Broadcast</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Human Resource • Kirim Pesan Massal</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-3">
          <div class="relative w-full sm:w-64">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchQuery" @input="debounceSearch" type="text" placeholder="Cari batch..."
              class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition text-sm font-bold" />
          </div>
          <button @click="router.push({ name: 'HrBroadcastCreate' })"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            <Plus class="w-5 h-5" />
            Buat Broadcast
          </button>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div v-for="stat in stats" :key="stat.label"
          :class="stat.bg"
          class="p-5 rounded-3xl border flex items-center gap-4">
          <div :class="stat.iconBg" class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <component :is="stat.icon" :class="stat.iconColor" class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ stat.label }}</p>
            <p class="text-xl font-black text-gray-800 dark:text-white">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <DataTable :columns="columns" :data="items" :loading="isLoading"
          :server-side="true" :total-items="pagination.totalData" v-model:current-page="pagination.currentPage" :items-per-page="pagination.dataPerPage">
          <template #cell-name="{ item }">
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-800 dark:text-white">{{ item.name }}</span>
              <span class="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{{ item.subject }}</span>
            </div>
          </template>

          <template #cell-progress="{ item }">
            <div class="space-y-1">
              <div class="flex items-center justify-between text-[10px] font-bold">
                <span class="text-emerald-600">{{ item.sent_count }}/{{ item.total_count }}</span>
                <span v-if="item.fail_count > 0" class="text-rose-500">{{ item.fail_count }} gagal</span>
              </div>
              <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full transition-all"
                  :style="{ width: `${item.total_count > 0 ? (item.sent_count / item.total_count) * 100 : 0}%` }"></div>
              </div>
            </div>
          </template>

          <template #cell-status="{ item }">
            <span :class="getStatusBadge(item.status)"
              class="px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest">
              {{ formatStatus(item.status) }}
            </span>
          </template>

          <template #cell-created_at="{ item }">
            <span class="text-xs text-gray-500 font-medium">{{ formatDate(item.created_at, 'DD/MM/YY HH:mm') }}</span>
          </template>

          <template #cell-action="{ item }">
            <div class="flex items-center gap-2">
              <button @click="handleViewDetail(item)"
                class="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                <Eye class="w-4 h-4" />
              </button>
              <button v-if="item.fail_count > 0" @click="handleRetry(item)"
                class="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" title="Retry Gagal">
                <RotateCcw class="w-4 h-4" />
              </button>
            </div>
          </template>
        </DataTable>
      </div>

      <!-- Detail Modal -->
      <Teleport to="body">
        <div v-if="selectedBatch" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" @click="selectedBatch = null"></div>
          <div class="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 max-h-[80vh] flex flex-col">
            <div class="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div>
                <h3 class="text-lg font-black text-gray-800 dark:text-white">{{ selectedBatch.name }}</h3>
                <p class="text-xs text-gray-400 font-medium mt-0.5">{{ selectedBatch.subject }}</p>
              </div>
              <button @click="selectedBatch = null" class="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-8 space-y-6">
              <!-- Body preview -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Isi Pesan WhatsApp</p>
                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium leading-relaxed">{{ selectedBatch.body }}</p>
              </div>

              <!-- Recipients list -->
              <div v-if="selectedBatch.recipients?.length">
                <div class="flex items-center justify-between mb-4">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Penerima ({{ selectedBatch.total_count }})</p>
                  <div class="relative w-48">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input v-model="recipientSearch" @input="debounceRecipientSearch" type="text" placeholder="Cari nama..."
                      class="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-[10px] font-bold focus:border-emerald-500 transition" />
                  </div>
                </div>

                <div class="space-y-2 mb-6">
                  <div v-for="r in selectedBatch.recipients" :key="r.id"
                    class="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-all group">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                        <User class="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ r.name }}</p>
                        <p class="text-[10px] text-gray-400 font-mono">{{ r.phone }}</p>
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-1.5">
                      <span :class="getStatusBadge(r.status)" class="px-2 py-0.5 rounded-lg text-[9px] font-black border uppercase tracking-widest">{{ r.status }}</span>
                      <span v-if="r.sent_at" class="text-[8px] text-gray-400 font-bold uppercase">{{ formatDate(r.sent_at, 'DD/MM HH:mm') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Recipient Pagination -->
                <div v-if="recipientPagination.totalPages > 1" class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Halaman {{ recipientPagination.currentPage }} dari {{ recipientPagination.totalPages }}</p>
                  <div class="flex gap-2">
                    <button @click="changeRecipientPage(recipientPagination.currentPage - 1)" :disabled="recipientPagination.currentPage === 1"
                      class="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 disabled:opacity-30">
                      <ChevronLeft class="w-4 h-4" />
                    </button>
                    <button @click="changeRecipientPage(recipientPagination.currentPage + 1)" :disabled="recipientPagination.currentPage === recipientPagination.totalPages"
                      class="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 disabled:opacity-30">
                      <ChevronRight class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </AdminLayout>
</template>

<script>
import { ref } from 'vue';
import { registerFilterReset } from '@/utils/filterRegistry';

// searchQuery + pagination di module scope agar posisi & pencarian bertahan saat
// kembali dari halaman buat batch; didaftarkan ke registerFilterReset() untuk logout.
const makeDefaultPagination = () => ({ totalData: 0, currentPage: 1, totalPages: 1, dataPerPage: 10 });
const searchQuery = ref('');
const pagination = ref(makeDefaultPagination());

registerFilterReset(() => {
  searchQuery.value = '';
  pagination.value = makeDefaultPagination();
});
</script>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import { Send, Plus, Eye, RotateCcw, X, CheckCircle, Clock, AlertCircle, Activity, Search, User, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { BroadcastService } from './broadcast.service';
import { Alert } from '@/plugins/sweetalert';
import { markRaw } from 'vue';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

const router = useRouter();
const isLoading = ref(false);
const items = ref([]);
const dashboardData = ref(null);
// Modal State
const selectedBatch = ref(null);
const recipientSearch = ref('');
const recipientPagination = ref({
  currentPage: 1,
  totalPages: 1,
  dataPerPage: 10
});

const columns = [
  { key: 'name', label: 'Nama Batch' },
  { key: 'progress', label: 'Progress' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Dibuat' },
  { key: 'action', label: '' }
];

const stats = computed(() => [
  { label: 'Total Batch', value: dashboardData.value?.total_batch || 0, icon: markRaw(Activity), bg: 'bg-violet-50 border-violet-100', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  { label: 'Terkirim', value: dashboardData.value?.terkirim || 0, icon: markRaw(CheckCircle), bg: 'bg-emerald-50 border-emerald-100', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { label: 'Proses', value: dashboardData.value?.proses || 0, icon: markRaw(Clock), bg: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { label: 'Ada Gagal', value: dashboardData.value?.ada_gagal || 0, icon: markRaw(AlertCircle), bg: 'bg-rose-50 border-rose-100', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' }
]);

const formatDate = (d, fmt) => dayjs(d).format(fmt);
const formatStatus = (s) => ({ pending: 'Pending', processing: 'Proses', completed: 'Selesai', failed: 'Gagal' }[s] || s);
const getStatusBadge = (s) => ({ 
  pending: 'bg-gray-50 text-gray-500 border-gray-100', 
  processing: 'bg-amber-50 text-amber-600 border-amber-100', 
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-100', 
  failed: 'bg-rose-50 text-rose-600 border-rose-100', 
  sent: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  delivered: 'bg-blue-50 text-blue-600 border-blue-100',
  read: 'bg-indigo-50 text-indigo-600 border-indigo-100'
}[s] || 'bg-gray-50 text-gray-400 border-gray-100');

const fetchData = async () => {
  isLoading.value = true;
  try {
    const result = await BroadcastService.getAll({ 
      page: pagination.value.currentPage,
      limit: pagination.value.dataPerPage,
      search: searchQuery.value 
    });
    items.value = result.data;
    dashboardData.value = result.dashboard;
    if (result.pagination) {
      pagination.value = result.pagination;
    }
  } finally {
    isLoading.value = false;
  }
};

const debounceSearch = debounce(() => {
  pagination.value.currentPage = 1;
  fetchData();
}, 500);

const handleViewDetail = async (item) => {
  try {
    recipientPagination.value.currentPage = 1;
    const result = await BroadcastService.getById(item.id, {
      page: recipientPagination.value.currentPage,
      limit: recipientPagination.value.dataPerPage,
      search: recipientSearch.value
    });
    selectedBatch.value = result;
    if (result.pagination) {
      recipientPagination.value = result.pagination;
    }
  } catch { Alert.error('Error', 'Gagal memuat detail'); }
};

const fetchRecipients = async () => {
  if (!selectedBatch.value) return;
  try {
    const result = await BroadcastService.getById(selectedBatch.value.id, {
      page: recipientPagination.value.currentPage,
      limit: recipientPagination.value.dataPerPage,
      search: recipientSearch.value
    });
    selectedBatch.value.recipients = result.recipients;
    if (result.pagination) {
      recipientPagination.value = result.pagination;
    }
  } catch { Alert.error('Error', 'Gagal memuat penerima'); }
};

const debounceRecipientSearch = debounce(() => {
  recipientPagination.value.currentPage = 1;
  fetchRecipients();
}, 500);

const changeRecipientPage = (page) => {
  recipientPagination.value.currentPage = page;
  fetchRecipients();
};

const handleRetry = async (item) => {
  const confirmed = await Alert.confirm('Retry Gagal?', `Akan mencoba kirim ulang ${item.fail_count} penerima yang gagal.`);
  if (confirmed) {
    try {
      await BroadcastService.retryFailed(item.id);
      Alert.success('Berhasil', 'Proses retry dimulai');
      fetchData();
    } catch { Alert.error('Gagal', 'Gagal melakukan retry'); }
  }
};

watch(() => pagination.value.currentPage, fetchData);

onMounted(fetchData);
</script>

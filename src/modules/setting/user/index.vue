<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Header & Breadcrumb -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Manajemen Akun Sistem</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Kredensial &bull; Akses Superadmin &bull; Security</p>
          </div>
        </div>
      </div>

      <div class="mb-8 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs">
        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-2 text-gray-400 dark:text-gray-500">
             <Search class="w-4 h-4" />
             <span class="text-[10px] font-bold uppercase tracking-widest">Cari Pengguna</span>
          </div>
          <div class="relative max-w-md">
            <input v-model="searchKeyword" type="text" placeholder="Masukkan Email atau Nama..."
              class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:text-white" />
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
        <DataTable 
          :columns="tableColumns" 
          :data="userStore.users" 
          :loading="userStore.isLoading"
          :server-side="true"
          :total-items="userStore.pagination.totalData"
          :current-page="userStore.pagination.currentPage"
          :items-per-page="userStore.pagination.dataPerPage"
          @update:current-page="handlePageChange"
        >
          <!-- Custom Cells -->
          <template #cell-fullName="{ item }">
            <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                  <img v-if="item.avatarUrl" :src="item.avatarUrl" class="w-full h-full object-cover" />
                  <User v-else class="w-5 h-5" />
               </div>
               <div class="flex flex-col">
                  <span class="font-bold text-gray-700 dark:text-gray-200 leading-tight">{{ item.fullName }}</span>
                  <span class="text-[11px] text-gray-400 dark:text-gray-500 font-medium italic mt-0.5">{{ item.email }}</span>
               </div>
            </div>
          </template>

          <template #cell-isSuperadmin="{ item }">
            <span v-if="item.isSuperadmin" class="inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Superadmin
            </span>
            <span v-else class="inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700">
              Regular User
            </span>
          </template>

          <template #cell-lastLoginAt="{ item }">
            <span class="text-xs font-bold text-gray-600 dark:text-gray-400">
              {{ formatDate(item.lastLoginAt) }}
            </span>
          </template>

          <template #cell-action="{ item }">
            <div class="flex items-center gap-2">
              <button 
                v-can="'rbac:update'"
                @click="router.push({ name: 'UserEdit', params: { id: item.id } })"
                class="p-2.5 text-gray-400 dark:text-gray-500 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-all active:scale-90">
                <Edit2 class="w-4.5 h-4.5" />
              </button>
              <button 
                v-can="'rbac:delete'"
                @click="handleDelete(item.id)"
                class="p-2.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-90">
                <Trash2 class="w-4.5 h-4.5" />
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref } from 'vue';
import { registerFilterReset } from '@/utils/filterRegistry';

// Filter di module scope agar bertahan saat kembali dari form; didaftarkan ke
// registerFilterReset() supaya ikut dibersihkan oleh resetAppCache saat logout.
const searchKeyword = ref('');

registerFilterReset(() => {
  searchKeyword.value = '';
});
</script>

<script setup>
import { watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import DataTable from '@/components/tables/DataTable.vue';
import { Alert } from '@/plugins/sweetalert';

// Icons
import { Search, Edit2, Trash2, User, Users } from 'lucide-vue-next';

// Store
import { useUserStore } from './user.store';

const router = useRouter();
const userStore = useUserStore();

// --- State ---
const tableColumns = [
  { key: 'fullName', label: 'Pengguna' },
  { key: 'isSuperadmin', label: 'Akses' },
  { key: 'lastLoginAt', label: 'Terakhir Login' },
  { key: 'action', label: 'Aksi' }
];

// --- Methods ---

const fetchData = async (page = 1) => {
  const params = {
    page,
    limit: userStore.pagination.dataPerPage || 10,
    search: searchKeyword.value || ''
  };
  await userStore.fetchUsers(params);
};

// Debounced Search
const handleSearch = debounce(() => {
  fetchData(1);
}, 500);

const handlePageChange = (newPage) => {
  fetchData(newPage);
};

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Akun?', 'Tindakan ini akan mencabut akses user ini secara permanen.');
  if (confirmed) {
    try {
      await userStore.deleteUser(id);
      Alert.toast('Akun berhasil dihapus.');
      fetchData(userStore.pagination.currentPage);
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.';
      Alert.error('Gagal!', msg);
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

// --- Watchers & Lifecycle ---

watch(searchKeyword, () => {
  handleSearch();
});

onMounted(() => {
  // Pertahankan halaman terakhir saat kembali dari form.
  fetchData(userStore.pagination.currentPage || 1);
});
</script>

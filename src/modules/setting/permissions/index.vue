<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">Manajemen Hak Akses</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Konfigurasi Master Permission & RBAC</p>
          </div>
        </div>
        
        <button 
          v-can="'permissions:create'"
          @click="router.push({ name: 'PermissionsCreate' })"
          class="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95">
          <Plus class="w-5 h-5" />
          Registrasi Permission
        </button>
      </div>

      <!-- Filters Section -->
      <div class="mb-8 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs">
        <div class="flex flex-col gap-6">
          <div class="flex items-center gap-2 text-gray-400 dark:text-gray-500">
             <Filter class="w-4 h-4" />
             <span class="text-[10px] font-bold uppercase tracking-widest">Filter Data Master</span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Search -->
            <div class="md:col-span-2 relative">
              <input 
                v-model="filters.search" 
                type="text" 
                placeholder="Cari Kode atau Nama Akses..."
                class="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:text-white" 
              />
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Search class="w-5 h-5" />
              </div>
            </div>

            <!-- Module Filter -->
            <div class="relative">
              <select v-model="filters.module"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-gray-600 dark:text-gray-300">
                <option value="">Semua Modul</option>
                <option v-for="mod in moduleOptions" :key="mod" :value="mod">
                  {{ formatLabel(mod) }}
                </option>
              </select>
            </div>

            <!-- Action Filter -->
            <div class="relative">
              <select v-model="filters.action"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-gray-600 dark:text-gray-300">
                <option value="">Semua Aksi</option>
                <option value="read">Read (Lihat)</option>
                <option value="create">Create (Tambah)</option>
                <option value="update">Update (Ubah)</option>
                <option value="delete">Delete (Hapus)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
        <DataTable 
          :columns="columns" 
          :data="permissionsStore.permissions" 
          :loading="permissionsStore.isLoading"
          :server-side="true"
          :total-items="permissionsStore.pagination.totalData"
          :current-page="permissionsStore.pagination.currentPage"
          :items-per-page="permissionsStore.pagination.dataPerPage"
          @update:current-page="handlePageChange"
        >
          <!-- Custom Cells -->
          <template #cell-code="{ item }">
            <span class="inline-flex items-center px-2.5 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md text-[10px] font-mono font-bold border border-gray-100 dark:border-gray-700 font-mono">
              {{ item.code }}
            </span>
          </template>

          <template #cell-module="{ item }">
            <span class="inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20">
              {{ item.module }}
            </span>
          </template>

          <template #cell-action="{ item }">
            <span :class="getActionClass(item.action)" class="inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border">
              {{ item.action }}
            </span>
          </template>

          <template #cell-actions_buttons="{ item }">
            <div class="flex items-center justify-end gap-2 pr-2">
              <router-link 
                v-can="'permissions:update'"
                :to="{ name: 'PermissionsEdit', params: { id: item.id } }"
                class="p-2 text-gray-400 hover:text-brand-500 rounded-lg transition-all"
                title="Edit"
              >
                <Pencil class="w-4 h-4" />
              </router-link>
              <button 
                v-can="'permissions:delete'"
                @click="handleDelete(item.id)"
                class="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                title="Delete"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { reactive } from 'vue';
import { registerFilterReset } from '@/utils/filterRegistry';

// Filter di module scope agar bertahan saat kembali dari form; didaftarkan ke
// registerFilterReset() supaya ikut dibersihkan oleh resetAppCache saat logout.
const filters = reactive({
  search: '',
  module: '',
  action: ''
});

registerFilterReset(() => {
  filters.search = '';
  filters.module = '';
  filters.action = '';
});
</script>

<script setup>
import { watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import DataTable from '@/components/tables/DataTable.vue';
import { Search, Plus, ShieldCheck, Filter, Pencil, Trash2 } from 'lucide-vue-next';
import { Alert } from '@/plugins/sweetalert';

// Store
import { usePermissionsStore } from './permissions.store';

const router = useRouter();
const permissionsStore = usePermissionsStore();

// --- State ---
const moduleOptions = [
  'assets',
  'users',
  'employees',
  'locations',
  'categories',
  'divisions',
  'roles',
  'permissions',
  'menu',
  'todo'
];

const columns = [
  { key: 'code', label: 'Kode' },
  { key: 'name', label: 'Nama Akses' },
  { key: 'module', label: 'Modul' },
  { key: 'action', label: 'Aksi' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'actions_buttons', label: 'Tindakan', align: 'right' }
];

// --- Methods ---

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm(
    'Hapus Permission?',
    'Permission ini akan dihapus secara permanen dari sistem.',
    'Ya, Hapus'
  );
  
  if (confirmed) {
    try {
      await permissionsStore.deletePermission(id);
      Alert.success('Berhasil', 'Permission telah dihapus');
      fetchData(permissionsStore.pagination.currentPage);
    } catch (error) {
      Alert.error('Gagal', error.response?.data?.message || 'Gagal menghapus permission');
    }
  }
};

const fetchData = async (page = 1) => {
  const params = {
    page,
    limit: permissionsStore.pagination.dataPerPage || 10,
    search: filters.search || '',
    module: filters.module || '',
    action: filters.action || ''
  };
  await permissionsStore.fetchPermissions(params);
};

// Debounced Search Handler
const debouncedFetch = debounce(() => {
  fetchData(1);
}, 500);

const handlePageChange = (newPage) => {
  fetchData(newPage);
};

const formatLabel = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getActionClass = (action) => {
  const map = {
    'read': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'create': 'bg-blue-50 text-blue-600 border-blue-100',
    'update': 'bg-amber-50 text-amber-600 border-amber-100',
    'delete': 'bg-red-50 text-red-600 border-red-100'
  };
  return map[action.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-100';
};

// --- Watchers & Lifecycle ---

// Watch for search filter (with debounce)
watch(() => filters.search, () => {
  debouncedFetch();
});

// Watch for dropdown filters (immediate)
watch([() => filters.module, () => filters.action], () => {
  fetchData(1);
});

onMounted(() => {
  // Pertahankan halaman terakhir saat kembali dari form.
  fetchData(permissionsStore.pagination.currentPage || 1);
});
</script>

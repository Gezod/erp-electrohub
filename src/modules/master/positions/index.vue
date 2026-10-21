<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">
      
      <!-- Top Controls Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <!-- Left: Search Input Component -->
        <SearchInput
          v-model="appliedFilters.search"
          placeholder="Cari nama atau kode jabatan..."
          @search="handleSearchChange"
        />

        <!-- Right: Actions (Tambah Jabatan) -->
        <div class="flex items-center gap-3 shrink-0">
          <GlossyButton 
            v-can="'positions:create'"
            @click="handleCreate"
          >
            <Plus class="w-5 h-5" />
            <span>Tambah Jabatan</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Data Table -->
      <DataTable 
        title="Daftar Master Jabatan" 
        subtitle="Struktur hirarki dan konfigurasi jabatan organisasi"
        :columns="tableColumns" 
        :data="positionStore.positions" 
        :loading="positionStore.isLoading"
        :server-side="true"
        :total-items="positionStore.pagination.totalData"
        :current-page="positionStore.pagination.currentPage"
        :items-per-page="positionStore.pagination.dataPerPage"
        permission-prefix="positions"
        @edit="handleEdit"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
      >
        <!-- Status Cell -->
        <template #cell-isActive="{ item }">
          <span 
            :class="item.isActive 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
              : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border uppercase tracking-wider"
          >
            {{ item.isActive ? 'Aktif' : 'Tidak Aktif' }}
          </span>
        </template>
      </DataTable>

      <!-- Reusable Position Form Modal (Floating Dialog) -->
      <PositionFormModal
        v-model="showFormModal"
        :position-id="selectedEditPositionId"
        @saved="fetchData(positionStore.pagination.currentPage)"
      />

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import PositionFormModal from './components/PositionFormModal.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import { Plus } from 'lucide-vue-next';

// Store & Alerts
import { usePositionStore } from './position.store';
import { Alert } from '@/plugins/sweetalert';

const positionStore = usePositionStore();

// --- Modal States ---
const showFormModal = ref(false);
const selectedEditPositionId = ref(null);

const handleCreate = () => {
  selectedEditPositionId.value = null;
  showFormModal.value = true;
};

const handleEdit = (item) => {
  selectedEditPositionId.value = item.id;
  showFormModal.value = true;
};

// --- Filters State ---
const appliedFilters = reactive({
  search: ''
});

const handleSearchChange = (val) => {
  appliedFilters.search = val;
  fetchData(1);
};

// --- Table Setup ---
const tableColumns = [
  { key: 'code', label: 'Kode Jabatan' },
  { key: 'name', label: 'Nama Jabatan' },
  { key: 'sortOrder', label: 'Urutan', hideOnMobile: true },
  { key: 'isActive', label: 'Status' },
  { key: 'action', label: 'Action' }
];

// --- Actions ---

const fetchData = async (page = 1) => {
  const params = {
    page: page,
    limit: positionStore.pagination.dataPerPage || 10,
    search: appliedFilters.search || ''
  };
  
  try {
    await positionStore.fetchPositions(params);
  } catch (error) {
    console.error('Fetch positions error:', error);
  }
};

const handlePageChange = (newPage) => {
  fetchData(newPage);
};

const handleDelete = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const confirmed = await Alert.confirm(
    'Hapus Data Jabatan?',
    'Apakah Anda yakin ingin menghapus data jabatan ini secara permanen?',
    'Ya, Hapus'
  );

  if (confirmed) {
    try {
      await positionStore.deletePosition(id);
      Alert.success('Data jabatan berhasil dihapus.');
      await fetchData(positionStore.pagination.currentPage);
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data jabatan.';
      Alert.error('Gagal!', msg);
    }
  }
};

onMounted(() => {
  fetchData(positionStore.pagination.currentPage || 1);
});
</script>

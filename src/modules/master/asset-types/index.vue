<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">
      
      <!-- Top Controls Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <!-- Left: Search Input Component -->
        <SearchInput
          v-model="appliedFilters.search"
          placeholder="Cari nama tipe aset..."
          @search="handleSearchChange"
        />

        <!-- Right: Actions (Tambah Tipe Aset) -->
        <div class="flex items-center gap-3 shrink-0">
          <GlossyButton 
            v-can="'asset-types:create'"
            @click="handleCreate"
          >
            <Plus class="w-5 h-5" />
            <span>Tambah Tipe Aset</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Data Table -->
      <DataTable 
        title="Daftar Master Tipe Aset" 
        subtitle="Klasifikasi dan kategori jenis aset tetap perusahaan"
        :columns="tableColumns" 
        :data="assetTypeStore.assetTypes" 
        :loading="assetTypeStore.isLoading"
        :server-side="true"
        :total-items="assetTypeStore.pagination.totalData"
        :current-page="assetTypeStore.pagination.currentPage"
        :items-per-page="assetTypeStore.pagination.dataPerPage"
        permission-prefix="asset-types"
        @edit="handleEdit"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
      >
        <!-- Custom Cell for Status -->
        <template #cell-is_active="{ item }">
          <span 
            :class="item.is_active 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
              : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border uppercase tracking-wider"
          >
            {{ item.is_active ? 'Aktif' : 'Tidak Aktif' }}
          </span>
        </template>
      </DataTable>

      <!-- Reusable Asset Type Form Modal (Floating Dialog) -->
      <AssetTypeFormModal
        v-model="showFormModal"
        :asset-type-id="selectedEditAssetTypeId"
        @saved="fetchData(assetTypeStore.pagination.currentPage)"
      />

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import AssetTypeFormModal from './components/AssetTypeFormModal.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import { Plus } from 'lucide-vue-next';

// Store & Alerts
import { useAssetTypeStore } from './assetType.store';
import { Alert } from '@/plugins/sweetalert';

const assetTypeStore = useAssetTypeStore();

// --- Modal States ---
const showFormModal = ref(false);
const selectedEditAssetTypeId = ref(null);

const handleCreate = () => {
  selectedEditAssetTypeId.value = null;
  showFormModal.value = true;
};

const handleEdit = (item) => {
  selectedEditAssetTypeId.value = item.id;
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
  { key: 'name_type', label: 'Nama Tipe Aset' },
  { key: 'is_active', label: 'Status' },
  { key: 'action', label: 'Action' }
];

// --- Actions ---

const fetchData = async (page = 1) => {
  const params = {
    page: page,
    limit: assetTypeStore.pagination.dataPerPage || 10,
    search: appliedFilters.search || ''
  };
  
  try {
    await assetTypeStore.fetchAssetTypes(params);
  } catch (error) {
    console.error('Fetch asset types error:', error);
  }
};

const handlePageChange = (newPage) => {
  fetchData(newPage);
};

const handleDelete = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const confirmed = await Alert.confirm(
    'Hapus Tipe Aset?',
    'Apakah Anda yakin ingin menghapus data tipe aset ini secara permanen?',
    'Ya, Hapus'
  );

  if (confirmed) {
    try {
      await assetTypeStore.deleteAssetType(id);
      Alert.success('Data tipe aset berhasil dihapus.');
      await fetchData(assetTypeStore.pagination.currentPage);
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data tipe aset.';
      Alert.error('Gagal!', msg);
    }
  }
};

onMounted(() => {
  fetchData(assetTypeStore.pagination.currentPage || 1);
});
</script>

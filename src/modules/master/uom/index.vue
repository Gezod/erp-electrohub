<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">
      
      <!-- Top Controls Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <!-- Left: Search Input Component -->
        <SearchInput
          v-model="appliedFilters.search"
          placeholder="Cari kode atau nama satuan..."
          @search="handleSearchChange"
        />

        <!-- Right: Actions (Tambah Satuan) -->
        <div class="flex items-center gap-3 shrink-0">
          <GlossyButton 
            v-can="'uom:create'"
            @click="handleCreate"
          >
            <Plus class="w-5 h-5" />
            <span>Tambah Satuan</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Data Table -->
      <DataTable 
        title="Daftar Master Satuan (UOM)" 
        subtitle="Manajemen dan konfigurasi unit of measurement produk"
        :columns="tableColumns" 
        :data="uomStore.uoms" 
        :loading="uomStore.isLoading"
        :server-side="true"
        :total-items="uomStore.pagination.totalData"
        :current-page="uomStore.pagination.currentPage"
        :items-per-page="uomStore.pagination.dataPerPage"
        permission-prefix="uom"
        @edit="handleEdit"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
      >
        <!-- Header Actions: Reusable Status Tabs -->
        <template #header-actions>
          <StatusTabs
            v-model="appliedFilters.is_active"
            :tabs="statusTabs"
            @change="handleStatusTabChange"
          />
        </template>

        <!-- Custom Cell: Code -->
        <template #cell-code="{ item }">
          <span class="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-text-active rounded-md text-[12px] font-mono font-medium border border-gray-200 dark:border-gray-700 uppercase">
            {{ item.code }}
          </span>
        </template>

        <!-- Custom Cell: Goods Count -->
        <template #cell-goods_count="{ item }">
          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] bg-gray-100 dark:bg-gray-800 text-text-muted">
            {{ item.goods_count }} Produk
          </span>
        </template>

        <!-- Custom Cell: Status -->
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

      <!-- Reusable UOM Form Modal (Floating Dialog) -->
      <UomFormModal
        v-model="showFormModal"
        :uom-id="selectedEditUomId"
        @saved="fetchData(uomStore.pagination.currentPage)"
      />

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import StatusTabs from '@/components/common/StatusTabs.vue';
import UomFormModal from './components/UomFormModal.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import { Plus } from 'lucide-vue-next';

// Store & Alerts
import { useUomStore } from './uom.store';
import { Alert } from '@/plugins/sweetalert';

const uomStore = useUomStore();

// --- Modal States ---
const showFormModal = ref(false);
const selectedEditUomId = ref(null);

const handleCreate = () => {
  selectedEditUomId.value = null;
  showFormModal.value = true;
};

const handleEdit = (item) => {
  selectedEditUomId.value = item.id;
  showFormModal.value = true;
};

// --- Filters State ---
const appliedFilters = reactive({
  search: '',
  is_active: ''
});

const statusTabs = [
  { label: 'Semua', value: '' },
  { label: 'Aktif', value: true },
  { label: 'Tidak Aktif', value: false }
];

const handleSearchChange = (val) => {
  appliedFilters.search = val;
  fetchData(1);
};

const handleStatusTabChange = (val) => {
  appliedFilters.is_active = val;
  fetchData(1);
};

// --- Table Setup ---
const tableColumns = [
  { key: 'code', label: 'Kode Satuan' },
  { key: 'name', label: 'Nama Satuan' },
  { key: 'description', label: 'Deskripsi', hideOnMobile: true },
  { key: 'goods_count', label: 'Total Produk', hideOnMobile: true },
  { key: 'is_active', label: 'Status' },
  { key: 'action', label: 'Action' }
];

// --- Actions ---

const fetchData = async (page = 1) => {
  const params = {
    page: page,
    limit: uomStore.pagination.dataPerPage || 10,
    search: appliedFilters.search || ''
  };

  if (appliedFilters.is_active !== '') {
    params.is_active = appliedFilters.is_active;
  }
  
  try {
    await uomStore.fetchUoms(params);
  } catch (error) {
    console.error('Fetch uoms error:', error);
  }
};

const handlePageChange = (newPage) => {
  fetchData(newPage);
};

const handleDelete = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const confirmed = await Alert.confirm(
    'Hapus Data Satuan?',
    'Apakah Anda yakin ingin menghapus data satuan ini secara permanen?',
    'Ya, Hapus'
  );

  if (confirmed) {
    try {
      await uomStore.deleteUom(id);
      Alert.success('Data satuan berhasil dihapus.');
      await fetchData(uomStore.pagination.currentPage);
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data satuan.';
      Alert.error('Gagal!', msg);
    }
  }
};

onMounted(() => {
  fetchData(uomStore.pagination.currentPage || 1);
});
</script>

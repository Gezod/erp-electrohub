<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">
      
      <!-- Top Controls Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <!-- Left: Search Input Component (Replacing icon box) -->
        <SearchInput
          v-model="appliedFilters.search"
          placeholder="Cari kode atau nama barang..."
          @search="handleSearchChange"
        />

        <!-- Right: Actions (Import Excel + Tambah Barang) -->
        <div class="flex items-center gap-3 shrink-0">
          <ActionButton 
            v-can="'goods:create'"
            @click="showImportModal = true">
            <Upload class="w-[20px] h-[20px]" />
            <span class="hidden sm:inline">Import Excel</span>
          </ActionButton>

          <GlossyButton 
            v-can="'goods:create'"
            @click="handleAddGood"
          >
            <Plus class="w-5 h-5" />
            <span>Tambah Barang</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Filters Modal -->
      <FilterModal
        v-model="showFilter"
        title="Filter Data Barang"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveModalFilters"
        :is-dirty="isModalDirty"
        @apply="applyFilters"
        @reset="handleResetFilters"
      />

      <DataTable 
        title="Daftar Master Barang" 
        subtitle="Daftar seluruh inventaris dan katalog barang"
        :columns="tableColumns" 
        :data="goodsStore.goods" 
        :loading="goodsStore.isLoading"
        :server-side="true"
        :total-items="goodsStore.pagination.totalData"
        :current-page="goodsStore.pagination.currentPage"
        :items-per-page="goodsStore.pagination.dataPerPage"
        permission-prefix="goods"
        @detail="handleView"
        @edit="handleEditGood"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
      >
        <!-- Header Actions: Filter Button di Kanan Atas -->
        <template #header-actions>
          <button 
            @click="openFilterModal"
            class="bg-white dark:bg-gray-900 border border-solid border-[#e8e8e8] dark:border-gray-800 text-text-active rounded-[6px] px-[14px] flex items-center gap-[6px] font-medium text-[13px] sm:text-[14px] h-[36px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-95 duration-200"
          >
            <ListFilter class="w-[16px] h-[16px] text-text-muted" />
            <span>Filter</span>
            <span v-if="hasActiveModalFilters" class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
          </button>
        </template>

        <!-- Status Cell Slot -->
        <template #cell-status="{ item }">
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

      <!-- Reusable Detail Modal -->
      <DataDetailModal
        :is-open="showDetail"
        title="Detail Barang"
        :subtitle="`[${selectedGoodData?.good_code}] ${selectedGoodData?.good_name}`"
        :item="selectedGoodData"
        :fields="detailFields"
        @close="showDetail = false"
      />

      <!-- Import Modal -->
      <ImportGoodsModal
        v-model="showImportModal"
        @imported="fetchData(1)"
      />

      <!-- Reusable Goods Form Modal (Floating Dialog) -->
      <GoodsFormModal
        v-model="showFormModal"
        :good-id="selectedEditGoodId"
        @saved="fetchData(goodsStore.pagination.currentPage)"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import DataDetailModal from '@/components/common/DataDetailModal.vue';
import ImportGoodsModal from './components/ImportGoodsModal.vue';
import GoodsFormModal from './components/GoodsFormModal.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import { Plus, Upload, ListFilter, ChevronDown } from 'lucide-vue-next';

// Actions & Stores
import { useGoodsStore } from './stores/goods.store';
import { Alert } from '@/plugins/sweetalert';

const goodsStore = useGoodsStore();

// --- Modal States ---
const showFilter = ref(false);
const showImportModal = ref(false);
const showFormModal = ref(false);
const selectedEditGoodId = ref(null);

const handleAddGood = () => {
  selectedEditGoodId.value = null;
  showFormModal.value = true;
};

const handleEditGood = (item) => {
  selectedEditGoodId.value = item.id;
  showFormModal.value = true;
};

// --- Filters State ---
const localFilters = reactive({
  category_id: '',
  sub_category_id: '',
  status: ''
});

const appliedFilters = reactive({
  search: '',
  category_id: '',
  sub_category_id: '',
  status: ''
});

const hasActiveModalFilters = computed(() => {
  return !!(
    appliedFilters.category_id ||
    appliedFilters.sub_category_id ||
    appliedFilters.status
  );
});

const isModalDirty = computed(() => {
  return (
    localFilters.category_id !== appliedFilters.category_id ||
    localFilters.sub_category_id !== appliedFilters.sub_category_id ||
    localFilters.status !== appliedFilters.status
  );
});

const filterSchema = computed(() => [
  {
    label: 'Kategori Utama',
    key: 'category_id',
    type: 'searchable-select',
    master: 'categories',
    placeholder: 'Semua Kategori'
  },
  {
    label: 'Sub-Kategori',
    key: 'sub_category_id',
    type: 'searchable-select',
    master: 'categories',
    filters: localFilters.category_id ? { parent_id: localFilters.category_id } : {},
    disabled: !localFilters.category_id,
    placeholder: 'Semua Sub-Kategori'
  },
  {
    label: 'Status',
    key: 'status',
    type: 'select',
    options: [
      { label: 'Semua Status', value: '' },
      { label: 'Aktif', value: 'true' },
      { label: 'Tidak Aktif', value: 'false' }
    ]
  }
]);

watch(() => localFilters.category_id, () => {
  localFilters.sub_category_id = '';
});

const handleSearchChange = (val) => {
  appliedFilters.search = val;
  fetchData(1);
};

const openFilterModal = () => {
  Object.assign(localFilters, {
    category_id: appliedFilters.category_id,
    sub_category_id: appliedFilters.sub_category_id,
    status: appliedFilters.status
  });
  showFilter.value = true;
};

const applyFilters = () => {
  Object.assign(appliedFilters, localFilters);
  showFilter.value = false;
  fetchData(1);
};

const handleResetFilters = () => {
  localFilters.category_id = '';
  localFilters.sub_category_id = '';
  localFilters.status = '';
  Object.assign(appliedFilters, localFilters);
  showFilter.value = false;
  fetchData(1);
};

// --- Table Setup ---
const tableColumns = [
  { key: 'good_name', label: 'Nama Barang' },
  { key: 'merk', label: 'Merek', hideOnMobile: true },
  { key: 'category_name', label: 'Kategori', hideOnMobile: true },
  { key: 'sub_category_name', label: 'Sub Kategori', hideOnMobile: true },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' }
];

const detailFields = [
  { label: 'Kode Barang', key: 'good_code' },
  { label: 'Nama Barang', key: 'good_name' },
  { label: 'Merek', key: 'merk' },
  { label: 'Kategori Utama', key: 'category_name' },
  { label: 'Sub Kategori', key: 'sub_category_name' },
  { label: 'Stok Awal', key: 'stock_first' },
  { label: 'Stok Minimum', key: 'stock_minimum' },
  { label: 'Status Aktivasi', key: 'is_active', type: 'boolean' }
];

// --- Detail State ---
const showDetail = ref(false);
const selectedGoodData = ref(null);

const handleView = (item) => {
  selectedGoodData.value = item;
  showDetail.value = true;
};

// --- Actions ---

const fetchData = async (page = 1) => {
  const params = {
    page: page,
    limit: goodsStore.pagination.dataPerPage || 10,
    search: appliedFilters.search || '',
    category_id: appliedFilters.category_id || '',
    sub_category_id: appliedFilters.sub_category_id || '',
    is_active: appliedFilters.status !== '' ? appliedFilters.status : undefined
  };
  
  try {
    await goodsStore.fetchGoods(params);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

const handlePageChange = (newPage) => {
  fetchData(newPage);
};

const handleDelete = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const confirmed = await Alert.confirm(
    'Hapus Data Barang?',
    'Apakah Anda yakin ingin menghapus data barang ini secara permanen?',
    'Ya, Hapus'
  );

  if (confirmed) {
    try {
      await goodsStore.deleteGood(id);
      Alert.success('Data barang berhasil dihapus.');
      await fetchData(goodsStore.pagination.currentPage);
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data barang.';
      Alert.error('Gagal!', msg);
    }
  }
};

onMounted(() => {
  fetchData(goodsStore.pagination.currentPage || 1);
});
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">

      <!-- Top Controls Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <!-- Left: Search Input -->
        <SearchInput
          v-model="appliedFilters.search"
          placeholder="Cari kode atau nama kategori SKU..."
          @search="handleSearchChange"
        />

        <!-- Right: Actions (Tambah Kategori) -->
        <div class="flex items-center gap-3 shrink-0">
          <GlossyButton
            v-can="'sc-categories:create'"
            @click="handleCreate"
          >
            <Plus class="w-5 h-5" />
            <span>Tambah Kategori</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Data Table -->
      <DataTable
        title="Daftar Master Kategori SKU"
        subtitle="Supply Chain • Klasifikasi Kategori SKU Barang"
        :columns="tableColumns"
        :data="categoryStore.categories"
        :loading="categoryStore.isLoading"
        :server-side="true"
        :total-items="categoryStore.pagination.totalData"
        :current-page="categoryStore.pagination.currentPage"
        :items-per-page="categoryStore.pagination.dataPerPage"
        permission-prefix="sc-categories"
        @edit="handleEdit"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
      >
        <!-- No -->
        <template #cell-no="{ index }">
          {{ ((Math.max(1, Number(categoryStore.pagination?.currentPage || categoryStore.pagination?.page || 1)) - 1) * Number(categoryStore.pagination?.dataPerPage || categoryStore.pagination?.limit || 10)) + index + 1 }}
        </template>

        <!-- Kode Kategori -->
        <template #cell-code="{ item }">
          <span class="text-xs font-mono font-bold text-text-active bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded border border-border tracking-wider">
            {{ item.code }}
          </span>
        </template>

        <!-- Nama Kategori -->
        <template #cell-name="{ item }">
          <span class="text-sm font-semibold text-text-active">
            {{ item.name }}
          </span>
        </template>

        <!-- Status -->
        <template #cell-is_active="{ item }">
          <span
            :class="item.is_active
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
              : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border uppercase tracking-wider"
          >
            {{ item.is_active ? 'Aktif' : 'Non-Aktif' }}
          </span>
        </template>
      </DataTable>

      <!-- Category Form Modal -->
      <ScCategoryFormModal
        v-model="showFormModal"
        :category-id="selectedEditCategoryId"
        @saved="fetchData(categoryStore.pagination.currentPage)"
      />

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import ScCategoryFormModal from './components/ScCategoryFormModal.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import { Plus } from 'lucide-vue-next';

// Store & Alerts
import { useScCategoryStore } from './scCategory.store';
import { Alert } from '@/plugins/sweetalert';

const categoryStore = useScCategoryStore();

// --- Modal States ---
const showFormModal = ref(false);
const selectedEditCategoryId = ref(null);

const handleCreate = () => {
  selectedEditCategoryId.value = null;
  showFormModal.value = true;
};

const handleEdit = (item) => {
  selectedEditCategoryId.value = item.id;
  showFormModal.value = true;
};

// --- Filters State ---
const appliedFilters = reactive({
  search: '',
});

const handleSearchChange = (val) => {
  appliedFilters.search = val;
  fetchData(1);
};

// --- Table Setup ---
const tableColumns = [
  { key: 'no', label: 'No', width: '70px' },
  { key: 'code', label: 'Kode Kategori', width: '200px' },
  { key: 'name', label: 'Nama Kategori', width: '320px' },
  { key: 'is_active', label: 'Status', width: '160px' },
  { key: 'action', label: 'Aksi', width: '110px' },
];

// --- Actions ---
const fetchData = async (page = 1) => {
  const params = {
    page: page,
    limit: categoryStore.pagination.dataPerPage || 10,
    search: appliedFilters.search || undefined,
  };

  try {
    await categoryStore.fetchCategories(params);
  } catch (error) {
    console.error('Fetch categories error:', error);
  }
};

const handlePageChange = (newPage) => {
  fetchData(newPage);
};

const handleDelete = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const name = typeof itemOrId === 'object' && itemOrId !== null ? (itemOrId.name || itemOrId.code) : '';

  const confirmed = await Alert.confirm(
    'Hapus Data Kategori?',
    `Apakah Anda yakin ingin menghapus data kategori ${name ? `"${name}"` : ''} ini?`,
    'Ya, Hapus'
  );

  if (confirmed) {
    try {
      await categoryStore.deleteCategory(id);
      Alert.success('Data kategori SKU berhasil dihapus.');
      await fetchData(categoryStore.pagination.currentPage);
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data kategori.';
      Alert.error('Gagal!', msg);
    }
  }
};

onMounted(() => {
  fetchData(categoryStore.pagination.currentPage || 1);
});
</script>

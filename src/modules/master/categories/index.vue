<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">
      
      <!-- Top Controls Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <!-- Left: Search Input Component (Replacing icon box) -->
        <SearchInput
          v-model="appliedFilters.search"
          placeholder="Cari nama kategori..."
          @search="handleSearchChange"
        />

        <!-- Right: Actions (Tambah Kategori) -->
        <div class="flex items-center gap-3 shrink-0">
          <GlossyButton 
            v-can="'categories:create'"
            @click="handleCreateRoot"
          >
            <Plus class="w-5 h-5" />
            <span>Tambah Kategori</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Data Table -->
      <DataTable 
        title="Daftar Master Kategori" 
        subtitle="Struktur pengelompokan dan hirarki kategori barang"
        :columns="tableColumns" 
        :data="visibleCategories" 
        :loading="categoryStore.isLoading"
        :server-side="true"
        :total-items="categoryStore.pagination.totalData"
        :current-page="categoryStore.pagination.currentPage"
        :items-per-page="categoryStore.pagination.dataPerPage"
        permission-prefix="categories"
        @edit="handleEdit"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
      >
        <!-- Custom Cell for category name & tree hierarchy -->
        <template #cell-name_category="{ item }">
          <div :style="{ paddingLeft: `${item.level * 24}px` }" class="flex items-center gap-2.5">
            <div v-if="item.level > 0" class="flex items-center">
              <div class="w-3.5 h-3.5 border-l-2 border-b-2 border-gray-200 dark:border-gray-700 rounded-bl-md -mt-3"></div>
            </div>
            
            <!-- Expand/Collapse Toggle -->
            <button 
              v-if="item.children_count > 0"
              @click.stop="toggleExpand(item.id)"
              class="p-1 rounded-md hover:bg-bg-active transition-transform duration-200 text-text-muted hover:text-text-active cursor-pointer"
              :class="{ 'rotate-90': expandedIds.has(item.id) }"
              title="Buka / Tutup Sub-Kategori"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
            <div v-else class="w-5"></div>

            <div class="flex items-center gap-2 group">
              <div 
                class="w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0"
                :class="item.level === 0 
                  ? 'bg-brand-500/10 text-brand-500' 
                  : 'bg-gray-100 dark:bg-gray-800 text-text-muted'"
              >
                <FolderOpen v-if="item.level === 0" class="w-3.5 h-3.5" />
                <Tag v-else class="w-3.5 h-3.5" />
              </div>
              
              <div class="flex flex-col">
                <span 
                  class="text-[14px] font-medium text-text-active transition-colors cursor-pointer leading-tight"
                  :class="[!item.is_active && 'opacity-50']"
                  @click="item.children_count > 0 && toggleExpand(item.id)"
                >
                  {{ item.name_category }}
                </span>
                <span v-if="item.level === 0" class="text-[10px] text-text-muted uppercase tracking-wider font-normal mt-0.5">
                  {{ item.children_count > 0 ? `${item.children_count} Sub-kategori` : 'Kategori Utama' }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Sub Count Cell -->
        <template #cell-children_count="{ item }">
          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-text-muted">
            {{ item.children_count }} Sub
          </span>
        </template>

        <!-- Is Asset Cell -->
        <template #cell-is_asset="{ item }">
          <span 
            :class="item.is_asset 
              ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' 
              : 'bg-gray-50 text-text-muted border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border uppercase tracking-wider"
          >
            {{ item.is_asset ? 'Aset' : 'Bukan Aset' }}
          </span>
        </template>

        <!-- Is Active Status Cell -->
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

        <!-- Extra Action Button for Add Sub-Category -->
        <template #action-prepend="{ item }">
          <button 
            v-can="'categories:create'"
            @click.stop="handleCreateSub(item)"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
            title="Tambah Sub-Kategori"
          >
            <Plus class="w-3.5 h-3.5" />
          </button>
        </template>
      </DataTable>

      <!-- Reusable Category Form Modal (Floating Dialog) -->
      <CategoryFormModal
        v-model="showFormModal"
        :category-id="selectedEditCategoryId"
        :parent-id="selectedParentCategoryId"
        @saved="fetchData(categoryStore.pagination.currentPage)"
      />

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import CategoryFormModal from './components/CategoryFormModal.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import { Plus, ChevronRight, FolderOpen, Tag } from 'lucide-vue-next';

// Store & Alerts
import { useCategoryStore } from './category.store';
import { Alert } from '@/plugins/sweetalert';

const categoryStore = useCategoryStore();

// --- Modal States ---
const showFormModal = ref(false);
const selectedEditCategoryId = ref(null);
const selectedParentCategoryId = ref(null);

const expandedIds = ref(new Set());

const toggleExpand = (id) => {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id);
  } else {
    expandedIds.value.add(id);
  }
};

const handleCreateRoot = () => {
  selectedEditCategoryId.value = null;
  selectedParentCategoryId.value = null;
  showFormModal.value = true;
};

const handleCreateSub = (item) => {
  selectedEditCategoryId.value = null;
  selectedParentCategoryId.value = item.id;
  showFormModal.value = true;
};

const handleEdit = (item) => {
  selectedEditCategoryId.value = item.id;
  selectedParentCategoryId.value = item.parent_id || null;
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
  { key: 'name_category', label: 'Nama Kategori' },
  { key: 'description', label: 'Deskripsi', hideOnMobile: true },
  { key: 'children_count', label: 'Sub-Kategori', hideOnMobile: true },
  { key: 'is_asset', label: 'Tipe' },
  { key: 'is_active', label: 'Status' },
  { key: 'action', label: 'Action' }
];

const visibleCategories = computed(() => {
  const list = categoryStore.categories;
  if (!list || list.length === 0) return [];
  
  // If searching, show everything flattened
  if (appliedFilters.search) return list;

  const result = [];
  const hiddenIds = new Set();

  list.forEach(item => {
    // If any of its ancestors are hidden, hide it
    if (item.parent_id && hiddenIds.has(item.parent_id)) {
      hiddenIds.add(item.id);
      return;
    }

    result.push(item);

    // If not expanded and has children, mark children as hidden
    if (item.children_count > 0 && !expandedIds.value.has(item.id)) {
      hiddenIds.add(item.id);
    }
  });

  return result;
});

// --- Actions ---

const fetchData = async (page = 1) => {
  const params = {
    page: page,
    limit: categoryStore.pagination.dataPerPage || 10,
    search: appliedFilters.search || ''
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
  const confirmed = await Alert.confirm(
    'Hapus Data Kategori?',
    'Apakah Anda yakin ingin menghapus data kategori ini secara permanen?',
    'Ya, Hapus'
  );

  if (confirmed) {
    try {
      await categoryStore.deleteCategory(id);
      Alert.success('Data kategori berhasil dihapus.');
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

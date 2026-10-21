<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 space-y-6">
      
      <!-- Top Controls Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <!-- Left: Search Input Component -->
        <div class="flex items-center gap-2.5 w-full sm:w-auto">
          <SearchInput
            v-model="appliedFilters.search"
            placeholder="Cari nama lokasi atau distrik..."
            @search="handleSearchChange"
          />
        </div>

        <!-- Right: Actions (Tambah Lokasi) -->
        <div class="flex items-center gap-3 shrink-0">
          <GlossyButton 
            v-can="'locations:create'"
            @click="handleCreateRoot"
          >
            <Plus class="w-5 h-5" />
            <span>Tambah Lokasi</span>
          </GlossyButton>
        </div>
      </div>

      <!-- Filters Modal -->
      <FilterModal
        v-model="showFilterModal"
        title="Filter Data Lokasi"
        :schema="filterSchema"
        :model="localFilters"
        :has-active-filters="hasActiveModalFilters"
        :is-dirty="isModalDirty"
        @apply="applyFilters"
        @reset="handleResetFilters"
      />

      <!-- Data Table -->
      <DataTable 
        title="Daftar Master Lokasi" 
        subtitle="Kelola cabang, gudang, toko dan titik operasional perusahaan"
        :columns="tableColumns" 
        :data="visibleLocations" 
        :loading="locationStore.isLoading"
        :server-side="true"
        :total-items="locationStore.pagination.totalData"
        :current-page="locationStore.pagination.currentPage"
        :items-per-page="locationStore.pagination.dataPerPage"
        permission-prefix="locations"
        @detail="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @update:current-page="handlePageChange"
      >
        <!-- Header Actions: Filter Button di Kanan Atas Tabel -->
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

        <!-- Custom Cell for location name with indentation & toggle -->
        <template #cell-location_name="{ item }">
          <div :style="{ paddingLeft: `${item.level * 24}px` }" class="flex items-center gap-2">
            <div v-if="item.level > 0" class="flex items-center shrink-0">
              <div class="w-3.5 h-3.5 border-l-2 border-b-2 border-gray-200 dark:border-gray-700 rounded-bl-md -mt-3"></div>
            </div>
            
            <!-- Expand/Collapse Toggle -->
            <button 
              v-if="item.children_count > 0"
              @click.stop="toggleExpand(item.id)"
              class="p-1 rounded-md hover:bg-bg-active transition-transform duration-200 text-text-muted hover:text-text-active shrink-0 cursor-pointer"
              :class="{ 'rotate-90': expandedIds.has(item.id) }"
              title="Buka / Tutup Sub-Lokasi"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
            <div v-else class="w-5 shrink-0"></div>

            <div class="flex items-center gap-2.5 group">
              <div 
                class="w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0"
                :class="item.level === 0 ? 'bg-brand-500/10 text-brand-500' : 'bg-gray-100 dark:bg-gray-800 text-text-muted'"
              >
                <Building2 v-if="item.level === 0" class="w-3.5 h-3.5" />
                <MapPin v-else class="w-3.5 h-3.5" />
              </div>
              
              <div class="flex flex-col">
                <span 
                  class="cursor-pointer leading-tight whitespace-nowrap"
                  :class="[!item.is_active && 'opacity-50']"
                  @click="item.children_count > 0 && toggleExpand(item.id)"
                >
                  {{ item.location_name }}
                </span>
                <span v-if="item.parent" class="text-[11px] text-text-muted mt-0.5 whitespace-nowrap">
                  Parent: {{ item.parent.location_name }}
                </span>
                <span v-else-if="item.level === 0 && item.children_count > 0" class="text-[11px] text-text-muted mt-0.5 whitespace-nowrap">
                  {{ item.children_count }} Sub-lokasi
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Sub Count Cell -->
        <template #cell-children_count="{ item }">
          <span v-if="item.children_count > 0" class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-gray-100 dark:bg-gray-800 text-text-muted">
            {{ item.children_count }} Sub
          </span>
          <span v-else class="text-text-muted">-</span>
        </template>

        <!-- Location Type Cell -->
        <template #cell-location_type="{ item }">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] bg-gray-100 dark:bg-gray-800 text-text-active border border-gray-200 dark:border-gray-700">
            {{ item.display_type }}
          </span>
        </template>

        <!-- Maps URL Cell -->
        <template #cell-maps_url="{ item }">
          <a v-if="item.maps_url" :href="item.maps_url" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
            <MapPin class="w-3.5 h-3.5 shrink-0" />
            <span>Maps</span>
          </a>
          <span v-else class="text-text-muted">-</span>
        </template>

        <!-- Status Cell -->
        <template #cell-is_active="{ item }">
          <span 
            :class="item.is_active 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
              : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border uppercase tracking-wider"
          >
            {{ item.is_active ? 'Aktif' : 'Tidak Aktif' }}
          </span>
        </template>

        <!-- Extra Action Button for Add Sub-Location -->
        <template #action-prepend="{ item }">
          <button 
            v-can="'locations:create'"
            @click.stop="handleCreateSub(item)"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
            title="Tambah Sub-Lokasi"
          >
            <Plus class="w-3.5 h-3.5" />
          </button>
        </template>
      </DataTable>

      <!-- Reusable Location Detail Modal (AppForm Layout) -->
      <LocationDetailModal
        v-model="showDetailModal"
        :location="selectedDetailLocation"
      />

      <!-- Reusable Location Form Modal (Floating Dialog) -->
      <LocationFormModal
        v-model="showFormModal"
        :location-id="selectedEditLocationId"
        :parent-id="selectedParentLocationId"
        @saved="fetchData(locationStore.pagination.currentPage)"
      />

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import FilterModal from '@/components/common/FilterModal.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import LocationFormModal from './components/LocationFormModal.vue';
import LocationDetailModal from './components/LocationDetailModal.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import { Plus, ListFilter, ChevronRight, ChevronDown, Building2, MapPin } from 'lucide-vue-next';

// Store & Alerts
import { useLocationStore } from './location.store';
import { LocationMapper } from './location.mapper';
import { Alert } from '@/plugins/sweetalert';

const locationStore = useLocationStore();

// --- Modal States ---
const showFilterModal = ref(false);
const showFormModal = ref(false);
const showDetailModal = ref(false);
const selectedEditLocationId = ref(null);
const selectedParentLocationId = ref(null);
const selectedDetailLocation = ref(null);

const expandedIds = ref(new Set());

const toggleExpand = (id) => {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id);
  } else {
    expandedIds.value.add(id);
  }
};

const handleCreateRoot = () => {
  selectedEditLocationId.value = null;
  selectedParentLocationId.value = null;
  showFormModal.value = true;
};

const handleCreateSub = (item) => {
  selectedEditLocationId.value = null;
  selectedParentLocationId.value = item.id;
  showFormModal.value = true;
};

const handleEdit = (item) => {
  selectedEditLocationId.value = item.id;
  selectedParentLocationId.value = item.parent_id || null;
  showFormModal.value = true;
};

const handleView = (item) => {
  selectedDetailLocation.value = item;
  showDetailModal.value = true;
};

// --- Filters State ---
const localFilters = reactive({
  location_type: '',
  is_active: ''
});

const appliedFilters = reactive({
  search: '',
  location_type: '',
  is_active: ''
});

const hasActiveModalFilters = computed(() => {
  return appliedFilters.location_type !== '' || appliedFilters.is_active !== '';
});

const isModalDirty = computed(() => {
  return (
    localFilters.location_type !== appliedFilters.location_type ||
    localFilters.is_active !== appliedFilters.is_active
  );
});

const filterSchema = [
  {
    label: 'Tipe Lokasi',
    key: 'location_type',
    type: 'select',
    options: [
      { label: 'Semua Tipe Lokasi', value: '' },
      { label: 'Office / Kantor', value: 'office' },
      { label: 'Gudang / Warehouse', value: 'gudang' },
      { label: 'Toko / Outlet', value: 'store' }
    ]
  },
  {
    label: 'Status',
    key: 'is_active',
    type: 'select',
    options: [
      { label: 'Semua Status', value: '' },
      { label: 'Aktif', value: 'true' },
      { label: 'Tidak Aktif', value: 'false' }
    ]
  }
];

const openFilterModal = () => {
  Object.assign(localFilters, {
    location_type: appliedFilters.location_type,
    is_active: appliedFilters.is_active
  });
  showFilterModal.value = true;
};

const applyFilters = () => {
  Object.assign(appliedFilters, localFilters);
  showFilterModal.value = false;
  fetchData(1);
};

const handleResetFilters = () => {
  localFilters.location_type = '';
  localFilters.is_active = '';
  Object.assign(appliedFilters, localFilters);
  showFilterModal.value = false;
  fetchData(1);
};

const handleSearchChange = (val) => {
  appliedFilters.search = val;
  fetchData(1);
};

// --- Table Setup ---
const tableColumns = [
  { key: 'location_name', label: 'Nama Lokasi' },
  { key: 'children_count', label: 'Sub-Lokasi', hideOnMobile: true },
  { key: 'location_type', label: 'Tipe' },
  { key: 'location_district', label: 'Distrik', hideOnMobile: true },
  { key: 'maps_url', label: 'Maps', hideOnMobile: true },
  { key: 'is_active', label: 'Status' },
  { key: 'action', label: 'Action' }
];

// Helper to ensure tree structure is available
const ensureTreeStructure = (items) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  // Check if any item already has non-empty children array
  const hasPrebuiltChildren = items.some(it => Array.isArray(it.children) && it.children.length > 0);
  if (hasPrebuiltChildren) {
    return items;
  }

  // Check if any item has parent_id
  const hasParentId = items.some(it => it.parent_id);
  if (!hasParentId) {
    return items;
  }

  // Rebuild tree from flat items
  const itemMap = new Map();
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  const roots = [];
  itemMap.forEach(item => {
    if (item.parent_id && itemMap.has(item.parent_id)) {
      const parent = itemMap.get(item.parent_id);
      parent.children.push(item);
      parent.children_count = parent.children.length;
    } else {
      roots.push(item);
    }
  });

  return roots.length > 0 ? roots : items;
};

const visibleLocations = computed(() => {
  const list = locationStore.locations;
  if (!list || list.length === 0) return [];

  const treeList = ensureTreeStructure(list);

  // If searching or filtering by type/status, show all flattened
  if (appliedFilters.search || appliedFilters.location_type || appliedFilters.is_active !== '') {
    return LocationMapper.toUIFlatten(treeList);
  }

  const result = [];
  const recurse = (items, level = 0) => {
    items.forEach(item => {
      const childrenArr = Array.isArray(item.children) ? item.children : [];
      const childCount = childrenArr.length > 0 ? childrenArr.length : (item.children_count || 0);

      result.push({
        ...item,
        level,
        children_count: childCount,
        children: childrenArr
      });

      if (expandedIds.value.has(item.id) && childrenArr.length > 0) {
        recurse(childrenArr, level + 1);
      }
    });
  };

  recurse(treeList);
  return result;
});

// --- Actions ---

const fetchData = async (page = 1) => {
  const params = {
    page: page,
    limit: locationStore.pagination.dataPerPage || 10,
    search: appliedFilters.search || '',
    location_type: appliedFilters.location_type || undefined,
    is_active: appliedFilters.is_active !== '' ? appliedFilters.is_active : undefined
  };
  
  try {
    await locationStore.fetchLocations(params);
  } catch (error) {
    console.error('Fetch locations error:', error);
  }
};

const handlePageChange = (newPage) => {
  fetchData(newPage);
};

const handleDelete = async (itemOrId) => {
  const id = typeof itemOrId === 'object' && itemOrId !== null ? itemOrId.id : itemOrId;
  const confirmed = await Alert.confirm(
    'Hapus Data Lokasi?',
    'Apakah Anda yakin ingin menghapus data lokasi ini beserta seluruh sub-lokasinya?',
    'Ya, Hapus'
  );

  if (confirmed) {
    try {
      await locationStore.deleteLocation(id);
      Alert.success('Data lokasi berhasil dihapus.');
      await fetchData(locationStore.pagination.currentPage);
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data lokasi.';
      Alert.error('Gagal!', msg);
    }
  }
};

onMounted(() => {
  fetchData(locationStore.pagination.currentPage || 1);
});
</script>

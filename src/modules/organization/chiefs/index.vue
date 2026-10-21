<template>
  <AdminLayout>
    <div class="mx-auto max-w-(--breakpoint-2xl) space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20"
          >
            <UserCheck class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">
              Daftar Pimpinan
            </h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">
              Manajemen Hierarki & Otoritas &bull; ERP
            </p>
          </div>
        </div>
      </div>

      <!-- Controls Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-[16px] select-none">
        <!-- Left Side: Search Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-[8px] flex-1 w-full">
          <div class="relative w-full sm:w-[350px] sm:max-w-full shrink-0 group">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] group-focus-within:text-brand-500 transition-colors pointer-events-none" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Cari nama pimpinan atau jabatan..."
              class="w-full pl-[36px] pr-4 bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-gray-800 rounded-[6px] outline-none text-[13px] font-sans text-black dark:text-white placeholder:text-[#999] focus:border-brand-500 transition-all h-[40px]"
            />
          </div>
        </div>

        <!-- Right Side: Button Group -->
        <div class="flex flex-wrap items-center gap-[8px] w-full lg:w-auto shrink-0">
          <GlossyButton
            v-can="'organization:create'"
            @click="openCreateModal"
          >
            <Plus class="w-[20px] h-[20px] text-white relative z-10" />
            <span class="relative z-10 text-[13px] font-semibold whitespace-nowrap">Tambah Jabatan</span>
          </GlossyButton>
        </div>
      </div>

      <!-- DataTable -->
      <DataTable
        title="Struktur Pimpinan"
        subtitle="Daftar Jabatan dan Pejabat Aktif"
        :columns="tableColumns"
        :data="chiefStore.chiefs"
        :loading="chiefStore.isLoading"
        :server-side="true"
        :total-items="chiefStore.pagination.totalData"
        :current-page="chiefStore.pagination.currentPage"
        :items-per-page="chiefStore.pagination.dataPerPage"
        @update:current-page="handlePageChange"
      >
        <!-- No. Cell -->
        <template #cell-no="{ index }">
          <span class="font-mono text-xs font-semibold text-text-muted">
            {{ ((Math.max(1, Number(chiefStore.pagination?.currentPage || chiefStore.pagination?.page || 1)) - 1) * Number(chiefStore.pagination?.dataPerPage || chiefStore.pagination?.limit || 10)) + index + 1 }}
          </span>
        </template>

        <!-- Title Cell -->
        <template #cell-title="{ item }">
          <span class="font-bold text-gray-800 dark:text-white">
            {{ item.title }}
          </span>
        </template>

        <!-- Chief Active Cell -->
        <template #cell-employee_name="{ item }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-800 dark:text-gray-200">
              {{ item.employee_name }}
            </span>
            <span v-if="item.employee_nik && item.employee_nik !== '-'" class="text-[11px] text-text-muted font-mono">
              NIK: {{ item.employee_nik }}
            </span>
          </div>
        </template>

        <!-- Divisions List Cell -->
        <template #cell-divisions_list="{ item }">
          <p class="text-[13px] text-gray-600 dark:text-gray-300 font-normal leading-relaxed whitespace-normal break-words">
            {{ item.divisions_list }}
          </p>
        </template>

        <!-- Action Cell -->
        <template #cell-action="{ item }">
          <div class="relative flex items-center justify-end pr-2 gap-2">
            <button
              v-can="'organization:update'"
              @click="openEditModal(item.id)"
              class="w-[28px] h-[28px] flex items-center justify-center bg-[#e8e8e8]/70 dark:bg-gray-700 rounded-full text-[#444] dark:text-gray-300 hover:bg-[#d8d8d8] dark:hover:bg-gray-600 transition-all cursor-pointer"
              title="Edit Data"
            >
              <Pencil class="w-[14px] h-[14px]" />
            </button>
            <button
              v-can="'organization:delete'"
              @click="handleDelete(item.id)"
              class="w-[28px] h-[28px] flex items-center justify-center bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 rounded-full transition-all cursor-pointer"
              title="Hapus Data"
            >
              <Trash2 class="w-[14px] h-[14px]" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Form Modal (Create / Edit) -->
      <ChiefFormModal
        v-model="showFormModal"
        :chief-id="selectedChiefId"
        @saved="onModalSaved"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import ChiefFormModal from './components/ChiefFormModal.vue';
import { useChief } from './composables/useChief';
import { Alert } from '@/plugins/sweetalert';
import { Search, Plus, Pencil, Trash2, UserCheck } from 'lucide-vue-next';

const { filters, chiefStore, fetchChiefs, handlePageChange } = useChief();

const showFormModal = ref(false);
const selectedChiefId = ref(null);

const tableColumns = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'title', label: 'Jabatan' },
  { key: 'employee_name', label: 'Chief Aktif' },
  { key: 'divisions_list', label: 'Divisi Terkait' },
  { key: 'action', label: '', align: 'right' },
];

const openCreateModal = () => {
  selectedChiefId.value = null;
  showFormModal.value = true;
};

const openEditModal = (id) => {
  selectedChiefId.value = id;
  showFormModal.value = true;
};

const onModalSaved = () => {
  fetchChiefs(chiefStore.pagination.currentPage || 1);
};

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm(
    'Hapus Jabatan?',
    'Apakah Anda yakin ingin menghapus data jabatan pimpinan ini secara permanen?'
  );

  if (confirmed) {
    try {
      await chiefStore.deleteChief(id);
      Alert.toast('Data jabatan pimpinan berhasil dihapus.', 'success');
      await fetchChiefs(chiefStore.pagination.currentPage || 1);
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat menghapus data dari server.';
      Alert.error('Gagal!', msg);
    }
  }
};

onMounted(() => {
  fetchChiefs(1);
});
</script>

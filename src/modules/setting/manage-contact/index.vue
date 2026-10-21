<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <Contact class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Manage Kontak</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Kelola direktori kontak khusus</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <FilterButton v-model:active="showFilter" />
          <button
            v-can="'manage_contact:create'"
            @click="showAddModal = true"
            class="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm shadow-brand-500/20"
          >
            <Plus class="w-4 h-4" />
            Tambah Toko
          </button>
        </div>
      </div>

      <FilterCard :show="showFilter" cols="1">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Cari Toko / Kode</label>
          <div class="relative">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="Ketik nama toko..."
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition"
            />
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <template #footer>
          <button
            @click="resetFilters"
            class="text-xs font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Reset Filter
          </button>
        </template>
      </FilterCard>

      <DataTable
        title="Daftar Toko"
        subtitle="Kelola toko di dalam direktori kontak"
        :columns="tableColumns"
        :data="manageStore.contacts"
        :loading="manageStore.isLoading"
        :server-side="true"
        :total-items="manageStore.pagination.totalData"
        :current-page="manageStore.pagination.currentPage"
        :items-per-page="manageStore.pagination.dataPerPage"
        @update:current-page="handlePageChange"
      >
        <template #cell-store_name="{ item }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center shrink-0">
              <Store class="w-4 h-4" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-800 dark:text-white">{{ item.store_name }}</span>
            </div>
          </div>
        </template>

        <template #cell-status="{ item }">
          <span
            class="px-2.5 py-1 rounded-md text-xs font-bold"
            :class="item.is_hotline_ready ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
          >
            {{ item.is_hotline_ready ? 'Ready' : 'Draft' }}
          </span>
        </template>

        <template #cell-total_contacts="{ item }">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-inset ring-blue-700/10 whitespace-nowrap">
            {{ getActiveContactCount(item) }} Kontak
          </span>
        </template>

        <template #cell-action="{ item }">
          <div class="flex items-center gap-2">
            <button
              v-can="'manage_contact:update'"
              @click="router.push({ name: 'ManageContactEdit', params: { store_id: item.id } })"
              class="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold rounded-xl hover:bg-brand-100 transition-all text-xs"
              title="Kelola Kontak"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              v-can="'manage_contact:delete'"
              @click="deleteContact(item.id)"
              class="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition"
              title="Hapus"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Add Modal -->
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Tambah Toko Kontak</h3>
          <div class="mb-5">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Toko</label>
            <input
              v-model="newStoreName"
              type="text"
              placeholder="Contoh: Toko Royal"
              class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:bg-gray-900 dark:text-white transition"
              @keyup.enter="submitAdd"
            />
          </div>
          <div class="flex items-center justify-end gap-3">
            <button @click="showAddModal = false" class="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition">Batal</button>
            <button
              @click="submitAdd"
              :disabled="!newStoreName.trim() || isSubmitting"
              class="px-5 py-2 bg-brand-500 text-white text-sm font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition"
            >
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan & Lanjut' }}
            </button>
          </div>
        </div>
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
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import FilterButton from '@/components/common/FilterButton.vue';
import FilterCard from '@/components/common/FilterCard.vue';
import { Contact, Pencil, RotateCcw, Search, Store, Plus, Trash2 } from 'lucide-vue-next';
import { useManageContactStore } from './manage-contact.store';
import Swal from 'sweetalert2';

const router = useRouter();
const manageStore = useManageContactStore();

const showFilter = ref(true);
const showAddModal = ref(false);
const newStoreName = ref('');
const isSubmitting = ref(false);

const tableColumns = [
  { key: 'store_name', label: 'Toko', width: '320px' },
  { key: 'total_contacts', label: 'Total Kontak', width: '170px' },
  { key: 'status', label: 'Status', width: '150px' },
  { key: 'action', label: 'Action', width: '160px' },
];

let searchTimeout;

const fetchData = async (page = 1) => {
  await manageStore.fetchContacts({
    page,
    search: searchKeyword.value.trim() || undefined,
  });
};

const handlePageChange = (page) => fetchData(page);

const resetFilters = () => {
  searchKeyword.value = '';
};

const countFromContacts = (contacts) => {
  if (!contacts) return 0;

  let parsed = contacts;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return 0;
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.filter((contact) => {
      if (!contact) return false;
      if (contact.is_active === false) return false;
      const phone = contact.phone || contact.value || contact.number || contact.telp || contact.no_telp;
      return String(phone || '').trim().length > 0;
    }).length;
  }

  if (typeof parsed === 'object') {
    return Object.values(parsed).filter((value) => {
      if (value && typeof value === 'object') {
        if (value.is_active === false) return false;
        const phone = value.phone || value.value || value.number || value.telp || value.no_telp;
        return String(phone || '').trim().length > 0;
      }
      return String(value || '').trim().length > 0;
    }).length;
  }

  return 0;
};

const getActiveContactCount = (item) => {
  return Number(
    item.total_contacts ??
    item.active_contacts_count ??
    item.contact_count ??
    item.contacts_count ??
    countFromContacts(item.contacts)
  );
};

watch(searchKeyword, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => fetchData(1), 400);
});

const submitAdd = async () => {
  if (!newStoreName.value.trim() || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const res = await manageStore.createContact({ store_name: newStoreName.value.trim() });
    showAddModal.value = false;
    newStoreName.value = '';
    // Redirect to edit page
    router.push({ name: 'ManageContactEdit', params: { store_id: res.id || res.data?.id } });
  } catch (err) {
    Swal.fire('Error', manageStore.error || 'Gagal menyimpan data', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteContact = async (id) => {
  const confirm = await Swal.fire({
    title: 'Hapus Kontak?',
    text: "Data kontak toko ini akan dihapus permanen.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus'
  });

  if (confirm.isConfirmed) {
    try {
      await manageStore.deleteContact(id);
      Swal.fire('Terhapus!', 'Kontak toko telah dihapus.', 'success');
      fetchData(manageStore.pagination.currentPage);
    } catch (err) {
      Swal.fire('Gagal', manageStore.error || 'Gagal menghapus data', 'error');
    }
  }
};

onMounted(() => {
  // Pertahankan halaman terakhir saat kembali dari form.
  fetchData(manageStore.pagination.currentPage || 1);
});
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <LayoutGrid class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Master Template Kontak</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Kelola Grup & Departemen Hotline &bull; System Config</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            v-can="'store-contacts:update'"
            @click="openGroupModal()"
            class="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95">
            <Plus class="w-5 h-5" />
            Tambah Grup
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-if="groupStore.isLoading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>

      <div v-else-if="groupStore.groups.length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
        <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-4">
          <LayoutGrid class="w-10 h-10 text-gray-300" />
        </div>
        <p class="text-gray-500 font-bold uppercase tracking-widest text-sm">Belum ada grup template</p>
        <button @click="openGroupModal()" class="mt-4 text-brand-500 font-black text-xs uppercase tracking-widest hover:underline">Buat Grup Pertama</button>
      </div>

      <div v-else class="space-y-8">
        <div v-for="group in groupStore.groups" :key="group.id" class="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <!-- Group Header -->
          <div class="px-8 py-6 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800 text-gray-400">
                <Hash class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-black text-gray-900 dark:text-white leading-none mb-1">{{ group.label }}</h3>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Order: {{ group.order || 0 }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button 
                @click="openItemModal(group.id)"
                class="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-100 transition-all text-xs"
              >
                <Plus class="w-4 h-4" />
                Tambah Departemen
              </button>
              <button @click="openGroupModal(group)" class="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all">
                <Pencil class="w-5 h-5" />
              </button>
              <button @click="handleDeleteGroup(group.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Items List -->
          <div class="p-6 md:p-8">
            <div v-if="!group.items || group.items.length === 0" class="py-10 text-center">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Belum ada departemen di grup ini</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="item in group.items" :key="item.id" class="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand-500/30 transition-all bg-gray-50/30 dark:bg-gray-800/20 group relative overflow-hidden">
                <div class="flex items-start justify-between relative z-10">
                  <div class="flex items-center gap-3">
                    <div :class="['w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm', item.bg || 'bg-gray-400']">
                      {{ item.icon || '?' }}
                    </div>
                    <div>
                      <h4 class="text-sm font-black text-gray-900 dark:text-white">{{ item.label }}</h4>
                      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Key: {{ item.key }}</p>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openItemModal(group.id, item)" class="p-1.5 text-gray-400 hover:text-brand-500 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button @click="handleDeleteItem(item.id)" class="p-1.5 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p class="mt-3 text-[11px] text-gray-500 leading-relaxed line-clamp-2 italic font-medium">
                  {{ item.desc || 'Tidak ada deskripsi.' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Group Modal -->
      <Transition name="modal-fade">
        <div v-if="showGroupModal" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showGroupModal = false"></div>
          <div class="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-gray-100 dark:border-gray-800">
            <div class="p-8 md:p-10">
              <div class="flex items-center justify-between mb-8">
                <div>
                  <h3 class="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    {{ groupForm.id ? 'Edit Grup' : 'Grup Baru' }}
                  </h3>
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Master Template &bull; Grouping</p>
                </div>
                <button @click="showGroupModal = false" class="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                  <X class="w-6 h-6" />
                </button>
              </div>

              <div class="space-y-6">
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nama Grup</label>
                  <input v-model="groupForm.label" type="text" placeholder="Contoh: IT & Sistem"
                    class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition text-sm font-bold" />
                </div>

                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Urutan (Order)</label>
                  <input v-model.number="groupForm.order" type="number" placeholder="1"
                    class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition text-sm font-bold" />
                </div>

                <button 
                  @click="saveGroup"
                  :disabled="groupStore.isLoading"
                  class="w-full py-4 bg-brand-500 text-white font-black rounded-2xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-widest text-xs"
                >
                  {{ groupStore.isLoading ? 'Menyimpan...' : (groupForm.id ? 'Update Grup' : 'Buat Grup') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Item Modal -->
      <Transition name="modal-fade">
        <div v-if="showItemModal" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showItemModal = false"></div>
          <div class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div class="p-8 md:p-10">
              <div class="flex items-center justify-between mb-8">
                <div>
                  <h3 class="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    {{ itemForm.id ? 'Edit Departemen' : 'Departemen Baru' }}
                  </h3>
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Input Field Configuration</p>
                </div>
                <button @click="showItemModal = false" class="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                  <X class="w-6 h-6" />
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2 space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nama Departemen (Label)</label>
                  <input v-model="itemForm.label" type="text" placeholder="Contoh: IT Support - MOKA"
                    class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition text-sm font-bold" />
                </div>

                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">JSON Key (Slug)</label>
                  <input v-model="itemForm.key" type="text" placeholder="Contoh: IT_MOKA"
                    class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition text-sm font-bold uppercase" />
                </div>

                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Icon (Text/Abbr)</label>
                  <input v-model="itemForm.icon" type="text" placeholder="IT" maxlength="3"
                    class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition text-sm font-bold text-center" />
                </div>

                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Background Class (Tailwind)</label>
                  <select v-model="itemForm.bg"
                    class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition text-sm font-bold">
                    <option value="bg-blue-500">Biru</option>
                    <option value="bg-emerald-500">Hijau</option>
                    <option value="bg-amber-500">Oranye</option>
                    <option value="bg-rose-500">Merah</option>
                    <option value="bg-indigo-500">Ungu</option>
                    <option value="bg-gray-500">Abu-abu</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Urutan (Order)</label>
                  <input v-model.number="itemForm.order" type="number" placeholder="1"
                    class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition text-sm font-bold" />
                </div>

                <div class="md:col-span-2 space-y-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Deskripsi Singkat</label>
                  <textarea v-model="itemForm.desc" rows="3" placeholder="Jelaskan fungsi kontak ini..."
                    class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition text-sm font-bold"></textarea>
                </div>

                <div class="md:col-span-2">
                  <button 
                    @click="saveItem"
                    :disabled="groupStore.isLoading"
                    class="w-full py-4 bg-brand-500 text-white font-black rounded-2xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-2 uppercase tracking-widest text-xs"
                  >
                    {{ groupStore.isLoading ? 'Menyimpan...' : (itemForm.id ? 'Update Departemen' : 'Tambah Departemen') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { LayoutGrid, Plus, Pencil, Trash2, X, Hash, MoveVertical } from 'lucide-vue-next';
import { useContactGroupStore } from './contact-group.store';
import { Alert } from '@/plugins/sweetalert';

const groupStore = useContactGroupStore();

// --- Group Form ---
const showGroupModal = ref(false);
const groupForm = ref({
  id: null,
  label: '',
  order: 1
});

const openGroupModal = (group = null) => {
  if (group) {
    groupForm.value = { ...group };
  } else {
    groupForm.value = { id: null, label: '', order: groupStore.groups.length + 1 };
  }
  showGroupModal.value = true;
};

const saveGroup = async () => {
  if (!groupForm.value.label) return Alert.error('Gagal', 'Nama grup harus diisi');
  
  try {
    if (groupForm.value.id) {
      await groupStore.updateGroup(groupForm.value.id, groupForm.value);
      Alert.success('Berhasil', 'Grup berhasil diperbarui');
    } else {
      await groupStore.createGroup(groupForm.value);
      Alert.success('Berhasil', 'Grup baru berhasil dibuat');
    }
    showGroupModal.value = false;
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan');
  }
};

const handleDeleteGroup = async (id) => {
  const confirmed = await Alert.confirm('Hapus Grup?', 'Semua departemen di dalam grup ini juga akan terhapus.');
  if (confirmed) {
    try {
      await groupStore.deleteGroup(id);
      Alert.success('Berhasil', 'Grup berhasil dihapus');
    } catch (error) {
      Alert.error('Gagal', 'Gagal menghapus grup');
    }
  }
};

// --- Item Form ---
const showItemModal = ref(false);
const itemForm = ref({
  id: null,
  group_id: null,
  key: '',
  label: '',
  desc: '',
  bg: 'bg-blue-500',
  icon: '',
  order: 1
});

const openItemModal = (groupId, item = null) => {
  if (item) {
    itemForm.value = { ...item };
  } else {
    itemForm.value = { 
      id: null, 
      group_id: groupId, 
      key: '', 
      label: '', 
      desc: '', 
      bg: 'bg-blue-500', 
      icon: '', 
      order: 1 
    };
  }
  showItemModal.value = true;
};

const saveItem = async () => {
  if (!itemForm.value.label || !itemForm.value.key) return Alert.error('Gagal', 'Label dan Key harus diisi');
  
  try {
    if (itemForm.value.id) {
      await groupStore.updateItem(itemForm.value.id, itemForm.value);
      Alert.success('Berhasil', 'Departemen berhasil diperbarui');
    } else {
      await groupStore.createItem(itemForm.value);
      Alert.success('Berhasil', 'Departemen baru berhasil ditambahkan');
    }
    showItemModal.value = false;
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan');
  }
};

const handleDeleteItem = async (id) => {
  const confirmed = await Alert.confirm('Hapus Departemen?', 'Departemen ini akan dihapus dari template.');
  if (confirmed) {
    try {
      await groupStore.deleteItem(id);
      Alert.success('Berhasil', 'Departemen berhasil dihapus');
    } catch (error) {
      Alert.error('Gagal', 'Gagal menghapus departemen');
    }
  }
};

onMounted(() => {
  groupStore.fetchGroups();
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

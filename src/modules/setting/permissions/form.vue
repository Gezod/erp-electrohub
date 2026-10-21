<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <button @click="router.back()"
            class="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-brand-500 transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 shadow-sm">
            <MoveLeft class="w-5 h-5" />
          </button>
          <div class="flex flex-col">
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">{{ isEdit ? 'Ubah Permission' : 'Registrasi Permission' }}</h2>
            <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic">Konfigurasi Akses Sistem &bull; RBAC Master</p>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="max-w-4xl">
        <form @submit.prevent="onSubmit" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
          <div class="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/50">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white">Detail Konfigurasi Permission</h3>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest mt-1">Tentukan kode unik dan cakupan aksi sistem.</p>
          </div>

          <div class="p-8 space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Code -->
              <div class="col-span-1">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">Kode Permission <span class="text-red-500">*</span></label>
                <input v-model="form.code" type="text" placeholder="misal: user_create" required
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:text-white font-mono text-sm" />
                <p class="mt-2 text-[10px] text-gray-400 dark:text-gray-500 italic font-medium">* Digunakan sistem untuk pengecekan akses (slug).</p>
              </div>

              <!-- Name -->
              <div class="col-span-1">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">Nama Permission <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" placeholder="misal: Create User" required
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:text-white" />
              </div>

              <!-- Module Selection -->
              <div class="col-span-1">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">Modul <span class="text-red-500">*</span></label>
                <select v-model="form.module" required
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-gray-600 dark:text-gray-300">
                  <option value="">Pilih Modul</option>
                  <option v-for="mod in moduleOptions" :key="mod" :value="mod">{{ formatLabel(mod) }}</option>
                </select>
              </div>

              <!-- Action Selection -->
              <div class="col-span-1">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">Aksi (Action) <span class="text-red-500">*</span></label>
                <select v-model="form.action" required
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-gray-600 dark:text-gray-300">
                  <option value="">Pilih Aksi</option>
                  <option value="read">Read (Lihat)</option>
                  <option value="create">Create (Tambah)</option>
                  <option value="update">Update (Ubah)</option>
                  <option value="delete">Delete (Hapus)</option>
                  <option value="other">Other (Lainnya)</option>
                </select>
              </div>

              <!-- Description -->
              <div class="col-span-1 md:col-span-2">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">Deskripsi</label>
                <textarea v-model="form.description" rows="3" placeholder="Jelaskan kegunaan permission ini secara mendetail..."
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:text-white resize-none"></textarea>
              </div>
            </div>

            <div class="pt-8 border-t border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row gap-4">
              <button 
                v-can="isEdit ? 'permissions:update' : 'permissions:create'"
                type="submit" 
                :disabled="permissionsStore.isLoading"
                class="flex-1 px-8 py-3.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-3 order-1 sm:order-2"
              >
                <Loader2 v-if="permissionsStore.isLoading" class="w-5 h-5 animate-spin" />
                <span>{{ permissionsStore.isLoading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Permission') }}</span>
              </button>
              <button type="button" @click="router.back()" :disabled="permissionsStore.isLoading"
                class="px-10 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all order-2 sm:order-1">
                Batal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import { Alert } from '@/plugins/sweetalert';
import { MoveLeft, Loader2 } from 'lucide-vue-next';

// Store
import { usePermissionsStore } from './permissions.store';

const router = useRouter();
const route = useRoute();
const permissionsStore = usePermissionsStore();

// --- Computed Mode ---
const isEdit = computed(() => !!route.params.id);

// --- State ---
const form = reactive({
  code: '',
  name: '',
  module: '',
  action: '',
  description: ''
});

const moduleOptions = [
  'assets',
  'users',
  'employees',
  'locations',
  'categories',
  'divisions',
  'roles',
  'permissions',
  'menu',
  'todo'
];

// --- Methods ---

const formatLabel = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const onSubmit = async () => {
  if (!form.code || !form.name || !form.module || !form.action) {
    Alert.error('Validasi Gagal', 'Harap lengkapi semua field wajib (*).');
    return;
  }

  try {
    if (isEdit.value) {
      await permissionsStore.updatePermission(route.params.id, form);
      Alert.success('Berhasil', 'Data permission telah diperbarui.');
    } else {
      await permissionsStore.createPermission(form);
      Alert.success('Berhasil', 'Permission baru telah didaftarkan ke sistem.');
    }
    router.push({ name: 'PermissionsList' });
  } catch (error) {
    console.error('Submit error:', error);
    const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data ke server.';
    Alert.error('Gagal Simpan', msg);
  }
};

onMounted(async () => {
  if (isEdit.value) {
    try {
      const data = await permissionsStore.fetchPermissionById(route.params.id);
      form.code = data.code;
      form.name = data.name;
      form.module = data.module;
      form.action = data.action;
      form.description = data.description;
    } catch (error) {
      Alert.error('Error', 'Gagal memuat data permission.');
      router.push({ name: 'PermissionsList' });
    }
  }
});
</script>

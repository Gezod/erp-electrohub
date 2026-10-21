<template>
  <AdminLayout>
    <div class="mx-auto max-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <router-link to="/setting/manage-contact" class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-all border border-gray-200 dark:border-gray-700">
            <ArrowLeft class="w-5 h-5" />
          </router-link>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">
              {{ storeInfo ? `Kontak: ${storeInfo.store_name || storeInfo.store_code}` : 'Kelola Kontak' }}
            </h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic text-emerald-500">Template Driven Form &bull; OPA Standard</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            v-can="'manage-contact:update'"
            @click="saveContacts"
            :disabled="manageStore.isLoading"
            class="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50">
            <Save class="w-5 h-5" />
            {{ manageStore.isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar Config -->
        <div class="lg:col-span-1 space-y-6">
          <div class="p-8 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm sticky top-10">
            <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Status Hotline</h3>
            
            <div 
              @click="authStore.hasPrivilege('manage-contact:update') && (form.is_hotline_ready = !form.is_hotline_ready)"
              :class="[
                'p-6 rounded-2xl border-2 transition-all flex flex-col gap-3',
                authStore.hasPrivilege('manage-contact:update') ? 'cursor-pointer' : 'cursor-default',
                form.is_hotline_ready 
                  ? 'bg-green-50 border-green-200 dark:bg-green-500/5 dark:border-green-500/20' 
                  : 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700'
              ]"
            >
              <div class="flex items-center justify-between">
                <div :class="['p-2 rounded-lg', form.is_hotline_ready ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-white']">
                  <Check v-if="form.is_hotline_ready" class="w-4 h-4" />
                  <X v-else class="w-4 h-4" />
                </div>
                <div :class="['w-12 h-6 rounded-full relative transition-colors duration-300', form.is_hotline_ready ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600']">
                  <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300', form.is_hotline_ready ? 'left-7' : 'left-1']"></div>
                </div>
              </div>
              <div>
                <p class="text-sm font-black text-gray-800 dark:text-white">Hotline Ready</p>
                <p class="text-[10px] font-bold text-gray-400 uppercase mt-1 leading-relaxed">
                  Tandai jika semua data kontak sudah lengkap dan siap ditampilkan di aplikasi.
                </p>
              </div>
            </div>

            <div class="mt-8 p-6 bg-brand-50 dark:bg-brand-500/5 rounded-2xl border border-brand-100 dark:border-brand-500/20">
              <div class="flex items-center gap-3 mb-3">
                <Info class="w-4 h-4 text-brand-500" />
                <h4 class="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">Informasi</h4>
              </div>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Daftar departemen ini dikelola secara terpusat melalui Halaman Label Kontak. Pastikan nomor HP yang dimasukkan aktif dan dapat dihubungi melalui WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <!-- Dynamic Form Groups -->
        <div class="lg:col-span-2 space-y-8">
          <div v-if="manageStore.isLoading && Object.keys(form.contacts).length === 0" class="py-20 flex justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          </div>

          <div v-else v-for="group in manageStore.templateGroups" :key="group.id" class="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div class="px-8 py-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{{ group.label }}</h3>
            </div>
            
            <div class="p-8 space-y-6">
              <div v-for="item in group.items" :key="item.id" class="group transition-all">
                <div class="flex flex-col md:flex-row md:items-center gap-4">
                  <div class="w-full md:w-1/3">
                    <div class="flex items-center gap-3 mb-1">
                      <div :class="['w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] text-white shadow-sm', item.bg || 'bg-gray-400']">
                        {{ item.icon || '?' }}
                      </div>
                      <label class="text-sm font-black text-gray-800 dark:text-white">{{ item.label }}</label>
                    </div>
                    <p class="text-[10px] text-gray-400 font-medium italic ml-11">{{ item.desc || 'Kontak departemen' }}</p>
                  </div>
                  
                  <div class="flex-1 relative">
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone class="w-4 h-4" />
                    </div>
                    <input 
                      v-model="form.contacts[item.key]"
                      type="text"
                      placeholder="Masukkan nomor HP/Kontak..."
                      :disabled="!authStore.hasPrivilege('manage-contact:update')"
                      class="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition text-sm font-bold font-mono disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-800/80"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!manageStore.isLoading && manageStore.templateGroups.length === 0" class="p-12 text-center bg-white dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
             <LayoutGrid class="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Master Template Belum Diatur</p>
             <p class="text-[10px] text-gray-500 mt-2">Silakan hubungi administrator untuk mengonfigurasi departemen kontak.</p>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { ArrowLeft, Save, Phone, Check, X, Info, LayoutGrid } from 'lucide-vue-next';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { useManageContactStore } from './manage-contact.store';
import { Alert } from '@/plugins/sweetalert';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const manageStore = useManageContactStore();

const storeId = route.params.store_id;
const storeInfo = ref(null);

const form = ref({
  is_hotline_ready: false,
  contacts: {} // Object structure { "IT MOKA": "085...", "PAYROLL": "..." }
});

const fetchInitialData = async () => {
  try {
    // 1. Fetch template structure first
    await manageStore.fetchTemplateGroups();
    
    // Initialize form keys from template to ensure reactivity for all fields
    manageStore.templateGroups.forEach(group => {
      group.items.forEach(item => {
        if (form.value.contacts[item.key] === undefined) {
          form.value.contacts[item.key] = '';
        }
      });
    });

    // 2. Fetch actual store contact data
    const data = await manageStore.fetchContactById(storeId);
    if (data) {
      storeInfo.value = data;
      form.value.is_hotline_ready = data.is_hotline_ready ?? false;
      
      let existingContacts = data.contacts || {};
      if (typeof existingContacts === 'string') {
        try { existingContacts = JSON.parse(existingContacts); } catch (e) { existingContacts = {}; }
      } else if (Array.isArray(existingContacts)) { // Convert array to object just in case legacy format
          const newObj = {};
          existingContacts.forEach(c => {
             const key = c.item_key || c.key || c.department || c.label || c.name;
             const val = c.phone || c.value || c.number;
             if(key && val) newObj[key] = val;
          });
          existingContacts = newObj;
      }

      // Merge existing data into form
      Object.keys(existingContacts).forEach(key => {
        form.value.contacts[key] = existingContacts[key];
      });
    }
  } catch (error) {
    console.error('fetchInitialData Error', error);
  }
};

const saveContacts = async () => {
  try {
    const payload = {
      is_hotline_ready: form.value.is_hotline_ready,
      contacts: form.value.contacts
    };

    await manageStore.updateContact(storeId, payload);
    Alert.success('Berhasil', 'Kontak toko berhasil diperbarui');
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan');
  }
};

onMounted(() => {
  fetchInitialData();
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.4s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

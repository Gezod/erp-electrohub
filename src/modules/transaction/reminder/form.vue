<template>
  <AdminLayout>
    <div class="mx-auto max-w-5xl p-4 md:p-6 2xl:p-10 space-y-8">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button @click="router.back()"
          class="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-brand-500 transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 shadow-sm active:scale-95">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex flex-col">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white leading-none mb-1">
            System Notification Detail
          </h2>
          <p class="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Transaksi &bull; Detail Pemicu Notifikasi & Pengingat Sistem
          </p>
        </div>
      </div>

      <!-- Form Content -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
        <div class="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
          <h3 class="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-wide">
            <BellRing class="w-4 h-4 text-brand-500" />
            Informasi Notifikasi
          </h3>
        </div>

        <div class="p-8 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Tipe Reminder -->
            <div class="space-y-2.5">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Tipe Pengingat</label>
              <select 
                v-model="form.reminderType" 
                disabled
                class="input-base !bg-gray-50 dark:!bg-gray-800/50 cursor-not-allowed opacity-70"
              >
                <option value="stnk">STNK</option>
                <option value="service_vehicle">Service Kendaraan</option>
                <option value="quota">Kuota / Limit</option>
                <option value="work_schedule">Jadwal Kerja (Roster)</option>
                <option value="driver">Driver (SIM/SIPA)</option>
                <option value="cctv">Maintenance CCTV</option>
                <option value="cleaning">Cleaning Service</option>
                <option value="schedule">Penjadwalan Umum</option>
                <option value="license_expired">Lisensi Kedaluwarsa</option>
              </select>
            </div>

            <!-- Status -->
            <div class="space-y-2.5">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</label>
              <select 
                v-model="form.status" 
                disabled
                class="input-base !bg-gray-50 dark:!bg-gray-800/50 cursor-not-allowed opacity-70 font-bold uppercase"
              >
                <option value="active">Active</option>
                <option value="done">Done</option>
              </select>
            </div>

            <!-- Jatuh Tempo -->
            <div class="space-y-2.5">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Tanggal Jatuh Tempo</label>
              <input 
                :value="form.dueDate" 
                disabled
                type="date"
                class="input-base !bg-gray-50 dark:!bg-gray-800/50 cursor-not-allowed opacity-70"
              />
            </div>

            <!-- Alert Before -->
            <div class="space-y-2.5">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Alert (Hari Sebelum)</label>
              <div class="relative">
                <input 
                  v-model="form.alertDateBefore" 
                  type="number" 
                  disabled
                  class="input-base !bg-gray-50 dark:!bg-gray-800/50 cursor-not-allowed opacity-70 font-bold" 
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">Hari</span>
              </div>
            </div>

            <!-- Table Reference -->
            <div class="space-y-2.5">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Referensi Tabel</label>
              <input 
                v-model="form.tableReference" 
                type="text" 
                disabled
                class="input-base !bg-gray-50 dark:!bg-gray-800/50 cursor-not-allowed opacity-70 font-mono text-xs" 
              />
            </div>

            <!-- Reference ID -->
            <div class="space-y-2.5">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">ID Referensi (UUID)</label>
              <input 
                v-model="form.referenceId" 
                type="text" 
                disabled
                class="input-base !bg-gray-50 dark:!bg-gray-800/50 cursor-not-allowed opacity-70 font-mono text-xs" 
              />
            </div>

            <!-- Deskripsi -->
            <div class="space-y-2.5 md:col-span-2">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Deskripsi Notifikasi</label>
              <textarea 
                v-model="form.description" 
                rows="4" 
                disabled
                class="input-base !bg-gray-50 dark:!bg-gray-800/50 cursor-not-allowed opacity-70 !h-auto resize-none text-sm"
              ></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-10 border-t border-gray-50 dark:border-gray-800">
            <button 
              type="button" 
              @click="router.back()" 
              class="btn-outline w-full shadow-sm active:scale-95 transition-all"
            >
              Kembali ke Daftar
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { reactive, onMounted, computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { ArrowLeft, BellRing, Loader2 } from 'lucide-vue-next';
import { useReminderStore } from './reminder.store';
import { Alert } from '@/plugins/sweetalert';

const router = useRouter();
const route = useRoute();
const reminderStore = useReminderStore();
const isLoading = ref(false);

const isEdit = computed(() => !!route.params.id);

const form = reactive({
  referenceId: '',
  tableReference: '',
  reminderType: 'stnk',
  dueDate: new Date().toISOString().split('T')[0],
  alertDateBefore: 7,
  description: '',
  status: 'active'
});

onMounted(async () => {
  if (isEdit.value) {
    await loadDetail();
  }
});

const loadDetail = async () => {
  isLoading.value = true;
  try {
    const detail = await reminderStore.fetchDetail(route.params.id);
    if (detail) {
      form.referenceId = detail.referenceId;
      form.tableReference = detail.tableReference;
      form.reminderType = detail.reminderType;
      form.dueDate = detail.dueDate;
      form.alertDateBefore = detail.alertDateBefore;
      form.description = detail.description;
      form.status = detail.status;
    }
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Data pengingat tidak ditemukan');
    router.push({ name: 'TranReminders' });
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    if (isEdit.value) {
      await reminderStore.updateReminder(route.params.id, form);
      Alert.success('Berhasil', 'Halaman pengingat telah diperbarui');
    } else {
      await reminderStore.createReminder(form);
      Alert.success('Berhasil', 'Pengingat baru telah dibuat');
    }
    router.push({ name: 'TranReminders' });
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Terjadi kesalahan sistem');
  } finally {
    isLoading.value = false;
  }
};
</script>

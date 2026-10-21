<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Header -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button @click="router.back()"
            class="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition shadow-sm">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <div>
            <h2 class="text-2xl font-bold text-slate-800">Profil Karyawan</h2>
            <p class="text-sm text-slate-500 font-medium tracking-tight">NIK: {{ employee?.nik || '-' }}</p>
          </div>
        </div>
        
        <button
          v-can="'organization:update'"
          @click="showEditModal = true"
          class="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-blue-600 transition shadow-sm cursor-pointer"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit Karyawan
        </button>
      </div>

      <div v-if="employeeStore.isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-slate-500 font-medium">Memuat profil karyawan...</p>
      </div>

      <div v-else-if="employee" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- LEFT COLUMN: Profile Card -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <!-- Card Cover/Gradient -->
            <div class="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            <div class="px-8 pb-8 -mt-12 text-center">
              <!-- Avatar -->
              <div class="inline-block p-1 bg-white rounded-full shadow-lg mb-4">
                <div class="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden border-2 border-white">
                  <img v-if="employee.photoUrl" :src="employee.photoUrl" class="w-full h-full object-cover" alt="Profile" />
                  <svg v-else class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                  </svg>
                </div>
              </div>

              <h3 class="text-xl font-bold text-slate-800 leading-tight mb-1">{{ employee.fullName }}</h3>
              <p class="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">{{ employee.isChief ? 'Chief Executive' : (employee.position?.name || employee.position || '-') }}</p>
              
              <div :class="statusClass(employee.status)" class="inline-flex px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border">
                {{ employee.status }}
              </div>

              <!-- Quick Info List -->
              <div class="space-y-4 text-left pt-6 border-t border-slate-50">
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-slate-50 rounded-lg text-slate-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div>
                  <div class="flex-1 overflow-hidden">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Email Portal</p>
                    <p class="text-sm text-slate-700 font-semibold truncate">{{ employee.email }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-slate-50 rounded-lg text-slate-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
                  <div class="flex-1">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Struktur</p>
                    <p class="text-sm text-slate-700 font-semibold">{{ employee.isChief ? 'Direktorat Utama' : (employee.division?.name || '-') }} ({{ employee.location?.location_name || '-' }})</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-slate-50 rounded-lg text-slate-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                  <div class="flex-1">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Join Date</p>
                    <p class="text-sm text-slate-700 font-semibold">{{ formatDate(employee.joinDate) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="employee.isChief" class="bg-brand-50/50 p-6 rounded-3xl border border-brand-100/50 shadow-sm">
             <h4 class="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-3 italic">Pangkat Khusus</h4>
             <div class="flex gap-2">
                <span class="px-4 py-1.5 bg-brand-500 text-white text-[10px] font-black rounded-xl border border-brand-400 shadow-lg shadow-brand-500/20 tracking-widest">CHIEF</span>
             </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Detailed Info & Histories -->
        <div class="lg:col-span-8 space-y-8">
          <!-- TABS NAVIGATION -->
          <div class="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex items-center">
             <button @click="activeTab = 'biodata'" 
               :class="activeTab === 'biodata' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'"
               class="flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200">
               Biodata Lengkap
             </button>
             <button @click="activeTab = 'history'" 
               :class="activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'"
               class="flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
               Riwayat Profesional
               <span class="px-1.5 py-0.5 bg-white/20 text-[10px] rounded-md">{{ employee.histories?.length || 0 }}</span>
             </button>
             <button @click="activeTab = 'audit'" 
               :class="activeTab === 'audit' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'"
               class="flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200">
               Audit Log
             </button>
          </div>

          <!-- TAB CONTENT: BIODATA -->
          <div v-show="activeTab === 'biodata'" class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8 animate-fadeIn">
            <!-- Personal -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div class="md:col-span-2 flex items-center gap-3 py-2 border-b border-slate-50">
                  <span class="w-1 h-4 bg-emerald-500 rounded-full"></span>
                  <p class="text-sm font-bold text-slate-800 uppercase tracking-wider">Informasi Personal</p>
               </div>
               <div>
                  <p class="text-[11px] text-slate-400 font-bold uppercase mb-1">NIK (KTP)</p>
                  <p class="text-sm text-slate-700 font-semibold">{{ employee.nationalId || '-' }}</p>
               </div>
               <div>
                  <p class="text-[11px] text-slate-400 font-bold uppercase mb-1">Jenis Kelamin</p>
                  <p class="text-sm text-slate-700 font-semibold capitalize">{{ employee.gender }}</p>
               </div>
               <div>
                  <p class="text-[11px] text-slate-400 font-bold uppercase mb-1">Tempat, Tgl Lahir</p>
                  <p class="text-sm text-slate-700 font-semibold">{{ employee.placeOfBirth || '-' }}, {{ formatDate(employee.dateOfBirth) }}</p>
               </div>
               <div>
                  <p class="text-[11px] text-slate-400 font-bold uppercase mb-1">Email Pribadi / Bisnis</p>
                  <p class="text-sm text-slate-700 font-semibold italic">{{ employee.employeeEmail || '-' }}</p>
               </div>
               <div>
                  <p class="text-[11px] text-slate-400 font-bold uppercase mb-1">Handphone</p>
                  <p class="text-sm text-slate-700 font-semibold">{{ employee.phone || '-' }}</p>
               </div>
               <div class="md:col-span-2">
                  <p class="text-[11px] text-slate-400 font-bold uppercase mb-1">Alamat Domisili</p>
                  <p class="text-sm text-slate-700 font-semibold leading-relaxed">{{ employee.address || '-' }}</p>
               </div>
            </div>

            <!-- Emergency -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
               <div class="md:col-span-2 flex items-center gap-3 py-2 border-b border-slate-50">
                  <span class="w-1 h-4 bg-red-500 rounded-full"></span>
                  <p class="text-sm font-bold text-slate-800 uppercase tracking-wider">Kontak Darurat</p>
               </div>
               <div>
                  <p class="text-[11px] text-slate-400 font-bold uppercase mb-1">Nama Kerabat</p>
                  <p class="text-sm text-slate-700 font-semibold">{{ employee.emergencyContactName || '-' }}</p>
               </div>
               <div>
                  <p class="text-[11px] text-slate-400 font-bold uppercase mb-1">No. HP Darurat</p>
                  <p class="text-sm text-slate-700 font-semibold">{{ employee.emergencyContactPhone || '-' }}</p>
               </div>
            </div>
          </div>

          <!-- TAB CONTENT: HISTORY (Timeline) -->
          <div v-show="activeTab === 'history'" class="space-y-6">
            <!-- Add History Toggle -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
               <button @click="showAddHistory = !showAddHistory" 
                 class="w-full px-8 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition">
                  <div>
                    <h4 class="text-sm font-bold text-slate-800">Pencatatan Riwayat Manual</h4>
                    <p class="text-[11px] text-slate-400 font-medium">Catat pencapaian, insiden, atau catatan administratif lainnya.</p>
                  </div>
                  <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center transition-transform duration-300" :class="showAddHistory ? 'rotate-45' : ''">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  </div>
               </button>

               <div v-if="showAddHistory" class="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-6 animate-slideDown">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label class="block text-[11px] font-bold text-slate-500 uppercase mb-2">Jenis Kejadian</label>
                       <select v-model="historyForm.changeType" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white font-medium text-sm">
                         <option value="achievement">Prestasi / Penghargaan</option>
                         <option value="warning">Peringatan (Warning)</option>
                         <option value="incident">Insiden Lapangan</option>
                         <option value="training">Sertifikasi & Pelatihan</option>
                         <option value="mutation">Mutasi (Manual Log)</option>
                         <option value="administrative">Administratif Lainnya</option>
                       </select>
                    </div>
                    <div>
                       <label class="block text-[11px] font-bold text-slate-500 uppercase mb-2">Tanggal Efektif</label>
                       <input v-model="historyForm.effectiveDate" type="date" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none font-medium text-sm" />
                    </div>
                    <div class="md:col-span-2">
                       <label class="block text-[11px] font-bold text-slate-500 uppercase mb-2">Alasan & Kronologi</label>
                       <textarea v-model="historyForm.reason" rows="2" placeholder="Tuliskan alasan atau keterangan detail..." class="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none resize-none text-sm"></textarea>
                    </div>
                  </div>
                  <div class="flex justify-end gap-3">
                    <button @click="showAddHistory = false" class="text-sm font-bold text-slate-400 hover:text-slate-600 px-4">Batal</button>
                    <button @click="onSubmitHistory" :disabled="isSubmittingHistory" 
                      class="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                      <svg v-if="isSubmittingHistory" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                      Simpan Riwayat
                    </button>
                  </div>
               </div>
            </div>

            <!-- Timeline Card -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8 animate-fadeIn">
              <div v-if="!employee.histories || employee.histories.length === 0" class="flex flex-col items-center justify-center py-10 opacity-40">
                <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="font-bold">Belum ada catatan riwayat hidup profesional.</p>
              </div>

              <div v-else class="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                <!-- Timeline Item -->
                <div v-for="(history, index) in sortedHistories" :key="history.id || index" class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <!-- Dot -->
                  <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-md absolute left-0 md:left-1/2 md:-ml-5 transition-all duration-300 group-hover:scale-125 z-10"
                    :class="historyColor(history.changeType)">
                    <component :is="historyIcon(history.changeType)" class="w-4 h-4 text-white" />
                  </div>
                  <!-- Content Card -->
                   <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all ml-16 md:ml-0">
                      <div class="flex items-center justify-between mb-2">
                         <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{{ history.changeType || 'EVENT' }}</span>
                         <span class="text-[11px] font-bold text-slate-400">{{ formatDate(history.effectiveDate) }}</span>
                      </div>
                      <h5 class="text-sm font-bold text-slate-800 mb-2 leading-snug">{{ history.reason || 'Pencatatan tanpa keterangan khusus.' }}</h5>
                      <p v-if="history.notes" class="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border-l-4 border-slate-200">{{ history.notes }}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB CONTENT: AUDIT LOG -->
          <div v-if="activeTab === 'audit'" class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 animate-fadeIn">
            <AuditHistory module="ORG_EMPLOYEE" :recordId="route.params.id" />
          </div>
        </div>
      </div>

      <!-- Form Modal (Edit) -->
      <EmployeeFormModal
        v-model="showEditModal"
        :employee-id="route.params.id"
        @saved="employeeStore.fetchEmployeeDetail(route.params.id)"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import AuditHistory from '@/components/common/AuditHistory.vue';
import EmployeeFormModal from './components/EmployeeFormModal.vue';
import { Alert } from '@/plugins/sweetalert';

// Icons
import { TrendingUp, RefreshCw, AlertCircle, Award, BookOpen, Clock } from 'lucide-vue-next';

// Store
import { useEmployeeStore } from './employee.store';

const route = useRoute();
const router = useRouter();
const employeeStore = useEmployeeStore();

// --- State ---
const activeTab = ref('biodata');
const showEditModal = ref(false);
const showAddHistory = ref(false);
const isSubmittingHistory = ref(false);

const historyForm = ref({
  changeType: 'achievement',
  effectiveDate: new Date().toISOString().split('T')[0],
  reason: '',
  notes: ''
});

// --- Computed ---
const employee = computed(() => employeeStore.employeeDetail);

const sortedHistories = computed(() => {
  if (!employee.value?.histories) return [];
  return [...employee.value.histories].sort((a, b) => 
    new Date(b.effectiveDate || 0) - new Date(a.effectiveDate || 0)
  );
});

// --- Lifecycle ---
onMounted(async () => {
  try {
    await employeeStore.fetchEmployeeDetail(route.params.id);
  } catch (error) {
    const msg = error.response?.data?.message || 'Data karyawan gagal dimuat atau tidak ditemukan.';
    Alert.error('Error', msg);
    router.push({ name: 'EmployeeList' });
  }
});

// --- Actions ---

const onSubmitHistory = async () => {
  if (!historyForm.value.reason) {
    return Alert.error('Gagal', 'Alasan riwayat wajib diisi.');
  }

  isSubmittingHistory.value = true;
  try {
    await employeeStore.createManualHistory(route.params.id, historyForm.value);
    Alert.toast('Riwayat berhasil dicatat.');
    showAddHistory.value = false;
    historyForm.value = { 
      changeType: 'achievement', 
      effectiveDate: new Date().toISOString().split('T')[0], 
      reason: '', 
      notes: '' 
    };
  } catch (error) {
    const msg = error.response?.data?.message || 'Sistem tidak dapat menyimpan riwayat saat ini.';
    Alert.error('Gagal', msg);
  } finally {
    isSubmittingHistory.value = false;
  }
};

// --- Helpers ---

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date(dateString));
};

const statusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'inactive': return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'resigned': return 'bg-slate-50 text-slate-700 border-slate-100';
    case 'terminated': return 'bg-rose-50 text-rose-700 border-rose-100';
    default: return 'bg-gray-50 text-gray-700 border-gray-100';
  }
};

const historyIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'promotion': return markRaw(TrendingUp);
    case 'mutation': return markRaw(RefreshCw);
    case 'warning': return markRaw(AlertCircle);
    case 'achievement': return markRaw(Award);
    case 'training': return markRaw(BookOpen);
    default: return markRaw(Clock);
  }
};

const historyColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'promotion': return 'bg-indigo-600 shadow-indigo-200';
    case 'mutation': return 'bg-amber-500 shadow-amber-200';
    case 'warning': return 'bg-rose-600 shadow-rose-200';
    case 'achievement': return 'bg-emerald-600 shadow-emerald-200';
    case 'training': return 'bg-blue-600 shadow-blue-200';
    default: return 'bg-slate-400 shadow-slate-100';
  }
};
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}
.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

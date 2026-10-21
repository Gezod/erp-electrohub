<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div>
            <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none mb-1">
              {{ isEdit ? 'Update Data ST/SP' : 'Input ST/SP Baru' }}
            </h2>
            <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic">
              Administrasi Pembinaan &bull; Human Resources
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Form -->
        <div class="lg:col-span-8">
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
            <div class="p-8 space-y-10">
              <!-- Karyawan Section -->
              <section class="space-y-6">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
                    <User class="w-4 h-4" />
                  </div>
                  <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Target Karyawan</h3>
                </div>

                <div v-if="!isEdit" class="relative">
                  <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1 mb-2 block">Cari Karyawan Aktif</label>
                  <div class="relative">
                    <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
                    <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Masukkan Nama atau NIK..." class="input-base pl-12 h-12" />
                    
                    <div v-if="searchResults.length > 0" class="absolute z-10 left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2">
                      <div v-for="emp in searchResults" :key="emp.id" @click="selectEmployee(emp)" class="p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer rounded-xl flex items-center gap-3 transition-all">
                        <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center font-bold">{{ emp.full_name.charAt(0) }}</div>
                        <div>
                          <div class="text-sm font-bold text-gray-800 dark:text-white">{{ emp.full_name }}</div>
                          <div class="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{{ emp.employee_number }} &bull; {{ emp.position?.name }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="selectedEmployee" class="bg-brand-50 dark:bg-brand-900/10 p-5 rounded-2xl border border-brand-100 dark:border-brand-800/50 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-brand-500"><User :size="24" /></div>
                    <div>
                      <div class="font-black text-brand-900 dark:text-brand-400 uppercase tracking-tight text-base">{{ selectedEmployee.full_name }}</div>
                      <p class="text-[11px] text-brand-700/70 dark:text-brand-500/70 font-bold uppercase tracking-widest">{{ selectedEmployee.employee_number }} &bull; {{ selectedEmployee.position?.name }}</p>
                    </div>
                  </div>
                  <button v-if="!isEdit" @click="selectedEmployee = null; searchQuery = ''" class="text-xs font-bold text-rose-500 hover:underline px-4">Ganti</button>
                </div>
              </section>

              <!-- ST/SP Detail Section -->
              <section class="space-y-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
                    <FileText class="w-4 h-4" />
                  </div>
                  <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Form ST/SP</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Tanggal Penerbitan</label>
                    <DatePicker v-model="form.stsp_date" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Nominal Denda (Rp)</label>
                    <input 
                      :value="formatThousand(form.nominal)" 
                      @input="e => form.nominal = parseThousand(e.target.value)"
                      type="text" class="input-base" placeholder="Contoh: 50.000" 
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Keterangan</label>
                  <textarea v-model="form.keterangan" rows="4" class="input-base !h-auto resize-none p-4" placeholder="Tuliskan keterangan detail alasan penerbitan ST/SP..."></textarea>
                </div>

                <div class="space-y-2">
                  <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Catatan (Internal)</label>
                  <textarea v-model="form.catatan" rows="3" class="input-base !h-auto resize-none p-4" placeholder="Tuliskan catatan tambahan HR jika ada..."></textarea>
                </div>
              </section>
            </div>

            <!-- Action Bar -->
            <div class="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Data akan tercatat permanen dalam riwayat pembinaan karyawan.</p>
              <div class="flex gap-4">
                <button @click="router.back()" class="btn-outline px-8 h-11">Batal</button>
                <button @click="handleSubmit" :disabled="submitting || !selectedEmployee" class="btn-primary px-12 h-11 shadow-lg shadow-brand-500/20 active:scale-95 transition-all">
                  {{ submitting ? 'Menyimpan...' : (isEdit ? 'Update Data' : 'Simpan ST/SP') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Sidebar -->
        <div class="lg:col-span-4 space-y-8">
          <div class="bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800/50 p-6 space-y-4">
            <div class="flex items-center gap-2 text-blue-600">
              <Info :size="18" />
              <span class="text-xs font-black uppercase tracking-widest">Informasi Pembinaan</span>
            </div>
            <div class="text-[11px] text-blue-800/80 dark:text-blue-500/80 leading-relaxed space-y-2">
              <p>Surat Teguran (ST) dan Surat Peringatan (SP) diterbitkan untuk membina karyawan tanpa mengacu pada pasal pelanggaran spesifik.</p>
              <p>Form ini hanya membutuhkan pencatatan detail <strong>keterangan</strong>, <strong>catatan</strong> internal, serta <strong>nominal denda</strong> jika ada.</p>
              <p>Notifikasi WhatsApp otomatis akan terkirim ke nomor telepon aktif milik karyawan setelah form disimpan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import { StspService } from './stsp.service'
import resignationService from '../resignation/resignation.service'
import { ArrowLeft, User, Search, FileText, Info } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'
import { formatThousand, parseThousand } from '@/utils/format'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const selectedEmployee = ref(null)

const form = reactive({
  employee_id: '',
  stsp_date: dayjs().format('YYYY-MM-DD'),
  keterangan: '',
  catatan: '',
  nominal: 0
})

const handleSearch = async () => {
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    return
  }
  try {
    const res = await resignationService.searchEmployees(searchQuery.value)
    searchResults.value = res.data.data
  } catch (err) {
    console.error(err)
  }
}

const selectEmployee = (emp) => {
  selectedEmployee.value = emp
  form.employee_id = emp.employee_id
  searchResults.value = []
  searchQuery.value = emp.full_name
}

const handleSubmit = async () => {
  if (!form.employee_id || !form.stsp_date || !form.keterangan) {
    Alert.error('Mohon lengkapi data wajib!')
    return
  }

  submitting.value = true
  try {
    if (isEdit.value) {
      await StspService.update(route.params.id, form)
      Alert.success('Berhasil', 'Data ST/SP berhasil diperbarui')
    } else {
      await StspService.create(form)
      Alert.success('Berhasil', 'Data ST/SP berhasil direkam')
    }
    router.push({ name: 'HrStsp' })
  } catch (err) {
    Alert.error('Gagal menyimpan data', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

const initForm = async () => {
  try {
    if (isEdit.value) {
      const data = await StspService.getOne(route.params.id)
      selectedEmployee.value = data.employee
      form.employee_id = data.employee_id
      form.stsp_date = dayjs(data.stsp_date).format('YYYY-MM-DD')
      form.keterangan = data.keterangan
      form.catatan = data.catatan
      form.nominal = data.nominal
    }
  } catch (err) {
    Alert.error('Gagal menginisialisasi form')
  }
}

onMounted(() => initForm())
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

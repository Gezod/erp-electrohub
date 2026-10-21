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
              {{ isEdit ? 'Update Data Pelanggaran' : 'Input Pelanggaran Baru' }}
            </h2>
            <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic">
              Administrasi Kedisiplinan &bull; Human Resources
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

              <!-- Pelanggaran Detail Section -->
              <section class="space-y-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
                    <FileText class="w-4 h-4" />
                  </div>
                  <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Detail Kasus</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Tanggal Kejadian</label>
                    <DatePicker v-model="form.violation_date" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Pilih Peraturan (Pasal)</label>
                    <select v-model="form.regulation_id" class="input-base">
                      <option :value="null">-- Input Manual (Tanpa Pasal) --</option>
                      <option v-for="reg in activeRegulations" :key="reg.id" :value="reg.id">
                        P{{ reg.pasal }} A{{ reg.ayat }} - {{ reg.description.substring(0, 40) }}...
                      </option>
                    </select>
                  </div>
                </div>

                <div v-if="!form.regulation_id" class="animate-in fade-in duration-500">
                  <div class="space-y-2">
                    <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Nominal Denda Manual (Rp)</label>
                    <input 
                      :value="formatThousand(form.fine_manual)" 
                      @input="e => form.fine_manual = parseThousand(e.target.value)"
                      type="text" class="input-base" placeholder="Contoh: 50.000" 
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Temuan / Pelanggaran</label>
                  <textarea v-model="form.penemuan" rows="3" class="input-base !h-auto resize-none p-4" placeholder="Tuliskan detail apa yang dilanggar karyawan..."></textarea>
                </div>

                <div class="space-y-2">
                  <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Catatan Tambahan (Internal)</label>
                  <textarea v-model="form.notes" rows="2" class="input-base !h-auto resize-none p-4" placeholder="Opsional: catatan tambahan HR..."></textarea>
                </div>
              </section>
            </div>

            <!-- Action Bar -->
            <div class="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Data akan tercatat permanen di history karyawan.</p>
              <div class="flex gap-4">
                <button @click="router.back()" class="btn-outline px-8 h-11">Batal</button>
                <button @click="handleSubmit" :disabled="submitting || !selectedEmployee" class="btn-primary px-12 h-11 shadow-lg shadow-brand-500/20 active:scale-95 transition-all">
                  {{ submitting ? 'Menyimpan...' : (isEdit ? 'Update Data' : 'Simpan Pelanggaran') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar / Attachment -->
        <div class="lg:col-span-4 space-y-8">
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-theme-xs">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                <Camera class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Bukti Foto</h3>
            </div>

            <div class="space-y-4">
              <div @click="triggerFileInput" class="aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-500 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-gray-50 dark:bg-gray-800 relative group">
                <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-cover" />
                <div v-else class="flex flex-col items-center text-gray-400 group-hover:text-brand-500 transition-colors">
                  <UploadCloud :size="32" />
                  <span class="text-[10px] font-black uppercase tracking-widest mt-2">Upload Evidence</span>
                </div>
                <div v-if="photoPreview" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span class="text-[10px] font-black text-white uppercase tracking-widest">Ganti Foto</span>
                </div>
                <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" class="hidden" />
              </div>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center italic">Max size: 2MB &bull; JPG/PNG/WEBP</p>
            </div>
          </div>

          <div v-if="selectedRegulation" class="bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-800/50 p-6 space-y-4 animate-in slide-in-from-right duration-500">
            <div class="flex items-center gap-2 text-rose-600">
              <AlertTriangle :size="18" />
              <span class="text-xs font-black uppercase tracking-widest">Ringkasan Pasal</span>
            </div>
            <div class="space-y-1">
              <h4 class="text-sm font-black text-rose-900 dark:text-rose-400 uppercase tracking-tight">PASAL {{ selectedRegulation.pasal }} AYAT {{ selectedRegulation.ayat }}</h4>
              <p class="text-[11px] text-rose-800/80 dark:text-rose-500/80 leading-relaxed italic">"{{ selectedRegulation.description }}"</p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-rose-100 dark:border-rose-800/30">
               <span class="text-[10px] font-black text-rose-700 uppercase tracking-widest">Denda</span>
               <span class="text-xs font-black text-rose-600 uppercase">{{ formatCurrency(selectedRegulation.fine_amount) }}</span>
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
import { ViolationService } from './violation.service'
import { RegulationService } from '../regulation/regulation.service'
import resignationService from '../resignation/resignation.service'
import { ArrowLeft, User, Search, FileText, Camera, UploadCloud, AlertTriangle } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'
import { formatThousand, parseThousand } from '@/utils/format'

const router = useRouter()
const route = useRoute()

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const selectedEmployee = ref(null)
const activeRegulations = ref([])

const form = reactive({
  employee_id: '',
  violation_date: dayjs().format('YYYY-MM-DD'),
  regulation_id: null,
  fine_manual: 0,
  penemuan: '',
  notes: ''
})

const fileInput = ref(null)
const selectedFile = ref(null)
const photoPreview = ref(null)

const selectedRegulation = computed(() => {
  if (!form.regulation_id) return null
  return activeRegulations.value.find(r => r.id === form.regulation_id)
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

const triggerFileInput = () => fileInput.value.click()

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    Alert.error('File terlalu besar! Maksimal 2MB.')
    return
  }
  selectedFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

const handleSubmit = async () => {
  if (!form.employee_id || !form.violation_date || !form.penemuan) {
    Alert.error('Mohon lengkapi data wajib!')
    return
  }

  if (!form.regulation_id && form.fine_manual === null) {
    Alert.error('Input manual wajib mengisi Nominal Denda!')
    return
  }

  const formData = new FormData()
  Object.keys(form).forEach(key => {
    if (form[key] !== null) formData.append(key, form[key])
  })
  if (selectedFile.value) formData.append('evidence', selectedFile.value)

  submitting.value = true
  try {
    if (isEdit.value) {
      await ViolationService.update(route.params.id, formData)
      Alert.success('Berhasil', 'Data pelanggaran berhasil diperbarui')
    } else {
      await ViolationService.create(formData)
      Alert.success('Berhasil', 'Data pelanggaran berhasil direkam')
    }
    router.push({ name: 'HrViolation' })
  } catch (err) {
    Alert.error('Gagal menyimpan data', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const initForm = async () => {
  try {
    // Fetch regulations
    const regsRes = await RegulationService.getAll({ limit: 100, is_active: 'true' })
    activeRegulations.value = regsRes.data

    if (isEdit.value) {
      const data = await ViolationService.getOne(route.params.id)
      selectedEmployee.value = data.employee
      form.employee_id = data.employee_id
      form.violation_date = dayjs(data.violation_date).format('YYYY-MM-DD')
      form.regulation_id = data.regulation_id
      form.fine_manual = data.fine_manual
      form.penemuan = data.penemuan
      form.notes = data.notes
      if (data.evidence_url) {
        photoPreview.value = `${baseUrl}${data.evidence_url}`
      }
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

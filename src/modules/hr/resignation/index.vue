<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import FilterCard from '@/components/common/FilterCard.vue'
import FilterButton from '@/components/common/FilterButton.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import resignationService from './resignation.service'
import { Search, Plus, RotateCcw, UserMinus, Edit, Trash2, User, AlertTriangle } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const resignations = ref([])
const loading = ref(false)
const pagination = ref({ page: 1, total_pages: 1, total_data: 0 })
const showFilter = ref(true)

const filters = reactive({
  search: '',
  category: '',
  start_date: '',
  end_date: ''
})

// Modal State
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const submitting = ref(false)
const searchEmployee = ref('')
const employeeResults = ref([])
const selectedEmployee = ref(null)

const form = reactive({
  employee_id: '',
  last_working_date: '',
  resignation_category: 'pengunduran_diri',
  reason: '',
  remaining_salary_status: 'belum_dibayar',
  notes: ''
})

const tableColumns = [
  { key: 'no', label: 'No' },
  { key: 'employee', label: 'Karyawan' },
  { key: 'last_working_date', label: 'Tgl Resign' },
  { key: 'category', label: 'Kategori' },
  { key: 'position', label: 'Posisi Terakhir' },
  { key: 'salary_status', label: 'Gaji' },
  { key: 'action', label: 'Action' }
]

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await resignationService.getResignations({ ...filters, page })
    resignations.value = res.data.data
    pagination.value = {
      page: res.data.pagination.currentPage,
      total_pages: res.data.pagination.totalPages,
      total_data: res.data.pagination.totalData
    }
  } catch (err) {
    Alert.error('Gagal memuat data resign')
  } finally {
    loading.value = false
  }
}

const handleSearchEmployee = async () => {
  if (searchEmployee.value.length < 3) {
    employeeResults.value = []
    return
  }
  try {
    const res = await resignationService.searchEmployees(searchEmployee.value)
    employeeResults.value = res.data.data
  } catch (err) {
    console.error(err)
  }
}

const selectEmployee = (emp) => {
  selectedEmployee.value = emp
  form.employee_id = emp.employee_id
  employeeResults.value = []
  searchEmployee.value = emp.full_name
}

const openAddModal = () => {
  isEdit.value = false
  currentId.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  currentId.value = item.id
  selectedEmployee.value = item.employee
  searchEmployee.value = item.employee.full_name
  
  form.employee_id = item.employee_id
  form.last_working_date = dayjs(item.last_working_date).format('YYYY-MM-DD')
  form.resignation_category = item.resignation_category
  form.reason = item.reason
  form.remaining_salary_status = item.remaining_salary_status
  form.notes = item.notes
  
  showModal.value = true
}

const resetForm = () => {
  selectedEmployee.value = null
  searchEmployee.value = ''
  form.employee_id = ''
  form.last_working_date = ''
  form.resignation_category = 'pengunduran_diri'
  form.reason = ''
  form.remaining_salary_status = 'belum_dibayar'
  form.notes = ''
}

const submitForm = async () => {
  if (!form.employee_id || !form.last_working_date) {
    Alert.error('Lengkapi data wajib!')
    return
  }

  const actionText = isEdit.value ? 'Perbarui' : 'Proses'
  const confirmed = await Alert.confirm(
    `${actionText} Data Resign?`,
    isEdit.value ? 'Perubahan data akan disimpan.' : `Resign untuk ${selectedEmployee.value.full_name} akan mematikan akses login user ini secara otomatis.`,
    'Ya, Lanjutkan'
  )

  if (!confirmed) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await resignationService.updateResignation(currentId.value, form)
      Alert.success('Data resign diperbarui')
    } else {
      await resignationService.createResignation(form)
      Alert.success('Karyawan berhasil di-resign')
    }
    showModal.value = false
    fetchData(pagination.value.page)
  } catch (err) {
    Alert.error(err.response?.data?.message || 'Gagal memproses data')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm(
    'Hapus Data Resign?',
    'Status karyawan akan dikembalikan ke Aktif dan akses login akan dibuka kembali.',
    'Ya, Batalkan Resign'
  )

  if (confirmed) {
    try {
      await resignationService.deleteResignation(id)
      Alert.success('Data dihapus dan status karyawan dipulihkan')
      fetchData()
    } catch (err) {
      Alert.error('Gagal menghapus data')
    }
  }
}

const resetFilters = () => {
  filters.search = ''
  filters.category = ''
  filters.start_date = ''
  filters.end_date = ''
  fetchData(1)
}

watch([() => filters.category, () => filters.start_date, () => filters.end_date], () => fetchData(1))

let debounceTimer = null
watch(() => filters.search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchData(1), 500)
})

onMounted(() => fetchData())
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Page Header (Identik dengan Menu Lain) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <UserMinus class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Data Resign Karyawan</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Kelola & Pantau History Pengunduran Diri &bull; Human Resources</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <FilterButton v-model:active="showFilter" />
          <button 
            @click="openAddModal"
            class="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95">
            <Plus class="w-5 h-5" />
            Tambah Resign
          </button>
        </div>
      </div>

      <!-- Filter Section (Identik dengan Menu Lain) -->
      <FilterCard :show="showFilter" cols="3">
        <div class="md:col-span-1">
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Cari Karyawan</label>
          <div class="relative">
            <input v-model="filters.search" type="text" placeholder="Nama atau NIK..." class="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:bg-gray-800 dark:text-white transition" />
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Kategori</label>
          <select v-model="filters.category" class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:bg-gray-800 dark:text-white transition bg-white cursor-pointer">
            <option value="">Semua Kategori</option>
            <option value="pengunduran_diri">Pengunduran Diri</option>
            <option value="cut">Habis Kontrak (CUT)</option>
            <option value="terminasi">Terminasi / PHK</option>
            <option value="kontrak_tidak_diperpanjang">Kontrak Tidak Diperpanjang</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Rentang Tanggal</label>
          <div class="grid grid-cols-2 gap-2">
            <DatePicker v-model="filters.start_date" placeholder="Dari" />
            <DatePicker v-model="filters.end_date" placeholder="Sampai" />
          </div>
        </div>
        <template #footer>
          <button @click="resetFilters" class="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1">
            <RotateCcw class="w-3.5 h-3.5" /> Reset Filter
          </button>
        </template>
      </FilterCard>

      <!-- Data Table -->
      <DataTable 
        :columns="tableColumns" 
        :data="resignations" 
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-no="{ index }">
          <span class="text-xs font-bold text-gray-500">{{ ((Math.max(1, Number(pagination.page || 1)) - 1) * 10) + index + 1 }}</span>
        </template>

        <template #cell-employee="{ item }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
              {{ item.employee?.full_name?.charAt(0) || '?' }}
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-700 dark:text-white">{{ item.employee?.full_name || 'N/A' }}</span>
              <span class="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{{ item.employee?.employee_number || '-' }}</span>
            </div>
          </div>
        </template>

        <template #cell-last_working_date="{ item }">
          <span class="text-sm font-bold text-gray-600 dark:text-gray-300">{{ dayjs(item.last_working_date).format('DD MMM YYYY') }}</span>
        </template>

        <template #cell-category="{ item }">
          <span :class="{
            'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border': true,
            'bg-orange-50 text-orange-600 border-orange-100': item.resignation_category === 'pengunduran_diri',
            'bg-rose-50 text-rose-600 border-rose-100': item.resignation_category === 'terminasi',
            'bg-sky-50 text-sky-600 border-sky-100': item.resignation_category === 'cut',
            'bg-slate-50 text-slate-600 border-slate-100': item.resignation_category === 'kontrak_tidak_diperpanjang'
          }">
            {{ item.resignation_category.split('_').join(' ') }}
          </span>
        </template>

        <template #cell-position="{ item }">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ item.employee?.position?.name || '-' }}</span>
            <span class="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">{{ item.employee?.location?.location_name || '-' }}</span>
          </div>
        </template>

        <template #cell-salary_status="{ item }">
          <div class="flex items-center gap-2">
            <div :class="item.remaining_salary_status === 'lunas' ? 'bg-success-500' : 'bg-warning-500'" class="w-2 h-2 rounded-full"></div>
            <span class="text-[11px] font-black uppercase tracking-widest" :class="item.remaining_salary_status === 'lunas' ? 'text-success-600' : 'text-warning-600'">
              {{ item.remaining_salary_status }}
            </span>
          </div>
        </template>

        <template #cell-action="{ item }">
          <div class="flex items-center gap-2">
            <button @click="openEditModal(item)" class="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition" title="Edit">
              <Edit :size="16" />
            </button>
            <button @click="handleDelete(item.id)" class="p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-xl transition" title="Hapus">
              <Trash2 :size="16" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Modal (Standard Premium Style) -->
      <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
          <div class="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
            <div>
              <h3 class="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">{{ isEdit ? 'Update Data Resign' : 'Proses Resign Baru' }}</h3>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Lengkapi dokumen & status akhir karyawan</p>
            </div>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          <div class="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <!-- Search Employee -->
            <div v-if="!isEdit" class="space-y-3">
              <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Pilih Karyawan Aktif</label>
              <div class="relative">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
                <input v-model="searchEmployee" @input="handleSearchEmployee" type="text" placeholder="Cari nama atau NIK..." class="input-base pl-12 h-12" />
                
                <div v-if="employeeResults.length > 0" class="absolute z-10 left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2">
                  <div v-for="emp in employeeResults" :key="emp.id" @click="selectEmployee(emp)" class="p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer rounded-xl flex items-center gap-3 transition-all">
                    <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center font-bold">{{ emp.full_name.charAt(0) }}</div>
                    <div>
                      <div class="text-sm font-bold text-gray-800 dark:text-white">{{ emp.full_name }}</div>
                      <div class="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{{ emp.employee_number }} &bull; {{ emp.position?.name }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Employee Info Card -->
            <div v-if="selectedEmployee" class="bg-brand-50 dark:bg-brand-900/10 p-5 rounded-2xl border border-brand-100 dark:border-brand-800/50 flex items-start gap-4">
              <div class="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><User class="text-brand-500" :size="24" /></div>
              <div>
                <div class="font-black text-brand-900 dark:text-brand-400 uppercase tracking-tight text-base">{{ selectedEmployee.full_name }}</div>
                <p class="text-[11px] text-brand-700/70 dark:text-brand-500/70 font-bold uppercase tracking-widest mt-1">Akun portal akan dinonaktifkan permanen.</p>
              </div>
            </div>

            <!-- Form Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-3">
                <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Tanggal Terakhir Kerja</label>
                <DatePicker v-model="form.last_working_date" placeholder="Pilih Tanggal" />
              </div>
              <div class="space-y-3">
                <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Kategori Resign</label>
                <select v-model="form.resignation_category" class="input-base h-12">
                  <option value="pengunduran_diri">Pengunduran Diri</option>
                  <option value="cut">Habis Kontrak (CUT)</option>
                  <option value="terminasi">Terminasi / PHK</option>
                  <option value="kontrak_tidak_diperpanjang">Kontrak Tidak Diperpanjang</option>
                </select>
              </div>
              <div class="space-y-3">
                <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Status Gaji Terakhir</label>
                <select v-model="form.remaining_salary_status" class="input-base h-12">
                  <option value="belum_dibayar">Belum Dibayar</option>
                  <option value="lunas">Lunas</option>
                </select>
              </div>
              <div class="space-y-3">
                 <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Alasan Detail</label>
                 <input v-model="form.reason" type="text" placeholder="Misal: Menikah, Pindah Kota" class="input-base h-12" />
              </div>
            </div>

            <div class="space-y-3">
              <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Catatan Internal (Notes)</label>
              <textarea v-model="form.notes" rows="2" class="input-base !h-auto resize-none p-4" placeholder="Tuliskan catatan tambahan di sini..."></textarea>
            </div>

            <div v-if="!isEdit" class="flex items-center gap-4 p-5 bg-warning-50 dark:bg-warning-900/10 border border-warning-100 dark:border-warning-800/50 rounded-2xl">
               <AlertTriangle class="text-warning-600 flex-shrink-0" :size="24" />
               <p class="text-[11px] text-warning-900/80 dark:text-warning-400/80 font-bold leading-relaxed uppercase tracking-tight">
                 Peringatan: Akun portal {{ selectedEmployee?.full_name || 'karyawan' }} akan langsung menjadi <span class="text-error-600 underline">NON-AKTIF</span> setelah diproses.
               </p>
            </div>
          </div>

          <div class="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
            <button @click="showModal = false" class="px-6 py-2.5 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-gray-800 transition">Batal</button>
            <button 
              @click="submitForm"
              :disabled="submitting || !selectedEmployee"
              class="px-10 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Memproses...' : (isEdit ? 'Simpan Perubahan' : 'Finalisasi Resign') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e4e7ec; /* Same as gray-200 */
  border-radius: 9999px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #334155; /* Same as gray-700 */
}
</style>

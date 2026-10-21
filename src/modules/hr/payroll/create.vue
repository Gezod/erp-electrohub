<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none">Payroll Run Baru</h2>
      </div>

      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-6">
          <div>
            <label class="section-label">Nama Periode</label>
            <input v-model="form.period_name" type="text" class="input-base" placeholder="mis. Gaji Juli 2026" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="section-label">Periode Mulai *</label>
              <DatePicker v-model="form.period_start" class="p-4 input-base" required />
            </div>
            <div>
              <label class="section-label">Periode Selesai *</label>
              <DatePicker v-model="form.period_end" class="p-4 input-base" required />
            </div>
          </div>
          <div class="p-4 rounded-xl bg-blue-50 text-blue-700 text-xs">
            Menyimpan akan otomatis generate item payroll dari data absensi periode ini, hanya untuk karyawan yang dicentang di bawah. Item tetap bisa diedit selama status draft.
          </div>

          <div class="flex justify-end gap-4 pt-2">
            <button @click="router.back()" class="btn-outline px-8 h-11">Batal</button>
            <button @click="handleSubmit" :disabled="submitting" class="btn-primary px-8 h-11">
              {{ submitting ? 'Membuat...' : 'Buat & Generate' }}
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-bold text-gray-800 dark:text-white leading-none">Pilih Karyawan</h3>
              <p class="text-xs font-semibold text-gray-400 mt-1">
                {{ selectedIds.length }} dari {{ allActiveIds.length }} karyawan aktif dipilih
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" @click="selectAll" class="btn-outline h-9 px-4 text-xs">Centang Semua</button>
              <button type="button" @click="clearAll" class="btn-outline h-9 px-4 text-xs">Hapus Semua</button>
            </div>
          </div>

          <input
            v-model="empSearch"
            type="text"
            placeholder="Cari nama karyawan..."
            class="input-base"
          />

          <DataTable
            title=""
            subtitle=""
            :columns="empColumns"
            :data="employees"
            :loading="empLoading"
            :server-side="true"
            :total-items="empTotalData"
            :current-page="empPage"
            :items-per-page="10"
            @update:current-page="fetchEmployees"
          >
            <template #cell-select="{ item }">
              <label class="group inline-flex items-center justify-center p-2.5 -m-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  class="sr-only"
                  :checked="isSelected(item.id)"
                  :aria-label="`Pilih ${item.full_name}`"
                  @change="toggle(item.id)"
                />
                <span
                  class="w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-colors group-hover:border-brand-500 dark:group-hover:border-white"
                  :class="isSelected(item.id)
                    ? 'bg-brand-500 border-brand-500 dark:bg-white dark:border-white'
                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'"
                >
                  <svg v-show="isSelected(item.id)" viewBox="0 0 16 16" class="w-3 h-3 text-white dark:text-gray-900">
                    <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </label>
            </template>
            <template #cell-full_name="{ item }">
              <span class="font-bold text-gray-800 dark:text-white text-[13px]">{{ item.full_name }}</span>
            </template>
            <template #cell-division="{ item }">
              <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.division?.name || '-' }}</span>
            </template>
            <template #cell-position="{ item }">
              <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.position || '-' }}</span>
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import { PayrollRunService } from './payrollRun.service'
import { TrainingEmployeeService } from './../training-employee/trainingEmployee.service'
import { ArrowLeft } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'
import DatePicker from '@/components/ui/DatePicker.vue'

const router = useRouter()
const submitting = ref(false)

const form = reactive({
  period_name: '',
  period_start: dayjs().startOf('month').format('YYYY-MM-DD'),
  period_end: dayjs().endOf('month').format('YYYY-MM-DD'),
})

const empColumns = [
  { key: 'select', label: '', width: '48px' },
  { key: 'full_name', label: 'Nama' },
  { key: 'position', label: 'Posisi' },
  { key: 'division', label: 'Divisi' },
]

const employees = ref([])
const empLoading = ref(false)
const empPage = ref(1)
const empTotalData = ref(0)
const empSearch = ref('')

// Semua id karyawan aktif (semua halaman) — dipakai sebagai default terpilih & tombol "Centang Semua".
const allActiveIds = ref([])
const selectedIds = ref([])

const fetchAllActiveIds = async () => {
  try {
    const res = await TrainingEmployeeService.getAll({ is_active: true, limit: 1000 })
    allActiveIds.value = res.data.map((e) => e.id)
    selectedIds.value = [...allActiveIds.value]
  } catch (err) {
    Alert.error('Gagal mengambil data karyawan', err.response?.data?.message)
  }
}

const fetchEmployees = async (page = 1) => {
  empLoading.value = true
  try {
    const res = await TrainingEmployeeService.getAll({
      is_active: true,
      page,
      limit: 10,
      search: empSearch.value || undefined,
    })
    employees.value = res.data
    empPage.value = res.pagination?.currentPage || page
    empTotalData.value = res.pagination?.totalData || res.data.length
  } catch (err) {
    Alert.error('Gagal mengambil data karyawan', err.response?.data?.message)
  } finally {
    empLoading.value = false
  }
}

const isSelected = (id) => selectedIds.value.includes(id)
const toggle = (id) => {
  const i = selectedIds.value.indexOf(id)
  if (i === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(i, 1)
}
const selectAll = () => {
  selectedIds.value = [...allActiveIds.value]
}
const clearAll = () => {
  selectedIds.value = []
}

let debounceTimer = null
watch(empSearch, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchEmployees(1), 400)
})

onMounted(() => {
  fetchAllActiveIds()
  fetchEmployees(1)
  form.period_name = `Gaji ${dayjs().format('MMMM YYYY')}`
})

const handleSubmit = async () => {
  if (!form.period_start || !form.period_end) {
    Alert.error('Mohon lengkapi periode!')
    return
  }
  if (!selectedIds.value.length) {
    Alert.error('Pilih minimal satu karyawan!')
    return
  }
  submitting.value = true
  try {
    const run = await PayrollRunService.create({ ...form, training_employee_ids: selectedIds.value })
    Alert.success('Payroll run dibuat & item digenerate. Review lalu finalisasi.')
    router.push({ name: 'HrPayrollShow', params: { id: run.id } })
  } catch (err) {
    Alert.error('Gagal membuat payroll run', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}
</script>

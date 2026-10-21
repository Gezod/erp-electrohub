<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Karyawan Training</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Absensi & Payroll &bull; Human Resources</p>
          </div>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <FilterButton v-model:active="showFilter" />
          <button @click="handleDownloadTemplate" class="btn-outline">
            <Download class="w-4 h-4" /> Template
          </button>
          <button @click="triggerImport" class="btn-outline">
            <Upload class="w-4 h-4" /> Import Excel
          </button>
          <input ref="importInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleImport" />
          <router-link :to="{ name: 'HrTrainingEmployeeCreate' }" class="btn-primary">
            <Plus class="w-4 h-4" /> Tambah Karyawan
          </router-link>
        </div>
      </div>

      <FilterCard :show="showFilter" cols="2">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Cari Nama</label>
          <input v-model="filters.search" type="text" placeholder="Cari karyawan..." class="input-base" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
          <select v-model="filters.is_active" class="input-base">
            <option value="">Semua</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
        <template #footer>
          <button @click="resetFilters" class="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1">
            <RotateCcw class="w-3.5 h-3.5" /> Reset Filter
          </button>
        </template>
      </FilterCard>

      <DataTable
        :columns="tableColumns"
        :data="employees"
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-full_name="{ item }">
          <router-link :to="{ name: 'HrTrainingEmployeeDetail', params: { id: item.id } }" class="font-bold text-gray-800 dark:text-white hover:text-brand-500">
            {{ item.full_name }}
          </router-link>
        </template>
        <template #cell-division="{ item }">
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.division?.name || '-' }}</span>
        </template>
        <template #cell-join_date="{ item }">
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ dayjs(item.join_date).format('DD MMM YYYY') }}</span>
        </template>
        <template #cell-status="{ item }">
          <span :class="item.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'" class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase">
            {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
          </span>
        </template>
        <template #cell-action="{ item }">
          <div class="flex items-center gap-2">
            <router-link :to="{ name: 'HrTrainingEmployeeDetail', params: { id: item.id } }" class="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition" title="Detail">
              <Eye :size="16" />
            </router-link>
            <router-link :to="{ name: 'HrTrainingEmployeeEdit', params: { id: item.id } }" class="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition" title="Edit">
              <Edit :size="16" />
            </router-link>
            <button @click="handleDelete(item.id)" class="p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-xl transition" title="Hapus">
              <Trash2 :size="16" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, reactive } from 'vue'
import { registerFilterReset } from '@/utils/filterRegistry'

// pagination + filters di module scope agar posisi halaman & filter bertahan saat
// kembali dari form/detail; didaftarkan ke registerFilterReset() untuk direset saat logout.
const makeDefaultPagination = () => ({ page: 1, total_pages: 1, total_data: 0 })
const makeDefaultFilters = () => ({ search: '', is_active: '' })
const pagination = ref(makeDefaultPagination())
const filters = reactive(makeDefaultFilters())

registerFilterReset(() => {
  Object.assign(filters, makeDefaultFilters())
  pagination.value = makeDefaultPagination()
})
</script>

<script setup>
import { onMounted, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import FilterCard from '@/components/common/FilterCard.vue'
import FilterButton from '@/components/common/FilterButton.vue'
import { TrainingEmployeeService } from './trainingEmployee.service'
import { Users, Plus, Download, Upload, RotateCcw, Eye, Edit, Trash2 } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const employees = ref([])
const loading = ref(false)
const showFilter = ref(false)
const importInput = ref(null)

const tableColumns = [
  { key: 'full_name', label: 'Nama' },
  { key: 'position', label: 'Posisi' },
  { key: 'division', label: 'Divisi' },
  { key: 'join_date', label: 'Tgl Masuk' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Aksi' },
]

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await TrainingEmployeeService.getAll({ ...filters, page })
    employees.value = res.data
    pagination.value = {
      page: res.pagination.currentPage,
      total_pages: res.pagination.totalPages,
      total_data: res.pagination.totalData,
    }
  } catch (err) {
    Alert.error('Gagal memuat data karyawan training')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Karyawan?', 'Data absen & payroll terkait ikut terhapus.', 'Ya, Hapus')
  if (!confirmed) return
  try {
    await TrainingEmployeeService.remove(id)
    Alert.success('Data berhasil dihapus')
    fetchData()
  } catch (err) {
    Alert.error('Gagal menghapus data', err.response?.data?.message)
  }
}

const handleDownloadTemplate = async () => {
  try {
    const blob = await TrainingEmployeeService.downloadTemplate()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-import-karyawan.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    Alert.error('Gagal mengunduh template')
  }
}

const triggerImport = () => importInput.value?.click()

const handleImport = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    const result = await TrainingEmployeeService.importExcel(file)
    if (result.errorCount > 0) {
      Alert.warning(result.message, result.errors.join(' | '))
    } else {
      Alert.success(result.message)
    }
    fetchData()
  } catch (err) {
    Alert.error('Gagal import Excel', err.response?.data?.message)
  } finally {
    e.target.value = ''
  }
}

const resetFilters = () => {
  Object.assign(filters, makeDefaultFilters())
  fetchData(1)
}

let debounceTimer = null
watch(() => filters.search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchData(1), 500)
})
watch(() => filters.is_active, () => fetchData(1))

// Pertahankan halaman terakhir saat kembali dari form/detail.
onMounted(() => fetchData(pagination.value.page))
</script>

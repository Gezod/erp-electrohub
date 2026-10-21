<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
            <Receipt class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Denda Karyawan</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Catatan Pelanggaran &bull; Human Resources</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <FilterButton v-model:active="showFilter" />
          <router-link :to="{ name: 'HrEmployeeFineCreate' }" class="btn-primary">
            <Plus class="w-4 h-4" /> Input Denda
          </router-link>
        </div>
      </div>

      <FilterCard :show="showFilter" cols="1">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Cari Karyawan</label>
          <input v-model="filters.search" type="text" placeholder="Nama karyawan..." class="input-base" />
        </div>
        <template #footer>
          <button @click="resetFilters" class="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1">
            <RotateCcw class="w-3.5 h-3.5" /> Reset Filter
          </button>
        </template>
      </FilterCard>

      <DataTable
        :columns="tableColumns"
        :data="fines"
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-tanggal="{ item }">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ dayjs(item.fine_date).format('DD MMM YYYY') }}</span>
        </template>
        <template #cell-karyawan="{ item }">
          <span class="font-bold text-gray-800 dark:text-white">{{ item.training_employee?.full_name }}</span>
        </template>
        <template #cell-denda="{ item }">
          <div class="flex flex-col">
            <span class="text-sm text-gray-700 dark:text-gray-200">{{ item.name_snapshot }}</span>
            <span class="text-[10px] text-gray-400 font-bold uppercase">Qty {{ item.qty }}</span>
          </div>
        </template>
        <template #cell-subtotal="{ item }">
          <span class="font-bold text-rose-600">{{ formatCurrency(item.subtotal) }}</span>
        </template>
        <template #cell-action="{ item }">
          <div class="flex items-center gap-2">
            <router-link :to="{ name: 'HrEmployeeFineEdit', params: { id: item.id } }" class="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition" title="Edit">
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
// kembali dari form; didaftarkan ke registerFilterReset() untuk direset saat logout.
const makeDefaultPagination = () => ({ page: 1, total_pages: 1, total_data: 0 })
const makeDefaultFilters = () => ({ search: '' })
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
import { EmployeeFineService } from './employeeFine.service'
import { Receipt, Plus, RotateCcw, Edit, Trash2 } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const fines = ref([])
const loading = ref(false)
const showFilter = ref(false)

const tableColumns = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'karyawan', label: 'Karyawan' },
  { key: 'denda', label: 'Denda' },
  { key: 'subtotal', label: 'Subtotal' },
  { key: 'action', label: 'Aksi' },
]

const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0)

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await EmployeeFineService.getAll({ ...filters, page })
    fines.value = res.data
    pagination.value = {
      page: res.pagination.currentPage,
      total_pages: res.pagination.totalPages,
      total_data: res.pagination.totalData,
    }
  } catch (err) {
    Alert.error('Gagal memuat data denda karyawan')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Data Denda?', 'Data yang dihapus tidak dapat dipulihkan.', 'Ya, Hapus')
  if (!confirmed) return
  try {
    await EmployeeFineService.remove(id)
    Alert.success('Data berhasil dihapus')
    fetchData()
  } catch (err) {
    Alert.error('Gagal menghapus data')
  }
}

const resetFilters = () => {
  filters.search = ''
  fetchData(1)
}

let debounceTimer = null
watch(() => filters.search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchData(1), 500)
})

// Pertahankan halaman terakhir saat kembali dari form.
onMounted(() => fetchData(pagination.value.page))
</script>

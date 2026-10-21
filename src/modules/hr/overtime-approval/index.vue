<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
            <Clock class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Persetujuan Lembur</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Karyawan Training &bull; Human Resources</p>
          </div>
        </div>
        <FilterButton v-model:active="showFilter" />
      </div>

      <FilterCard :show="showFilter" cols="2">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
          <select v-model="filters.status" class="input-base">
            <option value="">Semua Status</option>
            <option value="diajukan">Diajukan</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Cari Karyawan</label>
          <input v-model="filters.search" type="text" placeholder="Nama karyawan..." class="input-base" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Dari Tanggal</label>
          <input v-model="filters.period_start" type="date" class="input-base" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Sampai Tanggal</label>
          <input v-model="filters.period_end" type="date" class="input-base" />
        </div>
        <template #footer>
          <button @click="resetFilters" class="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1">
            <RotateCcw class="w-3.5 h-3.5" /> Reset Filter
          </button>
        </template>
      </FilterCard>

      <DataTable
        :columns="tableColumns"
        :data="rows"
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-tanggal="{ item }">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ dayjs(item.attendance_date).format('DD MMM YYYY') }}</span>
        </template>
        <template #cell-tipe="{ item }">
          <span
            :class="item.attendance_type === 'datang' ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'"
            class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
          >
            {{ item.attendance_type === 'datang' ? 'Sebelum Shift' : 'Setelah Shift' }}
          </span>
        </template>
        <template #cell-karyawan="{ item }">
          <div class="flex flex-col">
            <span class="font-bold text-gray-800 dark:text-white">{{ item.training_employee?.full_name || '-' }}</span>
            <span class="text-[10px] text-gray-400 font-bold uppercase">{{ item.training_employee?.division?.name || '-' }}</span>
          </div>
        </template>
        <template #cell-jam="{ item }">
          <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ Number(item.overtime_hours) }} jam</span>
          <span v-if="item.is_holiday" class="ml-1 text-[10px] font-bold text-amber-600 uppercase">Libur</span>
        </template>
        <template #cell-alasan="{ item }">
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.overtime_reason || '-' }}</span>
          <p v-if="item.overtime_status === 'ditolak' && item.overtime_rejection_reason" class="text-[11px] text-rose-500 mt-0.5">
            Ditolak: {{ item.overtime_rejection_reason }}
          </p>
        </template>
        <template #cell-status="{ item }">
          <span :class="statusPill(item.overtime_status)" class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide">
            {{ item.overtime_status || '-' }}
          </span>
          <p v-if="item.overtime_approved_by" class="text-[10px] text-gray-400 mt-0.5">oleh {{ item.overtime_approved_by.full_name }}</p>
        </template>
        <template #cell-action="{ item }">
          <div v-can="'overtime-approvals:approve'" class="flex items-center gap-2">
            <button
              v-if="item.overtime_status !== 'disetujui'"
              @click="handleApprove(item)"
              class="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition"
              title="Setujui"
            >
              <Check :size="16" />
            </button>
            <button
              v-if="item.overtime_status !== 'ditolak'"
              @click="openReject(item)"
              class="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition"
              title="Tolak"
            >
              <X :size="16" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Modal tolak -->
    <div v-if="rejectTarget" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click.self="rejectTarget = null">
      <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6">
        <h3 class="text-lg font-black text-gray-800 dark:text-white mb-1">Tolak Lembur</h3>
        <p class="text-xs text-gray-400 mb-4">
          {{ rejectTarget.training_employee?.full_name }} &bull; {{ dayjs(rejectTarget.attendance_date).format('DD MMM YYYY') }} &bull; {{ Number(rejectTarget.overtime_hours) }} jam
        </p>
        <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Alasan Penolakan (opsional)</label>
        <textarea v-model="rejectReason" rows="3" class="input-base !h-auto resize-none p-3 text-sm" placeholder="Contoh: tidak ada instruksi lembur dari atasan"></textarea>
        <div class="flex gap-3 mt-5">
          <button @click="rejectTarget = null" class="btn-outline flex-1 h-10">Batal</button>
          <button @click="handleReject" :disabled="submitting" class="btn-primary flex-1 h-10 !bg-rose-600 hover:!bg-rose-700">
            {{ submitting ? 'Memproses...' : 'Tolak Lembur' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, reactive } from 'vue'
import { registerFilterReset } from '@/utils/filterRegistry'

const makeDefaultPagination = () => ({ page: 1, total_pages: 1, total_data: 0 })
const makeDefaultFilters = () => ({ status: '', search: '', period_start: '', period_end: '' })
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
import { OvertimeApprovalService } from './overtimeApproval.service'
import { Clock, Check, X, RotateCcw } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const rows = ref([])
const loading = ref(false)
const showFilter = ref(false)
const submitting = ref(false)
const rejectTarget = ref(null)
const rejectReason = ref('')

const tableColumns = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'tipe', label: 'Tipe' },
  { key: 'karyawan', label: 'Karyawan' },
  { key: 'jam', label: 'Jam Lembur' },
  { key: 'alasan', label: 'Alasan' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Aksi' },
]

const statusPill = (s) => ({
  diajukan: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  disetujui: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ditolak: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}[s] || 'bg-gray-100 text-gray-500')

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await OvertimeApprovalService.getAll({ ...filters, page })
    rows.value = res.data
    pagination.value = {
      page: res.pagination?.currentPage || 1,
      total_pages: res.pagination?.totalPages || 1,
      total_data: res.pagination?.totalData || 0,
    }
  } catch (err) {
    Alert.error('Gagal memuat data lembur')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (item) => {
  const confirmed = await Alert.confirm(
    'Setujui Lembur?',
    `${item.training_employee?.full_name} — ${Number(item.overtime_hours)} jam pada ${dayjs(item.attendance_date).format('DD MMM YYYY')}. Lembur yang disetujui ikut dihitung di payroll.`,
    'Ya, Setujui'
  )
  if (!confirmed) return
  try {
    await OvertimeApprovalService.approve(item.id)
    Alert.success('Lembur disetujui')
    fetchData(pagination.value.page)
  } catch (err) {
    Alert.error('Gagal menyetujui lembur', err.response?.data?.message)
  }
}

const openReject = (item) => {
  rejectTarget.value = item
  rejectReason.value = ''
}

const handleReject = async () => {
  if (!rejectTarget.value) return
  submitting.value = true
  try {
    await OvertimeApprovalService.reject(rejectTarget.value.id, rejectReason.value.trim() || null)
    Alert.success('Lembur ditolak')
    rejectTarget.value = null
    fetchData(pagination.value.page)
  } catch (err) {
    Alert.error('Gagal menolak lembur', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

const resetFilters = () => {
  filters.status = 'diajukan'
  filters.search = ''
  filters.period_start = ''
  filters.period_end = ''
  fetchData(1)
}

let debounceTimer = null
watch(
  () => [filters.status, filters.search, filters.period_start, filters.period_end],
  () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => fetchData(1), 400)
  }
)

onMounted(() => fetchData(pagination.value.page))
</script>

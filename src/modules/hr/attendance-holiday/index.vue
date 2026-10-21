<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <CalendarDays class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Kalender Hari Libur</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Absensi &bull; Human Resources</p>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-800/50">
            <button
              @click="viewMode = 'calendar'"
              :class="viewMode === 'calendar' ? 'bg-white dark:bg-gray-900 shadow-sm text-amber-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
              class="px-3 h-8 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <CalendarDays class="w-3.5 h-3.5" /> Kalender
            </button>
            <button
              @click="viewMode = 'table'"
              :class="viewMode === 'table' ? 'bg-white dark:bg-gray-900 shadow-sm text-amber-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
              class="px-3 h-8 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <List class="w-3.5 h-3.5" /> Tabel
            </button>
          </div>
          <select v-model.number="filterYear" @change="fetchData(1)" class="input-base !w-auto">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
          <button @click="handleSync" :disabled="syncing" class="btn-outline">
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': syncing }" /> {{ syncing ? 'Sinkronisasi...' : 'Sync Ulang' }}
          </button>
          <router-link :to="{ name: 'HrAttendanceHolidayCreate' }" class="btn-primary">
            <Plus class="w-4 h-4" /> Tambah Manual
          </router-link>
        </div>
      </div>

      <p class="text-xs text-gray-400 mb-4">
        Hari Minggu otomatis dianggap libur meski tidak ada baris di sini. Nonaktifkan status untuk menjadikan satu tanggal tertentu (termasuk hari Minggu) sebagai hari kerja normal, atau aktifkan untuk menjadikan hari kerja biasa sebagai libur.
      </p>

      <div v-if="viewMode === 'calendar'" class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-4 md:p-6" :class="{ 'opacity-50 pointer-events-none': loading }">
        <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <button @click="changeMonth(-1)" class="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition" title="Bulan sebelumnya">
              <ChevronLeft class="w-4 h-4" />
            </button>
            <h3 class="text-lg font-extrabold text-gray-800 dark:text-white w-36 text-center">{{ monthLabel }}</h3>
            <button @click="changeMonth(1)" class="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition" title="Bulan berikutnya">
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3 text-[11px] font-semibold text-gray-400">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Libur</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Override Hari Kerja</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full ring-2 ring-amber-400"></span> Hari Ini</span>
            </div>
            <button @click="goToday" class="btn-outline !h-9 !px-4 text-xs">Hari Ini</button>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1.5 mb-1.5">
          <div v-for="d in weekDays" :key="d" class="text-center text-[11px] font-bold uppercase text-gray-400 py-1.5">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1.5">
          <div
            v-for="cell in calendarCells"
            :key="cell.key"
            @click="handleDayClick(cell)"
            class="min-h-[84px] md:min-h-[96px] rounded-xl p-2 border cursor-pointer transition flex flex-col gap-1"
            :class="[
              cell.inMonth ? '' : 'opacity-40',
              cell.holidayName ? 'border-rose-200 bg-rose-50/70 dark:bg-rose-900/10 dark:border-rose-900/40' : cell.overrideWorkday ? 'border-indigo-200 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-900/40' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-amber-300 hover:bg-amber-50/40 dark:hover:bg-amber-900/10',
              cell.isToday ? 'ring-2 ring-amber-400' : '',
            ]"
          >
            <span
              class="text-xs font-bold w-fit"
              :class="cell.isSunday || cell.holidayName ? 'text-rose-500' : 'text-gray-600 dark:text-gray-300'"
            >{{ cell.date.date() }}</span>
            <span v-if="cell.holidayName" class="text-[10px] font-semibold leading-tight text-rose-600 dark:text-rose-400 line-clamp-3" :title="cell.holidayName">{{ cell.holidayName }}</span>
            <span v-else-if="cell.overrideWorkday" class="text-[10px] font-semibold leading-tight text-indigo-500" title="Ditandai sebagai hari kerja normal">Hari Kerja</span>
          </div>
        </div>
      </div>

      <DataTable
        v-else
        :columns="tableColumns"
        :data="holidays"
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-date="{ item }">
          <span class="font-bold text-gray-700 dark:text-gray-200">{{ dayjs(item.date).format('dddd, DD MMM YYYY') }}</span>
        </template>
        <template #cell-source="{ item }">
          <span :class="item.source === 'api' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'" class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase">
            {{ item.source === 'api' ? 'Kalender Nasional' : 'Manual' }}
          </span>
        </template>
        <template #cell-status="{ item }">
          <button
            @click="handleToggle(item)"
            :class="item.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'"
            class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase hover:opacity-70 transition"
            title="Klik untuk switch aktif/nonaktif"
          >
            {{ item.is_active ? 'Aktif (Libur)' : 'Nonaktif' }}
          </button>
        </template>
        <template #cell-action="{ item }">
          <div class="flex items-center gap-2">
            <router-link :to="{ name: 'HrAttendanceHolidayEdit', params: { id: item.id } }" class="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition" title="Edit">
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
import { ref } from 'vue'
import { registerFilterReset } from '@/utils/filterRegistry'

const makeDefaultPagination = () => ({ page: 1, total_pages: 1, total_data: 0 })
const pagination = ref(makeDefaultPagination())

registerFilterReset(() => {
  pagination.value = makeDefaultPagination()
})
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import { AttendanceHolidayService } from './attendanceHoliday.service'
import { CalendarDays, Plus, Edit, Trash2, RefreshCw, List, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const router = useRouter()
const holidays = ref([])
const loading = ref(false)
const syncing = ref(false)
const currentYear = new Date().getFullYear()
const filterYear = ref(currentYear)
const yearOptions = computed(() => {
  const base = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]
  if (!base.includes(filterYear.value)) base.push(filterYear.value)
  return base.sort((a, b) => a - b)
})

const viewMode = ref('calendar')
const currentMonth = ref(new Date().getMonth())
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthLabel = computed(() => dayjs(new Date(filterYear.value, currentMonth.value, 1)).format('MMMM YYYY'))

const holidayMap = computed(() => {
  const map = {}
  for (const h of holidays.value) {
    map[dayjs(h.date).format('YYYY-MM-DD')] = h
  }
  return map
})

const calendarCells = computed(() => {
  const firstOfMonth = dayjs(new Date(filterYear.value, currentMonth.value, 1))
  const startOffset = firstOfMonth.day()
  const gridStart = firstOfMonth.subtract(startOffset, 'day')
  const totalCells = Math.ceil((startOffset + firstOfMonth.daysInMonth()) / 7) * 7
  const todayKey = dayjs().format('YYYY-MM-DD')

  return Array.from({ length: totalCells }, (_, i) => {
    const date = gridStart.add(i, 'day')
    const key = date.format('YYYY-MM-DD')
    const holiday = holidayMap.value[key]
    return {
      key,
      date,
      dateStr: key,
      inMonth: date.month() === currentMonth.value,
      isToday: key === todayKey,
      isSunday: date.day() === 0,
      holiday,
      holidayName: holiday && holiday.is_active ? holiday.name : null,
      overrideWorkday: !!(holiday && !holiday.is_active),
    }
  })
})

const changeMonth = (delta) => {
  let m = currentMonth.value + delta
  let y = filterYear.value
  if (m < 0) { m = 11; y -= 1 }
  else if (m > 11) { m = 0; y += 1 }
  currentMonth.value = m
  if (y !== filterYear.value) {
    filterYear.value = y
    fetchData(1)
  }
}

const goToday = () => {
  const now = new Date()
  const yearChanged = now.getFullYear() !== filterYear.value
  filterYear.value = now.getFullYear()
  currentMonth.value = now.getMonth()
  if (yearChanged) fetchData(1)
}

const handleDayClick = (cell) => {
  if (cell.holiday) {
    router.push({ name: 'HrAttendanceHolidayEdit', params: { id: cell.holiday.id } })
  } else {
    router.push({ name: 'HrAttendanceHolidayCreate', query: { date: cell.dateStr } })
  }
}

const tableColumns = [
  { key: 'date', label: 'Tanggal' },
  { key: 'name', label: 'Nama Libur' },
  { key: 'source', label: 'Sumber' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Aksi' },
]

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await AttendanceHolidayService.getAll({ page, limit: 100, year: filterYear.value })
    holidays.value = res.data
    pagination.value = {
      page: res.pagination.currentPage,
      total_pages: res.pagination.totalPages,
      total_data: res.pagination.totalData,
    }
  } catch (err) {
    Alert.error('Gagal memuat data hari libur')
  } finally {
    loading.value = false
  }
}

const handleToggle = async (item) => {
  try {
    await AttendanceHolidayService.update(item.id, { is_active: !item.is_active })
    item.is_active = !item.is_active
  } catch (err) {
    Alert.error('Gagal mengubah status', err.response?.data?.message)
  }
}

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Hari Libur?', 'Tanggal ini akan kembali mengikuti aturan default (hari kerja biasa, kecuali Minggu).', 'Ya, Hapus')
  if (!confirmed) return
  try {
    await AttendanceHolidayService.remove(id)
    Alert.success('Hari libur berhasil dihapus')
    fetchData(pagination.value.page)
  } catch (err) {
    Alert.error('Gagal menghapus data')
  }
}

const handleSync = async () => {
  syncing.value = true
  try {
    const res = await AttendanceHolidayService.sync(filterYear.value)
    Alert.success(res.message || 'Sinkronisasi selesai')
    fetchData(1)
  } catch (err) {
    Alert.error('Gagal sinkronisasi dari kalender eksternal', err.response?.data?.message)
  } finally {
    syncing.value = false
  }
}

onMounted(() => fetchData(pagination.value.page))
</script>

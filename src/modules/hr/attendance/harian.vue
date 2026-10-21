<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
          <CalendarCheck class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Absen Harian</h2>
          <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Log Absensi Mentah &bull; Human Resources</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Dari</label>
          <input v-model="filters.start" type="date" class="input-base" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Sampai</label>
          <input v-model="filters.end" type="date" class="input-base" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
          <select v-model="statusFilter" class="input-base">
            <option value="">Semua Status</option>
            <option v-for="(label, value) in STATUS_LABEL" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <button @click="fetchData" class="btn-primary h-11">Terapkan</button>
      </div>

      <DataTable :columns="tableColumns" :data="filteredRows" :loading="loading" :items-per-page="15">
        <template #cell-attendance_date="{ item }">
          <span class="font-semibold text-gray-700 dark:text-gray-200">{{ dayjs(item.attendance_date).format('DD MMM YYYY') }}</span>
        </template>
        <template #cell-karyawan="{ item }">
          <span class="font-bold text-gray-800 dark:text-white">{{ item.karyawan }}</span>
        </template>
        <template #cell-status_kehadiran="{ item }">
          <span :class="statusPill[item.status_kehadiran] || 'border border-gray-300 text-gray-600'" class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase">
            {{ STATUS_LABEL[item.status_kehadiran] || item.status_kehadiran }}
          </span>
        </template>
        <template #cell-lokasi="{ item }">
          <span :class="item.ada_luar_lokasi ? 'bg-rose-50 text-rose-600' : 'text-gray-400'" class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
            {{ item.ada_luar_lokasi ? 'Luar Lokasi' : 'Dalam' }}
          </span>
        </template>
        <template #cell-action="{ item }">
          <router-link
            :to="{ name: 'HrAttendanceHarianDetail', params: { employeeId: item.training_employee_id, date: dayjs(item.attendance_date).format('YYYY-MM-DD') } }"
            class="text-xs font-bold text-brand-600 hover:underline"
          >
            Detail
          </router-link>
        </template>
      </DataTable>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import { AttendanceService } from './attendance.service'
import { CalendarCheck } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const rows = ref([])
const loading = ref(false)
const statusFilter = ref('')
const filters = reactive({
  start: dayjs().startOf('month').format('YYYY-MM-DD'),
  end: dayjs().endOf('month').format('YYYY-MM-DD'),
})

const STATUS_LABEL = {
  hadir: 'Hadir',
  izin: 'Izin',
  tidak_absen_masuk: 'Tidak Absen Masuk',
  belum_masuk: 'Belum Masuk',
}
const statusPill = {
  hadir: 'bg-black text-white dark:bg-white dark:text-black',
  izin: 'bg-amber-50 text-amber-600',
  tidak_absen_masuk: 'bg-rose-50 text-rose-600',
  belum_masuk: 'bg-gray-100 text-gray-500',
}

const filteredRows = computed(() =>
  statusFilter.value ? rows.value.filter((r) => r.status_kehadiran === statusFilter.value) : rows.value,
)

const tableColumns = [
  { key: 'attendance_date', label: 'Tanggal' },
  { key: 'karyawan', label: 'Karyawan' },
  { key: 'status_kehadiran', label: 'Status' },
  { key: 'lokasi', label: 'Lokasi' },
  { key: 'action', label: 'Aksi' },
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await AttendanceService.harian(filters)
    rows.value = res.data
  } catch (err) {
    Alert.error('Gagal memuat absen harian')
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())
</script>

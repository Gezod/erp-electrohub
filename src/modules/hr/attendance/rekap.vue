<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
          <ClipboardList class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Rekap Absensi</h2>
          <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Estimasi Gaji Periode &bull; Human Resources</p>
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
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Cari Nama</label>
          <input v-model="search" type="text" placeholder="Nama karyawan..." class="input-base" />
        </div>
        <button @click="fetchData" class="btn-primary h-11">Terapkan</button>
        <button
          @click="handleExport"
          :disabled="isExporting"
          class="h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
        >
          {{ isExporting ? 'Mengekspor...' : 'Export' }}
        </button>
        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic ml-auto self-center">
          Estimasi — nilai final hanya setelah Payroll Run difinalisasi
        </p>
      </div>

      <DataTable :columns="tableColumns" :data="filteredRows" :loading="loading" :items-per-page="15">
        <template #cell-full_name="{ item }">
          <span class="font-bold text-gray-800 dark:text-white">{{ item.full_name }}</span>
        </template>
        <template #cell-division_name="{ item }">
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.division_name || '-' }}</span>
        </template>
        <template #cell-hari_kerja="{ item }">
          <span class="font-semibold">{{ item.hari_kerja }} hari</span>
        </template>
        <template #cell-total_jam_lembur="{ item }">
          <span class="text-gray-600 dark:text-gray-300">{{ item.total_jam_lembur }} jam</span>
        </template>
        <template #cell-gaji_harian="{ item }">
          <span class="text-gray-600 dark:text-gray-300">{{ formatCurrency(item.gaji_harian) }}</span>
        </template>
        <template #cell-estimasi_gaji="{ item }">
          <span class="font-black text-brand-600">{{ formatCurrency(item.estimasi_gaji) }}</span>
        </template>
        <template #cell-action="{ item }">
          <router-link :to="{ name: 'HrAttendanceRekapDetail', params: { employeeId: item.id }, query: filters }" class="text-xs font-bold text-brand-600 hover:underline">
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
import { ClipboardList } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import { downloadFile } from '@/utils/file'
import dayjs from 'dayjs'

const rows = ref([])
const loading = ref(false)
const isExporting = ref(false)
const search = ref('')
const filters = reactive({
  start: dayjs().startOf('month').format('YYYY-MM-DD'),
  end: dayjs().endOf('month').format('YYYY-MM-DD'),
})

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((r) => (r.full_name || '').toLowerCase().includes(q))
})

const tableColumns = [
  { key: 'full_name', label: 'Nama' },
  { key: 'division_name', label: 'Divisi' },
  { key: 'hari_kerja', label: 'Hari Kerja' },
  { key: 'gaji_harian', label: 'Gaji Harian' },
  { key: 'total_jam_lembur', label: 'Total Lembur' },
  { key: 'estimasi_gaji', label: 'Estimasi Gaji' },
  { key: 'action', label: 'Aksi' },
]

const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await AttendanceService.rekap(filters)
    rows.value = res.data
  } catch (err) {
    Alert.error('Gagal memuat rekap absensi')
  } finally {
    loading.value = false
  }
}

const handleExport = async () => {
  const confirmed = await Alert.confirmExport(
    'Apakah Anda setuju untuk export rekap absensi?',
    'Sistem akan mengunduh data rekap absensi',
  );
  if (!confirmed) return;

  isExporting.value = true
  try {
    const blob = await AttendanceService.exportRekap(filters)
    downloadFile(blob, `Rekap_Absensi_${filters.start}_${filters.end}.csv`)
    Alert.toast('Berhasil export rekap absensi', 'File data rekap absensi berhasil diunduh ke perangkat Anda', 'success')
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat mengunduh file rekap absensi'
    if (error.response?.data instanceof Blob) {
      try {
        const json = JSON.parse(await error.response.data.text())
        if (json.message) errorMessage = json.message
      } catch (e) {
        // biarkan pesan default
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    Alert.toast(errorMessage, 'error')
  } finally {
    isExporting.value = false
  }
}

onMounted(() => fetchData())
</script>

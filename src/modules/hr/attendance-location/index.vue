<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <MapPin class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Lokasi Absen</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Geofence Check-in &bull; Human Resources</p>
          </div>
        </div>
        <router-link :to="{ name: 'HrAttendanceLocationCreate' }" class="btn-primary">
          <Plus class="w-4 h-4" /> Tambah Lokasi
        </router-link>
      </div>

      <DataTable
        :columns="tableColumns"
        :data="locations"
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-name="{ item }">
          <div class="flex flex-col">
            <span class="font-bold text-gray-800 dark:text-white">{{ item.name }}</span>
            <span v-if="item.setting_name" class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{{ item.setting_name }}</span>
          </div>
        </template>
        <template #cell-coordinate="{ item }">
          <span class="font-mono text-xs text-gray-500">{{ Number(item.latitude).toFixed(6) }}, {{ Number(item.longitude).toFixed(6) }}</span>
        </template>
        <template #cell-radius_meters="{ item }">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ item.radius_meters }} m</span>
        </template>
        <template #cell-action="{ item }">
          <div class="flex items-center gap-2">
            <router-link :to="{ name: 'HrAttendanceLocationEdit', params: { id: item.id } }" class="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition" title="Edit">
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

// pagination di module scope agar posisi halaman bertahan saat kembali dari form;
// didaftarkan ke registerFilterReset() supaya ikut direset oleh resetAppCache saat logout.
const makeDefaultPagination = () => ({ page: 1, total_pages: 1, total_data: 0 })
const pagination = ref(makeDefaultPagination())

registerFilterReset(() => {
  pagination.value = makeDefaultPagination()
})
</script>

<script setup>
import { onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import { AttendanceLocationService } from './attendanceLocation.service'
import { MapPin, Plus, Edit, Trash2 } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'

const locations = ref([])
const loading = ref(false)

const tableColumns = [
  { key: 'name', label: 'Lokasi' },
  { key: 'type', label: 'Type' },
  { key: 'coordinate', label: 'Koordinat' },
  { key: 'radius_meters', label: 'Radius' },
  { key: 'action', label: 'Aksi' },
]

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await AttendanceLocationService.getAll({ page })
    locations.value = res.data
    pagination.value = {
      page: res.pagination.currentPage,
      total_pages: res.pagination.totalPages,
      total_data: res.pagination.totalData,
    }
  } catch (err) {
    Alert.error('Gagal memuat data lokasi absen')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Lokasi?', 'Lokasi yang masih dipakai karyawan tidak bisa dihapus.', 'Ya, Hapus')
  if (!confirmed) return
  try {
    await AttendanceLocationService.remove(id)
    Alert.success('Lokasi berhasil dihapus')
    fetchData()
  } catch (err) {
    Alert.error('Gagal menghapus lokasi', err.response?.data?.message)
  }
}

// Pertahankan halaman terakhir saat kembali dari form.
onMounted(() => fetchData(pagination.value.page))
</script>

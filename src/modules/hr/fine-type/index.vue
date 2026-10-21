<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
            <AlertOctagon class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Master Denda</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Katalog Pelanggaran &bull; Human Resources</p>
          </div>
        </div>
        <router-link :to="{ name: 'HrFineTypeCreate' }" class="btn-primary">
          <Plus class="w-4 h-4" /> Tambah Denda
        </router-link>
      </div>

      <DataTable
        :columns="tableColumns"
        :data="fineTypes"
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-nominal="{ item }">
          <span class="font-bold text-rose-600">{{ formatCurrency(item.amount) }}</span>
        </template>
        <template #cell-status="{ item }">
          <span :class="item.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'" class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase">
            {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
          </span>
        </template>
        <template #cell-kejadian="{ item }">
          <span class="text-sm text-gray-500">{{ item.kejadian_count }}x</span>
        </template>
        <template #cell-action="{ item }">
          <div class="flex items-center gap-2">
            <router-link :to="{ name: 'HrFineTypeEdit', params: { id: item.id } }" class="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition" title="Edit">
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
import { FineTypeService } from './fineType.service'
import { AlertOctagon, Plus, Edit, Trash2 } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'

const fineTypes = ref([])
const loading = ref(false)

const tableColumns = [
  { key: 'name', label: 'Nama Denda' },
  { key: 'nominal', label: 'Nominal' },
  { key: 'kejadian', label: 'Kejadian' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Aksi' },
]

const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0)

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await FineTypeService.getAll({ page })
    fineTypes.value = res.data
    pagination.value = {
      page: res.pagination.currentPage,
      total_pages: res.pagination.totalPages,
      total_data: res.pagination.totalData,
    }
  } catch (err) {
    Alert.error('Gagal memuat data denda')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Jenis Denda?', 'Riwayat denda karyawan tetap tersimpan.', 'Ya, Hapus')
  if (!confirmed) return
  try {
    await FineTypeService.remove(id)
    Alert.success('Denda berhasil dihapus')
    fetchData()
  } catch (err) {
    Alert.error('Gagal menghapus data')
  }
}

// Pertahankan halaman terakhir saat kembali dari form.
onMounted(() => fetchData(pagination.value.page))
</script>

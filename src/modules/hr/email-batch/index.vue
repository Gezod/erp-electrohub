<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <Mail class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Kirim Email Slip</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Broadcast Payslip &bull; Human Resources</p>
          </div>
        </div>
        <router-link :to="{ name: 'HrEmailBatchCreate' }" class="btn-primary">
          <Plus class="w-4 h-4" /> Buat Broadcast
        </router-link>
      </div>

      <DataTable
        :columns="tableColumns"
        :data="batches"
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-name="{ item }">
          <router-link :to="{ name: 'HrEmailBatchShow', params: { id: item.id } }" class="font-bold text-gray-800 dark:text-white hover:text-brand-500">{{ item.name }}</router-link>
        </template>
        <template #cell-source="{ item }">
          <span class="text-[10px] font-bold text-gray-400 uppercase">{{ item.source }}</span>
        </template>
        <template #cell-progress="{ item }">
          <div class="w-32">
            <div class="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div class="h-full bg-brand-500" :style="{ width: `${item.total ? Math.round(((item.sent + item.failed) / item.total) * 100) : 0}%` }"></div>
            </div>
          </div>
        </template>
        <template #cell-hasil="{ item }">
          <span class="text-emerald-600 font-bold text-xs">{{ item.sent }} terkirim</span>
          <span v-if="item.failed" class="text-rose-500 font-bold text-xs ml-2">{{ item.failed }} gagal</span>
        </template>
        <template #cell-status="{ item }">
          <span :class="statusClass(item.status)" class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase">{{ statusLabel(item.status) }}</span>
        </template>
        <template #cell-action="{ item }">
          <router-link :to="{ name: 'HrEmailBatchShow', params: { id: item.id } }" class="text-xs font-bold text-brand-600 hover:underline">Detail</router-link>
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
import { EmailBatchService } from './emailBatch.service'
import { Mail, Plus } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'

const batches = ref([])
const loading = ref(false)

const tableColumns = [
  { key: 'name', label: 'Nama Batch' },
  { key: 'source', label: 'Sumber' },
  { key: 'progress', label: 'Progress' },
  { key: 'hasil', label: 'Hasil' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Aksi' },
]

const statusLabel = (s) => ({ pending: 'Menunggu', processing: 'Berjalan', completed: 'Selesai', completed_with_errors: 'Selesai (Ada Gagal)' }[s] || s)
const statusClass = (s) =>
  ({
    pending: 'bg-gray-100 text-gray-500',
    processing: 'bg-indigo-50 text-indigo-600',
    completed: 'bg-emerald-50 text-emerald-600',
    completed_with_errors: 'bg-amber-50 text-amber-600',
  }[s] || 'bg-gray-100 text-gray-500')

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await EmailBatchService.getAll({ page })
    batches.value = res.data
    pagination.value = {
      page: res.pagination.currentPage,
      total_pages: res.pagination.totalPages,
      total_data: res.pagination.totalData,
    }
  } catch (err) {
    Alert.error('Gagal memuat data batch email')
  } finally {
    loading.value = false
  }
}

// Pertahankan halaman terakhir saat kembali dari form.
onMounted(() => fetchData(pagination.value.page))
</script>

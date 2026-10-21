<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <Wallet class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Payroll</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Karyawan Training &bull; Human Resources</p>
          </div>
        </div>
        <router-link :to="{ name: 'HrPayrollCreate' }" class="btn-primary">
          <Plus class="w-4 h-4" /> Payroll Run
        </router-link>
      </div>

      <DataTable
        :columns="tableColumns"
        :data="runs"
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-periode="{ item }">
          <router-link :to="{ name: 'HrPayrollShow', params: { id: item.id } }" class="font-bold text-gray-800 dark:text-white hover:text-brand-500">
            {{ item.period_name || `${dayjs(item.period_start).format('DD MMM YYYY')} - ${dayjs(item.period_end).format('DD MMM YYYY')}` }}
          </router-link>
        </template>
        <template #cell-items_count="{ item }">
          <span class="text-sm text-gray-500">{{ item.items_count }} item</span>
        </template>
        <template #cell-total="{ item }">
          <span class="font-bold text-gray-800 dark:text-white">{{ formatCurrency(item.items_sum_total_salary) }}</span>
        </template>
        <template #cell-status="{ item }">
          <span :class="item.status === 'final' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'" class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase">
            {{ item.status === 'final' ? 'Final' : 'Draft' }}
          </span>
        </template>
        <template #cell-paid_date="{ item }">
          <span class="text-sm text-gray-500">{{ item.paid_date ? dayjs(item.paid_date).format('DD MMM YYYY') : '—' }}</span>
        </template>
        <template #cell-action="{ item }">
          <router-link :to="{ name: 'HrPayrollShow', params: { id: item.id } }" class="text-xs font-bold text-brand-600 hover:underline">Buka</router-link>
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
import { PayrollRunService } from './payrollRun.service'
import { Wallet, Plus } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const runs = ref([])
const loading = ref(false)

const tableColumns = [
  { key: 'periode', label: 'Periode' },
  { key: 'items_count', label: 'Item' },
  { key: 'total', label: 'Total Gaji' },
  { key: 'status', label: 'Status' },
  { key: 'paid_date', label: 'Dibayarkan' },
  { key: 'action', label: 'Aksi' },
]

const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0)

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await PayrollRunService.getAll({ page, limit: 15 })
    runs.value = res.data
    pagination.value = {
      page: res.pagination.currentPage,
      total_pages: res.pagination.totalPages,
      total_data: res.pagination.totalData,
    }
  } catch (err) {
    Alert.error('Gagal memuat data payroll')
  } finally {
    loading.value = false
  }
}

// Pertahankan halaman terakhir saat kembali dari form.
onMounted(() => fetchData(pagination.value.page))
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10" v-if="run">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none">Detail Payroll</h2>
      </div>

      <div class="bg-gray-950 text-white rounded-3xl p-8 mb-6 flex flex-col md:flex-row md:items-center justify-end">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-xl font-black">{{ run.period_name || 'Payroll Run' }}</h3>
            <span :class="run.status === 'final' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'" class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase">
              {{ run.status === 'final' ? 'Final' : 'Draft' }}
            </span>
          </div>
          <p class="text-sm text-gray-400">{{ dayjs(run.period_start).format('DD MMM YYYY') }} — {{ dayjs(run.period_end).format('DD MMM YYYY') }}</p>
          <p v-if="run.status === 'final'" class="text-xs text-gray-500 mt-1">Difinalisasi {{ dayjs(run.finalized_at).format('DD MMM YYYY HH:mm') }} oleh {{ run.finalized_by?.full_name }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Karyawan</p>
          <p class="text-lg font-black text-gray-800 dark:text-white">{{ run.items.length }} orang</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Hari Kerja</p>
          <p class="text-lg font-black text-gray-800 dark:text-white">{{ overview.totalWorkDays }} hari</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Lembur</p>
          <p class="text-lg font-black text-gray-800 dark:text-white">{{ overview.totalOvertimeHours }} jam</p>
        </div>
        <div class="bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-800/50 p-5">
          <p class="text-[10px] text-rose-500 font-bold uppercase tracking-widest mb-1">Total Potongan</p>
          <p class="text-lg font-black text-rose-600">{{ formatCurrency(overview.totalDeductions) }}</p>
        </div>
        <div class="col-span-2 bg-brand-500/10 rounded-2xl border border-brand-500/20 p-5">
          <p class="text-[10px] text-brand-600 font-bold uppercase tracking-widest mb-1">Total Gaji</p>
          <p class="text-2xl font-black text-brand-600">{{ formatCurrency(run.total_salary) }}</p>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div class="flex items-center gap-3" v-if="run.status === 'draft'">
          <button @click="handleRegenerate" class="btn-outline">
            <RefreshCw class="w-4 h-4" /> Generate Ulang
          </button>
          <button @click="handleFinalize" class="btn-primary">
            <CheckCircle class="w-4 h-4" /> Finalisasi
          </button>
        </div>
        <div v-else class="flex items-center gap-3">
          <input v-model="paidDate" type="date" class="input-base w-auto h-11" />
          <button @click="handleMarkPaid" class="btn-primary">
            <DollarSign class="w-4 h-4" /> Catat Pembayaran
          </button>
          <span v-if="run.paid_date" class="text-emerald-600 text-xs font-bold">Dibayar {{ dayjs(run.paid_date).format('DD MMM YYYY') }}</span>
        </div>
        <button v-if="run.status === 'draft'" @click="handleRemove" class="btn-danger">
          <Trash2 class="w-4 h-4" /> Hapus
        </button>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr class="text-left text-[11px] text-gray-500 uppercase tracking-wider">
                <th class="px-4 py-3">Nama</th>
                <th class="px-4 py-3">Divisi</th>
                <th class="px-4 py-3">Hari Kerja</th>
                <th class="px-4 py-3">Gaji Harian</th>
                <th class="px-4 py-3">Lembur</th>
                <th class="px-4 py-3">Potongan Lain</th>
                <th class="px-4 py-3">Telat</th>
                <th class="px-4 py-3">Izin</th>
                <th class="px-4 py-3">Denda</th>
                <th class="px-4 py-3">Jumlah</th>
                <th class="px-4 py-3">Slip</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="item in run.items" :key="item.id">
                <td class="px-4 py-3 font-bold text-gray-800 dark:text-white">{{ item.name_snapshot || item.training_employee?.full_name }}</td>
                <td class="px-4 py-3 text-gray-500">{{ item.division_snapshot || item.training_employee?.division?.name || '-' }}</td>
                <td class="px-4 py-3">{{ item.work_days }}</td>
                <td class="px-4 py-3">{{ formatCurrency(item.daily_salary) }}</td>
                <td class="px-4 py-3">{{ item.total_overtime_hours }} jam</td>
                <td class="px-4 py-3">
                  <div v-if="run.status !== 'final'" class="flex items-center gap-1">
                    <input
                      :value="formatThousand(editable[item.id])"
                      @input="e => editable[item.id] = parseThousand(e.target.value)"
                      type="text" inputmode="numeric" class="input-base !h-8 !py-1 !text-xs w-28"
                    />
                    <button @click="handleSaveItem(item)" class="text-emerald-500 hover:text-emerald-600" title="Simpan">
                      <Check :size="16" />
                    </button>
                  </div>
                  <span v-else>{{ formatCurrency(item.deduction) }}</span>
                </td>
                <td class="px-4 py-3 text-rose-500">{{ formatCurrency(item.late_deduction) }}</td>
                <td class="px-4 py-3 text-rose-500">{{ formatCurrency(item.partial_leave_deduction) }}</td>
                <td class="px-4 py-3 text-rose-500">{{ formatCurrency(item.fine_deduction) }}</td>
                <td class="px-4 py-3 font-black text-gray-800 dark:text-white">{{ formatCurrency(item.total_salary) }}</td>
                <td class="px-4 py-3">
                  <a :href="slipUrl(item.id)" target="_blank" class="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 text-[10px] font-bold uppercase hover:bg-brand-500/20">PDF</a>
                </td>
              </tr>
              <tr v-if="!run.items.length">
                <td colspan="11" class="px-4 py-12 text-center text-gray-400 text-sm">Belum ada item. Klik Generate Ulang.</td>
              </tr>
            </tbody>
            <tfoot v-if="run.items.length" class="bg-gray-50 dark:bg-gray-800/50 font-black">
              <tr>
                <td colspan="9" class="px-4 py-3 text-right text-gray-500 uppercase text-xs tracking-widest">Total</td>
                <td class="px-4 py-3 text-gray-800 dark:text-white">{{ formatCurrency(run.total_salary) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { PayrollRunService } from './payrollRun.service'
import { ArrowLeft, RefreshCw, CheckCircle, DollarSign, Trash2, Check } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import { formatThousand, parseThousand } from '@/utils/format'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const run = ref(null)
const editable = reactive({})
const paidDate = ref(dayjs().format('YYYY-MM-DD'))

const overview = computed(() => {
  const items = run.value?.items || []
  return {
    totalWorkDays: items.reduce((sum, i) => sum + Number(i.work_days || 0), 0),
    totalOvertimeHours: items.reduce((sum, i) => sum + Number(i.total_overtime_hours || 0), 0),
    totalDeductions: items.reduce(
      (sum, i) => sum + Number(i.deduction || 0) + Number(i.late_deduction || 0) + Number(i.partial_leave_deduction || 0) + Number(i.fine_deduction || 0),
      0
    ),
  }
})

const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0)
const slipUrl = (itemId) => PayrollRunService.slipUrl(route.params.id, itemId)

const loadRun = async () => {
  try {
    run.value = await PayrollRunService.getOne(route.params.id)
    run.value.items.forEach((item) => { editable[item.id] = Number(item.deduction) })
    if (run.value.paid_date) paidDate.value = dayjs(run.value.paid_date).format('YYYY-MM-DD')
  } catch (err) {
    Alert.error('Gagal memuat payroll run')
  }
}

const handleRegenerate = async () => {
  const confirmed = await Alert.confirm('Generate Ulang?', 'Item akan dihitung ulang dari data absensi terbaru. Potongan manual tetap dipertahankan.', 'Ya, Generate')
  if (!confirmed) return
  try {
    const res = await PayrollRunService.regenerate(route.params.id)
    Alert.success(res.message)
    loadRun()
  } catch (err) {
    Alert.error('Gagal generate ulang', err.response?.data?.message)
  }
}

const handleSaveItem = async (item) => {
  try {
    await PayrollRunService.updateItem(route.params.id, item.id, { potongan: editable[item.id] || 0 })
    Alert.success('Potongan berhasil diperbarui')
    loadRun()
  } catch (err) {
    Alert.error('Gagal menyimpan potongan', err.response?.data?.message)
  }
}

const handleFinalize = async () => {
  const confirmed = await Alert.confirm('Finalisasi Payroll?', 'Nilai akan di-snapshot dan tidak bisa di-generate ulang.', 'Ya, Finalisasi')
  if (!confirmed) return
  try {
    const res = await PayrollRunService.finalize(route.params.id)
    Alert.success(res.message)
    loadRun()
  } catch (err) {
    Alert.error('Gagal finalisasi', err.response?.data?.message)
  }
}

const handleMarkPaid = async () => {
  try {
    await PayrollRunService.markPaid(route.params.id, { tgl_dibayarkan: paidDate.value })
    Alert.success('Payroll ditandai sudah dibayar')
    loadRun()
  } catch (err) {
    Alert.error('Gagal mencatat pembayaran', err.response?.data?.message)
  }
}

const handleRemove = async () => {
  const confirmed = await Alert.confirm('Hapus Payroll Run?', 'Data yang dihapus tidak dapat dipulihkan.', 'Ya, Hapus')
  if (!confirmed) return
  try {
    await PayrollRunService.remove(route.params.id)
    Alert.success('Payroll run berhasil dihapus')
    router.push({ name: 'HrPayroll' })
  } catch (err) {
    Alert.error('Gagal menghapus', err.response?.data?.message)
  }
}

onMounted(() => loadRun())
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none">Buat Broadcast Email</h2>
      </div>

      <div class="flex gap-2 mb-6">
        <button @click="tab = 'payroll'" :class="tab === 'payroll' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700'" class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          Dari Data Payroll
        </button>
        <button @click="tab = 'excel'" :class="tab === 'excel' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 border border-gray-200 dark:border-gray-700'" class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          Upload Excel + File
        </button>
      </div>

      <!-- Tab: From Payroll -->
      <div v-if="tab === 'payroll'" class="max-w-xl bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-6">
        <div v-if="finalRuns.length === 0" class="p-4 rounded-xl bg-amber-50 text-amber-700 text-sm">
          Belum ada Payroll Run yang final. Finalisasi payroll dulu di menu Payroll.
        </div>
        <div v-else>
          <label class="section-label">Periode Payroll (Final) *</label>
          <select v-model="payrollForm.payroll_run_id" class="input-base">
            <option value="" disabled>Pilih periode...</option>
            <option v-for="r in finalRuns" :key="r.id" :value="r.id">{{ r.period_name || `${r.period_start} - ${r.period_end}` }}</option>
          </select>
        </div>
        <div>
          <label class="section-label">Nama Batch *</label>
          <input v-model="payrollForm.name" type="text" class="input-base" />
        </div>
        <div>
          <label class="section-label">Subject Email *</label>
          <input v-model="payrollForm.subject" type="text" class="input-base" />
        </div>
        <div>
          <label class="section-label">Isi Email</label>
          <textarea v-model="payrollForm.body" rows="4" class="input-base !h-auto resize-none p-4"></textarea>
        </div>
        <button @click="submitFromPayroll" :disabled="submitting || finalRuns.length === 0" class="btn-primary w-full h-11">
          {{ submitting ? 'Mengirim...' : 'Kirim Broadcast Email' }}
        </button>
      </div>

      <!-- Tab: Excel + Documents -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-6">
          <div>
            <label class="section-label">Nama Batch *</label>
            <input v-model="excelForm.name" type="text" class="input-base" />
          </div>
          <div>
            <label class="section-label">Subject Email *</label>
            <input v-model="excelForm.subject" type="text" class="input-base" placeholder="Slip Gaji Anda - ElectroHub" />
          </div>
          <div>
            <label class="section-label">Isi Email</label>
            <textarea v-model="excelForm.body" rows="3" class="input-base !h-auto resize-none p-4" placeholder="Gunakan {{nama}} untuk personalisasi"></textarea>
          </div>

          <div>
            <label class="section-label">1. Upload File Excel (nama, email, nama_file) *</label>
            <input type="file" accept=".xlsx,.xls,.csv" class="input-base !h-auto py-2" @change="onExcelChange" />
            <div v-if="excelRows.length" class="mt-3 max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-xl">
              <table class="w-full text-xs">
                <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0"><tr><th class="px-3 py-2 text-left">Nama</th><th class="px-3 py-2 text-left">Email</th><th class="px-3 py-2 text-left">Nama File</th></tr></thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="(r, i) in excelRows" :key="i"><td class="px-3 py-1.5">{{ r.nama }}</td><td class="px-3 py-1.5">{{ r.email }}</td><td class="px-3 py-1.5">{{ r.nama_file }}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label class="section-label">2. Upload Dokumen Lampiran (PDF) *</label>
            <input type="file" multiple accept=".pdf" class="input-base !h-auto py-2" @change="onDocsChange" />
            <div v-if="docFiles.length" class="flex flex-wrap gap-2 mt-3">
              <span v-for="(f, i) in docFiles" :key="i" class="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold text-gray-600 dark:text-gray-300">{{ f.name }}</span>
            </div>
          </div>

          <div v-if="excelRows.length && docFiles.length" class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs">
            <p class="font-bold text-gray-600 dark:text-gray-300 mb-1">Status Pencocokan File</p>
            <p :class="matchedCount === excelRows.length ? 'text-emerald-600' : 'text-amber-600'" class="font-bold">{{ matchedCount }} / {{ excelRows.length }} baris cocok dengan file</p>
          </div>

          <button @click="submitFromExcel" :disabled="submitting || !canSubmitExcel" class="btn-primary w-full h-11">
            {{ submitting ? 'Mengirim...' : 'Kirim Broadcast Email' }}
          </button>
        </div>

        <div class="bg-gradient-to-br from-brand-500 to-indigo-600 text-white rounded-3xl p-6 space-y-3 h-fit">
          <p class="text-xs font-black uppercase tracking-widest opacity-80">Ringkasan Broadcast</p>
          <div class="flex justify-between text-sm"><span class="opacity-80">Penerima</span><span class="font-bold">{{ excelRows.length }}</span></div>
          <div class="flex justify-between text-sm"><span class="opacity-80">Dokumen</span><span class="font-bold">{{ docFiles.length }}</span></div>
          <div class="flex justify-between text-sm"><span class="opacity-80">Subject</span><span class="font-bold truncate max-w-[140px]">{{ excelForm.subject || '-' }}</span></div>
          <p class="text-[10px] opacity-70 pt-3 border-t border-white/20">Nama file harus cocok persis (case-insensitive) dengan kolom nama_file di Excel. Gunakan {{ namaPlaceholder }} pada isi email untuk personalisasi.</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { EmailBatchService } from './emailBatch.service'
import { PayrollRunService } from '../payroll/payrollRun.service'
import { ArrowLeft } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import * as XLSX from 'xlsx'

const router = useRouter()
const submitting = ref(false)
const tab = ref('payroll')
const namaPlaceholder = '{{nama}}'
const finalRuns = ref([])

const payrollForm = reactive({ payroll_run_id: '', name: '', subject: 'Slip Gaji Anda - ElectroHub', body: '' })
const excelForm = reactive({ name: '', subject: 'Slip Gaji Anda - ElectroHub', body: '' })
const excelRows = ref([])
const excelFile = ref(null)
const docFiles = ref([])

const EMAIL_KEYS = ['email', 'e_mail']
const NAME_KEYS = ['nama', 'name']
const FILE_KEYS = ['nama_file', 'file', 'filename', 'nama_file_pdf']

const findKey = (row, keys) => {
  const rowKeys = Object.keys(row)
  for (const k of keys) {
    const found = rowKeys.find((rk) => rk.toLowerCase().trim().replace(/\s+/g, '_') === k)
    if (found) return row[found]
  }
  return ''
}

const onExcelChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  excelFile.value = file
  const reader = new FileReader()
  reader.onload = (evt) => {
    const wb = XLSX.read(evt.target.result, { type: 'array' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    excelRows.value = json
      .map((row) => ({
        nama: String(findKey(row, NAME_KEYS) || '').trim(),
        email: String(findKey(row, EMAIL_KEYS) || '').trim(),
        nama_file: String(findKey(row, FILE_KEYS) || '').trim(),
      }))
      .filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))
  }
  reader.readAsArrayBuffer(file)
}

const onDocsChange = (e) => {
  docFiles.value = Array.from(e.target.files || [])
}

const matchedCount = computed(() => {
  const fileNames = new Set(docFiles.value.map((f) => f.name.toLowerCase()))
  return excelRows.value.filter((r) => r.nama_file && fileNames.has(r.nama_file.toLowerCase())).length
})

const canSubmitExcel = computed(() => excelFile.value && docFiles.value.length > 0 && excelForm.name && excelForm.subject)

const submitFromPayroll = async () => {
  if (!payrollForm.payroll_run_id || !payrollForm.name || !payrollForm.subject) {
    Alert.error('Mohon lengkapi data wajib!')
    return
  }
  submitting.value = true
  try {
    const res = await EmailBatchService.storeFromPayroll(payrollForm)
    Alert.success(res.message)
    router.push({ name: 'HrEmailBatchShow', params: { id: res.batch_id } })
  } catch (err) {
    Alert.error('Gagal membuat batch', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

const submitFromExcel = async () => {
  if (!canSubmitExcel.value) {
    Alert.error('Mohon lengkapi Excel dan dokumen lampiran!')
    return
  }
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('name', excelForm.name)
    formData.append('subject', excelForm.subject)
    formData.append('body', excelForm.body || '')
    formData.append('excel', excelFile.value)
    docFiles.value.forEach((f) => formData.append('documents', f))

    const res = await EmailBatchService.storeFromExcel(formData)
    Alert.success(res.message)
    router.push({ name: 'HrEmailBatchShow', params: { id: res.batch_id } })
  } catch (err) {
    Alert.error('Gagal membuat batch', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const res = await PayrollRunService.getAll({ limit: 100 })
    finalRuns.value = res.data.filter((r) => r.status === 'final')
  } catch (err) {
    Alert.error('Gagal memuat data payroll')
  }
})
</script>

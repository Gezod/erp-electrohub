<template>
  <Transition name="fade">
    <div
      v-if="modelValue"
      :class="[
        'fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-xs transition-all duration-300 select-none',
        isExpanded || isHovered ? 'lg:left-[264px]' : 'lg:left-[80px]'
      ]"
    >
      <Transition name="zoom">
        <div
          class="bg-white dark:bg-gray-950 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-800 text-gray-800 dark:text-gray-200 flex flex-col max-h-[85vh] sm:max-h-[90vh] my-auto"
        >
          <!-- Header -->
          <div
            class="border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <FileSpreadsheet class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                  Import Data Barang Master
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Unggah file Excel untuk menambahkan barang secara massal dengan panduan dictionary sistem
                </p>
              </div>
            </div>
            <button
              @click="close"
              type="button"
              class="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition active:scale-95 cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Stepper Navigation -->
          <div class="px-6 py-3 bg-gray-100/60 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-around max-w-2xl mx-auto">
              <div
                v-for="step in steps"
                :key="step.number"
                class="flex items-center gap-2 cursor-pointer"
                @click="goToStep(step.number)"
              >
                <div
                  :class="[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    currentStep === step.number
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : currentStep > step.number
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  ]"
                >
                  <Check v-if="currentStep > step.number" class="w-4 h-4" />
                  <span v-else>{{ step.number }}</span>
                </div>
                <span
                  :class="[
                    'text-xs font-bold uppercase tracking-wider',
                    currentStep === step.number
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-gray-500 dark:text-gray-400'
                  ]"
                >
                  {{ step.title }}
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            <!-- STEP 1: Download & Guidance -->
            <div v-if="currentStep === 1" class="space-y-6">
              <div class="p-4 bg-brand-50/50 dark:bg-brand-500/5 rounded-xl border border-brand-100 dark:border-brand-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="space-y-1">
                  <h4 class="font-bold text-sm text-brand-900 dark:text-brand-300">
                    Unduh Template Resmi Excel
                  </h4>
                  <p class="text-xs text-brand-700/80 dark:text-brand-400/80">
                    Template sudah dilengkapi Sheet Panduan Dictionary (Kategori, Tipe Aset, Satuan).
                  </p>
                </div>
                <button
                  @click="handleDownloadTemplate"
                  :disabled="isDownloading"
                  class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Download class="w-4 h-4" />
                  <span>{{ isDownloading ? 'Mengunduh...' : 'Unduh Template (.xlsx)' }}</span>
                </button>
              </div>

              <!-- Interactive Dictionary Guidance Table -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen class="w-4 h-4 text-brand-500" />
                    Panduan System Dictionary (Daftar Referensi Valid)
                  </h4>
                  <div class="flex gap-2">
                    <button
                      v-for="tab in ['category', 'assetType', 'uom']"
                      :key="tab"
                      @click="activeGuideTab = tab"
                      :class="[
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
                        activeGuideTab === tab
                          ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
                      ]"
                    >
                      {{ tab === 'category' ? 'Kategori *' : tab === 'assetType' ? 'Tipe Aset' : 'Satuan *' }}
                    </button>
                  </div>
                </div>

                <div class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                  <table class="w-full text-xs">
                    <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">#</th>
                        <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Nama Referensi</th>
                        <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      <template v-if="activeGuideTab === 'category'">
                        <tr v-for="(cat, idx) in categories" :key="cat.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td class="px-4 py-2 text-gray-400 font-mono">{{ idx + 1 }}</td>
                          <td class="px-4 py-2 font-bold text-gray-800 dark:text-gray-200">{{ cat.name_category }}</td>
                          <td class="px-4 py-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Wajib</span></td>
                        </tr>
                      </template>
                      <template v-else-if="activeGuideTab === 'assetType'">
                        <tr v-for="(at, idx) in assetTypes" :key="at.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td class="px-4 py-2 text-gray-400 font-mono">{{ idx + 1 }}</td>
                          <td class="px-4 py-2 font-bold text-gray-800 dark:text-gray-200">{{ at.name_type }}</td>
                          <td class="px-4 py-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Opsional</span></td>
                        </tr>
                      </template>
                      <template v-else>
                        <tr v-for="(u, idx) in uoms" :key="u.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td class="px-4 py-2 text-gray-400 font-mono">{{ idx + 1 }}</td>
                          <td class="px-4 py-2 font-bold text-gray-800 dark:text-gray-200">{{ u.name }} ({{ u.code }})</td>
                          <td class="px-4 py-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Wajib</span></td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  @click="currentStep = 2"
                  class="px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  Lanjut Upload File &rarr;
                </button>
              </div>
            </div>

            <!-- STEP 2: Upload File -->
            <div v-else-if="currentStep === 2" class="space-y-6">
              <div
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                :class="[
                  'border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[220px]',
                  isDragging
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10'
                    : 'border-gray-200 dark:border-gray-800 hover:border-brand-400 bg-gray-50/50 dark:bg-gray-900/40'
                ]"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept=".xlsx, .csv"
                  class="hidden"
                  @change="handleFileSelect"
                />

                <div class="p-3 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <UploadCloud class="w-8 h-8" />
                </div>
                <div class="space-y-1">
                  <p class="font-bold text-sm text-gray-800 dark:text-gray-200">
                    {{ selectedFile ? selectedFile.name : 'Tarik & Lepas File Excel / CSV di sini' }}
                  </p>
                  <p class="text-xs text-gray-400">
                    Format file yang didukung: .xlsx, .csv (Maksimal 10 MB)
                  </p>
                </div>
                <span
                  v-if="selectedFile"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 mt-2"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" /> File Siap Diverifikasi
                </span>
              </div>

              <div class="flex justify-between">
                <button
                  @click="currentStep = 1"
                  class="px-5 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  &larr; Kembali
                </button>
                <button
                  @click="handlePreview"
                  :disabled="!selectedFile || isPreviewing"
                  class="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{{ isPreviewing ? 'Memverifikasi Data...' : 'Verifikasi & Preview &rarr;' }}</span>
                </button>
              </div>
            </div>

            <!-- STEP 3: Preview & Validation -->
            <div v-else-if="currentStep === 3" class="space-y-6">
              <!-- Summary Bar -->
              <div class="grid grid-cols-3 gap-4">
                <div class="p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-center">
                  <span class="text-[10px] font-bold text-gray-400 uppercase">Total Baris</span>
                  <p class="text-lg font-black text-gray-900 dark:text-white">{{ previewSummary.totalRows || 0 }}</p>
                </div>
                <div class="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl text-center">
                  <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Siap Diimport (Valid)</span>
                  <p class="text-lg font-black text-emerald-700 dark:text-emerald-400">{{ previewSummary.validRows || 0 }}</p>
                </div>
                <div class="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-center">
                  <span class="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">Bermasalah (Error)</span>
                  <p class="text-lg font-black text-red-700 dark:text-red-400">{{ previewSummary.errorRows || 0 }}</p>
                </div>
              </div>

              <!-- Preview Table -->
              <div class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                <table class="w-full text-xs">
                  <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Baris</th>
                      <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Nama Barang</th>
                      <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Merek</th>
                      <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Kategori</th>
                      <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Satuan</th>
                      <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Status Validasi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr
                      v-for="row in previewRows"
                      :key="row.rowNum"
                      :class="[
                        'hover:bg-gray-50 dark:hover:bg-gray-900/50',
                        !row.isValid ? 'bg-red-50/40 dark:bg-red-500/5' : ''
                      ]"
                    >
                      <td class="px-4 py-2.5 text-gray-400 font-mono font-bold">{{ row.rowNum }}</td>
                      <td class="px-4 py-2.5 font-bold text-gray-800 dark:text-gray-200">{{ row.good_name }}</td>
                      <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400">{{ row.merk || '-' }}</td>
                      <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">{{ row.category_name }}</td>
                      <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">{{ row.uom_name }}</td>
                      <td class="px-4 py-2.5">
                        <span
                          v-if="row.isValid"
                          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        >
                          <CheckCircle2 class="w-3 h-3" /> Valid
                        </span>
                        <div v-else class="space-y-0.5">
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                            <AlertCircle class="w-3 h-3" /> {{ row.errors[0] }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="flex justify-between items-center">
                <button
                  @click="currentStep = 2"
                  class="px-5 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  &larr; Ganti File
                </button>
                <button
                  @click="handleExecute"
                  :disabled="previewSummary.validRows === 0 || isExecuting"
                  class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check class="w-4 h-4" />
                  <span>{{ isExecuting ? 'Memproses Import...' : `Eksekusi Import (${previewSummary.validRows} Baris)` }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  FileSpreadsheet,
  X,
  Check,
  Download,
  BookOpen,
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-vue-next'
import { GoodsService } from '../services/goods.service'
import axios from '@/plugins/axios'
import { Alert } from '@/plugins/sweetalert'
import { useSidebar } from '@/composables/useSidebar'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'imported'])

const { isExpanded, isHovered } = useSidebar()

const currentStep = ref(1)
const steps = [
  { number: 1, title: 'Panduan & Template' },
  { number: 2, title: 'Upload File' },
  { number: 3, title: 'Preview & Import' }
]

const activeGuideTab = ref('category')
const categories = ref([])
const assetTypes = ref([])
const uoms = ref([])

const isDownloading = ref(false)
const isDragging = ref(false)
const selectedFile = ref(null)
const fileInput = ref(null)
const isPreviewing = ref(false)
const isExecuting = ref(false)

const previewRows = ref([])
const previewSummary = ref({ totalRows: 0, validRows: 0, errorRows: 0 })

const close = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  currentStep.value = 1
  selectedFile.value = null
  previewRows.value = []
  previewSummary.value = { totalRows: 0, validRows: 0, errorRows: 0 }
}

const goToStep = (num) => {
  if (num === 3 && previewRows.value.length === 0) return
  currentStep.value = num
}

const fetchDictionaries = async () => {
  try {
    const [catRes, atRes, uomRes] = await Promise.all([
      axios.get('/categories', { params: { is_active: true } }),
      axios.get('/asset-types', { params: { is_active: true } }),
      axios.get('/uom', { params: { is_active: true } })
    ])
    categories.value = catRes.data?.data || catRes.data || []
    assetTypes.value = atRes.data?.data || atRes.data || []
    uoms.value = uomRes.data?.data || uomRes.data || []
  } catch (error) {
    console.error('Failed fetching dictionaries:', error)
  }
}

const handleDownloadTemplate = async () => {
  try {
    isDownloading.value = true
    const blob = await GoodsService.downloadImportTemplate()
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'Template_Import_Barang_Master.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    Alert.toast('Berhasil', 'Template import berhasil diunduh', 'success')
  } catch (error) {
    Alert.error('Gagal', 'Gagal mengunduh template import')
  } finally {
    isDownloading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) selectedFile.value = file
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) selectedFile.value = file
}

const handlePreview = async () => {
  if (!selectedFile.value) return
  try {
    isPreviewing.value = true
    const res = await GoodsService.previewImport(selectedFile.value)
    previewRows.value = res.rows || []
    previewSummary.value = res.summary || { totalRows: 0, validRows: 0, errorRows: 0 }
    currentStep.value = 3
  } catch (error) {
    Alert.error('Gagal', 'Gagal memverifikasi file import')
  } finally {
    isPreviewing.value = false
  }
}

const handleExecute = async () => {
  try {
    isExecuting.value = true
    await GoodsService.executeImport(previewRows.value)
    Alert.success('Berhasil!', `Berhasil meng-import ${previewSummary.value.validRows} barang master!`)
    emit('imported')
    close()
  } catch (error) {
    Alert.error('Gagal!', error.response?.data?.message || 'Gagal menyimpan data import')
  } finally {
    isExecuting.value = false
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      fetchDictionaries()
    }
  }
)

onMounted(() => {
  if (props.modelValue) fetchDictionaries()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

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
            class="border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 py-4 bg-teal-50/40 dark:bg-teal-950/20"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                <Boxes class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                  Import Stok Awal Barang
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Inisialisasi stok fisik awal massal berdasarkan master Barang, Lokasi, dan PIC Karyawan
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
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
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
                      ? 'text-teal-600 dark:text-teal-400'
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
              <!-- Stock Type Selector (Stok Biasa vs Stok Balikan) -->
              <div class="space-y-2">
                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Pilih Tipe Stok yang Ingin Di-import *
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    @click="stockCategory = 'biasa'"
                    :class="[
                      'p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none',
                      stockCategory === 'biasa'
                        ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-500/10 shadow-sm'
                        : 'border-gray-200 dark:border-gray-800 hover:border-teal-300 bg-white dark:bg-gray-900'
                    ]"
                  >
                    <div class="p-2 rounded-lg bg-teal-500 text-white shrink-0">
                      <DollarSign class="w-5 h-5" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="font-bold text-sm text-gray-900 dark:text-white">Stok Biasa (Bernilai)</h4>
                        <span class="px-2 py-0.5 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 uppercase">Valued</span>
                      </div>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Stok persediaan utama / pengadaan baru yang memiliki nilai buku &amp; unit cost.
                      </p>
                    </div>
                  </div>

                  <div
                    @click="stockCategory = 'retur'"
                    :class="[
                      'p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none',
                      stockCategory === 'retur'
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-500/10 shadow-sm'
                        : 'border-gray-200 dark:border-gray-800 hover:border-amber-300 bg-white dark:bg-gray-900'
                    ]"
                  >
                    <div class="p-2 rounded-lg bg-amber-500 text-white shrink-0">
                      <PackageX class="w-5 h-5" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="font-bold text-sm text-gray-900 dark:text-white">Stok Balikan (Return)</h4>
                        <span class="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 uppercase">Unvalued / Rp 0</span>
                      </div>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Barang pengembalian / reject / garansi (Harga otomatis di-set Rp 0).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div :class="[
                'p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all',
                stockCategory === 'biasa'
                  ? 'bg-teal-50/50 dark:bg-teal-500/5 border-teal-100 dark:border-teal-500/20'
                  : 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20'
              ]">
                <div class="space-y-1">
                  <h4 :class="['font-bold text-sm', stockCategory === 'biasa' ? 'text-teal-900 dark:text-teal-300' : 'text-amber-900 dark:text-amber-300']">
                    Unduh Template {{ stockCategory === 'biasa' ? 'Import Stok Biasa' : 'Import Stok Balikan (Return)' }} (.xlsx)
                  </h4>
                  <p :class="['text-xs', stockCategory === 'biasa' ? 'text-teal-700/80 dark:text-teal-400/80' : 'text-amber-700/80 dark:text-amber-400/80']">
                    {{ stockCategory === 'biasa' ? 'Gunakan template ini untuk mengisi Stok Biasa lengkap dengan Nilai / Unit Cost. Tiap baris punya dropdown "Tipe Stok" (Stok Biasa / Stok Opening / Parfum) — satu file boleh berisi campuran ketiganya.' : 'Gunakan template ini untuk mengisi Stok Balikan / Return (Nilai otomatis di-set Rp 0).' }}
                  </p>
                </div>
                <button
                  @click="handleDownloadTemplate"
                  :disabled="isDownloading"
                  :class="[
                    'px-4 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50',
                    stockCategory === 'biasa' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-amber-600 hover:bg-amber-700'
                  ]"
                >
                  <Download class="w-4 h-4" />
                  <span>{{ isDownloading ? 'Mengunduh...' : 'Unduh Template (.xlsx)' }}</span>
                </button>
              </div>

              <!-- Interactive Dictionary Guidance Table -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen class="w-4 h-4 text-teal-500" />
                    Panduan Master System Dictionary
                  </h4>
                  <div class="flex gap-2">
                    <button
                      v-for="tab in ['goods', 'locations', 'employees']"
                      :key="tab"
                      @click="activeGuideTab = tab"
                      :class="[
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
                        activeGuideTab === tab
                          ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
                      ]"
                    >
                      {{ tab === 'goods' ? 'Nama Barang (Merek)' : tab === 'locations' ? 'Lokasi Gudang *' : 'PIC Karyawan *' }}
                    </button>
                  </div>
                </div>

                <div class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                  <table class="w-full text-xs">
                    <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">#</th>
                        <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Nama Referensi di Sistem</th>
                        <th class="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      <template v-if="activeGuideTab === 'goods'">
                        <tr v-for="(g, idx) in goodsList" :key="g.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td class="px-4 py-2 text-gray-400 font-mono">{{ idx + 1 }}</td>
                          <td class="px-4 py-2 font-bold text-gray-800 dark:text-gray-200">{{ g.good_name }} {{ g.merk ? `(${g.merk})` : '' }}</td>
                          <td class="px-4 py-2 font-mono text-[10px] text-gray-500">{{ g.good_code }}</td>
                        </tr>
                      </template>
                      <template v-else-if="activeGuideTab === 'locations'">
                        <tr v-for="(l, idx) in locationsList" :key="l.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td class="px-4 py-2 text-gray-400 font-mono">{{ idx + 1 }}</td>
                          <td class="px-4 py-2 font-bold text-gray-800 dark:text-gray-200">{{ l.location_name }}</td>
                          <td class="px-4 py-2 text-gray-500">{{ l.code_location || '-' }}</td>
                        </tr>
                      </template>
                      <template v-else>
                        <tr v-for="(e, idx) in employeesList" :key="e.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td class="px-4 py-2 text-gray-400 font-mono">{{ idx + 1 }}</td>
                          <td class="px-4 py-2 font-bold text-gray-800 dark:text-gray-200">{{ e.fullName }}</td>
                          <td class="px-4 py-2 text-gray-500 font-mono text-[10px]">{{ e.employeeNumber || '-' }}</td>
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
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-500/10'
                    : 'border-gray-200 dark:border-gray-800 hover:border-teal-400 bg-gray-50/50 dark:bg-gray-900/40'
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

                <div class="p-3 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <UploadCloud class="w-8 h-8" />
                </div>
                <div class="space-y-1">
                  <p class="font-bold text-sm text-gray-800 dark:text-gray-200">
                    {{ selectedFile ? selectedFile.name : 'Tarik & Lepas File Excel / CSV Stok di sini' }}
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
                  class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{{ isPreviewing ? 'Memverifikasi Data...' : 'Verifikasi & Preview &rarr;' }}</span>
                </button>
              </div>
            </div>

            <!-- STEP 3: Preview & Validation -->
            <div v-else-if="currentStep === 3" class="space-y-6">
              <!-- Stock Type Banner -->
              <div :class="[
                'p-3.5 rounded-xl border flex items-center justify-between',
                stockCategory === 'biasa'
                  ? 'bg-teal-50/70 border-teal-200 dark:bg-teal-500/10 dark:border-teal-500/30 text-teal-900 dark:text-teal-300'
                  : 'bg-amber-50/70 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 text-amber-900 dark:text-amber-300'
              ]">
                <div class="flex items-center gap-2">
                  <div :class="['p-1.5 rounded-lg text-white', stockCategory === 'biasa' ? 'bg-teal-600' : 'bg-amber-600']">
                    <DollarSign v-if="stockCategory === 'biasa'" class="w-4 h-4" />
                    <PackageX v-else class="w-4 h-4" />
                  </div>
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider block opacity-75">Target Tipe Import Stok</span>
                    <span class="text-xs font-black">
                      {{ stockCategory === 'biasa' ? 'Stok Biasa (Bernilai / Valued)' : 'Stok Balikan / Return (Unvalued / Harga Rp 0)' }}
                    </span>
                  </div>
                </div>
                <span :class="[
                  'px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide',
                  stockCategory === 'biasa'
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                ]">
                  {{ stockCategory === 'biasa' ? 'Persediaan Bernilai' : 'Barang Return / Reject' }}
                </span>
              </div>

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
                      <th class="px-3 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Baris</th>
                      <th class="px-3 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Nama Barang</th>
                      <th class="px-3 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Tipe Stok</th>
                      <th class="px-3 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Lokasi</th>
                      <th class="px-3 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">PIC</th>
                      <th class="px-3 py-2.5 text-center font-bold text-gray-700 dark:text-gray-300">Stok Awal</th>
                      <th class="px-3 py-2.5 text-right font-bold text-gray-700 dark:text-gray-300">Harga Satuan</th>
                      <th class="px-3 py-2.5 text-left font-bold text-gray-700 dark:text-gray-300">Status</th>
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
                      <td class="px-3 py-2 text-gray-400 font-mono font-bold">{{ row.rowNum }}</td>
                      <td class="px-3 py-2 font-bold text-gray-800 dark:text-gray-200">
                        {{ row.good_name }}
                        <span v-if="row.merk" class="text-gray-400 font-normal text-[11px]">({{ row.merk }})</span>
                      </td>
                      <td class="px-3 py-2">
                        <span :class="['inline-flex px-2 py-0.5 rounded text-[10px] font-bold', tipeStokBadgeClass(row.tipe)]">
                          {{ tipeStokLabel(row.tipe) }}
                        </span>
                      </td>
                      <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ row.location_name }}</td>
                      <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ row.pic_name }}</td>
                      <td class="px-3 py-2 text-center font-bold text-gray-900 dark:text-white">{{ row.qty_initial }}</td>
                      <td class="px-3 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                        Rp {{ (row.unit_cost ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 4 }) }}
                      </td>
                      <td class="px-3 py-2">
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
  Boxes,
  X,
  Check,
  Download,
  BookOpen,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  PackageX
} from 'lucide-vue-next'
import { StockService } from '../stock.service'
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

const stockCategory = ref('biasa') // 'biasa' (Stok Biasa) | 'retur' (Stok Balikan) — dikirim langsung sebagai query param `tipe`
const activeGuideTab = ref('goods')
const goodsList = ref([])
const locationsList = ref([])
const employeesList = ref([])

const isDownloading = ref(false)
const isDragging = ref(false)
const selectedFile = ref(null)
const fileInput = ref(null)
const isPreviewing = ref(false)
const isExecuting = ref(false)

const previewRows = ref([])
const previewSummary = ref({ totalRows: 0, validRows: 0, errorRows: 0 })

const TIPE_STOK_LABELS = { biasa: 'Stok Biasa', opening: 'Stok Opening', parfum: 'Parfum', retur: 'Stok Return' }
const TIPE_STOK_BADGE_CLASSES = {
  biasa: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300',
  opening: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300',
  parfum: 'bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300',
  retur: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
}
const tipeStokLabel = (tipe) => TIPE_STOK_LABELS[tipe] || tipe
const tipeStokBadgeClass = (tipe) => TIPE_STOK_BADGE_CLASSES[tipe] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'

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
    const [goodsRes, locRes, empRes] = await Promise.all([
      axios.get('/goods', { params: { limit: 100 } }),
      axios.get('/locations', { params: { is_active: true } }),
      axios.get('/users', { params: { is_active: true } })
    ])
    goodsList.value = goodsRes.data?.data || goodsRes.data || []
    locationsList.value = locRes.data?.data || locRes.data || []
    employeesList.value = (empRes.data?.data || empRes.data || []).map(e => ({
      ...e,
      fullName: e.fullName || e.full_name || e.name || '-'
    }))
  } catch (error) {
    console.error('Failed fetching stock dictionaries:', error)
  }
}

const handleDownloadTemplate = async () => {
  try {
    isDownloading.value = true
    const tipe = stockCategory.value
    const isValued = tipe !== 'retur'
    const blob = await StockService.downloadImportTemplate(tipe)
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    const fileName = isValued ? 'Template_Import_Stok_Biasa.xlsx' : 'Template_Import_Stok_Balikan_Return.xlsx'
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    Alert.toast('Berhasil', `Template ${isValued ? 'Stok Biasa' : 'Stok Balikan'} berhasil diunduh`, 'success')
  } catch (error) {
    Alert.error('Gagal', 'Gagal mengunduh template import stok')
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
    const res = await StockService.previewImport(selectedFile.value, stockCategory.value)
    previewRows.value = res.rows || []
    previewSummary.value = res.summary || { totalRows: 0, validRows: 0, errorRows: 0 }
    currentStep.value = 3
  } catch (error) {
    Alert.error('Gagal', 'Gagal memverifikasi file import stok')
  } finally {
    isPreviewing.value = false
  }
}

const handleExecute = async () => {
  try {
    isExecuting.value = true
    const isValued = stockCategory.value !== 'retur'
    await StockService.executeImport(previewRows.value, stockCategory.value)
    Alert.success('Berhasil!', `Berhasil meng-import ${previewSummary.value.validRows} data ${isValued ? 'stok biasa' : 'stok balikan (return)'}!`)
    emit('imported')
    close()
  } catch (error) {
    Alert.error('Gagal!', error.response?.data?.message || 'Gagal menyimpan data import stok')
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

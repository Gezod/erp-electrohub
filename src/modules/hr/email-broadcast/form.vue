<template>
  <AdminLayout>
    <div class="mx-auto max-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="router.back()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <ArrowLeft class="w-6 h-6 text-gray-500" />
        </button>
        <div class="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20">
          <Mail class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">Email Broadcast</h2>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest italic">HR • Kirim Dokumen via Email (Resend)</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- ── LEFT: Form ── -->
        <div class="xl:col-span-2 space-y-6">

          <!-- Step 1: Upload Excel -->
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div class="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 rounded-t-3xl flex items-center gap-3">
              <div class="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-black">1</div>
              <h3 class="text-base font-black text-gray-800 dark:text-white">Upload File Excel</h3>
            </div>
            <div class="p-8 space-y-4">
              <p class="text-xs text-gray-400 font-medium leading-relaxed">
                Upload file <code class="bg-violet-50 dark:bg-violet-900/20 text-violet-600 px-1.5 py-0.5 rounded font-mono text-[10px]">.xlsx</code> dengan kolom:
                <code class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono text-[10px]">nama</code>,
                <code class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono text-[10px]">email</code>,
                <code class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono text-[10px]">nama_file</code>
              </p>

              <div @click="triggerExcelInput" @dragover.prevent="excelDragOver = true" @dragleave.prevent="excelDragOver = false" @drop.prevent="handleExcelDrop"
                :class="[
                  'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300',
                  excelDragOver ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10 scale-[1.01]' : 'border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:bg-violet-50/30'
                ]">
                <input ref="excelInputRef" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleExcelSelect" />
                <div v-if="!excelFile" class="flex flex-col items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/20 text-violet-500 flex items-center justify-center">
                    <FileSpreadsheet class="w-7 h-7" />
                  </div>
                  <p class="text-sm font-bold text-gray-600 dark:text-gray-300">Klik atau drag & drop file Excel</p>
                  <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold">.XLSX / .XLS / .CSV</p>
                </div>
                <div v-else class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
                      <FileCheck class="w-6 h-6" />
                    </div>
                    <div class="text-left">
                      <p class="text-sm font-bold text-gray-700 dark:text-gray-200">{{ excelFile.name }}</p>
                      <p class="text-[10px] text-gray-400 font-mono">{{ formatFileSize(excelFile.size) }}</p>
                    </div>
                  </div>
                  <button @click.stop="removeExcel" class="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                    <X class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button v-if="excelFile && !previewData" @click="handlePreview" :disabled="isPreviewing"
                class="px-6 py-3 bg-violet-100 dark:bg-violet-900/20 text-violet-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-violet-200 transition-all disabled:opacity-50">
                <span v-if="isPreviewing" class="flex items-center gap-2">
                  <Loader2 class="w-4 h-4 animate-spin" /> Membaca Excel...
                </span>
                <span v-else class="flex items-center gap-2">
                  <Eye class="w-4 h-4" /> Preview Data
                </span>
              </button>

              <!-- Preview Table -->
              <div v-if="previewData" class="space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Preview Penerima ({{ previewData.total }} data)
                  </p>
                  <button @click="previewData = null; excelFile = null" class="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">
                    Ganti File
                  </button>
                </div>
                <div class="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="bg-gray-50 dark:bg-gray-800/50">
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">#</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama File</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in previewData.recipients.slice(0, 20)" :key="idx"
                        class="border-t border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td class="px-4 py-2.5 text-xs text-gray-400 font-mono">{{ idx + 1 }}</td>
                        <td class="px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">{{ row.nama }}</td>
                        <td class="px-4 py-2.5 text-gray-500 font-mono text-xs">{{ row.email }}</td>
                        <td class="px-4 py-2.5">
                          <span class="inline-flex items-center gap-1.5 px-2 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-lg text-[10px] font-bold">
                            <FileText class="w-3 h-3" /> {{ row.nama_file }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div v-if="previewData.total > 20" class="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 text-center">
                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">... dan {{ previewData.total - 20 }} data lainnya</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Upload Documents -->
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div class="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 rounded-t-3xl flex items-center gap-3">
              <div class="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-black">2</div>
              <h3 class="text-base font-black text-gray-800 dark:text-white">Upload Dokumen Lampiran</h3>
            </div>
            <div class="p-8 space-y-4">
              <p class="text-xs text-gray-400 font-medium leading-relaxed">
                Upload semua file dokumen. Nama file harus <span class="font-bold text-gray-600 dark:text-gray-300">sama persis</span> dengan kolom <code class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono text-[10px]">nama_file</code> di Excel.
              </p>

              <div @click="triggerDocsInput" @dragover.prevent="docsDragOver = true" @dragleave.prevent="docsDragOver = false" @drop.prevent="handleDocsDrop"
                :class="[
                  'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300',
                  docsDragOver ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10 scale-[1.01]' : 'border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:bg-violet-50/30'
                ]">
                <input ref="docsInputRef" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip" class="hidden" @change="handleDocsSelect" />
                <div class="flex flex-col items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/20 text-violet-500 flex items-center justify-center">
                    <Upload class="w-7 h-7" />
                  </div>
                  <p class="text-sm font-bold text-gray-600 dark:text-gray-300">Klik atau drag & drop file dokumen</p>
                  <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold">PDF, DOCX, XLSX, JPG, PNG, ZIP (Max 50MB/file)</p>
                </div>
              </div>

              <div v-if="documentFiles.length > 0" class="space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Dokumen Terupload ({{ documentFiles.length }})
                  </p>
                  <button @click="documentFiles = []" class="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Hapus Semua</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div v-for="(doc, idx) in documentFiles" :key="idx"
                    class="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                    <div class="flex items-center gap-3 overflow-hidden">
                      <div class="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/20 text-violet-500 flex items-center justify-center shrink-0">
                        <FileText class="w-4 h-4" />
                      </div>
                      <div class="overflow-hidden">
                        <p class="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{{ doc.name }}</p>
                        <p class="text-[10px] text-gray-400 font-mono">{{ formatFileSize(doc.size) }}</p>
                      </div>
                    </div>
                    <button @click="removeDocument(idx)" class="p-1.5 text-gray-300 hover:text-rose-500 transition-colors shrink-0">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Email Content -->
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div class="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 rounded-t-3xl flex items-center gap-3">
              <div class="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-black">3</div>
              <h3 class="text-base font-black text-gray-800 dark:text-white">Konten Email</h3>
            </div>
            <div class="p-8 space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subjek Email *</label>
                <input v-model="form.subject" type="text" placeholder="Misal: Slip Gaji Mei 2026 — ElectroHub"
                  class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition text-sm font-bold" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Isi Email *</label>
                <p class="text-[10px] text-gray-400 font-medium italic mb-2">Gunakan <code class="bg-violet-50 text-violet-600 px-1 rounded font-mono" v-pre>{{nama}}</code> untuk nama penerima.</p>
                <textarea v-model="form.body" rows="6" placeholder="Halo {{nama}},&#10;&#10;Berikut kami lampirkan dokumen untuk Anda.&#10;&#10;Terima kasih."
                  class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition text-sm leading-relaxed resize-none">
                </textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- ── RIGHT: Preview & Actions ── -->
        <div class="space-y-6">
          <!-- Summary Card -->
          <div class="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-8 rounded-[2rem] shadow-xl shadow-violet-500/20 relative overflow-hidden">
            <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div class="relative z-10 space-y-4">
              <p class="text-[10px] font-black text-white/50 uppercase tracking-widest">Ringkasan Broadcast</p>
              <div class="space-y-4">
                <div>
                  <p class="text-[9px] text-white/40 uppercase font-black tracking-[0.15em]">File Excel</p>
                  <p class="text-sm font-bold text-white/95">{{ excelFile ? excelFile.name : '—' }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-[9px] text-white/40 uppercase font-black tracking-[0.15em]">Penerima</p>
                    <p class="text-2xl font-black">{{ previewData?.total || 0 }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] text-white/40 uppercase font-black tracking-[0.15em]">Dokumen</p>
                    <p class="text-2xl font-black">{{ documentFiles.length }}</p>
                  </div>
                </div>
                <div>
                  <p class="text-[9px] text-white/40 uppercase font-black tracking-[0.15em]">Subjek</p>
                  <p class="text-xs font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded-lg inline-block mt-1">{{ form.subject || '—' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ── PROGRESS CARD (saat sedang broadcast) ── -->
          <div v-if="batchStatus" class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-[10px] font-black uppercase tracking-widest"
                :class="batchStatus.status === 'completed' ? 'text-emerald-600' : 'text-violet-600'">
                {{ batchStatus.status === 'completed' ? '✅ Broadcast Selesai' : '⏳ Sedang Mengirim...' }}
              </p>
              <p class="text-xs font-mono text-gray-400">{{ batchStatus.current_index }}/{{ batchStatus.total_count }}</p>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500 ease-out"
                :class="batchStatus.status === 'completed' ? 'bg-emerald-500' : 'bg-violet-500'"
                :style="{ width: batchStatus.progress_percent + '%' }">
              </div>
            </div>
            <p class="text-center text-xs font-black text-gray-500">{{ batchStatus.progress_percent }}%</p>

            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-3">
              <div class="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-center">
                <p class="text-lg font-black text-emerald-600">{{ batchStatus.sent_count }}</p>
                <p class="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest">Terkirim</p>
              </div>
              <div class="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl text-center">
                <p class="text-lg font-black text-rose-600">{{ batchStatus.fail_count }}</p>
                <p class="text-[9px] font-black text-rose-600/60 uppercase tracking-widest">Gagal</p>
              </div>
              <div class="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-center">
                <p class="text-lg font-black text-amber-600">{{ batchStatus.skip_count }}</p>
                <p class="text-[9px] font-black text-amber-600/60 uppercase tracking-widest">Dilewati</p>
              </div>
            </div>

            <!-- Detail Results (after completed) -->
            <div v-if="batchStatus.status === 'completed' && batchStatus.details" class="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div v-if="batchStatus.details.failed?.length > 0" class="space-y-2">
                <p class="text-[10px] font-black text-rose-500 uppercase tracking-widest">Detail Gagal</p>
                <div v-for="(item, idx) in batchStatus.details.failed" :key="'f'+idx"
                  class="px-3 py-2 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20 text-xs">
                  <p class="font-bold text-rose-700">{{ item.nama }} ({{ item.email }})</p>
                  <p class="text-rose-500 text-[10px] mt-0.5">{{ item.reason }}</p>
                </div>
              </div>
              <div v-if="batchStatus.details.skipped?.length > 0" class="space-y-2">
                <p class="text-[10px] font-black text-amber-500 uppercase tracking-widest">Detail Dilewati</p>
                <div v-for="(item, idx) in batchStatus.details.skipped" :key="'s'+idx"
                  class="px-3 py-2 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 text-xs">
                  <p class="font-bold text-amber-700">{{ item.nama }} — <span class="font-mono">{{ item.nama_file }}</span></p>
                  <p class="text-amber-500 text-[10px] mt-0.5">{{ item.reason }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- File Matching Status -->
          <div v-if="previewData && documentFiles.length > 0 && !batchStatus" class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-3">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Pencocokan File</p>
            <div class="space-y-2">
              <div v-for="(row, idx) in previewData.recipients.slice(0, 10)" :key="idx" class="flex items-center justify-between py-1.5">
                <span class="text-xs text-gray-600 dark:text-gray-400 truncate pr-2">{{ row.nama_file }}</span>
                <span v-if="isFileMatched(row.nama_file)" class="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                  <Check class="w-3.5 h-3.5" /> Match
                </span>
                <span v-else class="flex items-center gap-1 text-[10px] text-rose-500 font-bold">
                  <AlertCircle class="w-3.5 h-3.5" /> Missing
                </span>
              </div>
              <div v-if="previewData.recipients.length > 10" class="text-[10px] text-gray-400 font-bold text-center pt-1">
                ... dan {{ previewData.recipients.length - 10 }} lainnya
              </div>
            </div>
            <div class="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div class="text-[10px] font-black uppercase tracking-widest"
                :class="matchedCount === previewData.total ? 'text-emerald-600' : 'text-amber-500'">
                {{ matchedCount }}/{{ previewData.total }} Cocok
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button v-if="!batchStatus || batchStatus.status === 'completed'" @click="handleSubmit" :disabled="isSending || !isFormValid"
              class="w-full py-4 bg-violet-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-violet-500/25 hover:bg-violet-700 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="isSending" class="flex items-center justify-center gap-2">
                <Loader2 class="w-4 h-4 animate-spin" /> Mengupload File...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <Send class="w-4 h-4" /> Kirim Broadcast Email
              </span>
            </button>
            <button @click="router.back()"
              class="w-full py-4 bg-white dark:bg-gray-900 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 transition-all shadow-sm">
              {{ batchStatus?.status === 'completed' ? 'Kembali' : 'Batal' }}
            </button>
          </div>

          <!-- Tips -->
          <div v-if="!batchStatus" class="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-800">
            <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Pemberitahuan</p>
            <ul class="text-xs text-blue-700 dark:text-blue-400 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
              <li>Email dikirim via <span class="font-bold">Resend API</span> secara asinkron</li>
              <li>Setelah upload, proses berjalan di <span class="font-bold">background</span> — Anda bisa tetap di halaman ini untuk memantau progress</li>
              <li>Nama file di Excel harus <span class="font-bold">sama persis</span> dengan file yang diupload</li>
              <li v-pre>Gunakan <code class="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded text-[10px]">{{nama}}</code> di isi email untuk personalisasi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { ArrowLeft, Mail, Send, X, Upload, Eye, Check, AlertCircle, Loader2, FileText, FileSpreadsheet, FileCheck } from 'lucide-vue-next';
import { EmailBroadcastService } from './email-broadcast.service';
import { Alert } from '@/plugins/sweetalert';

const router = useRouter();

// ── Form State ─────────────────────────────────────────────────────────────────
const form = ref({
  subject: '',
  body: 'Halo {{nama}},\n\nBerikut kami lampirkan dokumen untuk Anda.\n\nTerima kasih,\nElectroHub',
});

// ── Excel File ─────────────────────────────────────────────────────────────────
const excelFile = ref(null);
const excelInputRef = ref(null);
const excelDragOver = ref(false);
const previewData = ref(null);
const isPreviewing = ref(false);

const triggerExcelInput = () => excelInputRef.value?.click();

const handleExcelSelect = (e) => {
  const file = e.target.files?.[0];
  if (file) { excelFile.value = file; previewData.value = null; }
};

const handleExcelDrop = (e) => {
  excelDragOver.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file && /\.(xlsx|xls|csv)$/i.test(file.name)) {
    excelFile.value = file; previewData.value = null;
  }
};

const removeExcel = () => {
  excelFile.value = null; previewData.value = null;
  if (excelInputRef.value) excelInputRef.value.value = '';
};

const handlePreview = async () => {
  if (!excelFile.value) return;
  isPreviewing.value = true;
  try {
    previewData.value = await EmailBroadcastService.previewExcel(excelFile.value);
  } catch (err) {
    Alert.error('Gagal Membaca Excel', err.response?.data?.message || 'Pastikan format file sesuai.');
  } finally { isPreviewing.value = false; }
};

// ── Document Files ─────────────────────────────────────────────────────────────
const documentFiles = ref([]);
const docsInputRef = ref(null);
const docsDragOver = ref(false);

const triggerDocsInput = () => docsInputRef.value?.click();
const handleDocsSelect = (e) => { documentFiles.value.push(...Array.from(e.target.files || [])); };
const handleDocsDrop = (e) => { docsDragOver.value = false; documentFiles.value.push(...Array.from(e.dataTransfer.files || [])); };
const removeDocument = (idx) => { documentFiles.value.splice(idx, 1); };

// ── File Matching ──────────────────────────────────────────────────────────────
const isFileMatched = (namaFile) => documentFiles.value.some((f) => f.name.toLowerCase() === namaFile.toLowerCase());
const matchedCount = computed(() => {
  if (!previewData.value) return 0;
  return previewData.value.recipients.filter((r) => isFileMatched(r.nama_file)).length;
});

// ── Validation ─────────────────────────────────────────────────────────────────
const isFormValid = computed(() => {
  return excelFile.value && previewData.value && previewData.value.total > 0
    && documentFiles.value.length > 0 && form.value.subject.length >= 3 && form.value.body.length >= 10;
});

// ── Submit & Polling ───────────────────────────────────────────────────────────
const isSending = ref(false);
const batchStatus = ref(null);
let pollInterval = null;

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  // Reset jika kirim ulang
  batchStatus.value = null;

  const unmatchedCount = previewData.value.total - matchedCount.value;
  let confirmText = `Email akan dikirim ke ${previewData.value.total} penerima secara background.`;
  if (unmatchedCount > 0) {
    confirmText += ` ${unmatchedCount} penerima tidak memiliki file yang cocok dan akan dilewati.`;
  }

  const confirmed = await Alert.confirm('Kirim Email Broadcast?', confirmText);
  if (!confirmed) return;

  isSending.value = true;
  try {
    const result = await EmailBroadcastService.sendBroadcast({
      excelFile: excelFile.value,
      documents: documentFiles.value,
      subject: form.value.subject,
      body: form.value.body,
    });

    Alert.toast('Broadcast dimulai — memproses di background...', 'info');

    // Mulai polling progress
    startPolling(result.batch_id);
  } catch (err) {
    Alert.error('Gagal Mengirim', err.response?.data?.message || 'Terjadi kesalahan saat mengirim broadcast email.');
  } finally {
    isSending.value = false;
  }
};

const startPolling = (batchId) => {
  // Poll setiap 2 detik
  pollInterval = setInterval(async () => {
    try {
      const status = await EmailBroadcastService.getBatchStatus(batchId);
      batchStatus.value = status;

      if (status.status === 'completed') {
        stopPolling();
        if (status.fail_count === 0 && status.skip_count === 0) {
          Alert.success('Broadcast Selesai!', `${status.sent_count} email berhasil terkirim.`);
        } else {
          Alert.warning('Broadcast Selesai', `Terkirim: ${status.sent_count} | Gagal: ${status.fail_count} | Dilewati: ${status.skip_count}`);
        }
      }
    } catch (err) {
      console.error('Polling error:', err);
      stopPolling();
    }
  }, 2000);
};

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

// Cleanup saat leave halaman
onBeforeUnmount(() => { stopPolling(); });

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};
</script>

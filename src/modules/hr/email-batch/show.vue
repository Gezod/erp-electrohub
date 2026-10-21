<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10" v-if="batch">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none mb-1">{{ batch.name }}</h2>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{{ batch.source }} &bull; {{ batch.subject }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 mb-6">
        <div class="flex items-center justify-between mb-4">
          <span :class="statusClass(progress.status)" class="px-3 py-1 rounded-full text-xs font-bold uppercase">{{ statusLabel(progress.status) }}</span>
          <span class="text-sm text-gray-500">{{ progress.percent }}% — {{ progress.sent + progress.failed }} dari {{ progress.total }} diproses</span>
        </div>
        <div class="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-6">
          <div class="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all" :style="{ width: `${progress.percent}%` }"></div>
        </div>
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center"><p class="text-2xl font-black text-gray-800 dark:text-white">{{ progress.total }}</p><p class="text-[10px] text-gray-400 uppercase font-bold">Total</p></div>
          <div class="text-center"><p class="text-2xl font-black text-emerald-600">{{ progress.sent }}</p><p class="text-[10px] text-gray-400 uppercase font-bold">Terkirim</p></div>
          <div class="text-center"><p class="text-2xl font-black text-rose-600">{{ progress.failed }}</p><p class="text-[10px] text-gray-400 uppercase font-bold">Gagal</p></div>
          <div class="text-center"><p class="text-2xl font-black text-amber-600">{{ progress.pending }}</p><p class="text-[10px] text-gray-400 uppercase font-bold">Antre</p></div>
        </div>
        <div v-if="progress.done && progress.failed > 0" class="flex justify-end gap-3 mt-6">
          <button @click="handleRetry" class="btn-outline"><RefreshCw class="w-4 h-4" /> Kirim Ulang yang Gagal ({{ progress.failed }})</button>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr class="text-left text-[11px] text-gray-500 uppercase tracking-wider">
                <th class="px-4 py-3">Nama</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Lampiran</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Keterangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="r in batch.recipients" :key="r.id">
                <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{{ r.name || '-' }}</td>
                <td class="px-4 py-3 text-gray-500">{{ r.email }}</td>
                <td class="px-4 py-3">
                  <a v-if="r.attachment_path" :href="attachmentUrl(r.id)" target="_blank" class="text-brand-500 hover:underline text-xs font-bold">{{ r.file_name || 'File' }}</a>
                  <span v-else-if="r.payroll_item_id" class="text-xs text-gray-400 italic">slip (auto-PDF)</span>
                  <span v-else class="text-xs text-amber-500 italic">file not matched</span>
                </td>
                <td class="px-4 py-3">
                  <span :class="recipientStatusClass(r.status)" class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{{ r.status }}</span>
                </td>
                <td class="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" :title="r.error">
                  {{ r.error || (r.sent_at ? dayjs(r.sent_at).format('DD MMM HH:mm') : '-') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { EmailBatchService } from './emailBatch.service'
import { ArrowLeft, RefreshCw } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const batch = ref(null)
const progress = ref({ status: 'pending', total: 0, sent: 0, failed: 0, pending: 0, percent: 0, done: false })
let pollTimer = null

const statusLabel = (s) => ({ pending: 'Menunggu', processing: 'Berjalan...', completed: 'Selesai', completed_with_errors: 'Selesai (Ada Gagal)' }[s] || s)
const statusClass = (s) =>
  ({
    pending: 'bg-gray-100 text-gray-500',
    processing: 'bg-indigo-50 text-indigo-600',
    completed: 'bg-emerald-50 text-emerald-600',
    completed_with_errors: 'bg-amber-50 text-amber-600',
  }[s] || 'bg-gray-100 text-gray-500')
const recipientStatusClass = (s) =>
  ({
    sent: 'bg-emerald-50 text-emerald-600',
    failed: 'bg-rose-50 text-rose-600',
    sending: 'bg-indigo-50 text-indigo-600',
    pending: 'bg-gray-100 text-gray-500',
  }[s] || 'bg-gray-100 text-gray-500')

const attachmentUrl = (recipientId) => EmailBatchService.attachmentUrl(route.params.id, recipientId)

const loadBatch = async () => {
  try {
    batch.value = await EmailBatchService.getOne(route.params.id, { limit: 100 })
  } catch (err) {
    Alert.error('Gagal memuat detail batch')
  }
}

const loadProgress = async () => {
  try {
    progress.value = await EmailBatchService.progress(route.params.id)
    if (progress.value.done && pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
      loadBatch()
    }
  } catch (err) {
    // ignore transient polling errors
  }
}

const handleRetry = async () => {
  try {
    const res = await EmailBatchService.retryFailed(route.params.id)
    Alert.success(res.message)
    startPolling()
  } catch (err) {
    Alert.error('Gagal mengirim ulang', err.response?.data?.message)
  }
}

const startPolling = () => {
  if (pollTimer) clearInterval(pollTimer)
  loadProgress()
  pollTimer = setInterval(loadProgress, 3000)
}

onMounted(async () => {
  await loadBatch()
  startPolling()
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

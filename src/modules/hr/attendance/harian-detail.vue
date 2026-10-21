<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10" v-if="data">
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none">{{ data.employee.full_name }}</h2>
              <span v-if="data.is_holiday" class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-600">Hari Libur</span>
            </div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{{ dayjs(data.date).format('dddd, DD MMMM YYYY') }}</p>
          </div>
        </div>
        <router-link :to="{ name: 'HrAttendanceHarianEdit', params: { employeeId: route.params.employeeId, date: route.params.date }, query: { session: nextSessionNumber } }" class="btn-primary">
          <Plus class="w-4 h-4" /> Tambah Sesi
        </router-link>
      </div>

      <div v-for="session in data.sessions" :key="session.session_number" class="mb-8">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xs font-black text-gray-500 uppercase tracking-widest">Sesi {{ session.session_number }}</h3>
          <router-link :to="{ name: 'HrAttendanceHarianEdit', params: { employeeId: route.params.employeeId, date: route.params.date }, query: { session: session.session_number } }" class="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
            <Edit class="w-3.5 h-3.5" /> Edit Sesi Ini
          </router-link>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-4">
            <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide flex items-center gap-2"><Sunrise class="w-4 h-4 text-amber-500" /> Datang</h3>
            <template v-if="session.datang">
              <span :class="statusPill(session.datang.status)" class="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase">{{ STATUS_LABEL[session.datang.status] || session.datang.status }}</span>
              <p v-if="session.datang.clock_time" class="text-3xl font-black text-gray-800 dark:text-white">{{ session.datang.clock_time }}</p>
              <p v-if="session.datang.is_late" class="text-rose-600 text-sm font-bold">Terlambat {{ session.datang.late_minutes }} Menit &bull; Potongan {{ formatCurrency(session.datang.late_deduction) }}</p>
              <p v-if="Number(session.datang.partial_leave_hours) > 0" class="text-amber-600 text-sm">Izin Sebagian: {{ session.datang.partial_leave_hours }} jam &bull; Potongan {{ formatCurrency(session.datang.partial_leave_deduction) }}<br/><span class="text-xs italic">{{ session.datang.partial_leave_reason }}</span></p>
              <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
                <p class="text-xs text-gray-400 mb-1">Lokasi Absen</p>
                <span :class="session.datang.is_outside_location ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-600'" class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                  {{ session.datang.is_outside_location ? 'Di Luar Lokasi' : 'Dalam Lokasi' }}
                </span>
                <span v-if="session.datang.distance_meters != null" class="text-xs text-gray-400 ml-2">{{ Number(session.datang.distance_meters).toFixed(0) }}m</span>
                <p v-if="session.datang.outside_location_reason" class="text-xs italic text-gray-500 mt-1">"{{ session.datang.outside_location_reason }}"</p>
                <a v-if="session.datang.latitude" :href="`https://maps.google.com/?q=${session.datang.latitude},${session.datang.longitude}`" target="_blank" class="text-[10px] text-brand-500 hover:underline">Lihat di Google Maps</a>
              </div>
              <img v-if="session.datang.photo_path" :src="session.datang.photo_path" @click="openPhoto(session.datang.photo_path, 'Foto Datang')" class="w-full rounded-xl border border-gray-100 dark:border-gray-800 mt-2 cursor-zoom-in hover:opacity-90 transition" />
              <p v-if="session.datang.notes" class="text-xs text-gray-500 italic">Catatan: {{ session.datang.notes }}</p>
              <p v-if="session.datang.edited_by_id" class="text-[10px] text-gray-400">Diedit &bull; {{ dayjs(session.datang.edited_at).format('DD MMM YYYY HH:mm') }}</p>
            </template>
            <p v-else class="text-sm text-gray-400 italic">Belum ada data absen datang.</p>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-4">
            <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide flex items-center gap-2"><Sunset class="w-4 h-4 text-indigo-500" /> Pulang</h3>
            <template v-if="session.pulang">
              <p class="text-3xl font-black text-gray-800 dark:text-white">{{ session.pulang.clock_time }}</p>
              <p v-if="session.pulang.is_early" class="text-amber-600 text-sm font-bold">Mendahului</p>
              <div v-if="session.pulang.is_overtime" class="text-indigo-600 text-sm">
                <span class="inline-flex items-center gap-1.5">
                  Lembur {{ session.pulang.overtime_hours }} jam
                  <span :class="overtimeStatusPill(session.pulang.overtime_status)" class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{{ session.pulang.overtime_status || 'diajukan' }}</span>
                </span>
                <br/><span class="text-xs italic">{{ session.pulang.overtime_reason }}</span>
                <span v-if="session.pulang.overtime_status === 'ditolak' && session.pulang.overtime_rejection_reason" class="block text-xs text-rose-500 not-italic">Alasan ditolak: {{ session.pulang.overtime_rejection_reason }}</span>
              </div>
              <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
                <p class="text-xs text-gray-400 mb-1">Lokasi Absen</p>
                <span :class="session.pulang.is_outside_location ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-600'" class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                  {{ session.pulang.is_outside_location ? 'Di Luar Lokasi' : 'Dalam Lokasi' }}
                </span>
                <span v-if="session.pulang.distance_meters != null" class="text-xs text-gray-400 ml-2">{{ Number(session.pulang.distance_meters).toFixed(0) }}m</span>
                <p v-if="session.pulang.outside_location_reason" class="text-xs italic text-gray-500 mt-1">"{{ session.pulang.outside_location_reason }}"</p>
              </div>
              <img v-if="session.pulang.photo_path" :src="session.pulang.photo_path" @click="openPhoto(session.pulang.photo_path, 'Foto Pulang')" class="w-full rounded-xl border border-gray-100 dark:border-gray-800 mt-2 cursor-zoom-in hover:opacity-90 transition" />
              <p v-if="session.pulang.notes" class="text-xs text-gray-500 italic">Catatan: {{ session.pulang.notes }}</p>
              <p v-if="session.pulang.edited_by_id" class="text-[10px] text-gray-400">Diedit &bull; {{ dayjs(session.pulang.edited_at).format('DD MMM YYYY HH:mm') }}</p>
            </template>
            <p v-else class="text-sm text-gray-400 italic">Belum ada data absen pulang.</p>
          </div>
        </div>
      </div>
    </div>
    <ImageModal v-model="photoModal" :src="photoSrc" :title="photoTitle" />
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ImageModal from '@/components/common/ImageModal.vue'
import { AttendanceService } from './attendance.service'
import { ArrowLeft, Edit, Plus, Sunrise, Sunset } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const data = ref(null)
const nextSessionNumber = computed(() => (data.value?.sessions?.length || 0) + 1)

const photoModal = ref(false)
const photoSrc = ref('')
const photoTitle = ref('Foto Absen')
const openPhoto = (src, title) => {
  photoSrc.value = src
  photoTitle.value = title
  photoModal.value = true
}

const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0)

const overtimeStatusPill = (s) => ({
  diajukan: 'bg-amber-50 text-amber-600',
  disetujui: 'bg-emerald-50 text-emerald-600',
  ditolak: 'bg-rose-50 text-rose-600',
}[s] || 'bg-amber-50 text-amber-600')

const STATUS_LABEL = { hadir: 'Hadir', izin: 'Izin', tidak_absen_masuk: 'Tidak Absen Masuk', belum_masuk: 'Belum Masuk' }
const statusPill = (s) => ({ hadir: 'bg-emerald-50 text-emerald-600', izin: 'bg-amber-50 text-amber-600', tidak_absen_masuk: 'bg-rose-50 text-rose-600', belum_masuk: 'bg-gray-100 text-gray-500' }[s] || 'bg-amber-50 text-amber-600')

onMounted(async () => {
  try {
    data.value = await AttendanceService.harianShow(route.params.employeeId, route.params.date)
  } catch (err) {
    Alert.error('Gagal memuat detail absen')
  }
})
</script>

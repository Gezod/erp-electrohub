<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10" v-if="summary">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none mb-1">{{ summary.full_name }}</h2>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{{ dayjs(period.start).format('DD MMM YYYY') }} — {{ dayjs(period.end).format('DD MMM YYYY') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Gaji Pokok</p>
          <p class="text-lg font-black text-gray-800 dark:text-white">{{ formatCurrency(summary.base_salary) }}</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Gaji Harian</p>
          <p class="text-lg font-black text-gray-800 dark:text-white">{{ formatCurrency(summary.gaji_harian) }}</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Hari Kerja</p>
          <p class="text-lg font-black text-gray-800 dark:text-white">{{ summary.hari_kerja }} hari</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Jam Lembur</p>
          <p class="text-lg font-black text-gray-800 dark:text-white">{{ summary.total_jam_lembur }} jam ({{ formatCurrency(summary.total_lembur_rupiah) }})</p>
        </div>
        <div class="bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-800/50 p-5">
          <p class="text-[10px] text-rose-500 font-bold uppercase tracking-widest mb-1">Potongan Telat</p>
          <p class="text-lg font-black text-rose-600">{{ formatCurrency(summary.total_potongan_telat) }}</p>
        </div>
        <div class="bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-800/50 p-5">
          <p class="text-[10px] text-rose-500 font-bold uppercase tracking-widest mb-1">Potongan Izin</p>
          <p class="text-lg font-black text-rose-600">{{ formatCurrency(summary.total_potongan_izin) }}</p>
        </div>
        <div class="col-span-2 bg-brand-500/10 rounded-2xl border border-brand-500/20 p-5">
          <p class="text-[10px] text-brand-600 font-bold uppercase tracking-widest mb-1">Estimasi Gaji (Kotor)</p>
          <p class="text-2xl font-black text-brand-600">{{ formatCurrency(summary.estimasi_gaji) }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Riwayat Absensi</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr class="text-left text-[11px] text-gray-500 uppercase tracking-wider">
                <th class="px-4 py-3">Tanggal</th>
                <th class="px-4 py-3">Jenis</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Waktu</th>
                <th class="px-4 py-3">Lembur</th>
                <th class="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="a in attendances" :key="a.id">
                <td class="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">{{ dayjs(a.attendance_date).format('DD MMM YYYY') }}</td>
                <td class="px-4 py-3 capitalize text-gray-500">{{ a.attendance_type }}</td>
                <td class="px-4 py-3">
                  <span :class="STATUS_PILL[a.status] || 'bg-amber-50 text-amber-600'" class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{{ STATUS_LABEL[a.status] || a.status }}</span>
                  <span v-if="a.is_late" class="ml-1 text-[10px] text-rose-500 font-bold">Telat</span>
                  <span v-if="a.is_early" class="ml-1 text-[10px] text-amber-500 font-bold">Mendahului</span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ a.clock_time || '-' }}</td>
                <td class="px-4 py-3 text-gray-500">
                  <template v-if="Number(a.overtime_hours) > 0">
                    {{ a.overtime_hours }} jam
                    <span
                      v-if="a.overtime_status"
                      :class="{
                        'bg-amber-50 text-amber-600': a.overtime_status === 'diajukan',
                        'bg-emerald-50 text-emerald-600': a.overtime_status === 'disetujui',
                        'bg-rose-50 text-rose-600': a.overtime_status === 'ditolak',
                      }"
                      class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    >{{ a.overtime_status }}</span>
                  </template>
                  <template v-else>-</template>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <router-link :to="{ name: 'HrAttendanceHarianDetail', params: { employeeId: route.params.employeeId, date: dayjs(a.attendance_date).format('YYYY-MM-DD') } }" class="text-xs font-bold text-brand-600 hover:underline">
                      Lihat Hari
                    </router-link>
                    <button v-if="a.photo_path" type="button" @click="openPhoto(a)" class="text-xs font-bold text-brand-500 hover:underline cursor-pointer">Foto</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!attendances.length">
                <td colspan="6" class="px-4 py-10 text-center text-gray-400 text-sm">Tidak ada data pada periode ini.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <ImageModal v-model="photoModal" :src="photoSrc" :title="photoTitle" />
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ImageModal from '@/components/common/ImageModal.vue'
import { AttendanceService } from './attendance.service'
import { ArrowLeft } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const summary = ref(null)
const attendances = ref([])
const period = ref({ start: dayjs().startOf('month'), end: dayjs().endOf('month') })

const photoModal = ref(false)
const photoSrc = ref('')
const photoTitle = ref('Foto Absen')
const openPhoto = (a) => {
  photoSrc.value = a.photo_path
  photoTitle.value = `Foto Absen — ${a.attendance_type} ${dayjs(a.attendance_date).format('DD MMM YYYY')}`
  photoModal.value = true
}

const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0)

const STATUS_LABEL = { hadir: 'Hadir', izin: 'Izin', tidak_absen_masuk: 'Tidak Absen Masuk', belum_masuk: 'Belum Masuk' }
const STATUS_PILL = {
  hadir: 'bg-emerald-50 text-emerald-600',
  izin: 'bg-amber-50 text-amber-600',
  tidak_absen_masuk: 'bg-rose-50 text-rose-600',
  belum_masuk: 'bg-gray-100 text-gray-500',
}

onMounted(async () => {
  try {
    const params = { start: route.query.start, end: route.query.end }
    const res = await AttendanceService.rekapShow(route.params.employeeId, params)
    summary.value = res.summary
    attendances.value = res.attendances
    period.value = res.period
  } catch (err) {
    Alert.error('Gagal memuat detail rekap')
  }
})
</script>

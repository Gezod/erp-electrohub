<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10" v-if="employee">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none">Detail Karyawan Training</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-4">
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center text-2xl font-black uppercase">
              {{ employee.full_name?.charAt(0) }}
            </div>
            <div>
              <h3 class="text-lg font-black text-gray-800 dark:text-white">{{ employee.full_name }}</h3>
              <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">{{ employee.position || '-' }} &bull; {{ employee.division?.name || 'Tanpa Divisi' }}</p>
            </div>
            <div class="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
              <div class="flex justify-between"><span class="text-gray-400">Panggilan</span><span class="font-semibold text-gray-700 dark:text-gray-200">{{ employee.nickname || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-400">Email</span><span class="font-semibold text-gray-700 dark:text-gray-200">{{ employee.email || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-400">Tgl Masuk</span><span class="font-semibold text-gray-700 dark:text-gray-200">{{ dayjs(employee.join_date).format('DD MMM YYYY') }}</span></div>
              <div class="flex justify-between"><span class="text-gray-400">Lokasi</span><span class="font-semibold text-gray-700 dark:text-gray-200">{{ employee.location?.name || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-400">Status</span><span :class="employee.is_active ? 'text-emerald-600' : 'text-gray-400'" class="font-bold">{{ employee.is_active ? 'Aktif' : 'Nonaktif' }}</span></div>
            </div>
            <div class="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
              <div class="flex justify-between"><span class="text-gray-400">Gaji Pokok</span><span class="font-bold text-gray-800 dark:text-white">{{ formatCurrency(employee.base_salary) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-400">Bank</span><span class="font-semibold text-gray-700 dark:text-gray-200">{{ employee.bank_name || '-' }} {{ employee.bank_account_number || '' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-400">A/N</span><span class="font-semibold text-gray-700 dark:text-gray-200">{{ employee.bank_account_holder || '-' }}</span></div>
            </div>
            <router-link :to="{ name: 'HrTrainingEmployeeEdit', params: { id: employee.id } }" class="btn-primary w-full mt-2">
              <Edit class="w-4 h-4" /> Edit Karyawan
            </router-link>
          </div>
        </div>

        <div class="lg:col-span-8">
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Riwayat Absen</h3>
              <p class="text-xs text-gray-400 mt-0.5">30 catatan terakhir</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
              <div v-for="tile in summaryTiles" :key="tile.label" class="px-5 py-4">
                <p class="text-2xl font-black text-gray-800 dark:text-white">{{ tile.value }}</p>
                <p class="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <span class="w-1.5 h-1.5 rounded-full" :class="tile.dot"></span>{{ tile.label }}
                </p>
              </div>
            </div>

            <div class="max-h-[32rem] overflow-auto">
              <table class="w-full text-sm">
                <thead class="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                  <tr class="text-left text-[11px] text-gray-500 uppercase tracking-wider">
                    <th class="px-4 py-3 font-bold border-b border-gray-100 dark:border-gray-800">Sesi</th>
                    <th class="px-4 py-3 font-bold border-b border-gray-100 dark:border-gray-800">Datang</th>
                    <th class="px-4 py-3 font-bold border-b border-gray-100 dark:border-gray-800">Pulang</th>
                    <th class="px-4 py-3 font-bold border-b border-gray-100 dark:border-gray-800">Durasi</th>
                    <th class="px-4 py-3 font-bold border-b border-gray-100 dark:border-gray-800">Keterangan</th>
                    <th class="px-4 py-3 font-bold border-b border-gray-100 dark:border-gray-800">Foto</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="day in groupedAttendances" :key="day.dateKey">
                    <tr class="bg-gray-50/70 dark:bg-gray-800/40 border-t-2 border-gray-100 dark:border-gray-800">
                      <td colspan="6" class="px-4 py-2">
                        <div class="flex items-center justify-between gap-3">
                          <span class="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {{ day.dateLabel }}
                            <span v-if="day.isHoliday" class="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-600">Libur</span>
                          </span>
                          <span class="shrink-0 text-[11px] text-gray-400">{{ day.sessions.length }} sesi</span>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-for="s in day.sessions"
                      :key="day.dateKey + '-' + s.n"
                      class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/30"
                    >
                      <td class="px-4 py-3 text-xs text-gray-400 whitespace-nowrap align-top">Sesi {{ s.n }}</td>

                      <td class="px-4 py-3 whitespace-nowrap align-top">
                        <template v-if="s.datang && s.datang.clock_time">
                          <span class="tabular-nums font-semibold text-gray-700 dark:text-gray-200">{{ jam(s.datang.clock_time) }}</span>
                          <span v-if="s.datang.is_late" class="block text-[10px] font-bold text-rose-600 normal-case">telat {{ s.datang.late_minutes }}m</span>
                        </template>
                        <span v-else class="text-gray-300">&ndash;</span>
                      </td>

                      <td class="px-4 py-3 whitespace-nowrap align-top">
                        <template v-if="s.pulang && s.pulang.clock_time">
                          <span class="tabular-nums font-semibold text-gray-700 dark:text-gray-200">{{ jam(s.pulang.clock_time) }}</span>
                          <span v-if="s.pulang.is_early" class="block text-[10px] font-bold text-amber-600 normal-case">mendahului</span>
                        </template>
                        <span v-else class="text-gray-300">&ndash;</span>
                      </td>

                      <td class="px-4 py-3 whitespace-nowrap align-top tabular-nums text-gray-500">{{ durasi(s.datang, s.pulang) || '–' }}</td>

                      <td class="px-4 py-3 align-top">
                        <div v-if="keteranganChips(s).length" class="flex flex-wrap items-center gap-1.5">
                          <span
                            v-for="chip in keteranganChips(s)"
                            :key="chip.key"
                            :class="chip.class"
                            :title="chip.title || null"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                          >
                            <component :is="chip.icon" v-if="chip.icon" class="w-3 h-3" />{{ chip.label }}
                          </span>
                        </div>
                      </td>

                      <td class="px-4 py-3 align-top">
                        <div class="flex items-center gap-1.5">
                          <button
                            v-if="s.datang && s.datang.photo_path"
                            type="button"
                            @click="openPhoto(s.datang.photo_path, `Foto Datang — ${day.dateLabel}`)"
                          >
                            <img :src="s.datang.photo_path" alt="Foto datang" class="w-7 h-7 rounded-lg object-cover border border-gray-200 dark:border-gray-700 hover:opacity-80 transition cursor-pointer" />
                          </button>
                          <button
                            v-if="s.pulang && s.pulang.photo_path"
                            type="button"
                            @click="openPhoto(s.pulang.photo_path, `Foto Pulang — ${day.dateLabel}`)"
                          >
                            <img :src="s.pulang.photo_path" alt="Foto pulang" class="w-7 h-7 rounded-lg object-cover border border-gray-200 dark:border-gray-700 hover:opacity-80 transition cursor-pointer" />
                          </button>
                          <span v-if="!(s.datang && s.datang.photo_path) && !(s.pulang && s.pulang.photo_path)" class="text-gray-300">&ndash;</span>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <tr v-if="!groupedAttendances.length">
                    <td colspan="6" class="px-6 py-16 text-center">
                      <div class="flex flex-col items-center gap-4">
                        <div class="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                          <Inbox class="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <div class="space-y-1">
                          <p class="text-sm font-bold text-gray-700 dark:text-gray-200">Belum ada riwayat absen</p>
                          <p class="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Data absen karyawan ini akan muncul di sini</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
import { TrainingEmployeeService } from './trainingEmployee.service'
import { ArrowLeft, Edit, Inbox, MapPinOff, FileText } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

const router = useRouter()
const route = useRoute()
const employee = ref(null)

const photoModal = ref(false)
const photoSrc = ref('')
const photoTitle = ref('Foto Absen')
const openPhoto = (src, label) => {
  photoSrc.value = src
  photoTitle.value = label || 'Foto Absen'
  photoModal.value = true
}

const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0)

// --- Riwayat absen: kelompokkan array ketukan (datang/pulang) jadi baris per sesi ---
const groupedAttendances = computed(() => {
  const list = employee.value?.attendances || []
  const byDate = new Map()
  for (const a of list) {
    const key = dayjs(a.attendance_date).format('YYYY-MM-DD')
    if (!byDate.has(key)) {
      byDate.set(key, {
        dateKey: key,
        dateLabel: dayjs(a.attendance_date).locale('id').format('dddd, DD MMM YYYY'),
        isHoliday: false,
        sessions: new Map(),
      })
    }
    const day = byDate.get(key)
    if (a.is_holiday) day.isHoliday = true
    if (!day.sessions.has(a.session_number)) {
      day.sessions.set(a.session_number, { n: a.session_number, datang: null, pulang: null })
    }
    const s = day.sessions.get(a.session_number)
    if (a.attendance_type === 'pulang') s.pulang = a
    else s.datang = a
  }
  // API sudah urut attendance_date desc -> Map menjaga urutan hari; sesi diurutkan naik
  return Array.from(byDate.values()).map((day) => ({
    ...day,
    sessions: Array.from(day.sessions.values()).sort((x, y) => x.n - y.n),
  }))
})

const absenSummary = computed(() => {
  const list = employee.value?.attendances || []
  return {
    hadir: list.filter((a) => a.status === 'hadir').length,
    terlambat: list.filter((a) => a.is_late).length,
    izin: list.filter((a) => a.status === 'izin').length,
    belumMasuk: list.filter((a) => a.status === 'belum_masuk').length,
    tidakAbsenMasuk: list.filter((a) => a.status === 'tidak_absen_masuk').length,
    luarLokasi: list.filter((a) => a.is_outside_location).length,
  }
})

const summaryTiles = computed(() => [
  { label: 'Hadir', value: absenSummary.value.hadir, dot: 'bg-emerald-500' },
  { label: 'Terlambat', value: absenSummary.value.terlambat, dot: 'bg-amber-500' },
  { label: 'Izin', value: absenSummary.value.izin, dot: 'bg-amber-500' },
  { label: 'Tidak Absen Masuk', value: absenSummary.value.tidakAbsenMasuk, dot: 'bg-rose-500' },
  { label: 'Belum Masuk', value: absenSummary.value.belumMasuk, dot: 'bg-gray-400' },
  { label: 'Di luar lokasi', value: absenSummary.value.luarLokasi, dot: 'bg-rose-500' },
])

const jam = (t) => (t ? String(t).slice(0, 5) : null)

const toMinutes = (t) => {
  if (!t) return null
  const [h, m] = String(t).split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}
const durasi = (datang, pulang) => {
  const a = toMinutes(datang?.clock_time)
  const b = toMinutes(pulang?.clock_time)
  if (a == null || b == null) return ''
  let diff = b - a
  if (diff < 0) diff += 24 * 60 // lintas tengah malam
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return h ? `${h}j ${m}m` : `${m}m`
}

const CHIP = {
  rose: 'bg-rose-50 text-rose-600',
  amber: 'bg-amber-50 text-amber-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  gray: 'bg-gray-100 text-gray-500',
}
const keteranganChips = (s) => {
  const punches = [s.datang, s.pulang].filter(Boolean)
  const chips = []
  for (const p of punches) {
    if (p.is_outside_location) {
      const dist = p.distance_meters != null ? ` · ${Number(p.distance_meters).toFixed(0)}m` : ''
      chips.push({ key: `luar-${p.id}`, label: `Di luar lokasi${dist}`, class: CHIP.rose, icon: MapPinOff, title: p.outside_location_reason })
    }
  }
  const lembur = punches.find((p) => p.is_overtime || Number(p.overtime_hours) > 0)
  if (lembur) chips.push({ key: `lembur-${lembur.id}`, label: `Lembur ${lembur.overtime_hours}j`, class: CHIP.indigo, icon: null, title: lembur.overtime_reason })
  if (punches.some((p) => p.status === 'izin')) chips.push({ key: `izin-${s.n}`, label: 'Izin', class: CHIP.amber, icon: null, title: '' })
  if (punches.some((p) => p.status === 'belum_masuk')) chips.push({ key: `belum-masuk-${s.n}`, label: 'Belum Masuk', class: CHIP.gray, icon: null, title: '' })
  if (punches.some((p) => p.status === 'tidak_absen_masuk')) chips.push({ key: `tidak-absen-masuk-${s.n}`, label: 'Tidak Absen Masuk', class: CHIP.rose, icon: null, title: '' })
  for (const p of punches) {
    if (p.notes) chips.push({ key: `note-${p.id}`, label: 'Catatan', class: CHIP.gray, icon: FileText, title: p.notes })
  }
  for (const p of punches) {
    if (p.edited_at) chips.push({ key: `edit-${p.id}`, label: 'Diedit', class: CHIP.gray, icon: null, title: `Diedit ${dayjs(p.edited_at).format('DD MMM YYYY HH:mm')}` })
  }
  return chips
}

onMounted(async () => {
  try {
    employee.value = await TrainingEmployeeService.getOne(route.params.id)
  } catch (err) {
    Alert.error('Gagal memuat detail karyawan')
  }
})
</script>

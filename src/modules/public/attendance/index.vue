<template>
  <FullScreenLayout>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-gray-950 text-white flex items-center justify-center font-black text-lg mb-3">HS</div>
          <h1 class="text-xl font-black text-gray-800">Absensi Karyawan Training</h1>
          <p class="text-sm text-gray-400">{{ today }} &bull; {{ clock }}</p>
        </div>

        <!-- Flash messages -->
        <div v-if="flashSuccess" class="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">{{ flashSuccess }}</div>
        <div v-if="flashError" class="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">{{ flashError }}</div>

        <!-- Banner hari libur -->
        <div v-if="isHolidayToday" class="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-sm font-semibold">
          &#128197; Hari ini terdeteksi LIBUR (Minggu/tanggal merah) — jam kerja dihitung sebagai lembur, bukan hari kerja penuh.
        </div>

        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <!-- STEP 1: SEARCH -->
          <div v-if="step === 'search'" class="space-y-4">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest">Cari nama Anda</label>
            <div class="flex gap-2">
              <input
                v-model="searchQuery"
                @keyup.enter="doSearch"
                type="text"
                placeholder="Ketik nama lengkap..."
                class="input-base"
              />
              <button @click="doSearch" :disabled="searching" class="btn-primary shrink-0 px-6">
                <Search class="w-4 h-4" />
              </button>
            </div>

            <div v-if="searchResults.length" class="space-y-2">
              <button
                v-for="r in searchResults"
                :key="r.id"
                @click="pilih(r)"
                type="button"
                class="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-brand-300 hover:bg-brand-50/40 transition-all text-left"
              >
                <div class="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold uppercase shrink-0">{{ r.nama.charAt(0) }}</div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-gray-800 truncate">{{ r.nama }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ r.posisi || '-' }} &bull; {{ r.divisi || '-' }}</p>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            </div>
            <p v-else-if="searched && !searching" class="text-sm text-gray-400 text-center py-4">{{ notFoundMessage }}</p>
          </div>

          <!-- STEP 2: CONFIRM -->
          <div v-else class="space-y-5">
            <div class="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
              <div class="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold uppercase shrink-0">{{ selected.nama.charAt(0) }}</div>
              <div class="min-w-0">
                <p class="font-bold text-gray-800 truncate">{{ selected.nama }}</p>
                <p class="text-xs text-gray-400 truncate">{{ selected.posisi || '-' }} &bull; {{ selected.divisi || '-' }}</p>
              </div>
            </div>

            <!-- GPS Status -->
            <div class="p-4 rounded-2xl border" :class="isLuarLokasi ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'">
              <div v-if="geo.status.value === 'loading'" class="text-sm text-gray-500">Mengaktifkan GPS…</div>
              <div v-else-if="geo.status.value === 'denied'" class="text-sm text-rose-600">Izin lokasi ditolak. Aktifkan GPS untuk melanjutkan.</div>
              <div v-else-if="geo.status.value === 'unsupported'" class="text-sm text-rose-600">Browser tidak mendukung geolocation.</div>
              <template v-else-if="geo.status.value === 'active'">
                <div class="flex items-center gap-2 mb-2">
                  <span :class="geo.accuracy.value <= 30 ? 'bg-emerald-500' : 'bg-amber-500'" class="w-2 h-2 rounded-full"></span>
                  <span class="text-xs font-bold text-gray-600">GPS aktif &plusmn;{{ Math.round(geo.accuracy.value) }}m</span>
                </div>
                <p v-if="!isLuarLokasi" class="text-sm font-semibold text-emerald-700">Anda di dalam lokasi absen ({{ Math.round(distance || 0) }}m)</p>
                <template v-else>
                  <p class="text-sm font-semibold text-rose-700 mb-2">Anda di luar lokasi absen (jarak {{ Math.round(distance || 0) }}m, maksimal {{ selected.location_radius }}m)</p>
                  <textarea v-model="alasanLuarLokasi" rows="2" placeholder="Alasan absen di luar lokasi (wajib)" class="input-base !h-auto resize-none p-3 text-sm"></textarea>
                </template>
              </template>
            </div>

            <!-- Jenis Absen -->
            <div class="grid grid-cols-2 gap-3">
              <button @click="jenis = 'datang'" type="button" :class="jenis === 'datang' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200'" class="py-3 rounded-2xl font-bold text-sm transition-all">
                &#9728;&#65039; Datang
              </button>
              <button @click="jenis = 'pulang'" type="button" :class="jenis === 'pulang' ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200'" class="py-3 rounded-2xl font-bold text-sm transition-all">
                &#127769; Pulang
              </button>
            </div>

            <!-- Datang: Status Kehadiran -->
            <div v-if="jenis === 'datang'">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Status Kehadiran</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="s in ['hadir', 'izin']" :key="s"
                  @click="statusKehadiran = s" type="button"
                  :class="statusKehadiran === s ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200'"
                  class="py-2.5 rounded-xl font-bold text-sm capitalize transition-all"
                >{{ s }}</button>
              </div>
            </div>

            <!-- Datang: Lembur sebelum shift — jumlah jam dihitung otomatis oleh server dari jam datang -->
            <template v-if="jenis === 'datang' && statusKehadiran === 'hadir'">
              <div class="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <p class="text-sm font-semibold text-indigo-800">
                  Perkiraan lembur: {{ perkiraanLemburDatang == null ? '—' : perkiraanLemburDatang + ' jam' }}
                </p>
                <p class="text-xs text-indigo-500 mt-1">
                  Dihitung otomatis dari jam datang Anda dan menunggu persetujuan HR. Jumlah jam final mengikuti perhitungan server.
                </p>
              </div>
              <div v-if="perluAlasanLemburDatang">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Alasan Lembur *</label>
                <textarea v-model="alasanLembur" rows="2" class="input-base !h-auto resize-none p-3 text-sm"></textarea>
              </div>
            </template>

            <!-- Foto Wajah -->
            <div v-if="perluFoto">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Foto Wajah *</label>
              <input type="file" accept="image/jpeg,image/png" capture="user" @change="onFotoChange" class="input-base !h-auto py-2" />
              <p v-if="photo.processing.value" class="text-xs text-gray-400 mt-1">Memproses foto…</p>
              <p v-else-if="fotoFile" class="text-xs text-emerald-600 mt-1 font-semibold">Foto siap ({{ Math.round(fotoFile.size / 1024) }} KB)</p>
            </div>

            <!-- Pulang: Lembur — jumlah jam dihitung otomatis oleh server dari jam pulang -->
            <template v-if="jenis === 'pulang'">
              <div class="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <p class="text-sm font-semibold text-indigo-800">
                  Perkiraan lembur: {{ perkiraanLembur == null ? '—' : perkiraanLembur + ' jam' }}
                </p>
                <p class="text-xs text-indigo-500 mt-1">
                  Dihitung otomatis dari jam pulang Anda dan menunggu persetujuan HR. Jumlah jam final mengikuti perhitungan server.
                </p>
              </div>
              <div v-if="perluAlasanLembur">
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Alasan Lembur *</label>
                <textarea v-model="alasanLembur" rows="2" class="input-base !h-auto resize-none p-3 text-sm"></textarea>
              </div>
            </template>

            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Catatan</label>
              <textarea v-model="catatan" rows="2" class="input-base !h-auto resize-none p-3 text-sm"></textarea>
            </div>

            <div class="flex gap-3 pt-2">
              <button @click="kembali" type="button" class="btn-outline flex-1 h-11">Kembali</button>
              <button @click="submit" :disabled="!canSubmit || submitting" class="btn-primary flex-1 h-11">
                {{ submitting ? 'Mengirim...' : `Kirim Absen ${jenis === 'datang' ? 'Datang' : 'Pulang'}` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { PublicAttendanceService } from './publicAttendance.service'
import { useGeolocation } from './composables/useGeolocation'
import { usePhotoCapture } from './composables/usePhotoCapture'
import { Search, ChevronRight } from 'lucide-vue-next'

const geo = useGeolocation()
const photo = usePhotoCapture()

const step = ref('search')
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const searched = ref(false)
const notFoundMessage = ref('Anda belum terdaftar sebagai karyawan training, silakan hubungi admin terlebih dahulu.')

const selected = ref(null)
const jenis = ref('datang')
const statusKehadiran = ref('hadir')
const alasanLuarLokasi = ref('')
const fotoFile = ref(null)
const alasanLembur = ref('')
const catatan = ref('')
const submitting = ref(false)

const flashSuccess = ref('')
const flashError = ref('')
const isHolidayToday = ref(false)
const checkOutMin = ref('17:00')
const checkInDeadline = ref('08:30')

const now = ref(new Date())
let clockTimer = null
const today = computed(() => now.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
const clock = computed(() => now.value.toLocaleTimeString('id-ID'))

const distance = computed(() => (selected.value ? geo.distanceTo(selected.value.location_lat, selected.value.location_lng) : null))
const isLuarLokasi = computed(() => {
  if (!selected.value || distance.value == null || !selected.value.location_radius) return false
  return distance.value > selected.value.location_radius
})
const perluFoto = computed(() => (jenis.value === 'datang' && statusKehadiran.value === 'hadir') || jenis.value === 'pulang')

// Perkiraan lembur di sisi klien — cuma petunjuk. Server yang menghitung nilai final
// (dan bisa menghanguskannya kalau telat masuk / pulang cepat / sesi tak lengkap).
// Hari libur butuh jam datang yang tidak tersedia di kiosk, jadi ditampilkan "—".
const perkiraanLembur = computed(() => {
  if (jenis.value !== 'pulang' || !checkOutMin.value) return null
  if (isHolidayToday.value) return null
  const [h, m] = checkOutMin.value.split(':').map(Number)
  const base = new Date(now.value)
  base.setHours(h, m, 0, 0)
  const menit = Math.floor((now.value - base) / 60000)
  return menit >= 60 ? Math.floor(menit / 60) : 0
})
const perluAlasanLembur = computed(
  () => jenis.value === 'pulang' && (isHolidayToday.value || (perkiraanLembur.value || 0) > 0)
)

// Perkiraan lembur sebelum shift — simetris dengan perkiraanLembur (sisi pulang), arah
// terbalik: jam datang lebih awal dari checkInDeadline. Tidak berlaku hari libur (hari
// libur sudah dihitung penuh di sisi pulang).
const perkiraanLemburDatang = computed(() => {
  if (jenis.value !== 'datang' || statusKehadiran.value !== 'hadir' || !checkInDeadline.value) return null
  if (isHolidayToday.value) return null
  const [h, m] = checkInDeadline.value.split(':').map(Number)
  const base = new Date(now.value)
  base.setHours(h, m, 0, 0)
  const menit = Math.floor((base - now.value) / 60000)
  return menit >= 60 ? Math.floor(menit / 60) : 0
})
const perluAlasanLemburDatang = computed(
  () => jenis.value === 'datang' && statusKehadiran.value === 'hadir' && (perkiraanLemburDatang.value || 0) > 0
)

const canSubmit = computed(() => {
  if (geo.latitude.value == null || geo.longitude.value == null) return false
  if (isLuarLokasi.value && !alasanLuarLokasi.value.trim()) return false
  if (perluFoto.value && !fotoFile.value) return false
  if (perluAlasanLembur.value && !alasanLembur.value.trim()) return false
  if (perluAlasanLemburDatang.value && !alasanLembur.value.trim()) return false
  return true
})

const doSearch = async () => {
  if (searchQuery.value.trim().length < 2) return
  searching.value = true
  searched.value = false
  flashError.value = ''
  try {
    const res = await PublicAttendanceService.cari(searchQuery.value.trim())
    searchResults.value = res.found ? res.data : []
    notFoundMessage.value = res.message || notFoundMessage.value
  } catch (err) {
    flashError.value = 'Terjadi kesalahan saat mencari data. Coba lagi.'
    searchResults.value = []
  } finally {
    searching.value = false
    searched.value = true
  }
}

const pilih = (r) => {
  selected.value = r
  step.value = 'confirm'
  jenis.value = new Date().getHours() < 14 ? 'datang' : 'pulang'
  statusKehadiran.value = 'hadir'
  alasanLuarLokasi.value = ''
  fotoFile.value = null
  alasanLembur.value = ''
  catatan.value = ''
  geo.start()
}

// Setelah sukses submit, form TIDAK kembali ke pencarian nama — supaya karyawan dengan
// beberapa sesi sehari (mis. tugas SOG keluar-masuk berkali-kali) bisa langsung absen
// sesi berikutnya tanpa cari nama ulang. "Kembali" dipakai kalau memang sudah selesai.
const siapkanSesiBerikutnya = () => {
  jenis.value = jenis.value === 'datang' ? 'pulang' : 'datang'
  statusKehadiran.value = 'hadir'
  alasanLuarLokasi.value = ''
  fotoFile.value = null
  alasanLembur.value = ''
  catatan.value = ''
}

const kembali = () => {
  geo.stop()
  step.value = 'search'
  selected.value = null
  flashSuccess.value = ''
  flashError.value = ''
}

const onFotoChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const dist = distance.value
  const lines = [
    `${selected.value.nama} · ${jenis.value.toUpperCase()}`,
    `Waktu: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' })}`,
    geo.latitude.value != null ? `Lokasi: ${geo.latitude.value.toFixed(6)}, ${geo.longitude.value.toFixed(6)}` : 'Lokasi: tidak tersedia',
    dist != null
      ? `Jarak ${Math.round(dist)} m · ${isLuarLokasi.value ? 'DI LUAR LOKASI' : 'DALAM LOKASI'} · Akurasi ±${Math.round(geo.accuracy.value || 0)} m`
      : '',
  ].filter(Boolean)
  try {
    fotoFile.value = await photo.compressAndWatermark(file, lines)
  } catch (err) {
    flashError.value = 'Gagal memproses foto, silakan coba lagi.'
  }
}

const submit = async () => {
  if (!canSubmit.value) return
  submitting.value = true
  flashError.value = ''
  try {
    const formData = new FormData()
    formData.append('training_employee_id', selected.value.id)
    formData.append('latitude', geo.latitude.value)
    formData.append('longitude', geo.longitude.value)
    formData.append('jenis_absen', jenis.value)
    if (jenis.value === 'datang') formData.append('status_kehadiran', statusKehadiran.value)
    if (isLuarLokasi.value) formData.append('alasan_luar_lokasi', alasanLuarLokasi.value)
    if (alasanLembur.value.trim()) {
      formData.append('alasan_lembur', alasanLembur.value.trim())
    }
    if (catatan.value) formData.append('catatan', catatan.value)
    if (fotoFile.value) formData.append('foto_wajah', fotoFile.value)

    const res = await PublicAttendanceService.absen(formData)
    flashSuccess.value = res.message
    siapkanSesiBerikutnya()
  } catch (err) {
    flashError.value = err.response?.data?.message || 'Gagal mengirim absen. Coba lagi.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
  PublicAttendanceService.holidayToday().then((res) => {
    isHolidayToday.value = !!res.is_holiday
    if (res.check_out_min) checkOutMin.value = res.check_out_min
    if (res.check_in_deadline) checkInDeadline.value = res.check_in_deadline
  })
})
onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10" v-if="loaded">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none mb-1">Edit Absen — {{ employee.full_name }} &bull; Sesi {{ sessionNumber }}</h2>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{{ dayjs(route.params.date).format('dddd, DD MMMM YYYY') }}</p>
        </div>
      </div>

      <div v-if="isHoliday" class="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-sm flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 shrink-0" /> Tanggal ini terdeteksi HARI LIBUR — telat/pulang cepat tidak dihitung, dan hari ini tidak menambah hari kerja di payroll (hanya jam lembur yang dibayar).
      </div>
      <div v-if="sudahFinal" class="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-sm flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 shrink-0" /> Tanggal ini sudah termasuk Payroll Run yang final — perubahan tidak otomatis mengubah slip yang sudah dibuat.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-5">
          <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Datang</h3>
          <div>
            <label class="section-label">Status Kehadiran</label>
            <select v-model="datang.status_kehadiran" class="input-base">
              <option :value="null">-- Tidak diubah --</option>
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
              <option value="tidak_absen_masuk">Tidak Absen Masuk</option>
            </select>
          </div>
          <div v-if="datang.status_kehadiran === 'tidak_absen_masuk'" class="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-sm flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 shrink-0" /> Tidak ada jam masuk — hari ini tidak dihitung sebagai hari kerja saat payroll di-generate.
          </div>
          <div v-if="datang.status_kehadiran !== 'tidak_absen_masuk'">
            <label class="section-label">Jam Absen</label>
            <input v-model="datang.jam_absen" type="time" class="input-base" />
          </div>
          <div v-if="datang.status_kehadiran === 'hadir'">
            <label class="section-label">Izin Sebagian (Jam)</label>
            <input v-model.number="datang.partial_leave_hours" type="number" step="0.5" min="0" max="8" class="input-base" />
          </div>
          <div v-if="datang.status_kehadiran !== 'tidak_absen_masuk' && Number(datang.partial_leave_hours) > 0">
            <label class="section-label">Alasan Izin Sebagian</label>
            <textarea v-model="datang.partial_leave_reason" rows="2" class="input-base !h-auto resize-none p-4"></textarea>
          </div>
          <template v-if="datang.status_kehadiran === 'hadir' && !isHoliday && sessionNumber === 1">
            <label class="flex items-center gap-2">
              <input v-model="datang.is_overtime" type="checkbox" class="w-4 h-4 rounded accent-brand-500" />
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Lembur Sebelum Shift</span>
            </label>
            <template v-if="datang.is_overtime">
              <div>
                <label class="section-label">Jam Lembur</label>
                <input v-model.number="datang.overtime_hours" type="number" step="0.5" min="1" max="24" class="input-base" />
              </div>
              <div>
                <label class="section-label">Alasan Lembur</label>
                <textarea v-model="datang.overtime_reason" rows="2" class="input-base !h-auto resize-none p-4"></textarea>
              </div>
              <p class="text-[11px] text-amber-600 flex items-center gap-1.5">
                <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
                Menyimpan perubahan mengembalikan lembur ke status <b>Diajukan</b> — perlu disetujui ulang di Persetujuan Lembur.
              </p>
            </template>
          </template>
          <div>
            <label class="section-label">Catatan</label>
            <textarea v-model="datang.notes" rows="2" class="input-base !h-auto resize-none p-4"></textarea>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-5">
          <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Pulang</h3>
          <div>
            <label class="section-label">Jam Absen</label>
            <input v-model="pulang.jam_absen" type="time" class="input-base" />
          </div>
          <label class="flex items-center gap-2">
            <input v-model="pulang.is_overtime" type="checkbox" :disabled="isHoliday" class="w-4 h-4 rounded accent-brand-500 disabled:opacity-60" />
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Lembur</span>
            <span v-if="isHoliday" class="text-xs font-bold text-amber-600">&bull; Wajib &mdash; tanggal libur</span>
          </label>
          <template v-if="pulang.is_overtime">
            <div>
              <label class="section-label">Jam Lembur</label>
              <input v-model.number="pulang.overtime_hours" type="number" step="0.5" min="1" max="24" class="input-base" />
            </div>
            <div>
              <label class="section-label">Alasan Lembur</label>
              <textarea v-model="pulang.overtime_reason" rows="2" class="input-base !h-auto resize-none p-4"></textarea>
            </div>
            <p class="text-[11px] text-amber-600 flex items-center gap-1.5">
              <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
              Menyimpan perubahan mengembalikan lembur ke status <b>Diajukan</b> — perlu disetujui ulang di Persetujuan Lembur.
            </p>
          </template>
          <div>
            <label class="section-label">Catatan</label>
            <textarea v-model="pulang.notes" rows="2" class="input-base !h-auto resize-none p-4"></textarea>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-4 mt-8">
        <button @click="router.back()" class="btn-outline px-8 h-11">Batal</button>
        <button @click="handleSubmit" :disabled="submitting" class="btn-primary px-12 h-11">
          {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { AttendanceService } from './attendance.service'
import { ArrowLeft, AlertTriangle } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const loaded = ref(false)
const submitting = ref(false)
const employee = ref(null)
const sudahFinal = ref(false)
const isHoliday = ref(false)
// Karyawan dengan tugas SOG dkk bisa absen berkali-kali sehari — nomor sesi lewat query
// ?session=N (dari tombol "Tambah Sesi" / "Edit Sesi Ini" di harian-detail.vue), default 1.
const sessionNumber = computed(() => Number(route.query.session) || 1)

const datang = reactive({
  status_kehadiran: null,
  jam_absen: '',
  partial_leave_hours: 0,
  partial_leave_reason: '',
  is_overtime: false,
  overtime_hours: 0,
  overtime_reason: '',
  notes: '',
})
const pulang = reactive({
  jam_absen: '',
  is_overtime: false,
  overtime_hours: 0,
  overtime_reason: '',
  notes: '',
})

const handleSubmit = async () => {
  if (
    pulang.jam_absen &&
    isHoliday.value &&
    (!pulang.overtime_hours || pulang.overtime_hours < 1 || !pulang.overtime_reason.trim())
  ) {
    Alert.error('Tanggal ini libur — jam lembur (min 1 jam) & alasan wajib diisi')
    return
  }
  if (
    datang.status_kehadiran === 'hadir' &&
    datang.is_overtime &&
    (!datang.overtime_hours || datang.overtime_hours < 1 || !datang.overtime_reason.trim())
  ) {
    Alert.error('Lembur sebelum shift — jam lembur (min 1 jam) & alasan wajib diisi')
    return
  }
  submitting.value = true
  try {
    const payload = { session_number: sessionNumber.value }
    if (datang.status_kehadiran) {
      const isTidakAbsenMasuk = datang.status_kehadiran === 'tidak_absen_masuk'
      payload.datang = {
        status_kehadiran: datang.status_kehadiran,
        jam_absen: isTidakAbsenMasuk ? null : datang.jam_absen,
        partial_leave_hours: isTidakAbsenMasuk ? 0 : datang.partial_leave_hours || 0,
        partial_leave_reason: isTidakAbsenMasuk ? null : datang.partial_leave_reason || null,
        is_overtime: isTidakAbsenMasuk ? false : datang.is_overtime,
        overtime_hours: !isTidakAbsenMasuk && datang.is_overtime ? datang.overtime_hours || 0 : 0,
        overtime_reason: !isTidakAbsenMasuk && datang.is_overtime ? datang.overtime_reason || null : null,
        notes: datang.notes || null,
      }
    }
    if (pulang.jam_absen) {
      payload.pulang = {
        jam_absen: pulang.jam_absen,
        is_overtime: pulang.is_overtime,
        overtime_hours: pulang.is_overtime ? pulang.overtime_hours || 0 : 0,
        overtime_reason: pulang.is_overtime ? pulang.overtime_reason || null : null,
        notes: pulang.notes || null,
      }
    }
    await AttendanceService.updateHarian(route.params.employeeId, route.params.date, payload)
    Alert.success('Data absen berhasil diperbarui')
    router.push({ name: 'HrAttendanceHarianDetail', params: { employeeId: route.params.employeeId, date: route.params.date } })
  } catch (err) {
    Alert.error('Gagal menyimpan perubahan', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const data = await AttendanceService.harianShow(route.params.employeeId, route.params.date)
    employee.value = data.employee
    sudahFinal.value = data.sudah_final
    isHoliday.value = data.is_holiday
    const session = data.sessions?.find((s) => s.session_number === sessionNumber.value)
    if (session?.datang) {
      Object.assign(datang, {
        status_kehadiran: session.datang.status === 'belum_masuk' ? null : session.datang.status,
        jam_absen: session.datang.clock_time?.slice(0, 5) || '',
        partial_leave_hours: Number(session.datang.partial_leave_hours) || 0,
        partial_leave_reason: session.datang.partial_leave_reason || '',
        is_overtime: session.datang.is_overtime || false,
        overtime_hours: Number(session.datang.overtime_hours) || 0,
        overtime_reason: session.datang.overtime_reason || '',
        notes: session.datang.notes || '',
      })
    }
    if (session?.pulang) {
      Object.assign(pulang, {
        jam_absen: session.pulang.clock_time?.slice(0, 5) || '',
        is_overtime: session.pulang.is_overtime,
        overtime_hours: Number(session.pulang.overtime_hours) || 0,
        overtime_reason: session.pulang.overtime_reason || '',
        notes: session.pulang.notes || '',
      })
    }
    // Tanggal libur: lembur wajib, checkbox dikunci menyala.
    if (isHoliday.value) pulang.is_overtime = true
  } catch (err) {
    Alert.error('Gagal memuat data absen')
  } finally {
    loaded.value = true
  }
})
</script>

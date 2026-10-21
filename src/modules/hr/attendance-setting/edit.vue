<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
          <Settings class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Pengaturan Absensi</h2>
          <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Aturan Jam & Payroll &bull; Human Resources</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8" v-if="loaded">
        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-6">
          <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Aturan Jam Absen</h3>
          <div>
            <label class="section-label">Jam Masuk Maksimal *</label>
            <input v-model="form.check_in_deadline" type="time" class="input-base" required />
          </div>
          <div>
            <label class="section-label">Jam Pulang Minimal *</label>
            <input v-model="form.check_out_min" type="time" class="input-base" required />
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-6">
          <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Potongan Keterlambatan</h3>
          <div>
            <label class="section-label">Tarif Potongan/Menit (Rp) *</label>
            <input
              :value="formatThousand(form.late_rate_per_minute)"
              @input="e => form.late_rate_per_minute = parseThousand(e.target.value)"
              type="text" inputmode="numeric" class="input-base" required
            />
          </div>
          <div>
            <label class="section-label">Batas Menit Tarif Per-Menit *</label>
            <input v-model.number="form.late_tier_minutes" type="number" min="1" max="180" class="input-base" required />
            <p class="text-[10px] text-gray-400 mt-1.5">Di atas batas ini, potongan dihitung per-jam (dibulatkan ke atas).</p>
          </div>
          <div>
            <label class="section-label">Masa Toleransi Karyawan Baru (hari)</label>
            <input v-model.number="form.new_employee_grace_days" type="number" min="0" max="365" class="input-base" />
          </div>
          <div>
            <label class="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input v-model="form.auto_no_checkin_enabled" type="checkbox" class="w-4 h-4 rounded accent-brand-500" />
              Aktifkan konversi otomatis Tidak Absen Masuk
            </label>
            <p class="text-[10px] text-gray-400 mt-1.5">Setiap hari kerja pukul 17:30 WIB, karyawan yang masih 'Belum Masuk' otomatis menjadi 'Tidak Absen Masuk'. Hari itu tidak dihitung sebagai hari kerja saat payroll di-generate, dan tidak dikenakan denda.</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-6">
          <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Manager HR & Tanda Tangan</h3>
          <div>
            <label class="section-label">Nama Kantor</label>
            <input v-model="form.office_name" type="text" class="input-base" />
          </div>
          <div>
            <label class="section-label">Nama Manager HR *</label>
            <input v-model="form.hrd_name" type="text" class="input-base" required />
          </div>
          <div>
            <label class="section-label">Tanda Tangan</label>
            <div v-if="form.hrd_signature_path && !removeSignature" class="mb-2 flex items-center gap-3">
              <img :src="form.hrd_signature_path" class="h-14 border border-gray-100 dark:border-gray-800 rounded-lg bg-white p-1" />
              <label class="flex items-center gap-1.5 text-xs text-rose-500 font-semibold cursor-pointer">
                <input v-model="removeSignature" type="checkbox" class="accent-rose-500" /> Hapus TTD
              </label>
            </div>
            <input type="file" accept="image/jpeg,image/png" class="input-base !h-auto py-2" @change="onSignatureChange" />
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-8">
        <button @click="handleSubmit" :disabled="submitting" class="btn-primary px-12 h-11">
          {{ submitting ? 'Menyimpan...' : 'Simpan Pengaturan' }}
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { AttendanceSettingService } from './attendanceSetting.service'
import { Settings } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import { formatThousand, parseThousand } from '@/utils/format'

const submitting = ref(false)
const loaded = ref(false)
const removeSignature = ref(false)
const signatureFile = ref(null)

const form = reactive({
  check_in_deadline: '08:30',
  check_out_min: '17:00',
  office_name: '',
  hrd_name: '',
  hrd_signature_path: null,
  late_rate_per_minute: 1000,
  late_tier_minutes: 30,
  new_employee_grace_days: 14,
  auto_no_checkin_enabled: false,
})

const onSignatureChange = (e) => {
  signatureFile.value = e.target.files[0] || null
  if (signatureFile.value) removeSignature.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('check_in_deadline', form.check_in_deadline)
    formData.append('check_out_min', form.check_out_min)
    formData.append('office_name', form.office_name)
    formData.append('hrd_name', form.hrd_name)
    formData.append('late_rate_per_minute', form.late_rate_per_minute)
    formData.append('late_tier_minutes', form.late_tier_minutes)
    formData.append('new_employee_grace_days', form.new_employee_grace_days)
    formData.append('auto_no_checkin_enabled', form.auto_no_checkin_enabled ? 'true' : 'false')
    formData.append('hapus_ttd', removeSignature.value ? 'true' : 'false')
    if (signatureFile.value) formData.append('hrd_ttd', signatureFile.value)

    await AttendanceSettingService.update(formData)
    Alert.success('Pengaturan berhasil disimpan')
    signatureFile.value = null
    removeSignature.value = false
  } catch (err) {
    Alert.error('Gagal menyimpan pengaturan', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const data = await AttendanceSettingService.get()
    Object.assign(form, {
      check_in_deadline: data.check_in_deadline,
      check_out_min: data.check_out_min,
      office_name: data.office_name,
      hrd_name: data.hrd_name,
      hrd_signature_path: data.hrd_signature_path,
      late_rate_per_minute: Number(data.late_rate_per_minute),
      late_tier_minutes: data.late_tier_minutes,
      new_employee_grace_days: data.new_employee_grace_days,
      auto_no_checkin_enabled: !!data.auto_no_checkin_enabled,
    })
  } catch (err) {
    Alert.error('Gagal memuat pengaturan')
  } finally {
    loaded.value = true
  }
})
</script>

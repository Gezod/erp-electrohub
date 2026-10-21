<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none mb-1">
            {{ isEdit ? 'Edit Karyawan Training' : 'Tambah Karyawan Training' }}
          </h2>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Absensi & Payroll &bull; Human Resources</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-6">
          <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Data Diri</h3>
          <div>
            <label class="section-label">Nama Lengkap *</label>
            <input v-model="form.full_name" type="text" class="input-base" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="section-label">Panggilan</label>
              <input v-model="form.nickname" type="text" class="input-base" />
            </div>
            <div>
              <label class="section-label">Posisi</label>
              <input v-model="form.position" type="text" class="input-base" />
            </div>
          </div>
          <div>
            <label class="section-label">Email <span class="italic font-normal normal-case text-gray-400">(untuk kirim slip gaji)</span></label>
            <input v-model="form.email" type="email" class="input-base" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="section-label">Divisi</label>
              <select v-model="form.division_id" class="input-base">
                <option :value="null">-- Tanpa Divisi --</option>
                <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
            <div>
              <label class="section-label">Lokasi Kerja *</label>
              <select v-model="form.location_id" class="input-base" required>
                <option value="" disabled>Pilih lokasi...</option>
                <option v-for="l in locations" :key="l.id" :value="l.id">
                  {{ l.setting_name ? `${l.setting_name} · ` : '' }}{{ l.name }} (Rad: {{ l.radius_meters }}m)
                </option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 items-end">
            <div>
              <label class="section-label">Tanggal Masuk *</label>
              <DatePicker v-model="form.join_date" />
            </div>
            <label class="flex items-center gap-2 h-11">
              <input v-model="form.is_active" type="checkbox" class="w-4 h-4 rounded accent-brand-500" />
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Karyawan Aktif</span>
            </label>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-6">
          <h3 class="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wide">Gaji & Rekening</h3>
          <p class="text-[10px] text-amber-600 font-bold uppercase tracking-widest italic">Data sensitif — tidak pernah tampil di form absen publik</p>
          <div>
            <label class="section-label">Gaji Pokok (Rp) *</label>
            <input
              :value="formatThousand(form.base_salary)"
              @input="e => form.base_salary = parseThousand(e.target.value)"
              type="text" inputmode="numeric" class="input-base" required
            />
            <p class="text-[10px] text-gray-400 mt-1.5">Gaji harian = pokok / 26. Lembur/jam = (pokok/26/8) &times; 1,5.</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="section-label">Jenis Bank</label>
              <input v-model="form.bank_name" type="text" class="input-base" placeholder="BCA" />
            </div>
            <div>
              <label class="section-label">No. Rekening</label>
              <input v-model="form.bank_account_number" type="text" class="input-base" />
            </div>
          </div>
          <div>
            <label class="section-label">Nama Pemilik Rekening</label>
            <input v-model="form.bank_account_holder" type="text" class="input-base" />
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-4 mt-8">
        <button @click="router.back()" class="btn-outline px-8 h-11">Batal</button>
        <button @click="handleSubmit" :disabled="submitting" class="btn-primary px-12 h-11">
          {{ submitting ? 'Menyimpan...' : isEdit ? 'Update Data' : 'Simpan Karyawan' }}
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import { TrainingEmployeeService } from './trainingEmployee.service'
import { AttendanceLocationService } from '../attendance-location/attendanceLocation.service'
import { DivisionService } from '@/modules/organization/divisions/division.service'
import { ArrowLeft } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import { formatThousand, parseThousand } from '@/utils/format'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const divisions = ref([])
const locations = ref([])

const form = reactive({
  full_name: '',
  email: '',
  nickname: '',
  position: '',
  division_id: null,
  location_id: '',
  join_date: dayjs().format('YYYY-MM-DD'),
  base_salary: 0,
  bank_name: '',
  bank_account_number: '',
  bank_account_holder: '',
  is_active: true,
})

const handleSubmit = async () => {
  if (!form.full_name || !form.location_id || !form.join_date || !form.base_salary) {
    Alert.error('Mohon lengkapi data wajib!')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await TrainingEmployeeService.update(route.params.id, form)
      Alert.success('Data karyawan berhasil diperbarui')
    } else {
      await TrainingEmployeeService.create(form)
      Alert.success('Karyawan training berhasil ditambahkan')
    }
    router.push({ name: 'HrTrainingEmployees' })
  } catch (err) {
    Alert.error('Gagal menyimpan data', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const [divRes, locRes] = await Promise.all([
      DivisionService.getAll({ limit: 200 }),
      AttendanceLocationService.getAllSimple(),
    ])
    divisions.value = divRes.data
    locations.value = locRes

    if (isEdit.value) {
      const data = await TrainingEmployeeService.getOne(route.params.id)
      Object.assign(form, {
        full_name: data.full_name,
        email: data.email || '',
        nickname: data.nickname || '',
        position: data.position || '',
        division_id: data.division_id,
        location_id: data.location_id,
        join_date: dayjs(data.join_date).format('YYYY-MM-DD'),
        base_salary: Number(data.base_salary),
        bank_name: data.bank_name || '',
        bank_account_number: data.bank_account_number || '',
        bank_account_holder: data.bank_account_holder || '',
        is_active: data.is_active,
      })
    }
  } catch (err) {
    Alert.error('Gagal memuat data form')
  }
})
</script>

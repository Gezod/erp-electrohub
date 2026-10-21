<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none">{{ isEdit ? 'Edit Denda Karyawan' : 'Input Denda Karyawan' }}</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-6">
          <div>
            <label class="section-label">Karyawan *</label>
            <select v-model="form.training_employee_id" class="input-base" required>
              <option value="" disabled>Pilih karyawan...</option>
              <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.full_name }}</option>
            </select>
          </div>

          <div v-if="activeFineTypes.length === 0" class="p-4 rounded-xl bg-amber-50 text-amber-700 text-sm">
            Belum ada jenis denda aktif.
            <router-link :to="{ name: 'HrFineTypeCreate' }" class="font-bold underline">Buat jenis denda</router-link>
          </div>
          <div v-else>
            <label class="section-label">Jenis Denda *</label>
            <select v-model="form.fine_type_id" class="input-base" required>
              <option value="" disabled>Pilih jenis denda...</option>
              <option v-for="f in activeFineTypes" :key="f.id" :value="f.id">{{ f.name }} — {{ formatCurrency(f.amount) }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="section-label">Tanggal Kejadian *</label>
              <DatePicker v-model="form.fine_date" />
            </div>
            <div>
              <label class="section-label">Jumlah (Qty) *</label>
              <input v-model.number="form.qty" type="number" min="1" max="99" class="input-base" required />
            </div>
          </div>

          <div>
            <label class="section-label">Catatan</label>
            <textarea v-model="form.notes" rows="3" class="input-base !h-auto resize-none p-4"></textarea>
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <button @click="router.back()" class="btn-outline px-8 h-11">Batal</button>
            <button @click="handleSubmit" :disabled="submitting" class="btn-primary px-8 h-11">
              {{ submitting ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </div>

        <div class="bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-800/50 p-6 space-y-4 h-fit">
          <p class="text-xs font-black text-rose-600 uppercase tracking-widest">Ringkasan</p>
          <div class="flex justify-between text-sm">
            <span class="text-rose-700/70">Nominal satuan</span>
            <span class="font-bold text-rose-800">{{ formatCurrency(selectedFineType?.amount || 0) }}</span>
          </div>
          <div class="flex justify-between text-sm pt-3 border-t border-rose-100">
            <span class="text-rose-700/70">Subtotal ({{ form.qty }}x)</span>
            <span class="font-black text-rose-700 text-lg">{{ formatCurrency(subtotal) }}</span>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import { EmployeeFineService } from './employeeFine.service'
import { FineTypeService } from '../fine-type/fineType.service'
import { TrainingEmployeeService } from '../training-employee/trainingEmployee.service'
import { ArrowLeft } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const employees = ref([])
const activeFineTypes = ref([])

const form = reactive({
  training_employee_id: '',
  fine_type_id: '',
  fine_date: dayjs().format('YYYY-MM-DD'),
  qty: 1,
  notes: '',
})

const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0)

const selectedFineType = computed(() => activeFineTypes.value.find((f) => f.id === form.fine_type_id))
const subtotal = computed(() => (Number(selectedFineType.value?.amount) || 0) * (Number(form.qty) || 0))

const handleSubmit = async () => {
  if (!form.training_employee_id || !form.fine_type_id || !form.fine_date || !form.qty) {
    Alert.error('Mohon lengkapi data wajib!')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await EmployeeFineService.update(route.params.id, form)
      Alert.success('Data denda berhasil diperbarui')
    } else {
      await EmployeeFineService.create(form)
      Alert.success('Denda karyawan berhasil dicatat')
    }
    router.push({ name: 'HrEmployeeFines' })
  } catch (err) {
    Alert.error('Gagal menyimpan data', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const [empRes, fineRes] = await Promise.all([
      TrainingEmployeeService.getAll({ limit: 500, is_active: true }),
      FineTypeService.getAllActive(),
    ])
    employees.value = empRes.data
    activeFineTypes.value = fineRes

    if (isEdit.value) {
      const data = await EmployeeFineService.getOne(route.params.id)
      Object.assign(form, {
        training_employee_id: data.training_employee_id,
        fine_type_id: data.fine_type_id,
        fine_date: dayjs(data.fine_date).format('YYYY-MM-DD'),
        qty: data.qty,
        notes: data.notes || '',
      })
    }
  } catch (err) {
    Alert.error('Gagal memuat data form')
  }
})
</script>

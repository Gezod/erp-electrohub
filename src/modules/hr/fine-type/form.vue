<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none">{{ isEdit ? 'Edit Denda' : 'Tambah Denda' }}</h2>
      </div>

      <div class="max-w-xl bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-6">
        <div>
          <label class="section-label">Nama Denda / Pelanggaran *</label>
          <input v-model="form.name" type="text" class="input-base" required />
        </div>
        <div>
          <label class="section-label">Nominal (Rp) *</label>
          <input
            :value="formatThousand(form.amount)"
            @input="e => form.amount = parseThousand(e.target.value)"
            type="text" inputmode="numeric" class="input-base" required
          />
        </div>
        <label class="flex items-center gap-2">
          <input v-model="form.is_active" type="checkbox" class="w-4 h-4 rounded accent-brand-500" />
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Aktif</span>
        </label>

        <div class="flex justify-end gap-4 pt-4">
          <button @click="router.back()" class="btn-outline px-8 h-11">Batal</button>
          <button @click="handleSubmit" :disabled="submitting" class="btn-primary px-8 h-11">
            {{ submitting ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { FineTypeService } from './fineType.service'
import { ArrowLeft } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import { formatThousand, parseThousand } from '@/utils/format'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)

const form = reactive({ name: '', amount: 0, is_active: true })

const handleSubmit = async () => {
  if (!form.name || form.amount == null) {
    Alert.error('Mohon lengkapi data wajib!')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await FineTypeService.update(route.params.id, form)
      Alert.success('Denda berhasil diperbarui')
    } else {
      await FineTypeService.create(form)
      Alert.success('Denda berhasil ditambahkan')
    }
    router.push({ name: 'HrFineTypes' })
  } catch (err) {
    Alert.error('Gagal menyimpan data', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const data = await FineTypeService.getOne(route.params.id)
      Object.assign(form, { name: data.name, amount: Number(data.amount), is_active: data.is_active })
    } catch (err) {
      Alert.error('Gagal memuat data')
    }
  }
})
</script>

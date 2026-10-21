<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useGanttStore } from './gantt.store'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const props = defineProps({
  boardId: {
    type: String,
    required: true,
  },
  milestone: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const ganttStore = useGanttStore()

const nameVal = ref('')
const descVal = ref('')
const targetDateVal = ref('')
const colorVal = ref('#000000')
const saving = ref(false)

const colors = ['#000000', '#333333', '#666666', '#999999', '#cccccc']

// Populate inputs if in edit mode
watch(() => props.milestone, (newVal) => {
  if (newVal) {
    nameVal.value = newVal.name || ''
    descVal.value = newVal.description || ''
    targetDateVal.value = newVal.target_date ? dayjs(newVal.target_date).format('YYYY-MM-DD') : ''
    colorVal.value = newVal.color || '#000000'
  } else {
    nameVal.value = ''
    descVal.value = ''
    targetDateVal.value = dayjs().format('YYYY-MM-DD')
    colorVal.value = '#000000'
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!nameVal.value.trim()) return Alert.error('Gagal', 'Nama milestone wajib diisi.')
  if (!targetDateVal.value) return Alert.error('Gagal', 'Tanggal target wajib diisi.')

  saving.value = true
  try {
    const payload = {
      name: nameVal.value.trim(),
      description: descVal.value.trim(),
      target_date: new Date(targetDateVal.value).toISOString(),
      color: colorVal.value,
    }

    if (props.milestone) {
      // Edit mode
      await ganttStore.updateMilestone(props.milestone.id, payload)
      Alert.success('Berhasil', 'Milestone berhasil diperbarui.')
    } else {
      // Create mode
      await ganttStore.createMilestone(props.boardId, payload)
      Alert.success('Berhasil', 'Milestone baru berhasil ditambahkan.')
    }
    emit('saved')
    emit('close')
  } catch (e) {
    Alert.error('Gagal', e.response?.data?.message || 'Gagal menyimpan milestone.')
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!props.milestone) return
  const confirmed = await Alert.confirm('Hapus Milestone?', 'Milestone ini akan dihapus secara permanen dari board.')
  if (confirmed) {
    try {
      await ganttStore.deleteMilestone(props.milestone.id)
      Alert.success('Berhasil', 'Milestone berhasil dihapus.')
      emit('saved')
      emit('close')
    } catch (e) {
      Alert.error('Gagal', 'Gagal menghapus milestone.')
    }
  }
}

// Escape key dismiss
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <!-- Backdrop overlay -->
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>

    <!-- Modal Content Card -->
    <div class="relative bg-white dark:bg-gray-950 w-full max-w-[440px] rounded-3xl shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-850 z-10 transition-transform duration-300">
      
      <!-- Header -->
      <div class="bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 class="text-base font-black text-gray-800 dark:text-white">
            {{ milestone ? 'Edit Milestone' : 'Tambah Milestone Baru' }}
          </h3>
          <p class="text-gray-400 text-xs mt-0.5">Tentukan tenggat target penting proyek Anda</p>
        </div>
      </div>

      <!-- Form Body -->
      <div class="p-6 space-y-4">

        <!-- Field Nama -->
        <div>
          <label class="section-label">Nama Milestone *</label>
          <input
            v-model="nameVal"
            type="text"
            placeholder="e.g. Rilis Alfa, Final Testing"
            class="input-base mt-1.5"
            required
          />
        </div>

        <!-- Field Deskripsi -->
        <div>
          <label class="section-label">Deskripsi</label>
          <textarea
            v-model="descVal"
            rows="2"
            placeholder="Keterangan tambahan atau milestone scope..."
            class="input-base !h-auto resize-none p-3 mt-1.5"
          ></textarea>
        </div>

        <!-- Field Target Date -->
        <div>
          <label class="section-label">Target Date *</label>
          <input
            v-model="targetDateVal"
            type="date"
            class="input-base mt-1.5 text-xs"
            required
          />
        </div>

        <!-- Field Preset Color Selector -->
        <div>
          <label class="section-label">Pilih Warna Milestone</label>
          <div class="flex gap-2 mt-2">
            <button
              v-for="c in colors"
              :key="c"
              @click="colorVal = c"
              class="w-6 h-6 rounded-full border transition-transform duration-200 hover:scale-110"
              :style="{ backgroundColor: c }"
              :class="colorVal === c ? 'border-2 border-brand-600 dark:border-white scale-110 ring-2 ring-brand-500/15' : 'border-gray-200 dark:border-gray-800'"
            ></button>
          </div>
        </div>

      </div>

      <!-- Action Footer -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between shrink-0">
        <div>
          <button
            v-if="milestone"
            @click="handleDelete"
            class="text-xs text-error-500 hover:text-error-700 font-bold hover:underline transition"
          >
            Hapus Milestone
          </button>
        </div>
        <div class="flex gap-2">
          <button @click="emit('close')" class="btn-outline">
            Batal
          </button>
          <button
            @click="handleSubmit"
            :disabled="saving || !nameVal.trim() || !targetDateVal"
            class="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Menyimpan...' : (milestone ? 'Update' : 'Simpan') }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <BookOpen class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Peraturan HR</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Daftar Pasal & Ayat Pelanggaran Global &bull; Human Resources</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <FilterButton v-model:active="showFilter" />
          <button 
            @click="openAddModal"
            class="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95">
            <Plus class="w-5 h-5" />
            Tambah Peraturan
          </button>
        </div>
      </div>

      <!-- Filter Section -->
      <FilterCard :show="showFilter" cols="2">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Cari</label>
          <div class="relative">
            <input v-model="filters.search" type="text" placeholder="Deskripsi atau kode..." class="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:bg-gray-800 dark:text-white transition" />
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
          <select v-model="filters.is_active" class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:bg-gray-800 dark:text-white transition bg-white cursor-pointer">
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif</option>
          </select>
        </div>
        <template #footer>
          <button @click="resetFilters" class="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1">
            <RotateCcw class="w-3.5 h-3.5" /> Reset Filter
          </button>
        </template>
      </FilterCard>

      <DataTable 
        :columns="tableColumns" 
        :data="regulations" 
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-pasal_ayat="{ item }">
          <div class="flex flex-col">
            <span class="text-sm font-black text-gray-800 dark:text-white tracking-tight leading-none mb-1">PASAL {{ item.pasal }}</span>
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">AYAT {{ item.ayat }}</span>
          </div>
        </template>

        <template #cell-description="{ item }">
          <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-md italic">
            "{{ item.description }}"
          </p>
        </template>

        <template #cell-fine_amount="{ item }">
          <span class="text-sm font-black text-rose-600 dark:text-rose-400">
            {{ formatCurrency(item.fine_amount) }}
          </span>
        </template>

        <template #cell-is_active="{ item }">
          <span :class="item.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'"
            class="inline-flex px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest">
            {{ item.is_active ? 'Aktif' : 'Non-Aktif' }}
          </span>
        </template>

        <template #cell-action="{ item }">
          <div class="flex items-center gap-2">
            <button @click="openEditModal(item)" class="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition">
              <Edit :size="16" />
            </button>
            <button @click="handleDelete(item.id)" class="p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-xl transition">
              <Trash2 :size="16" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Modal Form -->
      <div v-if="showModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
          <div class="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
            <div>
              <h3 class="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">{{ isEdit ? 'Update Peraturan' : 'Tambah Peraturan Baru' }}</h3>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Master pasal & ayat pelanggaran global</p>
            </div>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          <div class="p-8 space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Pasal</label>
                <input v-model="form.pasal" type="number" placeholder="Contoh: 1" class="input-base" />
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Ayat</label>
                <input v-model="form.ayat" type="number" placeholder="Contoh: 1" class="input-base" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Deskripsi Peraturan</label>
              <textarea v-model="form.description" rows="3" class="input-base !h-auto resize-none p-4" placeholder="Tuliskan bunyi pasal di sini..."></textarea>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2 col-span-2">
                <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest px-1">Nominal Denda (Rp)</label>
                <input 
                  :value="formatThousand(form.fine_amount)" 
                  @input="e => form.fine_amount = parseThousand(e.target.value)"
                  type="text" placeholder="Contoh: 50.000" class="input-base" 
                />
              </div>
            </div>

            <div class="flex items-center gap-3 px-1">
              <input v-model="form.is_active" type="checkbox" id="isActive" class="w-5 h-5 accent-brand-500 rounded" />
              <label for="isActive" class="text-sm font-bold text-gray-700 dark:text-gray-300">Status Aktif</label>
            </div>
          </div>

          <div class="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
            <button @click="showModal = false" class="px-6 py-2.5 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-gray-800 transition">Batal</button>
            <button 
              @click="submitForm"
              :disabled="submitting"
              class="px-10 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Peraturan') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import FilterCard from '@/components/common/FilterCard.vue'
import FilterButton from '@/components/common/FilterButton.vue'
import { RegulationService } from './regulation.service'
import { Search, Plus, RotateCcw, BookOpen, Edit, Trash2 } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import { formatThousand, parseThousand } from '@/utils/format'

const regulations = ref([])
const loading = ref(false)
const pagination = ref({ page: 1, total_pages: 1, total_data: 0 })
const showFilter = ref(false)

const filters = reactive({
  search: '',
  is_active: ''
})

const tableColumns = [
  { key: 'pasal_ayat', label: 'Pasal/Ayat' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'fine_amount', label: 'Nominal Denda' },
  { key: 'is_active', label: 'Status' },
  { key: 'action', label: 'Action' }
]

// Modal State
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const submitting = ref(false)

const form = reactive({
  pasal: '',
  ayat: '',
  description: '',
  fine_amount: 0,
  is_active: true
})

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await RegulationService.getAll({ ...filters, page })
    regulations.value = res.data
    pagination.value = {
      page: res.pagination.currentPage,
      total_pages: res.pagination.totalPages,
      total_data: res.pagination.totalData
    }
  } catch (err) {
    Alert.error('Gagal memuat data peraturan')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEdit.value = false
  currentId.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  currentId.value = item.id
  form.pasal = item.pasal
  form.ayat = item.ayat
  form.description = item.description
  form.fine_amount = item.fine_amount
  form.is_active = item.is_active
  showModal.value = true
}

const resetForm = () => {
  form.pasal = ''
  form.ayat = ''
  form.description = ''
  form.fine_amount = 0
  form.is_active = true
}

const submitForm = async () => {
  if (!form.pasal || !form.ayat || !form.description) {
    Alert.error('Lengkapi data wajib!')
    return
  }

  submitting.value = true
  try {
    if (isEdit.value) {
      await RegulationService.update(currentId.value, form)
      Alert.success('Peraturan diperbarui')
    } else {
      await RegulationService.create(form)
      Alert.success('Peraturan baru ditambahkan')
    }
    showModal.value = false
    fetchData(pagination.value.page)
  } catch (err) {
    Alert.error(err.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm(
    'Hapus Peraturan?',
    'Data peraturan yang sudah dihapus tidak dapat dikembalikan.',
    'Ya, Hapus'
  )

  if (confirmed) {
    try {
      await RegulationService.remove(id)
      Alert.success('Peraturan berhasil dihapus')
      fetchData()
    } catch (err) {
      Alert.error(err.response?.data?.message || 'Gagal menghapus data')
    }
  }
}

const resetFilters = () => {
  filters.search = ''
  filters.is_active = ''
  fetchData(1)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

watch(() => filters.is_active, () => fetchData(1))

let debounceTimer = null
watch(() => filters.search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchData(1), 500)
})

onMounted(() => fetchData())
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

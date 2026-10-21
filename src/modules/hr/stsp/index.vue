<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <FileText class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Data ST/SP</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Surat Teguran & Surat Peringatan Karyawan &bull; Human Resources</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <FilterButton v-model:active="showFilter" />
          <router-link 
            :to="{ name: 'HrStspCreate' }"
            class="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95">
            <Plus class="w-5 h-5" />
            Input ST/SP
          </router-link>
        </div>
      </div>

      <!-- Filter Section -->
      <FilterCard :show="showFilter" cols="2">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Cari Karyawan/Keterangan/Catatan</label>
          <div class="relative">
            <input v-model="filters.search" type="text" placeholder="Nama, NIK, keterangan atau catatan..." class="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:bg-gray-800 dark:text-white transition" />
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Bulan Penerbitan</label>
          <input v-model="filters.month" type="month" class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:bg-gray-800 dark:text-white transition" />
        </div>
        <template #footer>
          <button @click="resetFilters" class="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1">
            <RotateCcw class="w-3.5 h-3.5" /> Reset Filter
          </button>
        </template>
      </FilterCard>

      <DataTable 
        :columns="tableColumns" 
        :data="stsps" 
        :loading="loading"
        :server-side="true"
        :total-items="pagination.total_data"
        :current-page="pagination.page"
        @update:current-page="fetchData"
      >
        <template #cell-stsp_date="{ item }">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-gray-800 dark:text-white leading-none mb-1">{{ dayjs(item.stsp_date).format('DD MMM YYYY') }}</span>
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{{ item.code }}</span>
          </div>
        </template>

        <template #cell-employee="{ item }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
              {{ item.employee?.full_name?.charAt(0) }}
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-700 dark:text-white">{{ item.employee?.full_name }}</span>
              <span class="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{{ item.employee?.employee_number }} &bull; {{ item.employee?.position?.name }}</span>
            </div>
          </div>
        </template>

        <template #cell-keterangan="{ item }">
          <span class="text-xs text-gray-700 dark:text-gray-300 font-medium line-clamp-2 italic">"{{ item.keterangan }}"</span>
        </template>

        <template #cell-nominal="{ item }">
          <span class="text-[11px] font-black text-rose-600 uppercase tracking-wider">
            {{ formatCurrency(item.nominal) }}
          </span>
        </template>

        <template #cell-catatan="{ item }">
          <span class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{{ item.catatan || '-' }}</span>
        </template>

        <template #cell-recorder="{ item }">
          <div class="flex flex-col">
            <span class="text-[11px] font-bold text-gray-600 dark:text-gray-400 leading-none mb-0.5">{{ item.recorder?.full_name || 'System' }}</span>
            <span class="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{{ item.recorder?.position?.name || '-' }}</span>
          </div>
        </template>

        <template #cell-action="{ item }">
          <div class="flex items-center gap-2">
            <button @click="handleView(item)" class="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition" title="Lihat Detail">
              <Eye :size="16" />
            </button>
            <router-link :to="{ name: 'HrStspEdit', params: { id: item.id } }" class="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition" title="Edit">
              <Edit :size="16" />
            </router-link>
            <button @click="handleDelete(item.id)" class="p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-xl transition" title="Hapus">
              <Trash2 :size="16" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Detail Modal -->
      <div v-if="showDetail" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
          <div class="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-brand-500/20 uppercase tracking-tighter">
                STS
              </div>
              <div>
                <h3 class="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">Detail Surat Teguran/Peringatan</h3>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 italic">{{ selectedItem?.code }} &bull; Recorded By {{ selectedItem?.recorder?.full_name }}</p>
              </div>
            </div>
            <button @click="showDetail = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          <div class="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <!-- Employee Info -->
            <div class="flex items-center gap-5 p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div class="w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center text-xl font-black text-brand-500 shadow-sm uppercase border border-gray-100 dark:border-gray-800">
                {{ selectedItem?.employee?.full_name?.charAt(0) }}
              </div>
              <div>
                <div class="text-base font-black text-gray-800 dark:text-white uppercase tracking-tight">{{ selectedItem?.employee?.full_name }}</div>
                <div class="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">{{ selectedItem?.employee?.employee_number }} &bull; {{ selectedItem?.employee?.position?.name }}</div>
              </div>
            </div>

            <!-- ST/SP Content -->
            <div class="space-y-6">
              <div class="space-y-2">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Keterangan Kejadian</p>
                <div class="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                  <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-medium italic">
                    "{{ selectedItem?.keterangan || 'Tidak ada rincian keterangan.' }}"
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div class="space-y-1.5 px-1">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nominal Denda</p>
                  <p class="text-base font-black text-rose-600 flex items-center gap-2 uppercase tracking-tight">
                    {{ formatCurrency(selectedItem?.nominal || 0) }}
                  </p>
                </div>
                <div class="space-y-1.5 px-1">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tanggal Penerbitan</p>
                  <p class="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {{ dayjs(selectedItem?.stsp_date).format('DD MMMM YYYY') }}
                  </p>
                </div>
                <div class="space-y-1.5 px-1 md:col-span-2">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Catatan (Internal)</p>
                  <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 font-medium border border-gray-100 dark:border-gray-700">
                    {{ selectedItem?.catatan || '-' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-8 py-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
            <button @click="showDetail = false" 
              class="w-full py-3 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-widest rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]">
              Tutup Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, reactive } from 'vue'
import dayjs from 'dayjs'
import { registerFilterReset } from '@/utils/filterRegistry'

// pagination + filters di module scope agar posisi halaman & filter bertahan saat
// kembali dari form; didaftarkan ke registerFilterReset() untuk direset saat logout.
const makeDefaultPagination = () => ({ page: 1, total_pages: 1, total_data: 0 })
const makeDefaultFilters = () => ({ search: '', month: dayjs().format('YYYY-MM') })
const pagination = ref(makeDefaultPagination())
const filters = reactive(makeDefaultFilters())

registerFilterReset(() => {
  Object.assign(filters, makeDefaultFilters())
  pagination.value = makeDefaultPagination()
})
</script>

<script setup>
import { onMounted, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import FilterCard from '@/components/common/FilterCard.vue'
import FilterButton from '@/components/common/FilterButton.vue'
import { StspService } from './stsp.service'
import { Search, Plus, RotateCcw, FileText, Eye, Edit, Trash2 } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'

const stsps = ref([])
const loading = ref(false)
const showFilter = ref(false)

const tableColumns = [
  { key: 'stsp_date', label: 'Tanggal/Kode' },
  { key: 'employee', label: 'Karyawan' },
  { key: 'keterangan', label: 'Keterangan' },
  { key: 'nominal', label: 'Nominal' },
  { key: 'catatan', label: 'Catatan' },
  { key: 'recorder', label: 'Pencatat' },
  { key: 'action', label: 'Action' }
]

// Detail State
const showDetail = ref(false)
const selectedItem = ref(null)

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await StspService.getAll({ ...filters, page })
    stsps.value = res.data
    pagination.value = {
      page: res.pagination.currentPage,
      total_pages: res.pagination.totalPages,
      total_data: res.pagination.totalData
    }
  } catch (err) {
    Alert.error('Gagal memuat data ST/SP')
  } finally {
    loading.value = false
  }
}

const handleView = (item) => {
  selectedItem.value = item
  showDetail.value = true
}

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm(
    'Hapus Data ST/SP?',
    'Data yang dihapus tidak dapat dipulihkan.',
    'Ya, Hapus'
  )

  if (confirmed) {
    try {
      await StspService.remove(id)
      Alert.success('Data berhasil dihapus')
      fetchData()
    } catch (err) {
      Alert.error('Gagal menghapus data')
    }
  }
}

const resetFilters = () => {
  Object.assign(filters, makeDefaultFilters())
  fetchData(1)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

watch(() => filters.month, () => fetchData(1))

let debounceTimer = null
watch(() => filters.search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchData(1), 500)
})

// Pertahankan halaman terakhir saat kembali dari form.
onMounted(() => fetchData(pagination.value.page))
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e4e7ec;
  border-radius: 9999px;
}
</style>

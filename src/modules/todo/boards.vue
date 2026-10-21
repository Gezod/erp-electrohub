<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <LayoutGrid class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Boards</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">{{ store.boards.length }} board aktif &bull; Project Workspace</p>
          </div>
        </div>
        <button @click="openCreate" class="btn-primary">
          <Plus class="w-4 h-4" /> Buat Board Baru
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="flex items-center gap-3 mb-6 flex-wrap">
        <button
          v-for="t in types" :key="t.value" @click="activeType = t.value"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all border"
          :class="activeType === t.value
            ? 'bg-brand-500 text-white border-brand-500'
            : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-brand-300'"
        >
          {{ t.label }}
        </button>
        <div class="relative ml-auto">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="search" type="text" placeholder="Cari board..." class="input-base pl-10 w-56" />
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="store.isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="h-52 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>

      <!-- Board Grid -->
      <div v-else-if="filteredBoards.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="board in filteredBoards" :key="board.id"
          class="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-theme-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          @click="$router.push({ name: 'TodoBoardDetail', params: { id: board.id } })"
        >
          <div class="h-2 w-full" :style="{ background: board.color || '#111827' }"></div>

          <div class="p-6">
            <div class="flex items-start justify-between mb-5">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-gray-800"
                :style="{ background: (board.color || '#111827') + '12' }"
              >
                {{ board.icon || '📋' }}
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                  :class="{
                    'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400': board.board_type === 'personal',
                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400': board.board_type === 'team',
                    'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400': board.board_type === 'project',
                  }"
                >{{ board.board_type }}</span>
                <div class="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <button @click.stop="editBoard(board)" class="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 transition">
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button @click.stop="confirmDelete(board)" class="p-1.5 rounded-lg bg-error-50 dark:bg-error-900/20 text-error-500 hover:bg-error-100 transition">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <h3 class="text-base font-bold text-gray-800 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
              {{ board.name }}
            </h3>
            <p class="text-xs text-gray-400 line-clamp-2 mb-5 min-h-[32px]">{{ board.description || 'Tidak ada deskripsi' }}</p>

            <!-- Task Progress -->
            <div class="mb-4">
              <div class="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-1.5">
                <div class="flex items-center gap-1.5">
                  <span>Progress</span>
                  <span>&bull;</span>
                  <span>{{ doneCount(board) }}/{{ totalCount(board) }} tasks</span>
                </div>
                <router-link
                  :to="{ name: 'TodoGanttChart', params: { id: board.id } }"
                  class="gantt-icon-link shrink-0 -my-1"
                  title="Lihat Gantt Chart"
                  @click.stop
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14h3"/><path d="M7 10h6"/><path d="M12 6h6"/></svg>
                </router-link>
              </div>
              <div class="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700 bg-brand-500" :style="{ width: `${progressPercent(board)}%` }"></div>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50 dark:border-gray-800">
              <div class="flex items-center gap-1.5">
                <div class="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 font-bold text-[9px] flex items-center justify-center">
                  {{ initials(board.owner?.full_name) }}
                </div>
                <span>{{ board.owner?.full_name || 'Me' }}</span>
              </div>
              <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-brand-400 opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        </div>

        <!-- New Board Quick Card -->
        <button
          @click="openCreate"
          class="flex flex-col items-center justify-center h-52 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all duration-300 group"
        >
          <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/20 flex items-center justify-center mb-3 transition-colors">
            <Plus class="w-6 h-6" />
          </div>
          <span class="text-sm font-bold">Buat Board Baru</span>
          <span class="text-xs mt-1 opacity-60">Personal, Team, atau Project</span>
        </button>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-28 text-center">
        <div class="w-24 h-24 rounded-3xl bg-brand-50 dark:bg-brand-900/10 flex items-center justify-center mb-6 shadow-inner">
          <LayoutGrid class="w-12 h-12 text-brand-400" />
        </div>
        <h3 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Belum Ada Board</h3>
        <p class="text-sm text-gray-400 mb-8 max-w-sm">Mulai perjalanan produktivitas Anda dengan membuat board pertama</p>
        <button @click="openCreate" class="btn-primary px-8 py-3">
          Buat Board Pertama
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <FormModal
      v-model="showModal"
      :title="isEdit ? 'Edit Board' : 'Buat Board Baru'"
      :is-complete="!!form.name.trim()"
      :is-loading="saving"
      :submit-label="isEdit ? 'Simpan Perubahan' : 'Buat Board'"
      @submit="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="section-label">Nama Board *</label>
          <input v-model="form.name" type="text" placeholder="e.g. Sprint Q2 2026" class="input-base mt-1.5" />
        </div>
        <div>
          <label class="section-label">Deskripsi</label>
          <textarea v-model="form.description" rows="2" placeholder="Ceritakan tujuan board ini..." class="input-base !h-auto resize-none p-3 mt-1.5"></textarea>
        </div>
        <div>
          <label class="section-label">Tipe Board</label>
          <div class="grid grid-cols-3 gap-2 mt-1.5">
            <button
              v-for="t in types.slice(1)" :key="t.value" @click="form.board_type = t.value" type="button"
              class="py-2.5 px-3 text-xs font-bold rounded-xl border transition-all"
              :class="form.board_type === t.value
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-brand-300'"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="section-label">Icon</label>
            <div class="flex gap-2 mt-1.5">
              <button
                v-for="ic in icons" :key="ic" @click="form.icon = ic" type="button"
                class="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all border-2"
                :class="form.icon === ic ? 'border-brand-500 bg-brand-50' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'"
              >
                {{ ic }}
              </button>
            </div>
          </div>
          <div>
            <label class="section-label">Warna</label>
            <div class="flex gap-2 flex-wrap mt-1.5">
              <button
                v-for="c in colors" :key="c" @click="form.color = c" type="button"
                class="w-7 h-7 rounded-lg transition-all border-2"
                :style="{ background: c }"
                :class="form.color === c ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useTodoStore } from './todo.store'
import { Alert } from '@/plugins/sweetalert'
import { LayoutGrid, Plus, Search, Trash2, Pencil, ArrowRight } from 'lucide-vue-next'

const store = useTodoStore()
const showModal = ref(false)
const saving = ref(false)
const activeType = ref('')
const search = ref('')
const editId = ref(null)
const isEdit = computed(() => !!editId.value)

const types = [
  { value: '', label: 'Semua' },
  { value: 'personal', label: 'Personal' },
  { value: 'team', label: 'Team' },
  { value: 'project', label: 'Project' },
]

const icons = ['📋', '🚀', '💡', '🎯', '🔥', '⚡']
const colors = ['#111827', '#2563eb', '#059669', '#d97706', '#dc2626', '#db2777', '#0891b2', '#6b7280']

const emptyForm = () => ({ name: '', description: '', board_type: 'personal', icon: '📋', color: '#111827' })
const form = ref(emptyForm())

const filteredBoards = computed(() => {
  return store.boards.filter(b => {
    const matchType = !activeType.value || b.board_type === activeType.value
    const matchSearch = !search.value || b.name.toLowerCase().includes(search.value.toLowerCase())
    return matchType && matchSearch
  })
})

const totalCount = (board) => board._count?.tasks || 0
const doneCount = (board) => (board.tasks || []).filter(t => t.status === 'done').length
const progressPercent = (board) => {
  const total = totalCount(board)
  return total ? Math.round((doneCount(board) / total) * 100) : 0
}

onMounted(() => store.fetchBoards())

const openCreate = () => { editId.value = null; form.value = emptyForm(); showModal.value = true }

const editBoard = (board) => {
  form.value = { name: board.name, description: board.description || '', board_type: board.board_type, icon: board.icon || '📋', color: board.color || '#111827' }
  editId.value = board.id
  showModal.value = true
}

const handleSubmit = async () => {
  if (!form.value.name.trim()) return Alert.error('Nama board wajib diisi')
  saving.value = true
  try {
    if (isEdit.value) {
      await store.updateBoard(editId.value, form.value)
      Alert.success('Board berhasil diperbarui')
    } else {
      await store.createBoard(form.value)
      Alert.success('Board berhasil dibuat')
    }
    showModal.value = false
  } catch (e) {
    Alert.error(e.response?.data?.message || 'Gagal menyimpan board')
  } finally { saving.value = false }
}

const confirmDelete = async (board) => {
  const ok = await Alert.confirm('Hapus Board?', `"${board.name}" dan semua task-nya akan dihapus permanen.`, 'Hapus Permanen')
  if (ok) {
    try { await store.deleteBoard(board.id); Alert.success('Board dihapus') }
    catch (e) { Alert.error('Gagal menghapus board') }
  }
}

const initials = (n) => (n || '?').split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2)
</script>

<style scoped>
.gantt-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  transition: all 0.2s ease;
}
.dark .gantt-icon-link {
  background: #1f2937;
  border-color: #374151;
  color: #9ca3af;
}
.gantt-icon-link:hover {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
  transform: scale(1.05);
}
.dark .gantt-icon-link:hover {
  background: #ffffff;
  border-color: #ffffff;
  color: #000000;
  transform: scale(1.05);
}
</style>

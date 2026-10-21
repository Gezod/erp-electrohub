<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Team Tasks</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">Semua Task Tim & Divisi Anda</p>
          </div>
        </div>
        <FilterButton v-model:active="showFilter" />
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div v-for="s in stats" :key="s.label" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <div class="text-2xl font-black mb-1" :class="s.color">{{ s.count }}</div>
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wide">{{ s.label }}</div>
        </div>
      </div>

      <FilterCard :show="showFilter" cols="2">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Cari Task</label>
          <div class="relative">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="filters.search" @input="debounceLoad()" type="text" placeholder="Judul atau deskripsi..." class="input-base pl-10" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
          <select v-model="filters.status" @change="load()" class="input-base">
            <option value="">Semua Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        <template #footer>
          <button @click="resetFilters" class="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1">
            <RotateCcw class="w-3.5 h-3.5" /> Reset Filter
          </button>
        </template>
      </FilterCard>

      <DataTable :columns="tableColumns" :data="tasks" :loading="loading">
        <template #cell-task="{ item }">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-[10px] font-black px-2 py-0.5 rounded-full" :class="priClass(item.priority)">{{ item.priority }}</span>
            <span class="text-[10px] font-black px-2 py-0.5 rounded-full" :class="stClass(item.status)">{{ stLabel(item.status) }}</span>
            <span v-if="item.is_private" class="text-[10px] font-bold text-gray-400 flex items-center gap-0.5"><Lock class="w-3 h-3" /> Private</span>
          </div>
          <h4 class="text-sm font-bold text-gray-800 dark:text-white mb-0.5">{{ item.title }}</h4>
          <p v-if="item.description" class="text-xs text-gray-400 line-clamp-1">{{ item.description }}</p>
        </template>

        <template #cell-creator="{ item }">
          <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">{{ item.creator?.full_name || '-' }}</span>
        </template>

        <template #cell-assignees="{ item }">
          <div class="flex -space-x-1.5">
            <div
              v-for="a in (item.assignees || []).slice(0, 4)"
              :key="a.id"
              class="w-7 h-7 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-900"
              :title="a.employee?.full_name"
            >
              {{ initials(a.employee?.full_name) }}
            </div>
          </div>
        </template>

        <template #cell-due_date="{ item }">
          <div v-if="item.due_date" class="flex items-center gap-1 text-xs" :class="isOverdue(item.due_date) ? 'text-error-500 font-bold' : 'text-gray-400'">
            <Calendar class="w-3.5 h-3.5" /> {{ fmtDate(item.due_date) }}
          </div>
          <span v-else class="text-xs text-gray-300">-</span>
        </template>

        <template #cell-counts="{ item }">
          <div class="flex gap-2 text-xs text-gray-400">
            <span v-if="item._count?.comments" class="flex items-center gap-0.5"><MessageSquare class="w-3.5 h-3.5" />{{ item._count.comments }}</span>
            <span v-if="item._count?.checklists" class="flex items-center gap-0.5"><ListChecks class="w-3.5 h-3.5" />{{ item._count.checklists }}</span>
          </div>
        </template>
      </DataTable>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import FilterCard from '@/components/common/FilterCard.vue'
import FilterButton from '@/components/common/FilterButton.vue'
import { useTodoStore } from './todo.store'
import { Users, Search, Calendar, MessageSquare, ListChecks, Lock, RotateCcw } from 'lucide-vue-next'
import dayjs from 'dayjs'

const store = useTodoStore()
const tasks = ref([])
const loading = ref(false)
const showFilter = ref(false)
const filters = ref({ status: '', search: '' })

const tableColumns = [
  { key: 'task', label: 'Task' },
  { key: 'creator', label: 'Dibuat Oleh' },
  { key: 'assignees', label: 'Assignee' },
  { key: 'due_date', label: 'Tenggat' },
  { key: 'counts', label: 'Aktivitas' },
]

const stats = computed(() => [
  { label: 'Total', count: tasks.value.length, color: 'text-gray-700 dark:text-white' },
  { label: 'In Progress', count: tasks.value.filter(t => t.status === 'in_progress').length, color: 'text-blue-500' },
  { label: 'Urgent', count: tasks.value.filter(t => t.priority === 'urgent').length, color: 'text-error-500' },
  { label: 'Selesai', count: tasks.value.filter(t => t.status === 'done').length, color: 'text-emerald-500' },
])

const load = async () => {
  loading.value = true
  const params = {}
  if (filters.value.status) params.status = filters.value.status
  if (filters.value.search) params.search = filters.value.search
  params.limit = 200
  const res = await store.fetchTasks(params)
  tasks.value = res.data || []
  loading.value = false
}

let debounce = null
const debounceLoad = () => { clearTimeout(debounce); debounce = setTimeout(load, 500) }

const resetFilters = () => {
  filters.value = { status: '', search: '' }
  load()
}

onMounted(load)

const priClass = (p) => ({ urgent: 'bg-error-100 text-error-700', high: 'bg-orange-100 text-orange-700', normal: 'bg-blue-100 text-blue-700', low: 'bg-gray-100 text-gray-500' }[p] || 'bg-gray-100 text-gray-500')
const stClass = (s) => ({ todo: 'bg-gray-100 text-gray-600', in_progress: 'bg-blue-100 text-blue-700', in_review: 'bg-yellow-100 text-yellow-700', on_hold: 'bg-orange-100 text-orange-700', done: 'bg-emerald-100 text-emerald-700' }[s] || 'bg-gray-100 text-gray-600')
const stLabel = (s) => ({ todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', on_hold: 'On Hold', done: 'Done', cancelled: 'Cancelled' }[s] || s)
const initials = (n) => (n || '?').split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2)
const fmtDate = (d) => dayjs(d).format('DD MMM YY')
const isOverdue = (d) => dayjs(d).isBefore(dayjs(), 'day')
</script>

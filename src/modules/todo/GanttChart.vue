<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 gantt-page">
      
      <!-- Breadcrumb -->
      <div class="breadcrumb text-xs text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-1.5">
        <router-link :to="{ name: 'TodoBoards' }" class="hover:text-gray-900 dark:hover:text-gray-100 transition">Boards</router-link>
        <span>&rsaquo;</span>
        <router-link :to="{ name: 'TodoBoardDetail', params: { id: boardId } }" class="hover:text-gray-900 dark:hover:text-gray-100 transition">{{ ganttStore.board?.name || '...' }}</router-link>
        <span>&rsaquo;</span>
        <span class="text-gray-700 dark:text-gray-300 font-medium">Gantt Chart</span>
      </div>

      <!-- Page Header -->
      <div class="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-gray-800 shrink-0"
            :style="{ background: (ganttStore.board?.color || '#111827') + '15' }">
            {{ ganttStore.board?.icon || '📋' }}
          </div>
          <div>
            <h1 class="text-2xl font-extrabold tracking-tight text-gray-800 dark:text-white leading-none mb-1">{{ ganttStore.board?.name || 'Gantt Chart' }}</h1>
            <p class="subtitle text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic mt-0.5">Timeline &amp; Ketergantungan Tugas Board</p>
          </div>
        </div>
        <button @click="$router.push({ name: 'TodoBoardDetail', params: { id: boardId } })" class="btn-outline">
          <ArrowLeft class="w-3.5 h-3.5"/> Kembali ke Kanban
        </button>
      </div>

      <!-- Gantt Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatsCard heading="Progress" :formatted-value="`${ganttStore.overallProgress}%`" subtitle="Keseluruhan board" :icon="BarChart3" />
        <StatsCard heading="Total Tugas" :value="ganttStore.totalTaskCount" subtitle="Semua status" :icon="ListChecks" />
        <StatsCard heading="Dalam Pengerjaan" :value="ganttStore.inProgressTaskCount" subtitle="Sedang berjalan" :icon="Clock" icon-color="text-blue-500" />
        <StatsCard
          heading="Overdue"
          :value="ganttStore.overdueTaskCount"
          :subtitle="ganttStore.overdueTaskCount > 0 ? 'Perlu perhatian' : 'Aman'"
          :icon="AlertTriangle"
          icon-color="text-error-500"
          :value-class="ganttStore.overdueTaskCount > 0 ? 'text-[20px] sm:text-[28px] font-bold text-error-600 leading-[28px] sm:leading-[36px] tracking-tight' : undefined"
        />
        <StatsCard heading="Selesai" :value="ganttStore.completedTaskCount" subtitle="Task done" :icon="CheckCircle2" icon-color="text-emerald-500" />
      </div>

      <!-- Toolbar -->
      <div class="gantt-toolbar mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <!-- Kiri: view mode toggle (Week | Month | Quarter) -->
        <div class="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit gap-0.5">
          <button
            v-for="mode in ['week', 'month', 'quarter']"
            :key="mode"
            @click="ganttStore.setViewMode(mode)"
            class="px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200"
            :class="ganttStore.viewMode === mode ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            {{ mode }}
          </button>
        </div>

        <!-- Tengah: navigasi (< bulan/tahun >) + Today button -->
        <div class="flex items-center justify-center gap-3">
          <button @click="ganttStore.navigateTimeline('prev')" class="nav-btn p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-850 dark:text-white transition">
            <ChevronLeft class="w-4 h-4"/>
          </button>
          <span class="text-sm font-extrabold tracking-tight dark:text-white min-w-[140px] text-center">
            {{ formattedCurrentPeriod }}
          </span>
          <button @click="ganttStore.navigateTimeline('next')" class="nav-btn p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-850 dark:text-white transition">
            <ChevronRight class="w-4 h-4"/>
          </button>
          <button @click="ganttStore.goToToday()" class="btn-outline text-xs py-1.5 px-3">
            Today
          </button>
        </div>

        <!-- Kanan: Export, Milestone, + Tambah Task buttons -->
        <div class="flex items-center justify-end gap-2">
          <button @click="exportGanttAsPNG" :disabled="exporting" class="btn-outline">
            <span v-if="exporting" class="animate-spin">🔄</span>
            <Download v-else class="w-3.5 h-3.5"/> Export PNG
          </button>
          <button @click="openCreateMilestone" class="btn-outline">
            <span class="text-xs">◆</span> Tambah Milestone
          </button>
          <button @click="openCreateTask" class="btn-primary">
            <Plus class="w-4 h-4"/> Tambah Task
          </button>
        </div>
      </div>

      <!-- Loading State: skeleton -->
      <div v-if="ganttStore.loading" class="skeleton-wrapper space-y-4 py-8">
        <div v-for="i in 5" :key="i" class="skeleton h-12 w-full animate-pulse"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="ganttStore.tasks.length === 0" class="empty-state py-16 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
        <p class="text-gray-400 text-sm mb-4">Belum ada task di board ini.</p>
        <button @click="openCreateTask" class="btn-primary">
          <Plus class="w-4 h-4" /> Tambah Task
        </button>
      </div>

      <!-- Gantt Chart Area -->
      <div v-else class="gantt-chart-area rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <GanttTimeline
          :tasks="ganttStore.sortedTasks"
          :milestones="ganttStore.milestones"
          :timeline-range="ganttStore.timelineRange"
          :view-mode="ganttStore.viewMode"
          @task-selected="ganttStore.selectTask"
          @milestone-selected="openEditMilestone"
        />
      </div>

      <!-- Milestone Modal -->
      <GanttMilestoneModal
        v-if="showMilestoneModal"
        :board-id="boardId"
        :milestone="selectedMilestoneForEdit"
        @close="showMilestoneModal = false"
        @saved="loadData"
      />

      <!-- Create Task Modal -->
      <FormModal
        v-model="showCreate"
        title="Tambah Task Baru"
        :is-complete="!!newTask.title.trim()"
        :is-loading="saving"
        submit-label="Tambah Task"
        @submit="handleCreate"
      >
        <div class="space-y-4">
                <div>
                  <label class="section-label">Judul Task *</label>
                  <input v-model="newTask.title" type="text" placeholder="Apa yang perlu dikerjakan?" autofocus class="input-base mt-1.5"/>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Deskripsi</label>
                  <textarea v-model="newTask.description" rows="2" placeholder="Masukkan rincian deskripsi..."
                    class="input-base !h-auto resize-none p-3"/>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div class="col-span-2 md:col-span-2">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Prioritas</label>
                    <select v-model="newTask.priority"
                      class="input-base text-xs">
                      <option value="urgent">🔴 Urgent</option>
                      <option value="high">🟠 High</option>
                      <option value="normal">🔵 Normal</option>
                      <option value="low">⚪ Low</option>
                    </select>
                  </div>
                  <div class="col-span-1">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mulai</label>
                    <input v-model="newTask.start_date" type="date"
                      class="input-base text-xs"/>
                  </div>
                  <div class="col-span-1">
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Due Date</label>
                    <input v-model="newTask.due_date" type="date"
                      class="input-base text-xs"/>
                  </div>
                </div>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input v-model="newTask.is_private" type="checkbox" class="w-4 h-4 accent-brand-600 rounded"/>
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-semibold">Private — hanya saya yang bisa lihat</span>
                </label>
                <div>
                  <label class="section-label">Assign Ke</label>
                  <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 dark:border-gray-800 rounded-xl mt-1.5">
                    <label v-for="emp in assignableEmps" :key="emp.id" class="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-lg cursor-pointer border border-transparent hover:border-brand-300 dark:hover:border-brand-700 transition-all text-xs" :class="newTask.assignee_ids.includes(emp.id) ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 font-bold' : ''">
                      <input type="checkbox" :value="emp.id" v-model="newTask.assignee_ids" class="hidden"/>
                      <div class="w-5 h-5 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-[8px]">{{ getInitials(emp.full_name) }}</div>
                      <span>{{ emp.full_name }} <span v-if="emp.position?.name" class="opacity-50">({{ emp.position.name }})</span></span>
                    </label>
                    <p v-if="!assignableEmps.length" class="text-xs text-gray-400 p-2">Tidak ada bawahan yang bisa di-assign</p>
                  </div>
                </div>
        </div>
      </FormModal>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGanttStore } from './gantt.store'
import { useTodoStore } from './todo.store'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import FormModal from '@/components/common/FormModal.vue'
import StatsCard from '@/components/ui/StatsCard.vue'
import GanttTimeline from './GanttTimeline.vue'
import GanttMilestoneModal from './GanttMilestoneModal.vue'
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Download, ListChecks, Clock, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import dayjs from 'dayjs'

const route = useRoute()
const ganttStore = useGanttStore()
const todoStore = useTodoStore()

const boardId = computed(() => route.params.id)

const showCreate = ref(false)
const saving = ref(false)

// Milestone modal states
const showMilestoneModal = ref(false)
const selectedMilestoneForEdit = ref(null)

const openCreateMilestone = () => {
  selectedMilestoneForEdit.value = null
  showMilestoneModal.value = true
}

const openEditMilestone = (milestone) => {
  selectedMilestoneForEdit.value = milestone
  showMilestoneModal.value = true
}

// Export PNG feature
const exporting = ref(false)

const loadHtml2Canvas = async () => {
  if (window.html2canvas) {
    return window.html2canvas
  }
  try {
    // Prevent Vite static analysis from failing the build if not installed locally yet
    const module = await import(/* @vite-ignore */ 'html2canvas')
    return module.default || module
  } catch (e) {
    console.warn('html2canvas local import failed, attempting CDN load...', e)
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
      script.crossOrigin = 'anonymous'
      script.onload = () => {
        if (window.html2canvas) {
          resolve(window.html2canvas)
        } else {
          reject(new Error('html2canvas failed to initialize from CDN'))
        }
      }
      script.onerror = () => {
        reject(new Error('Gagal memuat html2canvas dari CDN.'))
      }
      document.head.appendChild(script)
    })
  }
}

const exportGanttAsPNG = async () => {
  if (exporting.value) return
  exporting.value = true
  Alert.toast('Mempersiapkan ekspor gambar...', 'info')

  try {
    const html2canvas = await loadHtml2Canvas()
    const element = document.querySelector('.gantt-chart-area')
    if (!element) {
      Alert.toast('Area Gantt Chart tidak ditemukan.', 'error')
      exporting.value = false
      return
    }

    const canvas = await html2canvas(element, {
      backgroundColor: document.documentElement.classList.contains('dark') ? '#0b0f19' : '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    })

    const link = document.createElement('a')
    const boardName = ganttStore.board?.name || 'gantt'
    const dateStr = dayjs().format('YYYY-MM-DD')
    link.download = `gantt-${boardName}-${dateStr}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    Alert.toast('Ekspor gambar berhasil diunduh.', 'success')
  } catch (err) {
    console.error('Export PNG failed:', err)
    Alert.toast('Gagal mengekspor gambar Gantt.', 'error')
  } finally {
    exporting.value = false
  }
}

// Keyboard escape handler
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    if (showCreate.value) {
      showCreate.value = false
    } else if (showMilestoneModal.value) {
      showMilestoneModal.value = false
    } else if (ganttStore.selectedTaskId) {
      ganttStore.selectTask(null)
    }
  }
}
const assignableEmps = ref([])
const newTask = ref({ 
  title: '', 
  description: '', 
  priority: 'normal', 
  due_date: '', 
  start_date: '', 
  status: 'todo', 
  is_private: false, 
  assignee_ids: [] 
})

// Format navigation current period label dynamically based on active viewMode
const formattedCurrentPeriod = computed(() => {
  const d = dayjs(ganttStore.currentDate)
  if (ganttStore.viewMode === 'week') {
    return `Minggu, ${d.format('MMM YYYY')}`
  } else if (ganttStore.viewMode === 'month') {
    return d.format('MMMM YYYY')
  } else if (ganttStore.viewMode === 'quarter') {
    const nextThree = d.add(2, 'month')
    return `${d.format('MMM')} - ${nextThree.format('MMM YYYY')}`
  }
  return d.format('MMMM YYYY')
})

const getInitials = (n) => {
  return (n || '?').split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2)
}

const openCreateTask = () => {
  const today = dayjs().format('YYYY-MM-DD')
  newTask.value = {
    title: '',
    description: '',
    priority: 'normal',
    due_date: today,
    start_date: today,
    status: 'todo',
    is_private: false,
    assignee_ids: []
  }
  showCreate.value = true
}

const handleCreate = async () => {
  if (!newTask.value.title.trim()) {
    return Alert.error('Gagal', 'Judul task wajib diisi.')
  }
  
  saving.value = true
  try {
    const pl = { 
      ...newTask.value, 
      board_id: boardId.value 
    }
    
    // Format dates to correct ISO structures or null if empty
    if (pl.start_date) {
      pl.start_date = new Date(pl.start_date).toISOString()
    } else {
      pl.start_date = null
    }
    
    if (pl.due_date) {
      pl.due_date = new Date(pl.due_date).toISOString()
    } else {
      pl.due_date = null
    }
    
    const res = await todoStore.createTask(pl)
    const created = res?.data || res

    // Assign members to task if selected
    if (created?.id && newTask.value.assignee_ids.length > 0) {
      await todoStore.assignTask(created.id, newTask.value.assignee_ids)
    }

    showCreate.value = false
    Alert.success('Berhasil', 'Task baru berhasil ditambahkan.')
    
    // Refresh Gantt data to sync local tasks & schedules
    await ganttStore.fetchGanttData(boardId.value)
  } catch (e) {
    console.error('Create task failed:', e)
    Alert.error('Gagal', e.response?.data?.message || 'Gagal menambahkan task baru.')
  } finally {
    saving.value = false
  }
}

// Fetch Board Data & assignable employees
const loadData = async () => {
  if (!boardId.value) return
  await ganttStore.fetchGanttData(boardId.value)
  assignableEmps.value = await todoStore.fetchAssignableEmployees()
}

onMounted(() => {
  loadData()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Refetch on param changes (board selection)
watch(boardId, () => {
  loadData()
})
</script>

<style scoped>
.gantt-toolbar {
  align-items: center;
}

.skeleton-wrapper .skeleton {
  background: #f3f4f6;
  border-radius: 12px;
}

.dark .skeleton-wrapper .skeleton {
  background: #1f2937;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Print CSS Settings */
@media print {
  body {
    background: #ffffff !important;
    color: #000000 !important;
  }
  .breadcrumb,
  .page-header,
  .gantt-toolbar,
  .empty-state button,
  .nav-btn,
  .fixed {
    display: none !important;
  }
  .gantt-page {
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
  }
  .gantt-chart-area {
    border: 1px solid #cccccc !important;
    border-radius: 0 !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }
}
</style>

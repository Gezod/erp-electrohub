<script setup>
import { ref, computed } from 'vue'
import { useGanttStore } from './gantt.store'
import { useGanttDrag } from './useGanttDrag'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekOfYear)

const props = defineProps({
  tasks: {
    type: Array,
    required: true,
  },
  milestones: {
    type: Array,
    required: true,
  },
  timelineRange: {
    type: Object,
    required: true,
  },
  viewMode: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['task-selected', 'milestone-selected'])

const ganttStore = useGanttStore()

// DOM scroll containers
const leftListScrollContainer = ref(null)
const headerScrollContainer = ref(null)
const bodyScrollContainer = ref(null)

// Tooltip state
const hoveredTask = ref(null)

// Total scheduling timeline days inclusive
const totalDays = computed(() => {
  if (!props.timelineRange?.start || !props.timelineRange?.end) return 28
  const start = dayjs(props.timelineRange.start).startOf('day')
  const end = dayjs(props.timelineRange.end).endOf('day')
  return end.diff(start, 'day') + 1
})

// Timeline width calculations based on dayWidth and total duration days
const dayWidth = computed(() => {
  if (props.viewMode === 'week') return 40      // 28 days = 1120px
  if (props.viewMode === 'month') return 30     // 30 days = 900px
  if (props.viewMode === 'quarter') return 15   // 90 days = 1350px
  return 30
})

const timelineWidth = computed(() => {
  return totalDays.value * dayWidth.value
})

const timelineHeight = computed(() => {
  return (props.tasks.length + props.milestones.length) * 48
})

// helper calculation functions — always parse date strings to date-only to avoid
// timezone/ISO-timestamp offset shifting bars off-screen
function diffInDays(date1, date2) {
  if (!date1 || !date2) return 0
  const d1 = dayjs(typeof date1 === 'string' ? date1.slice(0, 10) : date1).startOf('day')
  const d2 = dayjs(typeof date2 === 'string' ? date2.slice(0, 10) : date2).startOf('day')
  // +1 inclusive: a bar spanning Mon→Mon is 1 day wide, Mon→Tue is 2 days wide
  return Math.max(0, d2.diff(d1, 'day')) + 1
}

function dateToPixel(date) {
  if (!date) return 0
  const start = dayjs(props.timelineRange.start).startOf('day')
  // Slice to YYYY-MM-DD to strip any time/timezone component from API ISO strings
  const d = dayjs(typeof date === 'string' ? date.slice(0, 10) : date).startOf('day')
  const px = d.diff(start, 'day') * dayWidth.value
  return isNaN(px) ? 0 : px
}

// Convert absolute coordinates back to dates after dragging
function pixelToDate(px) {
  const start = dayjs(props.timelineRange.start).startOf('day')
  const days = Math.round(px / dayWidth.value)
  return start.add(days, 'day').format('YYYY-MM-DD')
}

// Overdue evaluator
const isOverdue = (task) => {
  const endD = task.end_date || task.due_date
  if (!endD) return false
  const today = dayjs().startOf('day')
  const end = dayjs(endD).startOf('day')
  return end.isBefore(today) && task.status !== 'done' && task.status !== 'cancelled'
}

// Formatter for calendar columns
const headers = computed(() => {
  const list = []
  if (!props.timelineRange?.start) return list

  const start = dayjs(props.timelineRange.start)
  const end = dayjs(props.timelineRange.end)

  if (props.viewMode === 'week') {
    let current = start.startOf('week')
    for (let i = 0; i < 4; i++) {
      list.push({
        label: `WEEK ${current.week()}`,
        sublabel: `${current.format('D MMM')} - ${current.endOf('week').format('D MMM')}`,
        width: 7 * dayWidth.value,
      })
      current = current.add(1, 'week')
    }
  } else if (props.viewMode === 'month') {
    let current = start.startOf('week')
    while (current.isBefore(end)) {
      const colStart = current.isBefore(start) ? start : current
      const colEnd = current.endOf('week').isAfter(end) ? end : current.endOf('week')
      const daysCount = colEnd.diff(colStart, 'day') + 1
      list.push({
        label: `${current.format('MMMM')}, W${current.week()}`,
        sublabel: `${colStart.format('D')} - ${colEnd.format('D MMM')}`,
        width: daysCount * dayWidth.value,
      })
      current = current.add(1, 'week')
    }
  } else if (props.viewMode === 'quarter') {
    let current = start.startOf('month')
    for (let i = 0; i < 3; i++) {
      const colStart = current.isBefore(start) ? start : current
      const colEnd = current.endOf('month').isAfter(end) ? end : current.endOf('month')
      const daysCount = colEnd.diff(colStart, 'day') + 1
      list.push({
        label: current.format('MMMM YYYY'),
        sublabel: `${colStart.format('D')} - ${colEnd.format('D MMM')}`,
        width: daysCount * dayWidth.value,
      })
      current = current.add(1, 'month')
    }
  }
  return list
})

// Weekend background markers overlay
const gridLines = computed(() => {
  const list = []
  if (!props.timelineRange?.start) return list

  const start = dayjs(props.timelineRange.start)
  let step = 1
  if (props.viewMode === 'quarter') {
    step = 7 // weekly lines to prevent pixel overcrowding
  }

  for (let i = 0; i < totalDays.value; i += step) {
    const date = start.add(i, 'day')
    const isWeekend = date.day() === 0 || date.day() === 6
    list.push({
      left: i * dayWidth.value,
      isWeekend,
      label: props.viewMode === 'week' ? date.format('dd') : '',
      dayNumber: props.viewMode === 'week' ? date.format('D') : ''
    })
  }
  return list
})

// Today dynamic marker Y-offset position
const todayPosition = computed(() => {
  if (!props.timelineRange?.start) return null
  const start = dayjs(props.timelineRange.start).startOf('day')
  const today = dayjs().startOf('day')
  if (today.isBefore(start) || today.isAfter(dayjs(props.timelineRange.end))) {
    return null
  }
  return today.diff(start, 'day') * dayWidth.value
})

// Dynamic SVG Connector Paths
const dependencyPaths = computed(() => {
  const paths = []
  
  props.tasks.forEach((task, succIdx) => {
    const taskStart = task.start_date || task.created_at || dayjs().format('YYYY-MM-DD')
    const taskEnd = task.end_date || task.due_date || dayjs(taskStart).add(1, 'day').format('YYYY-MM-DD')
    if (!task.dependencies) return

    task.dependencies.forEach((dep) => {
      const predTask = props.tasks.find((t) => t.id === dep.depends_on_task_id)
      if (!predTask) return

      const predStart = predTask.start_date || predTask.created_at || dayjs().format('YYYY-MM-DD')
      const predEnd = predTask.end_date || predTask.due_date || dayjs(predStart).add(1, 'day').format('YYYY-MM-DD')

      const predIdx = props.tasks.indexOf(predTask)
      if (predIdx === -1) return

      // Predecessor bar layout metrics
      const predStartX = dateToPixel(predStart)
      const predWidth = Math.max(40, diffInDays(predStart, predEnd) * dayWidth.value)
      const endX = predStartX + predWidth
      const predY = predIdx * 48 + 24

      // Successor bar layout metrics
      const startX = dateToPixel(taskStart)
      const succY = succIdx * 48 + 24

      const midX = endX + (startX - endX) / 2

      let d = ''
      if (startX > endX + 15) {
        // Standard forward S-curve schedules
        d = `M ${endX} ${predY} H ${midX} V ${succY} H ${startX - 5}`
      } else {
        // Overlap scheduling (loop loop connectors around task bodies)
        const offset = 12
        d = `M ${endX} ${predY} H ${endX + offset} V ${(predY + succY) / 2} H ${startX - offset} V ${succY} H ${startX - 5}`
      }

      paths.push({
        id: dep.id,
        d,
      })
    })
  })
  
  return paths
})

// Sync scrolling of components
const onBodyScroll = () => {
  if (bodyScrollContainer.value) {
    if (headerScrollContainer.value) {
      headerScrollContainer.value.scrollLeft = bodyScrollContainer.value.scrollLeft
    }
    if (leftListScrollContainer.value) {
      leftListScrollContainer.value.scrollTop = bodyScrollContainer.value.scrollTop
    }
  }
}

// Gantt Drag Composable logic integration
const { dragState, onBarMouseDown } = useGanttDrag(ganttStore, {
  getDayWidth: () => dayWidth.value,
  dateToPixel: (d) => dateToPixel(d),
  pixelToDate: (px) => pixelToDate(px)
})

// ── Hover Tooltip Handlers ──
const onMouseEnter = (e, task) => {
  const barEl = e.currentTarget
  const parentRect = barEl.offsetParent.getBoundingClientRect()
  const barRect = barEl.getBoundingClientRect()
  
  hoveredTask.value = {
    task,
    x: barRect.left - parentRect.left + barRect.width / 2 - 120, // Center over bar
    y: barRect.top - parentRect.top,
  }
}

const onMouseLeave = () => {
  hoveredTask.value = null
}

const fmtDate = (d) => {
  if (!d) return '-'
  return dayjs(d).format('DD MMM YYYY')
}

// Pre-compute bar geometry per task — single source of truth for left/width
// Returns null when dates are missing or result is invalid (hides bar safely)
const barGeometry = computed(() => {
  const map = {}
  props.tasks.forEach((task) => {
    const hasOriginalDates = !!(task.start_date && task.end_date)
    
    // Fallback logic:
    // start: task.start_date -> task.created_at -> today
    const start = task.start_date || task.created_at || dayjs().format('YYYY-MM-DD')
    // end: task.end_date -> task.due_date -> start + 1 day
    const end = task.end_date || task.due_date || dayjs(start).add(1, 'day').format('YYYY-MM-DD')

    const left = dateToPixel(start)
    const days = diffInDays(start, end)
    const width = Math.max(40, days * dayWidth.value)
    if (isNaN(left) || isNaN(width) || width <= 0) {
      map[task.id] = null
      return
    }
    map[task.id] = { left, width, isFallback: !hasOriginalDates }
  })
  return map
})

// Monochrome bar label
const getBarLabel = (task) => {
  const prefix = isOverdue(task) ? '⚠ ' : ''
  return `${prefix}${task.progress || 0}%`
}


</script>

<template>
  <div class="flex flex-row border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-950 h-[580px]">
    
    <!-- LEFT SIDEBAR: TASK LIST -->
    <div class="w-[240px] shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full bg-gray-50/50 dark:bg-gray-950">
      <div class="h-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 font-black text-[10px] text-gray-400 uppercase tracking-widest shrink-0">
        TASK
      </div>
      
      <!-- List Scroll Body -->
      <div ref="leftListScrollContainer" class="overflow-y-hidden flex-1 no-scrollbar select-none">
        <!-- Task rows list -->
        <div 
          v-for="task in tasks" 
          :key="task.id" 
          @click="emit('task-selected', task.id)"
          class="h-12 border-b border-gray-100 dark:border-gray-900/60 hover:bg-gray-50 dark:hover:bg-gray-900 flex flex-col justify-center px-4 cursor-pointer transition duration-150"
          :class="{ 'bg-gray-100/70 dark:bg-gray-900/50': task.id === ganttStore.selectedTaskId }"
        >
          <div class="flex items-center gap-2 min-w-0">
            <!-- Status indicator dot -->
            <span 
              class="w-2 h-2 rounded-full shrink-0"
              :class="[
                isOverdue(task) ? 'bg-rose-500 dark:bg-rose-400' : '',
                !isOverdue(task) && task.status === 'todo' ? 'bg-slate-400 dark:bg-slate-600' : '',
                !isOverdue(task) && task.status === 'in_progress' ? 'bg-blue-500 dark:bg-blue-400' : '',
                !isOverdue(task) && task.status === 'in_review' ? 'bg-amber-500 dark:bg-amber-400' : '',
                !isOverdue(task) && task.status === 'done' ? 'bg-emerald-500 dark:bg-emerald-400' : ''
              ]"
            ></span>
            <span class="text-xs font-bold text-gray-800 dark:text-gray-200 truncate pr-1">
              {{ task.title }}
            </span>
          </div>
          <div class="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5 font-semibold">
            <span class="truncate max-w-[120px]">
              {{ task.assignees?.map(a => a.employee?.full_name).join(', ') || 'Belum di-assign' }}
            </span>
            <span v-if="task.start_date && task.end_date">&bull;</span>
            <span v-if="task.start_date && task.end_date">
              {{ diffInDays(task.start_date, task.end_date) + 1 }}d
            </span>
          </div>
        </div>

        <!-- Milestone rows list -->
        <div 
          v-for="ms in milestones" 
          :key="ms.id"
          @click="emit('milestone-selected', ms)"
          class="h-12 border-b border-gray-100 dark:border-gray-900/60 flex flex-col justify-center px-4 bg-gray-50/20 dark:bg-gray-900/10 hover:bg-gray-100/70 dark:hover:bg-gray-900/50 cursor-pointer transition duration-150"
        >
          <div class="flex items-center gap-2 min-w-0">
            <!-- Diamond shape ◆ -->
            <span class="text-[10px] text-black dark:text-white shrink-0">◆</span>
            <span class="text-xs font-bold italic text-gray-800 dark:text-gray-200 truncate">
              {{ ms.name }}
            </span>
          </div>
          <div class="text-[9px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
            Target: {{ fmtDate(ms.target_date) }}
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT SIDEBAR: TIMELINE GRAPH -->
    <div class="flex-1 flex flex-col min-w-0 h-full">
      <!-- Calendar Headers -->
      <div ref="headerScrollContainer" class="h-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-x-hidden shrink-0 flex relative">
        <div :style="{ width: timelineWidth + 'px' }" class="h-full relative shrink-0 flex">
          <div 
            v-for="h in headers" 
            :key="h.label"
            class="h-full border-r border-gray-200 dark:border-gray-800 flex flex-col justify-center px-4 shrink-0"
            :style="{ width: h.width + 'px' }"
          >
            <span class="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none mb-1">
              {{ h.label }}
            </span>
            <span class="text-xs font-bold text-gray-700 dark:text-gray-300 leading-none">
              {{ h.sublabel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Timeline Scrollable Grid -->
      <div ref="bodyScrollContainer" class="flex-1 overflow-x-auto overflow-y-auto relative flex custom-scrollbar" @scroll="onBodyScroll">
        <div :style="{ width: timelineWidth + 'px', height: timelineHeight + 'px' }" class="relative shrink-0 select-none bg-white dark:bg-gray-950">
          
          <!-- Background grids weekend overlays -->
          <div 
            v-for="line in gridLines" 
            :key="line.left" 
            class="absolute top-0 bottom-0 border-r border-gray-100 dark:border-gray-900/60"
            :class="{ 'bg-gray-50/50 dark:bg-gray-900/10': line.isWeekend && viewMode !== 'quarter' }"
            :style="{ left: line.left + 'px', width: (viewMode === 'quarter' ? 7 : 1) * dayWidth.value + 'px' }"
          >
            <span v-if="viewMode === 'week'" class="absolute top-1 left-1.5 text-[8px] font-bold text-gray-300 dark:text-gray-700 uppercase">
              {{ line.label }} {{ line.dayNumber }}
            </span>
          </div>

          <!-- TODAY vertical line indicator (strictly above all task bars) -->
          <div v-if="todayPosition !== null" 
               class="absolute top-0 bottom-0 w-0.5 bg-black z-[20] pointer-events-none"
               :style="{ left: todayPosition + 'px' }">
            <!-- TODAY label placed neatly inside the body grid container, avoiding collision with table headers -->
            <span class="absolute top-1 left-2 bg-black text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border border-black shadow-none whitespace-nowrap z-[30]">
              TODAY
            </span>
          </div>

          <!-- Absolute SVG Connector Layer -->
          <svg :style="{ width: timelineWidth + 'px', height: timelineHeight + 'px' }" class="absolute top-0 left-0 pointer-events-none z-0">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" class="dependency-arrow-path" />
              </marker>
            </defs>
            <path 
              v-for="path in dependencyPaths" 
              :key="path.id"
              :d="path.d"
              fill="none"
              class="dependency-line-path transition-all duration-300"
              marker-end="url(#arrow)"
            />
          </svg>

          <!-- Timeline Task Bars Layer -->
          <!-- CRITICAL: parent div must be position:relative to anchor absolute bars -->
          <div
            v-for="(task, idx) in tasks"
            :key="task.id"
            class="absolute left-0 right-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors duration-150"
            :style="{ top: (idx * 48) + 'px', height: '48px' }"
          >
            <!-- Bar renders only when barGeometry has valid computed dimensions -->
            <template v-if="barGeometry[task.id]">
              <div
                class="absolute flex items-center select-none transition-all duration-200 gantt-bar-item"
                :class="[
                  `status-${task.status}`,
                  { 'is-overdue': isOverdue(task) },
                  { 'is-selected z-[15]': task.id === ganttStore.selectedTaskId },
                  { 'z-[10]': task.id !== ganttStore.selectedTaskId },
                  { 'opacity-70 border-dashed border': barGeometry[task.id].isFallback }
                ]"
                :style="{
                  left: barGeometry[task.id].left + 'px',
                  width: barGeometry[task.id].width + 'px',
                  top: '10px',
                  height: '28px',
                  cursor: dragState.isDragging && dragState.taskId === task.id
                    ? (dragState.type === 'move' ? 'grabbing' : 'col-resize')
                    : 'grab'
                }"
                @mousedown="onBarMouseDown($event, task, 'move')"
                @mouseenter="onMouseEnter($event, task)"
                @mouseleave="onMouseLeave"
                @click="emit('task-selected', task.id)"
              >
                <!-- Progress track (in_progress: shows gray track with black fill) -->
                <div
                  v-if="task.status === 'in_progress' && task.progress > 0 && task.progress < 100"
                  class="absolute left-0 top-0 bottom-0 progress-fill rounded-l-full transition-all duration-300"
                  :style="{ width: task.progress + '%' }"
                />

                <!-- Percent label -->
                <span class="absolute w-full text-center text-[10px] font-black pointer-events-none z-10 tracking-wider select-none bar-percent-label">
                  {{ getBarLabel(task) }}
                </span>

                <!-- Resize handle (right edge) -->
                <div
                  class="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center shrink-0 z-20 resize-handle rounded-r-full"
                  @mousedown.stop="onBarMouseDown($event, task, 'resize')"
                >
                  <div class="h-3.5 w-px opacity-40 bg-current" />
                </div>
              </div>
            </template>

            <!-- Hint for tasks without scheduling bounds -->
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center text-[11px] text-gray-300 dark:text-gray-700 italic pointer-events-none select-none"
            >
              — tanggal belum diatur —
            </div>
          </div>

          <!-- Milestones markers layers -->
          <div 
            v-for="(ms, idx) in milestones" 
            :key="ms.id"
            @click="emit('milestone-selected', ms)"
            class="absolute w-4 h-4 z-10 flex items-center justify-center cursor-pointer group"
            :style="{
              left: dateToPixel(ms.target_date) - 8 + 'px',
              top: ((tasks.length + idx) * 48) + 16 + 'px',
            }"
            :title="`${ms.name} - Target: ${fmtDate(ms.target_date)}`"
          >
            <!-- Rotated Diamond square marker ◆ -->
            <div class="w-3 h-3 bg-black dark:bg-white group-hover:bg-gray-700 dark:group-hover:bg-gray-300 rotate-45 border border-white dark:border-black shadow-sm shrink-0 transition duration-150"></div>
          </div>

          <!-- HTML Positioned dynamic hovered tooltip detail panel -->
          <div 
            v-if="hoveredTask" 
            class="absolute z-50 bg-[#141414] text-white p-3 rounded-xl border border-white/10 shadow-2xl text-[11px] flex flex-col gap-1 w-56 pointer-events-none select-none"
            :style="{
              left: hoveredTask.x + 'px',
              top: (hoveredTask.y < 120 ? hoveredTask.y + 38 : hoveredTask.y - 122) + 'px'
            }"
          >
            <div class="font-extrabold text-xs text-white truncate mb-1 border-b border-white/10 pb-1.5">{{ hoveredTask.task.title }}</div>
            <div class="flex items-center justify-between text-gray-400">
              <span>Mulai:</span>
              <span class="font-bold text-white">{{ fmtDate(hoveredTask.task.start_date) }}</span>
            </div>
            <div class="flex items-center justify-between text-gray-400">
              <span>Selesai:</span>
              <span class="font-bold text-white">{{ fmtDate(hoveredTask.task.end_date) }}</span>
            </div>
            <div class="flex items-center justify-between text-gray-400">
              <span>Progress:</span>
              <span class="font-bold text-white">{{ hoveredTask.task.progress || 0 }}%</span>
            </div>
            <div class="flex items-center justify-between text-gray-400" v-if="hoveredTask.task.assignees?.length">
              <span>Assignee:</span>
              <span class="font-bold text-white truncate max-w-[110px]">{{ hoveredTask.task.assignees.map(a => a.employee?.full_name).join(', ') }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }

.cursor-col-resize { cursor: col-resize; }

/* ─── GANTT BAR — PREMIUM MONOCHROME SYSTEM ─── */

.gantt-bar-item {
  border-radius: 9999px;     /* pill shape */
  border-width: 1px;
  border-style: solid;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06);
  transition: box-shadow 0.15s ease, transform 0.1s ease;
}
.gantt-bar-item:hover {
  box-shadow: 0 4px 12px 0 rgb(0 0 0 / 0.12), 0 2px 4px -1px rgb(0 0 0 / 0.08);
  transform: translateY(-0.5px);
}

/* ── TO DO ── clean, minimal */
.gantt-bar-item.status-todo {
  background: #ffffff;
  border-color: #d1d5db;
  color: #6b7280;
  box-shadow: inset 0 0 0 0 transparent, 0 1px 2px rgb(0 0 0 / 0.06);
}
.dark .gantt-bar-item.status-todo {
  background: #1f2937;
  border-color: #374151;
  color: #9ca3af;
}

/* ── IN PROGRESS ── gray track + black fill via ::before pseudo-progress ── */
.gantt-bar-item.status-in_progress {
  background: #f3f4f6;
  border-color: #e5e7eb;
  color: #111827;
  box-shadow: inset 0 1px 3px rgb(0 0 0 / 0.07);
}
.dark .gantt-bar-item.status-in_progress {
  background: #111827;
  border-color: #1f2937;
  color: #f9fafb;
}

/* ── IN REVIEW ── slightly darker tint */
.gantt-bar-item.status-in_review {
  background: #e5e7eb;
  border-color: #d1d5db;
  color: #374151;
}
.dark .gantt-bar-item.status-in_review {
  background: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}

/* ── ON HOLD ── hatched feel via repeating gradient */
.gantt-bar-item.status-on_hold {
  background: repeating-linear-gradient(
    -45deg,
    #f9fafb 0px,
    #f9fafb 4px,
    #e5e7eb 4px,
    #e5e7eb 8px
  );
  border-color: #d1d5db;
  color: #6b7280;
}
.dark .gantt-bar-item.status-on_hold {
  background: repeating-linear-gradient(
    -45deg,
    #111827 0px,
    #111827 4px,
    #1f2937 4px,
    #1f2937 8px
  );
  border-color: #374151;
  color: #9ca3af;
}

/* ── DONE ── solid black pill */
.gantt-bar-item.status-done {
  background: #111827;
  border-color: #111827;
  color: #ffffff;
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.25), 0 1px 3px rgb(0 0 0 / 0.15);
}
.dark .gantt-bar-item.status-done {
  background: #f9fafb;
  border-color: #f3f4f6;
  color: #111827;
  box-shadow: 0 2px 8px 0 rgb(255 255 255 / 0.12);
}

/* ── CANCELLED ── dimmed strikethrough feel */
.gantt-bar-item.status-cancelled {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #9ca3af;
  opacity: 0.6;
}
.dark .gantt-bar-item.status-cancelled {
  background: #111827;
  border-color: #1f2937;
  color: #6b7280;
  opacity: 0.5;
}

/* ── OVERDUE ── black bar with red ring glow */
.gantt-bar-item.is-overdue {
  background: #111827;
  border-color: #ef4444;
  color: #ffffff;
  box-shadow:
    0 0 0 1px #ef4444,
    0 0 8px 0 rgb(239 68 68 / 0.25),
    0 2px 6px 0 rgb(0 0 0 / 0.2);
}
.dark .gantt-bar-item.is-overdue {
  background: #7f1d1d;
  border-color: #f87171;
  color: #fef2f2;
  box-shadow:
    0 0 0 1px #f87171,
    0 0 10px 0 rgb(248 113 113 / 0.3);
}

/* ── SELECTED RING ── pure black, no color ── */
.gantt-bar-item.is-selected {
  box-shadow:
    0 0 0 2px #ffffff,
    0 0 0 4px #111827,
    0 4px 12px 0 rgb(0 0 0 / 0.2);
}
.dark .gantt-bar-item.is-selected {
  box-shadow:
    0 0 0 2px #111827,
    0 0 0 4px #f9fafb,
    0 4px 12px 0 rgb(255 255 255 / 0.12);
}

/* ── Progress fill: always black inside in-progress bar ── */
.progress-fill {
  background: #111827;
  border-radius: 9999px 0 0 9999px;
}
.dark .progress-fill {
  background: #f9fafb;
  border-radius: 9999px 0 0 9999px;
}

.bar-percent-label {
  color: inherit;
  mix-blend-mode: normal;
  text-shadow: none;
}

/* ── Dependency SVG lines: charcoal / muted ── */
.dependency-line-path {
  stroke: #9ca3af;
  stroke-width: 1.5px;
  stroke-dasharray: none;
}
.dependency-arrow-path {
  fill: #9ca3af;
}
.dark .dependency-line-path {
  stroke: #4b5563;
}
.dark .dependency-arrow-path {
  fill: #4b5563;
}
</style>

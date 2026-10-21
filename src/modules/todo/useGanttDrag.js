import { reactive, onMounted, onUnmounted } from 'vue'

export function useGanttDrag(ganttStore, options) {
  // options: { getDayWidth, pixelToDate, dateToPixel }

  const dragState = reactive({
    isDragging: false,
    taskId: null,
    type: null,        // 'move' | 'resize'
    startX: 0,
    startY: 0,
    originalTask: null, // snapshot before drag (for rollback)
    currentLeft: 0,     // bar left position in pixels
    currentWidth: 0,    // bar width in pixels
  })

  function onBarMouseDown(event, task, type = 'move') {
    ganttStore.selectTask(task.id)
    event.preventDefault()
    event.stopPropagation()

    dragState.isDragging = true
    dragState.taskId = task.id
    dragState.type = type
    dragState.startX = event.clientX
    dragState.originalTask = {
      start_date: task.start_date,
      end_date: task.end_date,
    }
    
    dragState.currentLeft = options.dateToPixel(task.start_date)
    dragState.currentWidth = options.dateToPixel(task.end_date) - dragState.currentLeft

    document.body.style.cursor = type === 'move' ? 'grabbing' : 'col-resize'
    document.body.style.userSelect = 'none'

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function onMouseMove(event) {
    if (!dragState.isDragging) return
    
    requestAnimationFrame(() => {
      const deltaX = event.clientX - dragState.startX
      const deltaDays = Math.round(deltaX / options.getDayWidth())
      
      const task = ganttStore.tasks.find(t => t.id === dragState.taskId)
      if (!task) return

      if (dragState.type === 'move') {
        const origStart = new Date(dragState.originalTask.start_date)
        const origEnd = new Date(dragState.originalTask.end_date)
        
        // Add delta days using date calculations
        const newStart = addDays(origStart, deltaDays)
        const newEnd = addDays(origEnd, deltaDays)
        
        task.start_date = formatDateISO(newStart)
        task.end_date = formatDateISO(newEnd)
      } else {
        const origStart = new Date(dragState.originalTask.start_date)
        const origEnd = new Date(dragState.originalTask.end_date)
        const currentDuration = Math.round((origEnd - origStart) / (1000 * 60 * 60 * 24))
        
        const newDuration = Math.max(1, currentDuration + deltaDays)
        const newEnd = addDays(origStart, newDuration)
        
        task.end_date = formatDateISO(newEnd)
      }
    })
  }

  async function onMouseUp(event) {
    if (!dragState.isDragging) return
    
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)

    const taskId = dragState.taskId
    const originalTask = dragState.originalTask
    
    // Reset dragging styles
    dragState.isDragging = false
    dragState.taskId = null
    dragState.type = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''

    const task = ganttStore.tasks.find(t => t.id === taskId)
    if (task) {
      try {
        await ganttStore.updateTaskDates(
          task.id,
          task.start_date,
          task.end_date
        )
      } catch (e) {
        console.error('Persist dates failed:', e)
        // snapback is handled by store internally, but manually trigger refetch if needed
        await ganttStore.fetchGanttData(ganttStore.board.id)
      }
    }
  }

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  })

  return { dragState, onBarMouseDown }
}

// Helpers
function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDateISO(date) {
  return date.toISOString().split('T')[0] // "YYYY-MM-DD"
}

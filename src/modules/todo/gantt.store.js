import { defineStore } from 'pinia';
import { GanttService } from './gantt.service';

export const useGanttStore = defineStore('gantt-module', {
  state: () => ({
    tasks: [],
    milestones: [],
    board: null,
    loading: false,
    error: null,
    viewMode: 'week', // 'week' | 'month' | 'quarter'
    currentDate: new Date(),
    selectedTaskId: null,
    dragState: {
      isDragging: false,
      taskId: null,
      type: null, // 'move' | 'resize-start' | 'resize-end'
    },
  }),

  getters: {
    selectedTask: (state) => state.tasks.find((t) => t.id === state.selectedTaskId) || null,

    sortedTasks: (state) => {
      return [...state.tasks].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    },

    tasksWithDates() {
      return this.sortedTasks.filter((t) => t.start_date && t.end_date);
    },

    tasksWithoutDates() {
      return this.sortedTasks.filter((t) => !t.start_date || !t.end_date);
    },

    totalTaskCount: (state) => state.tasks.length,

    completedTaskCount: (state) => state.tasks.filter((t) => t.status === 'done').length,

    inProgressTaskCount: (state) => state.tasks.filter((t) => t.status === 'in_progress').length,

    overdueTaskCount: (state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.tasks.filter(
        (t) =>
          t.end_date &&
          new Date(t.end_date) < today &&
          t.status !== 'done' &&
          t.status !== 'cancelled'
      ).length;
    },

    overallProgress: (state) => {
      if (state.tasks.length === 0) return 0;
      const total = state.tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
      return Math.round(total / state.tasks.length);
    },

    tasksByStatus: (state) => {
      const groups = {
        todo: [],
        in_progress: [],
        on_hold: [],
        in_review: [],
        done: [],
        cancelled: [],
      };
      state.tasks.forEach((t) => {
        if (groups[t.status]) {
          groups[t.status].push(t);
        } else {
          groups.todo.push(t);
        }
      });
      return groups;
    },

    timelineRange: (state) => {
      const getMonday = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
      };

      const baseDate = new Date(state.currentDate);
      baseDate.setHours(0, 0, 0, 0);

      let start = new Date();
      let end = new Date();

      if (state.viewMode === 'week') {
        // Monday of current week
        start = getMonday(baseDate);
        // 4 weeks ahead (28 days)
        end = new Date(start);
        end.setDate(start.getDate() + 27);
        end.setHours(23, 59, 59, 999);
      } else if (state.viewMode === 'month') {
        // First day of current month
        start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        // Last day of current month
        end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
      } else if (state.viewMode === 'quarter') {
        // First day of current month
        start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        // Last day of 3rd month from now
        end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 3, 0);
        end.setHours(23, 59, 59, 999);
      }

      return { start, end };
    },
  },

  actions: {
    async fetchGanttData(boardId) {
      this.loading = true;
      this.error = null;
      try {
        const data = await GanttService.getGanttData(boardId);
        this.tasks = data.tasks || [];
        this.milestones = data.milestones || [];
        this.board = data.board || null;
      } catch (err) {
        console.error('fetchGanttData failed:', err);
        this.error = err.response?.data?.message || 'Gagal memuat data Gantt Chart.';
      } finally {
        this.loading = false;
      }
    },

    async updateTaskDates(taskId, startDate, endDate) {
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return;

      const oldStartDate = this.tasks[taskIndex].start_date;
      const oldEndDate = this.tasks[taskIndex].end_date;

      // Optimistic Update
      this.tasks[taskIndex].start_date = startDate;
      this.tasks[taskIndex].end_date = endDate;

      try {
        const updatedTask = await GanttService.updateTaskDates(taskId, startDate, endDate);
        this.tasks[taskIndex].start_date = updatedTask.start_date;
        this.tasks[taskIndex].end_date = updatedTask.end_date;
      } catch (err) {
        console.error('updateTaskDates failed:', err);
        // Rollback
        this.tasks[taskIndex].start_date = oldStartDate;
        this.tasks[taskIndex].end_date = oldEndDate;
        this.error = err.response?.data?.message || 'Gagal memperbarui tanggal tugas.';
        throw err;
      }
    },

    async updateTaskProgress(taskId, progress) {
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return;

      const oldProgress = this.tasks[taskIndex].progress;
      const oldStatus = this.tasks[taskIndex].status;

      // Optimistic Update
      this.tasks[taskIndex].progress = progress;
      if (progress === 100) {
        this.tasks[taskIndex].status = 'done';
      } else if (progress < 100 && oldStatus === 'done') {
        this.tasks[taskIndex].status = 'in_progress';
      }

      try {
        const updatedTask = await GanttService.updateTaskProgress(taskId, progress);
        this.tasks[taskIndex].progress = updatedTask.progress;
        this.tasks[taskIndex].status = updatedTask.status;
      } catch (err) {
        console.error('updateTaskProgress failed:', err);
        // Rollback
        this.tasks[taskIndex].progress = oldProgress;
        this.tasks[taskIndex].status = oldStatus;
        this.error = err.response?.data?.message || 'Gagal memperbarui progress tugas.';
        throw err;
      }
    },

    async addDependency(taskId, dependsOnTaskId, dependencyType) {
      this.error = null;
      try {
        const newDependency = await GanttService.addDependency(taskId, dependsOnTaskId, dependencyType);
        
        // Push ke task locally
        const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          if (!this.tasks[taskIndex].dependencies) {
            this.tasks[taskIndex].dependencies = [];
          }
          this.tasks[taskIndex].dependencies.push({
            id: newDependency.id,
            depends_on_task_id: dependsOnTaskId,
            dependency_type: dependencyType,
          });
        }
        return newDependency;
      } catch (err) {
        console.error('addDependency failed:', err);
        this.error = err.response?.data?.message || 'Gagal menambahkan ketergantungan tugas.';
        throw err;
      }
    },

    async removeDependency(dependencyId, taskId) {
      this.error = null;
      try {
        await GanttService.removeDependency(dependencyId);
        
        // Filter out locally
        const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1 && this.tasks[taskIndex].dependencies) {
          this.tasks[taskIndex].dependencies = this.tasks[taskIndex].dependencies.filter(
            (d) => d.id !== dependencyId
          );
        }
      } catch (err) {
        console.error('removeDependency failed:', err);
        this.error = err.response?.data?.message || 'Gagal menghapus ketergantungan tugas.';
        throw err;
      }
    },

    async createMilestone(boardId, data) {
      this.error = null;
      try {
        const newMilestone = await GanttService.createMilestone(boardId, data);
        this.milestones.push(newMilestone);
        return newMilestone;
      } catch (err) {
        console.error('createMilestone failed:', err);
        this.error = err.response?.data?.message || 'Gagal membuat milestone baru.';
        throw err;
      }
    },

    async updateMilestone(milestoneId, data) {
      const idx = this.milestones.findIndex((m) => m.id === milestoneId);
      if (idx === -1) return;

      const oldMilestone = { ...this.milestones[idx] };

      // Optimistic Update
      this.milestones[idx] = { ...this.milestones[idx], ...data };

      try {
        const updated = await GanttService.updateMilestone(milestoneId, data);
        this.milestones[idx] = {
          ...this.milestones[idx],
          ...updated,
          created_by_name: oldMilestone.created_by_name
        };
      } catch (err) {
        console.error('updateMilestone failed:', err);
        // Rollback
        this.milestones[idx] = oldMilestone;
        this.error = err.response?.data?.message || 'Gagal memperbarui milestone.';
        throw err;
      }
    },

    async deleteMilestone(milestoneId) {
      this.error = null;
      try {
        await GanttService.deleteMilestone(milestoneId);
        this.milestones = this.milestones.filter((m) => m.id !== milestoneId);
      } catch (err) {
        console.error('deleteMilestone failed:', err);
        this.error = err.response?.data?.message || 'Gagal menghapus milestone.';
        throw err;
      }
    },

    async reorderTasks(boardId, taskIds) {
      // Backup current task orders
      const originalTasks = JSON.parse(JSON.stringify(this.tasks));

      // Optimistic update of sort_orders locally
      taskIds.forEach((id, index) => {
        const task = this.tasks.find((t) => t.id === id);
        if (task) task.sort_order = index;
      });

      // Sort locally immediately
      this.tasks.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      try {
        await GanttService.reorderTasks(boardId, taskIds);
      } catch (err) {
        console.error('reorderTasks failed:', err);
        // Rollback
        this.tasks = originalTasks;
        this.error = err.response?.data?.message || 'Gagal menyusun ulang tugas.';
        throw err;
      }
    },

    setViewMode(mode) {
      this.viewMode = mode;
    },

    navigateTimeline(direction) {
      const step = direction === 'next' ? 1 : -1;
      const baseDate = new Date(this.currentDate);

      if (this.viewMode === 'week') {
        baseDate.setDate(baseDate.getDate() + step * 7);
      } else if (this.viewMode === 'month') {
        baseDate.setMonth(baseDate.getMonth() + step * 1);
      } else if (this.viewMode === 'quarter') {
        baseDate.setMonth(baseDate.getMonth() + step * 3);
      }

      this.currentDate = baseDate;
    },

    goToToday() {
      this.currentDate = new Date();
    },

    selectTask(taskId) {
      this.selectedTaskId = taskId;
    },
  },
});

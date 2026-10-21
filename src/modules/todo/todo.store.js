import { defineStore } from 'pinia';
import { TodoService } from './todo.service';

export const useTodoStore = defineStore('todo-module', {
  state: () => ({
    boards: [],
    currentBoard: null,
    tasks: [],
    selectedTask: null,
    isLoading: false,
    isTaskLoading: false,
    todoReminderCount: 0,
    todoReminders: [],
    assignable: [],
    _remindersPromise: null, // Untuk request deduplication
  }),

  actions: {
    async fetchBoards(params = {}) {
      this.isLoading = true;
      try {
        const result = await TodoService.getBoards(params);
        this.boards = result.data || [];
      } catch (e) {
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchBoardById(id) {
      this.isLoading = true;
      try {
        const board = await TodoService.getBoardById(id);
        this.currentBoard = board;
        return board;
      } catch (e) {
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },

    async createBoard(data) {
      const res = await TodoService.createBoard(data);
      await this.fetchBoards();
      return res;
    },

    async updateBoard(id, data) {
      const res = await TodoService.updateBoard(id, data);
      await this.fetchBoards();
      if (this.currentBoard?.id === id) {
        this.currentBoard = { ...this.currentBoard, ...data };
      }
      return res;
    },

    async deleteBoard(id) {
      await TodoService.deleteBoard(id);
      this.boards = this.boards.filter(b => b.id !== id);
      if (this.currentBoard?.id === id) this.currentBoard = null;
    },

    async fetchTasks(params = {}) {
      this.isLoading = true;
      try {
        const result = await TodoService.getTasks(params);
        this.tasks = result.data || [];
        return result;
      } catch (e) {
        console.error(e);
        return { data: [] };
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTaskById(id) {
      this.isTaskLoading = true;
      try {
        const task = await TodoService.getTaskById(id);
        this.selectedTask = task;
        return task;
      } catch (e) {
        console.error(e);
      } finally {
        this.isTaskLoading = false;
      }
    },

    async createTask(data) {
      const res = await TodoService.createTask(data);
      // Push to local tasks if board matches
      if (res?.data) this.tasks.unshift(res.data);
      return res;
    },

    async updateTask(id, data) {
      const res = await TodoService.updateTask(id, data);
      const idx = this.tasks.findIndex(t => t.id === id);
      if (idx !== -1 && res?.data) this.tasks[idx] = { ...this.tasks[idx], ...res.data };
      if (this.selectedTask?.id === id && res?.data) {
        this.selectedTask = { ...this.selectedTask, ...res.data };
      }
      return res;
    },

    async assignTask(id, employee_ids) {
      const res = await TodoService.assignTask(id, employee_ids);
      return res;
    },

    async fetchAssignableEmployees() {
      try {
        const res = await TodoService.getAssignableEmployees();
        this.assignable = res || [];
        return res;
      } catch (e) {
        console.error(e);
        return [];
      }
    },

    async deleteTask(id) {
      const res = await TodoService.deleteTask(id);
      this.tasks = this.tasks.filter(t => t.id !== id);
      if (this.selectedTask?.id === id) this.selectedTask = null;
      return res;
    },

    async addComment(taskId, formData) {
      const res = await TodoService.addComment(taskId, formData);
      if (this.selectedTask?.id === taskId) {
        await this.fetchTaskById(taskId);
      }
      return res;
    },

    async fetchReminders() {
      // Jika ada request yang sedang berjalan, kembalikan promise yang sama (Request Deduplication)
      if (this._remindersPromise) {
        return this._remindersPromise;
      }

      this._remindersPromise = (async () => {
        try {
          const data = await TodoService.getReminders();
          this.todoReminders = Array.isArray(data) ? data : [];
          this.todoReminderCount = this.todoReminders.length;
          return this.todoReminders;
        } catch (e) {
          console.error(e);
          return [];
        } finally {
          this._remindersPromise = null;
        }
      })();

      return this._remindersPromise;
    },

    async dismissReminder(reminderId) {
      try {
        await TodoService.dismissReminder(reminderId);
        this.todoReminders = this.todoReminders.filter((r) => r.id !== reminderId);
        this.todoReminderCount = this.todoReminders.length;
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  },
});

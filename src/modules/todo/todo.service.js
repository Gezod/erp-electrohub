import axios from '@/plugins/axios';

export const TodoService = {
  // ── Boards ──────────────────────────────────────────────────────────────
  getBoards: async (params = {}) => {
    const r = await axios.get('/todo/boards', { params });
    return { data: r.data?.data || [], pagination: r.data?.pagination || null };
  },
  getBoardById: async (id) => {
    const r = await axios.get(`/todo/boards/${id}`);
    return r.data?.data || r.data;
  },
  createBoard: async (data) => {
    const r = await axios.post('/todo/boards', data);
    return r.data;
  },
  updateBoard: async (id, data) => {
    const r = await axios.put(`/todo/boards/${id}`, data);
    return r.data;
  },
  deleteBoard: async (id) => {
    const r = await axios.delete(`/todo/boards/${id}`);
    return r.data;
  },

  // ── Tasks ──────────────────────────────────────────────────────────────
  getTasks: async (params = {}) => {
    const r = await axios.get('/todo/tasks', { params });
    return { data: r.data?.data || [], pagination: r.data?.pagination || null };
  },
  getTaskById: async (id) => {
    const r = await axios.get(`/todo/tasks/${id}`);
    return r.data?.data || r.data;
  },
  createTask: async (data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const r = await axios.post('/todo/tasks', data, config);
    return r.data;
  },
  updateTask: async (id, data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const r = await axios.put(`/todo/tasks/${id}`, data, config);
    return r.data;
  },
  deleteTask: async (id) => {
    const r = await axios.delete(`/todo/tasks/${id}`);
    return r.data;
  },
  assignTask: async (id, employee_ids) => {
    const r = await axios.post(`/todo/tasks/${id}/assign`, { employee_ids });
    return r.data;
  },
  getAssignableEmployees: async () => {
    const r = await axios.get('/todo/tasks/assignable');
    return r.data?.data || r.data || [];
  },
  getReminders: async () => {
    const r = await axios.get('/todo/reminders');
    return r.data?.data || r.data || [];
  },
  dismissReminder: async (id) => {
    const r = await axios.patch(`/todo/reminders/${id}/dismiss`);
    return r.data;
  },
  addComment: async (id, payload) => {
    const r = await axios.post(`/todo/tasks/${id}/comments`, payload);
    return r.data?.data || r.data;
  },
};

import axios from '@/plugins/axios';

export const GanttService = {
  getGanttData: async (boardId) => {
    const r = await axios.get(`/gantt/board/${boardId}`);
    return r.data?.data || r.data;
  },

  updateTaskDates: async (taskId, startDate, endDate) => {
    const r = await axios.put(`/gantt/task/${taskId}/dates`, {
      start_date: startDate,
      end_date: endDate,
    });
    return r.data?.data || r.data;
  },

  updateTaskProgress: async (taskId, progress) => {
    const r = await axios.put(`/gantt/task/${taskId}/progress`, { progress });
    return r.data?.data || r.data;
  },

  addDependency: async (taskId, dependsOnTaskId, dependencyType) => {
    const r = await axios.post(`/gantt/task/${taskId}/dependency`, {
      depends_on_task_id: dependsOnTaskId,
      dependency_type: dependencyType,
    });
    return r.data?.data || r.data;
  },

  removeDependency: async (dependencyId) => {
    const r = await axios.delete(`/gantt/dependency/${dependencyId}`);
    return r.data;
  },

  getMilestones: async (boardId) => {
    const r = await axios.get(`/gantt/board/${boardId}/milestones`);
    return r.data?.data || r.data || [];
  },

  createMilestone: async (boardId, data) => {
    const r = await axios.post(`/gantt/board/${boardId}/milestones`, data);
    return r.data?.data || r.data;
  },

  updateMilestone: async (milestoneId, data) => {
    const r = await axios.put(`/gantt/milestones/${milestoneId}`, data);
    return r.data?.data || r.data;
  },

  deleteMilestone: async (milestoneId) => {
    const r = await axios.delete(`/gantt/milestones/${milestoneId}`);
    return r.data;
  },

  reorderTasks: async (boardId, taskIds) => {
    const r = await axios.put(`/gantt/board/${boardId}/reorder`, { task_ids: taskIds });
    return r.data;
  },
};

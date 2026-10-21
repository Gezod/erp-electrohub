import { defineStore } from 'pinia'
import { StoreAssignmentService } from './storeAssignment.service'

export const useStoreAssignmentStore = defineStore('marketing-store-assignment', {
  state: () => ({
    assignments: [],
    pagination: { totalData: 0, currentPage: 1, totalPages: 1, dataPerPage: 10 },
    isLoading: false,
    currentAssignment: null,
  }),

  actions: {
    async fetchAssignments(params = {}) {
      this.isLoading = true
      try {
        const result = await StoreAssignmentService.getAll(params)
        this.assignments = result.data
        this.pagination = result.pagination || this.pagination
      } catch (error) {
        console.error('Failed to fetch store assignments:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchAssignmentById(id) {
      this.isLoading = true
      try {
        this.currentAssignment = await StoreAssignmentService.getById(id)
        return this.currentAssignment
      } finally {
        this.isLoading = false
      }
    },

    // Aksi mutasi sengaja TIDAK memanggil fetchAssignments() sendiri — halaman
    // list yang memegang state filter yang me-refresh (lewat @saved / refreshTable).
    // Refetch dari sini akan mengirim params kosong dan menghapus filter aktif.
    async createAssignment(payload) {
      return await StoreAssignmentService.create(payload)
    },

    async updateAssignment(id, payload) {
      return await StoreAssignmentService.update(id, payload)
    },

    async unassign(id, payload = {}) {
      return await StoreAssignmentService.unassign(id, payload)
    },
  },
})

import { defineStore } from 'pinia'
import { AdminPusatRosterService } from './adminPusatRoster.service'

export const useAdminPusatRosterStore = defineStore('marketing-admin-pusat-roster', {
  state: () => ({
    members: [],
    pagination: { totalData: 0, currentPage: 1, totalPages: 1, dataPerPage: 10 },
    isLoading: false,
    currentMember: null,
  }),

  actions: {
    async fetchMembers(params = {}) {
      this.isLoading = true
      try {
        const result = await AdminPusatRosterService.getAll(params)
        this.members = result.data
        this.pagination = result.pagination || this.pagination
      } catch (error) {
        console.error('Failed to fetch admin pusat roster:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchMemberById(id) {
      this.isLoading = true
      try {
        this.currentMember = await AdminPusatRosterService.getById(id)
        return this.currentMember
      } finally {
        this.isLoading = false
      }
    },

    // Aksi mutasi sengaja TIDAK memanggil fetchMembers() sendiri — halaman
    // list yang memegang state filter yang me-refresh (lewat @saved / refreshTable).
    // Refetch dari sini akan mengirim params kosong dan menghapus filter aktif.
    async createMember(payload) {
      return await AdminPusatRosterService.create(payload)
    },

    async updateMember(id, payload) {
      return await AdminPusatRosterService.update(id, payload)
    },

    async unassign(id, payload = {}) {
      return await AdminPusatRosterService.unassign(id, payload)
    },
  },
})

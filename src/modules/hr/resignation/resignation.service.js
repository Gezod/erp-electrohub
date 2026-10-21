import axios from '@/plugins/axios'

const resignationService = {
  getResignations(params) {
    return axios.get('/hr/resignations', { params })
  },

  createResignation(data) {
    return axios.post('/hr/resignations', data)
  },

  updateResignation(id, data) {
    return axios.put(`/hr/resignations/${id}`, data)
  },

  deleteResignation(id) {
    return axios.delete(`/hr/resignations/${id}`)
  },

  // Helper untuk mencari user/karyawan yang akan di-resign
  searchEmployees(search) {
    return axios.get('/users', { 
      params: { 
        search, 
        status: 'active',
        is_active: 'true'
      } 
    })
  }
}

export default resignationService

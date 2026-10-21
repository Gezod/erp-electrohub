import axios from '@/plugins/axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const ContactPublicService = {
  getStoreContacts: async () => {
    const response = await axios.get(`${BASE_URL}/public/store-contacts`)
    return response.data
  }
}

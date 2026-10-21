import { useAuthStore } from '@/modules/auth/stores/auth.store'

export default {
  install: (app) => {
    app.directive('can', {
      mounted(el, binding) {
        const authStore = useAuthStore()
        const privilege = binding.value

        if (!authStore.hasPrivilege(privilege)) {
          // Opsi 1: Hapus dari DOM (lebih aman)
          if (el.parentNode) {
            el.parentNode.removeChild(el)
          } else {
            // Opsi 2: Sembunyikan jika parent belum tersedia
            el.style.display = 'none'
          }
        }
      },
      // Penting: Update jika privilege atau user status berubah
      updated(el, binding) {
        const authStore = useAuthStore()
        const privilege = binding.value

        if (!authStore.hasPrivilege(privilege)) {
          el.style.display = 'none'
        } else {
          el.style.display = ''
        }
      }
    })
  }
}

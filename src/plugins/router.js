import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useLoadingStore } from '@/plugins/stores/loading.store'
import { routes } from './routes'
import Cookies from 'js-cookie'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const loadingStore = useLoadingStore()
  loadingStore.startLoading()

  // Set page title
  document.title = to.meta.title ? `${to.meta.title} | ERP ElectroHub` : 'ERP ElectroHub'

  next()
})

router.afterEach(() => {
  const loadingStore = useLoadingStore()
  loadingStore.finishLoading()
})

export const getFirstAllowedPath = () => {
  // Welcome tidak dijaga permission apapun (requiresAuth saja), jadi selalu jadi landing
  // page default untuk semua user login — dashboard per-divisi menyusul dari sini nanti.
  return '/welcome';
};

router.beforeResolve(async (to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  const refreshToken = Cookies.get('refresh_token')

  // 1. Check Authentication
  // Kita coba restore session jika salah satu token ada
  if (!authStore.isAuthenticated && (token || refreshToken)) {
    try {
      await authStore.attempt()
    } catch (error) {
      // Failed to attempt, session might be truly invalid
      console.error("Router guard: Auth attempt failed", error)
    }
  }

  // 2. Guard for Guest (Already logged in but trying to access guest pages like Login)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const defaultPath = getFirstAllowedPath(authStore)
    return next({ path: defaultPath })
  }

  // 3. Guard for Auth (Not logged in but trying to access internal pages)
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // 4. Privilege Check
  if (to.meta.privilege) {
    const domain = to.meta.privilege
    let requiredPrivilege = domain
    if (!domain.includes(':')) {
      requiredPrivilege = `${domain}:read`
    }

    if (!authStore.hasPrivilege(requiredPrivilege)) {
      const defaultPath = getFirstAllowedPath(authStore)
      if (to.path !== defaultPath) {
        return next({ path: defaultPath })
      } else {
        return next()
      }
    }
  }

  return next()
})

export default (app) => {
  app.use(router)
}

export { router }

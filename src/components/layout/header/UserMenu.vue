<template>
  <div class="relative w-full" ref="dropdownRef">
    <button
      class="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-150 w-full text-left cursor-pointer outline-none"
      :class="{ 'justify-center': collapsed }"
      @click.prevent="toggleDropdown"
    >
      <!-- Minimalist Monogram Avatar -->
      <div class="relative w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold shadow-2xs border border-zinc-800 dark:border-zinc-200 transition-transform duration-150">
        {{ userName?.charAt(0) || 'U' }}
        <!-- Online status dot indicator -->
        <div class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-zinc-950"></div>
      </div>

      <!-- Text details -->
      <div v-if="!collapsed" class="flex flex-col min-w-0 flex-1 leading-none pr-1">
        <span class="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">{{ userName }}</span>
        <span class="text-[10px] font-normal text-zinc-500 dark:text-zinc-400 mt-1 truncate">{{ isAdmin ? 'Administrator' : divisionName }}</span>
      </div>

      <ChevronDownIcon v-if="!collapsed" :class="['w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 ml-auto transition-transform duration-200 shrink-0', { 'rotate-180': dropdownOpen }]" />
    </button>

    <!-- Dropdown Start -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 translate-y-1 opacity-0"
      enter-to-class="transform scale-100 translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 translate-y-0 opacity-100"
      leave-to-class="transform scale-95 translate-y-1 opacity-0"
    >
      <div
        v-if="dropdownOpen"
        class="absolute bottom-full left-0 mb-2 w-60 origin-bottom-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-xl z-[9999]"
      >
        <div class="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
          <p class="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Signed in as</p>
          <p class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{{ userEmail }}</p>
        </div>
        <div class="p-1 mt-1">
          <button
            @click="signOut"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors duration-150 cursor-pointer"
          >
            <LogoutIcon class="w-4 h-4" />
            Keluar Aplikasi
          </button>
        </div>
      </div>
    </transition>
    <!-- Dropdown End -->
  </div>
</template>

<script setup>
import { ChevronDownIcon, LogoutIcon } from '@/icons'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()
const router = useRouter()
const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const userEmail = computed(() => authStore.user?.email || '')
const userName = computed(() => authStore.user?.displayName || '')
const isAdmin = computed(() => authStore.user?.isAdmin === true || authStore.user?.is_superadmin === true || authStore.user?.is_admin === true)

const divisionName = computed(() => {
  const u = authStore.user
  if (!u) return 'Staff Member'
  return u.divisionName || u.division_name || u.employee?.division?.name || 'Staff Member'
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const signOut = async () => {
  try {
    await authStore.logout()
    router.push({ name: 'Login' })
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    closeDropdown()
  }
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

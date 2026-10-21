<template>
  <div class="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 xl:flex overflow-x-hidden text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
    <app-sidebar />
    <Backdrop />
    
    <div
      class="relative z-10 flex-1 min-w-0 transition-all duration-300 ease-out"
      :class="[isExpanded ? 'lg:ml-[264px]' : 'lg:ml-[80px]']"
    >
      <app-header v-if="!hideHeader" />
      <div class="p-5 mx-auto max-w-(--breakpoint-2xl) lg:p-7">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useSidebar } from '@/composables/useSidebar'
import Backdrop from './Backdrop.vue'

defineProps({
  hideHeader: {
    type: Boolean,
    default: false
  }
})

const { isExpanded } = useSidebar()
</script>

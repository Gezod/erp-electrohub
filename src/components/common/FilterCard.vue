<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform -translate-y-2 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-2 opacity-0"
  >
    <div v-if="show" class="mb-6 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-theme-xs transition-all duration-300">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-1.5 h-4 bg-brand-500 rounded-full"></div>
        <span class="text-[11px] font-semibold text-brand-500 uppercase tracking-[0.15em]">Opsi Filter</span>
      </div>
      
      <div :class="gridClass" class="grid items-end gap-6">
        <slot></slot>
      </div>
      
      <div v-if="$slots.footer" class="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <slot name="footer"></slot>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  cols: {
    type: [Number, String],
    default: 3
  }
});

const gridClass = computed(() => {
  const colMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6',
  };
  return colMap[props.cols] || 'grid-cols-1 md:grid-cols-3';
});
</script>

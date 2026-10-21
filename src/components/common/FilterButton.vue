<template>
  <button 
    @click="$emit('update:active', !active)"
    type="button"
    :class="[
      'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border rounded-xl transition-all duration-200 shadow-theme-xs outline-none',
      active 
        ? 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400' 
        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700'
    ]"
  >
    <Filter class="size-4" :class="{ 'fill-brand-500/10': active }" />
    <span class="font-semibold tracking-tight text-[13px]">{{ active ? 'Sembunyikan Filter' : 'Tampilkan Filter' }}</span>
  </button>
</template>

<script setup>
import { Filter } from 'lucide-vue-next';

defineProps({
  active: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:active']);
</script>

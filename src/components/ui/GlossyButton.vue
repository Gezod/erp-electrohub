<template>
  <component
    :is="to ? 'router-link' : 'button'"
    v-bind="to ? { to } : {}"
    :disabled="!to ? disabled : undefined"
    @click="e => { if (disabled) { e.preventDefault(); e.stopPropagation(); } }"
    :class="[
      'inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-150 select-none outline-none border cursor-pointer shrink-0',
      disabled
        ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed shadow-none'
        : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-200 shadow-2xs active:scale-[0.98]'
    ]"
  >
    <!-- Slots for icons & text -->
    <slot></slot>
  </component>
</template>

<script setup>
defineProps({
  to: {
    type: [String, Object],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

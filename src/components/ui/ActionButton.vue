<template>
  <component
    :is="to ? 'router-link' : 'button'"
    v-bind="to ? { to } : {}"
    :type="!to ? type : undefined"
    :disabled="!to ? disabled : undefined"
    @click="handleClick"
    :class="[
      'inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs md:text-sm font-medium transition-all duration-150 select-none shrink-0 shadow-2xs outline-none',
      disabled ? 'opacity-40 cursor-not-allowed shadow-none' : 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98]',
      customClass
    ]"
  >
    <slot></slot>
  </component>
</template>

<script setup>
const props = defineProps({
  to: {
    type: [String, Object],
    default: null
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const handleClick = (e) => {
  if (props.disabled) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  emit('click', e);
};
</script>

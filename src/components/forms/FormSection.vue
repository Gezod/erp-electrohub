<template>
  <div class="flex flex-col gap-[10px] w-full">
    <!-- Section Title / Eyebrow Header -->
    <div v-if="title || $slots.title" class="pl-[10px] text-left">
      <slot name="title">
        <span class="text-[12px] font-medium text-text-muted tracking-[0.12px] uppercase">
          {{ title }}
        </span>
      </slot>
    </div>

    <!-- Responsive Grid of Form Fields -->
    <div :class="['w-full gap-[10px] grid', gridColsClass]">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, default: '' },
  cols: { type: [Number, String], default: 1 }
});

const gridColsClass = computed(() => {
  const c = Number(props.cols);
  if (c === 2) return 'grid-cols-1 md:grid-cols-2';
  if (c === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  if (c === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  return 'grid-cols-1';
});
</script>

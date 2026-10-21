<template>
  <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-2xs transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
    <!-- Heading Wrapper -->
    <div class="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80">
      <component :is="icon" class="w-4 h-4 text-zinc-500 shrink-0" :class="iconColor" />
      <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{{ heading }}</span>
    </div>

    <!-- Content -->
    <div class="flex flex-col flex-1 px-4 py-3.5 gap-1">
      <!-- Value + Subtitle -->
      <div class="flex flex-col gap-0.5">
        <!-- Value row: supports prefix unit + main value + suffix -->
        <div class="flex items-baseline gap-1">
          <span v-if="unit" :class="unitClass">{{ unit }}</span>
          <span :class="valueClass">{{ displayValue }}</span>
          <span v-if="suffix" :class="suffixClass">{{ suffix }}</span>
        </div>
        <!-- Subtitle / change text -->
        <span class="text-xs text-zinc-400 dark:text-zinc-500 font-normal leading-relaxed">{{ subtitle }}</span>
      </div>

      <!-- Segmented Progress Bar (optional) -->
      <div v-if="showProgress" class="mt-auto pt-2 flex flex-col gap-1.5">
        <span v-if="progressLabel" class="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">{{ progressLabel }}</span>
        <div class="flex gap-1">
          <div
            v-for="(seg, i) in segments"
            :key="i"
            :class="[progressSegmentClass, 'transition-all duration-300', seg.active ? activeSegmentClass : inactiveSegmentClass]"
          />
        </div>
      </div>

      <!-- Sparkline slot (for total cost card) -->
      <slot name="sparkline" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** Lucide component or any Vue component for the heading icon */
  icon: {
    type: [Object, Function],
    default: null
  },
  /** Tailwind class for icon color, e.g. 'text-blue-500' */
  iconColor: {
    type: String,
    default: 'text-gray-500'
  },
  /** Card heading label text */
  heading: {
    type: String,
    default: ''
  },
  /** Prefix unit label (e.g. 'IDR') */
  unit: {
    type: String,
    default: ''
  },
  /** Custom class for unit text */
  unitClass: {
    type: String,
    default: 'text-[14px] font-medium text-[#999] dark:text-gray-400 leading-[1]'
  },
  /** Primary metric value */
  value: {
    type: [Number, String],
    default: 0
  },
  /** Custom class for display value */
  valueClass: {
    type: String,
    default: 'text-[20px] sm:text-[28px] font-bold text-black dark:text-white leading-[28px] sm:leading-[36px] tracking-tight'
  },
  /** Optional suffix text (e.g. 'item') */
  suffix: {
    type: String,
    default: ''
  },
  /** Custom class for suffix text */
  suffixClass: {
    type: String,
    default: 'text-[14px] font-medium text-[#999] dark:text-gray-400 leading-[1]'
  },
  /** Formatted display value override (if provided, used directly) */
  formattedValue: {
    type: String,
    default: null
  },
  /** Subtitle below value (e.g. 'tiket aktif', 'Total akumulasi') */
  subtitle: {
    type: String,
    default: ''
  },
  /** Show segmented bar? */
  showProgress: {
    type: Boolean,
    default: false
  },
  /** Label above the segmented bar */
  progressLabel: {
    type: String,
    default: ''
  },
  /** 0–1 fraction of total for filled segments */
  progressFraction: {
    type: Number,
    default: 0
  },
  /** Total number of segments in the bar */
  totalSegments: {
    type: Number,
    default: 25
  },
  /** Custom class for progress segments */
  progressSegmentClass: {
    type: String,
    default: 'h-[6px] rounded-full flex-1'
  },
  /** Tailwind class for active segments */
  activeSegmentClass: {
    type: String,
    default: 'bg-[#0a0a0a] dark:bg-white'
  },
  /** Tailwind class for inactive segments */
  inactiveSegmentClass: {
    type: String,
    default: 'bg-[#e8e8e8] dark:bg-gray-700'
  }
});

const displayValue = computed(() => {
  if (props.formattedValue !== null) return props.formattedValue;
  return props.value;
});

const segments = computed(() => {
  const count = props.totalSegments;
  const filled = Math.round(props.progressFraction * count);
  return Array.from({ length: count }, (_, i) => ({ active: i < filled }));
});
</script>

<style scoped>
.glossy-segment-active {
  background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 7.04 24' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.5'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-5.1933e-15 2.4169 -0.70896 1.4799e-16 3.52 -0.16895)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(255,255,255,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, rgb(54, 123, 119) 0%, rgb(54, 123, 119) 100%);
}
.glossy-segment-inactive {
  background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 7.04 24' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.5'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-5.1933e-15 2.4169 -0.70896 1.4799e-16 3.52 -0.16895)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(255,255,255,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, rgb(217, 217, 217) 0%, rgb(217, 217, 217) 100%);
}
</style>


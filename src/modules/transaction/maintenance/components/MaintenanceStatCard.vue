<template>
  <StatsCard
    :icon="icon"
    :icon-color="iconColor"
    :heading="heading"
    :unit="unit"
    :unit-class="unitClass"
    :value="value"
    :formatted-value="formattedValue"
    :value-class="valueClass"
    :suffix="suffix"
    :suffix-class="suffixClass"
    :subtitle="subtitle"
    :show-progress="showProgress"
    :total-segments="totalSegments"
    :progress-fraction="progressFraction"
    :progress-segment-class="progressSegmentClass"
    :active-segment-class="activeSegmentClass"
    :inactive-segment-class="inactiveSegmentClass"
    class="rounded-[12px] border border-[#e8e8e8]"
  />
</template>

<script setup>
import StatsCard from '@/components/ui/StatsCard.vue';

defineProps({
  icon: {
    type: [Object, Function],
    required: true
  },
  iconColor: {
    type: String,
    default: 'text-[#999]'
  },
  heading: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  unitClass: {
    type: String,
    default: 'text-[20px] font-normal text-[#999] leading-[36px] mr-[2px]'
  },
  value: {
    type: [Number, String],
    default: undefined
  },
  formattedValue: {
    type: String,
    default: undefined
  },
  valueClass: {
    type: String,
    default: 'text-[24px] font-mono font-normal text-black dark:text-white leading-[36px]'
  },
  suffix: {
    type: String,
    default: ''
  },
  suffixClass: {
    type: String,
    default: 'text-[20px] font-normal text-[#999] leading-[36px] ml-[4px]'
  },
  subtitle: {
    type: String,
    default: '30 hari terakhir'
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  totalSegments: {
    type: Number,
    default: 22
  },
  progressFraction: {
    type: Number,
    default: 0
  },
  progressSegmentClass: {
    type: String,
    default: 'h-[24px] rounded-[10px] flex-1'
  },
  activeSegmentClass: {
    type: String,
    default: 'glossy-segment-active'
  },
  inactiveSegmentClass: {
    type: String,
    default: 'glossy-segment-inactive'
  }
});
</script>

<template>
  <div class="flex items-center gap-1 bg-[#FBFBFB] border border-[#E8E8E8] dark:bg-gray-900 dark:border-gray-800 p-[3px] rounded-[6px] shrink-0 h-[36px] w-fit">
    <button
      v-for="tab in normalizedTabs"
      :key="String(tab.value)"
      type="button"
      @click="handleClick(tab.value)"
      :class="[
        'flex items-center justify-center px-3 h-full rounded-[4px] text-[13px] font-semibold tracking-tight transition-all duration-200 border whitespace-nowrap shrink-0 cursor-pointer',
        modelValue === tab.value
          ? 'bg-white text-black border-[#E8E8E8] dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-xs'
          : 'bg-transparent border-transparent text-[#666] dark:text-gray-400 hover:text-black dark:hover:text-white font-normal'
      ]"
    >
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.count !== undefined"
        class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold"
        :class="modelValue === tab.value ? 'bg-gray-100 dark:bg-gray-700 text-text-active' : 'bg-gray-100/60 dark:bg-gray-800 text-text-muted'"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  tabs: {
    type: Array,
    default: () => [
      { label: 'Semua', value: '' },
      { label: 'Aktif', value: true },
      { label: 'Non-Aktif', value: false }
    ]
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const normalizedTabs = computed(() => {
  return props.tabs.map((tab) => {
    if (typeof tab === 'string') {
      return { label: tab, value: tab };
    }
    return {
      label: tab.label || tab.name || '',
      value: tab.value !== undefined ? tab.value : (tab.key !== undefined ? tab.key : ''),
      count: tab.count
    };
  });
});

const handleClick = (val) => {
  emit('update:modelValue', val);
  emit('change', val);
};
</script>

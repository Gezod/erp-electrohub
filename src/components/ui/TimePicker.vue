<template>
  <div class="relative w-full sm:w-auto" ref="containerRef">
    <!-- Input Trigger -->
    <div 
      class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-lg transition-all focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 cursor-pointer"
      @click="openPicker"
    >
      <Clock class="w-4 h-4 text-gray-400 shrink-0" />
      <input 
        ref="inputRef"
        v-model="inputDisplay"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="isOpen = true"
        @input="handleManualInput"
        @keydown.enter.prevent="isOpen = false"
        @keydown.esc="isOpen = false"
        class="bg-transparent border-0 p-0 text-sm font-semibold outline-none text-black dark:text-white font-mono focus:ring-0 w-20 disabled:cursor-not-allowed"
      />
      <button 
        v-if="internalValue" 
        type="button" 
        @click.stop="clearTime"
        class="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
      >
        <X class="w-3 h-3" />
      </button>
    </div>

    <!-- GUI Popover Dropdown -->
    <div 
      v-if="isOpen && !disabled" 
      class="absolute right-0 top-full mt-1.5 z-50 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200 select-none"
    >
      <!-- Quick Select Presets -->
      <div class="mb-3">
        <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
          Jam Kerja Populer
        </div>
        <div class="grid grid-cols-4 gap-1">
          <button 
            v-for="preset in presets" 
            :key="preset"
            type="button"
            @click="selectTime(preset)"
            :class="[
              'py-1 text-xs font-mono font-bold rounded-lg transition active:scale-95',
              internalValue === preset 
                ? 'bg-brand-500 text-white shadow-xs' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-950 hover:text-brand-600 dark:hover:text-brand-400'
            ]"
          >
            {{ preset }}
          </button>
        </div>
      </div>

      <div class="h-px bg-gray-100 dark:bg-gray-800 my-2" />

      <!-- Interactive Grid Picker (Hours & Minutes) -->
      <div class="grid grid-cols-2 gap-2">
        <!-- Hours Selection (00 - 23) -->
        <div>
          <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 px-1 flex justify-between">
            <span>Jam</span>
            <span class="font-mono text-brand-500">{{ currentHour }}</span>
          </div>
          <div class="max-h-36 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-2 gap-1">
            <button
              v-for="h in hoursList"
              :key="h"
              type="button"
              @click="selectHour(h)"
              :class="[
                'py-1 text-xs font-mono font-bold rounded-md transition text-center',
                currentHour === h 
                  ? 'bg-brand-500 text-white shadow-xs' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]"
            >
              {{ h }}
            </button>
          </div>
        </div>

        <!-- Minutes Selection (00 - 55 step 5) -->
        <div>
          <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 px-1 flex justify-between">
            <span>Menit</span>
            <span class="font-mono text-brand-500">{{ currentMinute }}</span>
          </div>
          <div class="max-h-36 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-2 gap-1">
            <button
              v-for="m in minutesList"
              :key="m"
              type="button"
              @click="selectMinute(m)"
              :class="[
                'py-1 text-xs font-mono font-bold rounded-md transition text-center',
                currentMinute === m 
                  ? 'bg-brand-500 text-white shadow-xs' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]"
            >
              {{ m }}
            </button>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <span class="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">
          {{ internalValue ? internalValue + ' WIB' : 'Belum Dipilih' }}
        </span>
        <button 
          type="button" 
          @click="isOpen = false"
          class="px-2.5 py-1 text-xs font-bold bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition active:scale-95 shadow-xs"
        >
          Selesai
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Clock, X } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'HH:mm'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const containerRef = ref(null);
const inputRef = ref(null);
const isOpen = ref(false);

const presets = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const internalValue = computed({
  get: () => props.modelValue || '',
  set: (val) => emit('update:modelValue', val)
});

const inputDisplay = ref(props.modelValue || '');

watch(() => props.modelValue, (newVal) => {
  inputDisplay.value = newVal || '';
});

const currentHour = computed(() => {
  if (internalValue.value && internalValue.value.includes(':')) {
    return internalValue.value.split(':')[0];
  }
  return '08';
});

const currentMinute = computed(() => {
  if (internalValue.value && internalValue.value.includes(':')) {
    return internalValue.value.split(':')[1];
  }
  return '00';
});

const openPicker = () => {
  if (!props.disabled) {
    isOpen.value = true;
    if (inputRef.value) inputRef.value.focus();
  }
};

const selectTime = (timeStr) => {
  internalValue.value = timeStr;
  inputDisplay.value = timeStr;
  isOpen.value = false;
};

const selectHour = (h) => {
  const m = currentMinute.value || '00';
  const newTime = `${h}:${m}`;
  internalValue.value = newTime;
  inputDisplay.value = newTime;
};

const selectMinute = (m) => {
  const h = currentHour.value || '08';
  const newTime = `${h}:${m}`;
  internalValue.value = newTime;
  inputDisplay.value = newTime;
  isOpen.value = false;
};

const clearTime = () => {
  internalValue.value = '';
  inputDisplay.value = '';
};

const handleManualInput = (e) => {
  const val = e.target.value;
  if (/^\d{2}:\d{2}$/.test(val)) {
    internalValue.value = val;
  } else if (val === '') {
    internalValue.value = '';
  }
};

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

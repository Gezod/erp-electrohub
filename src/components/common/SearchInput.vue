<template>
  <div class="relative flex items-center w-full max-w-[320px] sm:max-w-[360px] select-none">
    <!-- Search Icon -->
    <Search class="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 pointer-events-none transition-colors" />

    <!-- Text Input -->
    <input
      :value="modelValue"
      @input="handleInput"
      @keydown.enter="handleEnter"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full h-9 pl-9 pr-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs md:text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:outline-none transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
    />

    <!-- Clear Button -->
    <button
      v-if="modelValue && !disabled"
      type="button"
      @click="handleClear"
      class="w-5 h-5 flex items-center justify-center absolute right-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition cursor-pointer"
      title="Hapus pencarian"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

<script setup>
import { Search, X } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Cari data...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  debounce: {
    type: Number,
    default: 300
  }
});

const emit = defineEmits(['update:modelValue', 'search', 'clear']);

let debounceTimeout = null;

const handleInput = (event) => {
  const val = event.target.value;
  emit('update:modelValue', val);
  
  if (props.debounce > 0) {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      emit('search', val);
    }, props.debounce);
  } else {
    emit('search', val);
  }
};

const handleEnter = (event) => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  emit('search', event.target.value);
};

const handleClear = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  emit('update:modelValue', '');
  emit('search', '');
  emit('clear');
};
</script>

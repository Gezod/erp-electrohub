<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        @click="$emit('close')"
      ></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden transform transition-all border border-zinc-200 dark:border-zinc-800">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
          <div>
            <h3 class="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">{{ title }}</h3>
            <p v-if="subtitle" class="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">{{ subtitle }}</p>
          </div>
          <button 
            @click="$emit('close')" 
            class="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 overflow-y-auto max-h-[70vh] bg-white dark:bg-zinc-900">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div v-for="field in fields" :key="field.key" :class="field.fullWidth ? 'md:col-span-2' : ''">
              <label class="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                {{ field.label }}
              </label>
              
              <div class="relative group">
                <!-- Data Display Logic -->
                <div v-if="field.type === 'badge'" class="pt-0.5">
                  <span 
                    :class="getBadgeClass(item[field.key], field.options)"
                    class="inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border"
                  >
                    {{ item[field.key] || '-' }}
                  </span>
                </div>
                
                <div v-else-if="field.type === 'boolean'" class="pt-0.5">
                  <span 
                    :class="item[field.key] ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'"
                    class="inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border border-transparent"
                  >
                    {{ item[field.key] ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </div>

                <div v-else-if="field.type === 'currency'" class="text-xs md:text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {{ formatCurrency(item[field.key]) }}
                </div>
                
                <div v-else-if="field.type === 'date'" class="text-xs md:text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {{ formatDate(item[field.key]) }}
                </div>

                <div v-else-if="field.type === 'image' && item[field.key]" class="mt-1.5">
                  <img 
                    :src="item[field.key]" 
                    class="w-full max-h-48 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs"
                    alt="Preview"
                  />
                </div>

                <div v-else class="text-xs md:text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap">
                  {{ item[field.key] || '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 bg-zinc-50 dark:bg-zinc-850 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-xs md:text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  title: String,
  subtitle: String,
  item: {
    type: Object,
    default: () => ({})
  },
  fields: {
    type: Array, // Array of { label, key, type, fullWidth, options }
    required: true
  }
});

defineEmits(['close']);

// --- Helpers ---

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString));
};

const getBadgeClass = (value, options = {}) => {
  if (!value) return 'bg-slate-50 text-slate-500 border-slate-100';
  
  const val = value.toString().toLowerCase();
  if (options[val]) return options[val];
  
  // Default heuristic colors
  if (val.includes('aktif') || val.includes('sukses') || val.includes('done')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }
  if (val.includes('proses') || val.includes('pending')) {
    return 'bg-blue-50 text-blue-700 border-blue-100';
  }
  if (val.includes('batal') || val.includes('gagal') || val.includes('inactive')) {
    return 'bg-rose-50 text-rose-700 border-rose-100';
  }
  
  return 'bg-indigo-50 text-indigo-700 border-indigo-100';
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from .relative {
  transform: scale(0.9) translateY(20px);
}

.modal-fade-leave-to .relative {
  transform: scale(0.95) translateY(10px);
}
</style>

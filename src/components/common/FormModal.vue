<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-200"
      @click.self="emit('update:modelValue', false)"
    >
      <transition name="zoom">
        <div class="bg-[#F8FAFB] dark:bg-gray-950 w-full max-w-xl rounded-[12px] shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-800 text-gray-800 dark:text-gray-200 flex flex-col">
          
          <!-- Header -->
          <div class="bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-[#e8e8e8] dark:border-gray-800">
            <h3 class="text-[16px] font-bold text-black dark:text-white leading-[24px]">
              {{ title }}
            </h3>
            <button
              type="button"
              @click="emit('update:modelValue', false)"
              class="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer active:scale-95"
            >
              <X class="w-[20px] h-[20px]" />
            </button>
          </div>

          <!-- Body Slot Container (Scrollable) -->
          <div class="bg-[#f5f5f5] dark:bg-gray-950 border-b border-[#e8e8e8] dark:border-gray-800 p-6 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto">
            <slot></slot>
          </div>

          <!-- Footer Actions -->
          <div class="bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-[#e8e8e8] dark:border-gray-800 gap-2">
            
            <!-- Left side: optional Simpan draft button -->
            <div>
              <button
                v-if="showDraft"
                type="button"
                @click="emit('draft')"
                class="border border-[#e1e1e1] dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white rounded-[6px] px-[14px] py-[8px] flex items-center gap-[6px] h-10 font-medium text-[14px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 active:scale-95 shadow-[inset_0px_2px_2px_0px_rgba(255,255,255,0.05)] select-none"
              >
                <FileText class="w-[16px] h-[16px] text-gray-500" />
                <span>{{ draftLabel }}</span>
              </button>
            </div>

            <!-- Right side: Batal and Submit buttons -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="emit('update:modelValue', false)"
                class="border border-[#e1e1e1] dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white rounded-[6px] px-[14px] py-[8px] h-10 font-medium text-[14px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 active:scale-95 select-none"
              >
                {{ cancelLabel }}
              </button>

              <!-- Kirim / Submit Glossy Button -->
              <button
                type="button"
                @click="emit('submit')"
                :disabled="isLoading"
                :class="[
                  'border border-solid transition-all duration-200 active:scale-95 shadow-[inset_0px_2px_2px_0px_rgba(255,255,255,0.05),inset_0px_2px_2px_0px_rgba(255,255,255,0.08)] relative overflow-hidden px-[14px] py-[8px] flex items-center justify-center gap-[6px] h-10 cursor-pointer font-medium text-[14px] group select-none rounded-[6px] border-[rgba(255,255,255,0.3)] text-white min-w-[140px]',
                  isLoading ? 'opacity-80 cursor-not-allowed' : ''
                ]"
              >
                <!-- State 2 (Active/Filled): Solid dark gradient background -->
                <div
                  v-if="isComplete"
                  aria-hidden="true"
                  class="absolute bg-gradient-to-b from-[#1e1e1e] to-[#0a0a0a] inset-0 pointer-events-none rounded-[6px] z-0 transition-all duration-300 group-hover:from-[#2e2e2e] group-hover:to-[#1a1a1a]"
                />

                <!-- State 1 (Inactive/Unfilled): Solid gray gradient background -->
                <div
                  v-else
                  aria-hidden="true"
                  class="absolute bg-gradient-to-b from-[#adadad] to-[#7f7f7f] inset-0 pointer-events-none rounded-[6px] z-0 transition-all duration-300"
                />

                <Loader2 v-if="isLoading" class="w-[16px] h-[16px] text-white relative z-10 shrink-0 animate-spin" />
                <CheckCircle2 v-else class="w-[16px] h-[16px] text-white relative z-10 shrink-0 font-bold" />

                <span class="relative z-10 tracking-[-0.154px]">{{ submitLabel }}</span>

                <!-- Glossy reflection overlay -->
                <div class="-translate-x-1/2 absolute h-[21px] left-[calc(50%+0.5px)] top-[34px] w-[148px] z-10 pointer-events-none overflow-visible">
                  <svg class="absolute inset-[-125.18%_-17.76%] w-[200.575px] h-[73.575px] opacity-60" preserveAspectRatio="none" viewBox="0 0 200.575 73.575" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g :filter="`url(#glow-filter-${uniqueId})`">
                      <ellipse cx="100.287" cy="36.7875" rx="74" ry="10.5" :fill="`url(#glow-gradient-${uniqueId})`"/>
                    </g>
                    <defs>
                      <filter :id="`glow-filter-${uniqueId}`" x="0" y="0" width="200.575" height="73.575" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feGaussianBlur stdDeviation="13.14" result="blur"/>
                      </filter>
                      <linearGradient :id="`glow-gradient-${uniqueId}`" x1="26.2875" y1="36.7875" x2="174.287" y2="36.7875" gradientUnits="userSpaceOnUse">
                        <stop stop-color="white"/>
                        <stop offset="1" stop-color="#D5E5F8"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </button>
            </div>

          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { X, FileText, CheckCircle2, Loader2 } from 'lucide-vue-next';

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Form'
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  submitLabel: {
    type: String,
    default: 'Kirim'
  },
  showDraft: {
    type: Boolean,
    default: false
  },
  draftLabel: {
    type: String,
    default: 'Simpan draft'
  },
  cancelLabel: {
    type: String,
    default: 'Batal'
  }
});

const emit = defineEmits(['update:modelValue', 'submit', 'draft', 'cancel']);

const uniqueId = Math.random().toString(36).substring(2, 9);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.zoom-enter-active, .zoom-leave-active { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease; }
.zoom-enter-from, .zoom-leave-to { transform: scale(0.95); opacity: 0; }
</style>

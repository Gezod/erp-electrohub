<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none"
        @click.self="close"
      >
        <transition name="zoom">
          <div
            v-if="modelValue"
            class="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#F8FAFB] dark:bg-gray-950 rounded-[12px] shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-800"
          >
            <!-- Header -->
            <div class="bg-white dark:bg-gray-900 px-5 py-3 flex items-center justify-between border-b border-[#e8e8e8] dark:border-gray-800">
              <h3 class="text-[15px] font-bold text-black dark:text-white truncate pr-4">{{ title }}</h3>
              <div class="flex items-center gap-1">
                <a
                  v-if="src && allowNewTab"
                  :href="src"
                  target="_blank"
                  rel="noopener"
                  title="Buka di tab baru"
                  class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer active:scale-95"
                >
                  <ExternalLink class="w-[18px] h-[18px]" />
                </a>
                <button
                  type="button"
                  @click="close"
                  title="Tutup"
                  class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer active:scale-95"
                >
                  <X class="w-[20px] h-[20px]" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="bg-[#f5f5f5] dark:bg-gray-950 p-4 flex items-center justify-center min-h-[200px] max-h-[calc(90vh-56px)] overflow-auto">
              <div v-if="loading" class="flex flex-col items-center gap-2 text-gray-400 py-10">
                <Loader2 class="w-7 h-7 animate-spin" />
                <span class="text-xs font-semibold">Memuat gambar…</span>
              </div>

              <div v-else-if="error" class="flex flex-col items-center gap-2 text-gray-400 py-10">
                <ImageOff class="w-7 h-7" />
                <span class="text-xs font-semibold">Gagal memuat gambar.</span>
                <a v-if="src" :href="src" target="_blank" rel="noopener" class="text-xs font-bold text-brand-600 hover:underline">Coba buka di tab baru</a>
              </div>

              <img
                v-show="!loading && !error"
                :src="src"
                :alt="alt || title"
                class="max-w-full max-h-[calc(90vh-90px)] object-contain rounded-lg"
                @load="onLoad"
                @error="onError"
              />
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { X, ExternalLink, Loader2, ImageOff } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  src: { type: String, default: '' },
  title: { type: String, default: 'Pratinjau Gambar' },
  alt: { type: String, default: '' },
  allowNewTab: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue']);

const loading = ref(true);
const error = ref(false);

const close = () => emit('update:modelValue', false);

const onLoad = () => { loading.value = false; error.value = false; };
const onError = () => { loading.value = false; error.value = true; };

// Reset load state each time the modal opens or the image source changes, and
// lock body scroll while open.
watch(
  () => [props.modelValue, props.src],
  ([open]) => {
    if (open) {
      loading.value = true;
      error.value = false;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);

const onKeydown = (e) => {
  if (e.key === 'Escape' && props.modelValue) close();
};
window.addEventListener('keydown', onKeydown);
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.zoom-enter-active, .zoom-leave-active { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease; }
.zoom-enter-from, .zoom-leave-to { transform: scale(0.95); opacity: 0; }
</style>

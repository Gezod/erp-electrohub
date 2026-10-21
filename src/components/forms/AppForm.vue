<template>
  <!-- Modal / Dialog Backdrop Mode (Default) -->
  <Teleport to="body" v-if="isModal">
    <transition name="fade">
      <div 
        v-if="modelValue"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-xs select-none"
        @click.self="handleClose"
      >
        <!-- Dialog Container -->
        <transition name="zoom">
          <div 
            v-if="modelValue"
            :class="[
              'w-full bg-white dark:bg-gray-900 border border-border dark:border-border rounded-[12px] shadow-2xl overflow-hidden flex flex-col my-4 text-text-active',
              maxWidthClass,
              minHeightClass
            ]"
          >
            <!-- Header -->
            <div class="border-border dark:border-border border-b border-solid flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 shrink-0">
              <slot name="header">
                <div class="flex flex-col">
                  <span class="font-bold text-base text-text-active tracking-tight leading-snug">
                    {{ title }}
                  </span>
                  <span v-if="subtitle" class="text-xs text-text-muted font-normal mt-0.5">
                    {{ subtitle }}
                  </span>
                </div>
                <button 
                  v-if="showCloseButton"
                  type="button" 
                  @click="handleClose"
                  class="p-1 rounded-lg text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-active transition active:scale-95 cursor-pointer"
                >
                  <X class="w-5 h-5" />
                </button>
              </slot>
            </div>

            <!-- Form content -->
            <form @submit.prevent="handleSubmit" class="flex flex-col flex-1">
              <!-- Inner grey body container -->
              <div :class="[
                'bg-[#F5F5F5] dark:bg-gray-950 p-4 sm:p-5 flex flex-col gap-3.5 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar flex-1',
                isModal ? 'min-h-[240px] sm:min-h-[280px]' : ''
              ]">
                
                <!-- Stepper indicator inside form if steps provided -->
                <slot name="stepper">
                  <div v-if="normalizedSteps.length > 1" class="flex items-center justify-between px-1 mb-1">
                    <div class="flex items-center gap-2 text-xs font-semibold">
                      <template v-for="(s, idx) in normalizedSteps" :key="idx">
                        <button
                          type="button"
                          @click="handleStepClick(idx + 1)"
                          :disabled="idx + 1 > currentStep && !isStepValid"
                          :class="[
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all',
                            currentStep === idx + 1
                              ? 'bg-brand-500 text-white shadow-xs cursor-pointer font-medium'
                              : idx + 1 < currentStep || isStepValid
                                ? 'bg-white dark:bg-gray-900 text-text-muted hover:text-text-active cursor-pointer border border-border'
                                : 'bg-white/40 dark:bg-gray-900/40 text-text-muted/40 cursor-not-allowed border border-transparent'
                          ]"
                        >
                          <span class="w-4 h-4 rounded-full bg-white/20 dark:bg-gray-700/40 flex items-center justify-center text-[10px]">
                            {{ idx + 1 }}
                          </span>
                          <span>{{ s.title }}</span>
                        </button>

                        <span v-if="idx < normalizedSteps.length - 1" class="text-text-muted">/</span>
                      </template>
                    </div>

                    <div v-if="statusBadge" class="flex items-center">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider',
                          statusBadgeClass || 'bg-gray-100 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                        ]"
                      >
                        {{ statusBadge }}
                      </span>
                    </div>
                  </div>
                </slot>

                <!-- Declarative Schema Rendering (if provided) -->
                <template v-if="schema && schema.length">
                  <template v-for="(section, sIdx) in schema" :key="sIdx">
                    <FormSection :title="section.title" :cols="section.cols || 1">
                      <FormField
                        v-for="(field, fIdx) in section.fields"
                        :key="field.key || fIdx"
                        v-model="model[field.key]"
                        :label="field.label"
                        :required="field.required"
                        :type="field.type || 'text'"
                        :placeholder="field.placeholder"
                        :options="field.options"
                        :option-label="field.optionLabel"
                        :option-value="field.optionValue"
                        :rows="field.rows"
                        :disabled="field.disabled"
                        :col-span="field.colSpan || 1"
                        :min="field.min"
                        :max="field.max"
                        :step="field.step"
                      />
                    </FormSection>
                  </template>
                </template>

                <!-- Slot for manual template fields -->
                <slot></slot>
              </div>

              <!-- Footer Actions -->
              <div class="bg-white dark:bg-gray-900 border-t border-border dark:border-border px-4 py-3 flex items-center justify-end gap-2 mt-auto shrink-0">
                <slot name="footer-actions">
                  <slot name="footer">
                    <!-- Multi-Step Footer Navigation -->
                    <template v-if="normalizedSteps.length > 1">
                      <!-- Kembali Button (if currentStep > 1) -->
                      <button
                        v-if="currentStep > 1"
                        type="button"
                        @click="handlePrevStep"
                        class="border border-border text-text-active px-3.5 rounded-md font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft class="w-4 h-4" />
                        <span>{{ backLabel }}</span>
                      </button>
                      <!-- Batal Button (if currentStep === 1) -->
                      <button
                        v-else-if="showCancel || isModal"
                        type="button"
                        @click="handleClose"
                        class="border border-border text-text-active px-4 rounded-md font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 flex items-center justify-center cursor-pointer"
                      >
                        {{ cancelLabel }}
                      </button>

                      <!-- Simpan Draft Button (Optional) -->
                      <button
                        v-if="showDraft"
                        type="button"
                        @click="handleDraft"
                        :disabled="loading"
                        class="border border-border text-text-active px-4 rounded-md font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileText class="w-4 h-4 text-text-muted" />
                        <span>{{ draftLabel }}</span>
                      </button>

                      <!-- Step < Last Step: "Lanjut" GlossyButton -->
                      <GlossyButton
                        v-if="currentStep < normalizedSteps.length"
                        type="button"
                        @click="handleNextStep"
                        :disabled="loading || disabled || !isStepValid"
                        class="min-w-[120px] text-sm"
                      >
                        <span>{{ continueLabel }}</span>
                        <ArrowRight class="w-4 h-4 text-white shrink-0 ml-1" />
                      </GlossyButton>

                      <!-- Step === Last Step: Final Submit GlossyButton -->
                      <GlossyButton
                        v-else
                        type="submit"
                        :disabled="loading || disabled || !isStepValid"
                        class="min-w-[140px] text-sm"
                      >
                        <Loader2 v-if="loading" class="w-4 h-4 animate-spin shrink-0" />
                        <CheckCircle2 v-else class="w-4 h-4 text-white shrink-0" />
                        <span>{{ submitLabel }}</span>
                      </GlossyButton>
                    </template>

                    <!-- Single-Step Standard Footer -->
                    <template v-else>
                      <!-- Batal / Cancel Button (Optional) -->
                      <button
                        v-if="showCancel || isModal"
                        type="button"
                        @click="handleClose"
                        class="border border-border text-text-active px-4 rounded-md font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 justify-center cursor-pointer"
                      >
                        {{ cancelLabel }}
                      </button>

                      <!-- Simpan Draft Button (Optional) -->
                      <button
                        v-if="showDraft"
                        type="button"
                        @click="handleDraft"
                        :disabled="loading"
                        class="border border-border text-text-active px-4 rounded-md font-medium text-sm flex items-center gap-1.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileText class="w-4 h-4 text-text-muted" />
                        <span>{{ draftLabel }}</span>
                      </button>

                      <!-- Kirim / Submit Glossy Button -->
                      <GlossyButton
                        type="submit"
                        :disabled="loading || disabled || !isStepValid"
                        class="min-w-[140px] text-sm"
                      >
                        <Loader2 v-if="loading" class="w-4 h-4 animate-spin shrink-0" />
                        <CheckCircle2 v-else class="w-4 h-4 text-white shrink-0" />
                        <span>{{ submitLabel }}</span>
                      </GlossyButton>
                    </template>
                  </slot>
                </slot>
              </div>
            </form>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>

  <!-- In-Page Standard Card Mode -->
  <div v-else :class="['w-full bg-white dark:bg-gray-900 border border-border dark:border-border rounded-[12px] shadow-sm overflow-hidden flex flex-col text-text-active', maxWidthClass]">
    
    <!-- Header -->
    <div v-if="title || $slots.header" class="border-border dark:border-border border-b border-solid flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900">
      <slot name="header">
        <div class="flex flex-col">
          <span class="font-bold text-base text-text-active tracking-tight leading-snug">
            {{ title }}
          </span>
          <span v-if="subtitle" class="text-xs text-text-muted font-normal mt-0.5">
            {{ subtitle }}
          </span>
        </div>
      </slot>
    </div>

    <!-- Form content -->
    <form @submit.prevent="handleSubmit">
      <!-- Inner grey body container -->
      <div class="bg-[#F5F5F5] dark:bg-gray-950 p-4 sm:p-5 flex flex-col gap-3.5">
        
        <!-- Stepper indicator inside in-page mode -->
        <slot name="stepper">
          <div v-if="normalizedSteps.length > 1" class="flex items-center justify-between px-1 mb-1">
            <div class="flex items-center gap-2 text-xs font-semibold">
              <template v-for="(s, idx) in normalizedSteps" :key="idx">
                <button
                  type="button"
                  @click="handleStepClick(idx + 1)"
                  :disabled="idx + 1 > currentStep && !isStepValid"
                  :class="[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all',
                    currentStep === idx + 1
                      ? 'bg-brand-500 text-white shadow-xs cursor-pointer font-medium'
                      : idx + 1 < currentStep || isStepValid
                        ? 'bg-white dark:bg-gray-900 text-text-muted hover:text-text-active cursor-pointer border border-border'
                        : 'bg-white/40 dark:bg-gray-900/40 text-text-muted/40 cursor-not-allowed border border-transparent'
                  ]"
                >
                  <span class="w-4 h-4 rounded-full bg-white/20 dark:bg-gray-700/40 flex items-center justify-center text-[10px]">
                    {{ idx + 1 }}
                  </span>
                  <span>{{ s.title }}</span>
                </button>

                <span v-if="idx < normalizedSteps.length - 1" class="text-text-muted">/</span>
              </template>
            </div>

            <div v-if="statusBadge" class="flex items-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider',
                  statusBadgeClass || 'bg-gray-100 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                ]"
              >
                {{ statusBadge }}
              </span>
            </div>
          </div>
        </slot>

        <!-- Declarative Schema Rendering -->
        <template v-if="schema && schema.length">
          <template v-for="(section, sIdx) in schema" :key="sIdx">
            <FormSection :title="section.title" :cols="section.cols || 1">
              <FormField
                v-for="(field, fIdx) in section.fields"
                :key="field.key || fIdx"
                v-model="model[field.key]"
                :label="field.label"
                :required="field.required"
                :type="field.type || 'text'"
                :placeholder="field.placeholder"
                :options="field.options"
                :option-label="field.optionLabel"
                :option-value="field.optionValue"
                :rows="field.rows"
                :disabled="field.disabled"
                :col-span="field.colSpan || 1"
                :min="field.min"
                :max="field.max"
                :step="field.step"
              />
            </FormSection>
          </template>
        </template>

        <!-- Slot for manual template fields -->
        <slot></slot>
      </div>

      <!-- Footer Actions -->
      <div class="bg-white dark:bg-gray-900 border-t border-border dark:border-border px-4 py-3 flex items-center justify-end gap-2">
        <slot name="footer-actions">
          <slot name="footer">
            <!-- Multi-Step Footer Navigation -->
            <template v-if="normalizedSteps.length > 1">
              <!-- Kembali Button (if currentStep > 1) -->
              <button
                v-if="currentStep > 1"
                type="button"
                @click="handlePrevStep"
                class="border border-border text-text-active px-3.5 rounded-md font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft class="w-4 h-4" />
                <span>{{ backLabel }}</span>
              </button>
              <!-- Batal Button (if currentStep === 1) -->
              <button
                v-else-if="showCancel"
                type="button"
                @click="handleClose"
                class="border border-border text-text-active px-4 rounded-md font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 flex items-center justify-center cursor-pointer"
              >
                {{ cancelLabel }}
              </button>

              <!-- Simpan Draft Button (Optional) -->
              <button
                v-if="showDraft"
                type="button"
                @click="handleDraft"
                :disabled="loading"
                class="border border-border text-text-active px-4 rounded-md font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText class="w-4 h-4 text-text-muted" />
                <span>{{ draftLabel }}</span>
              </button>

              <!-- Step < Last Step: "Lanjut" GlossyButton -->
              <GlossyButton
                v-if="currentStep < normalizedSteps.length"
                type="button"
                @click="handleNextStep"
                :disabled="loading || disabled || !isStepValid"
                class="min-w-[120px] text-sm"
              >
                <span>{{ continueLabel }}</span>
                <ArrowRight class="w-4 h-4 text-white shrink-0 ml-1" />
              </GlossyButton>

              <!-- Step === Last Step: Final Submit GlossyButton -->
              <GlossyButton
                v-else
                type="submit"
                :disabled="loading || disabled || !isStepValid"
                class="min-w-[140px] text-sm"
              >
                <Loader2 v-if="loading" class="w-4 h-4 animate-spin shrink-0" />
                <CheckCircle2 v-else class="w-4 h-4 text-white shrink-0" />
                <span>{{ submitLabel }}</span>
              </GlossyButton>
            </template>

            <!-- Single-Step Standard Footer -->
            <template v-else>
              <!-- Batal / Cancel Button (Optional) -->
              <button
                v-if="showCancel"
                type="button"
                @click="handleClose"
                class="border border-border text-text-active px-4 rounded-md font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 justify-center cursor-pointer"
              >
                {{ cancelLabel }}
              </button>

              <!-- Simpan Draft Button (Optional) -->
              <button
                v-if="showDraft"
                type="button"
                @click="handleDraft"
                :disabled="loading"
                class="border border-border text-text-active px-4 rounded-md font-medium text-sm flex items-center gap-1.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText class="w-4 h-4 text-text-muted" />
                <span>{{ draftLabel }}</span>
              </button>

              <!-- Kirim / Submit Glossy Button -->
              <GlossyButton
                type="submit"
                :disabled="loading || disabled || !isStepValid"
                class="min-w-[140px] text-sm"
              >
                <Loader2 v-if="loading" class="w-4 h-4 animate-spin shrink-0" />
                <CheckCircle2 v-else class="w-4 h-4 text-white shrink-0" />
                <span>{{ submitLabel }}</span>
              </GlossyButton>
            </template>
          </slot>
        </slot>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { X, FileText, CheckCircle2, Loader2, ArrowLeft, ArrowRight } from 'lucide-vue-next';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import FormField from '@/components/forms/FormField.vue';
import FormSection from '@/components/forms/FormSection.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  isModal: { type: Boolean, default: true },
  maxWidth: { type: String, default: 'max-w-[640px]' },
  minHeight: { type: String, default: '' },
  showCloseButton: { type: Boolean, default: true },
  showDraft: { type: Boolean, default: false },
  showCancel: { type: Boolean, default: false },
  draftLabel: { type: String, default: 'Simpan Draft' },
  submitLabel: { type: String, default: 'Kirim Pengajuan' },
  continueLabel: { type: String, default: 'Lanjut' },
  backLabel: { type: String, default: 'Kembali' },
  cancelLabel: { type: String, default: 'Batal' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  schema: { type: Array, default: () => [] },
  model: { type: Object, default: () => ({}) },
  // Stepper / Multi-step Props
  steps: { type: Array, default: () => [] },
  currentStep: { type: Number, default: 1 },
  isStepValid: { type: Boolean, default: true },
  statusBadge: { type: String, default: '' },
  statusBadgeClass: { type: String, default: '' },
});

const emit = defineEmits([
  'update:modelValue',
  'update:currentStep',
  'update:current-step',
  'submit',
  'draft',
  'cancel',
  'close',
  'next-step',
  'prev-step',
  'step-click'
]);

const maxWidthClass = computed(() => props.maxWidth || 'max-w-[640px]');
const minHeightClass = computed(() => {
  if (props.minHeight) return props.minHeight;
  return props.isModal ? 'min-h-[380px] sm:min-h-[420px]' : '';
});

const normalizedSteps = computed(() => {
  return props.steps.map((s, idx) => {
    if (typeof s === 'string') {
      return { key: idx + 1, title: s };
    }
    return { key: s.key || idx + 1, title: s.title || s.label || `Step ${idx + 1}` };
  });
});

const handleStepClick = (step) => {
  if (step <= props.currentStep || props.isStepValid) {
    emit('update:currentStep', step);
    emit('update:current-step', step);
    emit('step-click', step);
  }
};

const handleNextStep = () => {
  if (props.isStepValid && !props.loading && !props.disabled) {
    const next = props.currentStep + 1;
    emit('update:currentStep', next);
    emit('update:current-step', next);
    emit('next-step', next);
  }
};

const handlePrevStep = () => {
  if (props.currentStep > 1) {
    const prev = props.currentStep - 1;
    emit('update:currentStep', prev);
    emit('update:current-step', prev);
    emit('prev-step', prev);
  }
};

const handleSubmit = () => {
  if (!props.loading && !props.disabled && props.isStepValid) {
    emit('submit');
  }
};

const handleDraft = () => {
  emit('draft');
};

const handleClose = () => {
  emit('update:modelValue', false);
  emit('close');
  emit('cancel');
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>

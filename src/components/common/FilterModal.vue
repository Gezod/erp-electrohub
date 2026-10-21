<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none"
        @click.self="emit('update:modelValue', false)"
      >
        <transition name="zoom">
          <div 
            v-if="modelValue"
            :class="['bg-zinc-50 dark:bg-zinc-950 w-full rounded-xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100', maxWidth]"
          >
            
            <!-- Header -->
            <div class="bg-white dark:bg-zinc-900 px-5 py-3.5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
              <slot name="header">
                <h3 class="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100">{{ title }}</h3>
                <button
                  type="button"
                  @click="emit('update:modelValue', false)"
                  class="p-1 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer"
                >
                  <X class="w-4.5 h-4.5" />
                </button>
              </slot>
            </div>

            <!-- Body Container -->
            <div class="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              <!-- Declarative Schema Rendering (if provided) -->
              <template v-if="schema && schema.length">
                <div 
                  v-for="(field, idx) in schema" 
                  :key="field.key || idx"
                  class="bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-border rounded-[8px] flex items-center px-[12px] py-[10px] gap-[12px] w-full relative"
                  :data-filter-key="field.key"
                >
                  <!-- Label -->
                  <div class="w-[140px] sm:w-[150px] shrink-0 font-medium text-[14px] text-text-active">
                    {{ field.label }}
                  </div>

                  <!-- Control: Server-Side Master / Custom Searchable Select -->
                  <div 
                    v-if="field.master || field.loadOptions" 
                    class="flex-1 relative"
                  >
                    <SearchableSelect
                      v-model="model[field.key]"
                      :master="field.master"
                      :filters="field.filters"
                      :load-options="field.loadOptions"
                      :placeholder="field.placeholder || 'Semua ' + field.label"
                      :search-placeholder="'Cari ' + field.label.toLowerCase() + '...'"
                      :clearable="true"
                      :disabled="field.disabled"
                      variant="seamless"
                    />
                  </div>

                  <!-- Control: Searchable Select Dropdown (Static options) -->
                  <div 
                    v-else-if="field.searchable || field.type === 'searchable-select'" 
                    class="flex-1 relative"
                  >
                    <!-- Display Trigger Button -->
                    <div 
                      @click="toggleDropdown(field.key)"
                      class="w-full flex items-center justify-between text-[14px] h-6 cursor-pointer select-none"
                    >
                      <span 
                        :class="[
                          'truncate text-[14px]',
                          getSelectedLabel(field) ? 'text-text-active font-medium' : 'text-text-placeholder'
                        ]"
                      >
                        {{ getSelectedLabel(field) || field.placeholder || 'Semua ' + field.label }}
                      </span>
                      <div class="flex items-center gap-1 shrink-0">
                        <button 
                          v-if="model[field.key]"
                          type="button"
                          @click="handleClearSelection(field, $event)"
                          class="p-0.5 text-text-muted hover:text-red-500 rounded-full transition cursor-pointer"
                          title="Hapus pilihan"
                        >
                          <X class="w-3.5 h-3.5" />
                        </button>
                        <ChevronDown 
                          :class="[
                            'w-4 h-4 text-text-muted transition-transform duration-200 pointer-events-none',
                            activeDropdownKey === field.key ? 'rotate-180 text-brand-500' : ''
                          ]" 
                        />
                      </div>
                    </div>

                    <!-- Floating Searchable Dropdown Menu -->
                    <div 
                      v-if="activeDropdownKey === field.key"
                      class="absolute z-50 left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-gray-700 rounded-xl shadow-2xl p-2 flex flex-col gap-1 max-h-60 overflow-hidden"
                      @click.stop
                    >
                      <!-- Live Search Input -->
                      <div class="relative flex items-center px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-1">
                        <Search class="w-3.5 h-3.5 text-text-muted mr-1.5 shrink-0" />
                        <input 
                          v-model="searchQuery[field.key]"
                          type="text"
                          :placeholder="'Cari ' + field.label.toLowerCase() + '...'"
                          class="w-full text-[13px] bg-transparent border-0 p-0 outline-none text-text-active placeholder:text-text-placeholder focus:ring-0"
                          autofocus
                          @click.stop
                        />
                        <button 
                          v-if="searchQuery[field.key]"
                          type="button" 
                          @click="searchQuery[field.key] = ''"
                          class="p-0.5 text-text-muted hover:text-text-active cursor-pointer"
                        >
                          <X class="w-3 h-3" />
                        </button>
                      </div>

                      <!-- Options List -->
                      <div class="overflow-y-auto max-h-44 custom-scrollbar flex flex-col gap-0.5">
                        <div 
                          v-for="(opt, oIdx) in getFilteredOptions(field)" 
                          :key="oIdx"
                          @click="handleSelectOption(field, opt)"
                          :class="[
                            'px-2.5 py-1.5 rounded-md text-[13px] cursor-pointer transition flex items-center justify-between select-none',
                            model[field.key] === opt.value 
                              ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold' 
                              : 'text-text-active hover:bg-gray-100 dark:hover:bg-gray-800'
                          ]"
                        >
                          <span class="truncate">{{ opt.label }}</span>
                          <Check v-if="model[field.key] === opt.value" class="w-3.5 h-3.5 text-brand-500 shrink-0 ml-2" />
                        </div>

                        <div 
                          v-if="getFilteredOptions(field).length === 0" 
                          class="px-3 py-3 text-center text-xs text-text-muted italic"
                        >
                          Tidak ada data ditemukan
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Control: Standard Select -->
                  <div v-else-if="field.type === 'select'" class="flex-1 relative">
                    <select
                      v-model="model[field.key]"
                      class="w-full text-[14px] bg-transparent border-0 p-0 pr-6 outline-none text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer h-6 focus:ring-0"
                      :disabled="field.disabled"
                    >
                      <option 
                        v-for="(opt, oIdx) in formatOptions(field.options)" 
                        :key="oIdx" 
                        :value="opt.value"
                        :class="opt.value === '' ? 'text-text-muted' : 'text-text-active'"
                        class="bg-white dark:bg-gray-900"
                      >
                        {{ opt.label }}
                      </option>
                    </select>
                    <ChevronDown class="w-4 h-4 text-text-muted absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <!-- Control: DatePicker -->
                  <div v-else-if="field.type === 'date'" class="flex-1">
                    <DatePicker 
                      v-model="model[field.key]" 
                      :placeholder="field.placeholder || 'dd/mm/yyyy'" 
                      :disabled="field.disabled"
                    />
                  </div>

                  <!-- Control: Checkbox -->
                  <div v-else-if="field.type === 'checkbox'" class="flex-1 flex items-center">
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        v-model="model[field.key]" 
                        :disabled="field.disabled"
                        class="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-500 focus:ring-brand-500/20 cursor-pointer" 
                      />
                      <span class="text-[13px] font-medium text-text-active">
                        {{ field.checkboxLabel || field.label }}
                      </span>
                    </label>
                  </div>

                  <!-- Control: Text (Default) -->
                  <div v-else class="flex-1 relative">
                    <input
                      type="text"
                      v-model="model[field.key]"
                      :placeholder="field.placeholder || ''"
                      :disabled="field.disabled"
                      class="w-full text-[14px] bg-transparent border-0 p-0 outline-none text-text-active placeholder:text-text-placeholder h-6 focus:ring-0"
                    />
                  </div>
                </div>
              </template>

              <!-- Slot for manual/custom filter elements -->
              <slot></slot>
            </div>

            <!-- Footer -->
            <div class="bg-white dark:bg-zinc-900 px-5 py-3.5 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
              <slot name="footer">
                <!-- Reset Filter Button -->
                <button
                  type="button"
                  :disabled="!hasActiveFilters"
                  @click="emit('reset')"
                  class="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-lg px-3.5 h-9 flex items-center gap-1.5 font-medium text-xs md:text-sm transition duration-150 active:scale-95 select-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <RotateCcw class="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                  <span>{{ resetLabel }}</span>
                </button>

                <!-- Save / Simpan Button with GlossyButton -->
                <GlossyButton
                  type="button"
                  :disabled="isSubmitDisabled"
                  @click="emit('apply')"
                  class="min-w-[100px]"
                >
                  <CheckCircle2 class="w-4 h-4 text-inherit shrink-0" />
                  <span>{{ applyLabel }}</span>
                </GlossyButton>
              </slot>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { X, RotateCcw, CheckCircle2, ChevronDown, Search, Check } from 'lucide-vue-next';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import SearchableSelect from '@/components/common/SearchableSelect.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Filter'
  },
  maxWidth: {
    type: String,
    default: 'max-w-xl'
  },
  hasActiveFilters: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: undefined
  },
  isDirty: {
    type: Boolean,
    default: undefined
  },
  applyLabel: {
    type: String,
    default: 'Simpan'
  },
  resetLabel: {
    type: String,
    default: 'Reset Filter'
  },
  schema: {
    type: Array,
    default: () => []
  },
  model: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'apply', 'reset']);

// Searchable dropdown state
const activeDropdownKey = ref(null);
const searchQuery = reactive({});

const toggleDropdown = (key) => {
  if (activeDropdownKey.value === key) {
    activeDropdownKey.value = null;
  } else {
    activeDropdownKey.value = key;
    if (!searchQuery[key]) searchQuery[key] = '';
  }
};

const handleSelectOption = (field, option) => {
  if (props.model) {
    props.model[field.key] = option.value;
  }
  searchQuery[field.key] = '';
  activeDropdownKey.value = null;
};

const handleClearSelection = (field, event) => {
  if (event) event.stopPropagation();
  if (props.model) {
    props.model[field.key] = '';
  }
  searchQuery[field.key] = '';
};

const getSelectedLabel = (field) => {
  if (!props.model) return '';
  const val = props.model[field.key];
  if (val === undefined || val === null || val === '') return '';
  const opts = formatOptions(field.options);
  const found = opts.find((o) => String(o.value) === String(val));
  return found ? found.label : val;
};

const getFilteredOptions = (field) => {
  const opts = formatOptions(field.options);
  const query = (searchQuery[field.key] || '').toLowerCase().trim();
  if (!query) return opts;
  return opts.filter((opt) => opt.label && String(opt.label).toLowerCase().includes(query));
};

const handleDocumentClick = (e) => {
  if (activeDropdownKey.value) {
    const isInside = e.target.closest(`[data-filter-key="${activeDropdownKey.value}"]`);
    if (!isInside) {
      activeDropdownKey.value = null;
    }
  }
};

onMounted(() => {
  window.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  window.removeEventListener('click', handleDocumentClick);
});

watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    activeDropdownKey.value = null;
  }
});

const isSubmitDisabled = computed(() => {
  if (props.disabled !== undefined) return props.disabled;
  if (props.isDirty !== undefined) return !props.isDirty;
  return !props.hasActiveFilters;
});

const formatOptions = (options) => {
  if (!Array.isArray(options)) return [];
  return options.map((opt) => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt };
    }
    return {
      label: opt.label !== undefined ? opt.label : (opt.location_name || opt.name || opt.fullName),
      value: opt.value !== undefined ? opt.value : (opt.key !== undefined ? opt.key : (opt.id || ''))
    };
  });
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

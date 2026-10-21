<template>
  <div 
    :class="[
      'bg-white dark:bg-gray-900 border border-border dark:border-border rounded-[8px] flex px-3 py-2 gap-2.5 w-full relative transition-all duration-200 focus-within:border-brand-500',
      isTextarea ? 'flex-col sm:flex-row sm:items-start' : 'flex-col sm:flex-row sm:items-center',
      colSpanClass,
      disabled ? 'opacity-60 bg-gray-50 dark:bg-gray-800/40 cursor-not-allowed' : ''
    ]"
  >
    <!-- Left Label -->
    <label 
      v-if="label || $slots.label"
      :class="[
        'shrink-0 font-medium text-[13px] sm:text-[14px] text-text-active text-left select-none leading-snug',
        isTextarea ? 'mt-1' : '',
        labelWidthClass
      ]"
      :style="labelStyle"
    >
      <slot name="label">
        <span>{{ label }}</span>
        <span v-if="required" class="text-red-500 ml-0.5">*</span>
      </slot>
    </label>

    <!-- Right Input Container -->
    <div class="flex-1 w-full relative flex items-center min-w-0">
      
      <!-- Slot for completely custom input -->
      <slot v-if="$slots.default"></slot>

      <!-- Date Type -->
      <template v-else-if="type === 'date'">
        <DatePicker 
          v-model="internalValue"
          :placeholder="placeholder || 'Pilih tanggal...'"
          :disabled="disabled"
          class="w-full bg-transparent border-0 p-0 outline-none text-[14px] font-medium text-text-active"
        />
      </template>

      <!-- Textarea / Description Type -->
      <template v-else-if="type === 'textarea' || type === 'description'">
        <textarea
          v-model="internalValue"
          :rows="rows || 3"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          :class="[
            'w-full bg-transparent border-0 p-0 outline-none text-[14px] font-medium text-text-active placeholder:text-text-placeholder resize-none custom-scrollbar',
            heightClass
          ]"
        ></textarea>
      </template>

      <!-- Searchable Select / Master Search Dropdown -->
      <template v-else-if="isSearchableSelect">
        <SearchableSelect
          v-model="internalValue"
          :options="options"
          :master="master"
          :load-options="loadOptions"
          :fetch-by-id="fetchById"
          :filters="filters"
          :limit="limit"
          :debounce="debounce"
          :initial-option="initialOption"
          :option-label="optionLabel"
          :option-value="optionValue"
          :placeholder="placeholder || 'Pilih...'"
          :search-placeholder="searchPlaceholder"
          :empty-text="emptyText"
          :disabled="disabled"
          :required="required"
          :clearable="clearable"
          variant="seamless"
          class="w-full"
          @select="emit('select', $event)"
        />
      </template>

      <!-- Native Select Type (Fallback jika non-searchable static select) -->
      <template v-else-if="type === 'select'">
        <div class="relative w-full flex items-center">
          <select
            v-model="internalValue"
            :disabled="disabled"
            :required="required"
            class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-[14px] font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer"
          >
            <option v-if="placeholder" value="" disabled selected class="text-text-muted bg-white dark:bg-gray-900">
              {{ placeholder }}
            </option>
            <option
              v-for="(opt, idx) in normalizedOptions"
              :key="idx"
              :value="opt.value"
              class="text-text-active bg-white dark:bg-gray-900"
            >
              {{ opt.label }}
            </option>
          </select>
          <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
        </div>
      </template>

      <!-- Currency / Rupiah Type -->
      <template v-else-if="type === 'currency'">
        <div class="flex items-center w-full gap-1.5">
          <span class="text-[14px] font-medium text-text-muted shrink-0">Rp</span>
          <input
            :value="formattedCurrency"
            @input="handleCurrencyInput"
            type="text"
            inputmode="numeric"
            :placeholder="placeholder || '0'"
            :disabled="disabled"
            :readonly="readonly"
            :required="required"
            class="w-full bg-transparent border-0 p-0 outline-none text-[14px] font-medium text-text-active placeholder:text-text-placeholder"
          />
        </div>
      </template>

      <!-- Number Type -->
      <template v-else-if="type === 'number'">
        <input
          v-model.number="internalValue"
          type="number"
          :min="min"
          :max="max"
          :step="step"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          class="w-full bg-transparent border-0 p-0 outline-none text-[14px] font-medium text-text-active placeholder:text-text-placeholder"
        />
      </template>

      <!-- Default Text / Input Type -->
      <template v-else>
        <div class="flex items-center w-full gap-2">
          <slot name="prefix"></slot>
          <input
            v-model="internalValue"
            :type="type || 'text'"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :required="required"
            class="w-full bg-transparent border-0 p-0 outline-none text-[14px] font-medium text-text-active placeholder:text-text-placeholder"
          />
          <slot name="suffix"></slot>
        </div>
      </template>
    </div>

    <!-- Optional Error / Helper Text -->
    <p v-if="error" class="text-xs text-red-500 font-medium absolute -bottom-5 left-3">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import DatePicker from '@/components/ui/DatePicker.vue';
import SearchableSelect from '@/components/common/SearchableSelect.vue';

const props = defineProps({
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  labelWidth: { type: String, default: '150px' },
  type: { type: String, default: 'text' },
  modelValue: { type: [String, Number, Date, Boolean, Array, Object, null], default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  options: { type: Array, default: () => [] },
  optionLabel: { type: [String, Function], default: null },
  optionValue: { type: [String, Function], default: null },
  rows: { type: Number, default: 3 },
  height: { type: String, default: 'h-[80px]' },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  step: { type: Number, default: undefined },
  error: { type: String, default: '' },
  colSpan: { type: [String, Number], default: 1 },

  // Searchable / Master Remote Search Props
  searchable: { type: Boolean, default: false },
  master: { type: String, default: '' }, // e.g. 'goods', 'categories', 'locations', 'positions', 'uom', 'asset-types'
  loadOptions: { type: Function, default: null },
  fetchById: { type: Function, default: null },
  filters: { type: Object, default: () => ({}) },
  limit: { type: Number, default: 20 },
  debounce: { type: Number, default: 300 },
  clearable: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: '' },
  emptyText: { type: String, default: '' },
  initialOption: { type: [Object, String, Number], default: null },
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'select']);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val);
    emit('change', val);
  }
});

const isTextarea = computed(() => props.type === 'textarea' || props.type === 'description');

const isSearchableSelect = computed(() => {
  return (
    props.type === 'searchable-select' ||
    props.type === 'select-search' ||
    props.type === 'search-select' ||
    (props.type === 'select' && (props.searchable || !!props.master || typeof props.loadOptions === 'function'))
  );
});

const labelWidthClass = computed(() => {
  if (props.labelWidth === 'auto') return 'w-auto mr-1.5';
  if (props.labelWidth && props.labelWidth !== '150px' && props.labelWidth !== '120px') {
    return props.labelWidth.startsWith('w-') || props.labelWidth.startsWith('sm:')
      ? props.labelWidth
      : `w-full sm:w-[${props.labelWidth}]`;
  }
  return 'w-auto min-w-[70px] sm:min-w-[80px] max-w-[130px]';
});

const labelStyle = computed(() => {
  if (props.labelWidth && props.labelWidth !== 'auto' && !props.labelWidth.startsWith('w-') && !props.labelWidth.startsWith('sm:')) {
    return { width: props.labelWidth, flexShrink: 0 };
  }
  return {};
});

const heightClass = computed(() => props.height || 'h-[80px]');

const colSpanClass = computed(() => {
  if (props.colSpan === 'full' || props.colSpan === 2 || props.colSpan === '2') {
    return 'col-span-full md:col-span-2';
  }
  if (props.colSpan === 3 || props.colSpan === '3') {
    return 'col-span-full md:col-span-3';
  }
  return 'col-span-1';
});

const normalizedOptions = computed(() => {
  const labelKey = props.optionLabel || 'label';
  const valueKey = props.optionValue || 'value';
  return props.options.map((item) => {
    if (typeof item === 'object' && item !== null) {
      const lbl = typeof props.optionLabel === 'function' 
        ? props.optionLabel(item) 
        : (item[labelKey] ?? item.label ?? item.name ?? item.title ?? String(item));
      const val = typeof props.optionValue === 'function' 
        ? props.optionValue(item) 
        : (item[valueKey] ?? item.value ?? item.id ?? item);
      return {
        label: lbl,
        value: val
      };
    }
    return {
      label: String(item),
      value: item
    };
  });
});

const formattedCurrency = computed(() => {
  if (!props.modelValue && props.modelValue !== 0) return '';
  const num = Number(props.modelValue);
  if (isNaN(num)) return String(props.modelValue);
  return new Intl.NumberFormat('id-ID').format(num);
});

const handleCurrencyInput = (event) => {
  const target = event.target;
  const rawDigits = target.value.replace(/\D/g, '');
  const numericVal = rawDigits ? parseInt(rawDigits, 10) : 0;
  emit('update:modelValue', numericVal);
};
</script>

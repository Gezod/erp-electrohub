<template>
  <div class="relative w-full" ref="containerRef">
    <!-- Trigger -->
    <button
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      @click="toggle"
      @keydown.down.prevent="onArrow(1)"
      @keydown.up.prevent="onArrow(-1)"
      :title="selectedLabel || placeholder"
      :class="[
        variant === 'seamless' || variant === 'borderless'
          ? 'w-full bg-transparent border-0 p-0 outline-none flex items-center justify-between gap-2 text-left font-medium text-[14px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          : 'input-base w-full flex items-center justify-between gap-2 text-left font-bold cursor-pointer disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-400 disabled:cursor-not-allowed',
        selectedLabel ? 'text-text-active' : 'text-text-placeholder'
      ]"
    >
      <span class="flex-1 text-left line-clamp-2 break-words leading-tight">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="flex items-center gap-1 shrink-0 ml-auto">
        <span
          v-if="clearable && hasValue && !disabled"
          role="button"
          tabindex="-1"
          title="Hapus pilihan"
          @click.stop="clear"
          class="p-0.5 rounded text-text-muted hover:text-text-active hover:bg-bg-active cursor-pointer"
        >
          <X class="w-3.5 h-3.5" />
        </span>
        <ChevronDown
          class="w-4 h-4 text-text-muted transition-transform shrink-0"
          :class="{ 'rotate-180': isOpen }"
        />
      </span>
    </button>

    <!-- Proxy input agar validasi native `required` tetap jalan saat submit form -->
    <input
      v-if="required"
      class="absolute left-3 bottom-0 h-0 w-0 opacity-0 pointer-events-none"
      tabindex="-1"
      aria-hidden="true"
      :value="hasValue ? String(modelValue) : ''"
      required
      @focus="open"
    />

    <!--
      Panel — di-Teleport ke <body> dan posisinya `position: fixed` dihitung murni
      relatif ke VIEWPORT (getBoundingClientRect trigger + window.innerHeight),
      BUKAN relatif ke container manapun. Ini sengaja menghindari seluruh kelas bug
      "dropdown kepotong" yang muncul kalau trigger ada di dalam modal/container
      ber-scroll yang bersarang (nested overflow) — tidak peduli berapa banyak
      lapisan parent-nya, panel ini tidak akan pernah kepotong oleh overflow milik
      ancestor manapun karena sudah keluar dari DOM tree parent-nya sama sekali.
    -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="panelRef"
        :style="panelStyle"
        class="rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden dark:border-gray-700 dark:bg-gray-900"
      >
        <div class="p-2 border-b border-gray-100 dark:border-gray-800 relative flex items-center">
          <input
            ref="searchRef"
            v-model="query"
            type="text"
            :placeholder="effectiveSearchPlaceholder"
            autocomplete="off"
            class="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-3 pr-8 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            @keydown.down.prevent="onArrow(1)"
            @keydown.up.prevent="onArrow(-1)"
            @keydown.enter.prevent="selectHighlighted"
            @keydown.esc.prevent="close"
          />
          <Loader2
            v-if="isLoading"
            class="w-4 h-4 text-brand-500 animate-spin absolute right-4 pointer-events-none"
          />
        </div>

        <ul ref="listRef" class="overflow-y-auto py-1 custom-scrollbar" :style="{ maxHeight: listMaxHeight }">
          <li
            v-for="(opt, i) in filtered"
            :key="getValue(opt) ?? i"
            @click="select(opt)"
            @mouseenter="highlighted = i"
            class="flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer transition-colors"
            :class="[
              i === highlighted ? 'bg-brand-50 dark:bg-brand-500/10' : '',
              isSelected(opt)
                ? 'font-bold text-brand-600 dark:text-brand-400'
                : 'text-gray-700 dark:text-gray-200',
            ]"
          >
            <span class="break-words leading-snug">{{ getLabel(opt) }}</span>
            <Check v-if="isSelected(opt)" class="w-4 h-4 shrink-0 text-brand-600 dark:text-brand-400" />
          </li>

          <!-- Loading State Indicator saat list masih kosong -->
          <li v-if="isLoading && !filtered.length" class="px-3 py-4 flex items-center justify-center gap-2 text-xs text-text-muted">
            <Loader2 class="w-3.5 h-3.5 animate-spin text-brand-500" />
            <span>Memuat data...</span>
          </li>

          <!-- Empty State -->
          <li v-else-if="!isLoading && !filtered.length" class="px-3 py-4 text-center text-xs text-gray-400">
            {{ effectiveEmptyText }}
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import { ChevronDown, X, Check, Loader2 } from 'lucide-vue-next';
import { getMasterConfig, searchMaster, getMasterItemById } from '@/services/masterSearch.service';

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, Object, null], default: null },
  options: { type: Array, default: () => [] },
  // Nama key label/value, atau fungsi (opt) => string
  optionLabel: { type: [String, Function], default: null },
  optionValue: { type: [String, Function], default: null },
  // Nilai yang di-emit saat pilihan dihapus
  emptyValue: { type: [String, Number, null], default: null },
  placeholder: { type: String, default: 'Pilih...' },
  searchPlaceholder: { type: String, default: '' },
  emptyText: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },

  // Remote Search Props
  master: { type: String, default: '' }, // e.g. 'goods', 'categories', 'locations', 'positions', 'uom', 'asset-types'
  loadOptions: { type: Function, default: null }, // async (query, filters) => options
  fetchById: { type: Function, default: null }, // async (id) => item
  filters: { type: Object, default: () => ({}) },
  limit: { type: Number, default: 20 },
  debounce: { type: Number, default: 300 },
  initialOption: { type: [Object, String, Number], default: null },
});

const emit = defineEmits(['update:modelValue', 'change', 'select']);

const isOpen = ref(false);
const query = ref('');
const highlighted = ref(-1);
const containerRef = ref(null);
const triggerRef = ref(null);
const panelRef = ref(null);
const searchRef = ref(null);
const listRef = ref(null);

const placement = ref('bottom');
const listMaxHeight = ref('224px');

// Posisi panel — murni viewport-relative (lihat komentar di template soal kenapa).
const anchor = ref({ left: 0, width: 0, top: 0, bottom: 0 });

const panelStyle = computed(() => {
  const base = {
    position: 'fixed',
    left: `${anchor.value.left}px`,
    width: `${anchor.value.width}px`,
    zIndex: 9999,
  };
  if (placement.value === 'top') {
    return { ...base, bottom: `${anchor.value.bottom}px` };
  }
  return { ...base, top: `${anchor.value.top}px` };
});

// Remote search state
const remoteOptions = ref([]);
const isLoading = ref(false);
const selectedItem = ref(null);
let debounceTimer = null;

const masterConfig = computed(() => getMasterConfig(props.master));
const isRemote = computed(() => !!props.master || typeof props.loadOptions === 'function');

// Konfigurasi dinamis (Props meng-override Master Config)
const effectiveOptionLabel = computed(() => {
  if (props.optionLabel) return props.optionLabel;
  if (masterConfig.value?.optionLabel) return masterConfig.value.optionLabel;
  return 'name';
});

const effectiveOptionValue = computed(() => {
  if (props.optionValue) return props.optionValue;
  if (masterConfig.value?.optionValue) return masterConfig.value.optionValue;
  return 'id';
});

const effectiveSearchPlaceholder = computed(() => {
  if (props.searchPlaceholder) return props.searchPlaceholder;
  if (masterConfig.value?.searchPlaceholder) return masterConfig.value.searchPlaceholder;
  return 'Ketik untuk mencari...';
});

const effectiveEmptyText = computed(() => {
  if (props.emptyText) return props.emptyText;
  if (masterConfig.value?.emptyText) return masterConfig.value.emptyText;
  return 'Tidak ada hasil';
});

// Dihitung MURNI dari posisi trigger di viewport (getBoundingClientRect) vs
// window.innerHeight. Tidak lagi mencari "container scroll terdekat" sama sekali —
// karena panel sudah di-Teleport ke <body> dan fixed-positioned, satu-satunya batas
// yang relevan adalah tepi layar itu sendiri, bukan overflow milik ancestor manapun.
const updatePlacement = () => {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const margin = 6;
  const viewportHeight = window.innerHeight;

  anchor.value.left = rect.left;
  anchor.value.width = rect.width;

  const spaceBelow = viewportHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const minRequiredHeight = 200;

  if (spaceBelow < minRequiredHeight && spaceAbove > spaceBelow) {
    placement.value = 'top';
    anchor.value.bottom = viewportHeight - rect.top + margin;
    const available = Math.max(90, Math.min(280, spaceAbove - 55));
    listMaxHeight.value = `${available}px`;
  } else {
    placement.value = 'bottom';
    anchor.value.top = rect.bottom + margin;
    const available = Math.max(90, Math.min(280, spaceBelow - 55));
    listMaxHeight.value = `${available}px`;
  }
};

const getLabel = (opt) => {
  if (!opt && opt !== 0) return '';
  const labelProp = effectiveOptionLabel.value;
  if (typeof labelProp === 'function') return labelProp(opt);
  if (opt && typeof opt === 'object') {
    return (
      opt[labelProp] ??
      opt.label ??
      opt.fullName ??
      opt.full_name ??
      opt.name ??
      opt.location_name ??
      opt.good_name ??
      opt.name_category ??
      opt.name_type ??
      opt.title ??
      ''
    );
  }
  return String(opt ?? '');
};

const getValue = (opt) => {
  if (!opt && opt !== 0) return null;
  const valueProp = effectiveOptionValue.value;
  if (typeof valueProp === 'function') return valueProp(opt);
  if (opt && typeof opt === 'object') {
    return (
      opt[valueProp] ??
      opt.value ??
      opt.employeeId ??
      opt.employee_id ??
      opt.id ??
      opt.key ??
      opt
    );
  }
  return opt;
};

const hasValue = computed(
  () => props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== ''
);

const isSelected = (opt) => hasValue.value && String(getValue(opt)) === String(props.modelValue);

// Resolusi Label yang sedang dipilih
const selectedLabel = computed(() => {
  if (!hasValue.value) return '';

  // 1. Cek apakah ada di selectedItem yang disimpan
  if (selectedItem.value && isSelected(selectedItem.value)) {
    return getLabel(selectedItem.value);
  }

  // 2. Cek apakah ada di daftar opsi saat ini
  const currentList = isRemote.value ? remoteOptions.value : props.options;
  const match = currentList.find((o) => isSelected(o));
  if (match) {
    selectedItem.value = match;
    return getLabel(match);
  }

  // 3. Cek initialOption yang dipassing langsung oleh parent
  if (props.initialOption) {
    if (typeof props.initialOption === 'object') {
      if (isSelected(props.initialOption)) {
        selectedItem.value = props.initialOption;
        return getLabel(props.initialOption);
      }
    } else {
      return String(props.initialOption);
    }
  }

  return '';
});

// Resolusi item awal via fetchById saat edit mode
const resolveInitialItem = async (val) => {
  if (!val || !isRemote.value) return;
  // Jika sudah ada item yang cocok, lewati fetch
  if (selectedItem.value && String(getValue(selectedItem.value)) === String(val)) return;

  try {
    let item = null;
    if (typeof props.fetchById === 'function') {
      item = await props.fetchById(val);
    } else if (props.master) {
      item = await getMasterItemById(props.master, val);
    }
    if (item) {
      selectedItem.value = item;
    }
  } catch (error) {
    console.error('[SearchableSelect] Failed to resolve initial item:', error);
  }
};

// Eksekusi Pencarian Server-Side
const executeRemoteSearch = async (searchText = '') => {
  if (!isRemote.value) return;

  isLoading.value = true;
  try {
    const trimmed = (searchText || '').trim();
    if (typeof props.loadOptions === 'function') {
      const result = await props.loadOptions(trimmed, props.filters);
      remoteOptions.value = Array.isArray(result?.data)
        ? result.data
        : (Array.isArray(result) ? result : []);
    } else if (props.master) {
      remoteOptions.value = await searchMaster(props.master, {
        search: trimmed,
        page: 1,
        limit: props.limit,
        filters: props.filters,
      });
    }
  } catch (error) {
    console.error('[SearchableSelect] Remote search error:', error);
    remoteOptions.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Opsi yang ditampilkan (Remote vs Static)
const filtered = computed(() => {
  if (isRemote.value) {
    return remoteOptions.value;
  }

  // Static options filtering (Client-Side)
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) =>
    String(getLabel(o) ?? '')
      .toLowerCase()
      .includes(q)
  );
});

// Watch input query untuk debounced remote search
watch(query, (val) => {
  if (isRemote.value && isOpen.value) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      executeRemoteSearch(val);
    }, props.debounce);
  }
});

// Watch filters jika berubah (mis. subkategori saat parent kategori berganti)
watch(
  () => props.filters,
  () => {
    if (isRemote.value && isOpen.value) {
      executeRemoteSearch(query.value);
    }
  },
  { deep: true }
);

// Watch modelValue untuk resolve item saat data pertama kali terisi / berubah
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== null && newVal !== undefined && newVal !== '') {
      resolveInitialItem(newVal);
    } else {
      selectedItem.value = null;
    }
  },
  { immediate: true }
);

// Reset highlight ke item pertama tiap kali hasil filter berubah
watch(filtered, (list) => {
  highlighted.value = list.length ? 0 : -1;
});

function toggle() {
  if (isOpen.value) close();
  else open();
}

function open() {
  if (props.disabled) return;
  isOpen.value = true;
  query.value = '';
  updatePlacement();

  if (isRemote.value) {
    // Muat data awal jika list belum ada
    executeRemoteSearch('');
  }

  const currentList = isRemote.value ? remoteOptions.value : props.options;
  highlighted.value = currentList.findIndex((o) => isSelected(o));

  nextTick(() => {
    updatePlacement();
    searchRef.value?.focus();
  });
}

function close() {
  isOpen.value = false;
}

function select(opt) {
  selectedItem.value = opt;
  const val = getValue(opt);
  emit('update:modelValue', val);
  emit('change', val);
  emit('select', opt);
  close();
}

function selectHighlighted() {
  const opt = filtered.value[highlighted.value];
  if (opt) select(opt);
}

function clear() {
  selectedItem.value = null;
  emit('update:modelValue', props.emptyValue);
  emit('change', props.emptyValue);
  emit('select', null);
  close();
}

function onArrow(dir) {
  if (!isOpen.value) {
    open();
    return;
  }
  const n = filtered.value.length;
  if (!n) return;
  highlighted.value = (highlighted.value + dir + n) % n;
  nextTick(() => listRef.value?.children?.[highlighted.value]?.scrollIntoView({ block: 'nearest' }));
}

// Klik di luar — dicek manual terhadap containerRef (trigger) DAN panelRef (panel
// yang sudah di-Teleport ke <body>, jadi secara DOM tree sudah di luar containerRef).
// Sengaja tidak lagi pakai directive v-click-outside lama, karena directive itu
// kemungkinan cuma mengecek "di luar elemen yang dipasangi", dan sejak panel
// dipindah ke <body>, panel tidak lagi jadi descendant elemen itu.
const handleDocumentPointerDown = (e) => {
  if (!isOpen.value) return;
  const target = e.target;
  const insideTrigger = containerRef.value?.contains(target);
  const insidePanel = panelRef.value?.contains(target);
  if (!insideTrigger && !insidePanel) {
    close();
  }
};

watch(isOpen, (openState) => {
  if (openState) {
    window.addEventListener('resize', updatePlacement, { passive: true });
    window.addEventListener('scroll', updatePlacement, { passive: true, capture: true });
    document.addEventListener('mousedown', handleDocumentPointerDown, true);
  } else {
    window.removeEventListener('resize', updatePlacement);
    window.removeEventListener('scroll', updatePlacement, true);
    document.removeEventListener('mousedown', handleDocumentPointerDown, true);
  }
});

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  window.removeEventListener('resize', updatePlacement);
  window.removeEventListener('scroll', updatePlacement, true);
  document.removeEventListener('mousedown', handleDocumentPointerDown, true);
});
</script>

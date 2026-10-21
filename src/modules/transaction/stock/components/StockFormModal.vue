<template>
  <AppForm
    v-model="isOpen"
    :title="isEditMode ? 'Update Record Stok' : 'Tambah Stok Baru'"
    :is-modal="true"
    max-width="max-w-[620px]"
    :loading="isSubmitting"
    :submit-label="isEditMode ? 'Simpan Perubahan' : 'Buat Record Stok'"
    @submit="onSubmit"
    @close="handleClose"
  >
    <!-- Pemilih Tipe Stok & Info Banner (Mode Tambah Baru) -->
    <div v-if="!isEditMode" class="flex flex-col gap-3">
      <!-- Tipe Stok: biasa | opening | parfum | retur -->
      <div class="flex flex-wrap items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-lg w-fit shrink-0">
        <button
          v-for="opt in STOCK_TYPE_OPTIONS"
          :key="opt.value"
          type="button"
          @click="handleSelectTipe(opt.value)"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer',
            form.tipe === opt.value
              ? 'bg-white dark:bg-gray-800 border border-border dark:border-border text-text-active shadow-xs'
              : 'text-text-muted hover:text-text-active bg-transparent border-transparent'
          ]"
        >
          <DollarSign v-if="opt.value === 'biasa'" class="w-4 h-4 shrink-0" />
          <PackageX v-else-if="opt.value === 'retur'" class="w-4 h-4 shrink-0" />
          <span>{{ opt.label }}</span>
        </button>
      </div>

      <!-- Info Banner -->
      <div :class="[
        'border border-dashed p-2.5 px-3 rounded-lg flex gap-2.5 items-start transition-all duration-300',
        tipeValued
          ? 'bg-blue-50/60 dark:bg-indigo-950/20 border-blue-200 dark:border-indigo-800/30'
          : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30'
      ]">
        <component
          :is="tipeValued ? DollarSign : PackageX"
          :class="['w-4 h-4 shrink-0 mt-0.5', tipeValued ? 'text-blue-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400']"
        />
        <div class="flex flex-col">
          <p :class="['text-xs font-bold leading-tight', tipeValued ? 'text-blue-700 dark:text-indigo-400' : 'text-amber-800 dark:text-amber-400']">
            {{ STOCK_TYPE_LABEL[form.tipe] }}{{ tipeValued ? ' (Valued)' : ' (Unvalued)' }}
          </p>
          <p :class="['text-[11px] mt-0.5 leading-normal', tipeValued ? 'text-blue-600/80 dark:text-indigo-300/80' : 'text-amber-700/80 dark:text-amber-400/70']">
            {{ tipeBannerText }}
          </p>
        </div>
      </div>
    </div>

    <!-- 1 FormSection dengan 1 Kolom per Baris -->
    <FormSection title="Informasi Stok" :cols="1">
      
      <!-- Barang -->
      <FormField
        v-if="!isEditMode"
        label="Barang"
        label-width="160px"
        :required="true"
        type="searchable-select"
        master="goods"
        v-model="form.goodId"
      />
      <FormField v-else label="Barang" label-width="160px" :required="true">
        <input
          :value="goodDisplayName"
          type="text"
          readonly
          disabled
          class="w-full bg-transparent border-0 p-0 text-sm font-semibold text-text-muted outline-none cursor-not-allowed"
        />
      </FormField>

      <!-- Lokasi -->
      <FormField
        label="Lokasi Penempatan"
        label-width="160px"
        :required="true"
        type="searchable-select"
        master="locations"
        v-model="form.locationId"
      />

      <!-- PIC Pemilik Stok -->
      <FormField
        v-if="isSuperAdmin"
        label="PIC Pemilik Stok"
        label-width="160px"
        type="searchable-select"
        master="employees"
        v-model="form.picGaId"
        :initial-option="initialPicOption"
        :clearable="true"
        placeholder="Pilih PIC Karyawan (Opsional)"
      />
      <FormField v-else label="PIC Pemilik Stok" label-width="160px">
        <div class="flex items-center justify-between w-full">
          <span class="text-sm font-semibold text-text-active">{{ picDisplayName || 'User GA' }}</span>
          <span class="bg-blue-50 dark:bg-indigo-950/20 text-blue-700 dark:text-brand-400 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 select-none">
            Otomatis
          </span>
        </div>
      </FormField>

      <!-- Stok Awal (QTY First) -->
      <FormField
        label="Stok Awal (QTY First)"
        type="number"
        v-model.number="form.qtyFirst"
        label-width="160px"
        placeholder="0"
        min="0"
        step="any"
      />

      <!-- Harga Satuan (Unit Cost) -->
      <FormField v-if="tipeValued" label="Harga Satuan (Unit Cost)" label-width="160px">
        <div class="flex items-center gap-2 w-full">
          <span class="text-sm font-semibold text-text-muted select-none">IDR</span>
          <span class="text-border select-none">|</span>
          <input
            v-model="displayUnitCost"
            type="text"
            placeholder="0"
            class="w-full bg-transparent border-0 p-0 text-sm font-semibold text-text-active outline-none"
          />
        </div>
      </FormField>

    </FormSection>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import { DollarSign, PackageX } from 'lucide-vue-next';
import { STOCK_TYPE_OPTIONS, STOCK_TYPE_LABEL, isValuedTipe } from '@/utils/stockType';

// Services, Stores & Alerts
import { useStockStore } from '../stock.store';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { Alert } from '@/plugins/sweetalert';
import { formatThousand, parseThousand } from '@/utils/format';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  stockId: { type: [String, Number], default: null },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const stockStore = useStockStore();
const authStore = useAuthStore();

// --- Computed States ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEditMode = computed(() => !!props.stockId);
const isSubmitting = ref(false);

const isSuperAdmin = computed(() => {
  const user = authStore.user;
  const isSuper = user?.is_superadmin === true || user?.isAdmin === true;
  const divName = (user?.divisionName || user?.division_name || '').toUpperCase();
  const isGA = divName.includes('GA') || divName.includes('GENERAL AFFAIRS');
  return isSuper || isGA;
});

const goodDisplayName = ref('');
const picDisplayName = ref('');

const initialPicOption = computed(() => {
  if (!form.picGaId) return null;
  if (picDisplayName.value) {
    return {
      value: form.picGaId,
      employeeId: form.picGaId,
      label: picDisplayName.value,
    };
  }
  return null;
});

// --- Form State ---
const defaultFormData = () => ({
  goodId: '',
  locationId: '',
  picGaId: '',
  tipe: 'biasa',
  qtyFirst: 0,
  unitCost: 0,
});

const form = reactive(defaultFormData());

const tipeValued = computed(() => isValuedTipe(form.tipe));

const tipeBannerText = computed(() =>
  tipeValued.value
    ? 'Stok ini memiliki nilai buku. Harga satuan digunakan untuk kalkulasi weighted average.'
    : 'Stok ini tidak memiliki nilai (Rp 0). Tidak akan mempengaruhi harga rata-rata stok utama.'
);

const displayUnitCost = computed({
  get: () => formatThousand(form.unitCost),
  set: (val) => {
    form.unitCost = parseThousand(val);
  },
});

const handleSelectTipe = (val) => {
  form.tipe = val;
  if (!isValuedTipe(val)) {
    form.unitCost = 0;
  }
};

const getGoodLabel = (g) => {
  if (!g) return '';
  const parts = [g.good_name || ''];
  const sub = [g.good_code, g.merk && g.merk !== '-' ? g.merk : null].filter(Boolean).join(' • ');
  return sub ? `${parts[0]} (${sub})` : parts[0];
};

const initData = async (id) => {

  if (id) {
    try {
      const detail = await stockStore.fetchDetail(id);
      if (detail) {
        Object.assign(form, {
          goodId: detail.goodId || detail.good_id || '',
          locationId: detail.locationId || detail.location_id || '',
          picGaId: detail.picGaId || detail.employee_id || '',
          tipe: detail.tipeStok || detail.tipe || 'biasa',
          qtyFirst: Number(detail.qtyFirst ?? detail.qty_first) || 0,
          unitCost: Number(detail.unitCost ?? detail.unit_cost) || 0,
        });

        if (detail.good) {
          goodDisplayName.value = getGoodLabel(detail.good);
        }
        if (detail.employee) {
          picDisplayName.value = detail.employee.full_name || detail.employee.fullName || '';
        }
      }
    } catch (error) {
      console.error('Failed to load stock detail:', error);
      const msg = error.response?.data?.message || 'Data stok tidak ditemukan.';
      Alert.error('Gagal!', msg);
      handleClose();
    }
  } else {
    Object.assign(form, defaultFormData());
    goodDisplayName.value = '';

    // Auto set PIC if logged in
    const currentEmpId = authStore.user?.employee_id || authStore.user?.employeeId || '';
    form.picGaId = currentEmpId;
    picDisplayName.value = authStore.user?.full_name || authStore.user?.fullName || authStore.user?.displayName || 'User GA';
  }
};

watch(
  () => [props.modelValue, props.stockId],
  async ([open, id]) => {
    if (!open) return;
    await initData(id);
  },
  { immediate: true }
);

const handleClose = () => {
  emit('update:modelValue', false);
};

const onSubmit = async () => {
  if (!form.goodId && !isEditMode.value) {
    Alert.error('Validasi Gagal', 'Harap pilih barang terlebih dahulu.');
    return;
  }
  if (!form.locationId) {
    Alert.error('Validasi Gagal', 'Harap pilih lokasi terlebih dahulu.');
    return;
  }

  if (!tipeValued.value) {
    form.unitCost = 0;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await stockStore.updateStock(props.stockId, form);
      Alert.success('Update Berhasil', 'Record data stok telah diperbarui.');
    } else {
      await stockStore.createStock(form);
      Alert.success('Simpan Berhasil', 'Record data stok baru telah berhasil dibuat.');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit stock error:', error);
    const msg = error.response?.data?.message || 'Terjadi kesalahan saat memproses data ke server.';
    Alert.error('Gagal Simpan', msg);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

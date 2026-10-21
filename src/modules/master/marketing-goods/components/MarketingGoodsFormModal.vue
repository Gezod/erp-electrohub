<template>
  <AppForm
    v-model="isOpen"
    :title="isEditMode ? 'Edit Barang Marketing' : 'Tambah Barang Marketing'"
    :subtitle="isEditMode ? `Kode Barang: ${form.good_code || '#' + goodId}` : 'Formulir master barang operasional marketing'"
    :is-modal="true"
    max-width="max-w-[620px]"
    :loading="isSubmitting"
    :submit-label="isEditMode ? 'Simpan Perubahan' : 'Simpan Data'"
    cancel-label="Batal"
    :disabled="!isFormComplete"
    @submit="onSubmit"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <FormSection title="Informasi Barang Marketing" :cols="1">
        <!-- Kode Barang (Mode Edit) -->
        <FormField v-if="isEditMode" label="Kode Barang" label-width="160px" :required="true">
          <div class="flex flex-col gap-1 w-full">
            <input
              v-model="form.good_code"
              type="text"
              maxlength="32"
              :disabled="isSubmitting"
              placeholder="mis. MKT-MJD-001"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-bold uppercase text-text-active placeholder:text-text-placeholder focus:ring-0"
              required
              @blur="normalizeGoodCode"
            />
            <p v-if="goodCodeChanged" class="text-[11px] text-amber-600 dark:text-amber-500 italic leading-tight">
              Kode diubah dari
              <span class="font-mono font-semibold">{{ originalGoodCode }}</span>.
              Referensi pada transaksi lama dapat terpengaruh.
            </p>
          </div>
        </FormField>

        <!-- Nama Barang -->
        <FormField label="Nama Barang" label-width="160px" :required="true">
          <input
            v-model="form.good_name"
            type="text"
            :disabled="isSubmitting"
            placeholder="Contoh: Meja Display Produk, Banner, Brosur..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            required
          />
        </FormField>

        <!-- Satuan (UOM) -->
        <FormField
          label="Satuan (UOM)"
          label-width="160px"
          type="searchable-select"
          master="uom"
          v-model="form.uom_id"
          :initial-option="initialUomOption"
          :disabled="isSubmitting"
          placeholder="Pilih satuan..."
          search-placeholder="Cari satuan..."
          :clearable="true"
          :required="true"
        />

        <!-- Tipe Barang -->
        <FormField label="Tipe Barang" label-width="160px" :required="true">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.tipe_barang"
              :disabled="isSubmitting"
              required
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer focus:ring-0"
            >
              <option value="temporary" class="bg-white dark:bg-gray-900 text-text-active">
                Temporary (Stok Marketing / Habis Pakai)
              </option>
              <option value="permanent" class="bg-white dark:bg-gray-900 text-text-active">
                Permanent (Otomatis Jadi Aset saat Purchase Selesai)
              </option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>

        <!-- Tipe Aset (Hanya untuk Permanent) -->
        <FormField
          v-if="form.tipe_barang === 'permanent'"
          label="Tipe Aset (Default)"
          label-width="160px"
          type="searchable-select"
          master="asset-types"
          v-model="form.asset_type_id"
          :initial-option="initialAssetTypeOption"
          :disabled="isSubmitting"
          placeholder="Pilih tipe aset..."
          search-placeholder="Cari tipe aset..."
          :clearable="true"
          :required="true"
        />

        <!-- Kode Singkat Aset (Hanya untuk Permanent) -->
        <FormField
          v-if="form.tipe_barang === 'permanent'"
          label="Kode Singkat Aset"
          label-width="160px"
        >
          <div class="flex flex-col gap-1 w-full">
            <input
              v-model="form.code_abbr"
              type="text"
              maxlength="16"
              :disabled="isSubmitting"
              placeholder="mis. MJD"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-bold uppercase text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
            <p class="text-[11px] text-text-muted italic leading-tight">
              Format kode aset:
              <span class="font-mono font-semibold">
                MKT {{ form.code_abbr?.toUpperCase() || 'XXX' }}-DDMMYY-01
              </span>
            </p>
          </div>
        </FormField>

        <!-- Status Barang -->
        <FormField label="Status Barang" label-width="160px" :required="true">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.is_active"
              :disabled="isSubmitting"
              required
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer focus:ring-0"
            >
              <option :value="true" class="bg-white dark:bg-gray-900 text-text-active">
                Aktif (Dapat Digunakan)
              </option>
              <option :value="false" class="bg-white dark:bg-gray-900 text-text-active">
                Tidak Aktif (Diarsipkan)
              </option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>
      </FormSection>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import { ChevronDown } from 'lucide-vue-next';
import { useMarketingGoodsStore } from '../marketingGoods.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  goodId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useMarketingGoodsStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEditMode = computed(() => !!props.goodId);
const isSubmitting = ref(false);

const goodDetail = ref(null);
const originalGoodCode = ref('');

const defaultFormData = () => ({
  good_code: '',
  good_name: '',
  uom_id: null,
  tipe_barang: 'temporary',
  asset_type_id: null,
  code_abbr: '',
  is_active: true
});

const form = reactive(defaultFormData());

const normalizeGoodCode = () => {
  form.good_code = (form.good_code || '').trim().toUpperCase().replace(/\s+/g, '-');
};

const goodCodeChanged = computed(() =>
  isEditMode.value &&
  !!originalGoodCode.value &&
  form.good_code?.trim().toUpperCase() !== originalGoodCode.value
);

const initialUomOption = computed(() => {
  if (!form.uom_id) return null;
  if (goodDetail.value?.uom?.name) {
    return {
      value: form.uom_id,
      label: goodDetail.value.uom.name
    };
  }
  return null;
});

const initialAssetTypeOption = computed(() => {
  if (!form.asset_type_id) return null;
  if (goodDetail.value?.asset_type?.name_type) {
    return {
      value: form.asset_type_id,
      label: goodDetail.value.asset_type.name_type
    };
  }
  return null;
});

const isFormComplete = computed(() => {
  if (!form.good_name?.trim() || !form.uom_id || !form.tipe_barang) {
    return false;
  }
  if (isEditMode.value && !form.good_code?.trim()) {
    return false;
  }
  if (form.tipe_barang === 'permanent' && !form.asset_type_id) {
    return false;
  }
  return true;
});

const initData = async (id) => {
  isSubmitting.value = true;
  try {
    if (id) {
      const data = await store.fetchGoodById(id);
      if (data) {
        goodDetail.value = data;
        originalGoodCode.value = (data.good_code || '').toUpperCase();
        Object.assign(form, {
          good_code: data.good_code || '',
          good_name: data.good_name || '',
          uom_id: data.uom_id || null,
          tipe_barang: data.tipe_barang || 'temporary',
          asset_type_id: data.asset_type_id || null,
          code_abbr: data.code_abbr || '',
          is_active: data.is_active ?? true
        });
      }
    } else {
      goodDetail.value = null;
      originalGoodCode.value = '';
      Object.assign(form, defaultFormData());
    }
  } catch (error) {
    console.error('MarketingGoodsFormModal: Init failed', error);
    if (id) {
      Alert.error('Gagal', 'Data barang marketing tidak ditemukan.');
      handleClose();
    }
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => [props.modelValue, props.goodId],
  async ([open, id]) => {
    if (open) {
      await initData(id);
    }
  },
  { immediate: true }
);

const handleClose = () => {
  isOpen.value = false;
  emit('close');
};

const onSubmit = async () => {
  normalizeGoodCode();

  if (isEditMode.value && !form.good_code) {
    Alert.error('Validasi Gagal', 'Kode Barang tidak boleh kosong.');
    return;
  }

  if (form.tipe_barang === 'permanent' && !form.asset_type_id) {
    Alert.error('Validasi Gagal', 'Tipe Aset wajib dipilih untuk barang Permanent.');
    return;
  }

  if (goodCodeChanged.value) {
    const isConfirmed = await Alert.confirm(
      'Ubah Kode Barang?',
      `Kode akan diubah dari "${originalGoodCode.value}" menjadi "${form.good_code}". Pastikan tidak ada transaksi berjalan yang merujuk kode lama.`
    );
    if (!isConfirmed) return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await store.updateGood(props.goodId, form);
      Alert.toast('Data barang marketing telah diperbarui', 'success');
    } else {
      await store.createGood(form);
      Alert.toast('Barang marketing baru telah ditambahkan', 'success');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit error:', error);
    const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
    Alert.error('Gagal Menyimpan', msg);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <AppForm
    v-model="isOpen"
    :title="isEditMode ? 'Edit Data Barang' : 'Tambah Data Barang'"
    :is-modal="true"
    max-width="max-w-[620px]"
    :loading="isSubmitting"
    :submit-label="isEditMode ? 'Update Data' : 'Simpan Data'"
    @submit="onSubmit"
    @close="handleClose"
  >
    <!-- 1 FormSection dengan 1 Kolom per Baris -->
    <FormSection title="Informasi Barang" :cols="1">
      
      <!-- Kode Barang (Tampil hanya pada Mode Edit) -->
      <FormField
        v-if="isEditMode"
        label="Kode Barang"
        v-model="form.good_code"
        label-width="160px"
        :readonly="true"
        :disabled="true"
      />

      <!-- Nama Barang -->
      <FormField
        label="Nama Barang"
        v-model="form.good_name"
        label-width="160px"
        placeholder="Masukkan nama barang..."
        :required="true"
      />

      <!-- Merek / Brand -->
      <FormField
        label="Merek / Brand"
        v-model="form.merk"
        label-width="160px"
        placeholder="Masukkan merek atau brand..."
      />

      <!-- Tipe Aset -->
      <FormField
        label="Tipe Aset"
        label-width="160px"
        type="searchable-select"
        master="asset-types"
        v-model="form.asset_type_id"
        :clearable="true"
        placeholder="Pilih Tipe Aset (Opsional)"
      />

      <!-- Kategori Utama -->
      <FormField
        label="Kategori Utama"
        label-width="160px"
        :required="true"
        type="searchable-select"
        master="categories"
        :filters="{ parent_id: 'null' }"
        v-model="selectedParentId"
        placeholder="Pilih Kategori Utama"
        @select="onParentCategorySelect"
      />

      <!-- Sub Kategori -->
      <FormField
        label="Sub Kategori"
        label-width="160px"
        type="searchable-select"
        master="categories"
        :filters="{ parent_id: selectedParentId }"
        :disabled="!selectedParentId"
        v-model="selectedSubId"
        :clearable="true"
        placeholder="Pilih Sub Kategori"
        @select="onSubCategorySelect"
      />

      <!-- Kode Singkat Aset (Tampil jika Kategori bertipe Aset) -->
      <FormField
        v-if="isAssetCategory"
        label="Kode Singkat Aset"
        v-model="form.code_abbr"
        label-width="160px"
        placeholder="mis. LPT"
      />

      <!-- Satuan (UOM) -->
      <FormField
        label="Satuan (UOM)"
        label-width="160px"
        :required="true"
        type="searchable-select"
        master="uom"
        v-model="form.uom_id"
        placeholder="Pilih Satuan"
      />

      <!-- Minimum Stok -->
      <FormField
        label="Minimum Stok"
        type="number"
        v-model="form.stock_minimum"
        label-width="160px"
        placeholder="0"
        :min="0"
      />

      <!-- Status Barang -->
      <FormField
        label="Status Barang"
        type="select"
        v-model="form.is_active"
        label-width="160px"
        :options="[
          { label: 'Aktif (Dapat Dipesan)', value: true },
          { label: 'Tidak Aktif (Diarsipkan)', value: false }
        ]"
      />

    </FormSection>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';

// Services & Stores
import { useGoodsStore } from '../stores/goods.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  goodId: { type: [String, Number], default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const goodsStore = useGoodsStore();

// --- State ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEditMode = computed(() => !!props.goodId);
const isSubmitting = ref(false);

const defaultFormData = () => ({
  category_id: '',
  asset_type_id: null,
  uom_id: null,
  good_code: '',
  good_name: '',
  code_abbr: '',
  merk: '',
  stock_first: 0,
  stock_minimum: 0,
  is_active: true,
});

const form = reactive(defaultFormData());

// State internal pelengkap UI Kategori
const selectedParentId = ref('');
const selectedSubId = ref('');
const selectedParentCategory = ref(null);
const selectedSubCategory = ref(null);

const onParentCategorySelect = (item) => {
  selectedParentCategory.value = item;
};

const onSubCategorySelect = (item) => {
  selectedSubCategory.value = item;
};

// --- Computed ---

const isAssetCategory = computed(() => {
  if (selectedSubCategory.value) {
    return !!selectedSubCategory.value.is_asset;
  }
  if (selectedParentCategory.value) {
    return !!selectedParentCategory.value.is_asset;
  }
  return false;
});

// --- Watchers ---

watch(selectedSubId, (newVal) => {
  if (newVal) {
    form.category_id = newVal;
  }
});

watch(selectedParentId, () => {
  selectedSubId.value = '';
  selectedSubCategory.value = null;
  form.category_id = selectedParentId.value;
});

// Watch when modal is opened / closed or goodId changed
watch(
  () => [props.modelValue, props.goodId],
  async ([open, id]) => {
    if (!open) return;
    await initData(id);
  },
  { immediate: true }
);

// --- Methods ---

const initData = async (id) => {
  try {
    if (id) {
      const data = await goodsStore.fetchGoodById(id);
      Object.assign(form, {
        category_id: data.category_id,
        asset_type_id: data.asset_type_id,
        uom_id: data.uom_id,
        good_code: data.good_code,
        good_name: data.good_name,
        code_abbr: data.code_abbr || '',
        merk: data.merk,
        stock_first: data.stock_first,
        stock_minimum: data.stock_minimum,
        is_active: data.is_active
      });

      if (data.category?.parent) {
        selectedParentId.value = data.category.parent.id;
        selectedParentCategory.value = data.category.parent;
        await nextTick();
        selectedSubId.value = data.category_id;
        selectedSubCategory.value = data.category;
      } else {
        selectedParentId.value = data.category_id;
        selectedParentCategory.value = data.category;
      }
    } else {
      // Reset form on Create Mode
      Object.assign(form, defaultFormData());
      selectedParentId.value = '';
      selectedSubId.value = '';
    }
  } catch (error) {
    console.error('Init data failed:', error);
    if (id) {
      const msg = error.response?.data?.message || 'Data barang tidak ditemukan.';
      Alert.error('Gagal!', msg);
      handleClose();
    }
  }
};

const handleClose = () => {
  emit('update:modelValue', false);
};

const onSubmit = async () => {
  if (!form.category_id) {
    Alert.error('Validasi Gagal', 'Harap pilih kategori barang terlebih dahulu.');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await goodsStore.updateGood(props.goodId, form);
      Alert.success('Update Berhasil', 'Data barang telah diperbarui.');
    } else {
      await goodsStore.createGood(form);
      Alert.success('Simpan Berhasil', 'Data barang baru telah didaftarkan.');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit error:', error);
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat memproses data ke server.';
    Alert.error('Gagal Simpan', errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

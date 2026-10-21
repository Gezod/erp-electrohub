<template>
  <AppForm
    v-model="isOpen"
    :title="isEditMode ? 'Edit Data Kategori' : 'Tambah Data Kategori'"
    :is-modal="true"
    max-width="max-w-[620px]"
    :loading="isSubmitting"
    :submit-label="isEditMode ? 'Update Data' : 'Simpan Data'"
    @submit="onSubmit"
    @close="handleClose"
  >
    <!-- 1 FormSection dengan 1 Kolom per Baris -->
    <FormSection title="Informasi Kategori" :cols="1">
      
      <!-- Nama Kategori -->
      <FormField
        label="Nama Kategori"
        v-model="form.name_category"
        label-width="160px"
        placeholder="Masukkan nama kategori..."
        :required="true"
      />

      <!-- Parent Kategori -->
      <FormField
        label="Kategori Induk"
        label-width="160px"
        type="searchable-select"
        master="categories"
        v-model="form.parent_id"
        :initial-option="initialParentOption"
        :clearable="true"
        placeholder="Pilih Kategori Induk (Opsional)"
        search-placeholder="Cari parent kategori..."
      />

      <!-- Deskripsi -->
      <FormField
        label="Deskripsi"
        type="description"
        v-model="form.description"
        label-width="160px"
        placeholder="Keterangan kategori (opsional)..."
        :rows="3"
      />

      <!-- Tipe Aset -->
      <FormField
        label="Tipe Kategori"
        type="select"
        v-model="form.is_asset"
        label-width="160px"
        :options="[
          { label: 'Kategori Aset', value: true },
          { label: 'Bukan Aset (Operasional / Barang Biasa)', value: false }
        ]"
      />

      <!-- Status Aktivasi -->
      <FormField
        label="Status Kategori"
        type="select"
        v-model="form.is_active"
        label-width="160px"
        :options="[
          { label: 'Aktif', value: true },
          { label: 'Non-Aktif', value: false }
        ]"
      />

    </FormSection>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';

// Store & Alerts
import { useCategoryStore } from '../category.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  categoryId: { type: [String, Number], default: null },
  parentId: { type: [String, Number], default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const categoryStore = useCategoryStore();

// --- State ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEditMode = computed(() => !!props.categoryId);
const isSubmitting = ref(false);

const defaultFormData = () => ({
  name_category: '',
  parent_id: null,
  parentName: '',
  description: '',
  is_asset: false,
  is_active: true
});

const form = reactive(defaultFormData());

const initialParentOption = computed(() => {
  if (!form.parent_id) return null;
  if (form.parentName) {
    return {
      value: form.parent_id,
      label: form.parentName,
    };
  }
  return null;
});

// Watch when modal is opened / closed or categoryId / parentId changed
watch(
  () => [props.modelValue, props.categoryId, props.parentId],
  async ([open, id, pId]) => {
    if (!open) return;
    await initData(id, pId);
  },
  { immediate: true }
);

const initData = async (id, pId) => {
  try {
    if (id) {
      const data = await categoryStore.fetchCategoryById(id);
      Object.assign(form, {
        name_category: data.name_category || '',
        parent_id: data.parent_id || null,
        parentName: data.parent?.name_category || '',
        description: data.description && data.description !== '-' ? data.description : '',
        is_asset: typeof data.is_asset === 'boolean' ? data.is_asset : false,
        is_active: typeof data.is_active === 'boolean' ? data.is_active : true
      });
    } else {
      // Create mode
      Object.assign(form, defaultFormData());
      if (pId) {
        form.parent_id = pId;
      }
    }
  } catch (error) {
    console.error('Init category form failed:', error);
    if (id) {
      const msg = error.response?.data?.message || 'Data kategori tidak ditemukan.';
      Alert.error('Gagal!', msg);
      handleClose();
    }
  }
};

const handleClose = () => {
  emit('update:modelValue', false);
};

const onSubmit = async () => {
  if (!form.name_category || !form.name_category.trim()) {
    Alert.error('Validasi Gagal', 'Harap isi nama kategori terlebih dahulu.');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await categoryStore.updateCategory(props.categoryId, form);
      Alert.success('Update Berhasil', 'Data kategori telah berhasil diperbarui.');
    } else {
      await categoryStore.createCategory(form);
      Alert.success('Simpan Berhasil', 'Data kategori baru telah ditambahkan.');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit category error:', error);
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat memproses data ke server.';
    Alert.error('Gagal Simpan', errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

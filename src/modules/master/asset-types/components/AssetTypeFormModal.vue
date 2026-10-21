<template>
  <AppForm
    v-model="isOpen"
    :title="isEditMode ? 'Edit Tipe Aset' : 'Tambah Tipe Aset'"
    :is-modal="true"
    max-width="max-w-[560px]"
    :loading="isSubmitting"
    :submit-label="isEditMode ? 'Update Data' : 'Simpan Data'"
    @submit="onSubmit"
    @close="handleClose"
  >
    <!-- 1 FormSection dengan 1 Kolom per Baris -->
    <FormSection title="Informasi Tipe Aset" :cols="1">
      
      <!-- Nama Tipe Aset -->
      <FormField
        label="Nama Tipe Aset"
        v-model="form.name_type"
        label-width="160px"
        placeholder="Masukkan nama (mis. Elektronik, Kendaraan)..."
        :required="true"
      />

      <!-- Status Penggunaan -->
      <FormField
        label="Status Penggunaan"
        type="select"
        v-model="form.is_active"
        label-width="160px"
        :required="true"
        :options="[
          { label: 'Aktif (Dapat Digunakan)', value: true },
          { label: 'Tidak Aktif (Diarsipkan)', value: false }
        ]"
      />

    </FormSection>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';

// Store & Alerts
import { useAssetTypeStore } from '../assetType.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  assetTypeId: { type: [String, Number], default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const assetTypeStore = useAssetTypeStore();

// --- State ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEditMode = computed(() => !!props.assetTypeId);
const isSubmitting = ref(false);

const defaultFormData = () => ({
  name_type: '',
  is_active: true
});

const form = reactive(defaultFormData());

// Watch modal visibility & ID change
watch(
  () => [props.modelValue, props.assetTypeId],
  async ([open, id]) => {
    if (!open) return;
    await initData(id);
  },
  { immediate: true }
);

const initData = async (id) => {
  if (id) {
    try {
      const data = await assetTypeStore.fetchAssetTypeById(id);
      Object.assign(form, {
        name_type: data.name_type || '',
        is_active: typeof data.is_active === 'boolean' ? data.is_active : true
      });
    } catch (error) {
      console.error('Init asset type form failed:', error);
      const msg = error.response?.data?.message || 'Data tipe aset tidak ditemukan.';
      Alert.error('Gagal!', msg);
      handleClose();
    }
  } else {
    Object.assign(form, defaultFormData());
  }
};

const handleClose = () => {
  emit('update:modelValue', false);
};

const onSubmit = async () => {
  if (!form.name_type || !form.name_type.trim()) {
    Alert.error('Validasi Gagal', 'Harap isi nama tipe aset terlebih dahulu.');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await assetTypeStore.updateAssetType(props.assetTypeId, form);
      Alert.success('Update Berhasil', 'Data tipe aset telah berhasil diperbarui.');
    } else {
      await assetTypeStore.createAssetType(form);
      Alert.success('Simpan Berhasil', 'Data tipe aset baru telah ditambahkan.');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit asset type error:', error);
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat memproses data ke server.';
    Alert.error('Gagal Simpan', errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

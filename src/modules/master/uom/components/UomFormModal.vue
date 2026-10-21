<template>
  <AppForm
    v-model="isOpen"
    :title="isEditMode ? 'Edit Data Satuan' : 'Tambah Satuan Baru'"
    :is-modal="true"
    max-width="max-w-[560px]"
    :loading="isSubmitting"
    :submit-label="isEditMode ? 'Update Data' : 'Simpan Data'"
    @submit="onSubmit"
    @close="handleClose"
  >
    <!-- 1 FormSection dengan 1 Kolom per Baris -->
    <FormSection title="Informasi Satuan (UOM)" :cols="1">
      
      <!-- Kode Satuan -->
      <FormField
        label="Kode Satuan"
        v-model="form.code"
        label-width="160px"
        placeholder="misal: PCS, BOX, KG..."
        :required="true"
      />

      <!-- Nama Satuan -->
      <FormField
        label="Nama Satuan"
        v-model="form.name"
        label-width="160px"
        placeholder="misal: Piece / Buah..."
        :required="true"
      />

      <!-- Deskripsi -->
      <FormField
        label="Deskripsi"
        type="textarea"
        v-model="form.description"
        label-width="160px"
        placeholder="Jelaskan penggunaan atau keterangan satuan ini..."
      />

      <!-- Status Satuan -->
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
import { useUomStore } from '../uom.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  uomId: { type: [String, Number], default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const uomStore = useUomStore();

// --- State ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEditMode = computed(() => !!props.uomId);
const isSubmitting = ref(false);

const defaultFormData = () => ({
  code: '',
  name: '',
  description: '',
  is_active: true
});

const form = reactive(defaultFormData());

// Watch modal visibility & ID change
watch(
  () => [props.modelValue, props.uomId],
  async ([open, id]) => {
    if (!open) return;
    await initData(id);
  },
  { immediate: true }
);

const initData = async (id) => {
  if (id) {
    try {
      const data = await uomStore.fetchUomById(id);
      Object.assign(form, {
        code: data.code || '',
        name: data.name || '',
        description: data.description && data.description !== '-' ? data.description : '',
        is_active: typeof data.is_active === 'boolean' ? data.is_active : true
      });
    } catch (error) {
      console.error('Init uom form failed:', error);
      const msg = error.response?.data?.message || 'Data satuan tidak ditemukan.';
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
  if (!form.code || !form.code.trim()) {
    Alert.error('Validasi Gagal', 'Harap isi kode satuan terlebih dahulu.');
    return;
  }
  if (!form.name || !form.name.trim()) {
    Alert.error('Validasi Gagal', 'Harap isi nama satuan terlebih dahulu.');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await uomStore.updateUom(props.uomId, form);
      Alert.success('Update Berhasil', 'Data satuan telah berhasil diperbarui.');
    } else {
      await uomStore.createUom(form);
      Alert.success('Simpan Berhasil', 'Data satuan baru telah ditambahkan.');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit uom error:', error);
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat memproses data ke server.';
    Alert.error('Gagal Simpan', errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

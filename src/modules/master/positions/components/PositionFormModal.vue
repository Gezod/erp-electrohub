<template>
  <AppForm
    v-model="isOpen"
    :title="isEditMode ? 'Edit Data Jabatan' : 'Tambah Data Jabatan'"
    :is-modal="true"
    max-width="max-w-[560px]"
    :loading="isSubmitting"
    :submit-label="isEditMode ? 'Update Data' : 'Simpan Data'"
    @submit="onSubmit"
    @close="handleClose"
  >
    <!-- 1 FormSection dengan 1 Kolom per Baris -->
    <FormSection title="Informasi Jabatan" :cols="1">
      
      <!-- Kode Jabatan -->
      <FormField
        label="Kode Jabatan"
        v-model="form.code"
        label-width="160px"
        placeholder="Masukkan kode (mis. MGR1)..."
        :required="true"
      />

      <!-- Nama Jabatan -->
      <FormField
        label="Nama Jabatan"
        v-model="form.name"
        label-width="160px"
        placeholder="Masukkan nama (mis. Manager)..."
        :required="true"
      />

      <!-- Sort Order -->
      <FormField
        label="Urutan (Sort)"
        type="number"
        v-model.number="form.sortOrder"
        label-width="160px"
        placeholder="0"
      />

      <!-- Status Jabatan -->
      <FormField
        label="Status Jabatan"
        type="select"
        v-model="form.isActive"
        label-width="160px"
        :required="true"
        :options="[
          { label: 'Aktif', value: true },
          { label: 'Tidak Aktif', value: false }
        ]"
      />

    </FormSection>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';

// Store & Alerts
import { usePositionStore } from '../position.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  positionId: { type: [String, Number], default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const positionStore = usePositionStore();

// --- State ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEditMode = computed(() => !!props.positionId);
const isSubmitting = ref(false);

const defaultFormData = () => ({
  code: '',
  name: '',
  sortOrder: 0,
  isActive: true
});

const form = reactive(defaultFormData());

// Watch modal visibility & ID change
watch(
  () => [props.modelValue, props.positionId],
  async ([open, id]) => {
    if (!open) return;
    await initData(id);
  },
  { immediate: true }
);

const initData = async (id) => {
  if (id) {
    try {
      const data = await positionStore.fetchById(id);
      Object.assign(form, {
        code: data.code || '',
        name: data.name || '',
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : 0,
        isActive: typeof data.isActive === 'boolean' ? data.isActive : true
      });
    } catch (error) {
      console.error('Init position form failed:', error);
      const msg = error.response?.data?.message || 'Data jabatan tidak ditemukan.';
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
    Alert.error('Validasi Gagal', 'Harap isi kode jabatan terlebih dahulu.');
    return;
  }
  if (!form.name || !form.name.trim()) {
    Alert.error('Validasi Gagal', 'Harap isi nama jabatan terlebih dahulu.');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await positionStore.updatePosition(props.positionId, form);
      Alert.success('Update Berhasil', 'Data jabatan telah berhasil diperbarui.');
    } else {
      await positionStore.createPosition(form);
      Alert.success('Simpan Berhasil', 'Data jabatan baru telah ditambahkan.');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit position error:', error);
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat memproses data ke server.';
    Alert.error('Gagal Simpan', errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

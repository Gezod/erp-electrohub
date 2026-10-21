<template>
  <AppForm
    v-model="isOpen"
    :title="isEditMode ? 'Edit Data Lokasi' : 'Tambah Data Lokasi'"
    :is-modal="true"
    max-width="max-w-[620px]"
    :loading="isSubmitting"
    :submit-label="isEditMode ? 'Update Data' : 'Simpan Data'"
    @submit="onSubmit"
    @close="handleClose"
  >
    <!-- 1 FormSection dengan 1 Kolom per Baris -->
    <FormSection title="Informasi Lokasi" :cols="1">
      
      <!-- Nama Lokasi -->
      <FormField
        label="Nama Lokasi"
        v-model="form.location_name"
        label-width="160px"
        placeholder="Masukkan nama lokasi (mis. Jakarta Store 01)..."
        :required="true"
      />

      <!-- Parent Lokasi -->
      <FormField
        label="Lokasi Induk"
        label-width="160px"
        type="searchable-select"
        master="locations"
        v-model="form.parent_id"
        :initial-option="initialParentOption"
        :clearable="true"
        placeholder="Pilih Lokasi Induk (Opsional)"
        search-placeholder="Cari parent lokasi..."
      />

      <!-- Tipe Lokasi -->
      <FormField
        label="Tipe Lokasi"
        type="select"
        v-model="form.location_type"
        label-width="160px"
        :required="true"
        :options="[
          { label: 'Office / Kantor', value: 'office' },
          { label: 'Gudang / Warehouse', value: 'gudang' },
          { label: 'Toko / Outlet', value: 'store' }
        ]"
      />

      <!-- Distrik / Wilayah -->
      <FormField
        label="Distrik / Wilayah"
        v-model="form.location_district"
        label-width="160px"
        placeholder="Masukkan distrik (mis. Menteng)..."
        :required="true"
      />

      <!-- Link Google Maps -->
      <FormField
        label="Link Google Maps"
        v-model="form.maps_url"
        label-width="160px"
        placeholder="https://maps.google.com/..."
      />

      <!-- Status Lokasi -->
      <FormField
        label="Status Lokasi"
        type="select"
        v-model="form.is_active"
        label-width="160px"
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
import { useLocationStore } from '../location.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  locationId: { type: [String, Number], default: null },
  parentId: { type: [String, Number], default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const locationStore = useLocationStore();

// --- State ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEditMode = computed(() => !!props.locationId);
const isSubmitting = ref(false);

const defaultFormData = () => ({
  location_name: '',
  location_type: 'office',
  location_district: '',
  parent_id: null,
  parentName: '',
  maps_url: '',
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

// Watch when modal is opened / closed or locationId / parentId changed
watch(
  () => [props.modelValue, props.locationId, props.parentId],
  async ([open, id, pId]) => {
    if (!open) return;
    await initData(id, pId);
  },
  { immediate: true }
);

const initData = async (id, pId) => {
  try {
    // Populate form
    if (id) {
      const data = await locationStore.fetchLocationById(id);
      Object.assign(form, {
        location_name: data.location_name || '',
        location_type: data.location_type || 'office',
        location_district: data.location_district || '',
        parent_id: data.parent_id || null,
        parentName: data.parent?.location_name || '',
        maps_url: data.maps_url || '',
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
    console.error('Init location form failed:', error);
    if (id) {
      const msg = error.response?.data?.message || 'Data lokasi tidak ditemukan.';
      Alert.error('Gagal!', msg);
      handleClose();
    }
  }
};

const handleClose = () => {
  emit('update:modelValue', false);
};

const onSubmit = async () => {
  if (!form.location_name || !form.location_name.trim()) {
    Alert.error('Validasi Gagal', 'Harap isi nama lokasi terlebih dahulu.');
    return;
  }
  if (!form.location_district || !form.location_district.trim()) {
    Alert.error('Validasi Gagal', 'Harap isi distrik / wilayah lokasi.');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await locationStore.updateLocation(props.locationId, form);
      Alert.success('Update Berhasil', 'Data lokasi telah berhasil diperbarui.');
    } else {
      await locationStore.createLocation(form);
      Alert.success('Simpan Berhasil', 'Data lokasi baru telah ditambahkan.');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit location error:', error);
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat memproses data ke server.';
    Alert.error('Gagal Simpan', errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

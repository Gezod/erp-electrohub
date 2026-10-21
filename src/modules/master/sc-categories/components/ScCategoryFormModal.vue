<template>
  <AppForm
    v-model="isOpen"
    :title="isEditMode ? 'Edit Data Kategori SKU' : 'Tambah Data Kategori SKU'"
    :subtitle="isEditMode ? `Kode Kategori: ${form.code || '#' + categoryId}` : 'Formulir master klasifikasi kategori SKU (Supply Chain)'"
    :is-modal="true"
    max-width="max-w-[620px]"
    :loading="isSubmitting"
    :submit-label="isEditMode ? 'Update Data' : 'Simpan Data'"
    cancel-label="Batal"
    :disabled="!isFormValid"
    @submit="onSubmit"
    @close="handleClose"
  >
    <FormSection title="Informasi Kategori SKU" :cols="1">
      <!-- Kode Kategori -->
      <FormField label="Kode Kategori" label-width="160px" :required="true">
        <input
          v-model="form.code"
          type="text"
          maxlength="32"
          :disabled="isSubmitting"
          placeholder="mis. ALKOHOL, BOTOL, OIL, TUTUP"
          class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-bold uppercase text-text-active placeholder:text-text-placeholder focus:ring-0"
          required
          @blur="normalizeCode"
        />
      </FormField>

      <!-- Nama Kategori -->
      <FormField label="Nama Kategori" label-width="160px" :required="true">
        <input
          v-model="form.name"
          type="text"
          maxlength="100"
          :disabled="isSubmitting"
          placeholder="mis. Alkohol/Solvent, Botol Kemasan..."
          class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
          required
        />
      </FormField>

      <!-- Deskripsi -->
      <!-- <FormField
        label="Deskripsi"
        type="description"
        v-model="form.description"
        label-width="160px"
        placeholder="Keterangan singkat kategori (opsional)..."
        :rows="3"
        :disabled="isSubmitting"
      /> -->

      <!-- Status Aktivasi -->
      <FormField label="Status Kategori" label-width="160px" :required="true">
        <div class="relative w-full flex items-center">
          <select
            v-model="form.is_active"
            :disabled="isSubmitting"
            required
            class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer focus:ring-0"
          >
            <option :value="true" class="bg-white dark:bg-gray-900 text-text-active">
              Aktif
            </option>
            <option :value="false" class="bg-white dark:bg-gray-900 text-text-active">
              Nonaktif
            </option>
          </select>
          <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
        </div>
      </FormField>
    </FormSection>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import { ChevronDown } from 'lucide-vue-next';
import { useScCategoryStore } from '../scCategory.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  categoryId: { type: [String, Number], default: null }
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useScCategoryStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEditMode = computed(() => !!props.categoryId);
const isSubmitting = ref(false);

const defaultFormData = () => ({
  code: '',
  name: '',
  description: '',
  is_active: true
});

const form = reactive(defaultFormData());

const normalizeCode = () => {
  form.code = (form.code || '').trim().toUpperCase().replace(/\s+/g, '-');
};

const isFormValid = computed(() => {
  return !!form.code?.trim() && !!form.name?.trim();
});

const initData = async (id) => {
  try {
    if (id) {
      const data = await store.fetchCategoryById(id);
      if (data) {
        Object.assign(form, {
          code: data.code || '',
          name: data.name || '',
          description: data.description && data.description !== '-' ? data.description : '',
          is_active: typeof data.is_active === 'boolean' ? data.is_active : true
        });
      }
    } else {
      Object.assign(form, defaultFormData());
    }
  } catch (error) {
    console.error('Init category form error:', error);
    if (id) {
      Alert.error('Gagal', 'Data kategori SKU tidak ditemukan.');
      handleClose();
    }
  }
};

watch(
  () => [props.modelValue, props.categoryId],
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
  normalizeCode();

  if (!form.code) {
    Alert.error('Validasi Gagal', 'Kode Kategori wajib diisi.');
    return;
  }

  if (!form.name) {
    Alert.error('Validasi Gagal', 'Nama Kategori wajib diisi.');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await store.updateCategory(props.categoryId, form);
      Alert.toast('Data kategori SKU berhasil diperbarui', 'success');
    } else {
      await store.createCategory(form);
      Alert.toast('Kategori SKU baru berhasil ditambahkan', 'success');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit category error:', error);
    const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data kategori.';
    Alert.error('Gagal!', msg);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

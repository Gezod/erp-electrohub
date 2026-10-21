<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Ubah Data Aset Marketing' : 'Registrasi Aset Marketing Baru'"
    :subtitle="isEdit ? (form.goodName ? `${form.goodName} (${form.codeAsset || '-'})` : 'Perbarui data aset marketing') : 'Formulir registrasi aset operasional marketing'"
    :is-modal="true"
    max-width="max-w-[640px]"
    :loading="isSubmitting"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Daftarkan Aset'"
    cancel-label="Batal"
    :disabled="!isFormValid"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Section 1: Informasi Barang & Penempatan -->
      <FormSection title="Informasi Barang & Penempatan" :cols="1">
        <!-- Barang Marketing (Hanya tipe permanent yang bisa jadi aset) -->
        <FormField
          v-if="!isEdit"
          label="Barang Marketing"
          label-width="160px"
          type="searchable-select"
          master="marketing-goods"
          :filters="{ tipe_barang: 'permanent' }"
          v-model="form.goodId"
          :disabled="isSubmitting"
          placeholder="Pilih barang permanent..."
          search-placeholder="Cari nama atau kode barang..."
          :clearable="true"
          :required="true"
        />
        <FormField v-else label="Barang Marketing" label-width="160px">
          <div class="flex flex-col py-1 min-w-0">
            <span class="text-sm font-semibold text-text-active break-words leading-tight">{{ form.goodName || '-' }}</span>
            <span class="text-xs text-text-muted font-mono uppercase">{{ form.goodCode || '-' }}</span>
          </div>
        </FormField>

        <!-- Lokasi Penempatan -->
        <FormField
          label="Lokasi Penempatan"
          label-width="160px"
          type="searchable-select"
          master="locations"
          v-model="form.locationId"
          :disabled="isSubmitting"
          :required="true"
          placeholder="Pilih lokasi simpan..."
          search-placeholder="Cari lokasi..."
          :clearable="true"
        />

        <!-- Tipe Aset -->
        <FormField
          label="Tipe Aset"
          label-width="160px"
          type="searchable-select"
          master="asset-types"
          v-model="form.assetTypeId"
          :disabled="isSubmitting"
          placeholder="Auto (ikut tipe default barang)"
          search-placeholder="Cari tipe aset..."
          :clearable="true"
        />

        <!-- PIC Pemilik / Pengguna -->
        <FormField
          label="PIC / Pengguna"
          label-width="160px"
          type="searchable-select"
          master="employees"
          v-model="form.picId"
          :disabled="isSubmitting"
          placeholder="Pilih PIC (Kosongkan untuk Umum)..."
          search-placeholder="Cari nama karyawan..."
          :clearable="true"
        />
      </FormSection>

      <!-- Section 2: Identitas & Nilai Aset -->
      <FormSection title="Identitas & Nilai Aset" :cols="1">
        <!-- Kode Aset -->
        <FormField label="Kode Aset" label-width="160px">
          <input
            v-model="form.codeAsset"
            type="text"
            :disabled="isSubmitting"
            placeholder="Kosongkan untuk auto-generate"
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-bold uppercase text-text-active placeholder:text-text-placeholder placeholder:normal-case focus:ring-0"
          />
        </FormField>

        <!-- Nilai Perolehan -->
        <FormField label="Nilai Perolehan (IDR)" label-width="160px">
          <div class="flex items-center gap-2 w-full">
            <span class="text-xs font-mono font-bold text-text-muted select-none">Rp</span>
            <input
              v-model="displayAcquisitionCost"
              :disabled="isSubmitting"
              type="text"
              placeholder="0"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
          </div>
        </FormField>

        <!-- Tanggal Perolehan -->
        <FormField label="Tanggal Perolehan" label-width="160px">
          <DatePicker v-model="form.dateAcquired" placeholder="Pilih tanggal perolehan" />
        </FormField>

        <!-- Tanggal Penyerahan -->
        <FormField label="Tanggal Penyerahan" label-width="160px">
          <DatePicker v-model="form.handoverDate" placeholder="Pilih tanggal penyerahan (opsional)" />
        </FormField>

        <!-- Kondisi -->
        <FormField label="Kondisi Aset" label-width="160px">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.condition"
              :disabled="isSubmitting"
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active appearance-none cursor-pointer focus:ring-0"
            >
              <option value="baik" class="bg-white dark:bg-gray-900 text-text-active">Baik</option>
              <option value="rusak" class="bg-white dark:bg-gray-900 text-text-active">Rusak</option>
              <option value="hilang" class="bg-white dark:bg-gray-900 text-text-active">Hilang</option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>

        <!-- Status Aset -->
        <FormField label="Status Aset" label-width="160px">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.isActive"
              :disabled="isSubmitting"
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active appearance-none cursor-pointer focus:ring-0"
            >
              <option :value="true" class="bg-white dark:bg-gray-900 text-text-active">Aktif</option>
              <option :value="false" class="bg-white dark:bg-gray-900 text-text-active">Tidak Aktif</option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>

        <!-- Keterangan -->
        <FormField label="Keterangan" label-width="160px">
          <textarea
            v-model="form.description"
            rows="2"
            :disabled="isSubmitting"
            placeholder="Keterangan singkat tentang aset ini..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0 resize-none"
          ></textarea>
        </FormField>
      </FormSection>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import { ChevronDown } from 'lucide-vue-next';
import { useMarketingAssetStore } from '../marketingAsset.store';
import { Alert } from '@/plugins/sweetalert';
import { formatThousand, parseThousand } from '@/utils/format';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  assetId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useMarketingAssetStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.assetId);
const isSubmitting = ref(false);

const defaultFormData = () => ({
  goodId: '',
  goodName: '',
  goodCode: '',
  locationId: '',
  assetTypeId: '',
  picId: '',
  codeAsset: '',
  acquisitionCost: 0,
  dateAcquired: new Date().toISOString().split('T')[0],
  handoverDate: '',
  condition: 'baik',
  description: '',
  isActive: true,
});

const form = reactive(defaultFormData());

const displayAcquisitionCost = computed({
  get: () => formatThousand(form.acquisitionCost),
  set: (val) => {
    form.acquisitionCost = parseThousand(val);
  },
});

const isFormValid = computed(() => {
  if (!isEdit.value && !form.goodId) return false;
  if (!form.locationId) return false;
  return true;
});

const initData = async (id) => {
  isSubmitting.value = true;
  try {

    if (id) {
      const detail = await store.fetchDetail(id);
      if (detail) {
        Object.assign(form, {
          goodId: detail.goodId || '',
          goodName: detail.goodName || '',
          goodCode: detail.goodCode || '',
          locationId: detail.locationId || '',
          assetTypeId: detail.assetTypeId || '',
          picId: detail.picId || '',
          codeAsset: detail.codeAsset || '',
          acquisitionCost: detail.acquisitionCost || 0,
          dateAcquired: detail.dateAcquired || '',
          handoverDate: detail.handoverDate || '',
          condition: detail.condition || 'baik',
          description: detail.description || '',
          isActive: detail.isActive ?? true,
        });
      }
    } else {
      Object.assign(form, defaultFormData());
    }
  } catch (error) {
    console.error('MarketingAssetFormModal: Failed to init', error);
    if (id) {
      Alert.error('Gagal', 'Data aset marketing tidak ditemukan.');
      handleClose();
    }
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => [props.modelValue, props.assetId],
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

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await store.updateAsset(props.assetId, { ...form });
      Alert.toast('Data aset marketing berhasil diperbarui', 'success');
    } else {
      await store.createAsset({ ...form });
      Alert.toast('Aset marketing baru berhasil didaftarkan', 'success');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('MarketingAssetFormModal: Submit error', error);
    const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
    Alert.error('Gagal Menyimpan', msg);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

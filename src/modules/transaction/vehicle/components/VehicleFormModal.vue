<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Edit Data Kendaraan' : 'Tambah Kendaraan Baru'"
    :subtitle="isEdit ? `Plat Nomor: ${form.plateNumber || '#' + vehicleId}` : 'Formulir registrasi dan konfigurasi pemeliharaan armada'"
    :is-modal="true"
    max-width="max-w-2xl"
    :loading="isSubmitting"
    :show-draft="!isEdit || isDraftStatus"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Daftarkan Kendaraan'"
    cancel-label="Batal"
    draft-label="Simpan Draft"
    :disabled="!isFormComplete"
    @draft="handleSave('draft')"
    @submit="handleSave('submit')"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Section 1: Informasi Registrasi & Kendaraan -->
      <FormSection title="Informasi Registrasi & Kendaraan" :cols="1">
        <!-- Plat Nomor -->
        <FormField label="Plat Nomor" label-width="160px" :required="true">
          <input
            v-model="form.plateNumber"
            type="text"
            :disabled="isSubmitting"
            placeholder="Contoh: L 1234 AB"
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-bold uppercase text-text-active placeholder:text-text-placeholder focus:ring-0"
            required
          />
        </FormField>

        <!-- Jenis Kendaraan -->
        <FormField label="Jenis Kendaraan" label-width="160px" :required="true">
          <input
            v-model="form.vehicleType"
            type="text"
            :disabled="isSubmitting"
            placeholder="Contoh: Toyota Avanza, Honda Vario, Truk Hino..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            required
          />
        </FormField>

        <!-- Nama di STNK -->
        <FormField label="Nama di STNK" label-width="160px" :required="true">
          <input
            v-model="form.nameStnk"
            type="text"
            :disabled="isSubmitting"
            placeholder="Masukkan nama pemilik atau instansi sesuai STNK"
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            required
          />
        </FormField>

        <!-- Status Operasional -->
        <FormField label="Status Operasional" label-width="160px" :required="true">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.isActive"
              :disabled="isSubmitting"
              required
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer focus:ring-0"
            >
              <option :value="true" class="bg-white dark:bg-gray-900 text-text-active">AKTIF (Dapat Digunakan)</option>
              <option :value="false" class="bg-white dark:bg-gray-900 text-text-active">NON-AKTIF (Rusak / Dijual / Perbaikan)</option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>
      </FormSection>

      <!-- Section 2: Legalitas & Jadwal Pemeliharaan -->
      <FormSection title="Legalitas & Jadwal Pemeliharaan" :cols="1">
        <!-- Masa Berlaku STNK -->
        <FormField label="Masa Berlaku STNK" label-width="160px" :required="true">
          <DatePicker
            v-model="form.dateStnk"
            :disabled="isSubmitting"
            placeholder="Pilih tanggal jatuh tempo STNK..."
            class="w-full"
          />
        </FormField>

        <!-- Tanggal Ganti Plat (5 THN) -->
        <FormField label="Ganti Plat (5 Thn)" label-width="160px">
          <DatePicker
            v-model="form.dateChangePlate"
            :disabled="isSubmitting"
            placeholder="Pilih tanggal ganti plat 5 tahunan (opsional)..."
            class="w-full"
          />
        </FormField>

        <!-- Servis Terdekat & Interval Servis Rutin -->
        <FormField label="Jadwal Servis" label-width="160px" :required="true">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <DatePicker
              v-model="form.dateService"
              :disabled="isSubmitting"
              placeholder="Pilih tanggal servis terdekat..."
              class="flex-1"
            />
            <div class="hidden sm:block w-px h-5 bg-border shrink-0"></div>
            <div class="flex items-center justify-end gap-1.5 shrink-0 bg-bg-2 dark:bg-gray-800/50 px-2.5 py-1 rounded-md border border-border sm:border-0 sm:p-0 sm:bg-transparent">
              <span class="text-xs text-text-muted font-medium shrink-0">Interval:</span>
              <input
                v-model.number="form.intervalService"
                type="number"
                min="0"
                :disabled="isSubmitting"
                placeholder="6"
                class="w-12 bg-transparent border-0 p-0 text-right outline-none text-sm font-bold text-text-active placeholder:text-text-placeholder focus:ring-0"
              />
              <span class="text-xs text-text-muted font-medium">Bulan</span>
            </div>
          </div>
        </FormField>

        <!-- Konfigurasi Pengingat (H- Hari) -->
        <FormField label="Pengingat (H-)" label-width="160px">
          <div class="flex flex-col gap-1 w-full">
            <input
              v-model="form.alertDaysBefore"
              type="text"
              :disabled="isSubmitting"
              placeholder="Contoh: 30, 7, 1"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
            <p class="text-[11px] text-text-muted italic leading-tight">
              * Titik notifikasi sebelum jatuh tempo STNK atau servis (pisahkan dengan koma).
            </p>
          </div>
        </FormField>
      </FormSection>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import AppForm from '@/components/forms/AppForm.vue';
import FormSection from '@/components/forms/FormSection.vue';
import FormField from '@/components/forms/FormField.vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import { ChevronDown } from 'lucide-vue-next';
import { useVehicleStore } from '../vehicle.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  vehicleId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const vehicleStore = useVehicleStore();

// --- Computed States ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEdit = computed(() => !!props.vehicleId);
const isSubmitting = ref(false);
const detailData = ref(null);

const isDraftStatus = computed(() => {
  return detailData.value?.isDraft === true;
});

// --- Form State ---
const form = reactive({
  plateNumber: '',
  vehicleType: '',
  nameStnk: '',
  isActive: true,
  isDraft: false,
  dateStnk: '',
  dateChangePlate: '',
  dateService: '',
  intervalService: 6,
  alertDaysBefore: '30, 7, 1'
});

const isFormComplete = computed(() => {
  return !!(
    form.plateNumber?.trim() &&
    form.vehicleType?.trim() &&
    form.nameStnk?.trim() &&
    form.dateStnk &&
    form.dateService
  );
});

// --- Reset & Populate Form ---
const resetForm = () => {
  detailData.value = null;
  Object.assign(form, {
    plateNumber: '',
    vehicleType: '',
    nameStnk: '',
    isActive: true,
    isDraft: false,
    dateStnk: '',
    dateChangePlate: '',
    dateService: '',
    intervalService: 6,
    alertDaysBefore: '30, 7, 1'
  });
};

const loadDetail = async (id) => {
  isSubmitting.value = true;
  try {
    const detail = await vehicleStore.fetchDetail(id);
    if (detail) {
      detailData.value = detail;
      Object.assign(form, {
        plateNumber: detail.plateNumber || '',
        vehicleType: detail.vehicleType || '',
        nameStnk: detail.nameStnk || '',
        isActive: detail.isActive ?? true,
        isDraft: detail.isDraft ?? false,
        dateStnk: detail.dateStnk || '',
        dateChangePlate: detail.dateChangePlate || '',
        dateService: detail.dateService || '',
        intervalService: Number(detail.intervalService) || 6,
        alertDaysBefore: Array.isArray(detail.alertDaysBefore)
          ? detail.alertDaysBefore.join(', ')
          : (detail.alertDaysBefore ? String(detail.alertDaysBefore) : '30, 7, 1')
      });
    }
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Data kendaraan tidak ditemukan');
    handleClose();
  } finally {
    isSubmitting.value = false;
  }
};

// --- Watchers ---
watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal) {
      if (props.vehicleId) {
        await loadDetail(props.vehicleId);
      } else {
        resetForm();
      }
    }
  },
  { immediate: true }
);

// --- Handlers ---
const handleClose = () => {
  isOpen.value = false;
  emit('close');
};

const handleSave = async (actionType) => {
  if (actionType === 'draft') {
    form.isDraft = true;
  } else {
    form.isDraft = false;
  }

  if (!isFormComplete.value) {
    Alert.toast('Mohon lengkapi seluruh field wajib formulir', 'warning');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await vehicleStore.updateVehicle(props.vehicleId, form);
      Alert.toast(
        actionType === 'draft' ? 'Draft kendaraan berhasil diperbarui' : 'Data kendaraan berhasil diperbarui',
        'success'
      );
    } else {
      await vehicleStore.createVehicle(form);
      Alert.toast(
        actionType === 'draft' ? 'Draft kendaraan berhasil disimpan' : 'Kendaraan baru berhasil didaftarkan',
        'success'
      );
    }

    emit('saved');
    handleClose();
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Terjadi kesalahan saat memproses data.';
    Alert.error('Gagal Menyimpan', errorMsg);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Edit Data Lisensi' : 'Tambah Lisensi Baru'"
    :subtitle="isEdit ? `No. Lisensi: ${form.numberLicense || '#' + licenseId}` : 'Formulir registrasi dan konfigurasi perpanjangan lisensi'"
    :is-modal="true"
    max-width="max-w-2xl"
    :loading="isSubmitting"
    :show-draft="!isEdit || isDraftStatus"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Daftarkan Lisensi'"
    cancel-label="Batal"
    draft-label="Simpan Draft"
    :disabled="!isFormComplete"
    @draft="handleSave('draft')"
    @submit="handleSave('submit')"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Section 1: Detail Aplikasi & Lisensi -->
      <FormSection title="Detail Aplikasi & Lisensi" :cols="1">
        <!-- Nama Aplikasi -->
        <FormField label="Nama Aplikasi" label-width="160px" :required="true">
          <input
            v-model="form.appName"
            type="text"
            :disabled="isSubmitting"
            placeholder="Contoh: SAP, Oracle, Zoho, Adobe..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            required
          />
        </FormField>

        <!-- Nomor Lisensi -->
        <FormField label="Nomor Lisensi" label-width="160px" :required="true">
          <input
            v-model="form.numberLicense"
            type="text"
            :disabled="isSubmitting"
            placeholder="Masukkan Serial Number / License Key"
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            required
          />
        </FormField>

        <!-- Lokasi -->
        <FormField
          label="Lokasi"
          label-width="160px"
          type="searchable-select"
          master="locations"
          v-model="form.locationId"
          :disabled="isSubmitting"
          placeholder="Pilih lokasi lisensi..."
          search-placeholder="Cari lokasi..."
          :clearable="true"
          :required="true"
        />

        <!-- Status Pembayaran -->
        <FormField label="Status Pembayaran" label-width="160px" :required="true">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.statusPayment"
              :disabled="isSubmitting"
              required
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer focus:ring-0"
            >
              <option value="paid" class="bg-white dark:bg-gray-900 text-text-active">LUNAS (Paid)</option>
              <option value="unpaid" class="bg-white dark:bg-gray-900 text-text-active">BELUM LUNAS (Unpaid)</option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>

        <!-- Tanggal Aktif -->
        <FormField label="Tanggal Aktif" label-width="160px">
          <DatePicker
            v-model="form.dateActive"
            :disabled="isSubmitting"
            placeholder="Pilih tanggal mulai aktif (opsional)..."
            class="w-full"
          />
        </FormField>

        <!-- Tanggal Kedaluwarsa -->
        <FormField label="Tanggal Expired" label-width="160px" :required="true">
          <DatePicker
            v-model="form.dateExpired"
            :disabled="isSubmitting"
            placeholder="Pilih tanggal jatuh tempo / kedaluwarsa..."
            class="w-full"
          />
        </FormField>

        <!-- Harga Per Periode -->
        <FormField label="Biaya Lisensi" label-width="160px">
          <div class="flex items-center gap-2 w-full">
            <span class="text-xs font-semibold text-text-muted select-none">Rp</span>
            <input
              type="text"
              :value="formatCurrencyInput(form.pricePeriode)"
              @input="handlePriceInput"
              :disabled="isSubmitting"
              placeholder="0"
              class="w-full bg-transparent border-0 p-0 text-left outline-none text-sm font-bold text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
          </div>
        </FormField>

        <!-- Status Lisensi -->
        <FormField label="Status Lisensi" label-width="160px" :required="true">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.isActive"
              :disabled="isSubmitting"
              required
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer focus:ring-0"
            >
              <option :value="true" class="bg-white dark:bg-gray-900 text-text-active">AKTIF (In Use)</option>
              <option :value="false" class="bg-white dark:bg-gray-900 text-text-active">NON-AKTIF (Expired / Archived)</option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>
      </FormSection>

      <!-- Section 2: Pengaturan Perulangan & Pengingat -->
      <FormSection title="Pengaturan Perulangan & Pengingat" :cols="1">
        <!-- Langganan Berulang -->
        <FormField label="Langganan Berulang" label-width="160px">
          <label class="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              v-model="form.isRecurring"
              type="checkbox"
              :disabled="isSubmitting"
              class="w-4 h-4 rounded border-border text-brand-500 focus:ring-brand-500/20 cursor-pointer"
            />
            <span class="text-xs text-text-muted font-medium">Aktifkan perpanjangan otomatis per periode</span>
          </label>
        </FormField>

        <!-- Interval Perulangan (Conditional) -->
        <FormField v-if="form.isRecurring" label="Interval Perulangan" label-width="160px">
          <div class="flex items-center gap-1.5 w-full">
            <input
              v-model.number="form.intervalReminder"
              type="number"
              min="1"
              :disabled="isSubmitting"
              placeholder="30"
              class="w-20 bg-transparent border-0 p-0 text-left outline-none text-sm font-bold text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
            <span class="text-xs text-text-muted font-medium">Hari</span>
          </div>
        </FormField>

        <!-- Titik Pengingat (H- Hari) -->
        <FormField label="Pengingat (H-)" label-width="160px">
          <div class="flex flex-col gap-1 w-full">
            <input
              v-model="form.alertDaysBefore"
              type="text"
              :disabled="isSubmitting"
              placeholder="Contoh: 7, 3, 1"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
            <p class="text-[11px] text-text-muted italic leading-tight">
              * Titik notifikasi sebelum jatuh tempo expired (pisahkan dengan koma).
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
import { useLicenseStore } from '../license.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  licenseId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const licenseStore = useLicenseStore();

// --- Computed States ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEdit = computed(() => !!props.licenseId);
const isSubmitting = ref(false);
const detailData = ref(null);

const isDraftStatus = computed(() => {
  return detailData.value?.isDraft === true;
});


// --- Form State ---
const form = reactive({
  appName: '',
  numberLicense: '',
  locationId: '',
  dateActive: '',
  dateExpired: '',
  pricePeriode: 0,
  statusPayment: 'unpaid',
  isActive: true,
  isRecurring: false,
  isDraft: false,
  intervalReminder: 30,
  alertDaysBefore: '7, 3, 1'
});

const isFormComplete = computed(() => {
  return !!(
    form.appName?.trim() &&
    form.numberLicense?.trim() &&
    form.locationId &&
    form.dateExpired
  );
});

// --- Formatting Helpers ---
const formatCurrencyInput = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const num = Number(val);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

const handlePriceInput = (e) => {
  const rawDigits = e.target.value.replace(/\D/g, '');
  form.pricePeriode = rawDigits ? parseInt(rawDigits, 10) : 0;
};

// --- Reset & Populate Form ---
const resetForm = () => {
  detailData.value = null;
  Object.assign(form, {
    appName: '',
    numberLicense: '',
    locationId: '',
    dateActive: '',
    dateExpired: '',
    pricePeriode: 0,
    statusPayment: 'unpaid',
    isActive: true,
    isRecurring: false,
    isDraft: false,
    intervalReminder: 30,
    alertDaysBefore: '7, 3, 1'
  });
};

const loadDetail = async (id) => {
  isSubmitting.value = true;
  try {
    const detail = await licenseStore.fetchDetail(id);
    if (detail) {
      detailData.value = detail;
      Object.assign(form, {
        appName: detail.appName || '',
        numberLicense: detail.numberLicense || '',
        locationId: detail.locationId || '',
        dateActive: detail.dateActive || '',
        dateExpired: detail.dateExpired || '',
        pricePeriode: Number(detail.pricePeriode) || 0,
        statusPayment: detail.statusPayment || 'unpaid',
        isActive: detail.isActive ?? true,
        isDraft: detail.isDraft ?? false,
        isRecurring: detail.isRecurring ?? false,
        intervalReminder: Number(detail.intervalReminder) || 30,
        alertDaysBefore: Array.isArray(detail.alertDaysBefore)
          ? detail.alertDaysBefore.join(', ')
          : (detail.alertDaysBefore ? String(detail.alertDaysBefore) : '7, 3, 1')
      });
    }
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Data lisensi tidak ditemukan');
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
      if (props.licenseId) {
        await loadDetail(props.licenseId);
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
    Alert.toast('Mohon lengkapi field wajib formulir (Nama Aplikasi, No. Lisensi, Lokasi, Tgl Expired)', 'warning');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await licenseStore.updateLicense(props.licenseId, form);
      Alert.toast(
        actionType === 'draft' ? 'Draft lisensi berhasil diperbarui' : 'Data lisensi berhasil diperbarui',
        'success'
      );
    } else {
      await licenseStore.createLicense(form);
      Alert.toast(
        actionType === 'draft' ? 'Draft lisensi berhasil disimpan' : 'Lisensi baru berhasil didaftarkan',
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

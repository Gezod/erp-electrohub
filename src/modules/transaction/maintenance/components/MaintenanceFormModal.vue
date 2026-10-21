<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Edit Pengajuan Maintenance' : 'Tambah Pengajuan Maintenance'"
    :subtitle="isEdit ? `Kode: ${detailData?.kode_maintenance || '-'}` : 'Formulir pengajuan pemeliharaan dan perbaikan aset atau fasilitas'"
    :is-modal="true"
    max-width="max-w-2xl"
    :loading="isSubmitting"
    :show-draft="!isEdit || isDraftStatus"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Kirim Pengajuan'"
    cancel-label="Batal"
    draft-label="Simpan Draft"
    :disabled="!isFormComplete"
    @draft="handleSave('draft')"
    @submit="handleSave('open')"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <FormSection title="Informasi Kejadian & Laporan" :cols="2">
        <!-- Tanggal Kejadian -->
        <FormField label="Tanggal Kejadian" :required="true" :col-span="2">
          <DatePicker
            v-model="form.dateMaintenance"
            :disabled="isSubmitting"
            placeholder="Pilih tanggal kejadian"
          />
        </FormField>

        <!-- Lokasi -->
        <FormField
          label="Lokasi"
          label-width="160px"
          type="searchable-select"
          master="locations"
          v-model="form.locationId"
          :required="true"
          :col-span="2"
          :clearable="true"
          :disabled="isSubmitting"
          placeholder="Pilih lokasi..."
          search-placeholder="Cari lokasi..."
        />

        <!-- PIC GA -->
        <FormField v-if="!isProxyAllowed" label="PIC GA" label-width="160px" :required="true" :col-span="2">
          <input
            :value="authStore.user?.displayName || authStore.user?.fullName || '-'"
            disabled
            class="w-full bg-transparent border-0 p-0 outline-none text-text-muted text-sm cursor-not-allowed"
          />
        </FormField>
        <FormField
          v-else
          label="PIC GA"
          label-width="160px"
          type="searchable-select"
          master="employees"
          v-model="form.picGaId"
          :initial-option="initialPicOption"
          :disabled="isSubmitting"
          placeholder="Pilih PIC GA..."
          search-placeholder="Cari PIC GA..."
          :clearable="true"
          :required="true"
          :col-span="2"
        />

        <!-- Item Kejadian -->
        <FormField label="Item Kejadian" :required="true" :col-span="2">
          <input
            v-model="form.eventItem"
            type="text"
            :disabled="isSubmitting"
            placeholder="Masukkan item kejadian misal: AC Mati, Lampu rusak, Pompa bocor"
            class="w-full bg-transparent border-0 p-0 outline-none text-text-active text-sm font-medium focus:ring-0"
            required
          />
        </FormField>

        <!-- Deskripsi Masalah -->
        <FormField label="Deskripsi Masalah" :required="true" :col-span="2">
          <textarea
            v-model="form.descriptionMaintenance"
            :disabled="isSubmitting"
            rows="3"
            placeholder="Masukkan detail masalah atau permintaan maintenance..."
            class="w-full bg-transparent border-0 p-0 outline-none text-text-active text-sm resize-none focus:ring-0"
            required
          ></textarea>
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
import { useMaintenanceStore } from '../maintenance.store';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  maintenanceId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const maintenanceStore = useMaintenanceStore();
const authStore = useAuthStore();

// --- Computed States ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEdit = computed(() => !!props.maintenanceId);
const isSubmitting = ref(false);
const detailData = ref(null);

const isProxyAllowed = computed(() => {
  return authStore.user?.isAdmin === true || authStore.user?.is_superadmin === true || authStore.user?.isSuperadmin === true;
});

const isDraftStatus = computed(() => {
  return detailData.value?.status?.toLowerCase() === 'draft';
});

// --- Initial Option untuk Dropdown PIC GA (Edit Mode) ---
const initialPicOption = computed(() => {
  if (!form.picGaId) return null;
  if (detailData.value?.pic_ga) {
    const p = detailData.value.pic_ga;
    const name = p.full_name || p.fullName || '';
    const sub = [p.position?.name, p.employee_number].filter(Boolean).join(' • ');
    return {
      value: form.picGaId,
      label: sub ? `${name} (${sub})` : name,
    };
  }
  return null;
});

// --- Form State ---
const form = reactive({
  dateMaintenance: new Date().toISOString().split('T')[0],
  locationId: '',
  picGaId: '',
  eventItem: '',
  descriptionMaintenance: ''
});

const isFormComplete = computed(() => {
  return !!(
    form.dateMaintenance &&
    form.locationId &&
    form.picGaId &&
    form.eventItem?.trim() &&
    form.descriptionMaintenance?.trim()
  );
});

// --- Reset & Populate Form ---
const resetForm = () => {
  detailData.value = null;
  form.dateMaintenance = new Date().toISOString().split('T')[0];
  form.locationId = '';
  form.eventItem = '';
  form.descriptionMaintenance = '';

  if (!isProxyAllowed.value) {
    form.picGaId = authStore.user?.employeeId || authStore.user?.id || '';
  } else {
    form.picGaId = '';
  }
};

const loadDetail = async (id) => {
  isSubmitting.value = true;
  try {
    const data = await maintenanceStore.fetchDetail(id);
    if (data) {
      detailData.value = data;
      form.dateMaintenance = data.date_maintenance ? data.date_maintenance.split('T')[0] : '';
      form.locationId = data.location_id || '';
      form.eventItem = data.event_item || '';
      form.picGaId = data.pic_ga_id || '';
      form.descriptionMaintenance = data.description || '';
    }
  } catch (err) {
    Alert.error('Gagal', 'Gagal memuat data detail maintenance');
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
      if (props.maintenanceId) {
        await loadDetail(props.maintenanceId);
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

const handleSave = async (statusTarget) => {
  if (!isFormComplete.value) {
    Alert.toast('Mohon lengkapi seluruh field wajib formulir', 'warning');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      dateMaintenance: form.dateMaintenance,
      locationId: form.locationId,
      picGaId: form.picGaId,
      eventItem: form.eventItem.trim(),
      descriptionMaintenance: form.descriptionMaintenance.trim(),
      status: isEdit.value ? (isDraftStatus.value ? statusTarget : detailData.value?.status) : statusTarget
    };

    if (isEdit.value) {
      await maintenanceStore.updateHeader(props.maintenanceId, payload);
      Alert.toast(
        statusTarget === 'draft' ? 'Draft maintenance berhasil diperbarui' : 'Pengajuan maintenance berhasil diperbarui',
        'success'
      );
    } else {
      await maintenanceStore.createTicket(payload);
      Alert.toast(
        statusTarget === 'draft' ? 'Draft maintenance berhasil disimpan' : 'Pengajuan maintenance berhasil dikirim',
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

<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Edit Konfigurasi Jadwal' : 'Tambah Jadwal Baru'"
    :subtitle="isEdit ? `ID Jadwal: #${scheduleId}` : 'Formulir penjadwalan pemeliharaan dan agenda operasional'"
    :is-modal="true"
    max-width="max-w-2xl"
    :loading="isSubmitting"
    :show-draft="!isEdit || isDraftStatus"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Buat Jadwal'"
    cancel-label="Batal"
    draft-label="Simpan Draft"
    :disabled="!isFormComplete"
    @draft="handleSave('draft')"
    @submit="handleSave('submit')"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Section 1: Informasi Kejadian & Laporan -->
      <FormSection title="Informasi Kejadian & Laporan" :cols="2">
        <!-- Tanggal & Waktu Mulai -->
        <FormField label="Waktu Mulai" :required="true" :col-span="2">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
            <DatePicker
              v-model="form.dateSchedule"
              :disabled="isSubmitting"
              placeholder="Tanggal Mulai"
              class="flex-1"
            />
            <TimePicker
              v-model="form.timeSchedule"
              :disabled="isSubmitting"
              placeholder="Jam Mulai"
              class="w-full sm:w-auto shrink-0"
            />
          </div>
        </FormField>

        <!-- Tanggal & Waktu Selesai (Opsional) -->
        <FormField label="Waktu Selesai" :col-span="2">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
            <DatePicker
              v-model="form.endDateSchedule"
              :disabled="isSubmitting"
              placeholder="Tanggal Selesai (Opsional)"
              class="flex-1"
            />
            <TimePicker
              v-model="form.endTimeSchedule"
              :disabled="isSubmitting"
              placeholder="Jam Selesai (Opsional)"
              class="w-full sm:w-auto shrink-0"
            />
          </div>
        </FormField>

        <!-- Perihal -->
        <FormField label="Perihal" :required="true" :col-span="2">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.perihal"
              :disabled="isSubmitting"
              required
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer focus:ring-0"
            >
              <option value="driver" class="bg-white dark:bg-gray-900 text-text-active">Driver (Dalam Kota)</option>
              <option value="driver_luar_kota" class="bg-white dark:bg-gray-900 text-text-active">Driver Luar Kota</option>
              <option value="driver_sog" class="bg-white dark:bg-gray-900 text-text-active">Driver SOG</option>
              <option value="cctv_installation" class="bg-white dark:bg-gray-900 text-text-active">Maintenance CCTV</option>
              <option value="set_cctv" class="bg-white dark:bg-gray-900 text-text-active">Pemasangan CCTV</option>
              <option value="other" class="bg-white dark:bg-gray-900 text-text-active">Lainnya (Other)</option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>

        <!-- Isi Keperluan (Tampil jika Perihal = Lainnya) -->
        <FormField
          v-if="form.perihal === 'other'"
          label="Isi Keperluan"
          :required="true"
          :col-span="2"
        >
          <input
            v-model="form.otherPerihalDetail"
            type="text"
            :disabled="isSubmitting"
            placeholder="Tuliskan perihal atau keperluan spesifik..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
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
          placeholder="Pilih lokasi..."
          search-placeholder="Cari lokasi..."
          :clearable="true"
          :required="true"
          :col-span="2"
        />

        <!-- Kaitan Maintenance (Tiket) -->
        <FormField
          label="Kaitan Maintenance"
          label-width="160px"
          type="searchable-select"
          :load-options="searchMaintenances"
          v-model="form.maintenanceId"
          :disabled="isSubmitting"
          placeholder="Pilih tiket maintenance (opsional)..."
          search-placeholder="Cari tiket..."
          :clearable="true"
          :col-span="2"
        />

        <!-- Status -->
        <FormField label="Status" :required="true" :col-span="2">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.status"
              :disabled="isSubmitting"
              required
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer focus:ring-0"
            >
              <option value="draft" class="bg-white dark:bg-gray-900 text-text-active">Draft (Simpan sebagai Draft)</option>
              <option value="scheduled" class="bg-white dark:bg-gray-900 text-text-active">Scheduled (Terjadwal)</option>
              <option value="need_reminder" class="bg-white dark:bg-gray-900 text-text-active">Need Reminder (Perlu Diingatkan)</option>
              <option value="pending" class="bg-white dark:bg-gray-900 text-text-active">Pending (Menunggu)</option>
              <option value="done" class="bg-white dark:bg-gray-900 text-text-active">Done (Selesai)</option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>

        <!-- Conditional Config: Interval & Titik Pengingat (Compact) -->
        <FormField
          v-if="showReminderConfig"
          label="Pengingat Jadwal"
          :col-span="2"
        >
          <div class="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full">
            <!-- Titik Pengingat (H-) -->
            <div class="flex-1 flex items-center gap-2 min-w-[140px]">
              <span class="text-xs text-text-muted font-medium shrink-0">Titik H-:</span>
              <input
                v-model="form.alertDaysBefore"
                type="text"
                :disabled="isSubmitting"
                placeholder="7, 1"
                class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
              />
            </div>

            <div class="hidden sm:block w-px h-5 bg-border shrink-0"></div>

            <!-- Interval Perulangan -->
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-text-muted font-medium shrink-0">Interval:</span>
              <div class="flex items-center gap-1">
                <input
                  v-model.number="form.intervalReminder"
                  type="number"
                  min="0"
                  :disabled="isSubmitting"
                  placeholder="0"
                  class="w-14 bg-transparent border-0 p-0 text-right outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
                />
                <span class="text-xs text-text-muted font-medium">Hari</span>
              </div>
            </div>
          </div>
        </FormField>

        <!-- Deskripsi Jadwal -->
        <FormField label="Deskripsi Jadwal" :required="true" :col-span="2">
          <textarea
            v-model="form.descriptionSchedule"
            :disabled="isSubmitting"
            rows="3"
            placeholder="Rincian pekerjaan yang akan dilakukan..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder resize-none focus:ring-0"
            required
          ></textarea>
        </FormField>
      </FormSection>

      <!-- Section 2: Informasi PIC External -->
      <FormSection title="Informasi PIC External" :cols="2">
        <!-- Nama PIC External -->
        <FormField label="Nama PIC" :col-span="2">
          <input
            v-model="form.picExternal"
            type="text"
            :disabled="isSubmitting"
            placeholder="Nama penyedia jasa / PIC luar"
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
          />
        </FormField>

        <!-- No. HP PIC -->
        <FormField label="No. HP PIC" :col-span="2">
          <input
            v-model="form.noHpPic"
            type="tel"
            :disabled="isSubmitting"
            placeholder="08xxxxxxxx"
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
          />
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
import TimePicker from '@/components/ui/TimePicker.vue';
import { ChevronDown } from 'lucide-vue-next';
import { useScheduleStore } from '../schedule.store';
import { MaintenanceService } from '@/modules/transaction/maintenance/maintenance.service';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  scheduleId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const scheduleStore = useScheduleStore();

// --- Computed States ---
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEdit = computed(() => !!props.scheduleId);
const isSubmitting = ref(false);
const detailData = ref(null);

const isDraftStatus = computed(() => {
  return detailData.value?.status?.toLowerCase() === 'draft';
});

const showReminderConfig = computed(() => {
  return (
    form.status === 'need_reminder' ||
    form.status === 'scheduled' ||
    form.status === 'pending' ||
    form.status === 'draft'
  );
});

// --- Custom Async Search: Maintenance Tickets ---
const searchMaintenances = async (query) => {
  try {
    const res = await MaintenanceService.getAll({ search: query, limit: 20 });
    const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    return raw.map((m) => ({
      value: m.id,
      label: `${m.kode_maintenance || m.ticket_number || '-'} - ${m.event_item || ''}`
    }));
  } catch (err) {
    console.error('ScheduleFormModal: Failed to search maintenances', err);
    return [];
  }
};
// --- Form State ---
const form = reactive({
  dateSchedule: new Date().toISOString().split('T')[0],
  endDateSchedule: '',
  timeSchedule: '',
  endTimeSchedule: '',
  perihal: 'driver',
  otherPerihalDetail: '',
  locationId: '',
  maintenanceId: null,
  picExternal: '',
  noHpPic: '',
  descriptionSchedule: '',
  status: 'need_reminder',
  intervalReminder: 0,
  alertDaysBefore: '7, 1'
});

const isFormComplete = computed(() => {
  return !!(
    form.dateSchedule &&
    form.perihal &&
    (form.perihal !== 'other' || form.otherPerihalDetail?.trim()) &&
    form.locationId &&
    form.descriptionSchedule?.trim() &&
    form.status
  );
});


// --- Reset & Populate Form ---
const resetForm = () => {
  detailData.value = null;
  Object.assign(form, {
    dateSchedule: new Date().toISOString().split('T')[0],
    endDateSchedule: '',
    timeSchedule: '',
    endTimeSchedule: '',
    perihal: 'driver',
    otherPerihalDetail: '',
    locationId: '',
    maintenanceId: null,
    picExternal: '',
    noHpPic: '',
    descriptionSchedule: '',
    status: 'need_reminder',
    intervalReminder: 0,
    alertDaysBefore: '7, 1'
  });
};

const loadDetail = async (id) => {
  isSubmitting.value = true;
  try {
    const detail = await scheduleStore.fetchDetail(id);
    if (detail) {
      detailData.value = detail;
      Object.assign(form, {
        dateSchedule: detail.dateSchedule || '',
        endDateSchedule: detail.endDateSchedule || '',
        timeSchedule: detail.timeSchedule || '',
        endTimeSchedule: detail.endTimeSchedule || '',
        perihal: detail.perihal || 'driver',
        otherPerihalDetail: detail.otherPerihalDetail || '',
        locationId: detail.locationId || '',
        maintenanceId: detail.maintenanceId || null,
        picExternal: detail.picExternal || '',
        noHpPic: detail.noHpPic || '',
        descriptionSchedule: detail.descriptionSchedule || '',
        status: detail.status || 'need_reminder',
        intervalReminder: detail.intervalReminder || 0,
        alertDaysBefore: Array.isArray(detail.alertDaysBefore)
          ? detail.alertDaysBefore.join(', ')
          : (detail.alertDaysBefore ? String(detail.alertDaysBefore) : '7, 1')
      });
    }
  } catch (err) {
    Alert.error('Gagal', 'Gagal memuat data detail jadwal');
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
      if (props.scheduleId) {
        await loadDetail(props.scheduleId);
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
    form.status = 'draft';
  } else if (form.status === 'draft') {
    form.status = 'need_reminder';
  }

  if (!isFormComplete.value) {
    Alert.toast('Mohon lengkapi seluruh field wajib formulir', 'warning');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await scheduleStore.updateSchedule(props.scheduleId, form);
      Alert.toast(
        actionType === 'draft' ? 'Draft jadwal berhasil diperbarui' : 'Jadwal berhasil diperbarui',
        'success'
      );
    } else {
      await scheduleStore.createSchedule(form);
      Alert.toast(
        actionType === 'draft' ? 'Draft jadwal berhasil disimpan' : 'Jadwal baru berhasil dibuat',
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

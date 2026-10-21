<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Ubah Anggota Roster' : 'Tambah Anggota Roster'"
    :subtitle="isEdit ? `ID Roster: #${memberId}` : 'Kurasi manual pemegang stok resmi Pusat'"
    :is-modal="true"
    max-width="max-w-[640px]"
    :loading="isSubmitting"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Simpan Anggota'"
    cancel-label="Batal"
    :disabled="!isFormValid"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Info Banner -->
      <div class="border border-dashed border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-3 rounded-lg flex gap-2.5 items-start">
        <Building2 class="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <div class="flex flex-col text-xs leading-relaxed text-blue-900 dark:text-blue-200">
          <span class="font-bold">Pemegang Stok Resmi Pusat</span>
          <span class="text-blue-700/80 dark:text-blue-300/80 text-[11px] mt-0.5">
            Karyawan yang dipilih menjadi kandidat processor Admin Pusat untuk pengajuan Barang.
            Satu karyawan boleh terdaftar di lebih dari satu office (many-to-many).
          </span>
        </div>
      </div>

      <!-- Section: Informasi Roster -->
      <FormSection title="Informasi Roster" :cols="1">
        <!-- Karyawan -->
        <FormField
          label="Karyawan"
          label-width="160px"
          type="searchable-select"
          master="employees"
          v-model="form.employee_id"
          :initial-option="initialEmployeeOption"
          :disabled="isSubmitting"
          :required="true"
          placeholder="Pilih Karyawan..."
          search-placeholder="Cari nama karyawan..."
          :clearable="true"
        />

        <!-- Office -->
        <FormField
          label="Office"
          label-width="160px"
          type="searchable-select"
          master="locations"
          :filters="{ location_type: 'office' }"
          v-model="form.office_location_id"
          :initial-option="initialOfficeOption"
          :disabled="isSubmitting"
          :required="true"
          placeholder="Pilih Office..."
          search-placeholder="Cari nama office..."
          :clearable="true"
        />

        <!-- Catatan -->
        <FormField label="Catatan" label-width="160px">
          <textarea
            v-model="form.notes"
            :disabled="isSubmitting"
            rows="3"
            maxlength="1000"
            placeholder="Tambahkan catatan opsional jika ada..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder resize-none focus:ring-0"
          ></textarea>
        </FormField>
      </FormSection>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import { Building2 } from 'lucide-vue-next';
import { useAdminPusatRosterStore } from '../adminPusatRoster.store';
import { AdminPusatRosterMapper } from '../adminPusatRoster.mapper';
import { Alert } from '@/plugins/sweetalert';
import { getApiErrorMessage } from '@/utils/apiError';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  memberId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useAdminPusatRosterStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.memberId);
const isSubmitting = ref(false);

const memberDetail = ref(null);

const form = reactive({
  employee_id: '',
  office_location_id: '',
  notes: '',
});

const original = reactive({
  employee_id: '',
  office_location_id: '',
  notes: '',
});

const initialEmployeeOption = computed(() => {
  if (!form.employee_id) return null;
  if (memberDetail.value?.employee?.full_name) {
    return {
      value: form.employee_id,
      label: `${memberDetail.value.employee.full_name} (${memberDetail.value.employee.position?.name || 'Karyawan'})`,
    };
  }
  return null;
});

const initialOfficeOption = computed(() => {
  if (!form.office_location_id) return null;
  if (memberDetail.value?.office_location?.location_name) {
    return {
      value: form.office_location_id,
      label: memberDetail.value.office_location.location_name,
    };
  }
  return null;
});

const isFormValid = computed(() => !!form.employee_id && !!form.office_location_id);

const resetForm = () => {
  memberDetail.value = null;
  form.employee_id = '';
  form.office_location_id = '';
  form.notes = '';
  Object.assign(original, { employee_id: '', office_location_id: '', notes: '' });
};

const loadDetail = async (id) => {
  isSubmitting.value = true;
  try {
    const data = await store.fetchMemberById(id);
    if (data) {
      memberDetail.value = data;
      form.employee_id = data.employee_id || '';
      form.office_location_id = data.office_location_id || '';
      form.notes = data.notes || '';
      Object.assign(original, {
        employee_id: form.employee_id,
        office_location_id: form.office_location_id,
        notes: form.notes,
      });
    }
  } catch (error) {
    console.error('AdminPusatRosterFormModal: Load detail failed', error);
    Alert.error('Gagal', 'Data anggota roster tidak ditemukan.');
    handleClose();
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => [props.modelValue, props.memberId],
  async ([open, id]) => {
    if (open) {
      if (id) {
        await loadDetail(id);
      } else {
        resetForm();
      }
    }
  },
  { immediate: true }
);

const handleClose = () => {
  isOpen.value = false;
  emit('close');
};

const handleSubmit = async () => {
  if (!form.employee_id) return Alert.error('Validasi', 'Karyawan harus dipilih.');
  if (!form.office_location_id) return Alert.error('Validasi', 'Office harus dipilih.');

  const payload = AdminPusatRosterMapper.toPayload(form, isEdit.value, original);

  if (isEdit.value && !Object.keys(payload).length) {
    Alert.error('Tidak Ada Perubahan', 'Tidak ada data yang diubah.');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await store.updateMember(props.memberId, payload);
      Alert.toast('Anggota roster telah diperbarui', 'success');
    } else {
      await store.createMember(payload);
      Alert.toast('Anggota roster baru telah ditambahkan', 'success');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit admin pusat roster failed:', error);
    Alert.error('Gagal Simpan', getApiErrorMessage(error));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

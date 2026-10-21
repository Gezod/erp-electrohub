<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Ubah Store Assignment' : 'Assign Toko Baru'"
    :subtitle="isEdit ? `ID Assignment: #${assignmentId}` : 'Konfigurasi PIC pemroses request toko marketing'"
    :is-modal="true"
    max-width="max-w-[640px]"
    :loading="isSubmitting"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Simpan Assignment'"
    cancel-label="Batal"
    :disabled="!isFormValid"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Info Banner -->
      <div class="border border-dashed border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-3 rounded-lg flex gap-2.5 items-start">
        <Store class="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <div class="flex flex-col text-xs leading-relaxed text-blue-900 dark:text-blue-200">
          <span class="font-bold">PIC Pemroses Request Toko</span>
          <span class="text-blue-700/80 dark:text-blue-300/80 text-[11px] mt-0.5">
            Karyawan yang dipilih menjadi processor otomatis untuk Request yang diajukan toko ini. Satu toko hanya boleh memiliki 1 assignment aktif.
          </span>
        </div>
      </div>

      <!-- Section: Informasi Assignment -->
      <FormSection title="Informasi Assignment" :cols="1">
        <!-- Marketing Provinsi / PIC Gudang -->
        <FormField
          label="Marketing / PIC"
          label-width="160px"
          type="searchable-select"
          master="employees"
          v-model="form.employee_id"
          :initial-option="initialEmployeeOption"
          :disabled="isSubmitting"
          :required="true"
          placeholder="Pilih Marketing Provinsi / PIC..."
          search-placeholder="Cari nama karyawan..."
          :clearable="true"
        />

        <!-- Toko -->
        <FormField
          label="Toko"
          label-width="160px"
          type="searchable-select"
          master="locations"
          :filters="{ location_type: 'store' }"
          v-model="form.store_location_id"
          :initial-option="initialStoreOption"
          :disabled="isSubmitting"
          :required="true"
          placeholder="Pilih Toko..."
          search-placeholder="Cari nama toko..."
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
import { Store } from 'lucide-vue-next';
import { useStoreAssignmentStore } from '../storeAssignment.store';
import { StoreAssignmentMapper } from '../storeAssignment.mapper';
import { Alert } from '@/plugins/sweetalert';
import { getApiErrorMessage } from '@/utils/apiError';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  assignmentId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useStoreAssignmentStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.assignmentId);
const isSubmitting = ref(false);

const assignmentDetail = ref(null);

const form = reactive({
  employee_id: '',
  store_location_id: '',
  notes: '',
});

const original = reactive({
  employee_id: '',
  store_location_id: '',
  notes: '',
});

const initialEmployeeOption = computed(() => {
  if (!form.employee_id) return null;
  if (assignmentDetail.value?.employee?.full_name) {
    return {
      value: form.employee_id,
      label: `${assignmentDetail.value.employee.full_name} (${assignmentDetail.value.employee.position?.name || 'Karyawan'})`,
    };
  }
  return null;
});

const initialStoreOption = computed(() => {
  if (!form.store_location_id) return null;
  if (assignmentDetail.value?.store_location?.location_name) {
    return {
      value: form.store_location_id,
      label: assignmentDetail.value.store_location.location_name,
    };
  }
  return null;
});

const isFormValid = computed(() => !!form.employee_id && !!form.store_location_id);

const resetForm = () => {
  assignmentDetail.value = null;
  form.employee_id = '';
  form.store_location_id = '';
  form.notes = '';
  Object.assign(original, { employee_id: '', store_location_id: '', notes: '' });
};

const loadDetail = async (id) => {
  isSubmitting.value = true;
  try {
    const data = await store.fetchAssignmentById(id);
    if (data) {
      assignmentDetail.value = data;
      form.employee_id = data.employee_id || '';
      form.store_location_id = data.store_location_id || '';
      form.notes = data.notes || '';
      Object.assign(original, {
        employee_id: form.employee_id,
        store_location_id: form.store_location_id,
        notes: form.notes,
      });
    }
  } catch (error) {
    console.error('StoreAssignmentFormModal: Load detail failed', error);
    Alert.error('Gagal', 'Data assignment tidak ditemukan.');
    handleClose();
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => [props.modelValue, props.assignmentId],
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
  if (!form.employee_id) return Alert.error('Validasi', 'Marketing/PIC harus dipilih.');
  if (!form.store_location_id) return Alert.error('Validasi', 'Toko harus dipilih.');

  const payload = StoreAssignmentMapper.toPayload(form, isEdit.value, original);

  if (isEdit.value && !Object.keys(payload).length) {
    Alert.error('Tidak Ada Perubahan', 'Tidak ada data yang diubah.');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await store.updateAssignment(props.assignmentId, payload);
      Alert.toast('Store assignment telah diperbarui', 'success');
    } else {
      await store.createAssignment(payload);
      Alert.toast('Store assignment baru telah dibuat', 'success');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit store assignment failed:', error);
    Alert.error('Gagal Simpan', getApiErrorMessage(error));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

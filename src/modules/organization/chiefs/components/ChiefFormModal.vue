<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Ubah Data Jabatan Pimpinan' : 'Tambah Jabatan Pimpinan Baru'"
    :subtitle="isEdit ? `Jabatan: ${form.title || '-'}` : 'Konfigurasi struktur hierarki & jabatan pimpinan'"
    :is-modal="true"
    max-width="max-w-[600px]"
    :loading="isSubmitting"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Buat Jabatan'"
    cancel-label="Batal"
    :disabled="!isFormValid"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <FormSection title="Informasi Jabatan" :cols="1">
        <!-- Nama Jabatan (Title) -->
        <FormField label="Nama Jabatan" label-width="150px" :required="true">
          <input
            v-model="form.title"
            type="text"
            required
            :disabled="isSubmitting"
            placeholder="Masukkan nama jabatan (misal: Chief Operations Officer)..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
          />
        </FormField>

        <!-- Pejabat / Pimpinan (Employee) -->
        <FormField label="Pejabat (Chief)" label-width="150px">
          <SearchableSelect
            v-model="form.employee_id"
            :options="employeeOptions"
            option-label="label"
            option-value="id"
            variant="seamless"
            placeholder="Pilih pegawai yang menjabat (Opsional)..."
            search-placeholder="Cari nama atau NIK pegawai..."
            :disabled="isSubmitting"
            :clearable="true"
            class="w-full"
          />
        </FormField>
      </FormSection>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import { useChiefStore } from '../chief.store';
import { EmployeeService } from '@/modules/organization/employees/employee.service';
import { Alert } from '@/plugins/sweetalert';
import { getApiErrorMessage } from '@/utils/apiError';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  chiefId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useChiefStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.chiefId);
const isSubmitting = ref(false);

const employeesRaw = ref([]);

const form = reactive({
  title: '',
  employee_id: '',
});

const isFormValid = computed(() => !!form.title.trim());

const employeeOptions = computed(() => {
  return employeesRaw.value.map((e) => {
    const name = e.fullName || e.full_name || e.name || '-';
    const nik = e.employeeNumber || e.nik || '';
    const pos = e.position?.name || e.positionName || '';
    const labelExtra = [nik, pos].filter(Boolean).join(' • ');
    return {
      id: e.employeeId || e.id,
      label: labelExtra ? `${name} (${labelExtra})` : name,
    };
  });
});

const fetchDependencies = async () => {
  try {
    const empRes = await EmployeeService.getAll({ limit: 1000, status: 'active' });
    employeesRaw.value = empRes.data || [];
  } catch (err) {
    console.error('Failed to load employee dependencies', err);
  }
};

const resetForm = () => {
  form.title = '';
  form.employee_id = '';
};

const loadDetailData = async (id) => {
  isSubmitting.value = true;
  try {
    const data = await store.fetchChiefById(id);
    if (data) {
      form.title = data.title === '-' ? '' : data.title || '';
      form.employee_id = data.employee_id || '';
    }
  } catch (error) {
    console.error('Failed to load chief detail', error);
    Alert.error('Gagal', 'Data jabatan pimpinan tidak ditemukan.');
    handleClose();
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      await fetchDependencies();
      if (props.chiefId) {
        await loadDetailData(props.chiefId);
      } else {
        resetForm();
      }
    }
  }
);

onMounted(async () => {
  if (props.modelValue) {
    await fetchDependencies();
    if (props.chiefId) {
      await loadDetailData(props.chiefId);
    } else {
      resetForm();
    }
  }
});

const handleClose = () => {
  isOpen.value = false;
  emit('update:modelValue', false);
  emit('close');
};

const handleSubmit = async () => {
  if (!form.title.trim()) {
    Alert.error('Validasi Gagal', 'Nama jabatan pimpinan wajib diisi.');
    return;
  }

  const actionText = isEdit.value ? 'Simpan perubahan data jabatan?' : 'Buat data jabatan baru?';
  const confirmed = await Alert.confirm('Konfirmasi', actionText);
  if (!confirmed) return;

  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await store.updateChief(props.chiefId, form);
      Alert.toast('Data jabatan pimpinan berhasil diperbarui.', 'success');
    } else {
      await store.createChief(form);
      Alert.toast('Jabatan pimpinan baru berhasil dibuat.', 'success');
    }

    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit chief error:', error);
    Alert.error('Gagal Simpan', getApiErrorMessage(error, 'Gagal menyimpan data jabatan pimpinan.'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

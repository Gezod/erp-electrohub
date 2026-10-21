<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Ubah Data Divisi' : 'Tambah Divisi Baru'"
    :subtitle="isEdit ? `Divisi: ${form.name || '-'}` : 'Pendaftaran struktur organisasi & divisi baru'"
    :is-modal="true"
    max-width="max-w-[640px]"
    :loading="isSubmitting"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Buat Divisi'"
    cancel-label="Batal"
    :disabled="!isFormValid"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Section: Informasi Divisi -->
      <FormSection title="Informasi Divisi" :cols="1">
        <!-- Nama Divisi -->
        <FormField label="Nama Divisi" label-width="150px" :required="true">
          <input
            v-model="form.name"
            type="text"
            required
            :disabled="isSubmitting"
            placeholder="Masukkan nama divisi (misal: IT Infrastructure)..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
          />
        </FormField>

        <!-- Kepala Divisi (Chief) -->
        <FormField label="Kepala Divisi" label-width="150px">
          <SearchableSelect
            v-model="form.chief_id"
            :options="chiefsOptions"
            option-label="label"
            option-value="id"
            variant="seamless"
            placeholder="Pilih Kepala Divisi (Chief)..."
            search-placeholder="Cari nama atau jabatan..."
            :disabled="isSubmitting"
            :clearable="true"
            class="w-full"
          />
        </FormField>

        <!-- Deskripsi -->
        <FormField label="Deskripsi" label-width="150px">
          <textarea
            v-model="form.description"
            rows="3"
            :disabled="isSubmitting"
            placeholder="Jelaskan fungsi atau tanggung jawab divisi..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder resize-none focus:ring-0"
          ></textarea>
        </FormField>
      </FormSection>

      <!-- Section: Manager Divisi (Multi-select) -->
      <FormSection title="Manager Divisi" :cols="1">
        <div class="flex flex-col gap-3 w-full">
          <!-- Add Manager Dropdown -->
          <FormField label="Pilih Manager" label-width="150px">
            <SearchableSelect
              :model-value="selectedNewManager"
              :options="availableEmployees"
              option-label="fullName"
              option-value="employeeId"
              :custom-label="(e) => `${e.fullName} (${e.employeeNumber || '-'}) • ${e.position?.name || 'Staff'}`"
              variant="seamless"
              placeholder="Cari dan tambahkan manager divisi..."
              search-placeholder="Ketik nama atau NIK pegawai..."
              :disabled="isSubmitting"
              :clearable="false"
              @update:model-value="onAddManager"
              class="w-full"
            />
          </FormField>

          <!-- Selected Managers Badges -->
          <div v-if="selectedManagers.length" class="flex flex-wrap gap-2 pt-1">
            <div
              v-for="emp in selectedManagers"
              :key="emp.employeeId"
              class="flex items-center gap-2 px-3 py-1.5 bg-bg-2 border border-border dark:bg-gray-800/60 rounded-lg text-xs font-semibold text-text-active transition"
            >
              <div class="flex flex-col min-w-0">
                <span class="truncate leading-tight">{{ emp.fullName }}</span>
                <span class="text-[10px] text-text-muted font-mono leading-tight">
                  {{ emp.employeeNumber || 'STAFF' }} • {{ emp.position?.name || 'Manager' }}
                </span>
              </div>
              <button
                type="button"
                @click="removeManager(emp.employeeId)"
                :disabled="isSubmitting"
                class="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-text-muted hover:text-red-500 transition cursor-pointer"
                title="Hapus Manager"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p class="text-[11px] text-text-muted italic">
            * Manager yang dipilih memiliki hak akses operasional dan kepemimpinan terhadap divisi ini.
          </p>
        </div>
      </FormSection>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import { X } from 'lucide-vue-next';
import { useDivisionStore } from '../division.store';
import { ChiefService } from '@/modules/organization/chiefs/chief.service';
import { EmployeeService } from '@/modules/organization/employees/employee.service';
import { Alert } from '@/plugins/sweetalert';
import { getApiErrorMessage } from '@/utils/apiError';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  divisionId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useDivisionStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.divisionId);
const isSubmitting = ref(false);

const chiefsRaw = ref([]);
const employeesRaw = ref([]);
const selectedNewManager = ref(null);

const form = reactive({
  name: '',
  description: '',
  chief_id: '',
  manager_ids: [],
});

const isFormValid = computed(() => !!form.name.trim());

const chiefsOptions = computed(() => {
  return chiefsRaw.value.map((c) => ({
    id: c.id,
    label: `${c.employee_name || c.title || '-'} (${c.title || 'Chief'})`,
  }));
});

const activeEmployees = computed(() => {
  return employeesRaw.value.filter((e) => !!(e.employeeId || e.id));
});

const selectedManagers = computed(() => {
  return activeEmployees.value.filter((emp) =>
    form.manager_ids.includes(emp.employeeId || emp.id)
  );
});

const availableEmployees = computed(() => {
  return activeEmployees.value.filter(
    (emp) => !form.manager_ids.includes(emp.employeeId || emp.id)
  );
});

const onAddManager = (empId) => {
  if (empId && !form.manager_ids.includes(empId)) {
    form.manager_ids.push(empId);
  }
  selectedNewManager.value = null;
};

const removeManager = (empId) => {
  const index = form.manager_ids.indexOf(empId);
  if (index !== -1) {
    form.manager_ids.splice(index, 1);
  }
};

const fetchDependencies = async () => {
  try {
    const [chiefsRes, empRes] = await Promise.all([
      ChiefService.getAll({ limit: 500, is_active: true }),
      EmployeeService.getAll({ limit: 1000 }),
    ]);
    chiefsRaw.value = chiefsRes.data || [];
    employeesRaw.value = empRes.data || [];
  } catch (err) {
    console.error('Failed to load division dependencies', err);
  }
};

const resetForm = () => {
  form.name = '';
  form.description = '';
  form.chief_id = '';
  form.manager_ids = [];
  selectedNewManager.value = null;
};

const loadDetailData = async (id) => {
  isSubmitting.value = true;
  try {
    const data = await store.fetchDivisionById(id);
    if (data) {
      form.name = data.name || '';
      form.description = data.description === '-' ? '' : data.description || '';
      form.chief_id = data.chief_id || '';
      form.manager_ids = data.manager_ids || [];
    }
  } catch (error) {
    console.error('Failed to load division detail', error);
    Alert.error('Gagal', 'Data divisi tidak ditemukan.');
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
      if (props.divisionId) {
        await loadDetailData(props.divisionId);
      } else {
        resetForm();
      }
    }
  }
);

onMounted(async () => {
  if (props.modelValue) {
    await fetchDependencies();
    if (props.divisionId) {
      await loadDetailData(props.divisionId);
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
  if (!form.name.trim()) {
    Alert.error('Validasi Gagal', 'Nama divisi wajib diisi.');
    return;
  }

  const actionText = isEdit.value ? 'Simpan perubahan data divisi?' : 'Buat data divisi baru?';
  const confirmed = await Alert.confirm('Konfirmasi', actionText);
  if (!confirmed) return;

  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await store.updateDivision(props.divisionId, form);
      Alert.toast('Data divisi berhasil diperbarui.', 'success');
    } else {
      await store.createDivision(form);
      Alert.toast('Divisi baru berhasil dibuat.', 'success');
    }

    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit division error:', error);
    Alert.error('Gagal Simpan', getApiErrorMessage(error, 'Gagal menyimpan data divisi.'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

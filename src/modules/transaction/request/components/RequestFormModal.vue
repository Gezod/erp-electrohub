<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Edit Permintaan Barang' : 'Buat Permintaan Barang'"
    :subtitle="isEdit ? `Kode: ${requestStore.requestDetail?.requestCode || '-'}` : 'Formulir pengajuan dan permintaan inventaris barang'"
    :is-modal="true"
    max-width="max-w-4xl"
    :loading="isSubmitting"
    :steps="['Informasi Permintaan', 'Daftar Barang Diminta']"
    v-model:current-step="currentStep"
    :is-step-valid="currentStep === 1 ? isStep1Valid : isStep2Valid"
    :show-draft="isStep1Valid && (currentStep === 1 || (currentStep === 2 && isStep2Valid))"
    :status-badge="isEdit && requestStore.requestDetail?.status ? requestStore.requestDetail.status.replace('_', ' ') : ''"
    :status-badge-class="statusBadgeClass(requestStore.requestDetail?.status)"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Kirim Pengajuan'"
    continue-label="Lanjut"
    @draft="handleSave('draft')"
    @submit="handleSave('dalam_pengajuan')"
    @close="handleClose"
  >

    <!-- ==================== PHASE 1: Informasi Permintaan ==================== -->
    <div v-if="currentStep === 1" class="flex flex-col gap-4">

      <FormSection title="Informasi Permintaan" :cols="2">
        <!-- Tanggal Permintaan -->
        <FormField label="Tanggal Permintaan" :required="true">
          <DatePicker
            v-model="form.dateRequest"
            :disabled="!isEditable"
            placeholder="Pilih tanggal"
          />
        </FormField>

        <!-- Pemohon -->
        <FormField v-if="!isProxyAllowed" label="Pemohon" :required="true">
          <input
            :value="authStore.user?.displayName || authStore.user?.fullName || '-'"
            disabled
            class="w-full bg-transparent border-0 p-0 outline-none text-text-muted text-sm cursor-not-allowed"
          />
        </FormField>
        <FormField
          v-else
          label="Pemohon"
          type="searchable-select"
          master="employees"
          v-model="form.picGaId"
          :initial-option="initialPicOption"
          :disabled="!isEditable"
          placeholder="Pilih pemohon..."
          search-placeholder="Cari karyawan..."
          :required="true"
          @select="onPicGaSelected"
        />

        <!-- Divisi Pemohon -->
        <FormField label="Divisi Pemohon" :col-span="2">
          <input
            :value="selectedEmployeeDivisionName || '-'"
            disabled
            class="w-full bg-transparent border-0 p-0 outline-none text-text-muted text-sm cursor-not-allowed"
          />
        </FormField>

        <!-- Lokasi -->
        <FormField
          label="Lokasi"
          type="searchable-select"
          master="locations"
          v-model="form.locationId"
          :disabled="!isEditable"
          placeholder="Pilih lokasi..."
          search-placeholder="Cari lokasi..."
          :required="true"
          :col-span="2"
        />

        <!-- Sumber Stok -->
        <FormField label="Sumber Stok" :required="true" :col-span="2">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md w-fit">
              <button
                v-for="opt in REQUEST_STOCK_TIPE_OPTIONS"
                :key="opt.value"
                type="button"
                :disabled="!isEditable"
                @click="form.tipe = opt.value"
                :class="[
                  'px-3 py-1 rounded text-xs transition-all border cursor-pointer',
                  form.tipe === opt.value
                    ? (opt.value === 'biasa'
                      ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                      : 'bg-amber-500 text-white border-amber-500 font-medium shadow-xs')
                    : 'bg-transparent border-transparent text-text-muted font-normal'
                ]"
              >
                {{ opt.label }}
              </button>
            </div>
            <span class="text-xs text-text-muted">1 pengajuan = 1 jenis stok. Tidak dapat dicampur.</span>
          </div>
        </FormField>

        <!-- Tujuan / Keperluan -->
        <FormField label="Tujuan / Keperluan" :col-span="2">
          <textarea
            v-model="form.purpose"
            :disabled="!isEditable"
            rows="3"
            placeholder="Masukkan tujuan atau keperluan permintaan barang..."
            class="w-full bg-transparent border-0 p-0 outline-none text-text-active text-sm resize-none focus:ring-0"
          ></textarea>
        </FormField>
      </FormSection>

    </div>

    <!-- ==================== PHASE 2: Daftar Barang Diminta ==================== -->
    <div v-if="currentStep === 2" class="flex flex-col gap-4">

      <FormSection title="Daftar Barang Diminta" :cols="1">
        <div class="flex flex-col gap-3">
          <div
            v-for="(item, index) in formItems"
            :key="index"
            class="bg-white dark:bg-gray-900 border border-border rounded-lg p-3.5 flex flex-col gap-3"
          >
            <!-- Header bar of each row -->
            <div class="flex items-center justify-between border-b border-border pb-2">
              <span class="text-xs font-bold text-text-muted uppercase tracking-wider">Item #{{ index + 1 }}</span>
              <div class="flex items-center gap-3">
                <label class="flex items-center gap-1.5 cursor-pointer select-none text-xs text-text-muted hover:text-text-active">
                  <input
                    type="checkbox"
                    v-model="item.isManual"
                    :disabled="!isEditable"
                    @change="resetItemSelect(index)"
                    class="rounded border-border text-brand-500 focus:ring-brand-500"
                  />
                  <span>Ketik Manual</span>
                </label>
                <button
                  v-if="isEditable && formItems.length > 1"
                  type="button"
                  @click="removeItemRow(index)"
                  class="text-xs text-red-500 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 class="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            </div>

            <!-- Item fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Master Good Selector or Manual Input -->
              <div class="md:col-span-2" v-if="!item.isManual">
                <label class="block text-xs font-medium text-text-muted mb-1">Pilih Barang dari Master <span class="text-red-500">*</span></label>
                <div class="bg-white dark:bg-gray-800 border border-border rounded-md px-3 py-2">
                  <SearchableSelect
                    v-model="item.goodId"
                    master="goods"
                    :disabled="!isEditable"
                    variant="seamless"
                    placeholder="Pilih atau cari barang master..."
                    search-placeholder="Cari nama, kode atau merk barang..."
                    @select="(good) => onGoodSelected(index, good)"
                  />
                </div>
              </div>

              <div class="md:col-span-2" v-else>
                <label class="block text-xs font-medium text-text-muted mb-1">Nama Barang Manual <span class="text-red-500">*</span></label>
                <input
                  v-model="item.itemNameManual"
                  :disabled="!isEditable"
                  type="text"
                  placeholder="Ketik nama barang secara manual..."
                  class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border rounded-md text-sm text-text-active outline-none focus:border-brand-500"
                  required
                />
              </div>

              <!-- Kategori (if manual) -->
              <div v-if="item.isManual">
                <label class="block text-xs font-medium text-text-muted mb-1">Kategori <span class="text-red-500">*</span></label>
                <div class="bg-white dark:bg-gray-800 border border-border rounded-md px-3 py-2">
                  <SearchableSelect
                    v-model="item.categoryId"
                    master="categories"
                    :disabled="!isEditable"
                    variant="seamless"
                    placeholder="Pilih kategori..."
                    search-placeholder="Cari kategori..."
                  />
                </div>
              </div>

              <!-- PIC Pemilik (if manual) -->
              <div v-if="item.isManual">
                <label class="block text-xs font-medium text-text-muted mb-1">Pemilik / PIC <span class="text-red-500">*</span></label>
                <div class="bg-white dark:bg-gray-800 border border-border rounded-md px-3 py-2">
                  <SearchableSelect
                    v-model="item.picId"
                    master="employees"
                    :disabled="!isEditable"
                    variant="seamless"
                    placeholder="Pilih PIC..."
                    search-placeholder="Cari nama atau NIK karyawan..."
                  />
                </div>
              </div>

              <!-- Jumlah (QTY) -->
              <div :class="item.isManual ? 'md:col-span-2' : ''">
                <label class="block text-xs font-medium text-text-muted mb-1">Jumlah Diminta <span class="text-red-500">*</span></label>
                <input
                  v-model.number="item.qtyRequest"
                  :disabled="!isEditable"
                  type="number"
                  step="any"
                  min="1"
                  placeholder="1"
                  class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border rounded-md text-sm text-text-active outline-none focus:border-brand-500 font-medium"
                  required
                />
              </div>

              <!-- Divisi Tujuan (if user is GA) -->
              <div v-if="isGaUser" class="md:col-span-2">
                <label class="block text-xs font-medium text-text-muted mb-1">Divisi Tujuan (Opsional)</label>
                <div class="bg-white dark:bg-gray-800 border border-border rounded-md px-3 py-2">
                  <SearchableSelect
                    v-model="item.destinationDivisionId"
                    master="divisions"
                    :disabled="!isEditable"
                    variant="seamless"
                    placeholder="Pilih divisi tujuan..."
                    search-placeholder="Cari divisi..."
                    :clearable="true"
                  />
                </div>
              </div>

              <!-- Keterangan / Detail -->
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">Keterangan / Spesifikasi</label>
                <input
                  v-model="item.notes"
                  :disabled="!isEditable"
                  type="text"
                  placeholder="Contoh: warna hitam, ukuran L..."
                  class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border rounded-md text-sm text-text-active outline-none focus:border-brand-500"
                />
              </div>

              <!-- Link Referensi -->
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">Link Referensi (Opsional)</label>
                <input
                  v-model="item.linkReference"
                  :disabled="!isEditable"
                  type="url"
                  placeholder="https://..."
                  class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border rounded-md text-sm text-text-active outline-none focus:border-brand-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <!-- Add Item Button -->
          <div v-if="isEditable" class="flex justify-start">
            <button
              type="button"
              @click="addItemRow"
              class="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" /> Tambah Baris Barang
            </button>
          </div>
        </div>
      </FormSection>

    </div>

  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import AppForm from '@/components/forms/AppForm.vue';
import FormSection from '@/components/forms/FormSection.vue';
import FormField from '@/components/forms/FormField.vue';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import { useRequestStore } from '../request.store';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { isGaDivision } from '@/utils/division';
import { EmployeeService } from '@/modules/organization/employees/employee.service';
import { Alert } from '@/plugins/sweetalert';
import { Plus, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  requestId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const requestStore = useRequestStore();
const authStore = useAuthStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.requestId);
const isSubmitting = computed(() => requestStore.isLoading);
const isEditable = computed(() => {
  if (!isEdit.value) return true;
  return ['draft', 'dalam_pengajuan'].includes(requestStore.requestDetail?.status);
});

const isSuperAdmin = computed(() => !!(authStore.user?.isAdmin || authStore.user?.is_superadmin || authStore.user?.isSuperadmin));
const isProxyAllowed = computed(() => {
  if (isSuperAdmin.value) return true;
  return isGaDivision(authStore.user?.division_name || authStore.user?.divisionName);
});
const isGaUser = computed(() => isGaDivision(authStore.user?.division_name || authStore.user?.divisionName));

const currentStep = ref(1);

const selectedEmployeeDivisionName = ref('');

const createEmptyItem = () => ({
  isManual: false,
  itemNameManual: '',
  goodId: '',
  merk: '',
  picId: '',
  categoryId: '',
  qtyRequest: 1,
  notes: '',
  linkReference: '',
  destinationDivisionId: '',
});

// Sumber stok pengajuan: 1 pengajuan = 1 jenis.
const REQUEST_STOCK_TIPE_OPTIONS = [
  { label: 'Stok Biasa', value: 'biasa' },
  { label: 'Stok Opening', value: 'opening' },
  { label: 'Parfum', value: 'parfum' },
];

const form = reactive({
  dateRequest: new Date().toISOString().split('T')[0],
  locationId: '',
  divisionId: '',
  picGaId: '',
  purpose: '',
  tipe: 'biasa',
});

const formItems = ref([createEmptyItem()]);

const initialPicOption = computed(() => {
  if (!form.picGaId) return null;
  const name = authStore.user?.displayName || authStore.user?.fullName;
  if (name && (authStore.user?.employeeId === form.picGaId || authStore.user?.id === form.picGaId)) {
    return {
      value: form.picGaId,
      label: name,
    };
  }
  return null;
});

const isStep1Valid = computed(() => {
  const hasPic = isProxyAllowed.value
    ? !!form.picGaId
    : !!(form.picGaId || authStore.user?.employeeId || authStore.user?.employee_id || authStore.user?.id);
  const isBasicValid = !!(form.locationId && form.dateRequest && hasPic);
  const isProxyValid = isProxyAllowed.value ? !!form.divisionId : true;
  return isBasicValid && isProxyValid;
});

const isStep2Valid = computed(() => {
  return (
    formItems.value.length > 0 &&
    formItems.value.every((item) => {
      const isBasicValid = item.isManual
        ? !!item.itemNameManual && !!item.categoryId
        : !!item.goodId;
      const isPicValid = item.isManual ? !!item.picId : true;
      return isBasicValid && isPicValid && item.qtyRequest > 0;
    })
  );
});

const addItemRow = () => {
  formItems.value.push(createEmptyItem());
};

const removeItemRow = (index) => {
  if (formItems.value.length > 1) {
    formItems.value.splice(index, 1);
  }
};

const resetItemSelect = (index) => {
  const item = formItems.value[index];
  if (!item) return;
  item.goodId = '';
  item.merk = '';
  item.itemNameManual = '';
  item.categoryId = '';
  item.picId = '';
};

const onGoodSelected = (index, good) => {
  const item = formItems.value[index];
  if (!item) return;
  if (good) {
    item.goodId = good.id;
    item.merk = good.merk || '';
    if (good.category_id || good.categoryId) {
      item.categoryId = String(good.category_id || good.categoryId);
    }
  } else {
    item.goodId = '';
    item.merk = '';
  }
};

const onPicGaSelected = (emp) => {
  if (emp) {
    form.divisionId = emp.divisionId || emp.division_id || emp.division?.id || '';
    selectedEmployeeDivisionName.value = emp.division?.name || emp.division_name || emp.division?.name_division || '';
  } else {
    form.divisionId = '';
    selectedEmployeeDivisionName.value = '';
  }
};

const resetForm = () => {
  currentStep.value = 1;
  form.dateRequest = new Date().toISOString().split('T')[0];
  form.locationId = '';
  form.divisionId = '';
  form.picGaId = authStore.user?.employeeId || authStore.user?.employee_id || authStore.user?.id || '';
  form.purpose = '';
  form.tipe = 'biasa';
  selectedEmployeeDivisionName.value = authStore.user?.division_name || authStore.user?.divisionName || '';

  formItems.value = [createEmptyItem()];

  if (authStore.user?.id) {
    EmployeeService.getById(authStore.user.id)
      .then((emp) => {
        if (emp?.division) {
          form.divisionId = emp.division.id || emp.division_id || '';
          selectedEmployeeDivisionName.value = emp.division.name || emp.division_name || emp.division?.name_division || '';
        }
        if (!form.picGaId && emp) {
          form.picGaId = emp.employeeId || emp.id || '';
        }
      })
      .catch(() => {});
  }
};

const loadDetail = async (id) => {
  try {
    const detail = await requestStore.fetchDetail(id);
    if (detail) {
      form.dateRequest = detail.dateRequest
        ? new Date(detail.dateRequest).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      form.locationId = detail.locationId || detail.location?.id || '';
      form.divisionId = detail.divisionId || '';
      selectedEmployeeDivisionName.value = detail.divisionName || '';
      form.picGaId = detail.employeeId || detail.picGaId || '';
      form.purpose = detail.purpose || '';
      form.tipe = detail.tipe || 'biasa';

      if (detail.items?.length) {
        formItems.value = detail.items.map((item) => ({
          isManual: !!item.isManual,
          itemNameManual: item.itemNameManual || '',
          goodId: item.goodId || '',
          merk: item.good?.merk || item.merk || '',
          picId: item.picId || '',
          categoryId: item.categoryId ? String(item.categoryId) : '',
          qtyRequest: Number(item.qtyRequest) || 1,
          notes: item.notes || '',
          linkReference: item.linkRef || item.linkReference || '',
          destinationDivisionId: item.destinationDivisionId || '',
        }));
      } else {
        formItems.value = [createEmptyItem()];
      }
    }
  } catch (err) {
    Alert.error('Gagal', 'Data permintaan tidak ditemukan.');
    handleClose();
  }
};

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      resetForm();
      if (props.requestId) {
        await loadDetail(props.requestId);
      }
    }
  }
);

onMounted(async () => {
  if (props.modelValue) {
    resetForm();
    if (props.requestId) {
      await loadDetail(props.requestId);
    }
  }
});

const handleClose = () => {
  isOpen.value = false;
};

const handleSave = async (status = 'dalam_pengajuan') => {
  if (!form.picGaId && !isProxyAllowed.value) {
    form.picGaId = authStore.user?.employeeId || authStore.user?.employee_id || authStore.user?.id || '';
  }

  if (isSuperAdmin.value && !form.picGaId) {
    return Alert.error('Validasi Gagal', 'Pemohon wajib diisi.');
  }

  if (isProxyAllowed.value && !form.divisionId) {
    return Alert.error('Validasi Gagal', 'Divisi Pemohon wajib diisi.');
  }

  const isDraft = status === 'draft';
  if (!isDraft || currentStep.value === 2) {
    const hasValidItem = formItems.value.length > 0 && formItems.value.every((item) => {
      const isBasicValid =
        (item.isManual ? item.itemNameManual && item.categoryId : item.goodId) &&
        item.qtyRequest > 0;
      const isPicValid = item.isManual ? !!item.picId : true;
      return isBasicValid && isPicValid;
    });

    if (!hasValidItem) {
      return Alert.error('Validasi Gagal', 'Semua item barang dan PIC harus diisi lengkap.');
    }
  }

  try {
    const headerData = { ...form, status };
    if (isEdit.value) {
      await requestStore.updateRequest(props.requestId, headerData, formItems.value);
      const successMsg =
        status === 'draft'
          ? 'Perubahan draft telah disimpan.'
          : 'Permintaan barang telah dikirim.';
      Alert.success('Berhasil', successMsg);
    } else {
      await requestStore.createRequest(headerData, formItems.value);
      const successMsg =
        status === 'draft'
          ? 'Draft permintaan barang telah disimpan.'
          : 'Permintaan barang telah dikirim.';
      Alert.success('Berhasil', successMsg);
    }
    emit('saved');
    handleClose();
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengajuan.');
  }
};

const statusBadgeClass = (s) => ({
  draft: 'bg-gray-100 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  dalam_pengajuan: 'bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  proses_ga: 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  disetujui: 'bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
  diserahkan: 'bg-teal-50 border border-teal-200 text-teal-700 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400',
  batal: 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
}[s] || 'bg-gray-100 text-gray-700');
</script>

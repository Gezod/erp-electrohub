<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Ubah Stok Marketing' : 'Tambah Stok Marketing Baru'"
    :subtitle="isEdit ? (form.goodName ? `${form.goodName} (${form.goodCode || '-'})` : 'Perbarui data stok marketing') : 'Inisialisasi persediaan barang temporary marketing'"
    :is-modal="true"
    max-width="max-w-[640px]"
    :loading="isSubmitting"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Buat Record Stok'"
    cancel-label="Batal"
    :disabled="!isFormValid"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Info Banner: Valued vs Return -->
      <div
        :class="[
          'border border-dashed p-3 rounded-lg flex gap-2.5 items-start transition-all duration-200',
          form.isValued
            ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200'
            : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
        ]"
      >
        <component
          :is="form.isValued ? DollarSign : PackageX"
          :class="['w-4 h-4 shrink-0 mt-0.5', form.isValued ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400']"
        />
        <div class="flex flex-col text-xs leading-relaxed">
          <span class="font-bold">{{ form.isValued ? 'Stok Bernilai (Valued)' : 'Stok Return (Unvalued)' }}</span>
          <span :class="['text-[11px] mt-0.5', form.isValued ? 'text-blue-700/80 dark:text-blue-300/80' : 'text-amber-700/80 dark:text-amber-300/80']">
            {{
              form.isValued
                ? 'Stok ini memiliki nilai buku. Harga satuan digunakan untuk kalkulasi weighted average cost (WAC).'
                : 'Stok ini bernilai Rp 0 (tidak bernilai buku). Biasanya berasal dari retur atau barang reject.'
            }}
          </span>
        </div>
      </div>

      <!-- Section: Informasi Barang & Lokasi -->
      <FormSection title="Informasi Barang & Penempatan" :cols="1">
        <!-- Barang Marketing -->
        <FormField
          v-if="!isEdit"
          label="Barang Marketing"
          label-width="160px"
          type="searchable-select"
          master="marketing-goods"
          :filters="{ tipe_barang: 'temporary' }"
          v-model="form.goodId"
          :disabled="isSubmitting"
          placeholder="Pilih barang temporary..."
          search-placeholder="Cari nama atau kode barang..."
          :clearable="true"
          :required="true"
        />
        <FormField v-else label="Barang Marketing" label-width="160px">
          <div class="flex flex-col py-1">
            <span class="text-sm font-semibold text-text-active">{{ form.goodName || '-' }}</span>
            <span class="text-xs text-text-muted font-mono uppercase">{{ form.goodCode || '-' }} &bull; {{ form.uomName || '-' }}</span>
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

        <!-- PIC Pemilik Stok -->
        <FormField
          v-if="canChoosePic"
          label="PIC Pemilik Stok"
          label-width="160px"
          type="searchable-select"
          master="employees"
          v-model="form.employeeId"
          :disabled="isSubmitting"
          :initial-option="initialPicOption"
          placeholder="Pilih PIC (Kosongkan untuk Stok Umum)..."
          search-placeholder="Cari nama karyawan..."
          :clearable="true"
        />
        <FormField v-else label="PIC Pemilik Stok" label-width="160px">
          <div class="flex items-center justify-between w-full py-1">
            <span class="text-sm font-semibold text-text-active">{{ displayPicName }}</span>
            <span class="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-[11px] font-bold select-none">
              {{ isEdit ? 'Terkunci' : 'Otomatis' }}
            </span>
          </div>
        </FormField>
      </FormSection>

      <!-- Section: Kuantitas & Nilai Stok -->
      <FormSection title="Kuantitas & Nilai Stok" :cols="1">
        <!-- Jenis Stok (Valued vs Return) -->
        <FormField label="Jenis Stok" label-width="160px" :required="true">
          <div v-if="isEdit" class="flex items-center py-1">
            <span class="text-sm font-semibold text-text-active">
              {{ form.isValued ? 'Stok Bernilai (Valued)' : 'Stok Return (Unvalued)' }}
            </span>
            <span class="ml-2 text-xs text-text-muted italic">(Jenis stok tidak dapat diubah)</span>
          </div>
          <div v-else class="relative w-full flex items-center">
            <select
              v-model="form.isValued"
              :disabled="isSubmitting"
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active appearance-none cursor-pointer focus:ring-0"
            >
              <option :value="true" class="bg-white dark:bg-gray-900 text-text-active">Stok Bernilai (Memiliki Unit Cost)</option>
              <option :value="false" class="bg-white dark:bg-gray-900 text-text-active">Stok Return (Rp 0 / Unvalued)</option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>

        <!-- Stok Awal (QTY First) -->
        <FormField label="Stok Awal (Qty)" label-width="160px" :required="true">
          <div class="flex flex-col gap-1 w-full">
            <input
              v-model.number="form.qtyFirst"
              type="number"
              step="any"
              :min="minQtyFirst"
              :disabled="isSubmitting"
              placeholder="0"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active placeholder:text-text-placeholder focus:ring-0"
              required
            />
            <!-- Proyeksi stok saat mode edit -->
            <div v-if="isEdit" class="text-[11px] font-mono leading-tight" :class="projectedQtyCurrent < 0 ? 'text-red-500 font-bold' : 'text-text-muted'">
              Masuk: {{ form.qtyIn }} &bull; Keluar: {{ form.qtyOut }} &rarr; Sisa Terkini:
              <strong :class="projectedQtyCurrent < 0 ? 'text-red-600 font-extrabold' : 'text-text-active'">{{ projectedQtyCurrent }}</strong>
              <span v-if="projectedQtyCurrent < 0" class="text-red-500 font-medium"> (Stok tidak boleh bernilai negatif)</span>
            </div>
          </div>
        </FormField>

        <!-- Harga Satuan (Unit Cost) -->
        <FormField label="Harga Satuan (IDR)" label-width="160px" :required="form.isValued">
          <div class="flex items-center gap-2 w-full">
            <span class="text-xs font-mono font-bold text-text-muted select-none">Rp</span>
            <input
              v-model="displayUnitCost"
              :disabled="!form.isValued || isSubmitting"
              type="text"
              placeholder="0"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active placeholder:text-text-placeholder focus:ring-0 disabled:text-text-muted disabled:cursor-not-allowed"
            />
          </div>
        </FormField>
      </FormSection>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import { DollarSign, PackageX, ChevronDown } from 'lucide-vue-next';
import { useMarketingStockStore } from '../marketingStock.store';
import { MarketingStockService } from '../marketingStock.service';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { Alert } from '@/plugins/sweetalert';
import { formatThousand, parseThousand } from '@/utils/format';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  stockId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useMarketingStockStore();
const authStore = useAuthStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.stockId);
const isSubmitting = ref(false);

const isSuperAdmin = computed(() => {
  return authStore.user?.is_superadmin === true || authStore.user?.isAdmin === true;
});

const canChoosePic = computed(() => isSuperAdmin.value);

const currentEmployeeId = computed(() => authStore.user?.employeeId || authStore.user?.employee_id || '');
const currentEmployeeName = computed(
  () => authStore.user?.employee?.full_name || authStore.user?.displayName || authStore.user?.full_name || ''
);

const displayPicName = computed(() => {
  if (form.picName) return form.picName;
  return currentEmployeeName.value || 'PIC Otomatis';
});

const initialPicOption = computed(() => {
  if (!form.employeeId) return null;
  if (form.picName) return { value: form.employeeId, label: form.picName };
  return null;
});

const defaultFormData = () => ({
  goodId: '',
  locationId: '',
  employeeId: '',
  goodName: '',
  goodCode: '',
  locationName: '',
  picName: '',
  uomName: '',
  isValued: true,
  qtyFirst: 0,
  unitCost: 0,
  qtyIn: 0,
  qtyOut: 0,
});

const form = reactive(defaultFormData());

const displayUnitCost = computed({
  get: () => formatThousand(form.unitCost),
  set: (val) => {
    form.unitCost = parseThousand(val);
  },
});

// Rumus backend: qty_current = qty_first + qty_in - qty_out
const projectedQtyCurrent = computed(() => (Number(form.qtyFirst) || 0) + Number(form.qtyIn) - Number(form.qtyOut));
const minQtyFirst = computed(() => (isEdit.value ? Math.max(0, Number(form.qtyOut) - Number(form.qtyIn)) : 0));

const isFormValid = computed(() => {
  if (!isEdit.value && !form.goodId) return false;
  if (!form.locationId) return false;
  if (isEdit.value && projectedQtyCurrent.value < 0) return false;
  return true;
});

const initData = async (id) => {
  isSubmitting.value = true;
  try {

    if (id) {
      const data = await MarketingStockService.getDetailForForm(id);
      if (data) {
        Object.assign(form, {
          goodId: data.goodId || '',
          locationId: data.locationId || '',
          employeeId: data.employeeId || '',
          goodName: data.goodName || '',
          goodCode: data.goodCode || '',
          locationName: data.locationName || '',
          picName: data.picName || '',
          uomName: data.uomName || '',
          isValued: data.isValued !== false,
          qtyFirst: data.qtyFirst || 0,
          unitCost: data.unitCost || 0,
          qtyIn: data.qtyIn || 0,
          qtyOut: data.qtyOut || 0,
        });

        if (!canChoosePic.value && !form.employeeId && currentEmployeeId.value) {
          form.employeeId = currentEmployeeId.value;
        }
      }
    } else {
      Object.assign(form, defaultFormData());
      if (!canChoosePic.value && currentEmployeeId.value) {
        form.employeeId = currentEmployeeId.value;
      }
    }
  } catch (error) {
    console.error('MarketingStockFormModal: Failed to init', error);
    if (id) {
      Alert.error('Gagal', 'Data stok marketing tidak ditemukan.');
      handleClose();
    }
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => [props.modelValue, props.stockId],
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

  if (!canChoosePic.value && !isEdit.value && currentEmployeeId.value) {
    form.employeeId = currentEmployeeId.value;
  }

  if (!form.isValued) {
    form.unitCost = 0;
  }

  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      if (projectedQtyCurrent.value < 0) {
        Alert.error('Validasi Gagal', `Stok awal terlalu kecil — sisa stok akan menjadi ${projectedQtyCurrent.value} (negatif).`);
        return;
      }
      await store.updateStock(props.stockId, form);
      Alert.toast('Record stok marketing berhasil diperbarui', 'success');
    } else {
      const result = await store.createStock(form);
      if (result?._note) {
        Alert.toast(result._note, 'info');
      } else {
        Alert.toast('Record stok marketing berhasil dibuat', 'success');
      }
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('MarketingStockFormModal: Submit error', error);
    const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
    Alert.error('Gagal Menyimpan', msg);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

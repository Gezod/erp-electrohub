<template>
  <AppForm
    v-model="isOpen"
    :title="isEditMode ? 'Edit Master SKU & Harga' : 'Tambah Master SKU Baru'"
    :subtitle="isEditMode ? `Kode SKU: ${form.code || '#' + skuId}` : 'Formulir master SKU barang dan parameter rantai pasok (Supply Chain)'"
    :is-modal="true"
    max-width="max-w-[700px]"
    :loading="isSubmitting"
    :submit-label="isEditMode ? 'Simpan Perubahan' : 'Simpan Data'"
    cancel-label="Batal"
    :disabled="!isFormComplete"
    @submit="onSubmit"
    @close="handleClose"
  >
    <!-- Warning Banner: MOQ Changed (Business Rule FR-B1.3) -->
    <div
      v-if="isEditMode && moqChanged"
      class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-md flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 mb-2 animate-in fade-in duration-200"
    >
      <Info class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div class="flex flex-col gap-0.5">
        <span class="font-semibold text-amber-900 dark:text-amber-200">Perhatian Perubahan MOQ (FR-B1.3)</span>
        <span>
          Perubahan nilai MOQ dari <strong class="font-mono font-bold">{{ originalMoq }}</strong> menjadi <strong class="font-mono font-bold">{{ form.moq }}</strong> berlaku efektif untuk perhitungan order berikutnya. PO atau pengajuan yang sudah ada tidak berubah (histori tetap).
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <!-- Section 1: Informasi Utama SKU -->
      <FormSection title="Informasi Utama SKU" :cols="1">
        <!-- Kode SKU -->
        <FormField label="Kode SKU" label-width="160px" :required="true">
          <div class="flex flex-col gap-1 w-full">
            <input
              v-model="form.code"
              type="text"
              maxlength="40"
              :disabled="isSubmitting"
              placeholder="mis. SKU-ALK-001"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-bold uppercase text-text-active placeholder:text-text-placeholder focus:ring-0"
              required
              @blur="normalizeCode"
            />
            <p v-if="codeChanged" class="text-[11px] text-amber-600 dark:text-amber-500 italic leading-tight">
              Kode diubah dari
              <span class="font-mono font-semibold">{{ originalCode }}</span>.
              Pastikan konsistensi referensi data transaksi.
            </p>
          </div>
        </FormField>

        <!-- Nama SKU -->
        <FormField label="Nama SKU" label-width="160px" :required="true">
          <input
            v-model="form.name"
            type="text"
            maxlength="150"
            :disabled="isSubmitting"
            placeholder="mis. Alkohol 70% 1L, Botol Kemasan 500ml..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            required
          />
        </FormField>

        <!-- Tipe SKU -->
        <FormField label="Tipe SKU" label-width="160px" :required="true">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.tipe_sku"
              :disabled="isSubmitting"
              required
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer focus:ring-0"
              @change="handleTipeChange"
            >
              <option value="raw_material" class="bg-white dark:bg-gray-900 text-text-active">
                Bahan Baku (Raw Material)
              </option>
              <option value="finished_good" class="bg-white dark:bg-gray-900 text-text-active">
                Barang Jadi (Finished Good)
              </option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>

        <!-- Kategori SKU -->
        <FormField
          label="Kategori SKU"
          label-width="160px"
          type="searchable-select"
          master="sc-categories"
          v-model="form.category_id"
          :initial-option="initialCategoryOption"
          :disabled="isSubmitting"
          placeholder="Pilih kategori SKU..."
          search-placeholder="Cari nama atau kode kategori..."
          :clearable="true"
        />

        <!--
          Supplier & Kelompok Toko — DISEMBUNYIKAN (setara display:none).
          Aman disembunyikan: field ini TIDAK termasuk syarat wajib di
          `isFormComplete` (FR-B1.1), jadi submit form tetap normal.
          form.supplier_id / form.kelompok_toko_id tetap default null di
          defaultFormData() dan tetap terkirim sebagai null ke backend.
          Untuk mengaktifkan lagi: kembalikan v-if Supplier ke
          `form.tipe_sku !== 'finished_good'`, dan hapus v-if="false" di
          Kelompok Toko.
        -->

        <!-- Supplier (Hanya untuk Bahan Baku / Bukan Barang Jadi) -->
        <FormField
          v-if="false"
          label="Supplier"
          label-width="160px"
          type="searchable-select"
          :load-options="searchSuppliers"
          v-model="form.supplier_id"
          :initial-option="initialSupplierOption"
          :disabled="isSubmitting"
          placeholder="Pilih supplier / pemasok..."
          search-placeholder="Cari nama supplier..."
          :clearable="true"
        />

        <!-- Info bila Tipe Finished Good -->
        <!-- <div
          v-else
          class="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 px-3 py-2 rounded-md flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300"
        >
          <Info class="w-4 h-4 text-blue-500 shrink-0" />
          <span>SKU Barang Jadi diasumsikan merupakan hasil produksi sendiri, data supplier tidak diperlukan.</span>
        </div> -->
      </FormSection>

      <!-- Section 2: Parameter Inventory & Supply Chain -->
      <FormSection title="Parameter Lead Time & Order (Supply Chain)" :cols="2">
        <!-- MOQ (Wajib) -->
        <FormField label="MOQ (Kelipatan)" :required="true" :col-span="1">
          <div class="flex items-center gap-2 w-full">
            <input
              v-model.number="form.moq"
              type="number"
              min="1"
              step="1"
              :disabled="isSubmitting"
              placeholder="1"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-semibold text-text-active placeholder:text-text-placeholder focus:ring-0"
              required
            />
            <span class="text-xs text-text-muted shrink-0 font-medium">unit</span>
          </div>
        </FormField>

        <!-- MOQ Effective Date (FR-B1.3 — wajib diisi jika MOQ berubah) -->
        <!-- MOQ Effective Date (FR-B1.3 — otomatis, tidak input manual) -->
          <FormField
            label="Tanggal Berlaku MOQ"
            :col-span="1"
          >
            <div class="flex flex-col gap-0.5 w-full">
              <p class="text-sm font-medium text-text-active">
                {{ displayMoqEffectiveDate || 'Akan terisi otomatis saat disimpan' }}
              </p>
            </div>
          </FormField>

        <!-- Harga Unit -->
        <FormField label="Harga Unit (Rp)" :col-span="1">
          <div class="flex items-center gap-2 w-full">
            <span class="text-xs font-semibold text-text-muted shrink-0">Rp</span>
            <input
              v-model.number="form.harga_unit"
              type="number"
              min="0"
              step="100"
              :disabled="isSubmitting"
              placeholder="0"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
          </div>
        </FormField>

        <!-- Lead Time (Hari) -->
        <FormField label="Lead Time" :col-span="1">
          <div class="flex items-center gap-2 w-full">
            <input
              v-model.number="form.lead_time_days"
              type="number"
              min="0"
              step="0.01"
              :disabled="isSubmitting"
              placeholder="mis. 11"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
            <span class="text-xs text-text-muted shrink-0 font-medium">hari</span>
          </div>
        </FormField>

        <!-- Review Period (Hari) -->
        <FormField label="Review Period" :col-span="1">
          <div class="flex items-center gap-2 w-full">
            <input
              v-model.number="form.review_period_days"
              type="number"
              min="0"
              step="0.01"
              :disabled="isSubmitting"
              placeholder="mis. 14"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
            <span class="text-xs text-text-muted shrink-0 font-medium">hari</span>
          </div>
        </FormField>

        <!-- Buffer Default (Hari) -->
        <FormField label="Buffer Default" :col-span="1">
          <div class="flex items-center gap-2 w-full">
            <input
              v-model.number="form.buffer_default_days"
              type="number"
              min="0"
              step="0.01"
              :disabled="isSubmitting"
              placeholder="mis. 4"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
            <span class="text-xs text-text-muted shrink-0 font-medium">hari</span>
          </div>
        </FormField>

        <!-- Extra Buffer (Hari) -->
        <FormField label="Extra Buffer" :col-span="1">
          <div class="flex items-center gap-2 w-full">
            <input
              v-model.number="form.extra_buffer_days"
              type="number"
              min="0"
              step="0.01"
              :disabled="isSubmitting"
              placeholder="default 0"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
            />
            <span class="text-xs text-text-muted shrink-0 font-medium">hari</span>
          </div>
        </FormField>
      </FormSection>

      <!-- Section 3: Sasaran Toko & Status -->
      <FormSection title="Distribusi & Status" :cols="1">
        <!-- Kelompok Toko Target -->
        <FormField
          v-if="false"
          label="Kelompok Toko"
          label-width="160px"
          type="searchable-select"
          :load-options="searchStoreGroups"
          v-model="form.kelompok_toko_id"
          :initial-option="initialStoreGroupOption"
          :disabled="isSubmitting"
          placeholder="Pilih kelompok toko..."
          search-placeholder="Cari nama kelompok toko..."
          :clearable="true"
        />

        <!-- Status SKU — bind ke is_active (boolean dari API) -->
        <FormField label="Status SKU" label-width="160px" :required="true">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.is_active"
              :disabled="isSubmitting"
              required
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder appearance-none cursor-pointer focus:ring-0"
            >
              <option :value="true" class="bg-white dark:bg-gray-900 text-text-active">
                Aktif (Diikutsertakan dalam Analisis & Order)
              </option>
              <option :value="false" class="bg-white dark:bg-gray-900 text-text-active">
                Nonaktif (Dikecualikan dari Analisis)
              </option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>
      </FormSection>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import { ChevronDown, Info } from 'lucide-vue-next';
import { useScSkuStore } from '../scSku.store';
import { ScSkuService } from '../scSku.service';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  skuId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useScSkuStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const isEditMode = computed(() => !!props.skuId);
const isSubmitting = ref(false);

const skuDetail = ref(null);
const originalCode = ref('');
const originalMoq = ref(1);

// Tanggal maksimum untuk MOQ effective date (hari ini)
const maxMoqDate = computed(() => new Date().toISOString().split('T')[0]);

const defaultFormData = () => ({
  code: '',
  name: '',
  category_id: null,
  tipe_sku: 'raw_material',
  is_active: true,
  supplier_id: null,
  lead_time_days: null,
  review_period_days: null,
  buffer_default_days: null,
  extra_buffer_days: 0,
  moq: 1,
  moq_effective_date: new Date().toISOString().split('T')[0],
  harga_unit: null,
  kelompok_toko_id: null,
});

const form = reactive(defaultFormData());

const normalizeCode = () => {
  form.code = (form.code || '').trim().toUpperCase().replace(/\s+/g, '-');
};

const codeChanged = computed(() =>
  isEditMode.value &&
  !!originalCode.value &&
  form.code?.trim().toUpperCase() !== originalCode.value
);

const moqChanged = computed(() =>
  isEditMode.value &&
  originalMoq.value !== null &&
  Number(form.moq) !== Number(originalMoq.value)
);
const displayMoqEffectiveDate = computed(() => {
  if (!form.moq_effective_date) return '';
  const [y, m, d] = form.moq_effective_date.split('-');
  return `${d}-${m}-${y}`;
});

const handleTipeChange = () => {
  if (form.tipe_sku === 'finished_good') {
    form.supplier_id = null;
  }
};

// --- Initial Options for Edit Mode (Searchable Select Pre-population) ---
const initialCategoryOption = computed(() => {
  if (!form.category_id) return null;
  const cat = skuDetail.value?.category || skuDetail.value?.sc_category_sku;
  if (cat?.name) {
    return {
      value: form.category_id,
      label: cat.code ? `${cat.name} (${cat.code})` : cat.name
    };
  }
  if (skuDetail.value?.category_name) {
    return {
      value: form.category_id,
      label: skuDetail.value.category_name
    };
  }
  return null;
});

const initialSupplierOption = computed(() => {
  if (!form.supplier_id) return null;
  const sup = skuDetail.value?.supplier || skuDetail.value?.suppliers;
  if (sup?.name) {
    return {
      value: form.supplier_id,
      label: sup.name
    };
  }
  if (skuDetail.value?.supplier_name) {
    return {
      value: form.supplier_id,
      label: skuDetail.value.supplier_name
    };
  }
  return null;
});

const initialStoreGroupOption = computed(() => {
  if (!form.kelompok_toko_id) return null;
  const grp = skuDetail.value?.kelompok_toko || skuDetail.value?.store_group;
  if (grp?.name) {
    return {
      value: form.kelompok_toko_id,
      label: grp.name
    };
  }
  if (skuDetail.value?.kelompok_toko_name) {
    return {
      value: form.kelompok_toko_id,
      label: skuDetail.value.kelompok_toko_name
    };
  }
  return null;
});

// --- Dynamic Async Loaders ---
const searchSuppliers = async (query = '', filters = {}) => {
  try {
    const res = await ScSkuService.getSuppliers({ search: query, limit: 20, ...filters });
    const list = Array.isArray(res) ? res : (res?.data || []);
    return list.map((item) => ({
      id: item.id,
      value: item.id,
      label: item.name || item.supplier_name || 'Supplier #' + item.id
    }));
  } catch {
    return [];
  }
};

const searchStoreGroups = async (query = '', filters = {}) => {
  try {
    const res = await ScSkuService.getStoreGroups({ search: query, limit: 20, ...filters });
    const list = Array.isArray(res) ? res : (res?.data || []);
    return list.map((item) => ({
      id: item.id,
      value: item.id,
      label: item.name || item.group_name || 'Kelompok #' + item.id
    }));
  } catch {
    return [];
  }
};

// --- Form Completeness Validation (FR-B1.1) ---
const isFormComplete = computed(() => {
  if (!form.code?.trim()) return false;
  if (!form.name?.trim()) return false;
  if (!form.tipe_sku) return false;
  if (form.moq === null || form.moq === '' || Number(form.moq) < 1) return false;

  // Numeric fields non-negative check
  if (form.lead_time_days !== null && form.lead_time_days !== '' && Number(form.lead_time_days) < 0) return false;
  if (form.review_period_days !== null && form.review_period_days !== '' && Number(form.review_period_days) < 0) return false;
  if (form.buffer_default_days !== null && form.buffer_default_days !== '' && Number(form.buffer_default_days) < 0) return false;
  if (form.extra_buffer_days !== null && form.extra_buffer_days !== '' && Number(form.extra_buffer_days) < 0) return false;
  if (form.harga_unit !== null && form.harga_unit !== '' && Number(form.harga_unit) < 0) return false;

  return true;
});

const initData = async (id) => {
  isSubmitting.value = true;
  try {
    if (id) {
      // fetchSkuById mengembalikan data RAW dari API (sebelum mapping), atau
      // data yang sudah di-map oleh toUIDetail. Store.fetchSkuById → fetchDetail → toUIDetail
      const data = await store.fetchSkuById(id);
      if (data) {
        // data sudah dalam format camelCase (output toUIDetail)
        skuDetail.value = store.detail; // simpan raw API response untuk initial options
        originalCode.value = (data.code || '').toUpperCase();
        originalMoq.value = data.moq !== undefined && data.moq !== null ? Number(data.moq) : 1;

        Object.assign(form, {
          code: data.code || '',
          name: data.name || '',
          category_id: data.categoryId || null,
          tipe_sku: data.tipeSku || 'raw_material',
          is_active: typeof data.isActive === 'boolean' ? data.isActive : true,
          supplier_id: data.supplierId || null,
          lead_time_days: data.leadTimeDays ?? null,
          review_period_days: data.reviewPeriodDays ?? null,
          buffer_default_days: data.bufferDefaultDays ?? null,
          extra_buffer_days: data.extraBufferDays ?? 0,
          moq: data.moq ?? 1,
          moq_effective_date: data.moqEffectiveDate || new Date().toISOString().split('T')[0],
          harga_unit: data.hargaUnit ?? null,
          kelompok_toko_id: data.kelompokTokoId ?? null,
        });

        // Simpan raw category/supplier/store-group dari store.detail untuk initial options
        if (store.detail) {
          skuDetail.value = {
            ...store.detail,
            category: store.detail.category,
            supplier: store.detail.supplier,
            kelompok_toko: store.detail.kelompokToko,
            category_name: store.detail.categoryName,
            supplier_name: store.detail.supplierName,
            kelompok_toko_name: store.detail.kelompokTokoName,
          };
        }
      }
    } else {
      skuDetail.value = null;
      originalCode.value = '';
      originalMoq.value = 1;
      Object.assign(form, defaultFormData());
    }
  } catch (error) {
    console.error('ScSkuFormModal: Init failed', error);
    if (id) {
      Alert.error('Gagal', 'Data Master SKU tidak ditemukan.');
      handleClose();
    }
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => [props.modelValue, props.skuId],
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

const onSubmit = async () => {
  normalizeCode();

  if (!form.code) {
    Alert.error('Validasi Gagal', 'Kode SKU tidak boleh kosong.');
    return;
  }

  if (!form.name) {
    Alert.error('Validasi Gagal', 'Nama SKU tidak boleh kosong.');
    return;
  }

  if (Number(form.moq) < 1) {
    Alert.error('Validasi Gagal', 'MOQ minimal bernilai 1.');
    return;
  }
  if (!isEditMode.value || moqChanged.value) {
  form.moq_effective_date = new Date().toISOString().split('T')[0];
  }


  // Konfirmasi perubahan kode SKU
  if (codeChanged.value) {
    const isConfirmed = await Alert.confirm(
      'Ubah Kode SKU?',
      `Kode SKU akan diubah dari "${originalCode.value}" menjadi "${form.code}". Pastikan tidak ada sistem operasional yang terganggu.`
    );
    if (!isConfirmed) return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      await store.updateSku(props.skuId, form);
      Alert.toast('Data SKU berhasil diperbarui', 'success');
    } else {
      await store.createSku(form);
      Alert.toast('Master SKU baru berhasil ditambahkan', 'success');
    }
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit SKU error:', error);
    const msg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data SKU.';
    Alert.error('Gagal Menyimpan', msg);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

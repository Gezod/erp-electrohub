<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Update Mutasi' : 'Buat Mutasi Baru'"
    :subtitle="'Formulir mutasi aset inventaris dan perpindahan stok barang'"
    :is-modal="true"
    max-width="max-w-[760px]"
    :loading="isSubmitting"
    :show-cancel="false"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">

      <!-- â”€â”€ Tab Switcher (Mutasi Aset vs Mutasi Stok) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
      <div v-if="!isEdit" class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md w-fit">
        <button
          type="button"
          @click="handleTypeChange('asset')"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all duration-200 border whitespace-nowrap cursor-pointer',
            form.type === 'asset'
              ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
              : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
          ]"
        >
          <Box class="w-3.5 h-3.5" />
          <span>Mutasi Aset</span>
        </button>
        <button
          type="button"
          @click="handleTypeChange('stock')"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all duration-200 border whitespace-nowrap cursor-pointer',
            form.type === 'stock'
              ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
              : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
          ]"
        >
          <Package class="w-3.5 h-3.5" />
          <span>Mutasi Stok</span>
        </button>
      </div>

      <!-- â”€â”€ Section 1: Item Selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
      <FormSection :title="form.type === 'asset' ? 'Pilih Aset' : 'Pilih Barang Stok'" :cols="2">
        <!-- Asset Selector -->
        <FormField
          v-if="form.type === 'asset'"
          label="Cari Aset"
          label-width="115px"
          type="searchable-select"
          :load-options="searchAssets"
          :initial-option="initialAssetOption"
          v-model="form.assetId"
          :disabled="isEdit"
          placeholder="Cari kode / nama aset..."
          search-placeholder="Cari aset..."
          :clearable="true"
          :required="true"
          :col-span="2"
          @select="onAssetSelected"
        />

        <!-- Stock Selector -->
        <FormField
          v-if="form.type === 'stock'"
          label="Cari Barang"
          label-width="115px"
          type="searchable-select"
          :load-options="searchStocks"
          :initial-option="initialStockOption"
          v-model="form.goodId"
          :disabled="isEdit"
          placeholder="Cari kode / nama barang..."
          search-placeholder="Cari barang..."
          :clearable="true"
          :required="true"
          :col-span="2"
          @select="onStockSelected"
        />

        <!-- Qty & Satuan for Stock -->
        <FormField
          v-if="form.type === 'stock'"
          label="Jumlah Mutasi"
          label-width="115px"
          type="number"
          :min="1"
          v-model="form.qty"
          placeholder="1"
          :required="true"
        />

        <FormField
          v-if="form.type === 'stock'"
          label="Satuan & Bucket"
          label-width="115px"
        >
          <div class="flex items-center gap-2 text-sm text-text-active font-medium py-0.5">
            <span>{{ selectedStockItem?.uomName || '-' }}</span>
            <span
              v-if="form.goodId"
              :class="[
                'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                form.fromTipe && form.fromTipe !== 'biasa'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              ]"
            >
              {{ STOCK_TYPE_LABEL[form.fromTipe] || 'Stok Biasa' }}
            </span>
          </div>
        </FormField>
      </FormSection>

      <!-- â”€â”€ Section 2: Origin & Destination Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Asal (Origin) -->
        <FormSection title="Asal (Origin)" :cols="1">
          <FormField label="Lokasi Asal" label-width="115px" :required="true">
            <template v-if="form.type === 'asset' || isEdit">
              <input
                :value="fromLocationDisplay"
                disabled
                class="w-full bg-transparent border-0 p-0 outline-none text-text-muted text-sm cursor-not-allowed"
              />
            </template>
            <template v-else>
              <SearchableSelect
                v-model="form.fromLocationId"
                master="locations"
                variant="seamless"
                placeholder="Pilih lokasi asal..."
                search-placeholder="Cari lokasi..."
              />
            </template>
          </FormField>

          <FormField label="PIC Asal" label-width="115px" :required="true">
            <template v-if="form.type === 'asset' || isEdit || (!isSuperAdmin && !isAdmin)">
              <input
                :value="fromPicDisplay"
                disabled
                class="w-full bg-transparent border-0 p-0 outline-none text-text-muted text-sm cursor-not-allowed"
              />
            </template>
            <template v-else>
              <SearchableSelect
                v-model="form.fromPicId"
                master="employees"
                variant="seamless"
                placeholder="Pilih PIC asal..."
                search-placeholder="Cari PIC..."
              />
            </template>
          </FormField>

          <FormField v-if="form.type === 'asset'" label="PJ Asal" label-width="115px">
            <input
              :value="fromPjDisplay"
              disabled
              class="w-full bg-transparent border-0 p-0 outline-none text-text-muted text-sm cursor-not-allowed"
            />
          </FormField>

          <FormField v-if="form.type === 'asset'" label="Divisi Asal" label-width="115px">
            <input
              :value="fromDivisionDisplay"
              disabled
              class="w-full bg-transparent border-0 p-0 outline-none text-text-muted text-sm cursor-not-allowed"
            />
          </FormField>
        </FormSection>

        <!-- Tujuan (Destination) -->
        <FormSection title="Tujuan (Destination)" :cols="1">
          <FormField
            label="Lokasi Tujuan"
            label-width="115px"
            type="searchable-select"
            master="locations"
            v-model="form.toLocationId"
            :disabled="isEdit"
            :required="true"
            placeholder="Pilih lokasi tujuan..."
            search-placeholder="Cari lokasi tujuan..."
          />

          <FormField
            label="PIC Tujuan"
            label-width="115px"
            type="searchable-select"
            master="employees"
            v-model="form.toPicId"
            :disabled="isEdit"
            :required="true"
            placeholder="Pilih PIC tujuan..."
            search-placeholder="Cari PIC tujuan..."
          />

          <FormField
            v-if="form.type === 'asset'"
            label="PJ Tujuan"
            label-width="115px"
            type="searchable-select"
            master="employees"
            v-model="form.toPjId"
            :disabled="isEdit"
            :required="true"
            placeholder="Pilih PJ tujuan..."
            search-placeholder="Cari PJ tujuan..."
          />

          <FormField
            v-if="form.type === 'asset'"
            label="Divisi Tujuan"
            label-width="115px"
            type="searchable-select"
            master="divisions"
            v-model="form.toDivisionId"
            :disabled="isEdit"
            placeholder="Pilih divisi tujuan (opsional)..."
            search-placeholder="Cari divisi..."
            :clearable="true"
          />
        </FormSection>
      </div>

      <!-- â”€â”€ Section 3: Detail & Penilaian â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
      <FormSection title="Detail & Penilaian" :cols="2">
        <FormField label="Pindah Beserta Nilai" :col-span="2">
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md w-fit">
              <button
                type="button"
                :disabled="isEdit"
                @click="form.isValued = true"
                :class="[
                  'px-3 py-1.5 rounded text-xs transition-all duration-200 border whitespace-nowrap cursor-pointer',
                  form.isValued
                    ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                    : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
                ]"
              >
                Ya (Bernilai)
              </button>
              <button
                type="button"
                :disabled="isEdit"
                @click="form.isValued = false"
                :class="[
                  'px-3 py-1.5 rounded text-xs transition-all duration-200 border whitespace-nowrap cursor-pointer',
                  !form.isValued
                    ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                    : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
                ]"
              >
                Tidak (Rp 0)
              </button>
            </div>
            <p class="text-xs text-text-muted">
              {{ form.isValued ? 'Unit cost dipindahkan dan memperbarui harga rata-rata di tujuan.' : 'Barang masuk sebagai stok Rp 0 tanpa mempengaruhi harga rata-rata tujuan.' }}
            </p>
          </div>
        </FormField>

        <FormField
          label="Tgl Mutasi"
          label-width="115px"
          type="date"
          v-model="form.transferDate"
          :disabled="isEdit"
          placeholder="Pilih tgl mutasi"
          :required="true"
          class="[&_input]:!py-0 [&_input]:!text-sm"
        />

        <FormField
          label="Keterangan"
          label-width="115px"
          type="textarea"
          :rows="2"
          height="h-[60px]"
          v-model="form.notes"
          :disabled="isEdit"
          placeholder="Tulis alasan perpindahan barang atau aset..."
          :col-span="2"
        />
      </FormSection>

    </div>

    <!-- â”€â”€ Custom Footer Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <template #footer-actions>
      <!-- Batal Button -->
      <button
        type="button"
        @click="handleClose"
        class="border border-border text-text-active px-4 rounded-md font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 flex items-center justify-center cursor-pointer"
      >
        Batal
      </button>

      <!-- Simpan Draft Button -->
      <button
        v-if="!isEdit"
        type="button"
        @click="handleSaveDraft"
        :disabled="isSubmitting || !isFormValid"
        class="border border-border text-text-active px-4 rounded-md font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95 h-10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileText class="w-4 h-4 text-text-muted" />
        <span>Simpan Draft</span>
      </button>

      <!-- Konfirmasi Mutasi Glossy Button -->
      <GlossyButton
        v-if="!isEdit"
        type="submit"
        :disabled="isSubmitting || !isFormValid"
        @click="handleSubmit"
      >
        <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin shrink-0" />
        <Check v-else class="w-4 h-4 shrink-0" />
        <span>Konfirmasi Mutasi</span>
      </GlossyButton>
    </template>
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
import { Box, Package, FileText, Check, Loader2 } from 'lucide-vue-next';
import { useAssetTransferStore } from '../asset-transfer.store';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { AssetService } from '@/modules/transaction/asset/asset.service';
import { StockService } from '@/modules/transaction/stock/stock.service';
import { StockMapper } from '@/modules/transaction/stock/stock.mapper';
import { STOCK_TYPE_LABEL } from '@/utils/stockType';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  transferId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const transferStore = useAssetTransferStore();
const authStore = useAuthStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isSubmitting = ref(false);
const isEdit = computed(() => !!props.transferId);

const isAdmin = computed(() => !!(authStore.user?.isAdmin || authStore.user?.is_admin));
const isSuperAdmin = computed(() => !!authStore.user?.is_superadmin);

const selectedAssetItem = ref(null);
const selectedStockItem = ref(null);

const fromLocationDisplay = ref('-');
const fromPicDisplay = ref('-');
const fromPjDisplay = ref('-');
const fromDivisionDisplay = ref('-');

const form = reactive({
  type: 'asset',
  assetId: '',
  goodId: '',
  fromLocationId: '',
  toLocationId: '',
  fromPicId: '',
  toPicId: '',
  toPjId: '',
  toDivisionId: '',
  qty: 1,
  isValued: true,
  fromTipe: 'biasa',
  transferDate: new Date().toISOString().split('T')[0],
  notes: '',
  status: 'completed',
});

const searchAssets = async (query = '') => {
  try {
    const res = await AssetService.getAll({ is_active: true, search: query.trim(), limit: 20 });
    return (res.data || []).map((a) => ({
      label: `${a.codeAsset || a.code_asset} - ${a.goodName || a.assetLabel || a.name} (Lokasi: ${a.locationName || a.location_name || '-'}, PIC: ${a.picName || a.pic_name || '-'})`,
      value: a.id,
      raw: a,
    }));
  } catch (error) {
    console.error('Failed to search assets:', error);
    return [];
  }
};

const searchStocks = async (query = '') => {
  try {
    const res = await StockService.getAll({ is_active: true, not_empty: 'true', search: query.trim(), limit: 20 });
    return (res.data || []).map(StockMapper.toUIList).map((s) => ({
      label: `${s.goodName} [${s.goodCode}] - Stok: ${s.qtyCurrent} ${s.uomName || ''} (Lokasi: ${s.locationName || '-'})`,
      value: s.id,
      raw: s,
    }));
  } catch (error) {
    console.error('Failed to search stocks:', error);
    return [];
  }
};

const initialAssetOption = computed(() => {
  if (!form.assetId) return null;
  return {
    value: form.assetId,
    label: selectedAssetItem.value?.codeAsset || selectedAssetItem.value?.goodName || form.assetId,
  };
});

const initialStockOption = computed(() => {
  if (!form.goodId) return null;
  return {
    value: form.goodId,
    label: selectedStockItem.value?.goodName || form.goodId,
  };
});

const isFormValid = computed(() => {
  if (form.type === 'asset') {
    return !!(form.assetId && form.fromLocationId && form.toLocationId && form.toPicId && form.toPjId);
  } else {
    return !!(form.goodId && form.fromLocationId && form.toLocationId && form.toPicId && form.qty > 0);
  }
});

const onAssetSelected = (item) => {
  const selected = item?.raw || item;
  selectedAssetItem.value = selected || null;

  if (selected && selected.id) {
    form.fromLocationId = selected.locationId || selected.location_id || '';
    fromLocationDisplay.value = selected.locationName || selected.location_name || '-';

    form.fromPicId = selected.picId || selected.pic_id || '';
    fromPicDisplay.value = selected.picName || selected.pic_name || 'Stok Umum';

    fromPjDisplay.value = selected.pjName || selected.pj_name || '-';
    fromDivisionDisplay.value = selected.divisionName || selected.division_name || '-';

    // Default Tujuan
    form.toPicId = selected.picId || selected.pic_id || '';
    form.toPjId = selected.pjId || selected.pj_id || '';
  } else {
    form.fromLocationId = '';
    form.fromPicId = '';
    fromLocationDisplay.value = '-';
    fromPicDisplay.value = '-';
    fromPjDisplay.value = '-';
    fromDivisionDisplay.value = '-';
  }
};

const onStockSelected = (item) => {
  const selected = item?.raw || item;
  selectedStockItem.value = selected || null;

  if (selected && selected.id) {
    form.fromLocationId = selected.locationId || selected.location_id || '';
    fromLocationDisplay.value = selected.locationName || selected.location_name || '-';

    form.fromPicId = selected.employeeId || selected.employee_id || '';
    fromPicDisplay.value = selected.picName || selected.pic_name || 'Stok Umum';

    form.fromTipe = selected.tipe || 'biasa';
  } else {
    form.fromLocationId = '';
    form.fromPicId = '';
    fromLocationDisplay.value = '-';
    fromPicDisplay.value = '-';
    form.isStokOpening = false;
  }
};

const handleTypeChange = (newType) => {
  form.type = newType;
  form.assetId = '';
  form.goodId = '';
  form.fromLocationId = '';
  form.toLocationId = '';
  form.fromPicId = '';
  form.toPicId = '';
  form.toPjId = '';
  form.toDivisionId = '';
  form.qty = 1;
  selectedAssetItem.value = null;
  selectedStockItem.value = null;
  fromLocationDisplay.value = '-';
  fromPicDisplay.value = '-';
  fromPjDisplay.value = '-';
  fromDivisionDisplay.value = '-';
};

const resetForm = () => {
  form.type = 'asset';
  form.assetId = '';
  form.goodId = '';
  form.fromLocationId = '';
  form.toLocationId = '';
  form.fromPicId = '';
  form.toPicId = '';
  form.toPjId = '';
  form.toDivisionId = '';
  form.qty = 1;
  form.isValued = true;
  form.fromTipe = 'biasa';
  form.transferDate = new Date().toISOString().split('T')[0];
  form.notes = '';
  form.status = 'completed';

  selectedAssetItem.value = null;
  selectedStockItem.value = null;
  fromLocationDisplay.value = '-';
  fromPicDisplay.value = '-';
  fromPjDisplay.value = '-';
  fromDivisionDisplay.value = '-';

  if (!isAdmin.value && !isSuperAdmin.value) {
    form.fromPicId = authStore.user?.employeeId || authStore.user?.employee_id || '';
    fromPicDisplay.value = authStore.user?.displayName || authStore.user?.fullName || '-';
  }
};

const loadDetail = async (id) => {
  try {
    const detail = await transferStore.fetchDetail(id);
    if (detail) {
      form.type = detail.assetId ? 'asset' : 'stock';
      form.assetId = detail.assetId || '';
      form.goodId = detail.goodId || '';
      form.fromLocationId = detail.fromLocationId || '';
      form.toLocationId = detail.toLocationId || '';
      form.fromPicId = detail.fromPicId || '';
      form.toPicId = detail.toPicId || '';
      form.toPjId = detail.toPjId || '';
      form.toDivisionId = detail.toDivisionId || '';
      form.qty = detail.qty || 1;
      form.isValued = detail.isValued;
      form.fromTipe = detail.tipe || 'biasa';
      form.transferDate = detail.transferDate || new Date().toISOString().split('T')[0];
      form.notes = detail.notes || '';

      fromLocationDisplay.value = detail.fromLocationName || '-';
      fromPicDisplay.value = detail.fromPicName || '-';
      fromPjDisplay.value = detail.fromPjName || '-';
      fromDivisionDisplay.value = detail.fromDivisionName || '-';

      if (detail.asset) {
        selectedAssetItem.value = {
          id: detail.assetId,
          codeAsset: detail.asset.codeAsset || detail.asset.code_asset,
          goodName: detail.asset.goodName || detail.asset.name,
        };
      }
      if (detail.good || detail.stock) {
        selectedStockItem.value = {
          id: detail.goodId,
          goodName: detail.good?.name || detail.stock?.goodName || detail.goodName,
          uomName: detail.uomName || detail.good?.uom?.name,
        };
      }
    }
  } catch (err) {
    Alert.error('Gagal', 'Data mutasi tidak ditemukan.');
    handleClose();
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      resetForm();
      if (props.transferId) {
        loadDetail(props.transferId);
      }
    }
  }
);

onMounted(() => {
  if (props.modelValue) {
    resetForm();
    if (props.transferId) {
      loadDetail(props.transferId);
    }
  }
});

const handleClose = () => {
  isOpen.value = false;
};

const handleSaveDraft = async () => {
  if (!isFormValid.value) {
    return Alert.error('Validasi', 'Mohon lengkapi semua field yang wajib diisi.');
  }
  isSubmitting.value = true;
  try {
    form.status = 'draft';
    await transferStore.createTransfer(form);
    Alert.success('Berhasil', 'Draft mutasi telah berhasil disimpan.');
    emit('saved');
    handleClose();
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Terjadi kesalahan sistem.');
  } finally {
    isSubmitting.value = false;
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    return Alert.error('Validasi', 'Mohon lengkapi semua field yang wajib diisi.');
  }
  isSubmitting.value = true;
  try {
    form.status = 'completed';
    if (isEdit.value) {
      Alert.error('Fitur Belum Didukung', 'Pengeditan mutasi secara langsung tidak diizinkan.');
    } else {
      await transferStore.createTransfer(form);
      Alert.success('Berhasil', 'Mutasi baru telah berhasil dibuat.');
      emit('saved');
      handleClose();
    }
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Terjadi kesalahan sistem.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>


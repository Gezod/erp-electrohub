<template>
  <AppForm
    v-model="isOpen"
    title="Buat Transfer Marketing"
    subtitle="Perpindahan persediaan stok & aset operasional marketing"
    :is-modal="true"
    max-width="max-w-[720px]"
    :loading="isSubmitting"
    submit-label="Buat Transfer"
    cancel-label="Batal"
    :disabled="!isFormValid"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Tab Switcher (Transfer Stok vs Transfer Aset) -->
      <div class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md w-fit">
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
          <span>Transfer Stok</span>
        </button>
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
          <span>Transfer Aset</span>
        </button>
      </div>

      <!-- Section 1: Item Selection -->
      <FormSection :title="form.type === 'asset' ? 'Pilih Aset Marketing' : 'Pilih Barang Stok Marketing'" :cols="1">
        <!-- Stock Selector -->
        <FormField
          v-if="form.type === 'stock'"
          label="Barang Stok"
          label-width="160px"
          type="searchable-select"
          :load-options="searchStocks"
          v-model="selectedStockId"
          :disabled="isSubmitting"
          placeholder="Pilih barang stok yang tersedia..."
          search-placeholder="Cari nama atau kode barang..."
          :clearable="true"
          :required="true"
          @select="onStockSelected"
        />

        <!-- Qty & Satuan for Stock -->
        <FormField
          v-if="form.type === 'stock' && selectedStock"
          label="Jumlah Transfer"
          label-width="160px"
          :required="true"
        >
          <div class="flex flex-col gap-1 w-full">
            <div class="flex items-center gap-2">
              <input
                v-model.number="form.qty"
                type="number"
                min="0.001"
                step="any"
                :max="selectedStock.qtyCurrent"
                :disabled="isSubmitting"
                placeholder="1"
                class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active focus:ring-0"
                required
              />
              <span class="text-xs font-semibold text-text-muted uppercase shrink-0">
                {{ selectedStock.uomName || 'Unit' }}
              </span>
            </div>
            <p
              class="text-[11px] font-medium leading-tight"
              :class="qtyExceedsStock ? 'text-red-500 font-bold' : 'text-text-muted'"
            >
              Stok tersedia di asal: <strong>{{ selectedStock.qtyCurrent }} {{ selectedStock.uomName }}</strong>
            </p>
          </div>
        </FormField>

        <!-- Asset Selector -->
        <FormField
          v-if="form.type === 'asset'"
          label="Aset Marketing"
          label-width="160px"
          type="searchable-select"
          :load-options="searchAssets"
          :initial-option="initialAssetOption"
          v-model="form.assetId"
          :disabled="isSubmitting"
          placeholder="Pilih aset yang tersedia..."
          search-placeholder="Cari kode atau nama aset..."
          :clearable="true"
          :required="true"
          @select="onAssetSelected"
        />
      </FormSection>

      <!-- Section 2: Rute Transfer (Asal & Tujuan) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Asal (Origin) -->
        <FormSection title="Asal (Origin)" :cols="1">
          <!-- Lokasi Asal (Read-only) -->
          <FormField label="Lokasi Asal" :required="true">
            <div class="py-1 w-full flex items-center min-w-0" :title="fromLocationName">
              <span class="text-sm font-semibold text-text-active break-words leading-snug">
                {{ fromLocationName || '-' }}
              </span>
            </div>
          </FormField>

          <!-- PIC Asal (Read-only) -->
          <FormField label="PIC Asal">
            <div class="py-1 w-full flex items-center min-w-0" :title="fromPicName">
              <span class="text-sm font-medium text-text-active break-words leading-snug">
                {{ fromPicName || '-' }}
              </span>
            </div>
          </FormField>
        </FormSection>

        <!-- Tujuan (Destination) -->
        <FormSection title="Tujuan (Destination)" :cols="1">
          <!-- Lokasi Tujuan -->
          <FormField
            label="Lokasi Tujuan"
            type="searchable-select"
            master="locations"
            v-model="form.toLocationId"
            :disabled="isSubmitting"
            :required="true"
            placeholder="Pilih lokasi tujuan..."
            search-placeholder="Cari lokasi tujuan..."
            :clearable="true"
          />

          <!-- PIC Tujuan -->
          <FormField
            label="PIC Tujuan"
            type="searchable-select"
            master="employees"
            v-model="form.toPicId"
            :disabled="isSubmitting"
            placeholder="Kosongkan untuk Stok Umum Lokasi"
            search-placeholder="Cari nama karyawan..."
            :clearable="true"
          />
        </FormSection>
      </div>

      <!-- Section 3: Informasi Transfer -->
      <FormSection title="Informasi & Catatan Transfer" :cols="1">
        <!-- Tanggal Transfer -->
        <FormField label="Tanggal Transfer" label-width="160px" :required="true">
          <DatePicker v-model="form.transferDate" placeholder="Pilih tanggal transfer" />
        </FormField>

        <!-- Catatan -->
        <FormField label="Catatan Transfer" label-width="160px">
          <textarea
            v-model="form.notes"
            rows="2"
            :disabled="isSubmitting"
            placeholder="Tulis alasan atau instruksi perpindahan barang/aset..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0 resize-none"
          ></textarea>
        </FormField>
      </FormSection>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import { Package, Box } from 'lucide-vue-next';
import { useMarketingTransferStore } from '../marketingTransfer.store';
import { MarketingStockService } from '@/modules/transaction/marketing-stock/marketingStock.service';
import { MarketingAssetService } from '@/modules/transaction/marketing-asset/marketingAsset.service';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  preselectAssetId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useMarketingTransferStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isSubmitting = ref(false);

const selectedStockId = ref(null);
const selectedStock = ref(null);
const selectedAsset = ref(null);

const todayISO = () => new Date().toISOString().split('T')[0];

const defaultFormData = () => ({
  type: 'stock',
  goodId: '',
  assetId: '',
  qty: 1,
  fromLocationId: '',
  toLocationId: '',
  fromPicId: null,
  toPicId: null,
  transferReason: 'normal',
  transferDate: todayISO(),
  notes: '',
});

const form = reactive(defaultFormData());

const searchStocks = async (query = '') => {
  try {
    const res = await MarketingStockService.getAll({ not_empty: 'true', search: query.trim(), limit: 20 });
    return (res.data || []).map((s) => ({
      label: `${s.goodName} (${s.goodCode || '-'}) • Sisa: ${s.qtyCurrent} ${s.uomName || ''} • Lokasi: ${s.locationName || '-'}`,
      value: s.id,
      raw: s,
    }));
  } catch (error) {
    console.error('Failed to search marketing stocks:', error);
    return [];
  }
};

const searchAssets = async (query = '') => {
  try {
    const res = await MarketingAssetService.getAll({ status: 'tersedia', search: query.trim(), limit: 20 });
    return (res.data || []).map((a) => ({
      label: `${a.goodName} (${a.codeAsset || '-'}) • PIC: ${a.picName || 'Stok Umum'} • Lokasi: ${a.locationName || '-'}`,
      value: a.id,
      raw: a,
    }));
  } catch (error) {
    console.error('Failed to search marketing assets:', error);
    return [];
  }
};

const initialAssetOption = computed(() => {
  if (!form.assetId) return null;
  if (selectedAsset.value) {
    return {
      value: form.assetId,
      label: `${selectedAsset.value.goodName || ''} (${selectedAsset.value.codeAsset || '-'})`,
    };
  }
  return null;
});

const fromLocationName = computed(() => {
  if (form.type === 'asset') return selectedAsset.value?.locationName || '';
  return selectedStock.value?.locationName || '';
});

const fromPicName = computed(() => {
  const item = form.type === 'asset' ? selectedAsset.value : selectedStock.value;
  if (!item) return '';
  return form.fromPicId ? item.picName : 'Stok Umum Lokasi';
});

const qtyExceedsStock = computed(
  () => !!selectedStock.value && Number(form.qty) > Number(selectedStock.value.qtyCurrent)
);

const isFormValid = computed(() => {
  if (!form.toLocationId || !form.transferDate) return false;
  if (form.type === 'asset') return !!form.assetId && !!form.fromLocationId;
  return !!form.goodId && !!form.fromLocationId && Number(form.qty) > 0 && !qtyExceedsStock.value;
});

const onStockSelected = (item) => {
  const s = item?.raw || item;
  if (s && s.id) {
    selectedStock.value = s;
    form.goodId = s.goodId;
    form.fromLocationId = s.locationId || '';
    form.fromPicId = s.employeeId || null;
  } else {
    selectedStock.value = null;
    form.goodId = '';
    form.fromLocationId = '';
    form.fromPicId = null;
  }
};

const onAssetSelected = (item) => {
  const a = item?.raw || item;
  if (a && a.id) {
    selectedAsset.value = a;
    form.fromLocationId = a.locationId || '';
    form.fromPicId = a.picId || null;
    form.qty = 1;
  } else {
    selectedAsset.value = null;
    form.fromLocationId = '';
    form.fromPicId = null;
  }
};

const handleTypeChange = (newType) => {
  form.type = newType;
  form.qty = 1;
  form.goodId = '';
  form.assetId = '';
  form.fromLocationId = '';
  form.fromPicId = null;
  selectedStockId.value = null;
  selectedStock.value = null;
  selectedAsset.value = null;
};

const resetForm = () => {
  Object.assign(form, defaultFormData());
  selectedStockId.value = null;
  selectedStock.value = null;
  selectedAsset.value = null;
};

const applyPreselectedAsset = async (assetId) => {
  try {
    const asset = await MarketingAssetService.getById(assetId);
    if (!asset) return;
    if (asset.status !== 'tersedia') {
      Alert.error('Tidak Bisa Ditransfer', `Aset berstatus '${asset.status}', hanya aset 'tersedia' yang bisa ditransfer.`);
      return;
    }
    form.type = 'asset';
    form.assetId = asset.id;
    selectedAsset.value = asset;
    form.fromLocationId = asset.locationId || '';
    form.fromPicId = asset.picId || null;
  } catch (err) {
    console.error('Failed to preselect asset', err);
  }
};

const initModal = async () => {
  resetForm();
  if (props.preselectAssetId) {
    await applyPreselectedAsset(props.preselectAssetId);
  }
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) initModal();
  }
);

onMounted(() => {
  if (props.modelValue) initModal();
});

const handleClose = () => {
  isOpen.value = false;
  emit('close');
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  try {
    await store.createTransfer(form);
    Alert.toast('Transfer berhasil dibuat. Silakan proses kirim dari detail.', 'success');
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('MarketingTransferFormModal: Submit error', error);
    const msg = error.response?.data?.message || 'Terjadi kesalahan saat membuat transfer.';
    Alert.error('Gagal Membuat Transfer', msg);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

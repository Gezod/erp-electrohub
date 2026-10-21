<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Update Data Aset' : 'Registrasi Aset Baru'"
    :is-modal="true"
    max-width="max-w-[640px]"
    :loading="assetStore.isLoading"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Daftarkan Aset'"
    @submit="handleSubmit"
    @close="close"
  >
    <!-- Section: PIC & Penanggung Jawab -->
    <FormSection title="PIC & Penanggung Jawab" :cols="2">
      <!-- PIC (Required) -->
      <FormField
        v-if="isSuperAdmin && !isEdit"
        label="PIC / Pengguna"
        label-width="120px"
        type="searchable-select"
        master="employees"
        v-model="form.picId"
        :initial-option="initialPicOption"
        :required="true"
        placeholder="Cari karyawan PIC..."
        search-placeholder="Cari nama karyawan..."
      />
      <FormField v-else label="PIC / Pengguna" label-width="120px" :required="true">
        <div class="flex items-center justify-between w-full">
          <span class="text-sm font-semibold text-text-active">{{ picDisplayName }}</span>
          <span v-if="!isSuperAdmin" class="bg-blue-50 dark:bg-indigo-950/20 text-blue-700 dark:text-brand-400 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 select-none">
            Otomatis
          </span>
        </div>
      </FormField>

      <!-- Penanggung Jawab (PJ) -->
      <FormField
        label="Penangung Jawab (PJ)"
        label-width="120px"
        type="searchable-select"
        master="employees"
        v-model="form.pjId"
        :clearable="true"
        placeholder="Pilih PJ (opsional)..."
        search-placeholder="Cari penanggung jawab..."
      />
    </FormSection>

    <!-- Section: Identitas & Klasifikasi Aset -->
    <FormSection title="Identitas & Klasifikasi Aset" :cols="2">
      <!-- Kode Aset -->
      <FormField
        label="Kode Aset"
        label-width="120px"
        v-model="form.codeAsset"
        :disabled="false"
        placeholder="Misal: AST-001"
      />

      <!-- Jenis Aset -->
      <FormField
        label="Jenis Aset"
        label-width="120px"
        type="searchable-select"
        master="asset-types"
        v-model="form.assetTypeId"
        :clearable="true"
        placeholder="Auto (dari kategori barang)"
        search-placeholder="Cari jenis aset..."
      />

      <!-- Barang (Stok) (Required) -->
      <FormField label="Barang (Stok)" label-width="120px" :required="true" :col-span="2">
        <template v-if="!isEdit">
          <SearchableSelect
            v-model="form.goodId"
            :load-options="searchPicStocks"
            :filters="{ employee_id: form.picId }"
            variant="seamless"
            :placeholder="!form.picId && isSuperAdmin ? 'Pilih PIC terlebih dahulu...' : 'Pilih atau cari barang stok...'"
            search-placeholder="Cari nama atau merk barang..."
            empty-text="Tidak ada stok barang ditemukan"
            :required="true"
            class="w-full"
            @select="(stock) => onStockSelected(stock)"
          />
        </template>
        <template v-else>
          <input
            :value="goodDisplayName"
            type="text"
            readonly
            disabled
            class="w-full bg-transparent border-0 p-0 text-sm font-semibold text-text-muted outline-none cursor-not-allowed"
          />
        </template>
      </FormField>

      <!-- Detail Informasi Barang Terpilih (Card Display) -->
      <div
        v-if="selectedStockObject"
        class="col-span-full p-3.5 bg-blue-50/50 dark:bg-indigo-950/20 border border-blue-200/80 dark:border-indigo-800/30 rounded-lg space-y-2.5 shadow-xs"
      >
        <div class="flex items-center justify-between border-b border-blue-200/60 dark:border-indigo-800/30 pb-2">
          <div class="flex items-center gap-2">
            <Package class="w-4 h-4 text-blue-600 dark:indigo-400" />
            <h4 class="font-bold text-xs uppercase tracking-wider text-blue-900 dark:text-indigo-300">
              Detail Barang Terpilih
            </h4>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              :class="[
                'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                (selectedStockObject.tipe || 'biasa') === 'biasa'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
              ]"
            >
              {{ STOCK_TYPE_LABEL[selectedStockObject.tipe] || 'Stok Biasa' }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div>
            <span class="text-[10px] text-text-muted uppercase block">Merek</span>
            <span class="font-semibold text-text-active">{{ selectedStockObject.good?.merk || selectedStockObject.merk || '-' }}</span>
          </div>
          <div>
            <span class="text-[10px] text-text-muted uppercase block">Kategori</span>
            <span class="font-semibold text-text-active">{{ selectedStockObject.good?.category?.name_category || selectedStockObject.category_name || '-' }}</span>
          </div>
          <div v-if="!isEdit">
            <span class="text-[10px] text-text-muted uppercase block">Stok Tersedia</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ selectedStockObject.qty_current ?? '-' }} Unit</span>
          </div>
        </div>
      </div>

      <!-- Lokasi Penempatan (Required) -->
      <FormField
        v-if="!isEdit"
        label="Lokasi"
        label-width="120px"
        type="searchable-select"
        master="locations"
        v-model="form.locationId"
        :required="true"
        placeholder="Pilih lokasi penempatan..."
        search-placeholder="Cari lokasi..."
      />
      <FormField v-else label="Lokasi" label-width="120px" :required="true">
        <input
          :value="locationDisplayName"
          type="text"
          readonly
          disabled
          class="w-full bg-transparent border-0 p-0 text-sm font-semibold text-text-muted outline-none cursor-not-allowed"
        />
      </FormField>

      <!-- Divisi -->
      <FormField
        label="Divisi"
        label-width="120px"
        type="searchable-select"
        master="divisions"
        v-model="form.divisionId"
        :clearable="true"
        placeholder="Pilih divisi (opsional)"
        search-placeholder="Cari divisi..."
      />
    </FormSection>

    <!-- Section: Perolehan & Nilai Aset -->
    <FormSection title="Perolehan & Nilai Aset" :cols="2">
      <!-- Tanggal Perolehan -->
      <FormField
        label="Tgl Perolehan"
        label-width="120px"
        type="date"
        v-model="form.dateAcquired"
        placeholder="Pilih tgl perolehan"
        class="[&_input]:!py-0 [&_input]:!text-sm"
      />

      <!-- Tanggal Penyerahan PJ -->
      <FormField
        label="Tgl Serah ke PJ"
        label-width="120px"
        type="date"
        v-model="form.handoverDate"
        placeholder="Pilih tgl penyerahan"
        class="[&_input]:!py-0 [&_input]:!text-sm"
      />

      <!-- Nilai Perolehan -->
      <FormField label="Nilai Perolehan" label-width="120px" :required="true">
        <div class="flex items-center gap-2 w-full">
          <span class="text-sm font-semibold text-text-muted select-none">IDR</span>
          <span class="text-border select-none">|</span>
          <input
            :value="formatDisplay(form.acquisitionCost)"
            @input="handleInput($event, 'acquisitionCost')"
            type="text"
            placeholder="0"
            class="w-full bg-transparent border-0 p-0 text-sm font-semibold text-text-active outline-none"
            required
          />
        </div>
      </FormField>

      <!-- Nilai Buku -->
      <FormField label="Nilai Buku" label-width="120px">
        <div class="flex items-center gap-2 w-full">
          <span class="text-sm font-semibold text-text-muted select-none">IDR</span>
          <span class="text-border select-none">|</span>
          <input
            :value="formatDisplay(form.bookValue)"
            @input="handleInput($event, 'bookValue')"
            type="text"
            placeholder="0"
            class="w-full bg-transparent border-0 p-0 text-sm font-semibold text-text-active outline-none"
          />
        </div>
      </FormField>
    </FormSection>

    <!-- Section: Status & Kondisi -->
    <FormSection title="Status & Kondisi" :cols="2">
      <!-- Kondisi -->
      <FormField
        label="Kondisi"
        label-width="120px"
        type="select"
        :options="conditionOptions"
        v-model="form.condition"
      />

      <!-- Status Aset -->
      <FormField
        label="Status Aset"
        label-width="120px"
        type="select"
        :options="activeOptions"
        v-model="form.isActive"
        :required="true"
      />

      <!-- Deskripsi -->
      <FormField
        label="Deskripsi"
        label-width="120px"
        type="textarea"
        :rows="2"
        height="h-[60px]"
        v-model="form.description"
        placeholder="Keterangan singkat tentang aset ini..."
        :col-span="2"
      />
    </FormSection>
  </AppForm>
</template>
<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import { Package } from 'lucide-vue-next';
import { useAssetStore } from '../asset.store';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { StockService } from '@/modules/transaction/stock/stock.service';
import { STOCK_TYPE_LABEL } from '@/utils/stockType';
import { Alert } from '@/plugins/sweetalert';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  assetId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const assetStore = useAssetStore();
const authStore = useAuthStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.assetId);
const isSuperAdmin = computed(() => {
  return authStore.user?.isAdmin === true || authStore.user?.is_superadmin === true;
});

const stockList = ref([]);
const picDisplayName = ref('');
const goodDisplayName = ref('');
const locationDisplayName = ref('');
const selectedStockObject = ref(null);

const conditionOptions = [
  { value: 'good', label: 'Good (Baik)' },
  { value: 'service', label: 'Service (Servis)' },
  { value: 'broken', label: 'Broken (Rusak)' },
  { value: 'sold', label: 'Sold (Terjual)' },
  { value: 'incorrect', label: 'Incorrect (Salah Input)' },
];

const activeOptions = [
  { value: true, label: 'Aktif' },
  { value: false, label: 'Tidak Aktif (Non-Aktif)' },
];

const initialPicOption = computed(() => {
  if (!form.picId) return null;
  if (picDisplayName.value) {
    return {
      value: form.picId,
      label: picDisplayName.value,
    };
  }
  return null;
});

const form = reactive({
  goodId: '',
  locationId: '',
  picId: '',
  pjId: '',
  divisionId: '',
  acquisitionCost: 0,
  bookValue: 0,
  codeAsset: '',
  assetTypeId: '',
  dateAcquired: new Date().toISOString().split('T')[0],
  handoverDate: '',
  condition: 'good',
  description: '',
  isActive: true,
});

const getEmployeeLabel = (e) => {
  if (!e) return '-';
  const pos = e.position?.name ? ` (${e.position.name})` : '';
  return `${e.fullName || e.name || e.employeeId}${pos}`;
};

const getStockLabel = (s) => {
  if (!s) return '-';
  const name = s.good?.good_name || s.goodName || '-';
  const merk = s.good?.merk || s.merk ? ` (${s.good?.merk || s.merk})` : '';
  const tipe = (s.tipe && s.tipe !== 'biasa') ? ` [${STOCK_TYPE_LABEL[s.tipe] || s.tipe}]` : '';
  const qty = s.qty_current != null ? ` - Sisa: ${s.qty_current}` : '';
  return `${name}${merk}${tipe}${qty}`;
};

const formatDisplay = (val) => {
  if (!val && val !== 0) return '';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const handleInput = (e, field) => {
  const rawValue = e.target.value.replace(/\D/g, '');
  const numericValue = parseInt(rawValue, 10) || 0;
  form[field] = numericValue;
  e.target.value = formatDisplay(numericValue);
};

const resetForm = () => {
  form.goodId = '';
  form.locationId = '';
  form.picId = '';
  form.pjId = '';
  form.divisionId = '';
  form.acquisitionCost = 0;
  form.bookValue = 0;
  form.codeAsset = '';
  form.assetTypeId = '';
  form.dateAcquired = new Date().toISOString().split('T')[0];
  form.handoverDate = '';
  form.condition = 'good';
  form.description = '';
  form.isActive = true;

  selectedStockObject.value = null;
  goodDisplayName.value = '';
  locationDisplayName.value = '';

  if (!isSuperAdmin.value && (authStore.user?.employee_id || authStore.user?.employeeId)) {
    form.picId = authStore.user.employee_id || authStore.user.employeeId;
    picDisplayName.value = authStore.user.full_name || authStore.user.displayName || 'PIC GA';
  } else {
    picDisplayName.value = '';
  }
};

const close = () => {
  isOpen.value = false;
};

const searchPicStocks = async (query) => {
  if (!form.picId) return [];
  try {
    const res = await StockService.getAll({
      employee_id: form.picId,
      not_empty: 'true',
      search: query,
      limit: 20,
    });
    const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    return raw.map((s) => ({
      ...s,
      id: s.id,
      value: s.id,
      label: getStockLabel(s),
    }));
  } catch (err) {
    console.error('AssetFormModal: Failed to search stocks', err);
    return [];
  }
};

const onStockSelected = (stock) => {
  selectedStockObject.value = stock;
  if (stock?.good?.category?.asset_type_id && !form.assetTypeId) {
    form.assetTypeId = stock.good.category.asset_type_id;
  }
};

watch(
  () => form.picId,
  () => {
    if (!isEdit.value) {
      form.goodId = '';
      selectedStockObject.value = null;
    }
  }
);

watch(
  () => form.goodId,
  (newGoodId) => {
    if (!newGoodId) {
      selectedStockObject.value = null;
      return;
    }
    const found = stockList.value.find((s) => s.id === newGoodId);
    if (found) {
      selectedStockObject.value = found;
    }
  }
);

const loadDetail = async () => {
  try {
    const detail = await assetStore.fetchDetail(props.assetId);
    if (detail) {
      Object.assign(form, detail);
      if (detail.good) {
        goodDisplayName.value = detail.good.good_name
          ? `${detail.good.good_name}${detail.good.merk ? ` (${detail.good.merk})` : ''}`
          : detail.goodName || '-';
        selectedStockObject.value = {
          id: detail.goodId || detail.good_id || detail.good.id,
          good: detail.good,
          goodName: detail.good.good_name,
          merk: detail.good.merk,
          goodCode: detail.good.good_code,
          category_name: detail.good.category?.name_category || detail.good.category_name || '-',
          qty_current: detail.stock?.qty_current ?? detail.qty ?? '-',
          tipe: detail.stock?.tipe || detail.tipe || 'biasa',
          location_name: detail.location?.location_name || '-',
          unit_cost: detail.stock?.unit_cost || detail.acquisition_cost || 0,
        };
      }
      if (detail.location) {
        locationDisplayName.value = detail.location.location_name || '-';
      }
      if (detail.pic) {
        picDisplayName.value = detail.pic.full_name || detail.picName || '-';
      } else if (detail.picName) {
        picDisplayName.value = detail.picName;
      }
    }
  } catch (error) {
    Alert.error('Gagal', 'Gagal memuat detail aset.');
    close();
  }
};

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      if (props.assetId) {
        await loadDetail();
      } else {
        resetForm();
      }
    }
  }
);

const handleSubmit = async () => {
  if (!form.picId || !form.goodId || !form.locationId) {
    Alert.toast('Validasi', 'Mohon lengkapi PIC, Barang, dan Lokasi.', 'warning');
    return;
  }

  try {
    const payload = { ...form };
    if (!isEdit.value) {
      const selectedStock = stockList.value.find((s) => s.id === form.goodId) || selectedStockObject.value;
      if (selectedStock) {
        payload.goodId = selectedStock.goodId || selectedStock.good_id || selectedStock.good?.id || selectedStock.id;
        // Kirim tipe baris stok yang dipilih user supaya backend memotong baris itu (bukan asal pilih)
        payload.tipe = selectedStock.tipe || 'biasa';
      }
    }

    if (isEdit.value) {
      await assetStore.updateAsset(props.assetId, payload);
      Alert.success('Berhasil', 'Data aset berhasil diperbarui.');
    } else {
      await assetStore.createAsset(payload);
      Alert.success('Berhasil', 'Aset baru berhasil didaftarkan.');
    }
    emit('saved');
    close();
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data aset.');
  }
};

onMounted(async () => {
  if (props.modelValue) {
    if (props.assetId) {
      await loadDetail();
    } else {
      resetForm();
    }
  }
});
</script>


<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Edit Pembelian' : 'Buat Pembelian Baru'"
    :subtitle="isEdit ? `Kode: ${purchaseStore.purchaseDetail?.code || '-'}` : 'Formulir pemesanan dan pengadaan barang / jasa'"
    :is-modal="true"
    max-width="max-w-4xl"
    :loading="isSubmitting"
    :steps="['Informasi Dasar', 'Item & Biaya']"
    v-model:current-step="currentStep"
    :is-step-valid="currentStep === 1 ? isStep1Valid : isStep2Valid"
    :show-draft="isEditable && isStep1Valid && (currentStep === 1 || (currentStep === 2 && isStep2Valid))"
    :status-badge="isEdit && purchaseStore.purchaseDetail?.status ? purchaseStore.purchaseDetail.status.replace('_', ' ') : ''"
    :status-badge-class="statusBadgeClass(purchaseStore.purchaseDetail?.status)"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Ajukan Pembelian'"
    continue-label="Lanjut"
    @draft="handleSave('draft')"
    @submit="handleSave('diajukan')"
    @close="handleClose"
  >

    <!-- Edit Warning for Submitted -->
    <div
      v-if="purchaseStore.purchaseDetail?.status === 'diajukan'"
      class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 p-3 rounded-md flex items-center gap-3 text-xs text-blue-700 dark:text-blue-300 mb-2"
    >
      <Info class="w-4 h-4 text-blue-500 shrink-0" />
      <span>Status Pengajuan: Sedang Diajukan. Perubahan data atau nota akan tetap menjaga status pengajuan.</span>
    </div>

    <!-- ==================== PHASE 1: Informasi Dasar ==================== -->
    <div v-if="currentStep === 1" class="flex flex-col gap-4">

      <!-- Sumber & Tiket -->
      <FormSection title="Sumber Pengadaan" :cols="2">
        <FormField label="Sumber" :col-span="2">
          <div class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md w-fit">
            <button
              type="button"
              @click="isEditable ? form.sourceType = 'dari_tiket' : null"
              :disabled="!isEditable"
              :class="[
                'px-3 py-1.5 rounded text-xs transition-all duration-200 border whitespace-nowrap cursor-pointer',
                form.sourceType === 'dari_tiket'
                  ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                  : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
              ]"
            >
              Dari Tiket Pengajuan
            </button>
            <button
              type="button"
              @click="isEditable ? form.sourceType = 'tanpa_tiket' : null"
              :disabled="!isEditable"
              :class="[
                'px-3 py-1.5 rounded text-xs transition-all duration-200 border whitespace-nowrap cursor-pointer',
                form.sourceType === 'tanpa_tiket'
                  ? 'bg-white text-text-active border-border dark:bg-gray-800 dark:border-border font-medium shadow-xs'
                  : 'bg-transparent border-transparent text-text-muted hover:text-text-active font-normal'
              ]"
            >
              Tanpa Tiket
            </button>
          </div>
        </FormField>

        <!-- Request Ticket Selector -->
        <FormField
          v-if="form.sourceType === 'dari_tiket'"
          label="Pilih Tiket"
          type="searchable-select"
          :load-options="searchRequests"
          v-model="form.requestId"
          :disabled="!isEditable"
          :required="true"
          :col-span="2"
          placeholder="Pilih tiket pengajuan..."
          search-placeholder="Cari kode tiket..."
          @select="onTicketSelected"
        />

        <!-- Selected Request Info -->
        <FormField
          v-if="form.sourceType === 'dari_tiket' && selectedRequest"
          label="Pemohon / Divisi"
          :col-span="2"
        >
          <span class="text-sm font-medium text-text-active">
            {{ selectedRequest.employee?.full_name || selectedRequest.employeeName || '-' }} — {{ selectedRequest.division?.name || selectedRequest.divisionName || '-' }}
          </span>
        </FormField>
      </FormSection>

      <!-- Tipe Pembelian -->
      <FormSection title="Tipe Pembelian" :cols="2">
        <FormField label="Tipe Pembelian" :col-span="2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="t in types"
              :key="t.id"
              @click="isEditable ? form.purchaseType = t.id : null"
              :class="[
                'border rounded-md p-3 flex items-start gap-3 cursor-pointer transition-all',
                form.purchaseType === t.id
                  ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500'
                  : 'border-border bg-white dark:bg-gray-900 hover:bg-bg-2'
              ]"
            >
              <component :is="t.icon" class="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <div class="font-medium text-sm text-text-active">{{ t.label }}</div>
                <div class="text-xs text-text-muted mt-0.5">{{ t.desc }}</div>
              </div>
            </div>
          </div>
        </FormField>

        <!-- Tipe Stok Hasil (hanya untuk barang) -->
        <FormField v-if="form.purchaseType === 'barang'" label="Tipe Stok Hasil" :col-span="2">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1 bg-bg-2 border border-border dark:bg-gray-900 dark:border-border p-1 rounded-md w-fit">
              <button
                v-for="opt in PURCHASE_STOCK_TIPE_OPTIONS"
                :key="opt.value"
                type="button"
                @click="isEditable ? form.tipe = opt.value : null"
                :disabled="!isEditable"
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
            <span v-if="form.tipe && form.tipe !== 'biasa'" class="text-xs text-amber-600 dark:text-amber-400">
              Stok masuk akan dicatat ke bucket {{ form.tipe === 'parfum' ? 'parfum' : 'stok opening' }}.
            </span>
          </div>
        </FormField>
      </FormSection>

      <!-- Informasi Pengadaan -->
      <FormSection title="Detail Transaksi" :cols="2">
        <FormField
          label="Lokasi Tujuan"
          type="searchable-select"
          master="locations"
          v-model="form.locationId"
          :disabled="!isEditable"
          :required="true"
          :col-span="2"
          placeholder="Pilih lokasi tujuan..."
          search-placeholder="Cari lokasi..."
        />

        <FormField label="Tanggal Pembelian" :required="true">
          <DatePicker
            v-model="form.datePurchase"
            :disabled="!isEditable"
            placeholder="Pilih tanggal"
          />
        </FormField>

        <FormField label="Vendor / Toko">
          <input
            v-model="form.vendorName"
            :disabled="!isEditable"
            type="text"
            placeholder="Masukkan nama vendor atau toko..."
            class="w-full bg-transparent border-0 p-0 outline-none text-text-active text-sm focus:ring-0"
          />
        </FormField>

        <FormField label="Pembayaran">
          <SearchableSelect
            v-model="form.payment"
            :options="paymentOptions"
            :disabled="!isEditable"
            variant="seamless"
            placeholder="Pilih pembayaran..."
            :clearable="true"
          />
        </FormField>

        <FormField label="Metode Pembayaran">
          <SearchableSelect
            v-model="form.paymentMethod"
            :options="paymentMethodOptions"
            :disabled="!isEditable"
            variant="seamless"
            placeholder="Pilih metode..."
            :clearable="true"
          />
        </FormField>

        <FormField v-if="!isAdmin && !isSuperAdmin" label="PIC GA" :required="true" :col-span="2">
          <input
            :value="authStore.user?.displayName || authStore.user?.fullName || '-'"
            disabled
            class="w-full bg-transparent border-0 p-0 outline-none text-text-muted text-sm cursor-not-allowed"
          />
        </FormField>
        <FormField
          v-else
          label="PIC GA"
          type="searchable-select"
          master="employees"
          v-model="form.picGaId"
          :initial-option="initialPicOption"
          :disabled="!isEditable"
          :required="true"
          :col-span="2"
          placeholder="Pilih PIC GA..."
          search-placeholder="Cari karyawan..."
        />
      </FormSection>

    </div>

    <!-- ==================== PHASE 2: Detail Pembelian & Items ==================== -->
    <div v-if="currentStep === 2" class="flex flex-col gap-4">

      <!-- Items Section -->
      <FormSection title="Item yang Dibeli" :cols="1">
        <div class="flex flex-col gap-3">
          <div
            v-for="(item, index) in formItems"
            :key="index"
            class="bg-white dark:bg-gray-900 border border-border rounded-lg p-3.5 flex flex-col gap-3"
          >
            <div class="flex items-center justify-between border-b border-border pb-2">
              <span class="text-xs font-bold text-text-muted uppercase tracking-wider">Item #{{ index + 1 }}</span>
              <button
                v-if="isEditable && formItems.length > 1"
                type="button"
                @click="removeItem(index)"
                class="text-xs text-red-500 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" /> Hapus
              </button>
            </div>

            <!-- Goods Master Selector -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-text-muted mb-1">Cari Barang (Master)</label>
                <div class="bg-white dark:bg-gray-800 border border-border rounded-md px-3 py-2">
                  <SearchableSelect
                    v-model="item.goodId"
                    master="goods"
                    :disabled="!isEditable"
                    variant="seamless"
                    placeholder="Pilih barang dari master (opsional)..."
                    search-placeholder="Cari nama, kode atau merk barang..."
                    :clearable="true"
                    @select="(good) => onGoodSelected(index, good)"
                  />
                </div>
              </div>

              <div v-if="!item.goodId" class="md:col-span-2">
                <label class="block text-xs font-medium text-text-muted mb-1">Nama Item Manual</label>
                <input
                  v-model="item.itemName"
                  :disabled="!isEditable"
                  type="text"
                  placeholder="Ketik nama item secara manual..."
                  class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border rounded-md text-sm text-text-active outline-none focus:border-brand-500"
                />
              </div>

              <!-- Qty -->
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">Jumlah (QTY)</label>
                <input
                  v-model.number="item.qtyPurchase"
                  :disabled="!isEditable"
                  type="number"
                  step="any"
                  min="1"
                  placeholder="1"
                  @input="item.unitPrice = item.qtyPurchase ? (item.subtotal / item.qtyPurchase) : 0"
                  class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border rounded-md text-sm text-text-active outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <!-- Total Harga Subtotal -->
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1">Total Harga (Rp)</label>
                <input
                  type="text"
                  :disabled="!isEditable"
                  :value="formatThousand(item.subtotal)"
                  @input="(e) => onSubtotalInput(index, e.target.value)"
                  placeholder="0"
                  class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-border rounded-md text-sm text-text-active outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <!-- Computed Unit Price -->
              <div class="md:col-span-2 flex items-center justify-between bg-bg-2 p-2 rounded-md text-xs">
                <span class="text-text-muted">Harga Satuan Bersih (Setelah Alokasi Biaya):</span>
                <span class="font-bold text-text-active">Rp {{ formatThousand(getNetUnitPrice(item)) }}</span>
              </div>
            </div>
          </div>

          <!-- Add Item Button -->
          <div v-if="isEditable" class="flex justify-end">
            <button
              type="button"
              @click="addItem"
              class="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" /> Tambah Baris Item
            </button>
          </div>
        </div>
      </FormSection>

      <!-- Section 2: Penyesuaian Biaya & Diskon -->
      <FormSection title="Penyesuaian Biaya & Diskon" :cols="2">
        <!-- Diskon (Unified Container: Tipe + Input + Preview) -->
        <FormField label="Diskon" :col-span="2">
          <div class="flex flex-col gap-1.5 w-full">
            <div class="flex items-center gap-2 w-full">
              <!-- Tipe Diskon Switcher (Segmented Control) -->
              <div class="inline-flex p-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-border shrink-0">
                <button
                  type="button"
                  @click="isEditable ? (form.discountType = 'percent') : null"
                  :disabled="!isEditable"
                  :class="[
                    'px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer select-none',
                    form.discountType === 'percent'
                      ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-text-muted hover:text-text-active'
                  ]"
                >
                  % Persen
                </button>
                <button
                  type="button"
                  @click="isEditable ? (form.discountType = 'nominal') : null"
                  :disabled="!isEditable"
                  :class="[
                    'px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer select-none',
                    form.discountType === 'nominal'
                      ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-text-muted hover:text-text-active'
                  ]"
                >
                  Rp Nominal
                </button>
              </div>

              <!-- Input Nilai Diskon -->
              <div class="flex items-center gap-1.5 flex-1 min-w-0">
                <span class="text-xs font-mono font-bold text-text-muted select-none">
                  {{ form.discountType === 'percent' ? '%' : 'Rp' }}
                </span>
                <input
                  v-if="form.discountType === 'percent'"
                  v-model.number="form.discountPercent"
                  :disabled="!isEditable || isSubmitting"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0"
                  class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active focus:ring-0"
                />
                <input
                  v-else
                  :value="formatThousand(form.discountNominal)"
                  :disabled="!isEditable || isSubmitting"
                  type="text"
                  placeholder="0"
                  @input="(e) => onDiscountNominalInput(e)"
                  class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active focus:ring-0"
                />
              </div>

              <!-- Live Calculated Potongan Badge -->
              <div
                v-if="discountNominalValue > 0 && !(form.discountType === 'nominal' && Number(form.discountNominal) > totalPrice)"
                class="shrink-0 text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
              >
                Potongan: -Rp {{ formatThousand(discountNominalValue) }}
              </div>
            </div>

            <!-- Error message if discount exceeds total -->
            <p
              v-if="form.discountType === 'nominal' && Number(form.discountNominal) > totalPrice && totalPrice > 0"
              class="text-xs text-red-500 dark:text-red-400 font-medium"
            >
              * Diskon nominal tidak boleh melebihi total harga belanja (Rp {{ formatThousand(totalPrice) }}).
            </p>
            <p
              v-if="form.discountType === 'percent' && Number(form.discountPercent) > 100"
              class="text-xs text-red-500 dark:text-red-400 font-medium"
            >
              * Persentase diskon maksimal 100%.
            </p>
          </div>
        </FormField>

        <!-- Biaya Ongkir -->
        <FormField label="Biaya Ongkir" :col-span="1">
          <div class="flex items-center gap-1.5 w-full">
            <span class="text-xs font-mono font-bold text-text-muted select-none">Rp</span>
            <input
              :value="formatThousand(form.shippingCost)"
              :disabled="!isEditable || isSubmitting"
              type="text"
              placeholder="0"
              @input="(e) => onShippingCostInput(e)"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active focus:ring-0"
            />
          </div>
        </FormField>

        <!-- Biaya Lainnya -->
        <FormField label="Biaya Lainnya" :col-span="1">
          <div class="flex items-center gap-1.5 w-full">
            <span class="text-xs font-mono font-bold text-text-muted select-none">Rp</span>
            <input
              :value="formatThousand(form.packagingCost)"
              :disabled="!isEditable || isSubmitting"
              type="text"
              placeholder="0"
              @input="(e) => onPackagingCostInput(e)"
              class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active focus:ring-0"
            />
          </div>
        </FormField>

        <!-- Catatan Internal -->
        <FormField label="Catatan" label-width="120px" :col-span="2">
          <textarea
            v-model="form.notes"
            rows="2"
            :disabled="!isEditable || isSubmitting"
            placeholder="Masukkan catatan jika diperlukan..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0 resize-none"
          ></textarea>
        </FormField>
      </FormSection>

      <!-- Section 3: Dokumen Pendukung & Total Pembelian -->
      <FormSection title="Dokumen Pendukung & Total Pembelian" :cols="1">
        <EvidenceManager
          ref="evidenceManagerRef"
          :purchase-id="isEdit ? purchaseId : null"
          :mode="isEdit ? 'managed' : 'staged'"
          :evidences="isEdit ? (purchaseStore.purchaseDetail?.evidences || []) : []"
          :disabled="!isEditable"
        />

        <p v-if="isEdit" class="text-[11px] text-text-muted px-1">
          Dokumen tersimpan langsung saat diunggah, terpisah dari tombol simpan data.
        </p>

        <!-- Grand Total Summary Banner -->
        <div class="mt-2 p-3.5 rounded-xl bg-bg-2 border border-border dark:bg-gray-800/60 flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider">Grand Total Pembelian</span>
            <span class="text-xs text-text-muted">Total setelah diskon &amp; biaya tambahan</span>
          </div>
          <div class="text-lg font-mono font-extrabold text-brand-600 dark:text-brand-400">
            Rp {{ formatThousand(grandTotal) }}
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
import EvidenceManager from './EvidenceManager.vue';
import { usePurchaseStore } from '../purchase.store';
import { PurchaseMapper } from '../purchase.mapper';
import { PurchaseService } from '../purchase.service';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { RequestService } from '../../request/request.service';
import { EmployeeService } from '@/modules/organization/employees/employee.service';
import { Alert } from '@/plugins/sweetalert';
import { formatThousand, parseThousand } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  Package, DollarSign, Plus, Trash2, Info
} from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  purchaseId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.purchaseId);
const isSubmitting = computed(() => purchaseStore.isLoading);
const isEditable = computed(() => {
  if (!isEdit.value) return true;
  return ['draft', 'diajukan'].includes(purchaseStore.purchaseDetail?.status);
});

const isAdmin = computed(() => !!(authStore.user?.isAdmin || authStore.user?.is_admin));
const isSuperAdmin = computed(() => !!authStore.user?.is_superadmin);

const currentStep = ref(1);
const evidenceManagerRef = ref(null);

const availableRequests = ref([]);
const locations = ref([]);
const employees = ref([]);
const goodsMaster = ref([]);

const types = [
  { id: 'barang', label: 'Barang / Stok', desc: 'Auto stock-in saat selesai', icon: Package },
  { id: 'non_barang', label: 'Non-Barang / Jasa', desc: 'Tidak masuk stok atau aset', icon: DollarSign },
];

const paymentOptions = [
  { label: 'KAS GA', value: 'kas_ga' },
  { label: 'FINANCE', value: 'finance' },
];

const paymentMethodOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank' },
  { label: 'E-Wallet', value: 'e_wallet' },
];

// Bucket stok tujuan hasil pembelian barang.
const PURCHASE_STOCK_TIPE_OPTIONS = [
  { label: 'Reguler', value: 'biasa' },
  { label: 'Opening', value: 'opening' },
  { label: 'Parfum', value: 'parfum' },
];

const form = reactive({
  sourceType: 'tanpa_tiket',
  requestId: null,
  purchaseType: 'barang',
  tipe: 'biasa',
  locationId: '',
  picGaId: '',
  vendorName: '',
  datePurchase: new Date().toISOString().split('T')[0],
  payment: null,
  paymentMethod: null,
  notes: '',
  discountType: 'percent',
  discountPercent: 0,
  discountNominal: 0,
  shippingCost: 0,
  packagingCost: 0,
});

const formItems = ref([]);

const selectedRequest = ref(null);

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

const searchRequests = async (query) => {
  try {
    const res = await RequestService.getAll({ status: 'proses_ga', search: query, limit: 20 });
    const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    return raw.map((r) => ({
      ...r,
      value: r.id,
      label: `${r.code_request || r.requestCode || '-'} (${r.employee?.full_name || r.employeeName || '-'})`,
    }));
  } catch (err) {
    console.error('PurchaseFormModal: Failed to search requests', err);
    return [];
  }
};

const isStep1Valid = computed(() => {
  const hasPic = (isAdmin.value || isSuperAdmin.value)
    ? !!form.picGaId
    : !!(form.picGaId || authStore.user?.employeeId || authStore.user?.employee_id || authStore.user?.id);
  const isTicketValid = form.sourceType === 'dari_tiket' ? !!form.requestId : true;
  return !!(form.locationId && form.datePurchase && hasPic && isTicketValid);
});

const isStep2Valid = computed(() => {
  const isItemsValid =
    formItems.value.length > 0 &&
    formItems.value.every(
      (item) => (item.goodId || item.itemName) && Number(item.qtyPurchase) > 0 && Number(item.subtotal) > 0
    );
  const isDiscountValid =
    form.discountType === 'nominal'
      ? Number(form.discountNominal) <= totalPrice.value
      : Number(form.discountPercent) <= 100;
  const isGrandTotalValid = grandTotal.value >= 0;
  return isItemsValid && isDiscountValid && isGrandTotalValid;
});

const totalPrice = computed(() => {
  return formItems.value.reduce((sum, it) => sum + (it.subtotal || 0), 0);
});

const discountNominalValue = computed(() => {
  if (form.discountType === 'nominal') return Number(form.discountNominal) || 0;
  return ((totalPrice.value || 0) * (Number(form.discountPercent) || 0)) / 100;
});

const onDiscountNominalInput = (e) => {
  form.discountNominal = parseThousand(e.target.value);
};

const onShippingCostInput = (e) => {
  form.shippingCost = parseThousand(e.target.value);
};

const onPackagingCostInput = (e) => {
  form.packagingCost = parseThousand(e.target.value);
};

const getNetUnitPrice = (item) => {
  if (!totalPrice.value || !item.qtyPurchase) return 0;
  const rawGrandTotal = Math.max(
    0,
    totalPrice.value - discountNominalValue.value + (form.shippingCost || 0) + (form.packagingCost || 0)
  );
  const itemNetSubtotal =
    (item.subtotal / totalPrice.value) * rawGrandTotal;
  return Math.max(0, itemNetSubtotal / item.qtyPurchase);
};

const grandTotal = computed(() => {
  return formItems.value.reduce((sum, item) => {
    return sum + getNetUnitPrice(item) * (item.qtyPurchase || 0);
  }, 0);
});

watch(
  () => form.discountType,
  (newType) => {
    if (newType === 'percent') {
      form.discountNominal = 0;
    } else {
      form.discountPercent = 0;
    }
  }
);

watch(
  () => form.discountPercent,
  (val) => {
    if (val > 100) form.discountPercent = 100;
    else if (val < 0) form.discountPercent = 0;
  }
);

const addItem = () => {
  formItems.value.push({
    goodId: '',
    itemName: '',
    merk: '',
    qtyPurchase: 1,
    unitPrice: 0,
    subtotal: 0,
  });
};

const removeItem = (idx) => {
  formItems.value.splice(idx, 1);
};

const onSubtotalInput = (index, val) => {
  if (val.endsWith(',') || val.endsWith('.')) return;
  const parsed = parseThousand(val);
  formItems.value[index].subtotal = parsed;
  formItems.value[index].unitPrice = formItems.value[index].qtyPurchase
    ? parsed / formItems.value[index].qtyPurchase
    : 0;
};

const onGoodSelected = (index, good) => {
  if (good) {
    formItems.value[index].goodId = good.id;
    formItems.value[index].itemName = good.good_name || good.goodName || good.name || '';
    formItems.value[index].merk = good.merk || '';
  } else {
    formItems.value[index].goodId = '';
    formItems.value[index].itemName = '';
    formItems.value[index].merk = '';
  }
};

const onTicketSelected = (req) => {
  selectedRequest.value = req;
  if (req) {
    form.locationId = req.location_id || req.locationId || '';
    if (req.details?.length && !formItems.value.some((it) => it.goodId || it.itemName)) {
      formItems.value = req.details
        .map((d) => ({
          goodId: d.good_id || d.goodId || '',
          itemName: d.item_name || d.good?.good_name || '',
          merk: d.good?.merk || d.merk || '',
          qtyPurchase: (Number(d.qty_request || d.qtyRequest) || 0) - (Number(d.qty_fulfilled || d.qtyFulfilled) || 0),
          unitPrice: 0,
          subtotal: 0,
        }))
        .filter((it) => it.qtyPurchase > 0);
    }
  }
};

const resetForm = () => {
  currentStep.value = 1;
  form.sourceType = 'tanpa_tiket';
  form.requestId = null;
  form.purchaseType = 'barang';
  form.tipe = 'biasa';
  form.locationId = '';
  form.picGaId = authStore.user?.employeeId || authStore.user?.employee_id || authStore.user?.id || '';
  form.vendorName = '';
  form.datePurchase = new Date().toISOString().split('T')[0];
  form.payment = null;
  form.paymentMethod = null;
  form.notes = '';
  form.discountType = 'percent';
  form.discountPercent = 0;
  form.discountNominal = 0;
  form.shippingCost = 0;
  form.packagingCost = 0;
  selectedRequest.value = null;

  formItems.value = [];
  addItem();

  if (authStore.user?.id && !form.picGaId) {
    EmployeeService.getById(authStore.user.id)
      .then((emp) => {
        if (emp?.id) {
          form.picGaId = emp.employeeId || emp.id || '';
        }
      })
      .catch(() => {});
  }
};

const loadDetail = async (id) => {
  try {
    const detail = await purchaseStore.fetchDetail(id);
    if (detail) {
      selectedRequest.value = detail.request || null;
      Object.assign(form, {
        sourceType: detail.sourceType || 'tanpa_tiket',
        requestId: detail.requestId || null,
        purchaseType: detail.purchaseType || 'barang',
        tipe: detail.tipe || 'biasa',
        locationId: detail.locationId || detail.location?.id || '',
        picGaId: detail.picGaId || '',
        vendorName: detail.vendorName || '',
        datePurchase: detail.datePurchase
          ? new Date(detail.datePurchase).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        payment: detail.payment || null,
        paymentMethod: detail.paymentMethod || null,
        notes: detail.notes || '',
        discountType: detail.discountType || 'percent',
        discountPercent: Number(detail.discountPercent) || 0,
        discountNominal: Number(detail.discountNominal) || 0,
        shippingCost: Number(detail.shippingCost) || 0,
        packagingCost: Number(detail.packagingCost) || 0,
      });

      formItems.value = (detail.items || []).map((it) => ({
        goodId: it.goodId || '',
        itemName: it.itemName || '',
        merk: it.good?.merk || it.merk || '',
        qtyPurchase: Number(it.qtyPurchase) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        subtotal: Number(it.subtotalRaw) || Number(it.qtyPurchase) * Number(it.unitPrice),
      }));

      if (formItems.value.length === 0) {
        addItem();
      }
    }
  } catch (err) {
    Alert.error('Gagal', 'Data pembelian tidak ditemukan.');
    handleClose();
  }
};

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      resetForm();
      if (props.purchaseId) {
        await loadDetail(props.purchaseId);
      }
    }
  }
);

onMounted(async () => {
  if (props.modelValue) {
    resetForm();
    if (props.purchaseId) {
      await loadDetail(props.purchaseId);
    }
  }
});

const handleClose = () => {
  isOpen.value = false;
};

const handleSave = async (status) => {
  try {
    if (!form.locationId) return Alert.error('Validasi Gagal', 'Lokasi tujuan wajib dipilih.');
    if (!form.picGaId && !isAdmin.value && !isSuperAdmin.value) {
      form.picGaId = authStore.user?.employeeId || authStore.user?.employee_id || authStore.user?.id || '';
    }
    if (!form.picGaId) return Alert.error('Validasi Gagal', 'PIC GA wajib dipilih.');
    if (form.sourceType === 'dari_tiket' && !form.requestId) {
      return Alert.error('Validasi Gagal', 'Tiket pengajuan wajib dipilih.');
    }
    if (!formItems.value.length) {
      return Alert.error('Validasi Gagal', 'Daftar item pembelian tidak boleh kosong.');
    }
    if (formItems.value.some((it) => !it.goodId && !it.itemName)) {
      return Alert.error('Validasi Gagal', 'Semua baris item wajib memiliki nama barang atau memilih dari master.');
    }
    if (formItems.value.some((it) => Number(it.qtyPurchase) <= 0)) {
      return Alert.error('Validasi Gagal', 'Jumlah (QTY) pada setiap item harus lebih dari 0.');
    }
    if (formItems.value.some((it) => Number(it.subtotal) <= 0)) {
      return Alert.error('Validasi Gagal', 'Total harga pada setiap item harus lebih dari 0.');
    }
    if (form.discountType === 'nominal' && Number(form.discountNominal) > totalPrice.value) {
      return Alert.error(
        'Validasi Gagal',
        `Diskon nominal (Rp ${formatThousand(form.discountNominal)}) tidak boleh melebihi total harga belanja (Rp ${formatThousand(totalPrice.value)}).`
      );
    }
    if (form.discountType === 'percent' && Number(form.discountPercent) > 100) {
      return Alert.error('Validasi Gagal', 'Persentase diskon tidak boleh melebihi 100%.');
    }
    if (grandTotal.value < 0) {
      return Alert.error('Validasi Gagal', 'Grand total pembelian tidak boleh bernilai negatif.');
    }
    if (!isEdit.value && evidenceManagerRef.value?.validateLinks?.() === false) return;

    const actionLabel = status === 'diajukan' ? 'Ajukan' : 'Simpan Draft';
    const confirmed = await Alert.confirm('Konfirmasi', `${actionLabel} pembelian ini?`);
    if (!confirmed) return;

    let purchaseId = props.purchaseId;
    let evidenceFailed = false;

    const itemsWithNetPrice = formItems.value.map((item) => {
      const rawTotal = formItems.value.reduce((s, it) => s + (it.subtotal || 0), 0);
      const discount =
        form.discountType === 'nominal'
          ? Math.min(rawTotal, form.discountNominal || 0)
          : (rawTotal * Math.min(100, form.discountPercent || 0)) / 100;
      const rawGrandTotal =
        Math.max(0, rawTotal - discount + (form.shippingCost || 0) + (form.packagingCost || 0));
      const itemNetSubtotal =
        rawTotal > 0 ? (item.subtotal / rawTotal) * rawGrandTotal : 0;
      const netUnitPrice = item.qtyPurchase ? itemNetSubtotal / item.qtyPurchase : 0;
      return {
        ...item,
        unitPrice: Math.max(0, netUnitPrice),
        subtotalRaw: Math.max(0, item.subtotal),
        subtotalDiscounted: Math.max(0, itemNetSubtotal),
      };
    });

    if (isEdit.value) {
      await purchaseStore.updatePurchase(purchaseId, form, itemsWithNetPrice);
    } else {
      const res = await purchaseStore.createPurchase(form, itemsWithNetPrice);
      purchaseId = res.data?.id || res.id;

      const pending = evidenceManagerRef.value?.getPending?.();
      if (pending && PurchaseMapper.hasEvidencePayload(pending)) {
        try {
          await purchaseStore.uploadEvidences(purchaseId, pending);
        } catch (err) {
          evidenceFailed = true;
          console.error('uploadEvidences failed', err);
          Alert.error('Dokumen Gagal Diunggah', getApiErrorMessage(err));
        }
      }
    }

    if (status === 'diajukan') {
      await PurchaseService.updateStatus(purchaseId, { status: 'diajukan' });
    }

    if (evidenceFailed) {
      Alert.success('Tersimpan', 'Pembelian tersimpan. Silakan periksa dokumen pendukung.');
    } else {
      Alert.success('Berhasil', 'Data pembelian berhasil disimpan.');
    }

    emit('saved');
    handleClose();
  } catch (err) {
    console.error(err);
    Alert.error('Gagal', getApiErrorMessage(err, 'Gagal menyimpan data pembelian.'));
  }
};

const statusBadgeClass = (s) => ({
  draft: 'bg-gray-100 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  diajukan: 'bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  disetujui: 'bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
  diterima: 'bg-teal-50 border border-teal-200 text-teal-700 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400',
  selesai: 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  batal: 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
}[s] || 'bg-gray-100 text-gray-700');
</script>

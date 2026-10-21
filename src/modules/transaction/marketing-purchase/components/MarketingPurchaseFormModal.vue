<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Ubah Data Purchase Marketing' : 'Buat Purchase Marketing Baru'"
    :subtitle="isEdit ? `Kode: ${purchaseDetail?.code || '-'}` : 'Formulir pemesanan & pengadaan barang operasional marketing'"
    :is-modal="true"
    max-width="max-w-4xl"
    :loading="isSubmitting"
    :steps="['Informasi Dasar', 'Item & Biaya']"
    v-model:current-step="currentStep"
    :is-step-valid="currentStep === 1 ? isStep1Valid : isStep2Valid"
    :show-draft="isEditable && isStep1Valid && (currentStep === 1 || (currentStep === 2 && isStep2Valid))"
    :status-badge="isEdit && purchaseDetail?.status ? purchaseDetail.status.replace('_', ' ') : ''"
    :status-badge-class="statusBadgeClass(purchaseDetail?.status)"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Ajukan Purchase'"
    continue-label="Lanjut"
    @draft="handleSave('draft')"
    @submit="handleSave('diajukan')"
    @close="handleClose"
  >
    <!-- Edit Warning for Submitted -->
    <div
      v-if="isEdit && purchaseDetail?.status === 'diajukan'"
      class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 p-3 rounded-md flex items-center gap-3 text-xs text-blue-700 dark:text-blue-300 mb-2"
    >
      <Info class="w-4 h-4 text-blue-500 shrink-0" />
      <span>Status Pengajuan: Sedang Diajukan. Perubahan data atau nota akan tetap menjaga status pengajuan.</span>
    </div>

    <!-- Read-Only Warning -->
    <div
      v-if="isEdit && !isEditable"
      class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-md flex items-center gap-3 text-xs text-amber-700 dark:text-amber-300 mb-2"
    >
      <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
      <span class="font-bold uppercase tracking-wider">Status: {{ purchaseDetail?.status }} (Hanya Lihat / Read Only)</span>
    </div>

    <!-- ==================== PHASE 1: Informasi Dasar ==================== -->
    <div v-if="currentStep === 1" class="flex flex-col gap-4">
      <!-- Section 1: Lokasi & PIC -->
      <FormSection title="Lokasi & PIC Penanggung Jawab" :cols="2">
        <!-- Lokasi Tujuan -->
        <FormField
          label="Lokasi Tujuan"
          type="searchable-select"
          master="locations"
          v-model="form.locationId"
          :initial-option="initialLocationOption"
          :disabled="!isEditable || isSubmitting"
          :required="true"
          :col-span="1"
          placeholder="Pilih lokasi tujuan..."
          search-placeholder="Cari lokasi tujuan..."
          :clearable="true"
        />

        <!-- PIC Marketing -->
        <FormField
          v-if="canPickAnyPic"
          label="PIC Marketing"
          type="searchable-select"
          master="employees"
          v-model="form.picMarketing"
          :initial-option="initialPicOption"
          :disabled="!isEditable || isSubmitting"
          :required="true"
          :col-span="1"
          placeholder="Pilih PIC Marketing..."
          search-placeholder="Cari nama karyawan..."
          :clearable="true"
        />
        <FormField v-else label="PIC Marketing" :required="true" :col-span="1">
          <div class="py-1 w-full min-w-0">
            <span class="text-sm font-medium text-text-muted italic">
              {{ authStore.user?.displayName || authStore.user?.fullName || '-' }}
            </span>
          </div>
        </FormField>
      </FormSection>

      <!-- Section 1b: Tipe Pembelian -->
      <FormSection title="Tipe Pembelian" :cols="2">
        <FormField label="Tipe Pembelian" :col-span="2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="t in purchaseTypes"
              :key="t.id"
              @click="isEditable && !isJasaFromRequest ? form.purchaseType = t.id : null"
              :class="[
                'border rounded-md p-3 flex items-start gap-3 transition-all',
                form.purchaseType === t.id
                  ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500'
                  : 'border-border bg-white dark:bg-gray-900 hover:bg-bg-2',
                isJasaFromRequest ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              ]"
            >
              <component :is="t.icon" class="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <div class="font-medium text-sm text-text-active">{{ t.label }}</div>
                <div class="text-xs text-text-muted mt-0.5">{{ t.desc }}</div>
              </div>
            </div>
          </div>
          <p v-if="isJasaFromRequest" class="text-[11px] text-text-muted mt-2">
            Tipe pembelian &amp; sumber PO ini berasal dari Pengajuan Jasa — tidak dapat diubah.
          </p>
        </FormField>
      </FormSection>

      <!-- Section 2: Vendor & Tanggal Pembelian -->
      <FormSection title="Vendor & Waktu Pembelian" :cols="2">
        <!-- Vendor / Toko -->
        <FormField label="Vendor / Toko" :col-span="2">
          <input
            v-model="form.vendorName"
            :disabled="!isEditable || isSubmitting"
            type="text"
            placeholder="Masukkan nama toko, supplier, atau vendor..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
          />
        </FormField>

        <!-- Tanggal Beli -->
        <FormField label="Tanggal Beli" :col-span="1">
          <DatePicker
            v-model="form.datePurchase"
            :disabled="!isEditable || isSubmitting"
            placeholder="Pilih tanggal pembelian"
          />
        </FormField>

        <!-- Estimasi Tiba -->
        <FormField label="Estimasi Tiba" :col-span="1">
          <DatePicker
            v-model="form.dateArrive"
            :disabled="!isEditable || isSubmitting"
            placeholder="Pilih estimasi kedatangan"
          />
        </FormField>
      </FormSection>

      <!-- Section 3: Pembayaran -->
      <FormSection title="Ketentuan Pembayaran" :cols="2">
        <!-- Sumber Dana -->
        <FormField label="Sumber Dana" :col-span="1">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.payment"
              :disabled="!isEditable || isSubmitting"
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active appearance-none cursor-pointer focus:ring-0"
            >
              <option value="" class="bg-white dark:bg-gray-900 text-text-muted">Pilih Sumber Dana</option>
              <option value="kas_marketing" class="bg-white dark:bg-gray-900 text-text-active">Kas Marketing</option>
              <option value="finance" class="bg-white dark:bg-gray-900 text-text-active">Finance</option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>

        <!-- Metode Pembayaran -->
        <FormField label="Metode Bayar" :col-span="1">
          <div class="relative w-full flex items-center">
            <select
              v-model="form.paymentMethod"
              :disabled="!isEditable || isSubmitting"
              class="w-full bg-transparent border-0 p-0 pr-6 outline-none text-sm font-medium text-text-active appearance-none cursor-pointer focus:ring-0"
            >
              <option value="" class="bg-white dark:bg-gray-900 text-text-muted">Pilih Metode</option>
              <option value="cash" class="bg-white dark:bg-gray-900 text-text-active">Tunai / Cash</option>
              <option value="bank" class="bg-white dark:bg-gray-900 text-text-active">Bank Transfer</option>
              <option value="e_wallet" class="bg-white dark:bg-gray-900 text-text-active">E-Wallet</option>
            </select>
            <ChevronDown class="w-4 h-4 text-text-muted pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>
      </FormSection>
    </div>

    <!-- ==================== PHASE 2: Item & Biaya ==================== -->
    <div v-if="currentStep === 2" class="flex flex-col gap-4">
      <!-- Section 1: Daftar Item Barang -->
      <FormSection :title="isJasaFromRequest ? 'Rincian Nominal Jasa' : 'Daftar Item Barang Marketing'" :cols="1">
        <p v-if="isJasaFromRequest" class="text-[11px] text-text-muted px-1 -mt-1 mb-1">
          Daftar baris berasal dari Pengajuan Jasa — hanya nominal per baris yang bisa diubah.
        </p>
        <div class="flex flex-col gap-3 w-full">
          <div
            v-for="(item, idx) in items"
            :key="idx"
            class="p-3 bg-bg-2 border border-border dark:bg-gray-800/40 rounded-lg flex flex-col gap-2.5 relative"
          >
            <!-- Row Header (Item Number + Remove) -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-brand-600 dark:text-brand-400">
                Item #{{ idx + 1 }}
              </span>
              <button
                v-if="items.length > 1 && isEditable && !isJasaFromRequest"
                type="button"
                @click="removeItem(idx)"
                class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition cursor-pointer"
                title="Hapus Item"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Goods Selector — hanya untuk Barang/Stok -->
            <FormField
              v-if="form.purchaseType === 'barang'"
              label="Barang Master"
              label-width="120px"
              type="searchable-select"
              master="marketing-goods"
              v-model="item.goodId"
              :initial-option="item.itemName ? { value: item.goodId, label: item.itemName } : null"
              placeholder="Pilih barang marketing..."
              search-placeholder="Cari nama atau kode barang..."
              :disabled="!isEditable || isSubmitting"
              :clearable="true"
              :required="true"
              @select="(selected) => onGoodChange(item, selected)"
            />

            <!-- Nama Item: read-only saat berasal dari Pengajuan Jasa -->
            <FormField
              v-else-if="isJasaFromRequest"
              label="Deskripsi"
              label-width="120px"
            >
              <span class="text-sm font-medium text-text-muted">{{ item.itemName || '-' }}</span>
            </FormField>

            <!-- Nama Item Manual — hanya untuk Non-Barang/Jasa bebas (tanpa_pengajuan) -->
            <FormField
              v-else
              label="Nama Item Manual"
              label-width="120px"
              :required="true"
            >
              <input
                v-model="item.itemName"
                :disabled="!isEditable || isSubmitting"
                type="text"
                placeholder="Ketik nama item (jasa/biaya)..."
                class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
              />
            </FormField>

            <!-- QTY & Total Harga Row (barang / non_barang bebas) -->
            <div v-if="!isJasaFromRequest" class="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              <!-- QTY -->
              <FormField label="Jumlah (QTY)" label-width="100px" :required="true">
                <input
                  v-model.number="item.qtyPurchase"
                  type="number"
                  min="0.001"
                  step="any"
                  :disabled="!isEditable || isSubmitting"
                  placeholder="1"
                  @input="onItemQtyOrSubtotalChange(item)"
                  class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active focus:ring-0"
                />
              </FormField>

              <!-- Total Harga -->
              <FormField label="Total Harga" label-width="90px" :required="true">
                <div class="flex items-center gap-1.5 w-full">
                  <span class="text-xs font-mono font-bold text-text-muted select-none">Rp</span>
                  <input
                    type="text"
                    :disabled="!isEditable || isSubmitting"
                    :value="formatThousand(item.subtotal)"
                    @input="(e) => onSubtotalInput(item, e)"
                    placeholder="0"
                    class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active placeholder:text-text-placeholder focus:ring-0"
                  />
                </div>
              </FormField>
            </div>

            <!-- Nominal saja — baris jasa dari pengajuan (qty selalu 1) -->
            <FormField v-else label="Nominal" label-width="100px" :required="true">
              <div class="flex items-center gap-1.5 w-full">
                <span class="text-xs font-mono font-bold text-text-muted select-none">Rp</span>
                <input
                  type="text"
                  :disabled="!isEditable || isSubmitting"
                  :value="formatThousand(item.subtotal)"
                  @input="(e) => onSubtotalInput(item, e)"
                  placeholder="0"
                  class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active placeholder:text-text-placeholder focus:ring-0"
                />
              </div>
            </FormField>

            <!-- Harga Satuan Bersih (Computed Net Price) -->
            <FormField v-if="!isJasaFromRequest" label="Harga Satuan (Net)" label-width="140px">
              <div class="flex items-center gap-1.5 w-full">
                <span class="text-xs font-mono font-bold text-text-muted select-none">Rp</span>
                <span class="text-sm font-mono font-semibold text-text-active">
                  {{ formatThousand(getNetUnitPrice(item)) }}
                </span>
                <span class="text-xs text-text-muted ml-1">/ unit</span>
              </div>
            </FormField>

            <!-- Duplicate Warning -->
            <p v-if="item.goodId && isDuplicateGood(item.goodId, idx)" class="text-xs text-amber-600 dark:text-amber-400 font-medium animate-pulse">
              * Perhatian: Barang ini sudah dipilih pada baris item lainnya.
            </p>
          </div>

          <!-- Add Item Button — tidak tersedia untuk PO Jasa dari Pengajuan (baris dikunci) -->
          <div v-if="isEditable && !isJasaFromRequest" class="flex justify-end pt-1">
            <button
              type="button"
              @click="addItem"
              class="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Baris Item</span>
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
              * Diskon nominal tidak boleh melebihi total harga item (Rp {{ formatThousand(totalPrice) }}).
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
            placeholder="Masukkan keterangan atau catatan internal transaksi..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0 resize-none"
          ></textarea>
        </FormField>
      </FormSection>

      <!-- Section 3: Dokumen Pendukung & Grand Total -->
      <FormSection title="Dokumen Pendukung & Total Pembelian" :cols="1">
        <EvidenceManager
          ref="evidenceManagerRef"
          :purchase-id="isEdit ? purchaseId : null"
          :mode="isEdit ? 'managed' : 'staged'"
          :evidences="isEdit ? (purchaseDetail?.evidences || []) : []"
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

        <!-- Info Tip -->
        <div v-if="form.purchaseType === 'barang'" class="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-lg border border-brand-100 dark:border-brand-500/20 text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
          <strong>Info:</strong> Transaksi berstatus <strong>Selesai</strong> akan secara otomatis menambah stok atau membuat aset baru sesuai tipe barang marketing.
        </div>
      </FormSection>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import EvidenceManager from './EvidenceManager.vue';
import { ChevronDown, Plus, Trash2, Info, Package, DollarSign } from 'lucide-vue-next';
import { useMarketingPurchaseStore } from '../marketingPurchase.store';
import { MarketingPurchaseMapper } from '../marketingPurchase.mapper';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { formatThousand, parseThousand } from '@/utils/format';
import { Alert } from '@/plugins/sweetalert';
import { getApiErrorMessage } from '@/utils/apiError';

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

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const purchaseTypes = [
  { id: 'barang', label: 'Barang / Stok', desc: 'Auto stock-in / buat aset saat selesai', icon: Package },
  { id: 'non_barang', label: 'Non-Barang / Jasa', desc: 'Tidak masuk stok atau aset', icon: DollarSign },
];

const store = useMarketingPurchaseStore();
const authStore = useAuthStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.purchaseId);
const purchaseDetail = computed(() => store.purchaseDetail);

const isEditable = computed(() => {
  if (!isEdit.value) return true;
  return ['draft', 'diajukan'].includes(purchaseDetail.value?.status);
});

// PO Jasa yang dibuat dari Pengajuan (marketing-request): daftar baris dikunci oleh pengajuan
// saat Buat PO — hanya nominal per baris yang boleh diubah (tanpa tambah/hapus baris, tanpa picker barang).
const isJasaFromRequest = computed(() => form.purchaseType === 'non_barang' && form.sourceType === 'dari_pengajuan');

const canPickAnyPic = computed(() => !!(authStore.user?.isAdmin || authStore.user?.is_superadmin));

const isSubmitting = ref(false);
const currentStep = ref(1);
const evidenceManagerRef = ref(null);

const defaultFormData = () => ({
  purchaseType: 'barang',
  sourceType: 'tanpa_pengajuan',
  locationId: '',
  picMarketing: '',
  vendorName: '',
  datePurchase: new Date().toISOString().split('T')[0],
  dateArrive: '',
  payment: '',
  paymentMethod: '',
  notes: '',
  discountType: 'percent',
  discountPercent: 0,
  discountNominal: 0,
  shippingCost: 0,
  packagingCost: 0,
});

const form = reactive(defaultFormData());

const initialLocationOption = computed(() => {
  if (!form.locationId) return null;
  if (purchaseDetail.value?.location?.location_name || purchaseDetail.value?.locationName) {
    return {
      value: form.locationId,
      label: purchaseDetail.value?.location?.location_name || purchaseDetail.value?.locationName,
    };
  }
  return null;
});

const initialPicOption = computed(() => {
  if (!form.picMarketing) return null;
  if (purchaseDetail.value?.picUser?.full_name || purchaseDetail.value?.picMarketingName) {
    return {
      value: form.picMarketing,
      label: purchaseDetail.value?.picUser?.full_name || purchaseDetail.value?.picMarketingName,
    };
  }
  if (authStore.user?.employeeId === form.picMarketing) {
    return {
      value: form.picMarketing,
      label: authStore.user.employee?.full_name || authStore.user.displayName || authStore.user.fullName,
    };
  }
  return null;
});

const blankItem = () => ({
  goodId: '',
  itemName: '',
  requestDetailId: null,
  qtyPurchase: 1,
  unitPrice: 0,
  subtotal: 0,
  notes: '',
});

const items = ref([blankItem()]);

const addItem = () => items.value.push(blankItem());
const removeItem = (idx) => items.value.splice(idx, 1);

const onGoodChange = (item, selected) => {
  const g = selected?.raw || selected;
  if (g && (g.id || g.value)) {
    item.itemName = g.good_name || g.name || g.goodName || '';
  } else {
    item.itemName = '';
  }
};

const onItemQtyOrSubtotalChange = (item) => {
  if (item.qtyPurchase && Number(item.qtyPurchase) > 0) {
    item.unitPrice = Number(item.subtotal) / Number(item.qtyPurchase);
  } else {
    item.unitPrice = 0;
  }
};

const onSubtotalInput = (item, e) => {
  const v = e.target.value;
  if (v.endsWith(',') || v.endsWith('.')) return;
  item.subtotal = parseThousand(v);
  onItemQtyOrSubtotalChange(item);
};

const onDiscountNominalInput = (e) => {
  const v = e.target.value;
  if (v.endsWith(',') || v.endsWith('.')) return;
  form.discountNominal = parseThousand(v);
};

const onShippingCostInput = (e) => {
  const v = e.target.value;
  if (v.endsWith(',') || v.endsWith('.')) return;
  form.shippingCost = parseThousand(v);
};

const onPackagingCostInput = (e) => {
  const v = e.target.value;
  if (v.endsWith(',') || v.endsWith('.')) return;
  form.packagingCost = parseThousand(v);
};

// Reset nilai yang berlawanan saat beralih tipe diskon
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

// Non-Barang/Jasa tidak memakai master — bersihkan pilihan barang saat pindah tipe.
watch(
  () => form.purchaseType,
  (type) => {
    if (type === 'non_barang') {
      items.value.forEach((it) => { it.goodId = ''; });
    }
  }
);

// Jaga agar input persen tidak lebih dari 100
watch(
  () => form.discountPercent,
  (val) => {
    if (val > 100) form.discountPercent = 100;
    else if (val < 0) form.discountPercent = 0;
  }
);

// ── Pricing Calculations ───────────────────────────────────────────────────
const totalPrice = computed(() =>
  items.value.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0)
);

const discountNominalValue = computed(() => {
  if (form.discountType === 'nominal') {
    return Number(form.discountNominal) || 0;
  }
  return ((totalPrice.value || 0) * (Number(form.discountPercent) || 0)) / 100;
});

const getNetUnitPrice = (item) => {
  if (!totalPrice.value || !item.qtyPurchase) return 0;
  const rawGrandTotal = Math.max(
    0,
    totalPrice.value - discountNominalValue.value + (Number(form.shippingCost) || 0) + (Number(form.packagingCost) || 0)
  );
  const itemNetSubtotal = (Number(item.subtotal) / totalPrice.value) * rawGrandTotal;
  return Math.max(0, itemNetSubtotal / Number(item.qtyPurchase));
};

const grandTotal = computed(() =>
  items.value.reduce((sum, item) => sum + getNetUnitPrice(item) * (Number(item.qtyPurchase) || 0), 0)
);

const isDuplicateGood = (goodId, currentIndex) => {
  if (!goodId) return false;
  return items.value.some((it, idx) => it.goodId === goodId && idx !== currentIndex);
};

// ── Step Validation ────────────────────────────────────────────────────────
const isStep1Valid = computed(() => {
  return !!(form.locationId && form.picMarketing);
});

const isStep2Valid = computed(() => {
  const isItemsValid =
    items.value.length > 0 &&
    items.value.every((it) => {
      const hasIdentity = form.purchaseType === 'non_barang'
        ? !!(it.itemName && it.itemName.trim())
        : !!it.goodId;
      return hasIdentity && Number(it.qtyPurchase) > 0 && Number(it.subtotal) > 0;
    });
  const isDiscountValid =
    form.discountType === 'nominal'
      ? Number(form.discountNominal) <= totalPrice.value
      : Number(form.discountPercent) <= 100;
  const isGrandTotalValid = grandTotal.value >= 0;
  return isItemsValid && isDiscountValid && isGrandTotalValid;
});

const statusBadgeClass = (s) => ({
  draft: 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  diajukan: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  disetujui: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
  diterima: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400',
  selesai: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  batal: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
}[s] || 'bg-gray-100 border-gray-200 text-gray-700');

const resetForm = () => {
  currentStep.value = 1;
  Object.assign(form, defaultFormData());
  if (!canPickAnyPic.value) {
    form.picMarketing = authStore.user?.employeeId || authStore.user?.employee_id || '';
  }
  items.value = [blankItem()];
};

const loadDetailData = async (id) => {
  try {
    const detail = await store.fetchDetail(id);
    if (!detail) return;
    currentStep.value = 1;
    Object.assign(form, {
      purchaseType: detail.purchaseType || 'barang',
      sourceType: detail.sourceType || 'tanpa_pengajuan',
      locationId: detail.locationId || '',
      picMarketing: detail.picMarketing || '',
      vendorName: detail.vendorName || '',
      datePurchase: detail.datePurchase || '',
      dateArrive: detail.dateArrive || '',
      payment: detail.payment || '',
      paymentMethod: detail.paymentMethod || '',
      notes: detail.notes || '',
      discountType: detail.discountType || 'percent',
      discountPercent: Number(detail.discountPercent) || 0,
      discountNominal: Number(detail.discountNominal) || 0,
      shippingCost: Number(detail.shippingCost) || 0,
      packagingCost: Number(detail.packagingCost) || 0,
    });

    items.value = (detail.items || []).map((it) => ({
      goodId: it.goodId || '',
      itemName: it.itemName || it.goodName || '',
      requestDetailId: it.requestDetailId || null,
      qtyPurchase: it.qtyPurchase || 0,
      unitPrice: it.unitPrice || 0,
      subtotal: Number(it.subtotal) || (Number(it.qtyPurchase) || 0) * (Number(it.unitPrice) || 0),
      notes: it.notes || '',
    }));
    if (!items.value.length) items.value = [blankItem()];
  } catch (err) {
    console.error('Failed to fetch purchase detail for edit', err);
    Alert.error('Gagal', 'Tidak dapat memuat data purchase.');
  }
};

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      if (props.purchaseId) {
        await loadDetailData(props.purchaseId);
      } else {
        resetForm();
      }
    }
  }
);

onMounted(() => {
  if (props.modelValue) {
    if (props.purchaseId) loadDetailData(props.purchaseId);
    else resetForm();
  }
});

const handleClose = () => {
  isOpen.value = false;
  emit('update:modelValue', false);
  emit('close');
};

const handleSave = async (targetStatus = 'draft') => {
  if (!form.locationId) {
    Alert.error('Validasi Gagal', 'Lokasi tujuan wajib dipilih.');
    return;
  }
  if (!form.picMarketing) {
    Alert.error('Validasi Gagal', 'PIC Marketing wajib dipilih.');
    return;
  }
  if (!items.value.length) {
    Alert.error('Validasi Gagal', 'Daftar item pembelian tidak boleh kosong.');
    return;
  }
  if (form.purchaseType === 'barang' && items.value.some((it) => !it.goodId)) {
    Alert.error('Validasi Gagal', 'Semua baris item wajib memilih barang untuk Tipe Pembelian Barang/Stok.');
    return;
  }
  if (form.purchaseType === 'non_barang' && items.value.some((it) => !it.itemName || !it.itemName.trim())) {
    Alert.error('Validasi Gagal', 'Setiap item Non-Barang/Jasa wajib diisi Nama Item Manual.');
    return;
  }
  if (items.value.some((it) => Number(it.qtyPurchase) <= 0)) {
    Alert.error('Validasi Gagal', 'Jumlah (QTY) pada setiap item harus lebih dari 0.');
    return;
  }
  if (items.value.some((it) => Number(it.subtotal) <= 0)) {
    Alert.error('Validasi Gagal', 'Total harga pada setiap item harus lebih dari 0.');
    return;
  }
  if (form.discountType === 'nominal' && Number(form.discountNominal) > totalPrice.value) {
    Alert.error(
      'Validasi Gagal',
      `Diskon nominal (Rp ${formatThousand(form.discountNominal)}) tidak boleh melebihi total harga item (Rp ${formatThousand(totalPrice.value)}).`
    );
    return;
  }
  if (form.discountType === 'percent' && Number(form.discountPercent) > 100) {
    Alert.error('Validasi Gagal', 'Persentase diskon tidak boleh melebihi 100%.');
    return;
  }
  if (grandTotal.value < 0) {
    Alert.error('Validasi Gagal', 'Grand total pembelian tidak boleh bernilai negatif.');
    return;
  }
  if (!isEdit.value && !evidenceManagerRef.value?.validateLinks()) return;

  const actionLabel = isEdit.value
    ? 'Simpan perubahan data'
    : (targetStatus === 'diajukan' ? 'Ajukan' : 'Simpan draft');
  const confirmed = await Alert.confirm('Konfirmasi', `${actionLabel} purchase marketing ini?`);
  if (!confirmed) return;

  // unit_price yang dikirim harus tetap harga mentah per item — diskon/ongkir/packaging
  // dihitung backend di level header (lihat purchase.service.js create/update). getNetUnitPrice()
  // di sini murni untuk tampilan kolom "Harga Satuan (Net)"; mengirimnya sebagai unit_price
  // membuat backend menerapkan diskon & ongkir/packaging dua kali.
  isSubmitting.value = true;
  try {
    let res = null;
    if (isEdit.value) {
      res = await store.updatePurchase(props.purchaseId, form, items.value);
      if (targetStatus === 'diajukan' && purchaseDetail.value?.status === 'draft') {
        await store.updateStatus(props.purchaseId, { status: 'diajukan' });
      }
      Alert.toast('Purchase Marketing berhasil diperbarui.', 'success');
    } else {
      res = await store.createPurchase(form, items.value);
      const newId = res?.data?.id || res?.id || res?.data?.data?.id;

      // Upload staged evidences if any
      const pending = evidenceManagerRef.value?.getPending?.();
      if (pending && MarketingPurchaseMapper.hasEvidencePayload(pending) && newId) {
        try {
          await store.uploadEvidences(newId, pending);
        } catch (evidenceErr) {
          console.error('Evidence upload error on create', evidenceErr);
          Alert.toast('Purchase tersimpan, namun beberapa dokumen gagal diunggah.', 'warning');
        }
      }

      // If user submitted as 'diajukan', update status
      if (targetStatus === 'diajukan' && newId) {
        try {
          await store.updateStatus(newId, { status: 'diajukan' });
        } catch (e) {
          console.error('Auto status submit error', e);
        }
      }

      Alert.toast(
        targetStatus === 'diajukan'
          ? 'Purchase Marketing berhasil diajukan.'
          : 'Purchase Marketing berhasil disimpan sebagai draft.',
        'success'
      );
    }

    emit('saved', res);
    handleClose();
  } catch (error) {
    console.error('MarketingPurchaseFormModal: Submit error', error);
    Alert.error('Gagal Simpan', getApiErrorMessage(error, 'Terjadi kesalahan saat menyimpan data.'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

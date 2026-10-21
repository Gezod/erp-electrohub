<template>
  <AdminLayout>
    <div class="mx-auto max-w-(--breakpoint-2xl) space-y-8 pb-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div class="flex items-center gap-4">
          <button
            @click="router.back()"
            class="flex items-center justify-center w-11 h-11 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition shadow-sm active:scale-95"
          >
            <MoveLeft class="w-5 h-5" />
          </button>
          <div>
            <p class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Detail & Mutasi Stok</p>
            <h2 class="text-2xl font-black text-gray-800 dark:text-white tracking-tight leading-none">
              {{ detail?.good?.good_name || 'Loading...' }}
            </h2>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-[10px] font-mono text-gray-400">{{ detail?.good?.good_code || '-' }}</span>
              <span class="text-gray-200 dark:text-gray-700">·</span>
              <span :class="[
                'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest',
                detail?.is_valued
                  ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
              ]">
                {{ detail?.is_valued ? 'Stok Bernilai' : 'Stok Tidak Bernilai' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-5 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl text-center">
          <div class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Stok Awal</div>
          <div class="text-2xl font-black text-emerald-700 dark:text-emerald-400">{{ Number(detail?.qty_first ?? 0) }}</div>
        </div>
        <div class="p-5 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl text-center">
          <div class="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Total Masuk</div>
          <div class="text-2xl font-black text-blue-700 dark:text-blue-400">{{ Number(detail?.qty_in ?? 0) }}</div>
        </div>
        <div class="p-5 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-2xl text-center">
          <div class="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Total Keluar</div>
          <div class="text-2xl font-black text-red-700 dark:text-red-400">{{ Number(detail?.qty_out ?? 0) }}</div>
        </div>
        <div :class="[
          'p-5 border rounded-2xl text-center',
          qtyCurrent <= 0
            ? 'bg-gray-50 dark:bg-gray-800 border-red-200 dark:border-red-500/30'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'
        ]">
          <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Stok Terkini</div>
          <div :class="['text-2xl font-black', qtyCurrent <= 0 ? 'text-red-600' : 'text-gray-900 dark:text-white']">
            {{ qtyCurrent }}
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">

          <!-- Item Info Card -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex items-center gap-2">
              <Package class="w-4 h-4 text-brand-500" />
              <h3 class="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Informasi Barang</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Nama Barang</span>
                <p class="font-bold text-gray-800 dark:text-white">{{ detail?.good?.good_name || '-' }}</p>
              </div>
              <div>
                <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Kode Barang</span>
                <p class="font-mono font-bold text-brand-600 dark:text-brand-400">{{ detail?.good?.good_code || '-' }}</p>
              </div>
              <div>
                <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Satuan (UoM)</span>
                <p class="font-bold text-gray-700 dark:text-gray-300">{{ detail?.good?.uom?.name || detail?.good?.uom?.code || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Stock Info Card -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex items-center gap-2">
              <Warehouse class="w-4 h-4 text-brand-500" />
              <h3 class="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Lokasi & PIC</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Lokasi Simpan</span>
                <div class="flex items-center gap-2">
                  <MapPin class="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <p class="font-bold text-gray-800 dark:text-white">{{ detail?.location?.location_name || '-' }}</p>
                </div>
              </div>
              <div>
                <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">PIC Pemilik</span>
                <div class="flex items-center gap-2">
                  <User class="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <p class="font-bold text-gray-800 dark:text-white">{{ detail?.employee?.full_name || 'Stok Umum' }}</p>
                </div>
              </div>
              <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
                <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Harga Satuan (Unit Cost)</span>
                <p class="text-lg font-black" :class="detail?.is_valued ? 'text-brand-600 dark:text-brand-400' : 'text-amber-500'">
                  {{ formatCurrency(detail?.unit_cost ?? 0) }}
                </p>
                <p class="text-[10px] text-gray-400 mt-0.5">
                  Total Nilai: <span class="font-bold text-gray-600 dark:text-gray-300">{{ formatCurrency(qtyCurrent * Number(detail?.unit_cost ?? 0)) }}</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Input Movement Form -->
          <div v-can="'marketing-stock:update'" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex items-center gap-2">
              <ArrowUpDown class="w-4 h-4 text-brand-500" />
              <h3 class="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Input Mutasi Manual</h3>
            </div>
            <div class="p-6">
              <form @submit.prevent="handleAddMovement" class="space-y-4">
                <!-- Movement Type -->
                <div class="space-y-1.5">
                  <label class="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">Tipe Mutasi</label>
                  <select v-model="moveForm.movementType" required class="input-sm">
                    <option value="in">Barang Masuk (IN)</option>
                    <option value="out">Barang Keluar (OUT)</option>
                    <option value="adjustment">Penyesuaian (ADJUSTMENT)</option>
                  </select>
                </div>

                <!-- Qty (Hidden in Adjustment) -->
                <div v-if="moveForm.movementType !== 'adjustment'" class="space-y-1.5">
                  <label class="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">Jumlah (Qty)</label>
                  <input
                    v-model.number="moveForm.qty"
                    type="number"
                    step="any"
                    min="0"
                    required
                    class="input-sm"
                    placeholder="0"
                  />
                </div>

                <!-- Adjustment Fields -->
                <template v-if="moveForm.movementType === 'adjustment'">
                  <div class="space-y-1.5">
                    <label class="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">Field Target</label>
                    <select v-model="moveForm.adjustmentField" required class="input-sm">
                      <option value="qty_first">Stok Awal (qty_first)</option>
                      <option value="qty_in">Stok Masuk (qty_in)</option>
                      <option value="qty_out">Stok Keluar (qty_out)</option>
                    </select>
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">Nilai Absolut Baru</label>
                    <input v-model.number="moveForm.adjustmentValue" type="number" step="any" min="0" required class="input-sm" />
                    <p class="text-[10px] text-amber-500 font-bold">⚠ Nilai akan di-SET langsung, bukan ditambah/dikurangi.</p>
                  </div>
                </template>

                <!-- Unit Cost (hanya mutasi masuk pada stok bernilai) -->
                <div v-if="moveForm.movementType === 'in' && detail?.is_valued" class="space-y-1.5">
                  <label class="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">Harga Satuan</label>
                  <input
                    v-model.number="moveForm.costPerUnit"
                    type="number"
                    step="any"
                    min="0"
                    required
                    class="input-sm"
                    placeholder="0"
                  />
                  <p class="text-[10px] text-gray-400">Dipakai untuk menghitung ulang harga rata-rata (WAC) stok ini.</p>
                </div>

                <!-- Notes -->
                <div class="space-y-1.5">
                  <label class="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">Keterangan</label>
                  <input v-model="moveForm.notes" type="text" placeholder="Contoh: Penerimaan barang event" class="input-sm" />
                </div>

                <button
                  type="submit"
                  :disabled="store.isLoading"
                  class="w-full py-3 bg-brand-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-600 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95"
                >
                  <span v-if="store.isLoading" class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                  <span v-else><Plus class="w-4 h-4" /></span>
                  Simpan Mutasi
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Movement Log Table -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <History class="w-4 h-4 text-brand-500" />
                <h3 class="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Log Mutasi Barang</h3>
              </div>
              <Badge color="info" variant="light" class="text-[10px] font-black px-3">{{ store.movements.length }} Catatan</Badge>
            </div>

            <DataTable
              :columns="moveColumns"
              :data="store.movements"
              :loading="store.isLoading"
              :server-side="false"
              v-model:current-page="currentPage"
            >
              <template #cell-dateMovement="{ item }">
                <span class="text-xs text-gray-800 dark:text-gray-200 font-bold">
                  {{ formatDate(item.dateMovement) }}
                </span>
              </template>

              <template #cell-movementType="{ item }">
                <Badge :color="getMovementColor(item.movementType)" variant="light" class="uppercase text-[9px] font-black px-2.5">
                  {{ getMovementLabel(item.movementType) }}
                </Badge>
              </template>

              <template #cell-qty="{ item }">
                <div v-if="item.movementType === 'adjustment'" class="text-sm text-gray-400">-</div>
                <div v-else :class="['font-black text-sm', isOutMovement(item.movementType) ? 'text-red-500' : 'text-blue-500']">
                  {{ isOutMovement(item.movementType) ? '-' : '+' }}{{ item.qty }}
                </div>
              </template>

              <template #cell-balanceAfter="{ item }">
                <span class="text-xs text-gray-800 dark:text-gray-200 font-bold">{{ item.balanceAfter }}</span>
              </template>

              <template #cell-locationName="{ item }">
                <span class="text-xs text-gray-800 dark:text-gray-200 font-bold">{{ item.locationName }}</span>
              </template>

              <template #cell-notes="{ item }">
                <div class="max-w-[280px] whitespace-normal break-words">
                  <span class="text-xs text-gray-800 dark:text-gray-200 block font-bold">{{ item.notes || '-' }}</span>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted, ref, reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import DataTable from '@/components/tables/DataTable.vue';
import Badge from '@/components/ui/Badge.vue';
import { useMarketingStockStore } from './marketingStock.store';
import { Alert } from '@/plugins/sweetalert';
import {
  MoveLeft, Package, MapPin, User, Warehouse,
  ArrowUpDown, Plus, History
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const store = useMarketingStockStore();

const currentPage = ref(1);

// Detail mentah dari store (masih snake_case dari backend)
const detail = computed(() => store.stockDetail);
const qtyCurrent = computed(() => Number(detail.value?.qty_current ?? 0));

const moveColumns = [
  { key: 'dateMovement', label: 'Tanggal' },
  { key: 'movementType', label: 'Tipe' },
  { key: 'qty', label: 'Jumlah' },
  { key: 'balanceAfter', label: 'Saldo' },
  { key: 'locationName', label: 'Lokasi' },
  { key: 'notes', label: 'Keterangan', width: '280px' },
];

const moveForm = reactive({
  movementType: 'in',
  qty: 1,
  costPerUnit: 0,
  notes: '',
  locationId: '',
  adjustmentField: 'qty_first',
  adjustmentValue: 0,
});

// Watch movement type to set default adjustment value
watch(() => moveForm.movementType, (newVal) => {
  if (newVal === 'adjustment') {
    moveForm.adjustmentValue = detail.value?.qty_first || 0;
    moveForm.adjustmentField = 'qty_first';
  }
});

// Watch target field to update default value
watch(() => moveForm.adjustmentField, (newField) => {
  if (moveForm.movementType === 'adjustment') {
    if (newField === 'qty_first') moveForm.adjustmentValue = detail.value?.qty_first || 0;
    if (newField === 'qty_in') moveForm.adjustmentValue = detail.value?.qty_in || 0;
    if (newField === 'qty_out') moveForm.adjustmentValue = detail.value?.qty_out || 0;
  }
});

const refreshDetail = async () => {
  const stockId = route.params.id;
  try {
    await Promise.all([
      store.fetchDetail(stockId),
      store.fetchMovements(stockId),
    ]);
    // location_id dikunci ke lokasi stok ini — kalau beda, engine membuat baris stok baru
    moveForm.locationId = store.stockDetail?.location_id || '';
    moveForm.costPerUnit = Number(store.stockDetail?.unit_cost ?? 0);
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Data stok tidak ditemukan');
    router.push({ name: 'MarketingStockList' });
  }
};

onMounted(refreshDetail);

const getMovementColor = (type) => {
  const map = {
    in: 'info',
    out: 'error',
    initial: 'success',
    adjustment: 'warning',
    transfer_in: 'info',
    transfer_out: 'error',
  };
  return map[type] || 'neutral';
};

const getMovementLabel = (type) => {
  const map = {
    in: 'Masuk',
    out: 'Keluar',
    initial: 'Awal',
    adjustment: 'Adjust',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
  };
  return map[type] || type;
};

const isOutMovement = (type) => ['out', 'transfer_out'].includes(type);

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '-';
  const num = Number(amount);
  const str = String(num);
  const decimalPart = str.includes('.') ? str.split('.')[1] : '';
  const decimalCount = decimalPart.length;

  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimalCount > 0 ? Math.min(decimalCount, 2) : 0,
    maximumFractionDigits: Math.max(decimalCount, 4),
  }).format(num);
  return `Rp ${formatted}`;
};

const handleAddMovement = async () => {
  if (moveForm.movementType !== 'adjustment' && !(moveForm.qty > 0)) {
    Alert.error('Validasi', 'Jumlah mutasi harus lebih dari 0');
    return;
  }

  if (moveForm.movementType === 'out' && moveForm.qty > qtyCurrent.value) {
    Alert.error('Validasi', `Stok tidak mencukupi. Tersedia: ${qtyCurrent.value}`);
    return;
  }

  try {
    await store.addMovement(route.params.id, moveForm);
    Alert.success('Berhasil', 'Mutasi stok tersimpan');
    currentPage.value = 1;
    moveForm.qty = 1;
    moveForm.notes = '';
    moveForm.costPerUnit = Number(store.stockDetail?.unit_cost ?? 0);
    moveForm.adjustmentValue = 0;
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Terjadi kesalahan saat mencatat mutasi');
  }
};
</script>

<style scoped lang="postcss">
@reference "../../../assets/main.css";

.input-sm {
  @apply w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10;
}
</style>

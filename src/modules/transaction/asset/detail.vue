<template>
  <AdminLayout>
    <div class="mx-auto max-w-(--breakpoint-2xl) space-y-6 text-gray-800 dark:text-white/90">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button @click="router.back()"
          class="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition shadow-sm">
          <MoveLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <PageBreadcrumb pageTitle="Detail Aset" />
          <h2 class="text-2xl font-bold -mt-1">
            {{ detail?.good?.good_name || 'Loading...' }}
            <span
              v-if="detail?.tipe === 'opening' || detail?.tipe === 'parfum'"
              class="ml-1.5 inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 text-[10px] font-semibold rounded-full uppercase tracking-wide align-middle"
            >
              {{ detail?.tipe === 'parfum' ? 'Parfum' : 'Opening' }}
            </span>
          </h2>
        </div>
        <div class="flex gap-2">
          <button v-can="'assets:update'" @click="showFormModal = true"
            class="px-4 py-2 text-sm font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2">
            <Edit2 class="w-4 h-4" /> Edit
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Asset Info -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <h3 class="font-bold text-gray-800 dark:text-white mb-4">Informasi Aset</h3>
            <div class="space-y-3 text-sm">
              <div><span class="text-xs font-black text-gray-400 uppercase block mb-1">Kode Aset</span>
                <p class="font-mono font-bold text-gray-700 dark:text-gray-300">{{ detail?.codeAsset || '-' }}</p>
              </div>
              <div><span class="text-xs font-black text-gray-400 uppercase block mb-1">Label</span>
                <p class="font-semibold text-gray-700 dark:text-gray-300">{{ detail?.assetLabel || '-' }}</p>
              </div>
              <div><span class="text-xs font-black text-gray-400 uppercase block mb-1">Merk / Brand</span>
                <p class="font-semibold text-gray-700 dark:text-gray-300">{{ detail?.good?.merk || '-' }}</p>
              </div>
              <div><span class="text-xs font-black text-gray-400 uppercase block mb-1">Lokasi</span>
                <p class="font-semibold text-gray-700 dark:text-gray-300">{{ detail?.location?.location_name || '-' }}
                </p>
              </div>
              <div><span class="text-xs font-black text-gray-400 uppercase block mb-1">Tanggal Perolehan</span>
                <p class="font-semibold text-gray-700 dark:text-gray-300">{{ detail?.dateAcquired ? formatDate(detail.dateAcquired) : '-' }}</p>
              </div>
              <div><span class="text-xs font-black text-gray-400 uppercase block mb-1">PIC / Pengguna</span>
                <p class="font-semibold text-gray-700 dark:text-gray-300">{{ detail?.picName || '-' }}</p>
              </div>
              <div><span class="text-xs font-black text-gray-400 uppercase block mb-1">Penanggung Jawab (PJ)</span>
                <p class="font-semibold text-gray-700 dark:text-gray-300">{{ detail?.pjName || '-' }}</p>
              </div>
              <div><span class="text-xs font-black text-gray-400 uppercase block mb-1">Tanggal Penyerahan PJ</span>
                <p class="font-semibold text-gray-700 dark:text-gray-300">{{ detail?.handoverDate ? formatDate(detail.handoverDate) : '-' }}</p>
              </div>
              <div v-if="detail?.condition === 'sold'"><span class="text-xs font-black text-gray-400 uppercase block mb-1">Nilai Terjual</span>
                <p class="font-semibold text-gray-700 dark:text-gray-300">{{ detail?.soldPrice ? formatCurrency(detail.soldPrice) : '-' }}</p>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Kondisi</span>
                  <Badge :color="conditionColor(detail?.condition)" variant="light" class="uppercase text-[10px]">
                    {{ conditionLabel(detail?.condition) }}
                  </Badge>
                </div>
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Status</span>
                  <Badge :color="detail?.isActive ? 'success' : 'danger'" variant="light" class="uppercase text-[10px]">
                    {{ detail?.isActive ? 'Aktif' : 'Tidak Aktif' }}
                  </Badge>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div class="p-3 bg-blue-50 rounded-xl text-center dark:bg-blue-500/10">
                  <span class="text-[9px] font-bold text-blue-600 uppercase block mb-1">Nilai Perolehan</span>
                  <span class="text-sm font-black text-blue-700 dark:text-blue-400">{{
                    formatCurrency(detail?.acquisitionCost) }}</span>
                </div>
                <div class="p-3 bg-emerald-50 rounded-xl text-center dark:bg-emerald-500/10">
                  <span class="text-[9px] font-bold text-emerald-600 uppercase block mb-1">Nilai Buku</span>
                  <span class="text-sm font-black text-emerald-700 dark:text-emerald-400">{{
                    formatCurrency(detail?.bookValue) }}</span>
                </div>
              </div>
              <div v-if="detail?.condition === 'sold' && detail?.soldPrice" class="mt-3 p-3 bg-amber-50 rounded-xl text-center dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/30">
                <span class="text-[9px] font-bold text-amber-600 uppercase block mb-1">Nominal Terjual</span>
                <span class="text-sm font-black text-amber-700 dark:text-amber-400">{{
                  formatCurrency(detail?.soldPrice) }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Adjust -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <h3 class="font-bold text-gray-800 dark:text-white mb-1">Adjust Aset</h3>
            <p class="text-xs text-gray-500 mb-4">Ubah kondisi atau status aset.</p>
            <form @submit.prevent="handleAdjust" class="space-y-3">
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Kondisi</label>
                <select v-model="adjustForm.condition" class="input-sm">
                  <option value="">Tidak diubah</option>
                  <option value="good">Good</option>
                  <option value="service">Service</option>
                  <option value="broken">Broken</option>
                  <option value="incorrect">Incorrect</option>
                  <option value="sold">Sold (Dispose)</option>
                </select>
              </div>
              <div class="space-y-1" v-if="adjustForm.condition === 'sold'">
                <label class="text-xs font-bold text-gray-500">Nominal Terjual <span class="text-red-500">*</span></label>
                <input v-model="formattedSoldPrice" type="text" required class="input-sm" placeholder="Nominal terjual..." @keypress="onlyNumber" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Catatan</label>
                <input v-model="adjustForm.note" type="text" placeholder="Keterangan adjust..." class="input-sm" />
              </div>
              <button type="submit" :disabled="assetStore.isLoading"
                class="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700">
                Simpan Adjust
              </button>
            </form>
          </div>

          <!-- Add Maintenance -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <h3 class="font-bold text-gray-800 dark:text-white mb-1">Tambah Maintenance</h3>
            <p class="text-xs text-gray-500 mb-4">Catat riwayat servis aset.</p>
            <form @submit.prevent="handleAddMaintenance" class="space-y-3">
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Tanggal Servis <span
                    class="text-red-500">*</span></label>
                <input v-model="maintForm.dateService" type="date" required class="input-sm" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Biaya <span class="text-red-500">*</span></label>
                <input v-model="formattedCost" type="text" required class="input-sm" placeholder="Biaya servis..." @keypress="onlyNumber" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Vendor</label>
                <input v-model="maintForm.vendorName" type="text" placeholder="Nama vendor..." class="input-sm" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Catatan</label>
                <input v-model="maintForm.notes" type="text" placeholder="Detail servis..." class="input-sm" />
              </div>
              <button type="submit" :disabled="assetStore.isLoading"
                class="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700">
                Simpan Maintenance
              </button>
            </form>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Description Card -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div class="flex items-center gap-2.5 mb-3">
              <div
                class="p-2 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 flex items-center justify-center">
                <FileText class="w-4 h-4" />
              </div>
              <h3 class="font-bold text-gray-800 dark:text-white">Deskripsi Aset</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ detail?.description || 'Tidak ada deskripsi untuk aset ini.' }}
            </p>
          </div>

          <!-- Purchase & Request History -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div class="flex items-center gap-2.5 mb-4">
              <div
                class="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center">
                <ShoppingCart class="w-4 h-4" />
              </div>
              <h3 class="font-bold text-gray-800 dark:text-white">Riwayat Pembelian</h3>
            </div>

            <div v-if="detail?.detailPurchase?.purchase" class="space-y-4">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-[10px] font-black text-gray-400 uppercase block mb-1">Kode Pembelian</span>
                  <RouterLink :to="{ name: 'TranPurchaseDetail', params: { id: detail.detailPurchase.purchase.id } }"
                    class="font-mono font-bold text-blue-600 hover:underline">
                    {{ detail.detailPurchase.purchase.purchase_code || '-' }}
                  </RouterLink>
                </div>
                <div>
                  <span class="text-[10px] font-black text-gray-400 uppercase block mb-1">Vendor</span>
                  <p class="font-semibold text-gray-700 dark:text-gray-300">{{ detail.detailPurchase.purchase.vendor_name || '-' }}</p>
                </div>
                <div>
                  <span class="text-[10px] font-black text-gray-400 uppercase block mb-1">Tanggal Beli</span>
                  <p class="font-semibold text-gray-700 dark:text-gray-300">{{ formatDate(detail.detailPurchase.purchase.date_purchase) }}</p>
                </div>
                <div>
                  <span class="text-[10px] font-black text-gray-400 uppercase block mb-1">Tanggal Datang</span>
                  <p class="font-semibold text-gray-700 dark:text-gray-300">{{ formatDate(detail.detailPurchase.purchase.date_arrive) }}</p>
                </div>
              </div>

              <div v-if="detail.detailPurchase.purchase.request"
                class="pt-4 border-t border-gray-100 dark:border-gray-800">
                <span class="text-[10px] font-black text-gray-400 uppercase block mb-2">Asal Pengajuan (Request)</span>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="text-[10px] font-black text-gray-400 uppercase block mb-1">Kode Pengajuan</span>
                    <RouterLink :to="{ name: 'RequestDetail', params: { id: detail.detailPurchase.purchase.request.id } }"
                      class="font-mono font-bold text-blue-600 hover:underline">
                      {{ detail.detailPurchase.purchase.request.code_request || '-' }}
                    </RouterLink>
                  </div>
                  <div>
                    <span class="text-[10px] font-black text-gray-400 uppercase block mb-1">Tanggal Pengajuan</span>
                    <p class="font-semibold text-gray-700 dark:text-gray-300">{{ formatDate(detail.detailPurchase.purchase.request.date_request) }}</p>
                  </div>
                  <div>
                    <span class="text-[10px] font-black text-gray-400 uppercase block mb-1">Tujuan</span>
                    <p class="font-semibold text-gray-700 dark:text-gray-300 truncate">{{ detail.detailPurchase.purchase.request.purpose || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="p-6 text-center text-gray-400 text-sm">
              Aset ini tidak tercatat berasal dari pembelian mana pun (input manual).
            </div>
          </div>

          <!-- Adjustment History -->
          <div
            class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 class="font-bold text-gray-800 dark:text-white">Riwayat Adjustment</h3>
              <Badge color="neutral" variant="light">{{ assetStore.adjustments?.length || 0 }} Record</Badge>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm" v-if="assetStore.adjustments?.length">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Tanggal</th>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Oleh</th>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Perubahan</th>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Catatan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="a in assetStore.adjustments" :key="a.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td class="px-4 py-3 text-xs text-gray-500">{{ formatDate(a.created_at) }}</td>
                    <td class="px-4 py-3 font-medium">{{ a.user?.full_name || '-' }}</td>
                    <td class="px-4 py-3 text-xs font-semibold text-blue-600">{{ formatAdjustmentChanges(a) }}</td>
                    <td class="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{{ a.note || '-' }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="p-10 text-center text-gray-400 text-sm">Belum ada riwayat adjustment.</div>
            </div>
          </div>

          <!-- Transfer History -->
          <div
            class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 class="font-bold text-gray-800 dark:text-white">Riwayat Transfer</h3>
              <Badge color="info" variant="light">{{ detail?.transfers?.length || 0 }} Record</Badge>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm" v-if="detail?.transfers?.length">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Tanggal</th>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Dari</th>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Ke</th>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Oleh</th>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Alasan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="t in detail.transfers" :key="t.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td class="px-4 py-3 text-xs text-gray-500">{{ formatDate(t.date_transfer) }}</td>
                    <td class="px-4 py-3 font-medium">
                      {{ t.from_location?.location_name || '-' }}
                      <span class="text-xs text-gray-400 block" v-if="t.from_division?.name">Divisi: {{ t.from_division.name }}</span>
                    </td>
                    <td class="px-4 py-3 font-medium text-blue-600">
                      {{ t.to_location?.location_name || '-' }}
                      <span class="text-xs text-gray-450 block" v-if="t.to_division?.name">Divisi: {{ t.to_division.name }}</span>
                    </td>
                    <td class="px-4 py-3 text-xs">{{ t.transferred_by_emp?.full_name || t.transferred_by_employee?.full_name || '-' }}</td>
                    <td class="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{{ t.reason || '-' }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="p-10 text-center text-gray-400 text-sm">Belum ada riwayat transfer.</div>
            </div>
          </div>

          <!-- Maintenance History -->
          <div
            class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 class="font-bold text-gray-800 dark:text-white">Riwayat Maintenance</h3>
              <Badge color="warning" variant="light">{{ detail?.maintenances?.length || 0 }} Record</Badge>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm" v-if="detail?.maintenances?.length">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Tanggal</th>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Biaya</th>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Vendor</th>
                    <th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Catatan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="m in detail.maintenances" :key="m.id"
                    class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td class="px-4 py-3 text-xs text-gray-500">{{ formatDate(m.date_service) }}</td>
                    <td class="px-4 py-3 font-bold text-gray-800 dark:text-white">{{ formatCurrency(m.cost) }}</td>
                    <td class="px-4 py-3 font-medium">{{ m.vendor_name || '-' }}</td>
                    <td class="px-4 py-3 text-xs text-gray-500 max-w-[250px] truncate">{{ m.notes || '-' }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="p-10 text-center text-gray-400 text-sm">Belum ada riwayat maintenance.</div>
            </div>
          </div>

          <!-- Audit History -->
          <AuditHistory module="ASSET_RECORD" :recordId="route.params.id" />
        </div>
      </div>

      <!-- Asset Form Modal Dialog -->
      <AssetFormModal v-model="showFormModal" :asset-id="route.params.id" @saved="refreshDetail" />
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import Badge from '@/components/ui/Badge.vue';
import AuditHistory from '@/components/common/AuditHistory.vue';
import { useAssetStore } from './asset.store';
import { Alert } from '@/plugins/sweetalert';
import { MoveLeft, Edit2, FileText, ShoppingCart } from 'lucide-vue-next';
import AssetFormModal from './components/AssetFormModal.vue';

const route = useRoute();
const router = useRouter();
const assetStore = useAssetStore();
const showFormModal = ref(false);

const detail = computed(() => assetStore.assetDetail);

const adjustForm = reactive({ condition: '', note: '', soldPrice: 0 });
const maintForm = reactive({
  dateService: new Date().toISOString().split('T')[0],
  cost: 0,
  vendorName: '',
  notes: '',
});

const formattedCost = computed({
  get() {
    if (maintForm.cost === 0 || maintForm.cost === '') return '';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(maintForm.cost);
  },
  set(value) {
    const cleanValue = value.replace(/\D/g, '');
    maintForm.cost = cleanValue ? parseInt(cleanValue, 10) : 0;
  }
});

const formattedSoldPrice = computed({
  get() {
    if (adjustForm.soldPrice === 0 || adjustForm.soldPrice === '') return '';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(adjustForm.soldPrice);
  },
  set(value) {
    const cleanValue = value.replace(/\D/g, '');
    adjustForm.soldPrice = cleanValue ? parseInt(cleanValue, 10) : 0;
  }
});

const onlyNumber = (event) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

onMounted(async () => {
  try {
    await assetStore.fetchDetail(route.params.id);
    await assetStore.fetchAdjustments(route.params.id);
  } catch (err) {
    Alert.error('Gagal', 'Data aset tidak ditemukan');
    router.push({ name: 'TranAssets' });
  }
});

const conditionColor = (c) => ({ good: 'success', service: 'warning', broken: 'error', sold: 'neutral', incorrect: 'neutral' }[c] || 'neutral');
const conditionLabel = (c) => ({ good: 'Baik', service: 'Servis', broken: 'Rusak', sold: 'Terjual', incorrect: 'Salah Input' }[c] || c || '-');

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';
  try { return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return dateStr; }
};

const formatAdjustmentChanges = (log) => {
  const oldVal = log.old_values || {};
  const newVal = log.new_values || {};
  const changes = [];
  
  if (newVal.condition && oldVal.condition !== newVal.condition) {
    changes.push(`Kondisi: ${conditionLabel(oldVal.condition)} → ${conditionLabel(newVal.condition)}`);
  }
  if (newVal.is_active !== undefined && oldVal.is_active !== newVal.is_active) {
    changes.push(`Status: ${oldVal.is_active ? 'Aktif' : 'Tidak Aktif'} → ${newVal.is_active ? 'Aktif' : 'Tidak Aktif'}`);
  }
  if (newVal.acquisition_cost !== undefined && oldVal.acquisition_cost !== newVal.acquisition_cost) {
    changes.push(`Biaya Perolehan`);
  }
  if (newVal.book_value !== undefined && oldVal.book_value !== newVal.book_value) {
    changes.push(`Nilai Buku`);
  }
  if (newVal.sold_price !== undefined && oldVal.sold_price !== newVal.sold_price) {
    changes.push(`Nominal Terjual: ${formatCurrency(oldVal.sold_price)} → ${formatCurrency(newVal.sold_price)}`);
  }
  
  return changes.join(', ') || 'Pembaruan info';
};

const handleAdjust = async () => {
  const payload = {};
  if (adjustForm.condition) payload.condition = adjustForm.condition;
  if (adjustForm.note) payload.note = adjustForm.note;
  if (adjustForm.condition === 'sold') {
    payload.sold_price = adjustForm.soldPrice;
  }

  if (!Object.keys(payload).length) {
    Alert.error('Validasi', 'Pilih setidaknya satu perubahan.');
    return;
  }

  try {
    await assetStore.adjustAsset(route.params.id, payload);
    Alert.success('Berhasil', 'Aset berhasil di-adjust.');
    adjustForm.condition = '';
    adjustForm.note = '';
    adjustForm.soldPrice = 0;
    await assetStore.fetchAdjustments(route.params.id);
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Gagal adjust aset.');
  }
};

const handleAddMaintenance = async () => {
  try {
    await assetStore.addMaintenance(route.params.id, {
      date_service: maintForm.dateService,
      cost: maintForm.cost,
      vendor_name: maintForm.vendorName || undefined,
      notes: maintForm.notes || undefined,
    });
    Alert.success('Berhasil', 'Maintenance tercatat.');
    maintForm.cost = 0;
    maintForm.vendorName = '';
    maintForm.notes = '';
    maintForm.dateService = new Date().toISOString().split('T')[0];
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Gagal mencatat maintenance.');
  }
};

const refreshDetail = async () => {
  try {
    await assetStore.fetchDetail(route.params.id);
    await assetStore.fetchAdjustments(route.params.id);
  } catch (err) {
    console.error(err);
  }
};
</script>

<style scoped>
.input-sm {
  width: 100%;
  font-size: 13px;
  padding: 8px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  transition: all 0.15s ease;
}

.input-sm:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>

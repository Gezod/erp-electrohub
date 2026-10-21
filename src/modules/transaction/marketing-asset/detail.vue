<template>
  <AdminLayout>
    <div v-if="detail" class="max-w-(--breakpoint-2xl) mx-auto space-y-6 pb-20">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div class="flex items-center gap-4">
          <router-link :to="{ name: 'MarketingAssetList' }" class="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"><ArrowLeft class="w-5 h-5 text-gray-400" /></router-link>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-xl font-bold text-gray-800 dark:text-white font-mono">{{ detail.codeAsset }}</h1>
              <Badge :color="statusColor(detail.status)" class="uppercase text-[9px] font-black px-3 py-1">{{ (detail.status || '').replace('_', ' ') }}</Badge>
              <Badge :color="detail.isActive ? 'success' : 'error'" class="uppercase text-[9px] font-black px-3 py-1">{{ detail.isActive ? 'Aktif' : 'Tidak Aktif' }}</Badge>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">{{ detail.good?.good_name }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button v-can="'marketing-assets:update'" type="button" @click="showFormModal = true" class="btn-outline flex items-center gap-2">
            <Edit2 class="w-4 h-4" /> Edit Aset
          </button>
          <router-link v-can="'marketing-transfers:create'" :to="{ name: 'MarketingTransferList', query: { assetId: detail.id } }" class="btn-outline flex items-center gap-2">
            <ArrowLeftRight class="w-4 h-4" /> Transfer Aset Ini
          </router-link>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="lg:col-span-3 space-y-6">
          <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <div class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Informasi Aset</div>
            <div class="flex justify-between text-xs"><span class="text-gray-500">Lokasi Saat Ini:</span><span class="font-bold">{{ detail.location?.location_name }}</span></div>
            <div class="flex justify-between text-xs"><span class="text-gray-500">PIC:</span><span class="font-bold">{{ detail.pic?.full_name || 'Umum' }}</span></div>
            <div class="flex justify-between text-xs"><span class="text-gray-500">Tipe Aset:</span><span class="font-bold">{{ detail.assetType?.name_type || detail.assetTypeName || '-' }}</span></div>
            <div class="flex justify-between text-xs"><span class="text-gray-500">Harga Perolehan:</span><span class="font-bold">Rp {{ formatNumber(detail.acquisitionCost) }}</span></div>
            <div class="flex justify-between text-xs"><span class="text-gray-500">Tgl Perolehan:</span><span class="font-bold">{{ formatDate(detail.dateAcquired) }}</span></div>
            <div class="flex justify-between text-xs"><span class="text-gray-500">Tgl Penyerahan:</span><span class="font-bold">{{ detail.handoverDate ? formatDate(detail.handoverDate) : '-' }}</span></div>
          </div>

          <!-- Riwayat Pembelian — `detail_purchase_id` adalah FK tunggal, jadi satu aset
               secara struktural hanya bisa berasal dari maksimal satu pembelian. -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-gray-100 dark:border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Riwayat Pembelian</div>
            <div v-if="purchase" class="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="space-y-1">
                <div class="text-[10px] font-bold uppercase text-gray-500">Kode</div>
                <router-link :to="{ name: 'MarketingPurchaseDetail', params: { id: purchase.id } }" class="text-xs font-bold text-brand-600 hover:underline font-mono">{{ purchase.purchase_code || '-' }}</router-link>
              </div>
              <div class="space-y-1">
                <div class="text-[10px] font-bold uppercase text-gray-500">Vendor</div>
                <div class="text-xs font-bold text-gray-800 dark:text-white">{{ purchase.vendor_name || '-' }}</div>
              </div>
              <div class="space-y-1">
                <div class="text-[10px] font-bold uppercase text-gray-500">Tanggal Beli</div>
                <div class="text-xs font-bold text-gray-800 dark:text-white">{{ formatDate(purchase.date_purchase) }}</div>
              </div>
              <div class="space-y-1">
                <div class="text-[10px] font-bold uppercase text-gray-500">Tanggal Datang</div>
                <div class="text-xs font-bold text-gray-800 dark:text-white">{{ formatDate(purchase.date_arrive) }}</div>
              </div>
            </div>
            <div v-else class="p-6 text-center text-xs text-gray-400">
              Aset ini tidak tercatat berasal dari pembelian mana pun (input manual).
            </div>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-gray-100 dark:border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Riwayat Perpindahan</div>
            <div v-if="!store.transfers.length" class="p-6 text-center text-xs text-gray-400">Belum ada riwayat transfer.</div>
            <table v-else class="w-full text-xs">
              <thead class="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                <tr><th class="text-left px-4 py-2 font-semibold">Kode</th><th class="text-left px-4 py-2 font-semibold">Rute</th><th class="text-left px-4 py-2 font-semibold">Status</th><th class="text-left px-4 py-2 font-semibold">Tanggal</th></tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="t in store.transfers" :key="t.id">
                  <td class="px-4 py-3"><router-link :to="{ name: 'MarketingTransferDetail', params: { id: t.id } }" class="font-bold text-brand-600 hover:underline">{{ t.transfer_code }}</router-link></td>
                  <td class="px-4 py-3">{{ t.from_location?.location_name }} &rarr; {{ t.to_location?.location_name }}</td>
                  <td class="px-4 py-3"><Badge color="light" class="uppercase text-[8px] font-black">{{ t.status }}</Badge></td>
                  <td class="px-4 py-3">{{ formatDate(t.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Adjust Kondisi &amp; Status</h3>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase text-gray-500">Kondisi</label>
              <select v-model="adjustForm.condition" class="input-base text-sm">
                <option value="baik">Baik</option>
                <option value="rusak">Rusak</option>
                <option value="hilang">Hilang</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase text-gray-500">Status</label>
              <select v-model="adjustForm.status" class="input-base text-sm">
                <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_', ' ') }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase text-gray-500">Keterangan</label>
              <textarea v-model="adjustForm.description" rows="2" class="input-base text-sm"></textarea>
            </div>
            <button v-can="'marketing-assets:update'" @click="doAdjust" :disabled="busy" class="btn-primary w-full">Simpan Perubahan</button>
          </div>
        </div>
      </div>

      <!-- AuditHistory fetch di onMounted dan tidak punya watch pada props,
           jadi `v-if="detail"` wajib supaya recordId sudah terisi saat mount. -->
      <div v-if="detail" class="mt-6">
        <AuditHistory module="MKT_ASSET" :recordId="detail.id" />
      </div>

      <!-- Form Modal (edit penuh) — sama dengan yang dipakai di index -->
      <MarketingAssetFormModal
        v-model="showFormModal"
        :asset-id="route.params.id"
        @saved="store.fetchDetail(route.params.id)"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Badge from '@/components/ui/Badge.vue';
import AuditHistory from '@/components/common/AuditHistory.vue';
import MarketingAssetFormModal from './components/MarketingAssetFormModal.vue';
import { ArrowLeft, ArrowLeftRight, Edit2 } from 'lucide-vue-next';
import { useMarketingAssetStore } from './marketingAsset.store';
import { Alert } from '@/plugins/sweetalert';

const route = useRoute();
const store = useMarketingAssetStore();
const busy = ref(false);
const showFormModal = ref(false);
const statuses = ['tersedia', 'dalam_pengiriman', 'digunakan', 'rusak', 'hilang'];

const detail = computed(() => store.assetDetail);
// `detailPurchase` di-passthrough mentah oleh mapper, jadi field-nya masih snake_case.
const purchase = computed(() => store.assetDetail?.detailPurchase?.purchase || null);
const adjustForm = ref({ condition: 'baik', status: 'tersedia', description: '' });

const statusColor = (s) => ({ tersedia: 'success', dalam_pengiriman: 'warning', digunakan: 'info', rusak: 'error', hilang: 'error' }[s] || 'light');
const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

watch(detail, (d) => {
  if (d) adjustForm.value = { condition: d.condition, status: d.status, description: d.description || '' };
});

const doAdjust = async () => {
  busy.value = true;
  try {
    await store.adjust(route.params.id, adjustForm.value);
    Alert.success('Berhasil', 'Aset diperbarui.');
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

onMounted(() => store.fetchDetail(route.params.id));
</script>

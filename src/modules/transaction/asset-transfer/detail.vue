<template>
  <AdminLayout>
    <div v-if="detail" class="mx-auto max-w-4xl space-y-8 pb-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <button @click="router.back()"
            class="flex items-center justify-center w-12 h-12 rounded-2xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition shadow-sm active:scale-95 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400">
            <ArrowLeft class="w-6 h-6" />
          </button>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 bg-brand-500/10 text-brand-500 text-[9px] font-black uppercase tracking-widest rounded">
                {{ detail.assetId ? 'Asset Transfer' : 'Stock Transfer' }}
              </span>
              <h2 class="text-2xl font-black text-gray-800 dark:text-white tracking-tight leading-none">
                {{ detail.code }}
              </h2>
            </div>
            <div class="flex items-center gap-3">
              <Badge :color="getStatusColor(detail.status)" variant="light" class="uppercase text-[9px] font-black px-3 py-1 rounded-full">
                {{ detail.status }}
              </Badge>
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                Recorded on {{ formatDate(detail.transferDate) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button 
            v-if="detail.status === 'draft'"
            @click="handleUpdateStatus('completed')"
            :disabled="transferStore.isLoading"
            class="px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20 flex items-center gap-3 active:scale-95 cursor-pointer"
          >
            <CheckCircle class="w-5 h-5" />
            <span>Selesaikan Mutasi</span>
          </button>
          <button 
            v-if="detail.status === 'pending'"
            @click="handleUpdateStatus('received')"
            :disabled="transferStore.isLoading"
            class="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center gap-3 active:scale-95"
          >
            <CheckCircle class="w-5 h-5" />
            <span>Terima Barang</span>
          </button>
          <button 
            v-if="detail.status === 'pending' || detail.status === 'draft'"
            @click="handleDelete"
            class="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition cursor-pointer"
            title="Hapus Transfer"
          >
            <Trash2 class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Valuation Banner -->
      <div v-if="detail.isValued"
        class="flex items-start gap-4 p-5 rounded-3xl border transition-all duration-300 bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20">
        <div class="p-2 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
          <DollarSign class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Mutasi Bernilai (Valued)
          </h4>
          <p class="text-[11px] mt-1 font-medium leading-relaxed opacity-80 text-blue-600">
            Data perpindahan ini membawa nilai buku barang. Unit cost di lokasi tujuan akan disesuaikan.
          </p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Details & Route -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Item Information Card -->
          <div class="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <component :is="detail.assetId ? Box : Package" class="w-32 h-32" />
            </div>
            
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Package class="w-4 h-4 text-brand-500" />
              {{ detail.assetId ? 'Asset Details' : 'Stock Details' }}
            </h3>

            <div class="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
              <div class="w-24 h-24 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-inner">
                <component :is="detail.assetId ? Box : Package" class="w-10 h-10 text-gray-400" />
              </div>
              <div class="flex-1 space-y-2">
                <h4 class="text-2xl font-black text-gray-800 dark:text-white leading-tight tracking-tight">
                  {{ detail.asset?.good?.good_name || detail.good?.good_name || 'Unknown Item' }}
                </h4>
                <div class="flex flex-wrap items-center gap-3">
                  <p class="text-[11px] font-mono font-bold text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                    CODE: {{ detail.asset?.code_asset || detail.good?.good_code || '-' }}
                  </p>
                  <p v-if="!detail.assetId" class="text-[11px] font-black text-brand-600 bg-brand-50 dark:bg-brand-500/5 px-3 py-1 rounded-lg border border-brand-100 dark:border-brand-500/20 uppercase">
                    Quantity: {{ detail.qty }} {{ detail.good?.uom?.name || 'Unit' }}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                  <div v-if="detail.asset?.merk || detail.good?.merk">
                    <span class="text-[9px] font-black text-gray-400 uppercase block tracking-widest mb-1">Merk / Brand</span>
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ detail.asset?.merk || detail.good?.merk || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-[9px] font-black text-gray-400 uppercase block tracking-widest mb-1">Serial Number</span>
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ detail.asset?.serial_number || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Route Visualization -->
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
            <div class="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                  <ArrowRightLeft class="w-4 h-4" />
                </div>
                <h3 class="font-bold text-gray-800 dark:text-white uppercase text-xs tracking-widest">Alur Perpindahan</h3>
              </div>
              <div class="text-[10px] font-black text-gray-400 italic">
                Processed by: <span class="text-brand-500 not-italic">{{ detail.transferredBy }}</span>
              </div>
            </div>

            <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 relative">
              <!-- Connector -->
              <div class="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div class="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 border-4 border-white dark:border-gray-900 animate-pulse-slow">
                  <ArrowRight class="w-6 h-6" />
                </div>
              </div>

              <!-- FROM -->
              <div class="relative">
                <div class="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-6">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Lokasi Asal</span>
                    <div class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-gray-400">A</div>
                  </div>
                  <div class="space-y-4">
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-brand-500">
                        <MapPin class="w-5 h-5" />
                      </div>
                      <div>
                        <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.fromLocationName }}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5">Physical Origin</div>
                      </div>
                    </div>
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-brand-500">
                        <User class="w-5 h-5" />
                      </div>
                      <div>
                        <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.fromPicName }}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5">PIC Penyerah</div>
                      </div>
                    </div>
                    <div class="flex items-start gap-4" v-if="detail.fromDivisionName && detail.fromDivisionName !== '-'">
                      <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-brand-500">
                        <Briefcase class="w-5 h-5" />
                      </div>
                      <div>
                        <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.fromDivisionName }}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5">Divisi Asal</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TO -->
              <div class="relative">
                <div class="p-6 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 space-y-6">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Lokasi Tujuan</span>
                    <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">B</div>
                  </div>
                  <div class="space-y-4">
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-emerald-600">
                        <MapPin class="w-5 h-5" />
                      </div>
                      <div>
                        <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.toLocationName }}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5">Physical Destination</div>
                      </div>
                    </div>
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-emerald-600">
                        <User class="w-5 h-5" />
                      </div>
                      <div>
                        <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.toPicName }}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5">PIC Penerima</div>
                      </div>
                    </div>
                    <div class="flex items-start gap-4" v-if="detail.toDivisionName && detail.toDivisionName !== '-'">
                      <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-emerald-600">
                        <Briefcase class="w-5 h-5" />
                      </div>
                      <div>
                        <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.toDivisionName }}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5">Divisi Tujuan</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Riwayat Transfer Aset (Hanya jika tipe Aset) -->
          <div v-if="detail.assetId && assetTransfers.length > 0" class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl overflow-hidden mb-8">
            <div class="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <h3 class="font-bold text-gray-800 dark:text-white uppercase text-xs tracking-widest">Riwayat Mutasi Aset Ini</h3>
              <Badge color="info" variant="light">{{ assetTransfers.length }} Mutasi</Badge>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-gray-50 dark:bg-gray-800 text-[10px] font-black uppercase text-gray-400">
                  <tr>
                    <th class="px-6 py-4">Kode Transfer</th>
                    <th class="px-6 py-4">Tanggal</th>
                    <th class="px-6 py-4">Dari Lokasi</th>
                    <th class="px-6 py-4">Ke Lokasi</th>
                    <th class="px-6 py-4">Oleh</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  <tr v-for="t in assetTransfers" :key="t.id" :class="['hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors', t.id === detail.id ? 'bg-brand-50/30 dark:bg-brand-500/5 font-bold' : '']">
                    <td class="px-6 py-4 font-mono font-bold">{{ t.transfer_code || '-' }}</td>
                    <td class="px-6 py-4">{{ formatDate(t.date_transfer) }}</td>
                    <td class="px-6 py-4">{{ t.from_location?.location_name || '-' }}</td>
                    <td class="px-6 py-4 text-emerald-600">{{ t.to_location?.location_name || '-' }}</td>
                    <td class="px-6 py-4">{{ t.transferred_by_emp?.full_name || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Audit Logs -->
          <AuditHistory module="ASSET_TRANSFER" :recordId="route.params.id" />
        </div>

        <!-- Right: Metadata & Notes -->
        <div class="space-y-8">
          <!-- Metadata Card -->
          <div class="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-8">
            <div class="space-y-6">
              <h3 class="font-bold text-gray-800 dark:text-white uppercase text-xs tracking-widest flex items-center gap-2">
                <Info class="w-4 h-4 text-brand-500" /> Transfer Log
              </h3>
              
              <div class="space-y-4">
                <div class="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-800">
                  <span class="text-[10px] font-black text-gray-400 uppercase">Status</span>
                  <Badge :color="getStatusColor(detail.status)" variant="light" class="uppercase text-[9px] font-black px-3">{{ detail.status }}</Badge>
                </div>
                <div class="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-800">
                  <span class="text-[10px] font-black text-gray-400 uppercase">Tgl Dikirim</span>
                  <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ formatDate(detail.transferDate) }}</span>
                </div>
                <div v-if="detail.receivedAt" class="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-800">
                  <span class="text-[10px] font-black text-emerald-600 uppercase">Tgl Diterima</span>
                  <span class="text-xs font-bold text-emerald-600">{{ formatDate(detail.receivedAt) }}</span>
                </div>
                <div class="flex justify-between items-center py-2.5">
                  <span class="text-[10px] font-black text-gray-400 uppercase">Process ID</span>
                  <span class="text-[10px] font-mono text-gray-300">#{{ detail.id.slice(0, 8) }}</span>
                </div>
              </div>
            </div>

            <!-- Notes Section -->
            <div class="pt-6 border-t border-gray-50 dark:border-gray-800 space-y-4">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catatan / Alasan</span>
              <div class="relative p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <Quote class="absolute -top-2 -left-1 w-12 h-12 text-gray-200 dark:text-gray-800 opacity-30 rotate-12" />
                <p class="relative z-10 text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
                  {{ detail.notes || 'Tidak ada catatan tambahan.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Context Card -->
          <div class="p-8 bg-gray-900 rounded-3xl text-white shadow-xl shadow-gray-900/20 space-y-5">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Box class="w-4 h-4 text-brand-400" />
              </div>
              <h3 class="font-bold uppercase text-[10px] tracking-widest">Sistem Mutasi</h3>
            </div>
            <p class="text-[11px] leading-relaxed opacity-80 font-medium">
              Data perpindahan ini dicatat secara otomatis ke dalam riwayat audit. Perubahan status menjadi <strong>Received</strong> akan memicu sinkronisasi stok di lokasi tujuan.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading / Error States -->
    <div v-if="!detail && transferStore.isLoading" class="flex flex-col items-center justify-center min-h-[500px] space-y-6">
      <div class="animate-spin h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full shadow-lg shadow-brand-500/10"></div>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Sinkronisasi Data Mutasi...</p>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Badge from '@/components/ui/Badge.vue';
import AuditHistory from '@/components/common/AuditHistory.vue';
import { useAssetTransferStore } from './asset-transfer.store';
import { Alert } from '@/plugins/sweetalert';
import { 
  ArrowLeft, Package, Box, MapPin, User, 
  ArrowLeftRight, ArrowRight, CheckCircle, Trash2, 
  Info, DollarSign, Quote, Briefcase
} from 'lucide-vue-next';

import { ref, watch } from 'vue';
import { AssetService } from '@/modules/transaction/asset/asset.service';

const route = useRoute();
const router = useRouter();
const transferStore = useAssetTransferStore();
const assetTransfers = ref([]);

const detail = computed(() => transferStore.transferDetail);

const loadAssetTransfers = async () => {
  if (detail.value?.assetId) {
    try {
      const res = await AssetService.getById(detail.value.assetId);
      assetTransfers.value = res.data?.transfers || res.transfers || [];
    } catch (err) {
      console.error('Failed to load asset transfer history', err);
    }
  }
};

watch(() => detail.value, (newVal) => {
  if (newVal?.assetId) {
    loadAssetTransfers();
  }
}, { immediate: true });

onMounted(async () => {
  try {
    await transferStore.fetchDetail(route.params.id);
  } catch (err) {
    Alert.error('Gagal', 'Data mutasi tidak ditemukan.');
    router.push({ name: 'TranAssetTransfers' });
  }
});

const getStatusColor = (s) => {
  const map = {
    draft: 'neutral',
    pending: 'warning',
    received: 'success',
    completed: 'success',
    cancelled: 'error',
    in_transit: 'info'
  };
  return map[s] || 'neutral';
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
};

const handleUpdateStatus = async (status) => {
  const isConfirmed = await Alert.confirm('Konfirmasi', `Tandai mutasi ini sebagai ${status.toUpperCase()}?`);
  if (!isConfirmed) return;

  try {
    await transferStore.updateStatus(route.params.id, { status });
    Alert.success('Berhasil', `Status mutasi telah diperbarui menjadi ${status}.`);
  } catch (err) {
    Alert.error('Gagal', 'Gagal memperbarui status mutasi.');
  }
};

const handleDelete = async () => {
  const isConfirmed = await Alert.confirm('Hapus Mutasi?', 'Data akan dihapus permanen.');
  if (!isConfirmed) return;

  try {
    await transferStore.deleteTransfer(route.params.id);
    Alert.success('Berhasil', 'Data mutasi telah dihapus.');
    router.push({ name: 'TranAssetTransfers' });
  } catch (err) {
    Alert.error('Gagal', 'Gagal menghapus mutasi.');
  }
};
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 1; transform: scale(1) translate(-50%, -50%); }
  50% { opacity: 0.8; transform: scale(1.05) translate(-48%, -48%); }
}
.animate-pulse-slow {
  animation: pulse-slow 3s infinite ease-in-out;
}
</style>

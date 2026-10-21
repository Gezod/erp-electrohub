<template>
  <AdminLayout>
    <div class="mx-auto max-w-(--breakpoint-2xl) space-y-6">

      <!-- Header -->
      <PageBreadcrumb pageTitle="Keranjang Pembelian" />

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-4 mb-2">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20 shrink-0">
            <ShoppingCart class="w-6 h-6" />
          </div>
          <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic">
            Kumpulkan item dari beberapa pengajuan &bull; Checkout sekali jalan
          </p>
        </div>

        <GlossyButton
          v-if="hasItems"
          @click="openCheckoutModal"
          class="shrink-0"
        >
          <CreditCard class="w-[16px] h-[16px] text-white relative z-10" />
          <span class="relative z-10 text-[13px] font-semibold whitespace-nowrap">Checkout Keranjang</span>
        </GlossyButton>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !hasItems" class="flex flex-col items-center justify-center min-h-[320px] space-y-4">
        <div class="animate-spin h-10 w-10 border-4 border-black dark:border-white border-t-transparent rounded-full"></div>
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Memuat Keranjang...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!hasItems"
        class="bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-20 flex flex-col items-center justify-center text-center gap-3"
      >
        <div class="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
          <ShoppingCart class="w-8 h-8" />
        </div>
        <h3 class="text-base font-bold text-gray-700 dark:text-gray-200">Keranjang Pembelian Kosong</h3>
        <p class="text-xs text-gray-400 dark:text-gray-500 max-w-sm">
          Buka detail Pengajuan Barang yang memerlukan pembelian, lalu klik <span class="font-bold">"+ Keranjang"</span> pada item yang stoknya kurang/kosong.
        </p>
        <router-link
          :to="{ name: 'TranRequests' }"
          class="mt-2 px-4 py-2 text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-500/20 transition"
        >
          Lihat Daftar Pengajuan
        </router-link>
      </div>

      <!-- Grouped Cart Lines -->
      <div v-else class="space-y-6">
        <div
          v-for="group in groupedItems"
          :key="group.locationId || group.locationName"
          class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <!-- Location Heading -->
          <div class="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 flex items-center gap-2.5">
            <MapPin class="w-4 h-4 text-brand-500 shrink-0" />
            <h3 class="font-bold text-sm text-gray-800 dark:text-white">{{ group.locationName }}</h3>
            <Badge color="info" variant="light" class="text-[10px]">{{ group.items.length }} Item</Badge>
          </div>

          <!-- Lines -->
          <div class="divide-y divide-gray-50 dark:divide-gray-800">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <!-- Item Info -->
              <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-800 dark:text-white text-sm">{{ item.itemName }}</div>
                <div class="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                  <span v-if="item.merk">{{ item.merk }} &bull; </span>
                  <span>{{ item.categoryName || 'Tanpa Kategori' }}</span>
                </div>
                <div v-if="item.sources.length" class="text-[10px] text-gray-400 dark:text-gray-500 italic mt-1.5">
                  Dari: {{ sourcesLabel(item) }}
                </div>
              </div>

              <!-- Qty Display -->
              <div class="flex items-center gap-6 shrink-0">
                <div class="text-center min-w-[64px]">
                  <div class="text-2xl font-black text-gray-900 dark:text-white leading-none">{{ item.qty }}</div>
                  <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Qty</div>
                </div>

                <!-- Quick Add Control -->
                <div class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-1">
                  <input
                    v-model.number="addAmounts[item.id]"
                    type="number"
                    min="1"
                    step="any"
                    class="w-14 bg-transparent border-0 outline-none text-center text-xs font-bold text-gray-800 dark:text-white"
                  />
                  <button
                    type="button"
                    :disabled="isLoading || !(addAmounts[item.id] > 0)"
                    @click="handleIncrease(item)"
                    class="p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:border-brand-300 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Tambah qty"
                  >
                    <Plus class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Remove -->
                <button
                  type="button"
                  :disabled="isLoading"
                  @click="handleRemove(item)"
                  class="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition disabled:opacity-40"
                  title="Hapus dari keranjang"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CHECKOUT MODAL -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showCheckoutModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showCheckoutModal = false"
        >
          <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" @click="showCheckoutModal = false"></div>

          <div class="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/30 dark:to-indigo-950/20">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <CreditCard class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-gray-800 dark:text-white">Checkout Keranjang</h3>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    {{ totalItemCount }} item &bull; {{ groupedItems.length }} lokasi tujuan
                  </p>
                </div>
              </div>
              <button
                @click="showCheckoutModal = false"
                class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/80 transition"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-5">
              <div class="flex items-start gap-3 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800/30">
                <div class="w-5 h-5 rounded-full bg-brand-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-brand-600 text-[10px] font-black">!</span>
                </div>
                <p class="text-[11px] text-brand-700 dark:text-brand-400 leading-relaxed">
                  Sistem akan membuat satu draft Purchase per lokasi tujuan yang ada di keranjang, lalu mengosongkan keranjang.
                </p>
              </div>

              <!-- PIC GA Section -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  PIC GA <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <!-- If not Admin: Read-only auto-filled -->
                  <input
                    v-if="!isSuperAdmin"
                    :value="authStore.user?.fullName || authStore.user?.full_name || authStore.user?.displayName || '-'"
                    disabled
                    class="input-base !bg-gray-100 dark:!bg-gray-800/50 italic opacity-70 font-bold"
                  />
                  <!-- If Admin: Searchable -->
                  <template v-else>
                    <input
                      v-model="picGaSearch"
                      @focus="showPicGaDropdown = true"
                      @blur="setTimeout(() => (showPicGaDropdown = false), 200)"
                      type="text"
                      placeholder="Cari nama karyawan PIC GA..."
                      class="input-base text-sm font-bold"
                    />
                    <div
                      v-if="showPicGaDropdown && filteredEmployees.length"
                      class="absolute top-full left-0 z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
                    >
                      <div
                        v-for="emp in filteredEmployees"
                        :key="emp.id"
                        @mousedown.prevent="selectPicGa(emp)"
                        class="px-4 py-2.5 hover:bg-brand-50 dark:hover:bg-gray-700 cursor-pointer transition border-b border-gray-50 dark:border-gray-700 last:border-0"
                      >
                        <div class="text-xs font-bold text-gray-800 dark:text-white">{{ emp.fullName }}</div>
                        <div class="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">{{ emp.employeeId }}</div>
                      </div>
                    </div>
                  </template>
                </div>
                <!-- Selected employee pill (Admin only) -->
                <div v-if="checkoutForm.picGa && isSuperAdmin" class="flex items-center gap-2 mt-2">
                  <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">{{ picGaSearch }}</span>
                    <button
                      type="button"
                      @click="checkoutForm.picGa = ''; picGaSearch = ''"
                      class="ml-1 p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 rounded transition text-emerald-600 dark:text-emerald-400"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                @click="handleCheckout"
                :disabled="!checkoutForm.picGa || isCheckingOut"
                class="flex-1 py-3 px-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                <CreditCard class="w-4 h-4" />
                {{ isCheckingOut ? 'Memproses...' : 'Buat Purchase Sekarang' }}
              </button>
              <button
                @click="showCheckoutModal = false"
                class="px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- CHECKOUT RESULT MODAL -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showResultModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeResultModal"
        >
          <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" @click="closeResultModal"></div>

          <div class="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-gray-800 dark:text-white">Checkout Berhasil</h3>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    {{ checkoutResults.length }} draft Purchase telah dibuat
                  </p>
                </div>
              </div>
              <button
                @click="closeResultModal"
                class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/80 transition"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="p-6 space-y-2">
              <router-link
                v-for="po in checkoutResults"
                :key="po.id"
                :to="{ name: 'TranPurchaseDetail', params: { id: po.id } }"
                @click="closeResultModal"
                class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition group"
              >
                <div>
                  <div class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Kode PO &bull; {{ po.locationName }}</div>
                  <div class="font-mono font-bold text-sm text-gray-800 dark:text-white group-hover:text-brand-600">{{ po.code }}</div>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition" />
              </router-link>
            </div>

            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
              <button
                @click="closeResultModal"
                class="w-full py-3 px-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import Badge from '@/components/ui/Badge.vue';
import GlossyButton from '@/components/ui/GlossyButton.vue';
import { usePurchaseCartStore } from './purchase-cart.store';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { EmployeeService } from '@/modules/organization/employees/employee.service';
import { Alert } from '@/plugins/sweetalert';
import { ShoppingCart, MapPin, Plus, Trash2, CreditCard, X, CheckCircle2, ChevronRight } from 'lucide-vue-next';

const cartStore = usePurchaseCartStore();
const authStore = useAuthStore();

const isLoading = computed(() => cartStore.isLoading);
const items = computed(() => cartStore.items);
const hasItems = computed(() => items.value.length > 0);
const totalItemCount = computed(() => items.value.length);

const isSuperAdmin = computed(() => authStore.user?.isAdmin === true || authStore.user?.is_superadmin === true);

// Per-line quick-add amount (defaults to 1 for each cart line)
const addAmounts = reactive({});
watch(items, (newItems) => {
  newItems.forEach((item) => {
    if (addAmounts[item.id] === undefined) addAmounts[item.id] = 1;
  });
}, { immediate: true, deep: true });

// Group cart lines by destination location, preserving the backend's sort order
const groupedItems = computed(() => {
  const groups = [];
  const map = new Map();
  items.value.forEach((item) => {
    const key = item.locationId || item.locationName;
    if (!map.has(key)) {
      const group = { locationId: item.locationId, locationName: item.locationName, items: [] };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key).items.push(item);
  });
  return groups;
});

const sourcesLabel = (item) => {
  return item.sources.map((s) => `${s.requestCode} (${s.qtyContributed})`).join(', ');
};

const handleIncrease = async (item) => {
  const amount = Number(addAmounts[item.id]);
  if (!(amount > 0)) return;
  try {
    await cartStore.increaseQty(item.id, amount);
    addAmounts[item.id] = 1;
    Alert.toast('Qty berhasil ditambahkan', `${item.itemName} sekarang ${item.qty + amount}`, 'success');
  } catch (err) {
    Alert.toast('Gagal menambah qty', err.response?.data?.message || 'Terjadi kesalahan.', 'error');
  }
};

const handleRemove = async (item) => {
  const confirmed = await Alert.confirm(
    'Hapus dari Keranjang?',
    `"${item.itemName}" akan dihapus dari keranjang. Tindakan ini tidak dapat dibatalkan.`,
    'Ya, Hapus'
  );
  if (!confirmed) return;
  try {
    await cartStore.removeItem(item.id);
    Alert.toast('Berhasil dihapus', `${item.itemName} telah dihapus dari keranjang.`, 'success');
  } catch (err) {
    Alert.toast('Gagal menghapus', err.response?.data?.message || 'Terjadi kesalahan.', 'error');
  }
};

// --- Checkout Modal ---
const showCheckoutModal = ref(false);
const isCheckingOut = ref(false);
const employees = ref([]);
const picGaSearch = ref('');
const showPicGaDropdown = ref(false);

const checkoutForm = reactive({
  picGa: '',
});

const filteredEmployees = computed(() => {
  if (!picGaSearch.value) return employees.value.slice(0, 10);
  const q = picGaSearch.value.toLowerCase();
  return employees.value.filter((e) =>
    (e.fullName || '').toLowerCase().includes(q) ||
    (e.employeeNumber || '').toLowerCase().includes(q)
  ).slice(0, 10);
});

const selectPicGa = (emp) => {
  checkoutForm.picGa = emp.employeeId || emp.id;
  picGaSearch.value = emp.fullName;
  showPicGaDropdown.value = false;
};

const openCheckoutModal = async () => {
  if (!checkoutForm.picGa) {
    const user = authStore.user;
    const selfEmpId = user?.employeeId || user?.employee_id || user?.id || '';
    const selfName = user?.fullName || user?.full_name || user?.displayName || 'Me';
    checkoutForm.picGa = selfEmpId;
    picGaSearch.value = selfName;
  }

  if (isSuperAdmin.value && employees.value.length === 0) {
    try {
      const res = await EmployeeService.getAll({ limit: 50, status: 'active' });
      employees.value = res.data || [];
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  }

  showCheckoutModal.value = true;
};

const showResultModal = ref(false);
const checkoutResults = ref([]);

const closeResultModal = () => {
  showResultModal.value = false;
  checkoutResults.value = [];
};

const handleCheckout = async () => {
  if (!checkoutForm.picGa) {
    Alert.error('Validasi', 'PIC GA wajib dipilih.');
    return;
  }
  try {
    isCheckingOut.value = true;
    const purchases = await cartStore.checkout(checkoutForm.picGa);
    showCheckoutModal.value = false;

    checkoutResults.value = purchases || [];
    Alert.toast('Checkout Berhasil', `${checkoutResults.value.length} draft Purchase telah dibuat.`, 'success');
    if (checkoutResults.value.length) {
      showResultModal.value = true;
    }
  } catch (err) {
    Alert.error('Gagal Checkout', err.response?.data?.message || 'Gagal melakukan checkout keranjang.');
  } finally {
    isCheckingOut.value = false;
  }
};

onMounted(() => {
  cartStore.fetchCart();
});
</script>

<style scoped lang="postcss">
@reference "../../../assets/main.css";

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(8px);
}
.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>

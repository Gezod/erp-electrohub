<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <button @click="router.back()"
            class="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-brand-500 transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 shadow-sm">
            <MoveLeft class="w-5 h-5" />
          </button>
          <div class="flex flex-col">
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Keamanan & Hak Akses</h2>
            <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest italic">Konfigurasi Kredensial &bull; Sinkronisasi RBAC</p>
          </div>
        </div>
      </div>

      <!-- Main Content with Tabs -->
      <div class="max-w-4xl">
        <!-- Tab Navigation -->
        <div class="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
          <button 
            v-for="tab in availableTabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-6 py-2.5 text-sm font-bold rounded-lg transition-all"
            :class="activeTab === tab.id 
              ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-blue-400 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab 1: Change Password -->
        <div v-show="activeTab === 'password'" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden animate-in fade-in duration-500">
          <div class="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/50">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white tracking-tight">Update Password</h3>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest mt-1">Perbarui kata sandi akun secara berkala.</p>
          </div>
          
          <form @submit.prevent="handlePasswordSubmit" class="p-8 space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="col-span-1">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">Password Lama</label>
                <input v-model="passwordForm.oldPassword" type="password" placeholder="••••••••" required
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:text-white" />
              </div>
              <div class="col-span-1">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2.5">Password Baru</label>
                <input v-model="passwordForm.newPassword" type="password" placeholder="••••••••" required
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400 dark:text-white" />
              </div>
            </div>

            <div class="pt-8 border-t border-gray-50 dark:border-gray-800">
              <button 
                v-can="'rbac:update'"
                type="submit" :disabled="userStore.isLoading"
                class="px-10 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-95">
                <span v-if="userStore.isLoading">Memproses...</span>
                <span v-else>Update Password</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Tab 2: Permissions -->
        <div v-show="activeTab === 'permissions'" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs overflow-hidden animate-in fade-in duration-500">
          <div class="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 class="text-sm font-bold text-gray-800 dark:text-white tracking-tight">Hak Akses Modul</h3>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest mt-1">Atur modul apa saja yang boleh diakses user ini.</p>
            </div>
            <div class="flex gap-2 w-full md:w-auto">
              <button @click="selectAllPermissions" 
                class="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-brand-500 bg-brand-500/10 rounded-lg hover:bg-brand-500/20 transition-all">
                Pilih Semua
              </button>
              <button @click="deselectAllPermissions" 
                class="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                Hapus Semua
              </button>
              <button 
                v-can="'rbac:update'"
                @click="handlePermissionsSubmit" :disabled="userStore.isLoading"
                class="px-8 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 ml-auto active:scale-95">
                {{ userStore.isLoading ? 'Menyimpan...' : 'Simpan Akses' }}
              </button>
            </div>
          </div>
          
          <div class="p-8 space-y-6">
            <!-- Status Superadmin -->
            <div v-if="canManageSuperadmin"
              class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border border-red-100 dark:border-red-900/40 rounded-2xl bg-red-500/[0.03]">
              <label class="flex items-center gap-3 cursor-pointer group w-fit">
                <input v-model="isSuperadmin" type="checkbox"
                  class="w-5 h-5 rounded-lg border-gray-300 dark:border-gray-700 text-red-600 focus:ring-red-500/20 transition-all cursor-pointer" />
                <span class="flex flex-col">
                  <span class="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest group-hover:text-red-600 transition-colors">Jadikan Superadmin</span>
                  <span class="text-[9px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-tight mt-0.5">Memberikan akses penuh ke seluruh modul sistem</span>
                </span>
              </label>
              <button
                v-can="'rbac:update'"
                @click="handleSuperadminSubmit" :disabled="userStore.isLoading"
                class="px-8 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 active:scale-95 shrink-0">
                {{ userStore.isLoading ? 'Menyimpan...' : 'Simpan Status' }}
              </button>
            </div>

            <!-- Search bar -->
            <div class="relative">
              <input v-model="searchQuery" type="text" placeholder="Cari izin akses (misal: purchases, read)..."
                class="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium" />
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div v-if="permissionsStore.isLoading && permissionsStore.permissions.length === 0" class="text-center py-12">
              <div class="animate-spin size-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Memuat daftar izin...</p>
            </div>
            
            <div v-else-if="filteredPermissions.length === 0" class="text-center py-12 border border-dashed border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/20 dark:bg-gray-800/10">
              <Search class="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Izin Tidak Ditemukan</p>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Tidak ada hak akses yang cocok dengan kata kunci "{{ searchQuery }}"</p>
            </div>

            <div v-else class="space-y-8">
              <div v-for="category in groupedPermissions" :key="category.label" class="space-y-4">
                <!-- Category Header -->
                <div class="flex items-center gap-3">
                  <h4 class="text-xs font-black text-gray-800 dark:text-white uppercase tracking-widest">{{ category.label }}</h4>
                  <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500">{{ category.selectedCount }}/{{ category.totalCount }} dipilih</span>
                  <div class="flex-1 border-t border-gray-100 dark:border-gray-800"></div>
                </div>

                <!-- Modules within category -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div
                    v-for="mod in category.modules"
                    :key="mod.module"
                    class="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden"
                  >
                    <div class="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50/60 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                      <div class="flex flex-col">
                        <span class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ mod.label }}</span>
                        <span class="text-[9px] text-gray-400 dark:text-gray-500 font-medium">{{ mod.selectedCount }}/{{ mod.permissions.length }} dipilih</span>
                      </div>
                      <button
                        type="button"
                        @click="toggleModuleAll(mod)"
                        class="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all shrink-0"
                        :class="mod.selectedCount === mod.permissions.length
                          ? 'text-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          : 'text-brand-500 bg-brand-500/10 hover:bg-brand-500/20'"
                      >
                        {{ mod.selectedCount === mod.permissions.length ? 'Hapus Semua' : 'Pilih Semua' }}
                      </button>
                    </div>

                    <div class="flex flex-wrap gap-2 p-4">
                      <label
                        v-for="perm in mod.permissions"
                        :key="perm.id"
                        class="flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-xl border cursor-pointer transition-all select-none"
                        :class="selectedPermissionIds.includes(String(perm.id))
                          ? 'border-brand-500/40 bg-brand-500/[0.06] text-brand-600 dark:text-blue-400'
                          : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-brand-500/30 hover:bg-brand-500/[0.03]'"
                        :title="perm.name"
                      >
                        <input
                          type="checkbox"
                          :checked="selectedPermissionIds.includes(String(perm.id))"
                          @change="togglePermission(perm.id)"
                          class="w-4 h-4 text-brand-500 border-gray-300 dark:border-gray-700 rounded focus:ring-brand-500 cursor-pointer"
                        />
                        <span class="text-[11px] font-bold uppercase tracking-tight">{{ actionLabel(perm.action) }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import { Alert } from '@/plugins/sweetalert';
import { MoveLeft, Search } from 'lucide-vue-next';

// Store
import { useUserStore } from './user.store';
import { usePermissionsStore } from '@/modules/setting/permissions/permissions.store';
import { useAuthStore } from '@/modules/auth/stores/auth.store';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const permissionsStore = usePermissionsStore();
const authStore = useAuthStore();

// --- State ---
const activeTab = ref('password');
const availableTabs = [
  { id: 'password', label: 'Update Password' },
  { id: 'permissions', label: 'Akses Role' }
];

const passwordForm = reactive({
  oldPassword: '',
  newPassword: ''
});

const selectedPermissionIds = ref([]);
const searchQuery = ref('');
const isSuperadmin = ref(false);

// Hanya superadmin yang boleh melihat & mengubah status superadmin (backend tetap menjaga).
const canManageSuperadmin = computed(
  () => !!(authStore.user?.isSuperadmin || authStore.user?.isAdmin)
);

const filteredPermissions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return permissionsStore.permissions;
  return permissionsStore.permissions.filter(p => {
    const nameMatch = (p.name || '').toLowerCase().includes(query);
    const descMatch = (p.description || '').toLowerCase().includes(query);
    const codeMatch = (p.code || '').toLowerCase().includes(query);
    const moduleMatch = (p.module || '').toLowerCase().includes(query);
    return nameMatch || descMatch || codeMatch || moduleMatch;
  });
});

// --- Module Grouping ---
// Mengelompokkan modul permission ke kategori yang sama dengan struktur menu sidebar
// (AppSidebar.vue), supaya admin gampang cari "semua akses Marketing" / "semua akses GA"
// dalam satu grup, bukan list rata 200+ checkbox.
const CATEGORY_ORDER = ['Organisasi & HR', 'Data Master', 'GA', 'Marketing', 'OPA', 'Company Profile', 'Settings', 'Lainnya'];
const MODULE_CATEGORY = {
  organization: 'Organisasi & HR',
  hr: 'Organisasi & HR',
  'training-employees': 'Organisasi & HR',
  'attendance-locations': 'Organisasi & HR',
  attendance: 'Organisasi & HR',
  'attendance-settings': 'Organisasi & HR',
  'fine-types': 'Organisasi & HR',
  'employee-fines': 'Organisasi & HR',
  payroll: 'Organisasi & HR',
  'email-batches': 'Organisasi & HR',

  master: 'Data Master',
  goods: 'Data Master',
  categories: 'Data Master',
  locations: 'Data Master',
  positions: 'Data Master',
  uom: 'Data Master',
  'asset-types': 'Data Master',

  transaksi: 'GA',
  purchases: 'GA',
  'purchase-cart': 'GA',
  requests: 'GA',
  assets: 'GA',
  stock: 'GA',
  stocks: 'GA',
  'stock-movement-log': 'GA',
  'asset-stock-transfer': 'GA',
  maintenance: 'GA',
  maintenanceprogress: 'GA',
  reminders: 'GA',
  schedules: 'GA',
  vehicles: 'GA',
  licenses: 'GA',

  'marketing-goods': 'Marketing',
  'marketing-store-assignments': 'Marketing',
  'marketing-stock': 'Marketing',
  'marketing-purchases': 'Marketing',
  'marketing-requests': 'Marketing',
  'marketing-transfers': 'Marketing',
  'marketing-assets': 'Marketing',

  opa: 'OPA',
  sog: 'OPA',
  bonus: 'OPA',
  audit: 'OPA',

  companyprofile: 'Company Profile',

  rbac: 'Settings',
  setting: 'Settings',
  permissions: 'Settings',
  users: 'Settings',
  roles: 'Settings',
  'store-contacts': 'Settings',
  'manage-contact': 'Settings',
};

const ACTION_LABEL = {
  create: 'Tambah',
  read: 'Lihat',
  'read:all': 'Lihat Semua',
  update: 'Ubah',
  delete: 'Hapus',
};
const humanize = (s) => (s || '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const actionLabel = (action) => ACTION_LABEL[action] || humanize(action);
const moduleLabel = (mod) => humanize(mod);

const groupedPermissions = computed(() => {
  const byModule = {};
  for (const perm of filteredPermissions.value) {
    const mod = perm.module || 'lainnya';
    (byModule[mod] ??= []).push(perm);
  }

  const actionOrder = ['create', 'read', 'read:all', 'update', 'delete'];
  const byCategory = {};
  for (const [mod, perms] of Object.entries(byModule)) {
    const category = MODULE_CATEGORY[mod] || 'Lainnya';
    const sortedPerms = [...perms].sort((a, b) => {
      const ai = actionOrder.indexOf(a.action);
      const bi = actionOrder.indexOf(b.action);
      if (ai === -1 && bi === -1) return a.action.localeCompare(b.action);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    const selectedCount = sortedPerms.filter((p) => selectedPermissionIds.value.includes(String(p.id))).length;
    (byCategory[category] ??= []).push({
      module: mod,
      label: moduleLabel(mod),
      permissions: sortedPerms,
      selectedCount,
    });
  }

  const categories = Object.entries(byCategory).map(([label, modules]) => {
    modules.sort((a, b) => a.label.localeCompare(b.label));
    const totalCount = modules.reduce((sum, m) => sum + m.permissions.length, 0);
    const selectedCount = modules.reduce((sum, m) => sum + m.selectedCount, 0);
    return { label, modules, totalCount, selectedCount };
  });

  categories.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.label);
    const bi = CATEGORY_ORDER.indexOf(b.label);
    if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return categories;
});

const toggleModuleAll = (mod) => {
  const allSelected = mod.selectedCount === mod.permissions.length;
  const idsInModule = mod.permissions.map((p) => String(p.id));
  if (allSelected) {
    selectedPermissionIds.value = selectedPermissionIds.value.filter((id) => !idsInModule.includes(id));
  } else {
    const merged = new Set([...selectedPermissionIds.value, ...idsInModule]);
    selectedPermissionIds.value = Array.from(merged);
  }
};

// --- Lifecycle ---

onMounted(async () => {
  if (!route.params.id) {
    router.back();
    return;
  }

  try {
    // 1. Fetch Master Permissions
    await permissionsStore.fetchPermissions({ limit: 500, is_active: true });

    // 2. Fetch User Detail
    const data = await userStore.fetchUserDetail(route.params.id);

    // Map Permissions
    if (data.permissions) {
      selectedPermissionIds.value = data.permissions.map(id => String(id));
    }

    isSuperadmin.value = !!data.isSuperadmin;
  } catch (error) {
    const msg = error.response?.data?.message || 'Gagal memuat data user.';
    Alert.error('Data Error', msg);
    router.back();
  }
});

// --- Actions (Password) ---

const handlePasswordSubmit = async () => {
  try {
    await userStore.updatePassword(route.params.id, passwordForm);
    Alert.success('Berhasil', 'Kata sandi telah diperbarui.');
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
  } catch (error) {
    const msg = error.response?.data?.message || 'Gagal memperbarui password.';
    Alert.error('Gagal', msg);
  }
};

// --- Actions (Superadmin) ---

const handleSuperadminSubmit = async () => {
  const prev = !isSuperadmin.value;
  try {
    await userStore.updateSuperadmin(route.params.id, isSuperadmin.value);
    Alert.success('Tersimpan', 'Status superadmin user telah diperbarui.');
  } catch (error) {
    isSuperadmin.value = prev;
    const msg = error.response?.data?.message || 'Gagal memperbarui status superadmin.';
    Alert.error('Gagal', msg);
  }
};

// --- Actions (Permissions) ---

const togglePermission = (id) => {
  const targetId = String(id);
  const index = selectedPermissionIds.value.indexOf(targetId);
  if (index > -1) {
    selectedPermissionIds.value.splice(index, 1);
  } else {
    selectedPermissionIds.value.push(targetId);
  }
};

const selectAllPermissions = () => {
  selectedPermissionIds.value = permissionsStore.permissions.map(p => String(p.id));
};

const deselectAllPermissions = () => {
  selectedPermissionIds.value = [];
};

const handlePermissionsSubmit = async () => {
  try {
    await userStore.syncPermissions(route.params.id, selectedPermissionIds.value);
    Alert.success('Tersimpan', 'Hak akses user telah disinkronkan.');
  } catch (error) {
    const msg = error.response?.data?.message || 'Gagal menyimpan hak akses.';
    Alert.error('Error', msg);
  }
};
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

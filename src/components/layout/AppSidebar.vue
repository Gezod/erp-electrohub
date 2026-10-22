<template>
  <aside :class="[
    'fixed top-0 left-0 h-screen transition-all duration-300 ease-out z-[100] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shadow-xs',
    {
      'w-[264px]': isExpanded || isMobileOpen,
      'w-[80px]': !isExpanded,
      'translate-x-0': isMobileOpen,
      '-translate-x-full lg:translate-x-0': !isMobileOpen,
    },
  ]">

    <!-- Logo, Toggle Button & Search Container -->
    <div
      class="flex flex-col border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300 shrink-0"
      :class="[
        isExpanded || isMobileOpen ? 'px-5 py-4 gap-3.5' : 'px-0 py-4 gap-3 items-center justify-center'
      ]"
    >
      <!-- Row 1: Logo & Toggle Button -->
      <div class="flex items-center justify-between w-full" :class="{ 'justify-center': !isExpanded && !isMobileOpen }">
        <router-link to="/" class="flex items-center gap-2 min-w-0 group">
          <!-- Modern Tech Monogram -->
          <div class="flex items-center justify-center shrink-0">
            <img
              src="/images/logo/logo.svg"
              alt="ElectroHub Logo"
              :class="[
                'shrink-0 transition-all duration-200 ease-out',
                isExpanded || isMobileOpen ? 'w-[92px]' : 'w-[40px]'
              ]"
            />
          </div>
        </router-link>

        <!-- Toggle Button (when expanded) -->
        <button
          v-if="isExpanded || isMobileOpen"
          @click="handleToggle"
          class="flex items-center justify-center w-7 h-7 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors duration-150 shrink-0 outline-none select-none cursor-pointer"
          title="Toggle Sidebar"
        >
          <X v-if="isMobileOpen" class="w-4.5 h-4.5" />
          <svg v-else class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="3" />
            <path d="M9 3v18" />
            <path d="m15 9-3 3 3 3" />
          </svg>
        </button>
      </div>

      <!-- Row 2: Search Input when expanded OR Expand Button when icon-only (collapsed) -->
      <div class="w-full shrink-0">
        <div
          v-if="isExpanded || isMobileOpen"
          class="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full focus-within:border-zinc-900 dark:focus-within:border-zinc-100 focus-within:ring-1 focus-within:ring-zinc-900/10 dark:focus-within:ring-zinc-100/10 transition-all duration-150"
        >
          <!-- Search Icon -->
          <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari navigasi..."
            class="w-full bg-transparent text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none border-none p-0 focus:ring-0"
          />

          <!-- Clear Button -->
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Button Perbesar Sidebar (Replaces Search Button in Icon-Only State) -->
        <div v-else class="flex justify-center w-full px-3">
          <button
            @click="handleToggle"
            class="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-2 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 cursor-pointer shrink-0 size-9 group"
            title="Perbesar Sidebar"
          >
            <svg class="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="3" />
              <path d="M9 3v18" />
              <path d="m13 9 3 3-3 3" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Section -->
    <div
      ref="sidebarScrollRef"
      class="flex-1 overflow-y-auto no-scrollbar pt-4 pb-6 transition-all duration-200"
      :class="isExpanded || isMobileOpen ? 'px-3 space-y-5' : 'px-2 space-y-4'"
    >
      <div v-for="(menuGroup, groupIndex) in filteredMenuGroups" :key="groupIndex">

        <!-- Group Title: Clean Minimalist Section Header -->
        <div v-if="isExpanded || isMobileOpen" class="px-2.5 mb-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider whitespace-nowrap select-none">
          {{ menuGroup.title }}
        </div>
        <div v-else class="px-0 mb-1 text-[8.5px] font-semibold text-zinc-400 dark:text-zinc-500 text-center uppercase tracking-tighter whitespace-nowrap select-none">
          {{ menuGroup.title }}
        </div>

        <!-- Menu Items -->
        <ul class="space-y-1">
          <li v-for="(item, index) in menuGroup.items" :key="item.name">

            <!-- Item with Submenu -->
            <div v-if="item.subItems">
              <button
                type="button"
                @click.prevent="toggleSubmenu(groupIndex, index)"
                :class="[
                  'group w-full h-9 rounded-lg transition-all duration-150 flex items-center relative overflow-hidden select-none cursor-pointer',
                  isExpanded || isMobileOpen ? 'px-2.5 gap-2.5' : 'px-0 justify-center',
                  isParentActive(groupIndex, index)
                    ? 'sidebar-active-tab font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                ]"
              >
                <div :class="['w-4.5 h-4.5 shrink-0 transition-colors relative z-10 flex items-center justify-center', isParentActive(groupIndex, index) ? 'text-inherit' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100']">
                  <component :is="item.icon" class="w-4.5 h-4.5" />
                </div>
                <span v-if="isExpanded || isMobileOpen" class="text-[13.5px] whitespace-nowrap relative z-10 tracking-tight">{{ item.name }}</span>
                <ChevronDownIcon v-if="isExpanded || isMobileOpen" :class="['ml-auto w-3.5 h-3.5 transition-transform duration-200 relative z-10 opacity-60 group-hover:opacity-100', { 'rotate-180': isSubmenuOpen(groupIndex, index) }]" />
              </button>

              <!-- Submenu List with clean zinc vertical guide line -->
              <transition
                @before-enter="beforeEnter"
                @enter="enter"
                @after-enter="afterEnter"
                @before-leave="beforeLeave"
                @leave="leave"
                @after-leave="afterLeave"
              >
                <div v-if="isSubmenuOpen(groupIndex, index) && (isExpanded || isMobileOpen)" class="overflow-hidden">
                  <ul class="mt-1 space-y-0.5 ml-4.5 border-l border-zinc-200 dark:border-zinc-800 pl-3 py-1">
                    <li v-for="subItem in item.subItems" :key="subItem.name">
                      <router-link :to="subItem.path" :class="[
                        'block py-1.5 px-2 text-[13px] rounded-md transition-colors duration-150 relative',
                        isActive(subItem.path)
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium'
                      ]">
                        {{ subItem.name }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </transition>
            </div>

            <!-- Simple Link Item -->
            <router-link v-else :to="item.path" @click="handleSimpleItemClick" :class="[
              'group w-full h-9 rounded-lg transition-all duration-150 flex items-center relative overflow-hidden select-none',
              isExpanded || isMobileOpen ? 'px-2.5 gap-2.5' : 'px-0 justify-center',
              isActive(item.path)
                ? 'sidebar-active-tab font-medium'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
            ]">
              <div :class="['w-4.5 h-4.5 shrink-0 transition-colors relative z-10 flex items-center justify-center', isActive(item.path) ? 'text-inherit' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100']">
                <component :is="item.icon" class="w-4.5 h-4.5" />
                <!-- Notification Dot for Collapsed Sidebar -->
                <div v-if="item.name === 'Notifications' && reminderStore.dueTodayCount > 0 && !isExpanded && !isMobileOpen"
                  class="absolute -top-1 -right-1 flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-900 dark:bg-zinc-100 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-zinc-900 dark:bg-zinc-100"></span>
                </div>
                <!-- Todo Reminder Dot for Collapsed Sidebar -->
                <div v-if="item.name === 'My Tasks' && todoStore.todoReminderCount > 0 && !isExpanded && !isMobileOpen"
                  class="absolute -top-1 -right-1 flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-900 dark:bg-zinc-100 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-zinc-900 dark:bg-zinc-100"></span>
                </div>
              </div>
              <span v-if="isExpanded || isMobileOpen" class="text-[13.5px] whitespace-nowrap relative z-10 tracking-tight">{{ item.name }}</span>

              <!-- Minimalist Badge for Expanded Sidebar -->
              <div v-if="item.name === 'Notifications' && reminderStore.dueTodayCount > 0 && (isExpanded || isMobileOpen)"
                class="ml-auto flex items-center justify-center min-w-[18px] h-4.5 px-1.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-bold relative z-10">
                <span>{{ reminderStore.dueTodayCount > 99 ? '99+' : reminderStore.dueTodayCount }}</span>
              </div>
              <!-- Todo Reminder Badge for Expanded Sidebar -->
              <div v-if="item.name === 'My Tasks' && todoStore.todoReminderCount > 0 && (isExpanded || isMobileOpen)"
                class="ml-auto flex items-center justify-center min-w-[18px] h-4.5 px-1.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-bold relative z-10">
                <span>{{ todoStore.todoReminderCount > 99 ? '99+' : todoStore.todoReminderCount }}</span>
              </div>
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- User Profile Mini: Clean Zinc Footer -->
    <div class="h-16 flex items-center px-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 w-full shrink-0">
      <UserMenu :collapsed="!isExpanded && !isMobileOpen" />
    </div>
  </aside>
</template>

<script setup>
/**
 * Semua Logika, Imports, dan filteredMenuGroups dipertahankan sepenuhnya.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useReminderStore } from "@/modules/transaction/reminder/reminder.store";
import { useTodoStore } from "@/modules/todo/todo.store";
import UserMenu from "./header/UserMenu.vue";

import {
  ChevronDownIcon,
} from "../../icons";

import {
  PhHouse,
  PhUsers,
  PhFolder,
  PhCube,
  PhBell,
  PhBuildings,
  PhAddressBook,
  PhUserCircle,
  PhNewspaper,
  PhFiles,
  PhUserCircleGear,
  PhBrowsers,
  PhTable,
  PhCheckSquare,
  PhKanban,
  PhGraph,
  PhTrendUp
} from "@phosphor-icons/vue";
import { X } from "lucide-vue-next";
import { useSidebar } from "@/composables/useSidebar";

const route = useRoute();
const authStore = useAuthStore();
const reminderStore = useReminderStore();
const todoStore = useTodoStore();

const searchQuery = ref("");

const handleSearchClick = () => {
  if (!isExpanded.value) {
    toggleSidebar();
  }
  setTimeout(() => {
    const inputEl = document.querySelector('input[placeholder="Search"]');
    if (inputEl) {
      inputEl.focus();
    }
  }, 100);
};

const { isExpanded, isMobileOpen, openSubmenu, toggleSidebar, toggleMobileSidebar } = useSidebar();

const handleToggle = () => {
  if (window.innerWidth >= 1024) {
    toggleSidebar();
  } else {
    toggleMobileSidebar();
  }
};

const sidebarScrollRef = ref(null);

onMounted(() => {
  reminderStore.fetchDueToday();
  todoStore.fetchReminders();

  // Restore sidebar scroll position
  if (sidebarScrollRef.value) {
    const savedScroll = sessionStorage.getItem('hs_sidebar_scroll');
    if (savedScroll) {
      sidebarScrollRef.value.scrollTop = parseInt(savedScroll, 10);
    }

    // Listen to scroll events to save position
    sidebarScrollRef.value.addEventListener('scroll', handleSidebarScroll);
  }
});

onBeforeUnmount(() => {
  if (sidebarScrollRef.value) {
    sidebarScrollRef.value.removeEventListener('scroll', handleSidebarScroll);
  }
});

const handleSidebarScroll = (e) => {
  sessionStorage.setItem('hs_sidebar_scroll', e.target.scrollTop);
};

const menuGroups = [
  {
    title: "Menu",
    items: [
      {
        icon: PhHouse,
        name: "Beranda",
        path: "/welcome",
      },
      {
        icon: PhBell,
        name: "Notifications",
        path: "/transaction/reminders",
        privilege: "reminders:read",
      },
    ],
  },
  {
    title: "To-Do",
    items: [
      {
        icon: PhCheckSquare,
        name: "My Tasks",
        path: "/todo/my-tasks",
      },
      {
        icon: PhKanban,
        name: "Boards",
        path: "/todo/boards",
      },
      {
        icon: PhUsers,
        name: "Team Tasks",
        path: "/todo/team-tasks",
      },
    ],
  },
  {
    title: "Organisasi",
    items: [
      {
        icon: PhUserCircle,
        name: "Kepegawaian & HR",
        // privilege: "organization:read:all",
        subItems: [
          { name: "Divisi", path: "/organization/divisions", privilege: "organization:read:all" },
          { name: "Karyawan", path: "/organization/employees", privilege: "organization:read:all" },
          { name: "Atasan / Chief", path: "/organization/chiefs", privilege: "organization:read:all" },
          { name: "Pesan Broadcast", path: "/hr/broadcasts", privilege: "hr:read" },
          { name: "Email Broadcast", path: "/hr/email-broadcasts", privilege: "hr:read" },
          { name: "Peraturan Perusahaan", path: "/hr/regulations", privilege: "hr:read" },
          { name: "Data Pelanggaran", path: "/hr/violations", privilege: "hr:read" },
          { name: "Data ST/SP", path: "/hr/stsp", privilege: "hr:read" },
          { name: "Data Resign", path: "/hr/resignations", privilege: "hr:read" },
        ],
      },
      {
        icon: PhUserCircle,
        name: "Absensi & Payroll",
        subItems: [
          { name: "Lokasi Absen", path: "/hr/attendance-locations", privilege: "attendance-locations:read" },
          { name: "Karyawan Training", path: "/hr/training-employees", privilege: "training-employees:read" },
          { name: "Rekap Absensi", path: "/hr/attendance/rekap", privilege: "attendance:read" },
          { name: "Absen Harian", path: "/hr/attendance/harian", privilege: "attendance:read" },
          { name: "Persetujuan Lembur", path: "/hr/overtime-approvals", privilege: "overtime-approvals:read" },
          { name: "Master Denda", path: "/hr/fine-types", privilege: "fine-types:read" },
          { name: "Denda Karyawan", path: "/hr/employee-fines", privilege: "employee-fines:read" },
          { name: "Payroll", path: "/hr/payroll", privilege: "payroll:read" },
          { name: "Kirim Email Slip", path: "/hr/email-batches", privilege: "email-batches:read" },
          { name: "Pengaturan Absensi", path: "/hr/attendance-settings", privilege: "attendance-settings:read" },
          { name: "Kalender Hari Libur", path: "/hr/attendance-holidays", privilege: "attendance-holidays:read" },
        ],
      },
    ],
  },
  {
    title: "Data Master",
    items: [
      {
        icon: PhFolder,
        name: "Repositori Master",
        // privilege: "master:read:all",
        subItems: [
          { name: "Data Barang", path: "/master/goods", privilege: "goods:read" },
          { name: "Kategori", path: "/master/categories", privilege: "categories:read" },
          { name: "Lokasi", path: "/master/locations", privilege: "locations:read" },
          { name: "Tipe Aset", path: "/master/asset-types", privilege: "asset-types:read" },
          { name: "Jabatan", path: "/master/positions", privilege: "positions:read" },
          { name: "Satuan (UOM)", path: "/master/uom", privilege: "uom:read" },
        ],
      },
    ],
  },
  {
    title: "GA",
    items: [
      {
        icon: PhTrendUp,
        name: "Dashboard",
        path: "/dashboard",
        privilege: "dashboard-ga:read",
      },

      {
        icon: PhCube,
        name: "Stok & Aset",
        // privilege: "assets:read:all",
        subItems: [
          { name: "Monitoring Stok", path: "/transaction/stocks", privilege: "stock:read" },
          { name: "Daftar Aset", path: "/transaction/assets", privilege: "assets:read" },
          { name: "Log Pergerakan Stok", path: "/transaction/stock-movements", privilege: "stock-movement-log:read" },
          { name: "Stok & Asset Transfer", path: "/transaction/asset-transfers", privilege: "asset-stock-transfer:read" },
        ],
      },
      {
        icon: PhTable,
        name: "Pembelian",
        // privilege: "purchases:read",
        subItems: [
          { name: "Pesanan Pembelian (PO)", path: "/transaction/purchases", privilege: "purchases:read" },
          { name: "Pengajuan Barang", path: "/transaction/requests", privilege: "requests:read" },
          { name: "Keranjang Pembelian", path: "/transaction/purchase-cart", privilege: "purchase-cart:read" },
        ],
      },
      {
        icon: PhNewspaper,
        name: "Pemeliharaan",
        // privilege: "maintenance:read:all",
        subItems: [
          { name: "Maintenance", path: "/transaction/maintenance", privilege: "maintenance:read" },
          { name: "Penjadwalan", path: "/transaction/schedules", privilege: "schedules:read" },
          { name: "Data Kendaraan", path: "/transaction/vehicles", privilege: "vehicles:read" },
          { name: "Lisensi", path: "/transaction/licenses", privilege: "licenses:read" },
        ],
      },
    ],
  },

  {
    title: "Marketing",
    items: [
      {
      icon: PhTrendUp,
      name: "Dashboard",
      path: "/dashboard/marketing",
      privilege: "dashboard-marketing:read",
    },
      {
        icon: PhFolder,
        name: "Master Marketing",
        subItems: [
          { name: "Data Barang", path: "/master/marketing-goods", privilege: "marketing-goods:read" },
          { name: "Store Assignment", path: "/master/store-assignments", privilege: "marketing-store-assignments:read" },
          { name: "Roster Admin Pusat", path: "/master/admin-pusat-roster", privilege: "marketing-admin-pusat-roster:read" },
        ],
      },
      {
        icon: PhCube,
        name: "Stok & Aset",
        subItems: [
          { name: "Monitoring Stok", path: "/transaction/marketing-stocks", privilege: "marketing-stock:read" },
          { name: "Log Pergerakan Stok", path: "/transaction/marketing-stock-movements", privilege: "marketing-stock-movement-log:read" },
          { name: "Daftar Aset", path: "/transaction/marketing-assets", privilege: "marketing-assets:read" },
          { name: "Transfer", path: "/transaction/marketing-transfers", privilege: "marketing-transfers:read" },
        ],
      },
      {
        icon: PhTable,
        name: "Pembelian & Pengajuan",
        subItems: [
          { name: "Purchase", path: "/transaction/marketing-purchases", privilege: "marketing-purchases:read" },
          { name: "Pengajuan Marketing", path: "/transaction/marketing-requests", privilege: "marketing-requests:read" },
        ],
      },
    ],
  },
  {
    title: "Supply Chain",
    items: [
      {
        icon: PhCube,
        name: "Master Data",
        subItems: [
          { name: "Master SKU & Harga", path: "/master/sc-sku", privilege: "sc-sku:read" },
          { name: "Kategori SKU", path: "/master/sc-categories", privilege: "sc-categories:read" },
        ],
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        icon: PhUserCircleGear,
        name: "System Settings",
        // privilege: "rbac",
        subItems: [
          { name: "User Management", path: "/setting/users", privilege: "rbac:read" },
          { name: "Permissions", path: "/setting/permissions", privilege: "permissions:read" },
          { name: "Label Kontak", path: "/setting/store-contacts/template", privilege: "store-contacts:read" },
          { name: "Manage Kontak", path: "/setting/manage-contact", privilege: "manage-contact:read" }
        ],
      },
    ],
  },
];

const filteredMenuGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const queryWords = query.split(/\s+/).filter(Boolean);

  return menuGroups
    .map((group) => {
      const filteredItems = group.items
        .map((item) => {
          // Check parent item privilege
          if (item.privilege && !authStore.hasPrivilege(item.privilege)) {
            return null;
          }

          if (item.subItems) {
            // Filter subItems by privilege
            const allowedSubItems = item.subItems.filter((sub) => {
              if (!sub.privilege) return true;
              return authStore.hasPrivilege(sub.privilege);
            });

            if (allowedSubItems.length === 0) return null;

            // If there's a search query, filter matching items
            if (queryWords.length > 0) {
              // Parent matches all words directly
              const matchesParent = queryWords.every(word => item.name.toLowerCase().includes(word));

              // Sub-items that match the query words directly OR in combination with the parent name
              const matchingSubItems = allowedSubItems.filter((sub) =>
                queryWords.every(word => (item.name + " " + sub.name).toLowerCase().includes(word))
              );

              if (matchesParent || matchingSubItems.length > 0) {
                // If parent matches, show all allowed sub-items; otherwise show only matching ones
                return {
                  ...item,
                  subItems: matchesParent ? allowedSubItems : matchingSubItems,
                };
              }
              return null;
            }

            return { ...item, subItems: allowedSubItems };
          }

          // Simple link item
          if (queryWords.length > 0) {
            const matches = queryWords.every(word => item.name.toLowerCase().includes(word));
            if (matches) {
              return item;
            }
            return null;
          }

          return item;
        })
        .filter(Boolean);

      if (filteredItems.length > 0) {
        return { ...group, items: filteredItems };
      }
      return null;
    })
    .filter(Boolean);
});

const isActive = (path) => route.path === path;

const toggleSubmenu = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;

  // Jika sidebar dalam mode icon-only (collapsed)
  if (!isExpanded.value && !isMobileOpen.value) {
    if (window.innerWidth >= 1024) {
      if (!isExpanded.value) toggleSidebar();
    } else {
      if (!isMobileOpen.value) toggleMobileSidebar();
    }
    openSubmenu.value = key;
    return;
  }

  // Jika sidebar sudah terbuka (expanded)
  if (isSubmenuOpen(groupIndex, itemIndex)) {
    openSubmenu.value = 'none';
  } else {
    openSubmenu.value = key;
  }
};

const handleSimpleItemClick = () => {
  if (isMobileOpen.value) {
    toggleMobileSidebar();
  }
  openSubmenu.value = 'none';
};

const isParentActive = (groupIndex, itemIndex) => {
  return filteredMenuGroups.value[groupIndex]?.items[itemIndex]?.subItems?.some((subItem) =>
    isActive(subItem.path)
  ) || false;
};

const isSubmenuOpen = (groupIndex, itemIndex) => {
  if (searchQuery.value.trim()) {
    return true; // Auto-expand all when searching
  }
  const key = `${groupIndex}-${itemIndex}`;
  if (openSubmenu.value !== null) {
    return openSubmenu.value === key;
  }
  return isParentActive(groupIndex, itemIndex);
};

watch(
  () => route.path,
  () => {
    openSubmenu.value = null;
  }
);

const beforeEnter = (el) => {
  el.style.height = '0px';
  el.style.opacity = '0';
  el.style.overflow = 'hidden';
};

const enter = (el) => {
  el.style.transition = 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease';
  el.style.height = el.scrollHeight + 'px';
  el.style.opacity = '1';
};

const afterEnter = (el) => {
  el.style.height = '';
  el.style.opacity = '';
  el.style.transition = '';
};

const beforeLeave = (el) => {
  el.style.height = el.scrollHeight + 'px';
  el.style.opacity = '1';
  el.style.overflow = 'hidden';
};

const leave = (el) => {
  el.style.transition = 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
  el.offsetHeight; // force reflow
  el.style.height = '0px';
  el.style.opacity = '0';
};

const afterLeave = (el) => {
  el.style.height = '';
  el.style.opacity = '';
  el.style.transition = '';
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

aside {
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-active-tab {
  background-color: #18181B !important;
  color: #FAFAFA !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.1) !important;
}

:is(.dark) .sidebar-active-tab {
  background-color: #27272A !important;
  color: #FAFAFA !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08) !important;
}
</style>

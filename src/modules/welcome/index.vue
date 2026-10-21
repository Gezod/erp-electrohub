<template>
  <admin-layout>
    <div class="space-y-6">
      <!-- Hero Greeting (Linear / Apple Dark Card Style) -->
      <div class="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-sm">
        <!-- Texture: subtle micro dot grid -->
        <div
          class="pointer-events-none absolute inset-0 opacity-[0.08]"
          style="background-image: radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px); background-size: 20px 20px;"
        ></div>
        <!-- Ambient light -->
        <div class="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/[0.04] blur-3xl"></div>

        <div class="relative p-6 md:p-8">
          <div class="flex flex-col md:flex-row md:items-center gap-5">
            <!-- Monogram Avatar -->
            <div class="relative w-14 h-14 md:w-16 md:h-16 shrink-0 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700 text-white shadow-xs">
              <span class="text-xl md:text-2xl font-bold tracking-tight">{{ initial }}</span>
              <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xs">
                {{ greetingEmoji }}
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">{{ formattedDate }} &bull; {{ liveClock }}</span>
              </div>
              <h1 class="text-xl md:text-2xl font-semibold text-zinc-50 mt-1 leading-tight tracking-tight">
                {{ greeting }}, {{ firstName }}
              </h1>
              <p class="text-xs md:text-sm text-zinc-400 mt-1 max-w-xl font-normal">
                Selamat datang di platform ERP ElectroHub. Monitor seluruh aktivitas dan operasional secara real-time.
              </p>

              <div v-if="divisionName || positionName" class="flex flex-wrap items-center gap-2 mt-3.5">
                <span v-if="divisionName" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/90 text-zinc-300 text-xs font-medium border border-zinc-800">
                  <Building2 class="w-3.5 h-3.5 text-zinc-400" /> {{ divisionName }}
                </span>
                <span v-if="positionName" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/90 text-zinc-300 text-xs font-medium border border-zinc-800">
                  <BadgeCheck class="w-3.5 h-3.5 text-zinc-400" /> {{ positionName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- At a glance: clean stat cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-center gap-3.5 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div class="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
            <ClipboardCheck class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0">
            <div class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{{ activeTaskCount }}</div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal mt-1 truncate">Tugas Aktif</div>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-center gap-3.5 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div class="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
            <KanbanSquare class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0">
            <div class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{{ boardCount }}</div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal mt-1 truncate">Papan Kerja</div>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-center gap-3.5 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div class="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
            <CalendarDays class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0">
            <div class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-none">Hari ke-{{ dayOfYear }}</div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal mt-1 truncate">di Tahun {{ currentYear }}</div>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-center gap-3.5 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div class="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
            <Clock class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0">
            <div class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{{ dayNameShort }}</div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal mt-1 truncate">{{ liveClock }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-5">
        <!-- Quote of the day -->
        <div class="col-span-12 lg:col-span-8">
          <div class="relative h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xs flex flex-col overflow-hidden">
            <Quote class="pointer-events-none absolute -right-3 -top-3 w-24 h-24 text-zinc-100 dark:text-zinc-800/40" />

            <div class="relative flex items-center justify-between mb-4">
              <h3 class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Sparkles class="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" /> Motivasi Hari Ini
              </h3>
              <button
                @click="shuffleQuote"
                class="flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Ganti kutipan"
              >
                <RefreshCw class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="relative flex-1 flex items-center py-2">
              <blockquote class="pl-0.5">
                <p class="text-lg md:text-xl font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed tracking-tight">
                  “{{ quote.text }}”
                </p>
                <footer class="mt-3 flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                  <span class="w-4 h-px bg-zinc-300 dark:bg-zinc-700"></span> {{ quote.author }}
                </footer>
              </blockquote>
            </div>
          </div>
        </div>

        <!-- Quick shortcuts -->
        <div class="col-span-12 lg:col-span-4">
          <div class="h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs">
            <h3 class="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-3.5 uppercase tracking-wider">Akses Cepat</h3>
            <div class="space-y-1.5">
              <router-link
                v-for="link in shortcuts"
                :key="link.name"
                :to="{ name: link.name }"
                class="group flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 transition-colors border border-transparent"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <component :is="link.icon" class="w-4 h-4" />
                  </div>
                  <span class="text-xs font-medium truncate">{{ link.label }}</span>
                </div>
                <ChevronRight class="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all shrink-0" />
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Guidance Banner -->
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-center gap-3.5 shadow-2xs">
        <div class="w-8 h-8 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
          <LayoutDashboard class="w-4 h-4" />
        </div>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
          Gunakan menu sidebar di sebelah kiri untuk navigasi cepat ke modul Master Data, Transaksi Inventaris, Mutasi, Maintenance, dan Todo Tasks.
        </p>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { useTodoStore } from '@/modules/todo/todo.store';
import { getQuoteOfDay, getRandomQuote } from './quotes';
import {
  Sparkles, Quote, RefreshCw, ChevronRight, Building2, BadgeCheck,
  LayoutDashboard, ClipboardCheck, KanbanSquare, UserCircle, CalendarDays, Clock,
} from 'lucide-vue-next';

const authStore = useAuthStore();
const todoStore = useTodoStore();

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jumat", 'Sabtu'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const now = ref(new Date());
let timer = null;

onMounted(() => {
  timer = setInterval(() => { now.value = new Date(); }, 1000);
  loadStats();
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

const formattedDate = computed(() => {
  const d = now.value;
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
});

const dayNameShort = computed(() => DAY_NAMES[now.value.getDay()]);
const currentYear = computed(() => now.value.getFullYear());
const dayOfYear = computed(() => {
  const d = now.value;
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
});

const liveClock = computed(() => {
  const d = now.value;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} WIB`;
});

const greeting = computed(() => {
  const h = now.value.getHours();
  if (h < 4) return 'Selamat malam';
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
});

const greetingEmoji = computed(() => {
  const h = now.value.getHours();
  if (h < 4) return '🌙';
  if (h < 11) return '☀️';
  if (h < 15) return '🌤️';
  if (h < 18) return '🌇';
  return '🌙';
});

const firstName = computed(() => {
  const full = authStore.user?.displayName || '';
  return full.split(' ')[0] || 'Sahabat ElectroHub';
});
const initial = computed(() => (authStore.user?.displayName || 'U').charAt(0).toUpperCase());

const divisionName = computed(() => authStore.user?.divisionName || '');
const positionName = computed(() => authStore.user?.employee?.position?.name || '');

const quote = ref(getQuoteOfDay());
const shuffleQuote = () => {
  quote.value = getRandomQuote(quote.value.text);
};

// Angka real dari Todo module (tidak ada privilege gate — aman untuk semua role).
const activeTaskCount = ref(0);
const boardCount = ref(0);
const loadStats = async () => {
  try {
    const [tasksRes] = await Promise.all([
      todoStore.fetchTasks({ limit: 100 }),
      todoStore.fetchBoards(),
    ]);
    const tasks = tasksRes?.data || [];
    activeTaskCount.value = tasks.filter((t) => t.status !== 'done').length;
    boardCount.value = todoStore.boards.length;
  } catch (err) {
    console.error('Gagal memuat ringkasan tugas', err);
  }
};

const shortcuts = [
  { name: 'TodoMyTasks', label: 'Tugas Saya', icon: ClipboardCheck, chipClass: 'bg-blue-light-50 dark:bg-blue-light-500/10 text-blue-light-500' },
  { name: 'TodoBoards', label: 'Papan Kerja', icon: KanbanSquare, chipClass: 'bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-orange-400' },
  { name: 'Dashboard', label: 'Dashboard GA', icon: LayoutDashboard, chipClass: 'bg-success-50 dark:bg-success-500/10 text-success-600' },
  { name: 'Profile', label: 'Profil Saya', icon: UserCircle, chipClass: 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300' },
];
</script>

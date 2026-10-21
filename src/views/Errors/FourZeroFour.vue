<template>
  <div
    class="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-gray-50 dark:bg-[#080808] transition-colors duration-300"
  >
    <!-- Grid Decoration -->
    <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]"></div>
    </div>

    <!-- Radial Glows -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>

    <!-- Main Container -->
    <div class="relative z-10 w-full max-w-xl">
      <!-- Enterprise Error Card -->
      <div class="backdrop-blur-md bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-white/[0.05] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden transition-all duration-300">
        
        <!-- Header Info Bar -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.01]">
          <div class="flex items-center gap-2">
            <!-- Icon -->
            <div class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Sistem Alert</span>
          </div>
          <span class="text-xs font-mono text-gray-400 dark:text-gray-500">ID: ERR_404</span>
        </div>

        <div class="p-8 md:p-10">
          <!-- Error Icon + Code -->
          <div class="flex items-center gap-5 mb-8">
            <div class="w-16 h-16 shrink-0 rounded-2xl bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 dark:border-red-500/10 flex items-center justify-center text-red-500">
              <AlertOctagon class="w-8 h-8" />
            </div>
            <div>
              <span class="text-xs font-bold text-red-500 uppercase tracking-wider">Kesalahan Navigasi</span>
              <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none mt-1">404 - Not Found</h1>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-4 mb-8">
            <p class="text-base text-gray-700 dark:text-gray-300 font-medium">
              Halaman yang Anda tuju tidak ditemukan atau tidak tersedia di dalam server ERP.
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Silakan periksa kembali tautan yang Anda masukkan. Anda dapat kembali ke Dashboard utama atau menggunakan tombol navigasi di bawah ini untuk melanjutkan pekerjaan Anda.
            </p>
          </div>

          <!-- Diagnostic Panel (Very Enterprise UX!) -->
          <div class="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-white/[0.03]">
            <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Informasi Diagnostik</span>
            <div class="space-y-1.5 font-mono text-[11px] text-gray-600 dark:text-gray-400">
              <div class="flex justify-between items-center">
                <span class="text-gray-400">URL Diakses:</span>
                <span class="text-gray-800 dark:text-gray-200 select-all break-all text-right max-w-[280px]">{{ pathVisited }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400">Waktu Server:</span>
                <span class="text-gray-800 dark:text-gray-200">{{ serverTime }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.05]">
            <GlossyButton
              to="/welcome"
              class="w-full sm:flex-1"
            >
              <LayoutDashboard class="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </GlossyButton>

            <button
              @click="router.back()"
              class="w-full sm:w-auto px-[14px] py-[8px] h-10 flex items-center justify-center gap-[6px] rounded-[6px] border border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-white/10 dark:hover:bg-white/[0.03] dark:text-gray-300 font-sans font-medium text-[14px] transition-all duration-200 cursor-pointer active:scale-95 bg-white dark:bg-transparent outline outline-1 outline-offset-[-1px] outline-black/10 dark:outline-white/10"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Halaman Sebelumnya</span>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Footer Copyright -->
    <p class="absolute text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest bottom-6 left-1/2 -translate-x-1/2">
      &copy; {{ currentYear }} &bull; ERP ELECTROHUB &bull; ENTERPRISE PLATFORM
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { AlertOctagon, ArrowLeft, LayoutDashboard } from "lucide-vue-next";
import GlossyButton from "@/components/ui/GlossyButton.vue";

const router = useRouter();
const route = useRoute();

const currentYear = ref(new Date().getFullYear());
const pathVisited = ref("");
const serverTime = ref("");

onMounted(() => {
  pathVisited.value = window.location.pathname;
  
  // Format current date and time
  const now = new Date();
  serverTime.value = now.toISOString().replace('T', ' ').substring(0, 19);
});
</script>

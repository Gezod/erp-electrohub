<template>
  <AdminLayout>
    <div class="mx-auto max-screen-2xl p-4 md:p-6 2xl:p-10">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="router.back()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <ArrowLeft class="w-6 h-6 text-gray-500" />
        </button>
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
          <Send class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">Buat WhatsApp Broadcast</h2>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest italic">HR • WhatsApp Mass Notification</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- ── LEFT: Form ── -->
        <div class="xl:col-span-2 space-y-6">
          <!-- Batch Info -->
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div class="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 rounded-t-3xl">
              <h3 class="text-base font-black text-gray-800 dark:text-white">Informasi Pesan</h3>
            </div>
            <div class="p-8 space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Batch Broadcast *</label>
                <input v-model="form.name" type="text" placeholder="Misal: Pengumuman THR Mei 2026..."
                  class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition text-sm font-bold" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subjek Pesan *</label>
                <input v-model="form.subject" type="text" placeholder="Gunakan judul yang menarik..."
                  class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition text-sm font-bold" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Isi Pesan WhatsApp *</label>
                <p class="text-[10px] text-gray-400 font-medium italic mb-2">Gunakan <code class="bg-emerald-50 text-emerald-600 px-1 rounded font-mono" v-pre>{{name}}</code> untuk nama penerima.</p>
                <textarea v-model="form.body" rows="8" placeholder="Halo {{name}}, kami ingin memberitahukan..."
                  class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition text-sm leading-relaxed resize-none">
                </textarea>
              </div>
            </div>
          </div>

          <!-- Recipients Selection -->
          <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div class="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 rounded-t-3xl">
              <h3 class="text-base font-black text-gray-800 dark:text-white">Target Penerima</h3>
            </div>

            <div class="p-8 space-y-8">
              <!-- Mode Selector -->
              <div class="flex flex-col sm:flex-row gap-3 p-1.5 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <button v-for="mode in recipientModes" :key="mode.id"
                  @click.prevent="recipientMode = mode.id"
                  :class="recipientMode === mode.id ? 'bg-white dark:bg-gray-900 text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
                  class="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300">
                  {{ mode.label }}
                </button>
              </div>

              <!-- Content: All Employees -->
              <div v-if="recipientMode === 'all'" class="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-start gap-4">
                <div class="p-2.5 bg-white dark:bg-emerald-900 rounded-xl text-emerald-600 shadow-sm shrink-0">
                  <Users class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-1">Seluruh Karyawan Aktif</p>
                  <p class="text-xs text-emerald-700/70 dark:text-emerald-400/70 leading-relaxed">Broadcast akan dikirim secara otomatis ke semua karyawan yang berstatus <span class="font-bold">Aktif</span> dan memiliki nomor WhatsApp yang terdaftar.</p>
                </div>
              </div>

              <!-- Content: By Locations -->
              <div v-if="recipientMode === 'location'" class="space-y-4">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih Lokasi Cabang</label>
                  <div class="relative group" ref="locationDropdownRef">
                    <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                    <input v-model="locationSearch" @focus="showLocationDropdown = true" type="text" placeholder="Cari nama lokasi..."
                      class="w-full pl-11 pr-10 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition text-sm font-bold" />
                    
                    <button v-if="locationSearch" @click="locationSearch = ''" class="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <X class="w-3.5 h-3.5" />
                    </button>
                    
                    <!-- Search Dropdown -->
                    <div v-show="showLocationDropdown"
                      class="absolute z-[60] left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto py-2 custom-scrollbar">
                      <template v-if="(locationSearch || '').length >= 2">
                        <div v-for="loc in filteredLocations" :key="loc.id" @mousedown.prevent="toggleLocation(loc)"
                          :class="[
                            selectedLocations.find(l => l.id === loc.id) ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          ]"
                          class="px-5 py-3 cursor-pointer flex items-center justify-between group transition-colors">
                          <div class="flex flex-col">
                            <span :class="selectedLocations.find(l => l.id === loc.id) ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'" class="text-sm font-bold group-hover:text-emerald-600 transition-colors">{{ loc.location_name }}</span>
                            <span class="text-[10px] text-gray-400 uppercase tracking-widest font-black">Cabang HS</span>
                          </div>
                          <div v-if="selectedLocations.find(l => l.id === loc.id)" class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check class="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                        <div v-if="filteredLocations.length === 0" class="px-5 py-12 text-center flex flex-col items-center gap-3">
                          <MapPin class="w-6 h-6 text-gray-300" />
                          <p class="text-xs text-gray-400 font-bold uppercase tracking-widest italic">Lokasi tidak ditemukan</p>
                        </div>
                      </template>
                      <div v-else class="px-5 py-8 text-center flex flex-col items-center gap-2">
                        <Search class="w-5 h-5 text-gray-300 animate-pulse" />
                        <p class="text-[10px] text-gray-300 uppercase tracking-widest font-black">Ketik min. 2 karakter...</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selected Badges -->
                <div v-if="selectedLocations.length > 0" class="space-y-3">
                  <div class="flex items-center justify-between">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lokasi Terpilih ({{ selectedLocations.length }})</p>
                    <button @click="clearAllLocations" class="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Hapus Semua</button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <div v-for="loc in selectedLocations" :key="loc.id"
                      class="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 animate-in zoom-in-95 duration-200">
                      {{ loc.name }}
                      <button @click="toggleLocation(loc)" class="hover:text-emerald-800 transition-colors">
                        <X class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Content: Custom Selection -->
              <div v-if="recipientMode === 'custom'" class="space-y-6">
                <!-- Select Location First -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Filter Lokasi (Bisa > 1)</label>
                    <div class="relative group" ref="filterLocationDropdownRef">
                      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                      <input v-model="filterLocationSearch" @focus="showFilterLocationDropdown = true" type="text" placeholder="Cari & pilih lokasi..."
                        class="w-full pl-11 pr-10 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition text-sm font-bold" />
                      
                      <button v-if="filterLocationSearch" @click="filterLocationSearch = ''" class="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <X class="w-3.5 h-3.5" />
                      </button>
                      
                      <!-- Filter Location Dropdown -->
                      <div v-show="showFilterLocationDropdown"
                        class="absolute z-[60] left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto py-2 custom-scrollbar">
                        <template v-if="(filterLocationSearch || '').length >= 2">
                          <div v-for="loc in filteredFilterLocations" :key="loc.id" @mousedown.prevent="toggleFilterLocation(loc)"
                            :class="[
                              filterLocationIds.includes(loc.id) ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            ]"
                            class="px-5 py-3 cursor-pointer flex items-center justify-between group transition-colors">
                            <span :class="filterLocationIds.includes(loc.id) ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'" class="text-sm font-bold group-hover:text-emerald-600 transition-colors">{{ loc.location_name }}</span>
                            <Check v-if="filterLocationIds.includes(loc.id)" class="w-4 h-4 text-emerald-500" />
                          </div>
                          <div v-if="filteredFilterLocations.length === 0" class="px-5 py-12 text-center flex flex-col items-center gap-3">
                            <Search class="w-6 h-6 text-gray-300" />
                            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest italic">Lokasi tidak ditemukan</p>
                          </div>
                        </template>
                        <div v-else class="px-5 py-8 text-center flex flex-col items-center gap-2">
                          <Search class="w-5 h-5 text-gray-300 animate-pulse" />
                          <p class="text-[10px] text-gray-300 uppercase tracking-widest font-black">Ketik min. 2 karakter...</p>
                        </div>
                      </div>
                    </div>

                    <!-- Selected Filter Locations Badges -->
                    <div v-if="(filterLocationIds || []).length > 0" class="flex flex-wrap gap-2 mt-2">
                      <div v-for="locId in filterLocationIds" :key="locId"
                        class="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 animate-in zoom-in-95">
                        {{ (locationStore.locations || []).find(l => l.id === locId)?.location_name || 'Unknown' }}
                        <button @click="removeFilterLocation(locId)" class="hover:text-rose-500 transition-colors">
                          <X class="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Pilih Karyawan (Bisa > 1)</label>
                    <div class="relative group" ref="employeeDropdownRef">
                      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                      <input v-model="employeeSearch" :disabled="(filterLocationIds || []).length === 0" @focus="showEmployeeDropdown = true" type="text" placeholder="Cari nama karyawan..."
                        class="w-full pl-11 pr-10 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition text-sm font-bold disabled:opacity-50" />
                      
                      <button v-if="employeeSearch" @click="employeeSearch = ''" class="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <X class="w-3.5 h-3.5" />
                      </button>

                      <div v-show="showEmployeeDropdown"
                        class="absolute z-[60] left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto py-2 custom-scrollbar">
                        <template v-if="(filterLocationIds || []).length === 0">
                          <div class="px-5 py-10 text-center flex flex-col items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center text-rose-500">
                              <MapPin class="w-5 h-5" />
                            </div>
                            <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">
                              Pilih lokasi terlebih dahulu<br/>
                              <span class="text-[8px] font-normal lowercase">untuk memfilter daftar karyawan</span>
                            </p>
                          </div>
                        </template>
                        <div v-else-if="isFetchingEmployees" class="p-12 text-center">
                          <Loader2 class="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                          <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-4">Mencari Karyawan...</p>
                        </div>
                        <template v-else-if="(employeeSearch || '').length >= 2">
                          <div v-for="emp in filteredEmployees" :key="emp.employeeId" @mousedown.prevent="toggleEmployee(emp)"
                            :class="[
                              selectedEmployees.find(e => e.employeeId === emp.employeeId) ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            ]"
                            class="px-5 py-3 cursor-pointer flex items-center justify-between group transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                            <div class="flex items-center gap-3">
                              <div class="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors">
                                <UserPlus class="w-4.5 h-4.5" />
                              </div>
                              <div class="flex flex-col">
                                <p :class="selectedEmployees.find(e => e.employeeId === emp.employeeId) ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'" class="text-sm font-bold group-hover:text-emerald-600 transition-colors">{{ emp.fullName }}</p>
                                <div class="flex items-center gap-2">
                                  <span class="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-400 font-black uppercase tracking-tighter">{{ emp.position?.name || 'Unknown' }}</span>
                                  <span class="text-[10px] text-gray-400 font-mono tracking-tighter">{{ emp.phone || 'No Phone' }}</span>
                                </div>
                              </div>
                            </div>
                            <div v-if="selectedEmployees.find(e => e.employeeId === emp.employeeId)" class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <Check class="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                          <div v-if="filteredEmployees.length === 0" class="px-5 py-12 text-center flex flex-col items-center gap-3">
                            <Search class="w-6 h-6 text-gray-300" />
                            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest italic">Karyawan tidak ditemukan</p>
                          </div>
                        </template>
                        <div v-else class="px-5 py-8 text-center flex flex-col items-center gap-2">
                          <Search class="w-5 h-5 text-gray-300 animate-pulse" />
                          <p class="text-[10px] text-gray-300 uppercase tracking-widest font-black">Ketik min. 2 karakter...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selected Employee List -->
                <div v-if="selectedEmployees.length > 0" class="space-y-3">
                  <div class="flex items-center justify-between">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Karyawan Terpilih ({{ selectedEmployees.length }})</p>
                    <button @click="clearAllEmployees" class="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Hapus Semua</button>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div v-for="emp in selectedEmployees" :key="emp.employeeId"
                      class="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                      <div class="overflow-hidden">
                        <p class="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{{ emp.fullName }}</p>
                        <p class="text-[9px] text-gray-400 font-mono">{{ emp.phone }}</p>
                      </div>
                      <button @click="toggleEmployee(emp)" class="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                        <X class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── RIGHT: Preview & Actions ── -->
        <div class="space-y-6">
          <!-- Preview Card -->
          <div class="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 rounded-[2rem] shadow-xl shadow-emerald-500/20 relative overflow-hidden">
            <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div class="relative z-10 space-y-4">
              <p class="text-[10px] font-black text-white/50 uppercase tracking-widest">Ringkasan Broadcast</p>
              <div class="space-y-4">
                <div>
                  <p class="text-[9px] text-white/40 uppercase font-black tracking-[0.15em]">Nama Batch</p>
                  <p class="text-sm font-bold text-white/95">{{ form.name || '—' }}</p>
                </div>
                <div>
                  <p class="text-[9px] text-white/40 uppercase font-black tracking-[0.15em]">Metode Penerima</p>
                  <p class="text-xs font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded-lg inline-block mt-1">{{ activeModeLabel }}</p>
                </div>
                <div v-if="recipientMode === 'all'">
                  <p class="text-[9px] text-white/40 uppercase font-black tracking-[0.15em]">Estimasi Target</p>
                  <p class="text-lg font-black italic">Seluruh Karyawan Aktif</p>
                </div>
                <div v-else-if="recipientMode === 'location'">
                  <p class="text-[9px] text-white/40 uppercase font-black tracking-[0.15em]">Lokasi Dipilih</p>
                  <p class="text-2xl font-black">{{ selectedLocations.length }} <span class="text-xs font-medium italic opacity-60 ml-1">Cabang</span></p>
                </div>
                <div v-else-if="recipientMode === 'custom'">
                  <p class="text-[9px] text-white/40 uppercase font-black tracking-[0.15em]">Karyawan Dipilih</p>
                  <p class="text-2xl font-black">{{ selectedEmployees.length }} <span class="text-xs font-medium italic opacity-60 ml-1">Orang</span></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button @click="handleSubmit" :disabled="isSaving || !isFormValid"
              class="w-full py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/25 hover:bg-emerald-700 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50">
              {{ isSaving ? 'Memproses...' : 'Kirim Sekarang' }}
            </button>
            <button @click="router.back()"
              class="w-full py-4 bg-white dark:bg-gray-900 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 transition-all shadow-sm">
              Batal
            </button>
          </div>

          <!-- Tips -->
          <div class="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-800">
            <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Pemberitahuan</p>
            <ul class="text-xs text-blue-700 dark:text-blue-400 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
              <li>Pesan akan dikirim melalui WhatsApp API</li>
              <li>Hanya karyawan dengan nomor HP terdaftar yang akan menerima pesan</li>
              <li>Gunakan <code class="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded text-[10px]" v-pre>{{name}}</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { ArrowLeft, Send, Plus, X, Users, MapPin, UserPlus, Search, Check, Loader2 } from 'lucide-vue-next';
import { BroadcastService } from './broadcast.service';
import { BroadcastMapper } from './broadcast.mapper';
import { EmployeeService } from '@/modules/organization/employees/employee.service';
import { LocationService } from '@/modules/master/locations/location.service';
import { useLocationStore } from '@/modules/master/locations/location.store';
import { Alert } from '@/plugins/sweetalert';

const router = useRouter();
const locationStore = useLocationStore();
const isSaving = ref(false);

const form = ref({
  name: '',
  subject: '',
  body: ''
});

// Selection States
const recipientMode = ref('all');
const recipientModes = [
  { id: 'all', label: 'Seluruh Karyawan' },
  { id: 'location', label: 'Per Lokasi' },
  { id: 'custom', label: 'Pilih Karyawan' }
];

// Mode: Location
const locationDropdownRef = ref(null);
const selectedLocations = ref([]);
const locationSearch = ref('');
const showLocationDropdown = ref(false);
const isSearchingLocations = ref(false);
const locations = ref([]);

const filteredLocations = computed(() => {
  return locations.value;
});

let locSearchTimeout = null;
const handleLocationsSearch = () => {
  if (locSearchTimeout) clearTimeout(locSearchTimeout);
  if (locationSearch.value.length < 2) { locations.value = []; return; }
  locSearchTimeout = setTimeout(async () => {
    isSearchingLocations.value = true;
    try {
      const res = await LocationService.getAll({ search: locationSearch.value, is_active: true, limit: 20 });
      locations.value = res.data || [];
    } catch (err) {
      console.error(err);
    } finally {
      isSearchingLocations.value = false;
    }
  }, 300);
};

const toggleLocation = (loc) => {
  const idx = selectedLocations.value.findIndex(l => l.id === loc.id);
  if (idx > -1) {
    selectedLocations.value.splice(idx, 1);
  } else {
    selectedLocations.value.push(loc);
  }
};

const clearAllLocations = () => {
  selectedLocations.value = [];
};

// Mode: Custom
const filterLocationDropdownRef = ref(null);
const filterLocationIds = ref([]);
const filterLocationSearch = ref('');
const showFilterLocationDropdown = ref(false);
const isSearchingFilterLocations = ref(false);
const filterLocations = ref([]);

const filteredFilterLocations = computed(() => {
  return filterLocations.value;
});

let filterLocSearchTimeout = null;
const handleFilterLocationsSearch = () => {
  if (filterLocSearchTimeout) clearTimeout(filterLocSearchTimeout);
  if (filterLocationSearch.value.length < 2) { filterLocations.value = []; return; }
  filterLocSearchTimeout = setTimeout(async () => {
    isSearchingFilterLocations.value = true;
    try {
      const res = await LocationService.getAll({ search: filterLocationSearch.value, is_active: true, limit: 20 });
      filterLocations.value = res.data || [];
    } catch (err) {
      console.error(err);
    } finally {
      isSearchingFilterLocations.value = false;
    }
  }, 300);
};

const toggleFilterLocation = (loc) => {
  const idx = filterLocationIds.value.indexOf(loc.id);
  if (idx > -1) filterLocationIds.value.splice(idx, 1);
  else filterLocationIds.value.push(loc.id);
  // Re-fetch employees if needed or clear them
  employeesInLocation.value = [];
};

const removeFilterLocation = (locId) => {
  const idx = filterLocationIds.value.indexOf(locId);
  if (idx > -1) filterLocationIds.value.splice(idx, 1);
  employeesInLocation.value = [];
};

const employeeDropdownRef = ref(null);
const employeesInLocation = ref([]);
const isFetchingEmployees = ref(false);
const employeeSearch = ref('');
const showEmployeeDropdown = ref(false);
const selectedEmployees = ref([]);

const filteredEmployees = computed(() => {
  return employeesInLocation.value;
});

let empSearchTimeout = null;
const handleEmployeeSearch = () => {
  if (empSearchTimeout) clearTimeout(empSearchTimeout);
  if (employeeSearch.value.length < 2) { employeesInLocation.value = []; return; }
  empSearchTimeout = setTimeout(async () => {
    isFetchingEmployees.value = true;
    try {
      // Fetch employees across all selected locations with search query
      const promises = filterLocationIds.value.map(id => 
        EmployeeService.getAll({ 
          location_id: id, 
          search: employeeSearch.value,
          status: 'active',
          limit: 100 
        })
      );
      const results = await Promise.all(promises);
      const allEmps = results.flatMap(r => r.data);
      const uniqueMap = new Map();
      allEmps.forEach(e => {
        if (e.employeeId) uniqueMap.set(e.employeeId, e);
      });
      employeesInLocation.value = Array.from(uniqueMap.values());
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      isFetchingEmployees.value = false;
    }
  }, 300);
};

const toggleEmployee = (emp) => {
  const idx = selectedEmployees.value.findIndex(e => e.employeeId === emp.employeeId);
  if (idx > -1) {
    selectedEmployees.value.splice(idx, 1);
  } else {
    selectedEmployees.value.push(emp);
  }
};

const clearAllEmployees = () => {
  selectedEmployees.value = [];
};

// Search Watchers
watch(locationSearch, () => {
  handleLocationsSearch();
});

watch(filterLocationSearch, () => {
  handleFilterLocationsSearch();
});

watch(employeeSearch, () => {
  handleEmployeeSearch();
});

// Click Outside Logic
const handleClickOutside = (event) => {
  if (locationDropdownRef.value && !locationDropdownRef.value.contains(event.target)) {
    showLocationDropdown.value = false;
  }
  if (filterLocationDropdownRef.value && !filterLocationDropdownRef.value.contains(event.target)) {
    showFilterLocationDropdown.value = false;
  }
  if (employeeDropdownRef.value && !employeeDropdownRef.value.contains(event.target)) {
    showEmployeeDropdown.value = false;
  }
};

// Validation & Labels
const activeModeLabel = computed(() => recipientModes.find(m => m.id === recipientMode.value)?.label);

const isFormValid = computed(() => {
  const basic = form.value.name.length >= 3 && form.value.subject.length >= 3 && form.value.body.length >= 10;
  if (recipientMode.value === 'all') return basic;
  if (recipientMode.value === 'location') return basic && selectedLocations.value.length > 0;
  if (recipientMode.value === 'custom') return basic && selectedEmployees.value.length > 0;
  return false;
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  const confirmed = await Alert.confirm(
    'Kirim WhatsApp Broadcast?',
    'Pesan akan segera diproses di background. Pastikan isi pesan sudah benar.'
  );
  if (!confirmed) return;

  isSaving.value = true;
  try {
    let payload;
    if (recipientMode.value === 'all') {
      payload = BroadcastMapper.toPayloadAllEmployees(form.value);
    } else if (recipientMode.value === 'location') {
      payload = BroadcastMapper.toPayloadByLocations(form.value, selectedLocations.value.map(l => l.id));
    } else {
      payload = BroadcastMapper.toPayloadCustom(form.value, selectedEmployees.value.map(e => e.employeeId));
    }

    await BroadcastService.create(payload);
    Alert.success('Broadcast Dibuat', 'WhatsApp sedang dikirim ke semua target terpilih');
    router.push({ name: 'HrBroadcasts' });
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat membuat broadcast');
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  locationStore.fetchLocations({ limit: 100 });
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

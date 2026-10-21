<template>
  <AdminLayout>
    <div v-if="detail" class="mx-auto max-w-(--breakpoint-2xl) space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div class="flex items-center gap-5">
          <button @click="router.back()" class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm group">
            <MoveLeft class="w-5 h-5 text-gray-500 group-hover:text-brand-500 transition-colors" />
          </button>
          <div>
            <div class="flex items-center gap-3">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {{ detail.kode_maintenance }} - {{ detail.event_item }}
              </h2>
              <Badge :color="getStatusColor(detail.status)" size="md" class="uppercase font-bold tracking-widest">{{ detail.status }}</Badge>
            </div>
            <div class="flex items-center gap-3 mt-1.5">
              <div class="flex items-center gap-1.5 text-gray-400 text-xs">
                <Calendar class="w-3.5 h-3.5" />
                Dibuat pada {{ formatDate(detail.date_maintenance) }}
              </div>
              <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
              <div class="flex items-center gap-1.5 text-gray-400 text-xs uppercase font-bold tracking-tighter">
                ID: {{ route.params.id.split('-')[0] }}...
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button 
            v-if="detail.status !== 'draft'"
            @click="handleHold"
            class="px-5 py-2.5 text-sm font-bold rounded-xl transition-all border shadow-sm flex items-center gap-2"
            :class="detail.is_hold ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-800'"
          >
            <Pause v-if="!detail.is_hold" class="w-4 h-4" />
            <Play v-else class="w-4 h-4" />
            {{ detail.is_hold ? 'Lanjutkan Tiket' : 'Hold Tiket' }}
          </button>
          <button 
            v-if="detail.status !== 'done'"
            v-can="'maintenance:delete'"
            @click="handleDelete"
            class="px-5 py-2.5 text-sm font-bold text-error-600 border border-error-100 bg-error-50 rounded-xl hover:bg-error-100 transition-all shadow-sm flex items-center gap-2"
          >
            <Trash2 class="w-4 h-4" />
            {{ detail.status === 'draft' ? 'Hapus Draft' : 'Batalkan Tiket' }}
          </button>
        </div>
      </div>

      <!-- Stepper Visual -->
      <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-theme-xs">
        <div class="flex items-center justify-between relative max-w-3xl mx-auto">
          <!-- Connector line background -->
          <div class="absolute top-5 left-0 w-full h-px bg-gray-100 dark:bg-gray-800"></div>
          
          <div v-for="(step, index) in steps" :key="step.key" class="relative z-10 flex flex-col items-center gap-3 bg-white dark:bg-gray-900 px-4">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500"
              :class="[
                index < currentStageIndex ? 'bg-success-500 border-success-50 text-white shadow-sm shadow-success-500/20' : 
                index === currentStageIndex ? 'bg-brand-500 border-brand-50 text-white shadow-md shadow-brand-500/30 ring-4 ring-brand-500/10' : 
                'bg-gray-50 border-gray-100 text-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600'
              ]"
            >
              <Check v-if="index < currentStageIndex" class="w-5 h-5" />
              <span v-else class="text-sm font-bold">{{ index + 1 }}</span>
            </div>
            <span 
              class="text-[11px] uppercase tracking-wider transition-all duration-500"
              :class="index <= currentStageIndex ? 'text-gray-800 dark:text-gray-200 font-semibold' : 'text-gray-300 dark:text-gray-600 font-medium'"
            >
              {{ step.label }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <!-- Left: Summary Info & History -->
        <div class="lg:col-span-1 space-y-8">
          <!-- Request Summary Card -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
              <h3 class="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FileText class="w-4 h-4 text-brand-500" />
                Ringkasan Pengajuan
              </h3>
            </div>
            
            <div class="p-5 space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Lokasi Unit</label>
                  <p class="text-sm text-gray-800 dark:text-gray-200 font-semibold truncate">
                    {{ detail.location?.location_name || '-' }}
                  </p>
                </div>
                
                <div class="space-y-1">
                  <label class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Pelapor</label>
                  <p class="text-sm text-gray-800 dark:text-gray-200 font-semibold truncate">{{ detail.pic_ga?.full_name || '-' }}</p>
                </div>
              </div>
  
              <div class="space-y-1.5 pt-3 border-t border-gray-50 dark:border-gray-800/50">
                <label class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Deskripsi Awal</label>
                <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p class="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">"{{ detail.description }}"</p>
                </div>
              </div>
  
              <div v-if="detail.initial_photo" class="pt-3 border-t border-gray-50 dark:border-gray-800/50">
                <label class="text-[10px] uppercase font-bold text-gray-400 tracking-widest block mb-2">Foto Kondisi Awal</label>
                <div class="relative group cursor-pointer overflow-hidden rounded-xl">
                  <img
                    :src="getPhotoUrl(detail.initial_photo)"
                    @click="openPhoto(detail.initial_photo, 'Foto Kondisi Awal')"
                    class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 class="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress History Timeline -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
              <h3 class="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Clock class="w-4 h-4 text-brand-500" />
                Riwayat Progres
              </h3>
              <span class="text-[10px] bg-brand-50 dark:bg-brand-500/10 text-brand-600 px-2 py-0.5 rounded-full font-bold">{{ progressList.length }} Update</span>
            </div>
            
            <div class="p-5">
              <div v-if="progressList.length === 0" class="py-10 text-center space-y-2">
                <div class="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                  <Inbox class="w-5 h-5 text-gray-300" />
                </div>
                <p class="text-[11px] text-gray-400 italic">Belum ada update progres.</p>
              </div>
              
              <div v-else class="space-y-5">
                <div 
                  v-for="item in progressList" 
                  :key="item.id" 
                  class="group rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-brand-200 dark:hover:border-brand-500/30 transition-all duration-300"
                >
                  <!-- Stage Header -->
                  <div class="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-50 dark:border-gray-800/50">
                    <div class="flex items-center gap-2.5">
                      <div 
                        class="w-6 h-6 rounded-lg flex items-center justify-center shadow-sm"
                        :class="item.is_done ? 'bg-success-500' : 'bg-brand-500'"
                      >
                        <Check class="w-3.5 h-3.5 text-white" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">
                          {{ item.stage }}
                        </span>
                        <span class="text-[9px] text-gray-400 font-medium">{{ formatDate(item.date_stage) }}</span>
                      </div>
                    </div>
                    <Badge v-if="item.is_done" color="success" size="xs">SELESAI</Badge>
                  </div>

                  <!-- Photo -->
                  <div v-if="item.evidence_photo" class="relative overflow-hidden aspect-[16/9]">
                    <img
                      :src="getPhotoUrl(item.evidence_photo)"
                      @click="openPhoto(item.evidence_photo, `Bukti ${item.stage}`)"
                      class="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-700"
                      :alt="`Bukti ${item.stage}`"
                    />
                    <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <span class="text-[9px] text-white/90 flex items-center gap-1">
                        <Maximize2 class="w-3 h-3" /> Klik untuk perbesar
                      </span>
                    </div>
                  </div>

                  <!-- Detail Info -->
                  <div class="px-4 py-4 space-y-3 bg-white dark:bg-gray-900">
                    <div v-if="item.notes || item.work_progress_note || item.screening_result" class="relative pl-3 border-l-2 border-brand-200 dark:border-brand-500/30">
                      <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                        "{{ item.notes || item.work_progress_note || item.screening_result }}"
                      </p>
                    </div>
                    
                    <div class="flex flex-wrap gap-4 pt-1">
                      <div v-if="item.vendor_name" class="flex flex-col gap-0.5">
                        <span class="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Vendor</span>
                        <span class="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{{ item.vendor_name }}</span>
                      </div>
                      <div v-if="item.total_payment" class="flex flex-col gap-0.5 ml-auto text-right">
                        <span class="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Total Biaya</span>
                        <span class="text-[11px] font-bold text-brand-600 dark:text-brand-400">{{ formatCurrency(item.total_payment) }}</span>
                      </div>
                    </div>

                    <div v-if="!item.notes && !item.vendor_name && !item.total_payment && !item.evidence_photo && !item.work_progress_note && !item.screening_result" class="py-1">
                      <span class="text-[10px] italic text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">Tanpa keterangan tambahan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Dynamic Form Progress -->
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div class="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
              <div class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-500">
                <LayoutGrid class="w-4 h-4" />
                Workflow: {{ detail.status === 'done' ? 'Selesai' : steps[currentStageIndex]?.label }}
              </div>
              <Badge :color="detail.status === 'done' ? 'success' : 'info'">{{ detail.status === 'done' ? 'Selesai' : 'Tahap Aktif' }}</Badge>
            </div>
            

            <div class="p-8">
              <!-- Draft Warning and Activation Card -->
              <div v-if="detail.status === 'draft'" class="space-y-6 text-center py-8">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText class="w-8 h-8" />
                </div>
                <h4 class="text-base font-bold text-gray-700 dark:text-gray-300">Tiket Berstatus Draft</h4>
                <p class="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Tiket maintenance ini masih disimpan sebagai draft. Aktifkan tiket ini terlebih dahulu agar Anda dapat mulai memproses dan mencatat progres pengerjaan.
                </p>
                <button
                  v-can="'maintenance:update'"
                  @click="handleActivateTicket"
                  :disabled="isSubmitting"
                  class="mt-4 px-6 py-3 bg-gradient-to-b from-[#1e1e1e] to-[#0a0a0a] hover:from-[#2e2e2e] hover:to-[#1a1a1a] text-white font-bold rounded-xl shadow-lg transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle class="w-5 h-5" />
                  Aktifkan Tiket
                </button>
              </div>

              <template v-else>
                <!-- Stage 0 Form (Request) -->
              <div v-if="currentStageIndex === 0" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-brand-25 dark:bg-brand-500/5 rounded-xl border border-brand-100 dark:border-brand-500/10">
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Pengajuan</label>
                    <DatePicker v-model="progressForm.date_stage" :disabled="detail.status === 'done'" />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Catatan Kerusakan Awal</label>
                    <textarea v-model="progressForm.notes" :disabled="detail.status === 'done'" rows="3" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" placeholder="Detail kerusakan atau keluhan..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Stage 1 Form (Screening) -->
              <div v-else-if="currentStageIndex === 1" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-warning-25 dark:bg-warning-500/5 rounded-xl border border-warning-100 dark:border-warning-500/10">
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Stage</label>
                    <DatePicker v-model="progressForm.date_stage" :disabled="detail.status === 'done'" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Survey</label>
                    <DatePicker v-model="progressForm.date_survey" :disabled="detail.status === 'done'" />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Nama Vendor</label>
                    <input v-model="progressForm.vendor_name" :disabled="detail.status === 'done'" type="text" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" placeholder="CV Sejuk Abadi..." />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Hasil Screening / Temuan</label>
                    <textarea v-model="progressForm.screening_result" :disabled="detail.status === 'done'" rows="3" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" placeholder="Detail hasil pemeriksaan lapangan..."></textarea>
                  </div>
                  <div class="flex items-center gap-2 md:col-span-2">
                    <input type="checkbox" v-model="progressForm.need_vendor_schedule" :disabled="detail.status === 'done'" id="needSchedule" class="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500" />
                    <label for="needSchedule" class="text-sm font-semibold text-gray-700 dark:text-gray-300">Butuh Jadwal Vendor?</label>
                  </div>
                  <div v-if="progressForm.need_vendor_schedule" class="space-y-2 md:col-span-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Jadwal Pengerjaan</label>
                    <DatePicker v-model="progressForm.date_work_schedule" :disabled="detail.status === 'done'" />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Catatan Tambahan</label>
                    <textarea v-model="progressForm.notes" :disabled="detail.status === 'done'" rows="2" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" placeholder="Catatan internal..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Stage 2 Form (Payment/Vendor) -->
              <div v-else-if="currentStageIndex === 2" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-success-25 dark:bg-success-500/5 rounded-xl border border-success-100 dark:border-success-500/10">
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Stage</label>
                    <DatePicker v-model="progressForm.date_stage" :disabled="detail.status === 'done'" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Down Payment (DP)</label>
                    <input 
                      :value="formatThousand(progressForm.down_payment)" 
                      @input="e => progressForm.down_payment = parseThousand(e.target.value)"
                      :disabled="detail.status === 'done'" 
                      type="text" 
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" 
                      placeholder="Rp. 0" 
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Pelunasan</label>
                    <input 
                      :value="formatThousand(progressForm.done_payment)" 
                      @input="e => progressForm.done_payment = parseThousand(e.target.value)"
                      :disabled="detail.status === 'done'" 
                      type="text" 
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" 
                      placeholder="Rp. 0" 
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Pembayaran</label>
                    <input 
                      :value="formatThousand(progressForm.total_payment)" 
                      disabled 
                      type="text" 
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 cursor-not-allowed opacity-75 transition-all" 
                      placeholder="Rp. 0" 
                    />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Keterangan Pembayaran</label>
                    <textarea v-model="progressForm.notes" :disabled="detail.status === 'done'" rows="2" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" placeholder="Detail termin pembayaran..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Stage 3 Form (Work/Pengerjaan) -->
              <div v-else-if="currentStageIndex === 3" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-orange-25 dark:bg-orange-500/5 rounded-xl border border-orange-100 dark:border-orange-500/10">
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Stage</label>
                    <DatePicker v-model="progressForm.date_stage" :disabled="detail.status === 'done'" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Mulai Pengerjaan</label>
                    <DatePicker v-model="progressForm.date_work_start" :disabled="detail.status === 'done'" />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Catatan Progres Pekerjaan</label>
                    <textarea v-model="progressForm.work_progress_note" :disabled="detail.status === 'done'" rows="3" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" placeholder="Apa yang sedang dikerjakan..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Stage 4 Form (Done) -->
              <div v-else-if="currentStageIndex === 4 && detail.status !== 'done'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-blue-light-25 dark:bg-blue-light-500/5 rounded-xl border border-blue-light-100 dark:border-blue-light-500/10">
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Stage</label>
                    <DatePicker v-model="progressForm.date_stage" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Selesai</label>
                    <DatePicker v-model="progressForm.date_done" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Down Payment (DP)</label>
                    <input 
                      :value="formatThousand(progressForm.down_payment)" 
                      @input="e => progressForm.down_payment = parseThousand(e.target.value)"
                      type="text" 
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" 
                      placeholder="Rp. 0" 
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Pelunasan Pembayaran</label>
                    <input 
                      :value="formatThousand(progressForm.done_payment)" 
                      @input="e => progressForm.done_payment = parseThousand(e.target.value)"
                      type="text" 
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" 
                      placeholder="Rp. 0" 
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Pembayaran</label>
                    <input 
                      :value="formatThousand(progressForm.total_payment)" 
                      disabled 
                      type="text" 
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 cursor-not-allowed opacity-75 transition-all" 
                      placeholder="Rp. 0" 
                    />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Catatan Penyelesaian Akhir</label>
                    <textarea v-model="progressForm.notes" rows="4" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 transition-all" placeholder="Pekerjaan selesai 100%..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Photo Upload (Conditional) -->
              <div v-if="stageNeedsPhoto && detail.status !== 'done'" class="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Upload Bukti Foto (Wajib tiap update) <span class="text-red-500">*</span></label>
                <div class="flex items-center justify-center w-full">
                  <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 dark:bg-gray-800/30 dark:border-gray-700 dark:hover:border-gray-600">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                      <Camera class="w-8 h-8 text-gray-400 mb-2" />
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        <span class="font-bold">Klik untuk upload foto progress</span>
                      </p>
                      <p v-if="photoFile" class="text-xs text-brand-600 mt-2 font-bold">{{ photoFile.name }}</p>
                    </div>
                    <input type="file" class="hidden" accept="image/*" @change="handleFileChange" />
                  </label>
                </div>
              </div>

              <!-- Submit Actions -->
              <div v-if="currentStageIndex >= 0 && detail.status !== 'done'" class="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                <!-- Info banner if re-editing an existing stage -->
                <div v-if="currentStageHasExistingProgress" class="mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ Tahap ini sudah memiliki data progres. Simpan akan <strong>memperbarui</strong> data yang ada.
                </div>
                <div class="flex gap-4">
                  <button 
                    v-can="'maintenance:update'"
                    @click="submitUpdate(false)"
                    :disabled="isSubmitting"
                    class="flex-1 px-6 py-3 border border-brand-200 text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save class="w-5 h-5" /> Simpan Draft
                  </button>
                  <button 
                    v-can="'maintenance:update'"
                    @click="submitUpdate(true)"
                    :disabled="isSubmitting"
                    class="flex-1 px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle class="w-5 h-5" />
                    Selesai & Lanjut ke {{ nextStageLabel }}
                  </button>
                </div>
              </div>

              <!-- Completed Banner -->
              <div v-if="detail.status === 'done'" class="mt-8 p-6 bg-success-50 dark:bg-success-900/20 border border-success-100 dark:border-success-800/30 rounded-2xl text-center">
                <div class="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-success-500/20">
                  <Check class="w-6 h-6 text-white" />
                </div>
                <h4 class="text-base font-bold text-success-700 dark:text-success-400">Maintenance Selesai</h4>
                <p class="text-xs text-success-600 dark:text-success-500 mt-1">Tiket ini telah diselesaikan dan tidak dapat diubah lagi.</p>
              </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Width Audit History -->
      <div class="mt-8">
        <AuditHistory module="MAINTENANCE_HEADER" :recordId="route.params.id" />
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-else class="flex items-center justify-center min-h-[500px]">
      <div class="animate-spin h-10 w-10 border-4 border-brand-600 border-t-transparent rounded-full font-bold"></div>
    </div>

    <!-- Modal pratinjau gambar -->
    <FilePreviewModal v-model="photoModal" :src="photoSrc" :title="photoTitle" mime="image/*" />
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Badge from '@/components/ui/Badge.vue';
import AuditHistory from '@/components/common/AuditHistory.vue';
import { useMaintenanceStore } from './maintenance.store';
import { Alert } from '@/plugins/sweetalert';
import DatePicker from '@/components/ui/DatePicker.vue';
import FilePreviewModal from '@/components/common/FilePreviewModal.vue';
import { formatThousand, parseThousand } from '@/utils/format';
import { MoveLeft, Check, Save, CheckCircle, LayoutGrid, Camera, FileText, Clock, Inbox, Maximize2, Pause, Play, Trash2, Calendar } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const maintenanceStore = useMaintenanceStore();

// --- State ---
const isSubmitting = ref(false);
const photoFile = ref(null);

// --- Modal pratinjau gambar ---
const photoModal = ref(false);
const photoSrc = ref('');
const photoTitle = ref('Pratinjau Gambar');

const progressForm = reactive({
  date_stage: new Date().toISOString().split('T')[0],
  // Stage: request
  notes: '',
  // Stage: screening
  date_survey: '',
  vendor_name: '',
  screening_result: '',
  need_vendor_schedule: false,
  date_work_schedule: '',
  // Stage: payment
  down_payment: 0,
  done_payment: 0,
  total_payment: 0,
  // Stage: work
  date_work_start: '',
  work_progress_note: '',
  // Stage: done
  date_done: ''
});

const resetProgressForm = () => {
  progressForm.date_stage = new Date().toISOString().split('T')[0];
  progressForm.notes = '';
  progressForm.date_survey = '';
  progressForm.vendor_name = '';
  progressForm.screening_result = '';
  progressForm.need_vendor_schedule = false;
  progressForm.date_work_schedule = '';
  progressForm.down_payment = 0;
  progressForm.done_payment = 0;
  progressForm.total_payment = 0;
  progressForm.date_work_start = '';
  progressForm.work_progress_note = '';
  progressForm.date_done = '';
};

const steps = [
  { key: 'request', label: 'Request' },
  { key: 'screening', label: 'Screening' },
  { key: 'payment', label: 'Pembayaran' },
  { key: 'work', label: 'Pengerjaan' },
  { key: 'done', label: 'Done' }
];

// --- Computed ---
const detail = computed(() => maintenanceStore.maintenanceDetail);
// Use embedded progress array from detail response (already fetched in one call)
const progressList = computed(() => detail.value?.progress || []);

const currentStageIndex = computed(() => {
  if (!detail.value) return 0;
  const stage = detail.value.current_stage || 'request';
  return steps.findIndex(s => s.key === stage.toLowerCase());
});

const stageNeedsPhoto = computed(() => [0, 3, 4].includes(currentStageIndex.value));

const nextStageLabel = computed(() => {
  const nextIdx = currentStageIndex.value + 1;
  return steps[nextIdx]?.label || 'Selesai';
});

const currentStageHasExistingProgress = computed(() => {
  const currentStep = steps[currentStageIndex.value];
  if (!currentStep) return false;
  return progressList.value.some(p => p.stage === currentStep.key);
});


// Pre-fill form from the most recent progress entry for the active stage
const prefillFormFromExisting = () => {
  const currentStep = steps[currentStageIndex.value];
  if (!currentStep) return;
  const existing = progressList.value
    .filter(p => p.stage === currentStep.key)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  if (existing) {
    const toDate = (v) => v ? v.split('T')[0] : '';
    progressForm.date_stage      = toDate(existing.date_stage) || new Date().toISOString().split('T')[0];
    progressForm.notes           = existing.notes || '';
    progressForm.date_survey     = toDate(existing.date_survey);
    progressForm.vendor_name     = existing.vendor_name || '';
    progressForm.screening_result = existing.screening_result || '';
    progressForm.need_vendor_schedule = existing.need_vendor_schedule || false;
    progressForm.date_work_schedule = toDate(existing.date_work_schedule);
    progressForm.down_payment    = existing.down_payment || 0;
    progressForm.done_payment    = existing.done_payment || 0;
    progressForm.total_payment   = existing.total_payment || 0;
    progressForm.date_work_start = toDate(existing.date_work_start);
    progressForm.work_progress_note = existing.work_progress_note || '';
    progressForm.date_done       = toDate(existing.date_done);
  } else {
    resetProgressForm();
    
    // Autofill payment data from stage 2 if currently in stage 4
    if (currentStep.key === 'done') {
      const paymentStage = progressList.value.find(p => p.stage === 'payment');
      if (paymentStage) {
        progressForm.down_payment = paymentStage.down_payment || 0;
        progressForm.done_payment = paymentStage.done_payment || 0;
        progressForm.total_payment = paymentStage.total_payment || 0;
      }
    }
  }
};

// --- Watchers ---
// Watch for detail changes (including progress updates or stage transitions)
watch(() => detail.value, () => {
  photoFile.value = null;
  prefillFormFromExisting();
}, { deep: true, immediate: true });

// Auto-calculate total_payment based on down_payment and done_payment
watch(
  () => [progressForm.down_payment, progressForm.done_payment],
  ([dp, pelunasan]) => {
    progressForm.total_payment = (Number(dp) || 0) + (Number(pelunasan) || 0);
  }
);

// --- Methods ---

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString));
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const getStatusColor = (status) => {
  const map = { open: 'info', hold: 'warning', done: 'success' };
  return map[status?.toLowerCase()] || 'primary';
};

const getPhotoUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Membersihkan path jika mengandung domain/prefix yang salah (seperti .internalhs.cloud/api/)
  let cleanPath = path;
  if (path.includes('api/uploads')) {
    cleanPath = '/uploads' + path.split('api/uploads')[1];
  } else if (path.includes('uploads/')) {
    cleanPath = '/uploads' + path.split('uploads')[1];
  }
  
  // Pastikan diawali dengan satu slash
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  return `${base}${cleanPath}`;
};

const openPhoto = (path, title = 'Pratinjau Gambar') => {
  if (!path) return;
  photoSrc.value = getPhotoUrl(path);
  photoTitle.value = title;
  photoModal.value = true;
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) photoFile.value = file;
};

const submitUpdate = async (isDone = false) => {
  const currentStep = steps[currentStageIndex.value];
  
  // Check if there's already a progress entry for this stage
  const existingForStage = progressList.value.find(p => p.stage === currentStep.key);

  // Photo required only if: stage needs photo AND it's a fresh submission (no existing entry with photo)
  const photoRequired = stageNeedsPhoto.value && !existingForStage?.evidence_photo && !photoFile.value;
  if (photoRequired) {
    Alert.error('Upload Wajib', 'Mohon lampirkan foto bukti untuk tahap ini.');
    return;
  }

  try {
    isSubmitting.value = true;
    
    const payload = {
      ...progressForm,
      stage: currentStep.key,
      is_done: isDone
    };

    await maintenanceStore.submitProgress(route.params.id, payload, photoFile.value);
    
    Alert.success('Berhasil', isDone ? 'Tahap ini telah diselesaikan!' : 'Progres berhasil disimpan.');
    photoFile.value = null;
    // resetProgressForm() removed to avoid conflict with prefill watcher
    
  } catch (error) {
    console.error('Update progress error:', error);
    Alert.error('Terjadi Kesalahan', error.response?.data?.message || 'Gagal mengupdate progres.');
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  const confirmed = await Alert.confirm('Hapus Tiket', 'Apakah Anda yakin ingin membatalkan dan menghapus tiket ini?');
  if (!confirmed) return;

  try {
    await maintenanceStore.deleteTicket(route.params.id);
    Alert.success('Berhasil', 'Tiket telah dihapus.');
    router.push({ name: 'TranMaintenance' });
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Gagal menghapus tiket.');
  }
};

const handleHold = async () => {
  try {
    const newHoldStatus = !detail.value.is_hold;
    await maintenanceStore.updateHeader(route.params.id, { isHold: newHoldStatus });
    Alert.success('Berhasil', newHoldStatus ? 'Tiket di-hold.' : 'Tiket dilanjutkan.');
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Gagal mengubah status hold.');
  }
};

const handleActivateTicket = async () => {
  try {
    isSubmitting.value = true;
    await maintenanceStore.updateHeader(route.params.id, { status: 'open' });
    Alert.success('Berhasil', 'Tiket maintenance telah diaktifkan.');
  } catch (error) {
    console.error('Activate ticket error:', error);
    Alert.error('Gagal', error.response?.data?.message || 'Gagal mengaktifkan tiket.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  try {
    await maintenanceStore.fetchDetail(route.params.id);
    // Pre-fill form with existing data for the current stage
    prefillFormFromExisting();
  } catch (error) {
    Alert.error('Error', error.response?.data?.message || 'Gagal memuat data detail.');
    router.push({ name: 'TranMaintenance' });
  }
});
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

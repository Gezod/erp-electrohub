<template>
  <AdminLayout>
    <div v-if="detail" class="mx-auto max-w-(--breakpoint-2xl) space-y-6">
      <!-- A. Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button @click="router.push({ name: 'MarketingRequestList' })" class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <MoveLeft class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white font-mono">
              {{ detail.code }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <div
                :class="[
                  'rounded-[999px] border border-solid px-[8px] py-[2px] text-[10px] font-bold inline-flex items-center justify-center gap-1 uppercase select-none whitespace-nowrap',
                  statusBadgeClass(detail.status)
                ]"
              >
                {{ getStatusLabel(detail.status) }}
              </div>
              <div
                :class="[
                  'rounded-[999px] border border-solid px-[8px] py-[2px] text-[10px] font-bold inline-flex items-center justify-center gap-1 uppercase select-none whitespace-nowrap',
                  requestTypeBadgeClass(detail.requestType)
                ]"
              >
                {{ requestTypeLabel(detail.requestType) }}
              </div>
              <Badge v-if="detail.escalated" color="warning" class="uppercase text-[10px] font-black">
                <ArrowUpRight class="w-3 h-3 mr-0.5 inline" />Dieskalasi
              </Badge>
              <span class="text-gray-600 dark:text-gray-400 text-xs font-bold">Dibuat pada {{ formatDate(detail.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="canEditRequest"
            v-can="'marketing-requests:update'"
            @click="showEditModal = true"
            class="px-5 py-2.5 text-sm font-bold text-gray-800 border border-gray-200 bg-gray-50 rounded-xl hover:bg-gray-100 transition dark:bg-gray-900/10 dark:border-gray-800 dark:text-gray-200 cursor-pointer"
          >
            Edit Pengajuan
          </button>
          <button
            v-if="detail.status === 'draft' || detail.status === 'diajukan'"
            v-can="'marketing-requests:delete'"
            @click="handleDelete"
            :disabled="busy"
            class="px-5 py-2.5 text-sm font-bold text-red-600 border border-red-100 bg-red-50 rounded-xl hover:bg-red-100 transition dark:bg-red-500/10 dark:border-red-500/20 cursor-pointer disabled:opacity-50"
          >
            Hapus Pengajuan
          </button>
        </div>
      </div>

      <!-- B. Workflow Stepper -->
      <div class="bg-white p-4 md:p-8 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div class="flex flex-wrap md:flex-nowrap items-center justify-between relative max-w-4xl mx-auto gap-4 md:gap-0">
          <!-- Connector line -->
          <div class="hidden md:block absolute top-5 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-0"></div>

          <div v-for="(step, index) in steps" :key="step.key" class="relative z-10 flex flex-col items-center gap-2 md:gap-3 bg-white dark:bg-gray-900 px-2 md:px-4">
            <div
              class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 md:border-4 transition-all duration-500"
              :class="[
                index < currentStageIndex ? 'bg-emerald-500 border-emerald-100 text-white' :
                index === currentStageIndex ? 'bg-black border-gray-800 text-white shadow-md dark:bg-white dark:text-black dark:border-white' :
                'bg-white border-gray-50 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
              ]"
            >
              <Check v-if="index < currentStageIndex" class="w-4 h-4 md:w-5 md:h-5" />
              <span v-else class="text-xs md:text-sm font-bold">{{ index + 1 }}</span>
            </div>
            <span
              class="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center"
              :class="index <= currentStageIndex ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'"
            >
              {{ step.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- C. Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- LEFT: Detail Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Request Info -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 dark:bg-gray-900 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-gray-800 dark:text-white">Detail Pengajuan</h3>
              <div v-if="detail.processorName && detail.checkedAt" class="text-xs text-gray-400 font-medium italic">
                Diproses oleh {{ detail.processorName }} pada {{ formatDate(detail.checkedAt) }}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nama Pemohon</label>
                <div class="font-bold text-gray-700 dark:text-gray-300">{{ detail.requesterName }}</div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lokasi</label>
                <div class="font-bold text-gray-700 dark:text-gray-300">{{ detail.requesterLocationName }}</div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tujuan</label>
                <div class="text-sm text-gray-700 dark:text-gray-300 italic">{{ detail.purpose || '-' }}</div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tipe Pemohon</label>
                <div class="font-bold text-gray-700 dark:text-gray-300 capitalize">{{ detail.requesterType }}</div>
              </div>
            </div>
          </div>

          <!-- Processor & Eskalasi -->
          <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"><Route class="w-3.5 h-3.5" /> Processor &amp; Eskalasi</div>
              <button
                v-if="detail.requestType === 'barang' && canAssignProcessor && !editingProcessor"
                v-can="'marketing-requests:assign_processor'"
                @click="openEditProcessor"
                class="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <Pencil class="w-3.5 h-3.5" /> Ganti Processor
              </button>
            </div>

            <template v-if="detail.requestType === 'barang'">
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                  <div class="text-[10px] font-bold text-gray-400 uppercase mb-1">Level Saat Ini</div>
                  <Badge :color="detail.processorLevel === 'pusat' ? 'primary' : 'info'" class="uppercase text-[10px] font-black">{{ detail.processorLevel || 'Belum diproses' }}</Badge>
                </div>
                <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                  <div class="text-[10px] font-bold text-gray-400 uppercase mb-1">Processor</div>
                  <div class="text-xs font-bold text-gray-800 dark:text-white">{{ detail.processorName }}</div>
                </div>
              </div>

              <!-- Edit Processor Form (Admin Pusat only) -->
              <div v-if="editingProcessor" class="space-y-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                <template v-if="detail.processorLevel === 'pusat'">
                  <p class="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    Mengganti processor akan menghitung ulang status &amp; sumber stok (stock_id) setiap item pengajuan ini sesuai orang &amp; office yang dipilih.
                  </p>
                  <select v-model="processorForm.processorEmployeeId" class="input-base text-xs" :disabled="loadingEmployeeOptions">
                    <option :value="''" disabled>Pilih anggota Roster Admin Pusat...</option>
                    <option v-for="e in employeeOptions" :key="e.id" :value="e.id">{{ e.fullName }}</option>
                  </select>
                  <p v-if="!loadingEmployeeOptions && employeeOptions.length === 0" class="text-[11px] text-amber-700 dark:text-amber-400 italic">
                    Belum ada anggota Roster Admin Pusat terdaftar. Tambahkan lewat Master Marketing &gt; Roster Admin Pusat.
                  </p>
                  <select
                    v-if="processorForm.processorEmployeeId"
                    v-model="processorForm.locationId"
                    class="input-base text-xs"
                    :disabled="loadingProcessorLocations || processorLocationOptions.length === 0"
                  >
                    <option :value="''">{{ processorLocationOptions.length === 0 ? 'Tidak ada office terdaftar untuk orang ini' : 'Pilih Office (Roster Admin Pusat)...' }}</option>
                    <option v-for="loc in processorLocationOptions" :key="loc.id" :value="loc.id">{{ loc.location_name }}{{ loc.has_stock === false ? ' (tanpa stok)' : '' }}</option>
                  </select>
                  <p v-if="processorForm.processorEmployeeId && !processorForm.locationId" class="text-[11px] text-amber-700 dark:text-amber-400 italic">
                    Office wajib dipilih sebelum processor bisa disimpan.
                  </p>
                </template>
                <template v-else>
                  <p class="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    Processor level Provinsi ditentukan otomatis lewat Store Assignment dan tidak bisa diganti di sini — hanya lokasi sumber stok yang bisa diubah. Untuk memindahkan pengajuan ini ke Admin Pusat, gunakan tombol "Eskalasi ke Pusat".
                  </p>
                  <select
                    v-model="processorForm.locationId"
                    class="input-base text-xs"
                    :disabled="loadingProcessorLocations || processorLocationOptions.length === 0"
                  >
                    <option :value="''">{{ processorLocationOptions.length === 0 ? 'Tidak ada lokasi ber-stok tersedia' : 'Pilih Lokasi Sumber Stok...' }}</option>
                    <option v-for="loc in processorLocationOptions" :key="loc.id" :value="loc.id">{{ loc.location_name }}</option>
                  </select>
                </template>
                <div class="flex items-center gap-2">
                  <button @click="handleSaveProcessor" :disabled="busy || !canSaveProcessor" class="btn-primary flex-1 text-xs py-2.5 disabled:opacity-50">Simpan</button>
                  <button @click="editingProcessor = false" class="px-4 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer">Batal</button>
                </div>
              </div>

              <p class="text-xs text-gray-500">
                Pemohon Toko diproses otomatis oleh Marketing Provinsi/PIC Gudang yang di-assign ke toko tersebut (Store Assignment). Jika tidak ada assignment aktif, atau pemohon adalah Provinsi, processor otomatis jatuh ke pool Admin Pusat.
              </p>
            </template>
            <p v-else class="text-xs text-gray-500">
              Pengajuan Jasa selalu diproses Admin Pusat — tidak melalui Provinsi, tidak ada Store Assignment, dan tidak ada eskalasi.
            </p>
          </div>

          <!-- Items Table -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div class="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3">
              <h3 class="font-bold text-gray-800 dark:text-white">{{ detail.requestType === 'jasa' ? 'Rincian Jasa' : 'Daftar Barang' }}</h3>
              <Badge color="info" variant="light">{{ detail.items.length }} Item</Badge>
            </div>
            <div class="overflow-x-auto">
              <table v-if="detail.requestType === 'barang'" class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Barang</th>
                    <th class="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Diminta</th>
                    <th class="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Stok Terkini</th>
                    <th class="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Dipenuhi</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="item in detail.items" :key="item.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td class="px-6 py-4">
                      <div class="font-bold text-gray-800 dark:text-white">{{ item.goodName }}</div>
                      <div class="text-[10px] font-mono text-gray-500 dark:text-gray-400 font-bold uppercase">{{ item.uomName || '-' }} &bull; {{ item.tipeBarang || '-' }}</div>
                    </td>
                    <td class="px-6 py-4 text-center font-black text-gray-700 dark:text-gray-300">
                      {{ item.qtyRequest }}
                    </td>
                    <td class="px-6 py-4 text-center">
                      <div class="flex flex-col items-center gap-1">
                        <Badge :color="getStockStatusColor(item.stockStatus)" variant="light" class="font-black text-[11px] px-3">
                          {{ item.qtyCurrent ?? '-' }}
                        </Badge>
                        <span class="text-[8px] font-black uppercase text-gray-400 tracking-tighter">{{ item.stockStatus || 'Belum dicek' }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="font-black" :class="item.qtyFulfilled >= item.qtyRequest ? 'text-emerald-600' : 'text-gray-400'">
                        {{ item.qtyFulfilled || 0 }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-[10px] text-gray-400 italic">{{ item.notes || '-' }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table v-else class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Deskripsi</th>
                    <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nominal (Rp)</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="item in detail.items" :key="item.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td class="px-6 py-4 font-bold text-gray-800 dark:text-white">{{ item.description || item.goodName }}</td>
                    <td class="px-6 py-4 text-right font-black text-gray-700 dark:text-gray-300">{{ formatNumber(item.nominal) }}</td>
                    <td class="px-6 py-4">
                      <div class="text-[10px] text-gray-400 italic">{{ item.notes || '-' }}</div>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                    <td class="px-6 py-4 font-black text-gray-800 dark:text-white uppercase text-xs tracking-wider">Total</td>
                    <td class="px-6 py-4 text-right font-black text-gray-800 dark:text-white">{{ formatNumber(totalNominalJasa) }}</td>
                    <td class="px-6 py-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Linked Transactions -->
          <div v-if="detail.purchases?.length || detail.transfers?.length" class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <div class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Transaksi Terkait</div>
            <router-link v-for="p in detail.purchases" :key="p.id" :to="{ name: 'MarketingPurchaseDetail', params: { id: p.id } }" class="block text-xs font-bold text-brand-600 hover:underline">
              Purchase {{ p.purchase_code }} ({{ p.status }})
            </router-link>
            <router-link v-for="t in detail.transfers" :key="t.id" :to="{ name: 'MarketingTransferDetail', params: { id: t.id } }" class="block text-xs font-bold text-brand-600 hover:underline">
              Transfer {{ t.transfer_code }} ({{ t.status }})
            </router-link>
          </div>

          <!-- DOKUMEN PENDUKUNG (Tampilan Tabbed UI & List View) -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
            <!-- Header Dokumen -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <div class="flex items-center gap-3">
                <FileText class="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h3 class="font-bold text-gray-800 dark:text-white uppercase tracking-wider text-sm">Dokumen Pendukung</h3>
                <span class="bg-white dark:bg-gray-800 text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                  {{ evidenceBeforeList.length + evidenceAfterList.length }} file
                </span>
              </div>
            </div>

            <div class="p-5 md:p-6">
              <!-- Tabs Navigation -->
              <div class="flex p-1 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-800 mb-6">
                <button
                  @click="activeDocumentTab = 'before'"
                  class="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex justify-center items-center gap-2"
                  :class="activeDocumentTab === 'before' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
                >
                  Bukti Sebelum
                  <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md text-[10px] font-black">{{ evidenceBeforeList.length }}</span>
                </button>
                <button
                  @click="activeDocumentTab = 'after'"
                  class="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex justify-center items-center gap-2"
                  :class="activeDocumentTab === 'after' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
                >
                  Bukti Sesudah
                  <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md text-[10px] font-black">{{ evidenceAfterList.length }}</span>
                </button>
              </div>

              <!-- List View Dokumen -->
              <div class="space-y-3">
                <!-- Tab: Bukti Sebelum -->
                <template v-if="activeDocumentTab === 'before'">
                  <div v-if="evidenceBeforeList.length === 0" class="text-sm text-center text-gray-400 italic py-10 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    Tidak ada bukti sebelum (saat pengajuan).
                  </div>
                  <div
                    v-for="(doc, idx) in evidenceBeforeList"
                    :key="doc.id"
                    class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors gap-4"
                  >
                    <div class="flex items-center gap-4 min-w-0">
                      <!-- Icon / Thumbnail -->
                      <div class="w-10 h-10 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                        <img v-if="isImageFile(doc)" :src="resolveFileUrl(doc.fileUrl)" class="w-full h-full object-cover" />
                        <FileText v-else class="w-5 h-5 text-gray-400" />
                      </div>

                      <!-- Info -->
                      <div class="flex flex-col min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{{ doc.fileName || getFileName(doc.fileUrl) }}</span>
                          <span v-if="idx === 0" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[9px] font-black uppercase rounded tracking-wider border border-gray-200 dark:border-gray-700 shrink-0">Utama</span>
                        </div>
                        <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate flex items-center gap-1.5">
                          <span>{{ formatFileSize(doc.size) }}</span>
                          <span>•</span>
                          <span>{{ doc.uploaderName || 'Sistem' }}</span>
                          <span>•</span>
                          <span>{{ formatDate(doc.createdAt) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Aksi -->
                    <div class="flex items-center gap-2 shrink-0">
                      <a
                        :href="doc.fileUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 flex items-center"
                      >
                        Lihat
                      </a>
                    </div>
                  </div>
                </template>

                <!-- Tab: Bukti Sesudah -->
                <template v-if="activeDocumentTab === 'after'">
                  <div v-if="evidenceAfterList.length === 0" class="text-sm text-center text-gray-400 italic py-10 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    Tidak ada bukti sesudah (penyelesaian).
                  </div>
                  <div
                    v-for="(doc, idx) in evidenceAfterList"
                    :key="doc.id"
                    class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors gap-4"
                  >
                    <div class="flex items-center gap-4 min-w-0">
                      <!-- Icon / Thumbnail -->
                      <div class="w-10 h-10 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                        <img v-if="isImageFile(doc)" :src="resolveFileUrl(doc.fileUrl)" class="w-full h-full object-cover" />
                        <FileText v-else class="w-5 h-5 text-gray-400" />
                      </div>

                      <!-- Info -->
                      <div class="flex flex-col min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{{ doc.fileName || getFileName(doc.fileUrl) }}</span>
                          <span v-if="idx === 0" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[9px] font-black uppercase rounded tracking-wider border border-gray-200 dark:border-gray-700 shrink-0">Utama</span>
                        </div>
                        <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate flex items-center gap-1.5">
                          <span>{{ formatFileSize(doc.size) }}</span>
                          <span>•</span>
                          <span>{{ doc.uploaderName || 'Sistem' }}</span>
                          <span>•</span>
                          <span>{{ formatDate(doc.createdAt) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Aksi -->
                    <div class="flex items-center gap-1 shrink-0">
                      <a
                        :href="doc.fileUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 flex items-center"
                      >
                        Lihat
                      </a>
                      <!-- Tombol Hapus Server (Hanya muncul jika status menunggu_pemenuhan) -->
                      <button
                        v-if="detail.status === 'menunggu_pemenuhan'"
                        @click="handleRemoveEvidenceAfter(doc.id)"
                        :disabled="uploadingEvidence || busy"
                        title="Hapus bukti ini"
                        class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Audit History -->
          <AuditHistory module="MKT_REQUEST_HEADER" :recordId="detail.id" />
        </div>

        <!-- RIGHT: Action Center -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div class="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between dark:bg-gray-800/50 dark:border-gray-800">
              <div class="flex items-center gap-3 uppercase text-sm font-bold tracking-wider text-gray-900 dark:text-white">
                <Settings class="w-4 h-4" />
                Action Center
              </div>
            </div>

            <div class="p-6 space-y-6">
              <!-- STAGE draft -> diajukan -->
              <div v-if="detail.status === 'draft'" class="space-y-4">
                <div class="p-4 bg-gray-50/50 rounded-xl border border-gray-150 dark:bg-gray-900/20 dark:border-gray-800">
                  <p class="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                    Ajukan pengajuan ini agar dapat diproses oleh Marketing Provinsi/Pusat.
                  </p>
                </div>
                <button v-can="'marketing-requests:update'" @click="doStatus('diajukan')" :disabled="busy" class="btn-primary w-full py-3 bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/10">
                  <Play class="w-4 h-4 mr-2" /> Ajukan Sekarang
                </button>
              </div>

              <!-- STAGE diajukan -> diproses -->
              <div v-else-if="detail.status === 'diajukan'" class="space-y-4">
                <div class="p-4 bg-gray-50/50 rounded-xl border border-gray-150 dark:bg-gray-900/20 dark:border-gray-800">
                  <p class="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                    {{ detail.requestType === 'jasa'
                      ? 'Langsung masuk pool Admin Pusat, tanpa cek stok.'
                      : 'Proses pengajuan ini: processor akan di-resolve otomatis via Store Assignment, dan stok tiap item akan dicek.' }}
                  </p>
                </div>
                <button v-can="'marketing-requests:update'" @click="doStatus('diproses')" :disabled="busy" class="btn-primary w-full py-3 bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/10">
                  <Play class="w-4 h-4 mr-2" /> Proses Pengajuan
                </button>
              </div>

              <!-- STAGE diproses / menunggu_pemenuhan -->
              <template v-else-if="['diproses', 'menunggu_pemenuhan'].includes(detail.status)">
                <div v-if="detail.requestType === 'jasa'" class="space-y-3">
                  <button v-if="canActAsProcessor" v-can="'marketing-requests:update'" @click="showCreatePurchase = !showCreatePurchase" class="btn-outline w-full flex items-center justify-center gap-2">
                    <ShoppingCart class="w-4 h-4" /> Buat Purchase Pembayaran
                  </button>
                  <div v-if="showCreatePurchase" class="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                    <div class="space-y-1.5">
                      <div v-for="item in detail.items" :key="item.id" class="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                        <span>{{ item.description || item.goodName }}</span>
                        <span>Rp {{ formatNumber(item.nominal) }}</span>
                      </div>
                      <div class="flex items-center justify-between text-xs font-black text-gray-800 dark:text-white pt-1.5 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <span>Total</span>
                        <span>Rp {{ formatNumber(totalNominalJasa) }}</span>
                      </div>
                    </div>
                    <SearchableSelect v-model="purchaseForm.pic_marketing" master="employees" placeholder="Pilih PIC Marketing..." :clearable="true" />
                    <button @click="doCreatePurchase" :disabled="busy" class="btn-primary w-full text-xs">Buat Purchase</button>
                  </div>
                  <div class="p-3 bg-gray-50/50 rounded-xl border border-gray-150 dark:bg-gray-900/20 dark:border-gray-800 text-[11px] text-gray-500 italic">
                    Selesai otomatis saat Purchase Pembayaran ditandai selesai.
                  </div>
                </div>
                <div v-else class="space-y-3">
                  <button v-if="detail.processorLevel === 'provinsi' && canActAsProcessor" v-can="'marketing-requests:update'" @click="doEscalate" :disabled="busy" class="btn-outline w-full flex items-center justify-center gap-2">
                    <ArrowUpRight class="w-4 h-4" /> Eskalasi ke Pusat
                  </button>
                  <button v-if="canActAsProcessor" v-can="'marketing-requests:update'" @click="showCreatePurchase = !showCreatePurchase" class="btn-outline w-full flex items-center justify-center gap-2">
                    <ShoppingCart class="w-4 h-4" /> Buat Purchase dari Kekurangan
                  </button>
                  <div v-if="showCreatePurchase" class="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                    <SearchableSelect v-model="purchaseForm.location_id" master="locations" placeholder="Pilih Lokasi Pembelian..." :clearable="true" />
                    <SearchableSelect v-model="purchaseForm.pic_marketing" master="employees" placeholder="Pilih PIC Marketing..." :clearable="true" />
                    <button @click="doCreatePurchase" :disabled="busy" class="btn-primary w-full text-xs">Buat Purchase</button>
                  </div>

                  <!-- Upload Bukti Sesudah + Tandai Selesai (Kolom Kanan) -->
                  <template v-if="detail.status === 'menunggu_pemenuhan'">
                    <div class="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status Bukti Sesudah</span>
                        <Badge v-if="hasEvidenceAfter" color="success" variant="light" class="text-[10px] font-black">Terupload</Badge>
                        <Badge v-else color="warning" variant="light" class="text-[10px] font-black">Wajib Diisi</Badge>
                      </div>

                      <input
                        ref="galleryInputRefAfter"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/jpg,image/webp,video/mp4"
                        @change="handleFileChangeAfter"
                        class="hidden"
                        :disabled="uploadingEvidence"
                      />

                      <div class="flex flex-wrap gap-2">
                        <button
                          type="button"
                          @click="triggerGalleryUploadAfter"
                          :disabled="uploadingEvidence"
                          class="flex items-center gap-1.5 px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 dark:text-brand-400 font-semibold text-[12px] rounded-lg transition-colors disabled:opacity-50 flex-1 justify-center"
                        >
                          <Image class="w-3.5 h-3.5" />
                          <span>Pilih File</span>
                        </button>
                        <button
                          type="button"
                          @click="startCameraAfter"
                          :disabled="uploadingEvidence"
                          class="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-300 font-semibold text-[12px] rounded-lg transition-colors disabled:opacity-50 flex-1 justify-center"
                        >
                          <Camera class="w-3.5 h-3.5" />
                          <span>Kamera</span>
                        </button>
                      </div>

                      <p class="text-[10px] text-gray-400 text-center">* Maks. 5MB foto, 20MB video (MP4). Maksimal 10 file.</p>

                      <!-- Preview Local (File yang siap diunggah) -->
                      <ul v-if="selectedFilesAfter.length" class="space-y-1.5">
                        <li
                          v-for="(file, idx) in selectedFilesAfter"
                          :key="idx"
                          class="text-[11px] font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 rounded-lg"
                        >
                          <div class="flex items-center gap-1.5 truncate">
                            <FileText class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span class="truncate">{{ file.name }}</span>
                            <span class="text-gray-400 shrink-0">({{ formatFileSize(file.size) }})</span>
                          </div>
                          <button type="button" @click="removeFileAfter(idx)" :disabled="uploadingEvidence" class="text-red-500 hover:text-red-700 p-1 bg-red-50 dark:bg-red-500/10 rounded cursor-pointer shrink-0">
                            <Trash2 class="w-3 h-3" />
                          </button>
                        </li>
                      </ul>

                      <button
                        v-if="selectedFilesAfter.length"
                        type="button"
                        @click="handleUploadEvidenceAfter"
                        :disabled="uploadingEvidence"
                        class="btn-primary w-full text-xs py-2.5 mt-2"
                      >
                        {{ uploadingEvidence ? 'Mengunggah...' : 'Unggah Bukti Sekarang' }}
                      </button>
                    </div>

                    <button
                    v-if="canActAsProcessor"
                      v-can="'marketing-requests:update'"
                      @click="handleMarkSelesai"
                      :disabled="busy || hasUnresolvedEmptyStock || !hasEvidenceAfter"
                      :title="hasUnresolvedEmptyStock ? 'Masih ada item dengan stok kosong yang belum dipenuhi' : (!hasEvidenceAfter ? 'Upload bukti sesudah wajib diisi terlebih dahulu' : '')"
                      class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      <CheckCircle class="w-4 h-4" /> Tandai Selesai
                    </button>
                    <p v-if="hasUnresolvedEmptyStock" class="text-[11px] text-red-500 font-semibold text-center -mt-1">
                      Masih ada item stok kosong yang belum dipenuhi — buat Purchase atau Transfer dulu.
                    </p>
                    <p v-else-if="!hasEvidenceAfter" class="text-[11px] text-red-500 font-semibold text-center -mt-1">
                      Upload bukti sesudah (foto/video) wajib diisi sebelum bisa menandai selesai.
                    </p>
                  </template>
                </div>
              </template>

              <!-- CANCEL / REJECT (if not finished) -->
              <div v-if="['draft', 'diajukan', 'diproses', 'menunggu_pemenuhan'].includes(detail.status)" class="pt-6 border-t border-gray-50 dark:border-gray-800 flex gap-2">
                <button v-if="['diproses', 'menunggu_pemenuhan'].includes(detail.status) && canActAsProcessor" v-can="'marketing-requests:update'" @click="doStatus('ditolak', 'Tolak pengajuan ini?', 'Tolak pengajuan ini? Tindakan tidak dapat dibatalkan.')" :disabled="busy" class="flex-1 py-2 text-xs font-bold text-red-500 border border-red-50 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition">
                  Tolak
                </button>
                <button v-if="['draft', 'diajukan'].includes(detail.status) || canActAsProcessor" v-can="'marketing-requests:update'" @click="doStatus('batal', 'Batalkan pengajuan ini?', 'Batalkan pengajuan ini? Tindakan tidak dapat dibatalkan.')" :disabled="busy" class="flex-1 py-2 text-xs font-bold text-red-500 border border-red-50 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition">
                  Batalkan
                </button>
              </div>

              <!-- TERMINAL STATUS -->
              <div v-if="['selesai', 'ditolak', 'batal'].includes(detail.status)" class="text-center py-4 space-y-3">
                <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <Check v-if="detail.status === 'selesai'" class="w-8 h-8 text-emerald-500" />
                  <X v-else class="w-8 h-8 text-red-400" />
                </div>
                <h4 class="font-black uppercase tracking-widest text-gray-800 dark:text-white">{{ getStatusLabel(detail.status) }}</h4>
                <p class="text-xs text-gray-500 italic">
                  {{ detail.status === 'selesai' ? 'Pengajuan selesai — seluruh item terpenuhi.' : detail.status === 'ditolak' ? 'Pengajuan ini ditolak.' : 'Pengajuan ini dibatalkan.' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!detail && marketingRequestStore.isLoading" class="flex flex-col items-center justify-center min-h-[500px] space-y-4">
      <div class="animate-spin h-10 w-10 border-4 border-black dark:border-white border-t-transparent rounded-full font-bold"></div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Memuat Detail Pengajuan...</p>
    </div>

    <!-- Edit Form Modal -->
    <MarketingRequestFormModal
      v-model="showEditModal"
      :request-id="detail?.id"
      @saved="refreshDetail"
    />

    <!-- Camera Modal Overlay (Bukti Sesudah) -->
    <Teleport to="body">
      <div v-if="isCameraOpenAfter" class="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center">
        <div class="relative w-full h-full max-w-2xl mx-auto bg-black flex flex-col justify-center">
          <video
            ref="videoRefAfter"
            class="w-full h-auto max-h-[80vh] object-cover bg-black"
            autoplay
            playsinline
          ></video>

          <canvas ref="canvasRefAfter" class="hidden"></canvas>

          <div class="absolute top-6 right-6">
            <button type="button" @click="stopCameraAfter" class="p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="absolute bottom-10 left-0 right-0 flex justify-center pb-safe">
            <button
              type="button"
              @click="takePhotoAfter"
              class="w-16 h-16 bg-white rounded-full border-4 border-gray-400 hover:scale-105 active:scale-95 hover:bg-gray-200 shadow-xl flex items-center justify-center transition-all"
            >
              <div class="w-12 h-12 rounded-full border border-gray-300"></div>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Badge from '@/components/ui/Badge.vue';
import AuditHistory from '@/components/common/AuditHistory.vue';
import MarketingRequestFormModal from './components/MarketingRequestFormModal.vue';
import { useMarketingRequestStore } from './marketingRequest.store';
import { MarketingRequestService } from './marketingRequest.service';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import { Alert } from '@/plugins/sweetalert';
import {
  MoveLeft, Check, Play, CheckCircle, X, Settings, ShoppingCart, Route, ArrowUpRight, Pencil,
  Image, Camera, Trash2, FileText
} from 'lucide-vue-next';
import { resolveFileUrl } from '@/utils/file.js';

const route = useRoute();
const router = useRouter();
const marketingRequestStore = useMarketingRequestStore();
const authStore = useAuthStore();
const isImageFile = (doc) => /\.(jpeg|jpg|gif|png|webp)$/i.test(doc?.fileUrl || '');
const busy = ref(false);
const showEditModal = ref(false);
const showCreatePurchase = ref(false);
const purchaseForm = ref({ location_id: '', pic_marketing: '' });

// State UI untuk Dokumen Pendukung Tabs
const activeDocumentTab = ref('before'); // 'before' atau 'after'

const refreshDetail = async () => {
  await marketingRequestStore.fetchDetail(route.params.id);
};

const editingProcessor = ref(false);
const processorForm = reactive({ processorEmployeeId: '', locationId: '' });
const processorLocationOptions = ref([]);
const loadingProcessorLocations = ref(false);
const employeeOptions = ref([]);
const loadingEmployeeOptions = ref(false);

// Pusat: wajib pilih orang (Roster) DAN office-nya. Provinsi: processor fixed, cuma lokasi yang wajib.
const canSaveProcessor = computed(() => {
  if (detail.value?.processorLevel === 'pusat') return !!processorForm.processorEmployeeId && !!processorForm.locationId;
  return !!processorForm.locationId;
});

const detail = computed(() => marketingRequestStore.requestDetail);

// Item yang belum terpenuhi (qtyFulfilled < qtyRequest) tapi stok terkini kosong — "Tandai Selesai"
// diblokir di sini supaya tidak menutup pengajuan yang intinya belum pernah benar-benar dipenuhi.
const hasUnresolvedEmptyStock = computed(() => {
  return (detail.value?.items || []).some((item) => Number(item.qtyFulfilled || 0) < Number(item.qtyRequest || 0) && item.stockStatus === 'kosong');
});

// List Bukti Sebelum dan Sesudah
const evidenceBeforeList = computed(() => (detail.value?.evidences || []).filter((e) => e.kind === 'evidence_before'));
const evidenceAfterList = computed(() => (detail.value?.evidences || []).filter((e) => e.kind === 'evidence_after'));
const hasEvidenceAfter = computed(() => evidenceAfterList.value.length > 0);

const isAdminPusat = computed(() => {
  return authStore.user?.isAdmin === true
    || authStore.user?.is_superadmin === true
    || authStore.hasPrivilege('marketing-requests:read:all');
});

const canAssignProcessor = computed(() => {
  return authStore.hasPrivilege('marketing-requests:assign_processor')
    && detail.value && ['diproses', 'menunggu_pemenuhan'].includes(detail.value.status);
});

// Cermin backend assertIsAssignedProcessor: aksi pasca-processor (Eskalasi, Buat Purchase dari
// Kekurangan, Tandai Selesai, Tolak, Batalkan-saat-diproses) harus persis processor yang
// ditugaskan, terlepas processor_level provinsi/pusat. Jasa dikecualikan (tidak punya processor
// individual) — tetap isAdminPusat.
const canActAsProcessor = computed(() => {
  if (authStore.user?.is_superadmin === true) return true;
  if (detail.value?.requestType === 'jasa') return isAdminPusat.value;
  return !!authStore.user?.employeeId && authStore.user.employeeId === detail.value?.processorEmployeeId;
});

const stepsBarang = [
  { key: 'diajukan', label: 'Pengajuan' },
  { key: 'diproses', label: 'Diproses' },
  { key: 'menunggu_pemenuhan', label: 'Menunggu Pemenuhan' },
  { key: 'selesai', label: 'Selesai' },
];

const stepsJasa = [
  { key: 'diajukan', label: 'Pengajuan' },
  { key: 'diproses', label: 'Diproses' },
  { key: 'selesai', label: 'Selesai' },
];

const steps = computed(() => (detail.value?.requestType === 'jasa' ? stepsJasa : stepsBarang));

const currentStageIndex = computed(() => {
  if (!detail.value) return 0;
  const s = detail.value.status;
  if (s === 'batal' || s === 'ditolak') return -1;
  const idx = steps.value.findIndex((step) => step.key === s);
  return idx >= 0 ? idx : 0;
});

const requestTypeLabel = (t) => ({ barang: 'Barang', jasa: 'Jasa' }[t] || t);
const requestTypeBadgeClass = (t) => ({
  barang: 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  jasa: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400',
}[t] || 'bg-gray-100 text-gray-700');

const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n || 0);

// Helper List Dokumen
const getFileName = (url) => {
  if (!url) return 'Dokumen Tanpa Nama';
  return url.substring(url.lastIndexOf('/') + 1) || 'Dokumen';
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return 'File';
  const k = 1024;
  const dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const totalNominalJasa = computed(() => (detail.value?.items || []).reduce((sum, it) => sum + (Number(it.nominal) || 0), 0));

const canEditRequest = computed(() => {
  if (!detail.value) return false;
  if (!['draft', 'diajukan'].includes(detail.value.status)) return false;
  if (detail.value.requestType === 'jasa' && (detail.value.purchases?.length || 0) > 0) return false;
  return true;
});

const getStatusLabel = (s) => ({
  draft: 'Draft',
  diajukan: 'Diajukan',
  diproses: 'Diproses',
  menunggu_pemenuhan: 'Menunggu Pemenuhan',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
  batal: 'Batal',
}[s] || s);

const statusBadgeClass = (s) => ({
  draft: 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  diajukan: 'bg-[#fffbeb] border-[#fef3c7] text-[#b45309]',
  diproses: 'bg-[#ebf8ff] border-[#ddf3ff] text-[#0069a6]',
  menunggu_pemenuhan: 'bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]',
  selesai: 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]',
  ditolak: 'bg-[#fef2f2] border-[#fee2e2] text-[#b91c1c]',
  batal: 'bg-[#fef2f2] border-[#fee2e2] text-[#b91c1c]',
}[s] || 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569]');

const getStockStatusColor = (s) => ({ cukup: 'success', kurang: 'warning', kosong: 'error' }[s] || 'neutral');

const formatDate = (d) => {
  if (!d) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
  } catch (e) { return d; }
};

const doStatus = async (status, confirmTitle = 'Konfirmasi', confirmText = null) => {
  const confirmed = await Alert.confirm(confirmTitle, confirmText || `Pindahkan status ke ${status.replace('_', ' ')}?`);
  if (!confirmed) return;
  busy.value = true;
  try {
    await marketingRequestStore.updateStatus(route.params.id, { status });
    Alert.success('Berhasil', `Status diubah ke ${getStatusLabel(status)}.`);
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

const handleMarkSelesai = async () => {
  const confirmed = await Alert.confirm(
    'Tandai Selesai?',
    'Stok akan dipotong secara permanen sesuai sisa qty yang belum terpenuhi pada tiap item. Tindakan ini tidak dapat dibatalkan.'
  );
  if (!confirmed) return;
  busy.value = true;
  try {
    await marketingRequestStore.updateStatus(route.params.id, { status: 'selesai' });
    Alert.success('Berhasil', 'Pengajuan ditandai selesai dan stok telah dipotong.');
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

const doEscalate = async () => {
  const confirmed = await Alert.confirm('Eskalasi ke Pusat?', 'Pengajuan akan diteruskan ke Admin Pusat pada thread yang sama.');
  if (!confirmed) return;
  busy.value = true;
  try {
    await marketingRequestStore.escalate(route.params.id);
    Alert.success('Berhasil', 'Pengajuan dieskalasi ke Pusat (thread sama).');
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

const doCreatePurchase = async () => {
  const isJasa = detail.value?.requestType === 'jasa';
  if (!purchaseForm.value.pic_marketing) {
    Alert.error('Validasi Gagal', 'PIC wajib diisi.');
    return;
  }
  if (!isJasa && !purchaseForm.value.location_id) {
    Alert.error('Validasi Gagal', 'Lokasi & PIC wajib diisi.');
    return;
  }
  busy.value = true;
  try {
    const payload = isJasa
      ? { pic_marketing: purchaseForm.value.pic_marketing }
      : purchaseForm.value;
    await marketingRequestStore.createPurchase(route.params.id, payload);
    Alert.success('Berhasil', isJasa ? 'Purchase Pembayaran dibuat.' : 'Purchase dibuat dari kekurangan stok.');
    showCreatePurchase.value = false;
    await marketingRequestStore.fetchDetail(route.params.id);
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

const loadProcessorLocations = async () => {
  loadingProcessorLocations.value = true;
  processorForm.locationId = '';
  try {
    const res = await MarketingRequestService.getProcessorLocations(route.params.id, processorForm.processorEmployeeId);
    processorLocationOptions.value = res || [];
  } catch (error) {
    processorLocationOptions.value = [];
    Alert.error('Gagal', error.response?.data?.message || 'Gagal memuat opsi lokasi.');
  } finally {
    loadingProcessorLocations.value = false;
  }
};

watch(() => processorForm.processorEmployeeId, () => {
  if (editingProcessor.value) loadProcessorLocations();
});

const loadEmployeeOptions = async () => {
  loadingEmployeeOptions.value = true;
  try {
    const res = await MarketingRequestService.getProcessorCandidates(route.params.id);
    employeeOptions.value = (res || []).map((e) => ({ id: e.id, fullName: e.full_name }));
  } catch (error) {
    employeeOptions.value = [];
    Alert.error('Gagal', error.response?.data?.message || 'Gagal memuat daftar kandidat processor.');
  } finally {
    loadingEmployeeOptions.value = false;
  }
};

const openEditProcessor = () => {
  const isPusat = detail.value?.processorLevel === 'pusat';
  processorForm.processorEmployeeId = isPusat ? (detail.value?.processorEmployeeId || '') : '';
  processorForm.locationId = '';
  editingProcessor.value = true;
  if (isPusat) {
    loadEmployeeOptions();
    // Menunggu processorEmployeeId dipilih dulu (lihat watcher) sebelum memuat opsi office-nya.
    if (processorForm.processorEmployeeId) loadProcessorLocations();
  } else {
    // Provinsi: processor fixed, langsung muat opsi lokasi atas nama processor yang sudah ada.
    loadProcessorLocations();
  }
};

const handleSaveProcessor = async () => {
  const isPusat = detail.value?.processorLevel === 'pusat';
  const confirmed = await Alert.confirm(
    isPusat ? 'Ganti Processor?' : 'Ganti Lokasi Sumber Stok?',
    'Status & sumber stok (stock_id) setiap item pengajuan ini akan dihitung ulang.'
  );
  if (!confirmed) return;
  busy.value = true;
  try {
    const payload = isPusat
      ? { processor_employee_id: processorForm.processorEmployeeId, location_id: processorForm.locationId }
      : { location_id: processorForm.locationId };
    await marketingRequestStore.updateProcessor(route.params.id, payload);
    editingProcessor.value = false;
    Alert.success('Berhasil', isPusat ? 'Processor pengajuan berhasil diganti.' : 'Lokasi sumber stok berhasil diganti.');
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

const handleDelete = async () => {
  const confirmed = await Alert.confirm('Hapus Pengajuan?', 'Data tidak dapat dikembalikan.');
  if (!confirmed) return;
  busy.value = true;
  try {
    await marketingRequestStore.deleteRequest(route.params.id);
    Alert.success('Berhasil', 'Pengajuan dihapus.');
    router.push({ name: 'MarketingRequestList' });
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Gagal menghapus pengajuan.');
  } finally {
    busy.value = false;
  }
};

// ── Upload Bukti Sesudah (evidence_after) ────────────────────────────────────
const selectedFilesAfter = ref([]);
const galleryInputRefAfter = ref(null);
const uploadingEvidence = ref(false);

const isCameraOpenAfter = ref(false);
const videoRefAfter = ref(null);
const canvasRefAfter = ref(null);
let cameraStreamAfter = null;

const triggerGalleryUploadAfter = () => {
  if (galleryInputRefAfter.value) galleryInputRefAfter.value.click();
};

const checkFileLimitAfter = (newCount) => {
  if (selectedFilesAfter.value.length + newCount > 10) {
    Alert.error('Batas File', 'Maksimal hanya boleh mengunggah 10 file bukti.');
    return false;
  }
  return true;
};

const handleFileChangeAfter = (e) => {
  const files = Array.from(e.target.files);
  let validFiles = [];

  for (let file of files) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type === 'video/mp4';
    const sizeMB = file.size / 1024 / 1024;

    if (isImage && sizeMB > 5) { Alert.error('Ditolak', `Foto ${file.name} melebihi batas 5MB.`); continue; }
    if (isVideo && sizeMB > 20) { Alert.error('Ditolak', `Video ${file.name} melebihi batas 20MB.`); continue; }
    if (!isImage && !isVideo) { Alert.error('Ditolak', `File ${file.name} tidak valid. Hanya menerima gambar atau MP4.`); continue; }
    validFiles.push(file);
  }

  if (checkFileLimitAfter(validFiles.length)) {
    selectedFilesAfter.value = [...selectedFilesAfter.value, ...validFiles];
  } else {
    const allowed = 10 - selectedFilesAfter.value.length;
    selectedFilesAfter.value = [...selectedFilesAfter.value, ...validFiles.slice(0, allowed)];
  }
  e.target.value = '';
};

const startCameraAfter = async () => {
  if (!checkFileLimitAfter(1)) return;

  isCameraOpenAfter.value = true;
  try {
    cameraStreamAfter = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });

    setTimeout(() => {
      if (videoRefAfter.value) {
        videoRefAfter.value.srcObject = cameraStreamAfter;
      }
    }, 100);
  } catch (err) {
    isCameraOpenAfter.value = false;
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      Alert.error('Izin Kamera Ditolak', 'Akses kamera diblokir. Harap izinkan akses kamera melalui ikon gembok di address bar browser Anda.');
    } else {
      Alert.error('Kamera Error', 'Tidak dapat mengakses perangkat kamera.');
    }
    console.error('Kamera error:', err);
  }
};

const stopCameraAfter = () => {
  if (cameraStreamAfter) {
    cameraStreamAfter.getTracks().forEach(track => track.stop());
    cameraStreamAfter = null;
  }
  isCameraOpenAfter.value = false;
};

const takePhotoAfter = () => {
  if (!videoRefAfter.value || !canvasRefAfter.value) return;
  const video = videoRefAfter.value;
  const canvas = canvasRefAfter.value;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (blob) {
      const file = new File([blob], `Kamera_${Date.now()}.jpg`, { type: 'image/jpeg' });
      selectedFilesAfter.value.push(file);
    }
    stopCameraAfter();
  }, 'image/jpeg', 0.85);
};

const removeFileAfter = (index) => selectedFilesAfter.value.splice(index, 1);

const handleUploadEvidenceAfter = async () => {
  if (!selectedFilesAfter.value.length) return;
  uploadingEvidence.value = true;
  try {
    const formData = new FormData();
    selectedFilesAfter.value.forEach((file) => formData.append('evidence_after', file));
    await MarketingRequestService.addEvidences(route.params.id, formData);
    selectedFilesAfter.value = [];
    Alert.toast('Bukti sesudah berhasil diunggah', 'success');
    await marketingRequestStore.fetchDetail(route.params.id);
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Gagal mengunggah bukti sesudah.');
  } finally {
    uploadingEvidence.value = false;
  }
};

const handleRemoveEvidenceAfter = async (evidenceId) => {
  const confirmed = await Alert.confirm('Hapus Bukti?', 'File bukti ini akan dihapus permanen.');
  if (!confirmed) return;
  uploadingEvidence.value = true;
  try {
    await MarketingRequestService.removeEvidence(route.params.id, evidenceId);
    Alert.toast('Bukti berhasil dihapus', 'success');
    await marketingRequestStore.fetchDetail(route.params.id);
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Gagal menghapus bukti.');
  } finally {
    uploadingEvidence.value = false;
  }
};

onUnmounted(() => stopCameraAfter());

onMounted(async () => {
  await marketingRequestStore.fetchDetail(route.params.id);
});
</script>

<style scoped lang="postcss">
@reference "../../../assets/main.css";
</style>

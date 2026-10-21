<template>
  <AdminLayout>
    <div v-if="detail" class="mx-auto max-w-(--breakpoint-2xl) space-y-6">
      <!-- A. Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <MoveLeft class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white font-mono">
              {{ detail.requestCode }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <Badge :color="getStatusColor(detail.status)" variant="light" class="uppercase text-[10px]">
                {{ detail.status.replace('_', ' ') }}
              </Badge>
              <Badge v-if="detail.tipe && detail.tipe !== 'biasa'" color="warning" variant="light" class="uppercase text-[10px]">
                {{ detail.tipe === 'parfum' ? 'Parfum' : 'Stok Opening' }}
              </Badge>
              <span class="text-gray-600 dark:text-gray-400 text-xs font-bold">Created on {{ formatDate(detail.dateRequest) }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button 
            v-if="detail.status === 'dalam_pengajuan' || detail.status === 'draft'"
            @click="showEditModal = true"
            class="px-4 py-2 text-sm font-medium text-text-active border border-border bg-white dark:bg-gray-900 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer shadow-xs"
          >
            Edit Permintaan
          </button>
          <button 
            v-if="detail.status === 'dalam_pengajuan' || detail.status === 'draft'"
            v-can="'requests:delete'"
            @click="handleDelete"
            class="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 bg-red-50 rounded-md hover:bg-red-100 transition dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 cursor-pointer shadow-xs"
          >
            Hapus Permintaan
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
              <div v-if="detail.checkerName" class="text-xs text-gray-400 font-medium italic">
                Checked by {{ detail.checkerName }} at {{ formatDate(detail.checkedAt) }}
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pemohon</label>
                <div class="font-bold text-gray-700 dark:text-gray-300">{{ detail.employeeName }}</div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Divisi Pemohon</label>
                <div class="font-bold text-gray-700 dark:text-gray-300">{{ detail.divisionName }}</div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lokasi</label>
                <div class="font-bold text-gray-700 dark:text-gray-300">{{ detail.locationName }}</div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tujuan</label>
                <div class="text-sm text-gray-700 dark:text-gray-300 italic">{{ detail.purpose || '-' }}</div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div class="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h3 class="font-bold text-gray-800 dark:text-white">Daftar Barang</h3>
                <Badge color="info" variant="light">{{ detail.items.length }} Item</Badge>
              </div>
              
              <!-- Refresh Stock Button -->
              <button 
                v-if="['dalam_pengajuan', 'proses_ga', 'disetujui'].includes(detail.status)"
                @click="handleRefreshStock" 
                :disabled="isSubmitting"
                class="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-gray-850 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all dark:bg-gray-900/20 dark:text-gray-300"
              >
                <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isSubmitting }" />
                PERBARUI STOK
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Barang</th>
                    <th class="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Diminta</th>
                    <th class="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Divisi Tujuan</th>
                    <th class="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Stok Terkini</th>
                    <th class="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Dipenuhi</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="item in detail.items" :key="item.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td class="px-6 py-4">
                      <div class="font-bold text-gray-800 dark:text-white">{{ item.isManual ? item.itemNameManual : item.goodName }}</div>
                      <div v-if="!item.isManual" class="text-[10px] font-mono text-gray-500 dark:text-gray-400 font-bold uppercase">{{ item.merk || '-' }} • {{ item.goodCode }} • {{ item.categoryName }}</div>
                      <div v-else class="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">Manual Item • {{ item.categoryName }}</div>
                      <a v-if="item.linkRef" :href="item.linkRef" target="_blank" class="text-[9px] text-gray-700 dark:text-gray-300 hover:underline flex items-center gap-1 mt-1 font-bold">
                        <ExternalLink class="w-2.5 h-2.5" /> Referensi Produk
                      </a>
                    </td>
                    <td class="px-6 py-4 text-center font-black text-gray-700 dark:text-gray-300">
                      {{ item.qtyRequest }}
                    </td>
                    <td class="px-6 py-4 text-center">
                      <div class="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                        {{ item.destinationDivisionName || '-' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <div class="flex flex-col items-center gap-1">
                        <Badge :color="getStockStatusColor(getItemStock(item.id)?.stock_status || item.stockStatus)" variant="light" class="font-black text-[11px] px-3">
                          {{ getItemStock(item.id)?.qty_current ?? item.qtyCurrent }}
                        </Badge>
                        <span class="text-[8px] font-black uppercase text-gray-400 tracking-tighter">{{ getItemStock(item.id)?.stock_status || item.stockStatus || 'Ready' }}</span>

                        <div v-if="!item.isManual && item.sourceLocationName" class="text-[8px] text-gray-400 font-bold uppercase">
                          Sumber: {{ item.sourceLocationName }}
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="font-black" :class="item.qtyFulfilled >= item.qtyRequest ? 'text-emerald-600' : 'text-gray-400'">
                        {{ item.qtyFulfilled || 0 }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2 flex-wrap">
                        <!-- Link to Master Action -->
                        <button
                          v-if="item.isManual && ['dalam_pengajuan', 'proses_ga', 'disetujui'].includes(detail.status)"
                          @click="openLinkMaster(item)"
                          class="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-all dark:bg-amber-900/20 dark:text-amber-400"
                          title="Hubungkan ke Barang Master"
                        >
                          <Link2 class="w-4 h-4" />
                        </button>
                        <div v-else class="text-[10px] text-gray-400 italic">{{ item.notes || '-' }}</div>

                        <!-- Add to Purchase Cart -->
                        <button
                          v-if="canAddToCart(item)"
                          @click="handleAddToCart(item)"
                          :disabled="addingToCartId === item.id"
                          class="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-all text-[10px] font-bold dark:bg-orange-900/20 dark:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Tambahkan ke Keranjang Pembelian"
                        >
                          <ShoppingCart class="w-3.5 h-3.5" />
                          + Keranjang
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Linked Purchases -->
          <div v-if="detail.purchases && detail.purchases.length" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 dark:bg-gray-900 dark:border-gray-800">
            <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ShoppingCart class="w-4 h-4 text-orange-500" />
              Pesanan Pembelian Terkait (PO)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="po in detail.purchases" :key="po.id" class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                <div>
                  <div class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Kode PO</div>
                  <div class="font-mono font-bold text-gray-800 dark:text-white">{{ po.purchase_code }}</div>
                </div>
                <Badge :color="po.status === 'draft' ? 'warning' : 'success'" variant="light" class="uppercase text-[10px]">
                  {{ po.status }}
                </Badge>
              </div>
            </div>
          </div>

          <!-- Audit History -->
          <AuditHistory module="REQUEST_HEADER" :recordId="detail.id" />
        </div>

        <!-- RIGHT: Action Panel (GA Only) -->
        <div v-if="isGaOrHrga" class="space-y-6">
          <!-- PANEL WORKFLOW -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div class="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between dark:bg-gray-800/50 dark:border-gray-800">
              <div class="flex items-center gap-3 uppercase text-sm font-bold tracking-wider text-gray-900 dark:text-white">
                <Settings class="w-4 h-4" />
                Action Center
              </div>
            </div>

            <div class="p-6 space-y-6">
              <!-- STAGE 0 -> PROSES GA -->
              <div v-if="detail.status === 'dalam_pengajuan'" class="space-y-4">
                <div class="p-4 bg-gray-50/50 rounded-xl border border-gray-150 dark:bg-gray-900/20 dark:border-gray-800">
                  <p class="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                    Terima pengajuan dan pindahkan ke tahap <strong>Proses GA</strong> untuk pengecekan stok.
                  </p>
                </div>
                <div class="space-y-3">
                  <!-- PIC GA Selection (For Fulfill Stock) -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">PIC GA Penyerah Barang <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <!-- Read-only auto-filled if not Superadmin -->
                      <input 
                        v-if="!authStore.user?.isAdmin && !authStore.user?.is_superadmin"
                        :value="assignedPicGaName || '-'"
                        disabled 
                        class="input-base !bg-gray-100 dark:!bg-gray-800/50 italic opacity-70 font-bold"
                      />
                      <!-- Searchable if Superadmin/Admin -->
                      <template v-else>
                        <input
                          v-model="picGaSearchText"
                          @focus="showDetailEmpDropdown = true"
                          @blur="setTimeout(() => (showDetailEmpDropdown = false), 200)"
                          type="text"
                          placeholder="Cari & pilih PIC GA..."
                          class="input-base text-sm font-bold"
                        />
                        <!-- Dropdown -->
                        <div
                          v-if="showDetailEmpDropdown && filteredPicGaList.length"
                          class="absolute top-full left-0 z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
                        >
                          <div
                            v-for="emp in filteredPicGaList"
                            :key="emp.id"
                            @mousedown.prevent="handleAssignPic(emp)"
                            class="px-4 py-2.5 hover:bg-brand-50 dark:hover:bg-gray-700 cursor-pointer transition border-b border-gray-50 dark:border-gray-700 last:border-0 text-left"
                          >
                            <div class="text-xs font-bold text-gray-800 dark:text-white">{{ emp.fullName }}</div>
                            <div class="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">
                              {{ emp.position?.name || '-' }} • {{ emp.employeeNumber || '-' }}
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                    <!-- Assigned Pill for Superadmin -->
                    <div v-if="assignedPicGaId && (authStore.user?.isAdmin || authStore.user?.is_superadmin)" class="flex items-center gap-2 mt-2">
                      <div class="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg">
                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">{{ assignedPicGaName }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Lokasi Sumber Stok (global untuk semua item) -->
                  <div v-if="canPickRequestLocation" class="space-y-1.5">
                    <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lokasi Sumber Stok <span class="text-red-500">*</span></label>
                    <select
                      :value="requestSourceLocationId"
                      @change="handlePickRequestLocation($event.target.value)"
                      class="input-base text-sm font-bold"
                      :class="needsRequestLocationPick ? '!border-amber-300 dark:!border-amber-600/50 !bg-amber-50 dark:!bg-amber-900/10' : ''"
                    >
                      <option value="" disabled>Pilih lokasi sumber…</option>
                      <option v-for="loc in requestSourceLocations" :key="loc.location_id" :value="loc.location_id">
                        {{ loc.location_name }} — {{ loc.goods_available }}/{{ loc.goods_total }} barang, {{ loc.total_qty }} stok
                      </option>
                    </select>
                    <p class="text-[10px] font-bold" :class="needsRequestLocationPick ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'">
                      {{ needsRequestLocationPick
                        ? 'Stok PIC Penyerah tersebar di beberapa lokasi — pilih satu lokasi untuk semua item.'
                        : 'Lokasi aktif: ' + (currentSourceLocationName || '—') + '. Bisa diganti.' }}
                    </p>
                  </div>

                  <label class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 transition">
                    <input type="checkbox" v-model="workflowForm.hasStock" class="w-4 h-4 rounded text-black dark:text-white" />
                    <span class="text-[12px] font-bold text-gray-700 dark:text-gray-300">Stok Tersedia Sebagian?</span>
                  </label>
                  <label class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 transition">
                    <input type="checkbox" v-model="workflowForm.allItemsInMaster" class="w-4 h-4 rounded text-black dark:text-white" />
                    <span class="text-[12px] font-bold text-gray-700 dark:text-gray-300">Semua Item di Master?</span>
                  </label>
                  <textarea v-model="workflowForm.notes" rows="2" placeholder="Catatan pengecekan awal..." class="input-base text-xs font-bold text-gray-900 dark:text-white"></textarea>
                  
                  <div class="space-y-2">
                    <button
                      @click="handleUpdateStatus('proses_ga')"
                      :disabled="isSubmitting || !assignedPicGaId || !canProceedStock"
                      class="btn-primary w-full py-3 bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/10 disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
                    >
                      <Play class="w-4 h-4 mr-2" /> Mulai Proses GA
                    </button>
                    
                    <button 
                      @click="showPurchaseModal = true" 
                      :disabled="!assignedPicGaId"
                      class="w-full py-3 border border-orange-200 text-orange-600 font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
                    >
                      <PlusCircle class="w-4 h-4" /> Buat PO (Beli Barang)
                    </button>
                    <p v-if="!assignedPicGaId" class="text-[9px] text-red-500 font-bold text-center uppercase tracking-tighter">
                      Silakan pilih/isi PIC GA terlebih dahulu.
                    </p>
                    <p v-else-if="needsRequestLocationPick" class="text-[9px] text-amber-600 dark:text-amber-400 font-bold text-center uppercase tracking-tighter">
                      Pilih lokasi sumber stok di atas dulu.
                    </p>
                    <p v-else-if="!hasAvailableStock && !requestStore.isLoading" class="text-[9px] text-red-500 font-bold text-center uppercase tracking-tighter">
                      Semua item kosong di stok PIC GA, silakan gunakan tombol Buat PO.
                    </p>
                  </div>
                </div>
              </div>

              <!-- STAGE 1 -> DISETUJUI -->
              <div v-else-if="detail.status === 'proses_ga'" class="space-y-4">
                <div class="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                  <p class="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                    Setujui permintaan. Aktifkan <strong>Auto Fulfill</strong> jika ingin stok yang "cukup" dipotong otomatis.
                  </p>
                </div>
                <div class="space-y-3">
                  <!-- Lokasi Sumber Stok (global untuk semua item) -->
                  <div v-if="canPickRequestLocation" class="space-y-1.5">
                    <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lokasi Sumber Stok <span class="text-red-500">*</span></label>
                    <select
                      :value="requestSourceLocationId"
                      @change="handlePickRequestLocation($event.target.value)"
                      class="input-base text-sm font-bold"
                      :class="needsRequestLocationPick ? '!border-amber-300 dark:!border-amber-600/50 !bg-amber-50 dark:!bg-amber-900/10' : ''"
                    >
                      <option value="" disabled>Pilih lokasi sumber…</option>
                      <option v-for="loc in requestSourceLocations" :key="loc.location_id" :value="loc.location_id">
                        {{ loc.location_name }} — {{ loc.goods_available }}/{{ loc.goods_total }} barang, {{ loc.total_qty }} stok
                      </option>
                    </select>
                    <p class="text-[10px] font-bold" :class="needsRequestLocationPick ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'">
                      {{ needsRequestLocationPick
                        ? 'Stok PIC Penyerah tersebar di beberapa lokasi — pilih satu lokasi untuk semua item.'
                        : 'Lokasi aktif: ' + (currentSourceLocationName || '—') + '. Bisa diganti.' }}
                    </p>
                  </div>

                  <label class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 transition">
                    <input type="checkbox" v-model="workflowForm.autoFulfill" class="w-4 h-4 rounded text-emerald-600" />
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Auto Fulfill (Potong Stok)</span>
                  </label>
                  <textarea v-model="workflowForm.notes" rows="2" placeholder="Catatan persetujuan..." class="input-base text-xs font-bold text-gray-900 dark:text-white"></textarea>
                  <p v-if="needsRequestLocationPick" class="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    Pilih lokasi sumber stok dulu sebelum menyetujui.
                  </p>
                  <button @click="handleUpdateStatus('disetujui')" :disabled="isSubmitting || needsRequestLocationPick" class="btn-primary w-full py-3 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    <CheckCircle class="w-4 h-4 mr-2" /> Setujui Pengajuan
                  </button>
                  
                  <div class="pt-4 border-t border-gray-50 dark:border-gray-800">
                    <button @click="showPurchaseModal = true" class="w-full py-3 border border-orange-200 text-orange-600 font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2">
                      <PlusCircle class="w-4 h-4" /> Buat PO (Beli Barang)
                    </button>
                  </div>
                </div>
              </div>

              <!-- STAGE 2 -> DISERAHKAN -->
              <div v-else-if="detail.status === 'disetujui'" class="space-y-4">
                <div class="p-4 bg-gray-50/50 rounded-xl border border-gray-150 dark:bg-gray-900/20 dark:border-gray-800">
                  <p class="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                    Konfirmasi penyerahan barang ke unit pemohon.
                  </p>
                </div>
                <div class="space-y-3">
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Diserahkan oleh</label>
                    <div class="p-3.5 bg-gray-50/30 dark:bg-gray-900/10 border border-gray-150 dark:border-gray-800 rounded-2xl flex items-center gap-3">
                      <div>
                        <div class="text-sm font-bold text-gray-800 dark:text-white">{{ assignedPicGaName || '-' }}</div>
                        <div class="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black leading-none mt-1">PIC GA Penyerah</div>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Divisi Pemohon</label>
                    <div class="p-3.5 bg-gray-50/30 dark:bg-gray-900/10 border border-gray-150 dark:border-gray-800 rounded-2xl flex items-center gap-3">
                      <div>
                        <div class="text-sm font-bold text-gray-800 dark:text-white">{{ detail?.divisionName }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tanggal Serah</label>
                    <input v-model="workflowForm.deliveredAt" type="date" class="input-base text-xs font-bold text-gray-900 dark:text-white" />
                  </div>
                  <textarea v-model="workflowForm.deliveryNotes" rows="2" placeholder="Catatan penyerahan (misal: diterima lengkap)..." class="input-base text-xs font-bold text-gray-900 dark:text-white"></textarea>
                  
                  <button @click="handleUpdateStatus('diserahkan')" :disabled="isSubmitting" class="btn-primary w-full py-3 bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/10">
                    <Package class="w-4 h-4 mr-2" /> Konfirmasi Penyerahan
                  </button>
                </div>
              </div>

              <!-- STATUS CANCEL (IF NOT FINISHED) -->
              <div v-if="['dalam_pengajuan', 'proses_ga', 'disetujui'].includes(detail.status)" class="pt-6 border-t border-gray-50 dark:border-gray-800">
                <h4 class="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3">Batalkan Pengajuan</h4>
                <textarea v-model="workflowForm.cancelNote" rows="2" placeholder="Alasan pembatalan (Wajib)..." class="input-base text-xs font-bold text-gray-900 dark:text-white border-red-50 focus:border-red-200 focus:ring-red-500/5"></textarea>
                <button @click="handleUpdateStatus('batal')" :disabled="isSubmitting || !workflowForm.cancelNote" class="w-full mt-3 py-2 text-xs font-bold text-red-500 border border-red-50 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition">
                  Batalkan Sekarang
                </button>
              </div>

              <!-- FINISHED STATUS -->
              <div v-if="detail.status === 'diserahkan' || detail.status === 'batal'" class="text-center py-4 space-y-3">
                <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <Check v-if="detail.status === 'diserahkan'" class="w-8 h-8 text-emerald-500" />
                  <X v-else class="w-8 h-8 text-red-400" />
                </div>
                <h4 class="font-black uppercase tracking-widest text-gray-800 dark:text-white">Request {{ detail.status === 'diserahkan' ? 'Selesai' : 'Dibatalkan' }}</h4>
                <p v-if="detail.cancelNote" class="text-xs text-red-400 italic">"{{ detail.cancelNote }}"</p>
                <p v-if="detail.deliveryNotes" class="text-xs text-gray-500 italic">"{{ detail.deliveryNotes }}"</p>
              </div>
            </div>
          </div>

          <!-- INFO PENGIRIMAN (ONLY IF DISERAHKAN) -->
          <div v-if="detail.status === 'diserahkan'" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 dark:bg-gray-900 dark:border-gray-800">
            <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Truck class="w-4 h-4 text-indigo-500" />
              Info Penyerahan
            </h3>
            <div class="space-y-3 text-xs">
              <div class="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
                <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Petugas</span>
                <span class="font-bold text-gray-700 dark:text-gray-300">{{ detail.delivererName || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Tanggal</span>
                <span class="font-bold text-gray-700 dark:text-gray-300">{{ formatDate(detail.deliveredAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CREATE PURCHASE -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showPurchaseModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showPurchaseModal = false"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" @click="showPurchaseModal = false"></div>

          <!-- Modal Panel -->
          <div class="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <ShoppingCart class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-gray-800 dark:text-white">Buat Purchase Order</h3>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Dari tiket pengajuan ini</p>
                </div>
              </div>
              <button
                @click="showPurchaseModal = false"
                class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/80 transition"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-5">
              <!-- Info Banner -->
              <div class="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
                <div class="w-5 h-5 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-orange-600 text-[10px] font-black">!</span>
                </div>
                <p class="text-[11px] text-orange-700 dark:text-orange-400 leading-relaxed">
                  Sistem akan otomatis memasukkan item dengan stok <strong>Kurang</strong> atau <strong>Kosong</strong> ke dalam Draft PO.
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
                      v-model="purchaseSearch"
                      @focus="showEmpDropdown = true"
                      @blur="setTimeout(() => (showEmpDropdown = false), 200)"
                      type="text"
                      placeholder="Cari nama karyawan PIC GA..."
                      class="input-base text-sm font-bold"
                    />
                    <!-- Dropdown -->
                    <div
                      v-if="showEmpDropdown && filteredEmployees.length"
                      class="absolute top-full left-0 z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto"
                    >
                      <div
                        v-for="emp in filteredEmployees"
                        :key="emp.id"
                        @mousedown.prevent="selectEmployee(emp)"
                        class="px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer transition border-b border-gray-50 dark:border-gray-700 last:border-0"
                      >
                        <div class="text-xs font-bold text-gray-800 dark:text-white">{{ emp.fullName }}</div>
                        <div class="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">{{ emp.employeeId }}</div>
                      </div>
                    </div>
                  </template>
                </div>
                <!-- Selected employee pill (Admin only) -->
                <div v-if="purchaseForm.pic_ga && isSuperAdmin" class="flex items-center gap-2 mt-2">
                  <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">{{ purchaseSearch }}</span>
                    <button 
                      type="button"
                      @click="purchaseForm.pic_ga = ''; purchaseSearch = ''" 
                      class="ml-1 p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 rounded transition text-emerald-600 dark:text-emerald-400"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Payment Only (Type removed as per request) -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pembayaran <span class="text-red-500">*</span></label>
                <select v-model="purchaseForm.payment" class="input-base text-xs font-bold">
                  <option :value="null">Pilih Metode</option>
                  <option value="kas_ga">KAS GA</option>
                  <option value="finance">FINANCE</option>
                </select>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                @click="handleCreatePurchase"
                :disabled="!purchaseForm.pic_ga || !purchaseForm.payment || isSubmitting"
                class="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <PlusCircle class="w-4 h-4" />
                Buat Draft PO Sekarang
              </button>
              <button
                @click="showPurchaseModal = false"
                class="px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL LINK MASTER -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showLinkMasterModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showLinkMasterModal = false"
        >
          <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" @click="showLinkMasterModal = false"></div>
          <div class="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                  <Link2 class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-gray-800 dark:text-white">Hubungkan ke Master</h3>
                  <p class="text-[10px] text-gray-500 font-medium">Item: {{ selectedItemToLink?.itemNameManual }}</p>
                </div>
              </div>
              <button @click="showLinkMasterModal = false" class="text-gray-400 hover:text-gray-600 transition"><X class="w-4 h-4" /></button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cari Barang Master</label>
                <div class="relative">
                  <input
                    v-model="goodsSearch"
                    @focus="showGoodsDropdown = true"
                    @blur="setTimeout(() => (showGoodsDropdown = false), 200)"
                    type="text"
                    placeholder="Ketik nama atau kode barang..."
                    class="input-base text-sm"
                  />
                  <!-- Dropdown -->
                  <div v-if="showGoodsDropdown && filteredMasterGoods.length" class="absolute top-full left-0 z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    <div
                      v-for="good in filteredMasterGoods"
                      :key="good.id"
                      @mousedown.prevent="selectMasterGood(good)"
                      class="px-4 py-2.5 hover:bg-amber-50 dark:hover:bg-gray-700 cursor-pointer text-xs border-b border-gray-50 dark:border-gray-700 last:border-0"
                    >
                      <div class="font-bold text-gray-800 dark:text-white">{{ good.goodName }}</div>
                      <div class="text-[9px] text-gray-400 uppercase tracking-widest">{{ good.goodCode }} • {{ good.categoryName }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected Pill -->
              <div v-if="selectedMasterGood" class="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl flex items-center justify-between">
                <div>
                  <div class="text-[8px] font-black text-emerald-600 uppercase tracking-tighter mb-0.5">TERPILIH</div>
                  <div class="text-xs font-bold text-gray-800 dark:text-white">{{ selectedMasterGood.goodName }}</div>
                </div>
                <button @click="selectedMasterGood = null; goodsSearch = ''" class="text-gray-400 hover:text-red-500 transition"><X class="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                @click="handleConfirmLink"
                :disabled="!selectedMasterGood || isSubmitting"
                class="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                Konfirmasi Hubungkan
              </button>
              <button @click="showLinkMasterModal = false" class="px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 transition">Batal</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Loading State -->
    <div v-if="!detail && requestStore.isLoading" class="flex flex-col items-center justify-center min-h-[500px] space-y-4">
      <div class="animate-spin h-10 w-10 border-4 border-black dark:border-white border-t-transparent rounded-full font-bold"></div>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Memuat Detail Request...</p>
    </div>

    <!-- Edit Form Modal -->
    <RequestFormModal
      v-model="showEditModal"
      :request-id="route.params.id"
      @saved="loadData"
    />
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Badge from '@/components/ui/Badge.vue';
import AuditHistory from '@/components/common/AuditHistory.vue';
import RequestFormModal from './components/RequestFormModal.vue';
import { isGaDivision, employeeIsGaDivision } from '@/utils/division';
import { useRequestStore } from './request.store';
import { usePurchaseCartStore } from '@/modules/transaction/purchase-cart/purchase-cart.store';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { EmployeeService } from '@/modules/organization/employees/employee.service';
import { GoodsService } from '@/modules/master/goods/services/goods.service';
import { Alert } from '@/plugins/sweetalert';
import { 
  MoveLeft, Check, Play, CheckCircle, Package, X, ExternalLink, Settings, ShoppingCart, PlusCircle, Truck,
  RefreshCw, Link2
} from 'lucide-vue-next';

const { setTimeout } = window;

const route = useRoute();
const router = useRouter();
const requestStore = useRequestStore();
const purchaseCartStore = usePurchaseCartStore();
const authStore = useAuthStore();

// --- States ---
const showEditModal = ref(false);
const isSubmitting = ref(false);
const showPurchaseModal = ref(false);
const showLinkMasterModal = ref(false);
const picGaSearchText = ref('');
const showDetailEmpDropdown = ref(false);
const employees = ref([]);
const purchaseSearch = ref('');
const goodsSearch = ref('');
const showGoodsDropdown = ref(false);
const showEmpDropdown = ref(false);
const masterGoods = ref([]);
const selectedItemToLink = ref(null);
const selectedMasterGood = ref(null);

const workflowForm = reactive({ 
  notes: '',
  hasStock: true,
  allItemsInMaster: true,
  autoFulfill: true,
  deliveredBy: '',
  deliveredAt: new Date().toISOString().split('T')[0],
  deliveryNotes: '',
  cancelNote: ''
});

const purchaseForm = reactive({
  pic_ga: '',
  purchase_type: 'barang',
  payment: null
});

// Watch modal open to pre-fill PIC GA
watch(showPurchaseModal, (val) => {
  if (val) {
    const user = authStore.user;
    const selfEmpId = user?.employeeId || user?.employee_id || user?.id || '';
    const selfName = user?.fullName || user?.full_name || user?.displayName || 'Me';
    
    // Auto-fill PIC GA if empty
    if (!purchaseForm.pic_ga) {
      purchaseForm.pic_ga = selfEmpId;
      purchaseSearch.value = selfName;
    }
  }
});

// Watch purchaseForm to debug button disable logic
watch(purchaseForm, (newVal) => {
  console.log('DEBUG: purchaseForm state:', JSON.stringify(newVal));
  console.log('DEBUG: Button should be disabled?', !newVal.pic_ga || !newVal.payment);
}, { deep: true });

const stockCheckData = computed(() => requestStore.stockCheckData);
const getItemStock = (detailId) => {
  const items = Array.isArray(stockCheckData.value) ? stockCheckData.value : stockCheckData.value?.items;
  if (!items) return null;
  return items.find(i => i.detail_id === detailId);
};

// --- Resolusi lokasi stok sumber GLOBAL (PIC Penyerah punya stok yang sama di >1 lokasi) ---
const stockCheckMeta = computed(() => {
  const d = stockCheckData.value;
  return (d && !Array.isArray(d)) ? d : {};
});
const requestSourceLocations = computed(() => stockCheckMeta.value.source_locations || []);
const requestSourceLocationId = computed(() => stockCheckMeta.value.source_location_id || '');
const needsRequestLocationPick = computed(() => stockCheckMeta.value.needs_location_pick === true);
// Picker ditampilkan selama ada >=2 lokasi kandidat & request masih bisa diubah
const canPickRequestLocation = computed(() =>
  requestSourceLocations.value.length > 1 &&
  ['dalam_pengajuan', 'proses_ga', 'disetujui'].includes(detail.value?.status)
);
const currentSourceLocationName = computed(() => {
  const id = requestSourceLocationId.value;
  return requestSourceLocations.value.find(l => l.location_id === id)?.location_name || null;
});
const handlePickRequestLocation = async (locationId) => {
  if (!locationId) return;
  try {
    await requestStore.setRequestSourceLocation(route.params.id, locationId);
    Alert.toast('Berhasil', 'Lokasi sumber stok diset untuk semua item', 'success');
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Gagal set lokasi sumber stok');
  }
};

const steps = [
  { key: 'dalam_pengajuan', label: 'Pengajuan' },
  { key: 'proses_ga', label: 'Proses GA' },
  { key: 'disetujui', label: 'Disetujui' },
  { key: 'diserahkan', label: 'Penyerahan' }
];

// --- Computed ---
const detail = computed(() => requestStore.requestDetail);

const currentStageIndex = computed(() => {
  if (!detail.value) return 0;
  const s = detail.value.status;
  if (s === 'batal') return -1;
  const idx = steps.findIndex(step => step.key === s);
  return idx >= 0 ? idx : 0;
});

const hasAvailableStock = computed(() => {
  const items = Array.isArray(stockCheckData.value) ? stockCheckData.value : stockCheckData.value?.items;
  if (!items) return false;
  return items.some(i => (i.qty_current || 0) > 0);
});

// Boleh lanjut ke Proses GA kalau lokasi sumber sudah tidak perlu dipilih DAN ada stok.
const canProceedStock = computed(() => !needsRequestLocationPick.value && hasAvailableStock.value);

const isSuperAdmin = computed(() => authStore.user?.isAdmin === true || authStore.user?.is_superadmin === true);

const isGaOrHrga = computed(() => {
  if (authStore.user?.is_superadmin || authStore.user?.isAdmin || authStore.user?.is_admin) return true;
  return isGaDivision(authStore.user?.divisionName);
});

const assignedPicGaId = computed(() => {
  return detail.value?.items?.[0]?.picId || '';
});

const assignedPicGaName = computed(() => {
  return detail.value?.items?.[0]?.picName || '';
});

// Keep the delivery "Petugas" in sync with the assigned PIC GA, however/whenever it loads
watch(assignedPicGaId, (val) => {
  if (val) workflowForm.deliveredBy = val;
}, { immediate: true });

const filteredPicGaList = computed(() => {
  const gaEmployees = employees.value.filter((e) => employeeIsGaDivision(e));

  if (!picGaSearchText.value) return gaEmployees.slice(0, 10);
  const q = picGaSearchText.value.toLowerCase();
  return gaEmployees.filter(e => 
    (e.fullName || '').toLowerCase().includes(q) || 
    (e.employeeNumber || '').toLowerCase().includes(q)
  ).slice(0, 10);
});

const filteredEmployees = computed(() => {
  if (!purchaseSearch.value) return employees.value.slice(0, 10);
  const q = purchaseSearch.value.toLowerCase();
  return employees.value.filter(e => 
    (e.fullName || '').toLowerCase().includes(q) || 
    (e.employeeNumber || '').toLowerCase().includes(q)
  ).slice(0, 10);
});

// filteredDeliveryEmps removed as it's no longer used

const filteredMasterGoods = computed(() => {
  if (!goodsSearch.value) return masterGoods.value.slice(0, 10);
  const q = goodsSearch.value.toLowerCase();
  const filtered = masterGoods.value.filter(g => 
    (g.goodName || '').toLowerCase().includes(q) || 
    (g.goodCode || '').toLowerCase().includes(q)
  );
  return filtered.slice(0, 10);
});
watch(filteredMasterGoods, (newVal) => {
  console.log('Filtered Master Goods updated:', newVal);
});

// --- Methods ---
const loadData = async () => {
  if (!isGaOrHrga.value) {
    Alert.error('Akses Ditolak', 'Hanya divisi GA yang memiliki akses ke halaman detail request.');
    router.push({ name: 'TranRequests' });
    return;
  }

  try {
    await requestStore.fetchDetail(route.params.id);

    // Auto-assign PIC GA on load if not already set and it is in 'dalam_pengajuan' stage
    if (detail.value?.status === 'dalam_pengajuan' && !assignedPicGaId.value) {
      if (!authStore.user?.isAdmin && !authStore.user?.is_superadmin) {
        const selfEmpId = authStore.user?.employeeId || authStore.user?.employee_id;
        if (selfEmpId) {
          await requestStore.assignPic(route.params.id, selfEmpId);
          await requestStore.fetchDetail(route.params.id);
        }
      }
    }

    if (assignedPicGaName.value) {
      picGaSearchText.value = assignedPicGaName.value;
    }

    await requestStore.checkStock(route.params.id);
    
    console.log('Stock Check Data:', stockCheckData.value);

    const empRes = await EmployeeService.getAll({ limit: 50, status: 'active' });
    employees.value = empRes?.data || [];

    // Load master goods for linking
    const goodsRes = await GoodsService.getAll({ limit: 100 });
    masterGoods.value = goodsRes.data || [];
  } catch (error) {
    console.error('Failed to load detail data:', error);
    Alert.error('Error', 'Gagal memuat data permintaan. Silakan coba lagi.');
  }
};

const handleRefreshStock = async () => {
  try {
    isSubmitting.value = true;
    await requestStore.handleRefreshStock(route.params.id);
    
    console.log('Stock Check Data Updated:', stockCheckData.value);
    Alert.success('Berhasil', 'Status stok telah diperbarui.');
  } catch (err) {
    Alert.error('Gagal', 'Gagal memperbarui status stok.');
  } finally {
    isSubmitting.value = false;
  }
};

const openLinkMaster = (item) => {
  selectedItemToLink.value = item;
  selectedMasterGood.value = null;
  goodsSearch.value = '';
  showLinkMasterModal.value = true;
};

const selectMasterGood = (good) => {
  selectedMasterGood.value = good;
  goodsSearch.value = good.goodName;
  showGoodsDropdown.value = false;
};

const handleConfirmLink = async () => {
  if (!selectedMasterGood.value) return;
  try {
    isSubmitting.value = true;
    await requestStore.linkItemToMaster(route.params.id, selectedItemToLink.value.id, selectedMasterGood.value.id);
    showLinkMasterModal.value = false;
    Alert.success('Berhasil', 'Item manual telah dihubungkan ke master.');
  } catch (err) {
    Alert.error('Gagal', 'Gagal menghubungkan item ke master.');
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (d) => {
  if (!d) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
  } catch (e) { return d; }
};

const getStatusColor = (s) => ({ dalam_pengajuan: 'warning', proses_ga: 'info', disetujui: 'primary', diserahkan: 'success', batal: 'error' }[s] || 'neutral');

const getStockStatusColor = (s) => ({ cukup: 'success', kurang: 'warning', kosong: 'error' }[s] || 'neutral');

// --- Purchase Cart (Keranjang Pembelian) ---
const addingToCartId = ref(null);

const canAddToCart = (item) => {
  const status = getItemStock(item.id)?.stock_status || item.stockStatus;
  const needsPurchase = status === 'kurang' || status === 'kosong';
  const statusAllowed = ['dalam_pengajuan', 'proses_ga', 'disetujui'].includes(detail.value?.status);
  return needsPurchase && statusAllowed;
};

const handleAddToCart = async (item) => {
  try {
    addingToCartId.value = item.id;
    await purchaseCartStore.addItem(item.id);
    const itemLabel = item.isManual ? item.itemNameManual : item.goodName;
    Alert.success('Ditambahkan ke keranjang', `${itemLabel} berhasil ditambahkan ke Keranjang Pembelian.`);
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Gagal menambahkan item ke keranjang.');
  } finally {
    addingToCartId.value = null;
  }
};

const handleAssignPic = async (emp) => {
  try {
    const empId = emp.employeeId || emp.id;
    picGaSearchText.value = emp.fullName;
    showDetailEmpDropdown.value = false;
    
    await requestStore.assignPic(route.params.id, empId);
    await requestStore.handleRefreshStock(route.params.id);
    Alert.success('Berhasil', 'PIC GA penyerah barang berhasil diset.');
  } catch (err) {
    Alert.error('Gagal', 'Gagal menset PIC GA.');
  }
};

const selectEmployee = (emp) => {
  purchaseForm.pic_ga = emp.employeeId || emp.id; // use employee.id, not user.id
  purchaseSearch.value = emp.fullName;
  showEmpDropdown.value = false;
};

// selectDeliveryEmp removed as it's no longer used (replaced by static requester info)

const handleUpdateStatus = async (newStatus) => {
  try {
    const confirmed = await Alert.confirm('Konfirmasi', `Pindahkan status ke ${newStatus.replace('_', ' ')}?`);
    if (!confirmed) return;

    isSubmitting.value = true;
    const payload = { status: newStatus };

    if (newStatus === 'proses_ga') {
      payload.has_stock = workflowForm.hasStock;
      payload.all_items_in_master = workflowForm.allItemsInMaster;
      payload.note = workflowForm.notes;
    } else if (newStatus === 'disetujui') {
      payload.auto_fulfill = workflowForm.autoFulfill;
      payload.note = workflowForm.notes;
    } else if (newStatus === 'diserahkan') {
      if (!workflowForm.deliveredBy) {
        Alert.error('Validasi', 'PIC Penyerah wajib diisi.');
        return;
      }
      payload.delivered_by = workflowForm.deliveredBy;
      payload.delivered_at = workflowForm.deliveredAt;
      payload.delivery_notes = workflowForm.deliveryNotes;

      // Update qty_fulfilled in backend
      const fulfilled = {};
      detail.value.items.forEach(item => {
        fulfilled[item.id] = Number(item.qtyRequest);
      });
      payload.fulfilled_items = fulfilled;
    } else if (newStatus === 'batal') {
      if (!workflowForm.cancelNote) {
        Alert.error('Validasi', 'Alasan pembatalan wajib diisi.');
        return;
      }
      payload.cancel_note = workflowForm.cancelNote;
    }

    await requestStore.updateStatus(route.params.id, payload);
    Alert.success('Berhasil', 'Status permintaan berhasil diperbarui.');
    
    // Reset forms
    workflowForm.notes = '';
    workflowForm.cancelNote = '';
  } catch (err) {
    Alert.error('Gagal', err.response?.data?.message || 'Gagal memperbarui status.');
  } finally {
    isSubmitting.value = false;
  }
};

const handleCreatePurchase = async () => {
  if (!purchaseForm.pic_ga) {
    Alert.error('Validasi', 'PIC GA wajib dipilih.');
    return;
  }
  try {
    isSubmitting.value = true;
    await requestStore.createPurchase(route.params.id, purchaseForm);
    showPurchaseModal.value = false;
    await requestStore.fetchDetail(route.params.id); // refresh linked POs
    Alert.success('Berhasil', 'Draft Purchase Order telah dibuat.');
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || 'Gagal membuat PO.';
    Alert.error('Gagal Membuat PO', msg);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  const confirmed = await Alert.confirm('Hapus Permintaan?', 'Data tidak dapat dikembalikan.');
  if (confirmed) {
    try {
      isSubmitting.value = true;
      await requestStore.deleteRequest(route.params.id);
      Alert.success('Berhasil', 'Permintaan dihapus.');
      router.push({ name: 'TranRequests' });
    } catch (err) {
      Alert.error('Gagal', 'Gagal menghapus permintaan.');
    } finally {
      isSubmitting.value = false;
    }
  }
};

// Search Watcher for Master Goods
watch(goodsSearch, async (newVal) => {
  if (selectedMasterGood.value) return;
  
  if (newVal.length > 2) {
    try {
      const res = await GoodsService.getAll({ search: newVal, limit: 10 });
      masterGoods.value = res.data || [];
    } catch (e) { console.error(e); }
  } else if (newVal.length === 0) {
    // Restore initial list when search is cleared
    try {
      const goodsRes = await GoodsService.getAll({ limit: 100 });
      masterGoods.value = goodsRes.data || [];
    } catch (e) { console.error(e); }
  }
});

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="postcss">
@reference "../../../assets/main.css";

/* Modal fade transition */
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

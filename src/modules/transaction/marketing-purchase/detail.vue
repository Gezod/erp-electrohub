<template>
  <AdminLayout>
    <div v-if="detail" class="max-w-(--breakpoint-2xl) mx-auto space-y-6 pb-20">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div class="flex items-center gap-4">
          <router-link :to="{ name: 'MarketingPurchaseList' }" class="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition">
            <ArrowLeft class="w-5 h-5 text-gray-400" />
          </router-link>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-xl font-bold text-gray-800 dark:text-white">{{ detail.code }}</h1>
              <Badge :color="statusColor(detail.status)" class="uppercase text-[9px] font-black px-3 py-1">{{ detail.status }}</Badge>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">Dibuat {{ formatDate(detail.createdAt) }}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button v-if="['draft', 'diajukan'].includes(detail.status)" v-can="'marketing-purchases:update'" @click="showEditModal = true" class="btn-outline px-6 py-2.5 flex items-center gap-2">
            <Edit2 class="w-4 h-4" /> <span>Edit Purchase</span>
          </button>
          <button v-if="isSuperAdmin && detail.status === 'selesai'" @click="handleHardDelete" class="btn-outline px-6 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 flex items-center gap-2 font-bold">
            <Trash2 class="w-4 h-4" /> <span>Hard Delete</span>
          </button>
        </div>
      </div>

      <!-- Stepper -->
      <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div class="relative flex justify-between items-center max-w-3xl mx-auto">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-0"></div>
          <div class="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500 transition-all duration-500 -z-0" :style="{ width: `${(Math.max(0, currentStageIndex) / (steps.length - 1)) * 100}%` }"></div>
          <div v-for="(step, idx) in steps" :key="step.key" class="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-gray-900 px-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center border-2" :class="idx <= currentStageIndex ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300'">
              <Check v-if="idx < currentStageIndex" class="w-4 h-4" />
              <span v-else class="text-xs font-bold">{{ idx + 1 }}</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-[9px] font-black uppercase tracking-widest" :class="idx <= currentStageIndex ? 'text-gray-800 dark:text-white' : 'text-gray-400'">{{ step.label }}</span>
              <span v-if="getStepDate(step.key)" class="text-[8px] text-brand-500 font-bold mt-0.5">{{ formatDateSmall(getStepDate(step.key)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="lg:col-span-3 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div class="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"><Ticket class="w-3.5 h-3.5" /><span>Informasi Dasar</span></div>
              <div class="space-y-3">
                <div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-600 dark:text-gray-400">Lokasi:</span><span class="text-xs font-bold text-gray-800 dark:text-white">{{ detail.location?.location_name || '-' }}</span></div>
                <div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-600 dark:text-gray-400">PIC:</span><span class="text-xs font-bold text-gray-800 dark:text-white">{{ detail.pic?.full_name || '-' }}</span></div>
                <div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-600 dark:text-gray-400">Tipe Pembelian:</span><span class="text-xs font-bold text-gray-800 dark:text-white">{{ purchaseTypeLabel(detail.purchaseType) }}</span></div>
                <div v-if="detail.request" class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Dari Request:</span>
                  <router-link :to="{ name: 'MarketingRequestDetail', params: { id: detail.requestId } }" class="text-xs font-bold text-brand-600 hover:underline">{{ detail.request.request_code }}</router-link>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div class="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"><Truck class="w-3.5 h-3.5" /><span>Logistik &amp; Pembayaran</span></div>
              <div class="space-y-3">
                <div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-600 dark:text-gray-400">Vendor:</span><span class="text-xs font-bold text-gray-800 dark:text-white">{{ detail.vendorName || '-' }}</span></div>
                <div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-600 dark:text-gray-400">Tgl Beli:</span><span class="text-xs font-bold text-gray-800 dark:text-white">{{ formatDate(detail.datePurchase) }}</span></div>
                <div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-600 dark:text-gray-400">Est. Tiba:</span><span class="text-xs font-bold text-gray-800 dark:text-white">{{ formatDate(detail.dateArrive) }}</span></div>
                <div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-600 dark:text-gray-400">Sumber Dana:</span><span class="text-xs font-bold text-brand-600 uppercase">{{ paymentLabel(detail.payment) }}</span></div>
                <div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-600 dark:text-gray-400">Metode Bayar:</span><Badge color="light" class="text-[9px] font-bold uppercase">{{ paymentMethodLabel(detail.paymentMethod) }}</Badge></div>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <Package class="w-5 h-5 text-brand-500" />
                <h2 class="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight">Item Barang</h2>
              </div>
              <div v-if="detail.status === 'selesai' && (totalQtyRefund > 0 || totalQtyRetur > 0 || totalQtyDefective > 0)" class="flex gap-2">
                <Badge v-if="totalQtyRefund > 0" color="warning" class="text-[10px] font-bold">Total Refund: {{ totalQtyRefund }}</Badge>
                <Badge v-if="totalQtyRetur > 0" color="warning" class="text-[10px] font-bold">Total Retur: {{ totalQtyRetur }}</Badge>
                <Badge v-if="totalQtyDefective > 0" color="error" class="text-[10px] font-bold">Total Rusak: {{ totalQtyDefective }}</Badge>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th class="px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-left whitespace-nowrap">Barang</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right whitespace-nowrap">Qty Beli</th>
                    <th v-if="showBreakdownColumns" class="px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right whitespace-nowrap">Bagus</th>
                    <th v-if="showBreakdownColumns" class="px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right whitespace-nowrap">Refund</th>
                    <th v-if="showBreakdownColumns" class="px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right whitespace-nowrap">Retur</th>
                    <th v-if="showBreakdownColumns" class="px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right whitespace-nowrap">Rusak</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right whitespace-nowrap">Harga</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right whitespace-nowrap">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                  <tr v-for="it in detail.items" :key="it.id">
                    <td class="px-4 py-3">
                      <div class="font-bold text-gray-800 dark:text-white">{{ it.goodName }}</div>
                      <Badge v-if="it.goodId" :color="it.tipeBarang === 'permanent' ? 'info' : 'primary'" class="uppercase text-[8px] font-black mt-1">{{ it.tipeBarang }}</Badge>
                      <div v-if="it.assets?.length" class="mt-1 text-[10px] text-emerald-600 font-bold">{{ it.assets.length }} aset ter-generate</div>
                    </td>
                    <td class="px-4 py-3 text-right font-bold whitespace-nowrap">{{ it.qtyPurchase }} {{ it.uomName }}</td>
                    <td v-if="showBreakdownColumns" class="px-4 py-3 text-right font-bold text-emerald-600">{{ it.qtyAccepted }}</td>
                    <td v-if="showBreakdownColumns" class="px-4 py-3 text-right font-bold text-orange-500">{{ it.qtyRefund }}</td>
                    <td v-if="showBreakdownColumns" class="px-4 py-3 text-right font-bold text-orange-500">{{ it.qtyRetur }}</td>
                    <td v-if="showBreakdownColumns" class="px-4 py-3 text-right font-bold text-red-500">{{ it.qtyDefective }}</td>
                    <td class="px-4 py-3 text-right whitespace-nowrap">Rp {{ formatNumber(it.unitPrice) }}</td>
                    <td class="px-4 py-3 text-right font-bold whitespace-nowrap">Rp {{ formatNumber(it.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <div class="flex justify-between items-center text-xs font-bold text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>Rp {{ formatNumber(subtotalRaw) }}</span></div>
              <div class="flex justify-between items-center text-xs font-bold text-gray-600 dark:text-gray-400"><span>Diskon</span><span>- Rp {{ formatNumber(discountAmount) }}</span></div>
              <div v-if="detail.status === 'selesai' && totalRefundAmount > 0" class="flex justify-between items-center text-xs font-bold text-orange-500"><span>Potongan Refund</span><span>- Rp {{ formatNumber(totalRefundAmount) }}</span></div>
              <div v-if="detail.status === 'selesai' && totalReturAmount > 0" class="flex justify-between items-center text-xs font-bold text-orange-500"><span>Potongan Retur</span><span>- Rp {{ formatNumber(totalReturAmount) }}</span></div>
              <div class="flex justify-between items-center text-xs font-bold text-gray-600 dark:text-gray-400"><span>Ongkir</span><span>+ Rp {{ formatNumber(detail.shippingCost || 0) }}</span></div>
              <div class="flex justify-between items-center text-xs font-bold text-gray-600 dark:text-gray-400"><span>Lainnya</span><span>+ Rp {{ formatNumber(detail.packagingCost || 0) }}</span></div>
              <div class="flex justify-between items-center text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider pt-2 border-t border-dashed border-gray-100 dark:border-gray-800"><span>Total</span><span>Rp {{ formatNumber(detail.priceFinalTotal || detail.priceTotal) }}</span></div>
            </div>
          </div>

          <!-- Documents -->
          <EvidenceManager
            :purchase-id="detail.id"
            :evidences="detail.evidences"
            :disabled="detail.status === 'batal' || !authStore.hasPrivilege('marketing-purchases:update')"
          />

          <!-- Action Results -->
          <div v-if="detail.actionResults" class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div class="flex items-center gap-2 text-[10px] font-black text-success-500 uppercase tracking-widest">
              <CheckCircle class="w-3.5 h-3.5" />
              <span>Hasil Eksekusi Transaksi</span>
            </div>
            <div class="space-y-3">
              <div v-for="(res, idx) in detail.actionResults" :key="idx" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between text-[11px]">
                <div v-if="res.qty_in">
                  <span class="text-gray-500">Stock In:</span>
                  <span class="font-bold ml-1 text-gray-800 dark:text-white">+{{ res.qty_in }} unit</span>
                  <span class="text-gray-400 ml-2">(Balance: {{ res.balance_after }})</span>
                </div>
                <div v-else-if="res.code_asset">
                  <span class="text-gray-500">Aset Baru:</span>
                  <span class="font-bold ml-1 text-brand-600">{{ res.code_asset }}</span>
                </div>
                <div v-else-if="res.skipped">
                  <span class="text-orange-500">Skipped:</span>
                  <span class="text-gray-400 ml-1">{{ res.reason }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Audit History -->
          <AuditHistory module="MKT_PURCHASE_HEADER" :recordId="detail.id" />
        </div>

        <!-- Action Center -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Aksi</h3>

            <button v-if="detail.status === 'draft'" v-can="'marketing-purchases:update'" @click="updateStatus('diajukan')" :disabled="busy" class="btn-primary w-full">Ajukan Sekarang</button>

            <div v-if="detail.status === 'diajukan'" class="space-y-3">
              <!-- Banner status persetujuan berjenjang -->
              <div v-if="approvalRoleText" class="rounded-xl border p-3 flex items-start gap-2.5"
                :class="{
                  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40': approvalRoleText.type === 'waiting_a',
                  'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40': approvalRoleText.type === 'done_a',
                }">
                <ShieldCheck v-if="approvalRoleText.type === 'done_a'" class="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                <ShieldAlert v-else class="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider"
                    :class="{
                      'text-amber-700 dark:text-amber-400': approvalRoleText.type === 'waiting_a',
                      'text-emerald-700 dark:text-emerald-400': approvalRoleText.type === 'done_a',
                    }">Status Persetujuan</p>
                  <p class="text-xs font-bold mt-0.5"
                    :class="{
                      'text-amber-700 dark:text-amber-300': approvalRoleText.type === 'waiting_a',
                      'text-emerald-700 dark:text-emerald-300': approvalRoleText.type === 'done_a',
                    }">{{ approvalRoleText.text }}</p>
                </div>
              </div>

              <!-- Terkunci: user tidak punya hak akses untuk nominal ini -->
              <div v-if="!userCanActionApproval" class="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 flex items-center gap-3">
                <Lock class="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Akses Tidak Cukup</p>
                  <p class="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5">Anda tidak memiliki hak akses untuk menyetujui transaksi dengan nominal ini.</p>
                </div>
              </div>

              <button v-if="userCanActionApproval" @click="updateStatus('disetujui')" :disabled="busy" class="btn-primary w-full flex items-center justify-center gap-2">
                <ShieldCheck class="w-4 h-4" />
                <span>{{ approvalButtonText }}</span>
              </button>
            </div>

            <div v-if="detail.status === 'disetujui'" class="space-y-3">
              <p class="text-xs text-gray-700 dark:text-gray-300 font-bold leading-relaxed">Konfirmasi jika barang sudah diterima di lokasi.</p>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Tanggal Tiba</label>
                <input v-model="workflowForm.dateArrive" type="date" class="input-base text-sm" />
              </div>
              <button v-can="'marketing-purchases:update'" @click="updateStatus('diterima')" :disabled="busy" class="btn-primary w-full bg-orange-500">Konfirmasi Barang Diterima</button>
            </div>

            <div v-if="detail.status === 'diterima' && detail.purchaseType === 'barang'" class="space-y-4">
              <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30 text-xs font-bold text-orange-800 dark:text-orange-300">
                Isi jumlah breakdown fisik barang untuk menyelesaikan transaksi.
              </div>

              <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                <div v-for="item in inspectionItems" :key="item.id" class="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-800 rounded-xl space-y-3">
                  <div class="flex justify-between items-start">
                    <div class="flex flex-col min-w-0 pr-2">
                      <span class="text-xs font-black text-gray-800 dark:text-white truncate">{{ item.itemName }}</span>
                      <span class="text-[9px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Rencana Beli: {{ item.qtyPurchase }}</span>
                    </div>
                    <span v-if="getInspectionSum(item) === item.qtyPurchase" class="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
                      <Check class="w-3 h-3" /> Pas
                    </span>
                    <span v-else class="inline-flex items-center gap-1 text-[9px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-100 dark:border-red-500/20">
                      <Info class="w-3 h-3" /> {{ getInspectionSum(item) }} / {{ item.qtyPurchase }}
                    </span>
                  </div>
                  <div class="grid grid-cols-4 gap-1.5">
                    <div>
                      <label class="text-[9px] font-bold text-gray-500 uppercase block mb-1 text-center" title="Bagus">Bagus</label>
                      <input type="number" v-model.number="item.qtyAccepted" min="0" class="w-full p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-center rounded-lg outline-none font-bold" />
                    </div>
                    <div>
                      <label class="text-[9px] font-bold text-gray-500 uppercase block mb-1 text-center" title="Refund">Refund</label>
                      <input type="number" v-model.number="item.qtyRefund" min="0" class="w-full p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-center rounded-lg outline-none font-bold" />
                    </div>
                    <div>
                      <label class="text-[9px] font-bold text-gray-500 uppercase block mb-1 text-center" title="Retur">Retur</label>
                      <input type="number" v-model.number="item.qtyRetur" min="0" class="w-full p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-center rounded-lg outline-none font-bold" />
                    </div>
                    <div>
                      <label class="text-[9px] font-bold text-gray-500 uppercase block mb-1 text-center" title="Rusak">Rusak</label>
                      <input type="number" v-model.number="item.qtyDefective" min="0" class="w-full p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-center rounded-lg outline-none font-bold" />
                    </div>
                  </div>
                  <div v-if="item.qtyRefund > 0" class="space-y-1">
                    <label class="text-[9px] font-bold text-gray-500 uppercase block">Nominal Refund Kustom (Rp, opsional)</label>
                    <input type="text" :value="formatThousand(item.refundAmount)" @input="e => { const v = e.target.value; if (v.endsWith(',') || v.endsWith('.')) return; item.refundAmount = parseThousand(v); }" placeholder="Otomatis dari harga satuan" class="w-full p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs rounded-lg outline-none font-bold" />
                  </div>
                  <div v-if="item.qtyRetur > 0" class="space-y-1">
                    <label class="text-[9px] font-bold text-gray-500 uppercase block">Nominal Retur Kustom (Rp, opsional)</label>
                    <input type="text" :value="formatThousand(item.returAmount)" @input="e => { const v = e.target.value; if (v.endsWith(',') || v.endsWith('.')) return; item.returAmount = parseThousand(v); }" placeholder="Otomatis dari harga satuan" class="w-full p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs rounded-lg outline-none font-bold" />
                  </div>
                </div>
              </div>

              <p class="text-[11px] text-gray-500 italic">Unggah bukti selesai (BAST) di kartu Dokumen Pendukung sebelum menyelesaikan purchase.</p>

              <button v-can="'marketing-purchases:update'" @click="doComplete" :disabled="busy" class="btn-primary w-full bg-success-600">Selesaikan Purchase</button>
            </div>

            <!-- Non-Barang/Jasa: tanpa pemeriksaan fisik — cukup metode bayar & bukti transfer -->
            <div v-else-if="detail.status === 'diterima'" class="space-y-4">
              <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30 text-xs font-bold text-orange-800 dark:text-orange-300">
                Pastikan metode bayar &amp; bukti transfer terisi sebelum menyelesaikan pembayaran.
              </div>
              <p class="text-[11px] text-gray-500 italic">Pembayaran jasa diselesaikan tanpa pemeriksaan fisik barang — unggah bukti transfer di kartu Dokumen Pendukung.</p>
              <button v-can="'marketing-purchases:update'" @click="doCompleteJasa" :disabled="busy" class="btn-primary w-full bg-success-600">Selesaikan Pembayaran</button>
            </div>

            <div v-if="['draft', 'diajukan', 'disetujui', 'diterima'].includes(detail.status)" class="pt-3 border-t border-gray-100 dark:border-gray-800">
              <button v-can="'marketing-purchases:update'" @click="showCancel = !showCancel" class="text-xs font-bold text-red-500 hover:underline">Batalkan Purchase</button>
              <div v-if="showCancel" class="mt-2 space-y-2">
                <textarea v-model="cancelReason" rows="2" placeholder="Alasan pembatalan..." class="input-base text-xs"></textarea>
                <button @click="updateStatus('batal')" :disabled="busy || !cancelReason" class="btn-outline w-full text-red-500 border-red-200">Konfirmasi Batal</button>
              </div>
            </div>

            <div v-if="detail.status === 'selesai'" class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle class="w-4 h-4" />
              <span>{{ detail.purchaseType === 'non_barang' ? 'Purchase selesai.' : 'Purchase selesai — stok/aset sudah diperbarui otomatis.' }}</span>
            </div>
            <div v-if="detail.status === 'batal'" class="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 text-xs font-bold space-y-1">
              <div>Dibatalkan: {{ detail.cancelReason }}</div>
              <div v-if="detail.cancelledAt" class="text-[10px] text-red-400">{{ formatDate(detail.cancelledAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Form Modal Dialog -->
    <MarketingPurchaseFormModal
      v-if="detail"
      v-model="showEditModal"
      :purchase-id="detail.id"
      @saved="load"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Badge from '@/components/ui/Badge.vue';
import AuditHistory from '@/components/common/AuditHistory.vue';
import MarketingPurchaseFormModal from './components/MarketingPurchaseFormModal.vue';
import { ArrowLeft, Check, Ticket, Truck, CheckCircle, Edit2, Trash2, Info, Package, ShieldCheck, ShieldAlert, Lock } from 'lucide-vue-next';
import { useMarketingPurchaseStore } from './marketingPurchase.store';
import EvidenceManager from './components/EvidenceManager.vue';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { Alert } from '@/plugins/sweetalert';
import { formatThousand, parseThousand } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import { APPROVAL_TIER_A, PURCHASE_WORKFLOW_STEPS } from './marketingPurchase.constants';

const route = useRoute();
const router = useRouter();
const store = useMarketingPurchaseStore();
const authStore = useAuthStore();
const busy = ref(false);
const showEditModal = ref(false);
const showCancel = ref(false);
const cancelReason = ref('');

const detail = computed(() => store.purchaseDetail);
const isSuperAdmin = computed(() => authStore.user?.is_superadmin === true || authStore.user?.isAdmin === true);

// Sumber tunggal urutan tahapan — dipakai bersama tab strip di index.vue.
const steps = PURCHASE_WORKFLOW_STEPS;

const currentStageIndex = computed(() => {
  if (detail.value?.status === 'batal') return 0;
  return Math.max(0, steps.findIndex((s) => s.key === detail.value?.status));
});

const getStepDate = (key) => {
  if (!detail.value) return null;
  switch (key) {
    case 'draft': return detail.value.createdAt;
    case 'diajukan': return detail.value.submittedAt;
    case 'disetujui': return detail.value.approvedAt;
    case 'diterima': return detail.value.receivedAt;
    case 'selesai': return detail.value.completedAt;
    default: return null;
  }
};

// ── Persetujuan berjenjang (pola sama dengan GA Purchase) ───────────────────

/** Apakah user yang login boleh melakukan aksi persetujuan sekarang? */
const userCanActionApproval = computed(() => {
  if (!detail.value || detail.value.status !== 'diajukan') return false;
  const price = Number(detail.value.priceTotal);
  if (price <= APPROVAL_TIER_A) return authStore.hasPrivilege('marketing-purchases:update');
  return isSuperAdmin.value || authStore.hasPrivilege('marketing-purchases:approve_level_a');
});

/** Label dinamis pada tombol aksi persetujuan */
const approvalButtonText = computed(() => {
  if (!detail.value) return 'Setujui Anggaran';
  return Number(detail.value.priceTotal) <= APPROVAL_TIER_A ? 'Setujui Anggaran' : 'Setujui Pembelian';
});

/** Teks status persetujuan untuk banner */
const approvalRoleText = computed(() => {
  if (!detail.value) return null;
  const price = Number(detail.value.priceTotal);
  if (price <= APPROVAL_TIER_A) return null;

  const aName = detail.value.approvedAEmp?.full_name || '-';
  return detail.value.approvedABy
    ? { type: 'done_a', text: `Disetujui oleh ${aName}` }
    : { type: 'waiting_a', text: 'Menunggu persetujuan' };
});

const statusColor = (s) => ({ draft: 'light', diajukan: 'warning', disetujui: 'info', diterima: 'info', selesai: 'success', batal: 'error' }[s] || 'light');
const purchaseTypeLabel = (t) => ({ barang: 'Barang / Stok', non_barang: 'Non-Barang / Jasa' }[t] || '-');
const paymentLabel = (p) => ({ kas_marketing: 'Kas Marketing', finance: 'Finance' }[p] || '-');
const paymentMethodLabel = (p) => ({ cash: 'Cash', bank: 'Bank Transfer', e_wallet: 'E-Wallet' }[p] || '-');
const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const formatDateSmall = (d) => d ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(d)) : '';

const subtotalRaw = computed(() => (detail.value?.items || []).reduce((s, it) => s + (it.subtotal || 0), 0));
const totalQtyRefund = computed(() => (detail.value?.items || []).reduce((s, it) => s + (it.qtyRefund || 0), 0));
const totalQtyRetur = computed(() => (detail.value?.items || []).reduce((s, it) => s + (it.qtyRetur || 0), 0));
const totalQtyDefective = computed(() => (detail.value?.items || []).reduce((s, it) => s + (it.qtyDefective || 0), 0));
const totalRefundAmount = computed(() => (detail.value?.items || []).reduce((s, it) => s + (it.refundAmount || 0), 0));
const totalReturAmount = computed(() => (detail.value?.items || []).reduce((s, it) => s + (it.returAmount || 0), 0));

const discountAmount = computed(() => {
  if (!detail.value) return 0;
  return detail.value.discountType === 'percent'
    ? (subtotalRaw.value * (detail.value.discountPercent || 0)) / 100
    : (detail.value.discountNominal || 0);
});

const workflowForm = reactive({ dateArrive: '' });
const inspectionItems = ref([]);

// Breakdown Bagus/Refund/Retur/Rusak hanya relevan untuk PO Barang (ada pemeriksaan fisik).
const showBreakdownColumns = computed(() => detail.value?.status === 'selesai' && detail.value?.purchaseType === 'barang');

watch(detail, (d) => {
  if (d?.status === 'diterima' && d.purchaseType === 'barang' && d.items) {
    inspectionItems.value = d.items.map((it) => ({
      id: it.id, itemName: it.goodName, qtyPurchase: it.qtyPurchase, unitPrice: it.unitPrice,
      qtyAccepted: it.qtyPurchase, qtyRefund: 0, qtyRetur: 0, qtyDefective: 0, refundAmount: 0, returAmount: 0,
    }));
  }
}, { immediate: true });

const getInspectionSum = (item) => (Number(item.qtyAccepted) || 0) + (Number(item.qtyRefund) || 0) + (Number(item.qtyRetur) || 0) + (Number(item.qtyDefective) || 0);

const validateInspection = () => {
  for (const item of inspectionItems.value) {
    if (getInspectionSum(item) !== item.qtyPurchase) {
      Alert.error('Validasi Gagal', `Total pemeriksaan untuk "${item.itemName}" (${getInspectionSum(item)}) harus sama dengan Rencana Beli (${item.qtyPurchase}).`);
      return false;
    }
  }
  return true;
};

const load = () => store.fetchDetail(route.params.id).then((d) => {
  workflowForm.dateArrive = d.dateArrive || new Date().toISOString().split('T')[0];
});

const updateStatus = async (status) => {
  let confirmMsg;
  if (status === 'batal') confirmMsg = 'Batalkan purchase ini?';
  else if (status === 'disetujui') confirmMsg = `${approvalButtonText.value} — konfirmasi tindakan ini?`;
  else confirmMsg = `Ubah status ke ${status.toUpperCase()}?`;
  const confirmed = await Alert.confirm('Konfirmasi Status', confirmMsg);
  if (!confirmed) return;

  busy.value = true;
  try {
    const payload = { status };
    if (status === 'diterima') payload.date_arrive = workflowForm.dateArrive;
    if (status === 'batal') payload.cancel_reason = cancelReason.value;
    await store.updateStatus(route.params.id, payload);
    Alert.success('Berhasil', `Status diubah ke ${status}.`);
    showCancel.value = false;
  } catch (error) {
    Alert.error('Gagal', getApiErrorMessage(error));
  } finally {
    busy.value = false;
  }
};

const doComplete = async () => {
  if (!validateInspection()) return;
  const confirmed = await Alert.confirm('Selesaikan Purchase?', 'Stok/aset akan diperbarui otomatis sesuai hasil pemeriksaan.');
  if (!confirmed) return;

  busy.value = true;
  try {
    const items = inspectionItems.value.map((it) => ({
      id: it.id,
      qty_accepted: Number(it.qtyAccepted) || 0,
      qty_refund: Number(it.qtyRefund) || 0,
      qty_retur: Number(it.qtyRetur) || 0,
      qty_defective: Number(it.qtyDefective) || 0,
      ...(it.refundAmount > 0 && { refund_amount: Number(it.refundAmount) }),
      ...(it.returAmount > 0 && { retur_amount: Number(it.returAmount) }),
    }));
    await store.updateStatus(route.params.id, { status: 'selesai', items });
    Alert.success('Berhasil', 'Purchase selesai — stok/aset diperbarui.');
  } catch (error) {
    Alert.error('Gagal', getApiErrorMessage(error));
  } finally {
    busy.value = false;
  }
};

const doCompleteJasa = async () => {
  const confirmed = await Alert.confirm('Selesaikan Pembayaran?', 'Pengajuan terkait akan otomatis ikut ditandai selesai.');
  if (!confirmed) return;

  busy.value = true;
  try {
    await store.updateStatus(route.params.id, { status: 'selesai' });
    Alert.success('Berhasil', 'Pembayaran jasa selesai.');
  } catch (error) {
    Alert.error('Gagal', getApiErrorMessage(error));
  } finally {
    busy.value = false;
  }
};

const handleHardDelete = async () => {
  const confirmed = await Alert.confirm('Hard Delete Purchase?', 'Khusus Superadmin: transaksi berstatus Selesai ini akan dihapus permanen. Stok barang temporary akan di-rollback otomatis secara transaksional.');
  if (!confirmed) return;
  try {
    await store.hardDeletePurchase(detail.value.id);
    Alert.success('Berhasil', 'Purchase berhasil di-hard delete dan stok telah di-rollback.');
    router.push({ name: 'MarketingPurchaseList' });
  } catch (error) {
    Alert.error('Gagal Hard Delete', getApiErrorMessage(error));
  }
};

onMounted(load);
</script>

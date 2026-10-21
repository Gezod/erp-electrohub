<template>
  <AdminLayout>
    <div v-if="detail" class="max-w-(--breakpoint-2xl) mx-auto space-y-6 pb-20">
      
      <!-- Top Navigation & Actions -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div class="flex items-center gap-4">
          <router-link :to="{ name: 'TranPurchases' }" class="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition">
            <ArrowLeft class="w-5 h-5 text-gray-400" />
          </router-link>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-xl font-bold text-gray-800 dark:text-white">{{ detail.code }}</h1>
              <Badge :color="getStatusColor(detail.status)" class="uppercase text-[9px] font-black px-3 py-1">
                {{ detail.status }}
              </Badge>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">
              Dibuat: {{ formatDateFull(detail.createdAt) }}
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <button v-if="['draft', 'diajukan'].includes(detail.status)" @click="showEditModal = true" class="btn-outline px-6 py-2.5 flex items-center gap-2 cursor-pointer">
            <Edit2 class="w-4 h-4" /> <span>Edit Pembelian</span>
          </button>
          <button v-if="detail.status === 'draft'" @click="handleDelete" class="btn-outline px-6 py-2.5 text-red-500 hover:bg-red-50 border-red-100 cursor-pointer">
            <Trash2 class="w-4 h-4" />
          </button>
          <button v-if="isSuperAdmin && detail.status === 'selesai'" @click="handleHardDelete" class="btn-outline px-6 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 flex items-center gap-2 font-bold cursor-pointer">
            <Trash2 class="w-4 h-4" /> <span>Hard Delete</span>
          </button>
        </div>

      </div>

      <!-- Workflow Stepper -->
      <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div class="relative flex justify-between items-center max-w-4xl mx-auto">
          <!-- Connector Line -->
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-0"></div>
          <div 
            class="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500 transition-all duration-500 -z-0"
            :style="{ width: `${(currentStageIndex / (steps.length - 1)) * 100}%` }"
          ></div>

          <!-- Step Items -->
          <div 
            v-for="(step, idx) in steps" :key="step.key"
            class="relative z-10 flex flex-col items-center gap-3 bg-white dark:bg-gray-900 px-4"
          >
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
              :class="[
                idx <= currentStageIndex 
                  ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' 
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300'
              ]"
            >
              <Check v-if="idx < currentStageIndex" class="w-5 h-5" />
              <component v-else :is="step.icon" class="w-5 h-5" />
            </div>
            <div class="flex flex-col items-center">
              <span class="text-[10px] font-black uppercase tracking-widest" :class="idx <= currentStageIndex ? 'text-gray-800 dark:text-white' : 'text-gray-400'">{{ step.label }}</span>
              <span v-if="getStepDate(step.key)" class="text-[8px] text-brand-500 font-bold mt-0.5">{{ formatDateSmall(getStepDate(step.key)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Main Content -->
        <div :class="detail.status === 'selesai' || detail.status === 'batal' ? 'lg:col-span-5 space-y-6' : 'lg:col-span-3 space-y-6'">
          
          <!-- Header Details Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div class="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <Ticket class="w-3.5 h-3.5" />
                <span>Informasi Dasar</span>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Sumber:</span>
                  <span class="text-xs font-bold text-gray-800 dark:text-white uppercase">{{ detail.sourceType.replace('_', ' ') }}</span>
                </div>
                <div v-if="detail.requestCode" class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Tiket Ref:</span>
                  <router-link :to="{ name: 'RequestDetail', params: { id: detail.requestId } }" class="text-xs font-bold text-brand-600 hover:underline">
                    {{ detail.requestCode }}
                  </router-link>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Tipe Pembelian:</span>
                  <div class="flex items-center gap-1.5">
                    <Badge color="light" class="text-[9px] font-bold uppercase">{{ detail.purchaseType }}</Badge>
                    <Badge :color="detail.tipe && detail.tipe !== 'biasa' ? 'warning' : 'light'" class="text-[9px] font-bold uppercase">
                      {{ PURCHASE_TIPE_OPENING_LABEL[detail.tipe] || 'Reguler' }}
                    </Badge>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Lokasi:</span>
                  <span class="text-xs font-bold text-gray-800 dark:text-white">{{ detail.location?.location_name || '-' }}</span>
                </div>
                <div v-if="detail.notes" class="flex justify-between items-start gap-4">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400 font-sans shrink-0">Keterangan:</span>
                  <span class="text-xs font-bold text-gray-800 dark:text-white text-right whitespace-pre-line">{{ detail.notes }}</span>
                </div>
                <div v-if="detail.approvedANote || detail.approvedBNote" class="flex justify-between items-start gap-4">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400 font-sans shrink-0">Keterangan Approval:</span>
                  <span class="text-xs font-bold text-gray-800 dark:text-white text-right whitespace-pre-line">
                    <template v-if="detail.approvedBNote">Level A: {{ detail.approvedANote || '-' }}<br>Level B: {{ detail.approvedBNote }}</template>
                    <template v-else>{{ detail.approvedANote }}</template>
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div class="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <Truck class="w-3.5 h-3.5" />
                <span>Logistik & Pembayaran</span>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Vendor/Toko:</span>
                  <span class="text-xs font-bold text-gray-800 dark:text-white">{{ detail.vendorName || '-' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Pembayaran:</span>
                  <span class="text-xs font-bold text-brand-600 uppercase">{{ detail.payment || '-' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Metode Bayar:</span>
                  <Badge color="light" class="text-[9px] font-bold uppercase">{{ detail.paymentMethod || '-' }}</Badge>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Tgl Beli:</span>
                  <span class="text-xs font-bold text-gray-800 dark:text-white">{{ formatDate(detail.datePurchase) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Estimasi Tiba:</span>
                  <span class="text-xs font-bold text-gray-800 dark:text-white">{{ formatDate(detail.dateArrive) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-600 dark:text-gray-400">Dokumen Pendukung:</span>
                  <span class="text-xs font-bold text-gray-800 dark:text-white">{{ detail.evidences.length }} berkas</span>
                </div>
              </div>
            </div>
          </div>

          <!-- COMPARISON SUMMARY CARDS (Before vs After) -->
          <div v-if="detail.status === 'selesai'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- BEFORE CARD -->
            <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-brand-500/10 shadow-xl space-y-5 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div class="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-bl-full pointer-events-none"></div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="p-2.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                    <ShoppingCart class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Rencana Awal</h3>
                    <p class="text-sm font-bold text-gray-800 dark:text-white">Sebelum Penyesuaian</p>
                  </div>
                </div>
                <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700">Before</span>
              </div>
              <div class="pt-2">
                <div class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-0.5">Total Rencana Beli Bersih</div>
                <div class="text-2xl font-black text-gray-800 dark:text-white">Rp {{ formatNumber(detail.priceTotal) }}</div>
              </div>
              <div class="pt-3 border-t border-gray-50 dark:border-gray-800 space-y-2 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-gray-500">Total Kuantitas Rencana:</span>
                  <span class="font-bold text-gray-700 dark:text-gray-300">{{ sumOfQtyPurchase }} unit</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-500">Subtotal Kotor Barang:</span>
                  <span class="font-semibold text-gray-700 dark:text-gray-300">Rp {{ formatNumber(detail.items?.reduce((s, it) => s + (it.subtotal_discounted || 0), 0) || 0) }}</span>
                </div>
                <div class="flex justify-between items-center" v-if="detail.discountType === 'nominal' ? detail.discountNominal > 0 : detail.discountPercent > 0">
                  <span class="text-gray-500">Diskon Global:</span>
                  <span class="font-semibold text-red-500 font-bold" v-if="detail.discountType === 'percent'">-{{ detail.discountPercent }}%</span>
                  <span class="font-semibold text-red-500 font-bold" v-else>-Rp {{ formatNumber(detail.discountNominal) }}</span>
                </div>
                <div class="flex justify-between items-center" v-if="detail.shippingCost > 0">
                  <span class="text-gray-500">Biaya Ongkir:</span>
                  <span class="font-semibold text-gray-700 dark:text-gray-300">Rp {{ formatNumber(detail.shippingCost) }}</span>
                </div>
                <div class="flex justify-between items-center" v-if="detail.packagingCost > 0">
                  <span class="text-gray-500">Biaya Packing/Lainnya:</span>
                  <span class="font-semibold text-gray-700 dark:text-gray-300">Rp {{ formatNumber(detail.packagingCost) }}</span>
                </div>
              </div>
            </div>

            <!-- AFTER CARD -->
            <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-emerald-500/10 shadow-xl space-y-5 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <CheckCircle class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">Realisasi Fisik</h3>
                    <p class="text-sm font-bold text-gray-800 dark:text-white">Hasil Setelah Penyesuaian</p>
                  </div>
                </div>
                <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-200 dark:border-emerald-500/20 animate-pulse">After</span>
              </div>
              <div class="pt-2">
                <div class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">Total Bersih Riil Aktual</div>
                <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400">Rp {{ formatNumber(grandTotalAfterAdjustment) }}</div>
              </div>
              <div class="pt-3 border-t border-gray-50 dark:border-gray-800 space-y-2 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-gray-500">Barang Bagus Diterima:</span>
                  <span class="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">{{ sumOfQtyAccepted }} unit</span>
                </div>
                <div class="flex justify-between items-center" v-if="sumOfQtyRefund > 0">
                  <span class="text-gray-500">Barang Kosong (Refund):</span>
                  <span class="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-100 dark:border-red-500/20">{{ sumOfQtyRefund }} unit</span>
                </div>
                <div class="flex justify-between items-center" v-if="sumOfQtyRetur > 0">
                  <span class="text-gray-500">Barang Ditukar (Retur):</span>
                  <span class="font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-500/20 animate-pulse">{{ sumOfQtyRetur }} unit</span>
                </div>
                <div class="flex justify-between items-center" v-if="sumOfQtyDefective > 0">
                  <span class="text-gray-500">Barang Rusak/Cacat:</span>
                  <span class="font-bold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">{{ sumOfQtyDefective }} unit</span>
                </div>
                <div class="flex justify-between items-center pt-1 border-t border-dashed border-gray-100 dark:border-gray-800" v-if="sumOfRefundAmount > 0">
                  <span class="font-bold text-gray-700 dark:text-gray-300">Total Refund Kas:</span>
                  <span class="font-black text-emerald-600 dark:text-emerald-400">Rp {{ formatNumber(sumOfRefundAmount) }}</span>
                </div>
                <div class="flex justify-between items-center pt-1 border-t border-dashed border-gray-100 dark:border-gray-800" v-if="sumOfReturAmount > 0">
                  <span class="font-bold text-gray-700 dark:text-gray-300">Total Retur Kas:</span>
                  <span class="font-black text-orange-600 dark:text-orange-400">Rp {{ formatNumber(sumOfReturAmount) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- TABLES LAYOUT: Dual-Table for Selesai Status, Single-Table for Active Statuses -->
          <div v-if="detail.status === 'selesai'" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- BEFORE TABLE CARD -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div class="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2">
                  <ShoppingCart class="w-5 h-5 text-brand-500" />
                  <h2 class="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight">Rencana Beli Awal (Before)</h2>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <th class="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Item</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">Qty</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">Harga</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                      <tr v-for="item in detail.items" :key="'before-' + item.id">
                        <td class="px-6 py-4">
                          <div class="text-xs font-bold text-gray-800 dark:text-white">{{ item.itemName }}</div>
                          <div v-if="item.good" class="text-[8px] text-gray-400 uppercase">{{ item.good.merk || '-' }} | {{ item.good.good_code }}</div>
                        </td>
                        <td class="px-6 py-4 text-center">
                          <span class="text-xs font-bold text-gray-600 dark:text-gray-300">{{ item.qtyPurchase }}</span>
                        </td>
                        <td class="px-6 py-4 text-right text-xs text-gray-500">
                          <div class="font-semibold text-gray-800 dark:text-gray-200">Rp {{ formatNumber(item.unitPrice) }}</div>
                        </td>
                        <td class="px-6 py-4 text-right text-xs text-gray-500">
                          <span class="text-xs font-bold text-brand-600">Rp {{ formatNumber(item.subtotal) }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total Rencana Awal</span>
                <span class="text-sm font-bold text-gray-600 dark:text-gray-400">Rp {{ formatNumber(detail.priceTotal) }}</span>
              </div>
            </div>

            <!-- AFTER TABLE CARD -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-emerald-500/10 dark:border-emerald-800/30 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div class="p-6 border-b border-gray-50 dark:border-emerald-800/30 flex items-center gap-2">
                  <CheckCircle class="w-5 h-5 text-emerald-500" />
                  <h2 class="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Realisasi Penerimaan (After)</h2>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-emerald-50/10 dark:bg-emerald-500/5 border-b border-emerald-100 dark:border-emerald-800/30">
                        <th class="px-6 py-4 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Item / Realisasi</th>
                        <th class="px-6 py-4 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-center">Bagus</th>
                        <th class="px-6 py-4 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-right">HPP Akhir</th>
                        <th class="px-6 py-4 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                      <tr v-for="item in detail.items" :key="'after-' + item.id">
                        <td class="px-6 py-4">
                          <div class="text-xs font-bold text-gray-800 dark:text-white">{{ item.itemName }}</div>
                          <!-- Breakdown Badges for completed purchase -->
                          <div class="mt-1 flex flex-wrap gap-1">
                            <span class="text-[7px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-100 dark:border-emerald-500/20">
                              Diterima: {{ item.qtyAccepted }}
                            </span>
                            <span v-if="item.qtyRefund > 0" class="text-[7px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.2 rounded border border-red-100 dark:border-red-500/20">
                              Refund: {{ item.qtyRefund }}
                            </span>
                            <span v-if="item.qtyRetur > 0" class="text-[7px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-100 dark:border-orange-500/20">
                              Retur: {{ item.qtyRetur }}
                            </span>
                            <span v-if="item.qtyDefective > 0" class="text-[7px] font-bold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.2 rounded border border-gray-200 dark:border-gray-700">
                              Rusak: {{ item.qtyDefective }}
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-center">
                          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">{{ item.qtyAccepted }}</span>
                        </td>
                        <td class="px-6 py-4 text-right text-xs text-gray-500">
                          <div class="font-semibold text-emerald-600 dark:text-emerald-400">Rp {{ formatNumber(item.unitPriceFinal) }}</div>
                        </td>
                        <td class="px-6 py-4 text-right text-xs text-gray-500">
                          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Rp {{ formatNumber(item.subTotalFinal) }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="p-6 bg-emerald-50/10 dark:bg-emerald-500/5 border-t border-emerald-100 dark:border-emerald-800/30 flex justify-between items-center">
                <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Akhir Bersih Aktual</span>
                <span class="text-lg font-black text-emerald-600 dark:text-emerald-400">Rp {{ formatNumber(grandTotalAfterAdjustment) }}</span>
              </div>
            </div>
          </div>

          <!-- Standard Items Table (For non-completed statuses: draft, diajukan, disetujui, diterima) -->
          <div v-else class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2">
              <ShoppingCart class="w-5 h-5 text-brand-500" />
              <h2 class="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight">Detail Item Pembelian</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th class="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Item / Barang</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">Qty</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">Harga Satuan</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                  <tr v-for="item in detail.items" :key="item.id">
                    <td class="px-6 py-4">
                      <div class="text-sm font-bold text-gray-800 dark:text-white">{{ item.itemName }}</div>
                      <div v-if="item.good" class="text-[9px] text-gray-400 uppercase">{{ item.good.merk || '-' }} | {{ item.good.good_code }} | {{ item.good.category?.name_category }}</div>
                      <div v-if="item.assets.length" class="mt-2 flex flex-wrap gap-1">
                        <span v-for="ast in item.assets" :key="ast.id" class="text-[8px] bg-brand-50 dark:bg-brand-500/10 text-brand-600 px-1.5 py-0.5 rounded border border-brand-100 dark:border-brand-500/20">
                          {{ ast.code_asset }}
                        </span>
                      </div>

                      <!-- Breakdown Badges for completed purchase -->
                      <div v-if="detail.completedAt || detail.status === 'selesai'" class="mt-2.5 flex flex-wrap gap-1.5">
                        <span class="inline-flex items-center gap-0.5 text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
                          Diterima: {{ item.qtyAccepted }}
                        </span>
                        <span v-if="item.qtyRefund > 0" class="inline-flex items-center gap-0.5 text-[8px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-100 dark:border-red-500/20">
                          Refund: {{ item.qtyRefund }}
                        </span>
                        <span v-if="item.qtyRetur > 0" class="inline-flex items-center gap-0.5 text-[8px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-500/20 animate-pulse">
                          Retur: {{ item.qtyRetur }}
                        </span>
                        <span v-if="item.qtyDefective > 0" class="inline-flex items-center gap-0.5 text-[8px] font-black text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                          Rusak: {{ item.qtyDefective }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="text-sm font-bold text-gray-600 dark:text-gray-300">{{ item.qtyPurchase }}</span>
                    </td>
                    <td class="px-6 py-4 text-right text-xs text-gray-500">
                      <!-- Unit Price -->
                      <div class="font-semibold text-gray-800 dark:text-gray-200">Rp {{ formatNumber(item.unitPrice) }}</div>
                      
                      <!-- Real-time effective HPP preview during inspection -->
                      <div v-if="detail.status === 'diterima' && getInspectionItem(item.id)" class="text-[9px] font-semibold text-brand-600 dark:text-brand-400 mt-1" title="Estimasi HPP Baru">
                        ➔ Rp {{ formatNumber(getEffectiveUnitPrice(getInspectionItem(item.id))) }}
                      </div>
                      <!-- Saved actual HPP after completion -->
                      <div v-else-if="detail.status === 'selesai' && (item.qtyRefund > 0 || item.qtyRetur > 0 || item.qtyDefective > 0 || item.refundAmount > 0)" class="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1" title="HPP Akhir Setelah Penyesuaian">
                        ➔ Rp {{ formatNumber(item.unitPriceFinal) }} <span class="text-[7px] font-black uppercase text-gray-400 tracking-tight">(HPP Akhir)</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <!-- Subtotal -->
                      <span class="text-sm font-black text-brand-600">Rp {{ formatNumber(item.subtotal) }}</span>

                      <!-- Real-time net cost preview during inspection -->
                      <div v-if="detail.status === 'diterima' && getInspectionItem(item.id)" class="text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-0.5" title="Estimasi Total Baru">
                        ➔ Rp {{ formatNumber(getNetTotalCost(getInspectionItem(item.id))) }}
                      </div>
                      <!-- Saved actual net cost after completion -->
                      <div v-else-if="detail.status === 'selesai' && (item.qtyRefund > 0 || item.qtyRetur > 0 || item.qtyDefective > 0 || item.refundAmount > 0)" class="text-[9px] font-bold text-gray-500 dark:text-gray-400 mt-0.5" title="Total Akhir Setelah Penyesuaian">
                        ➔ Rp {{ formatNumber(item.subTotalFinal) }}
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <!-- Row 1: Total Rencana Beli Awal -->
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-800/10">
                    <td colspan="3" class="px-6 py-3.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Total Rencana Awal
                    </td>
                    <td class="px-6 py-3.5 text-right">
                      <span class="text-sm font-bold text-gray-500 dark:text-gray-400">Rp {{ formatNumber(detail.priceTotal) }}</span>
                    </td>
                  </tr>
                  <!-- Row 2: Total Akhir Aktual Setelah Penyesuaian (Hanya muncul jika ada penyesuaian/status pemeriksaan) -->
                  <tr v-if="(detail.status === 'diterima' && inspectionItems.length > 0) || (detail.status === 'selesai' && detail.items.some(it => it.qtyRefund > 0 || it.qtyRetur > 0 || it.qtyDefective > 0 || it.refundAmount > 0))" class="bg-emerald-50/30 dark:bg-emerald-500/5">
                    <td colspan="3" class="px-6 py-4 text-right text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      {{ detail.status === 'diterima' ? 'Estimasi Total Akhir Bersih' : 'Total Akhir Bersih Aktual' }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="text-lg font-black text-emerald-600 dark:text-emerald-400">Rp {{ formatNumber(grandTotalAfterAdjustment) }}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Action Results (Stock/Asset Info) -->
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
        </div>

        <!-- Right Side: Action Center & Logs -->
        <div :class="detail.status === 'selesai' || detail.status === 'batal' ? 'lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-6' : 'lg:col-span-2 space-y-6'">
          
          <!-- ACTION CENTER -->
          <div v-if="!detail.completedAt && detail.status !== 'selesai' && detail.status !== 'batal'" class="bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-brand-500/10 shadow-xl space-y-6">
            <div class="flex items-center gap-2">
              <Play class="w-5 h-5 text-brand-500" />
              <h2 class="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">Action Center</h2>
            </div>

            <!-- Contextual Actions based on status -->
            <div class="space-y-4">
              <div v-if="detail.status === 'draft'" class="space-y-3">
                <p class="text-xs text-gray-700 dark:text-gray-300 font-bold leading-relaxed">Draft pembelian sudah selesai? Ajukan untuk mendapatkan persetujuan anggaran.</p>
                <button @click="updateStatus('diajukan')" class="w-full btn-primary py-3 bg-brand-500">Ajukan Sekarang</button>
              </div>

              <!-- DIAJUKAN -> DISETUJUI -->
              <div v-if="detail.status === 'diajukan'" class="space-y-4">

                <!-- Tiered Approval Status Banner -->
                <div v-if="approvalRoleText" class="rounded-xl border p-3 flex items-start gap-2.5"
                  :class="{
                    'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40': approvalRoleText.type === 'waiting_a' || approvalRoleText.type === 'waiting_b',
                    'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40': approvalRoleText.type === 'done_a' || approvalRoleText.type === 'done_both',
                  }"
                >
                  <ShieldCheck v-if="approvalRoleText.type === 'done_a' || approvalRoleText.type === 'done_both'" class="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                  <ShieldAlert v-else class="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                  <div>
                    <p class="text-xs font-bold uppercase tracking-wider"
                      :class="{
                        'text-amber-700 dark:text-amber-400': approvalRoleText.type === 'waiting_a' || approvalRoleText.type === 'waiting_b',
                        'text-emerald-700 dark:text-emerald-400': approvalRoleText.type === 'done_a' || approvalRoleText.type === 'done_both',
                      }"
                    >Status Persetujuan</p>
                    <p class="text-xs font-bold mt-0.5"
                      :class="{
                        'text-amber-700 dark:text-amber-300': approvalRoleText.type === 'waiting_a' || approvalRoleText.type === 'waiting_b',
                        'text-emerald-700 dark:text-emerald-300': approvalRoleText.type === 'done_a' || approvalRoleText.type === 'done_both',
                      }"
                    >{{ approvalRoleText.text }}</p>
                    <p v-if="detail.approvedANote" class="text-[11px] font-medium font-sans mt-1 opacity-90 whitespace-pre-line">Ket. Level A: {{ detail.approvedANote }}</p>
                    <p v-if="detail.approvedBNote" class="text-[11px] font-medium font-sans mt-0.5 opacity-90 whitespace-pre-line">Ket. Level B: {{ detail.approvedBNote }}</p>
                  </div>
                </div>

                <!-- Locked: user doesn't have permission -->
                <div v-if="!userCanActionApproval" class="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 flex items-center gap-3">
                  <Lock class="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Akses Tidak Cukup</p>
                    <p class="text-xs font-bold text-gray-600 dark:text-gray-400 mt-0.5">Anda tidak memiliki hak akses untuk menyetujui transaksi dengan nominal ini.</p>
                  </div>
                </div>

                <template v-if="userCanActionApproval">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-sans mb-1">
                      Keterangan Approval <span class="font-normal normal-case text-gray-400">(opsional)</span>
                    </label>
                    <textarea v-model="workflowForm.approvalNote" rows="2" placeholder="Catatan atas persetujuan ini..."
                      class="w-full p-3 text-xs bg-gray-50 dark:bg-gray-800 border-0 rounded-xl outline-none"></textarea>
                  </div>
                  <button @click="updateStatus('disetujui')" class="w-full btn-primary py-3 bg-brand-600 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10">
                    <ShieldCheck class="w-4 h-4" />
                    <span>{{ approvalButtonText }}</span>
                  </button>
                </template>
              </div>

              <!-- DISETUJUI -> DITERIMA -->
              <div v-if="detail.status === 'disetujui'" class="space-y-4">
                <p class="text-xs text-gray-700 dark:text-gray-300 font-bold leading-relaxed">Konfirmasi jika barang/jasa sudah diterima di lokasi.</p>
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Tanggal Tiba</label>
                  <DatePicker v-model="workflowForm.dateArrive" />
                </div>
                <p class="text-[10px] text-gray-400 leading-relaxed">
                  Dokumen pendukung dikelola pada kartu <strong>Dokumen Pendukung</strong> di bawah — tersimpan langsung, terpisah dari perubahan status.
                </p>
                <button @click="updateStatus('diterima')" class="w-full btn-primary py-3 bg-orange-500">Konfirmasi Terima</button>
              </div>

              <!-- DITERIMA -> SELESAI -->
              <div v-if="detail.status === 'diterima'" class="space-y-4">
                <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30 text-xs font-bold text-orange-800 dark:text-orange-300">
                  <strong>Pemeriksaan Fisik:</strong> Isi jumlah breakdown fisik barang untuk menyelesaikan transaksi pembelian.
                </div>

                <!-- Physical Inspection Form -->
                <div class="space-y-3 pt-2">
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1">Pemeriksaan Fisik Barang</label>
                  
                  <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    <div v-for="item in inspectionItems" :key="item.id" class="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-800 rounded-xl space-y-4 shadow-sm">
                      <div class="flex justify-between items-start">
                        <div class="flex flex-col min-w-0 pr-2">
                          <span class="text-sm font-black text-gray-800 dark:text-white truncate" :title="item.itemName">{{ item.itemName }}</span>
                          <span class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Rencana Beli: {{ item.qtyPurchase }}</span>
                        </div>
                        <!-- Real-time validator comparison badge -->
                        <div class="shrink-0">
                          <span v-if="getInspectionSum(item) === item.qtyPurchase" class="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
                            <Check class="w-3.5 h-3.5" /> Pas
                          </span>
                          <span v-else class="inline-flex items-center gap-1 text-[9px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-100 dark:border-red-500/20 animate-pulse">
                            <Info class="w-3.5 h-3.5" /> {{ getInspectionSum(item) }} / {{ item.qtyPurchase }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="grid grid-cols-4 gap-2">
                        <div>
                          <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-1 text-center truncate" title="Diterima (Bagus)">Bagus</label>
                          <input type="number" v-model.number="item.qtyAccepted" min="0" class="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-center rounded-xl outline-none font-black text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500" />
                        </div>
                        <div>
                          <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-1 text-center truncate" title="Refund (Vendor)">Refund</label>
                          <input type="number" v-model.number="item.qtyRefund" @input="item.refundAmount = item.qtyRefund * item.unitPrice" min="0" class="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-center rounded-xl outline-none font-black text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500" />
                        </div>
                        <div>
                          <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-1 text-center truncate" title="Retur (Tukar)">Retur</label>
                          <input type="number" v-model.number="item.qtyRetur" @input="item.returAmount = item.qtyRetur * item.unitPrice" min="0" class="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-center rounded-xl outline-none font-black text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500" />
                        </div>
                        <div>
                          <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-1 text-center truncate" title="Rusak (Ikhlas)">Rusak</label>
                          <input type="number" v-model.number="item.qtyDefective" min="0" class="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-center rounded-xl outline-none font-black text-gray-900 dark:text-white focus:ring-1 focus:ring-brand-500" />
                        </div>
                      </div>

                      <!-- Custom Refund Amount Input -->
                      <div v-if="item.qtyRefund > 0" class="space-y-1.5 mt-2">
                        <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block tracking-wider mb-1">Nominal Refund Kustom (Rp)</label>
                        <div class="relative">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-black">Rp</span>
                          <input 
                            type="text" 
                            :value="formatNumberInput(item.refundAmount)" 
                            @input="item.refundAmount = parseNumberInput($event.target.value)" 
                            placeholder="Contoh: 15.000" 
                            class="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-brand-500" 
                          />
                        </div>
                      </div>
 
                      <!-- Custom Retur Amount Input -->
                      <div v-if="item.qtyRetur > 0" class="space-y-1.5 mt-2">
                        <label class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block tracking-wider mb-1">Nominal Retur Kustom (Rp)</label>
                        <div class="relative">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-black">Rp</span>
                          <input 
                            type="text" 
                            :value="formatNumberInput(item.returAmount)" 
                            @input="item.returAmount = parseNumberInput($event.target.value)" 
                            placeholder="Contoh: 15.000" 
                            class="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-brand-500" 
                          />
                        </div>
                      </div>

                      <!-- Premium Real-time Cost Preview Card -->
                      <div class="mt-3 p-3 bg-brand-50/20 dark:bg-brand-500/5 rounded-xl border border-brand-100/10 text-[10.5px] space-y-1.5">
                        <div class="flex justify-between text-xs text-gray-600 dark:text-gray-300 font-bold">
                          <span>Harga Satuan:</span>
                          <span class="font-black text-gray-750 dark:text-gray-300">
                            Rp {{ formatNumber(item.unitPrice) }} 
                            <span class="text-brand-500 mx-1">➔</span> 
                            <span class="text-brand-600 dark:text-brand-400">Rp {{ formatNumber(getEffectiveUnitPrice(item)) }} <span class="text-[8px] font-black uppercase text-gray-400 tracking-tighter">(HPP Baru)</span></span>
                          </span>
                        </div>
                        <div class="flex justify-between text-xs text-gray-600 dark:text-gray-300 font-bold">
                          <span>Total Bersih:</span>
                          <span class="font-black text-gray-750 dark:text-gray-300">
                            Rp {{ formatNumber(item.qtyPurchase * item.unitPrice) }} 
                            <span class="text-brand-500 mx-1">➔</span> 
                            <span class="text-brand-600 dark:text-brand-400">Rp {{ formatNumber(getNetTotalCost(item)) }}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- BAST: dikelola lewat kartu Dokumen Pendukung -->
                <div class="space-y-1.5 pt-2">
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Bukti Selesai (BAST)</label>
                  <div class="flex items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-150 dark:border-gray-800">
                    <span class="text-[11px] font-bold" :class="doneEvidenceCount ? 'text-gray-800 dark:text-white' : 'text-gray-400'">
                      {{ doneEvidenceCount }} dokumen terunggah
                    </span>
                    <button
                      type="button"
                      @click="scrollToEvidence"
                      class="flex items-center gap-1 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-lg text-[10px] font-bold transition"
                    >
                      <Upload class="w-3 h-3" />
                      <span>Tambah Dokumen</span>
                    </button>
                  </div>
                </div>

                <button @click="updateStatus('selesai')" class="w-full btn-primary py-3 bg-success-600 mt-4">Selesaikan Transaksi</button>
              </div>

              <!-- CANCEL ACTION (Everywhere except Selesai/Batal) -->
              <div v-if="detail.status !== 'selesai' && detail.status !== 'batal'" class="pt-4 border-t border-gray-50 dark:border-gray-800">
                <div class="space-y-3">
                  <textarea v-model="workflowForm.cancelReason" placeholder="Alasan pembatalan..." class="w-full p-3 text-xs bg-gray-50 dark:bg-gray-800 border-0 rounded-xl outline-none" rows="2"></textarea>
                  <button @click="updateStatus('batal')" class="w-full btn-outline py-2.5 text-red-500 border-red-50 hover:bg-red-50">Batalkan Transaksi</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Supporting Documents -->
          <div id="evidence-manager">
            <EvidenceManager
              :purchase-id="detail.id"
              :evidences="detail.evidences"
              :disabled="detail.status === 'batal' || !authStore.hasPrivilege('purchases:update')"
            />
          </div>

        </div>
      </div>

      <!-- Audit History (Satu Baris Penuh di Bawah Sendiri) -->
      <div v-if="detail" class="mt-6">
        <AuditHistory module="PURCHASE_HEADER" :recordId="detail.id" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex flex-col items-center justify-center min-h-[500px] space-y-4">
      <div class="animate-spin h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full font-bold"></div>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Memuat Detail Pembelian...</p>
    </div>
    <!-- Purchase Form Modal for Editing -->
    <PurchaseFormModal
      v-model="showEditModal"
      :purchase-id="detail?.id"
      @saved="purchaseStore.fetchDetail(route.params.id)"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePurchaseStore } from './purchase.store';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Badge from '@/components/ui/Badge.vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import AuditHistory from '@/components/common/AuditHistory.vue';
import EvidenceManager from './components/EvidenceManager.vue';
import PurchaseFormModal from './components/PurchaseFormModal.vue';
import { PURCHASE_TIPE_OPENING_LABEL } from './purchase.constants';
import { Alert } from '@/plugins/sweetalert';
import { formatThousand, parseThousand } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import { APPROVAL_TIER_A, APPROVAL_TIER_B, PURCHASE_WORKFLOW_STEPS } from './purchase.constants';
import {
  ArrowLeft, Edit2, Trash2, Check,
  Ticket, Truck, ShoppingCart, Package, Play, CheckCircle,
  FileCheck, Wallet, Clock, Send, Upload, X, RotateCcw, DollarSign,
  ShieldCheck, ShieldAlert, Lock
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();
const detail = computed(() => purchaseStore.purchaseDetail);
const showEditModal = ref(false);

const STEP_ICONS = { draft: Edit2, diajukan: Send, disetujui: Wallet, diterima: Truck, selesai: CheckCircle };
const steps = PURCHASE_WORKFLOW_STEPS.map((s) => ({ ...s, icon: STEP_ICONS[s.key] }));

const currentStageIndex = computed(() => {
  if (!detail.value) return 0;
  if (detail.value.status === 'batal') return -1;
  const idx = steps.findIndex(s => s.key === detail.value.status);
  return idx >= 0 ? idx : 0;
});

const hasAdditionalCosts = computed(() => {
  if (!detail.value) return false;
  return (detail.value.discountPercent > 0) || (detail.value.shippingCost > 0) || (detail.value.packagingCost > 0);
});

// ── Tiered Approval Computed Properties ─────────────────────────────────────

const isSuperAdmin = computed(() => authStore.user?.is_superadmin === true || authStore.user?.isAdmin === true);

/** Nominal batas untuk tiered approval — lihat ./purchase.constants.js */

/** True jika transaksi sedang menunggu persetujuan Level A */
const isAwaitingApprovalA = computed(() => {
  if (!detail.value) return false;
  return detail.value.status === 'diajukan'
    && Number(detail.value.priceTotal) > APPROVAL_TIER_A
    && !detail.value.approvedABy;
});

/** True jika transaksi sudah disetujui Level A dan menunggu Level B */
const isAwaitingApprovalB = computed(() => {
  if (!detail.value) return false;
  return detail.value.status === 'diajukan'
    && Number(detail.value.priceTotal) > APPROVAL_TIER_B
    && !!detail.value.approvedABy
    && !detail.value.approvedBBy;
});

/**
 * Apakah user yang sedang login dapat melakukan aksi persetujuan sekarang?
 * Menghitung berdasarkan nominal, status approval saat ini, dan privilege user.
 */
const userCanActionApproval = computed(() => {
  if (!detail.value || detail.value.status !== 'diajukan') return false;
  const price = Number(detail.value.priceTotal);

  if (price <= APPROVAL_TIER_A) {
    // Standard: anyone with edit access
    return authStore.hasPrivilege('purchases:update');
  }

  if (price <= APPROVAL_TIER_B) {
    // Level A required
    return isSuperAdmin.value || authStore.hasPrivilege('purchases:approve_level_a');
  }

  // > 5jt berjenjang
  if (!detail.value.approvedABy) {
    // Belum disetujui Level A — butuh privilege A atau superadmin
    return isSuperAdmin.value || authStore.hasPrivilege('purchases:approve_level_a');
  } else {
    // Sudah disetujui Level A — butuh privilege B atau superadmin
    return isSuperAdmin.value || authStore.hasPrivilege('purchases:approve_level_b');
  }
});

/** Label teks dinamis pada tombol aksi persetujuan */
const approvalButtonText = computed(() => {
  if (!detail.value) return 'Setujui Anggaran';
  const price = Number(detail.value.priceTotal);

  if (price <= APPROVAL_TIER_A) return 'Setujui Anggaran';
  if (price <= APPROVAL_TIER_B) return 'Setujui (Level A)';

  // > 5jt
  if (!detail.value.approvedABy) {
    return isSuperAdmin.value ? 'Setujui Langsung (Superadmin)' : 'Setujui Level A';
  }
  return 'Setujui Level B';
});

/**
 * Teks deskriptif status persetujuan untuk ditampilkan di UI.
 * Menginformasikan user siapa yang sudah menyetujui dan apa yang ditunggu.
 */
const approvalRoleText = computed(() => {
  if (!detail.value) return null;
  const price = Number(detail.value.priceTotal);

  if (price <= APPROVAL_TIER_A) return null; // Standard: no info needed

  const aName = detail.value.approvedAEmp?.full_name || '-';
  const bName = detail.value.approvedBEmp?.full_name || '-';

  if (price <= APPROVAL_TIER_B) {
    // Tier A only
    if (detail.value.approvedABy) return { type: 'done_a', text: `Disetujui oleh ${aName}` };
    return { type: 'waiting_a', text: 'Menunggu persetujuan Level A' };
  }

  // Tier A+B
  if (detail.value.approvedABy && detail.value.approvedBBy) {
    return { type: 'done_both', text: `Disetujui Level A oleh ${aName} • Level B oleh ${bName}` };
  }
  if (detail.value.approvedABy && !detail.value.approvedBBy) {
    return { type: 'waiting_b', text: `Level A ✓ ${aName} — Menunggu persetujuan Level B` };
  }
  return { type: 'waiting_a', text: 'Menunggu persetujuan Level A' };
});

const showCompleteActions = ref(false);
const workflowForm = reactive({
  dateArrive: '',
  completeAction: '',
  cancelReason: '',
  refundAmount: 0,
  note: '',
  approvalNote: ''
});

/** Jumlah dokumen BAST terunggah — dipakai sebagai pengingat saat menyelesaikan transaksi */
const doneEvidenceCount = computed(
  () => (detail.value?.evidences || []).filter(e => e.kind === 'evidence_done').length
);

const scrollToEvidence = () => {
  document.getElementById('evidence-manager')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const inspectionItems = ref([]);

watch(() => detail.value, (newDetail) => {
  if (newDetail && newDetail.status === 'diterima' && newDetail.items) {
    inspectionItems.value = newDetail.items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      qtyPurchase: item.qtyPurchase,
      unitPrice: item.unitPrice,
      qtyAccepted: item.qtyPurchase,
      qtyRefund: 0,
      qtyRetur: 0,
      qtyDefective: 0,
      refundAmount: 0,
      returAmount: 0
    }));
  }
}, { immediate: true });

const getInspectionSum = (item) => {
  return (Number(item.qtyAccepted) || 0) + 
         (Number(item.qtyRefund) || 0) + 
         (Number(item.qtyRetur) || 0) + 
         (Number(item.qtyDefective) || 0);
};

const getEffectiveUnitPrice = (item) => {
  const qtyPurchase = Number(item.qtyPurchase) || 0;
  const refundAmount = Number(item.refundAmount) || 0;
  const qtyAccepted = Number(item.qtyAccepted) || 0;
  const qtyRetur = Number(item.qtyRetur) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  
  const netQty = qtyAccepted + qtyRetur;
  if (netQty > 0) {
    return ((qtyPurchase * unitPrice) - refundAmount) / netQty;
  }
  return unitPrice;
};

const getNetTotalCost = (item) => {
  const qtyPurchase = Number(item.qtyPurchase) || 0;
  const refundAmount = Number(item.refundAmount) || 0;
  const returAmount = Number(item.returAmount) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  
  return (qtyPurchase * unitPrice) - refundAmount - returAmount;
};

const formatNumberInput = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const num = Math.round(Number(val)) || 0;
  if (num === 0) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumberInput = (str) => {
  if (!str) return 0;
  const cleanStr = String(str).replace(/\D/g, '');
  return Number(cleanStr) || 0;
};

const getInspectionItem = (itemId) => {
  return inspectionItems.value.find(item => item.id === itemId) || null;
};

const grandTotalAfterAdjustment = computed(() => {
  if (!detail.value || !detail.value.items) return 0;
  
  if (detail.value.status === 'selesai' && detail.value.priceFinalTotal > 0) {
    return detail.value.priceFinalTotal;
  }
  
  if (detail.value.status === 'diterima' && inspectionItems.value.length > 0) {
    return inspectionItems.value.reduce((sum, item) => {
      return sum + getNetTotalCost(item);
    }, 0);
  }
  
  return detail.value.priceTotal;
});

const sumOfQtyPurchase = computed(() => {
  if (!detail.value || !detail.value.items) return 0;
  return detail.value.items.reduce((sum, it) => sum + (it.qtyPurchase || 0), 0);
});

const sumOfQtyAccepted = computed(() => {
  if (!detail.value || !detail.value.items) return 0;
  return detail.value.items.reduce((sum, it) => sum + (it.qtyAccepted || 0), 0);
});

const sumOfQtyRefund = computed(() => {
  if (!detail.value || !detail.value.items) return 0;
  return detail.value.items.reduce((sum, it) => sum + (it.qtyRefund || 0), 0);
});

const sumOfQtyRetur = computed(() => {
  if (!detail.value || !detail.value.items) return 0;
  return detail.value.items.reduce((sum, it) => sum + (it.qtyRetur || 0), 0);
});

const sumOfQtyDefective = computed(() => {
  if (!detail.value || !detail.value.items) return 0;
  return detail.value.items.reduce((sum, it) => sum + (it.qtyDefective || 0), 0);
});

const sumOfRefundAmount = computed(() => {
  if (detail.value?.status === 'diterima' && inspectionItems.value.length > 0) {
    return inspectionItems.value.reduce((sum, it) => sum + (it.refundAmount || 0), 0);
  }
  if (!detail.value || !detail.value.items) return 0;
  return detail.value.items.reduce((sum, it) => sum + (it.refundAmount || 0), 0);
});
 
const sumOfReturAmount = computed(() => {
  if (detail.value?.status === 'diterima' && inspectionItems.value.length > 0) {
    return inspectionItems.value.reduce((sum, it) => sum + (it.returAmount || 0), 0);
  }
  if (!detail.value || !detail.value.items) return 0;
  return detail.value.items.reduce((sum, it) => sum + (it.returAmount || 0), 0);
});

const validateInspection = () => {
  for (const item of inspectionItems.value) {
    const total = getInspectionSum(item);
    if (total !== item.qtyPurchase) {
      Alert.error('Validasi Gagal', `Total pemeriksaan untuk barang "${item.itemName}" (${total}) harus sama dengan Rencana Beli (${item.qtyPurchase}).`);
      return false;
    }
  }
  return true;
};

const loadData = async () => {
  try {
    const data = await purchaseStore.fetchDetail(route.params.id);
    workflowForm.dateArrive = data.dateArrive || new Date().toISOString().split('T')[0];
  } catch (err) {
    Alert.error('Error', 'Gagal memuat data detail.');
  }
};

const updateStatus = async (newStatus) => {
  try {
    // Pengingat: menyelesaikan transaksi tanpa BAST sama sekali
    if (newStatus === 'selesai' && doneEvidenceCount.value === 0) {
      const proceed = await Alert.confirm(
        'Belum Ada Bukti Selesai',
        'Transaksi akan diselesaikan tanpa dokumen BAST. Lanjutkan?'
      );
      if (!proceed) return;
    }

    let confirmMsg;
    if (newStatus === 'batal') {
      confirmMsg = 'Batalkan transaksi ini?';
    } else if (newStatus === 'disetujui') {
      confirmMsg = `${approvalButtonText.value} — konfirmasi tindakan ini?`;
    } else {
      confirmMsg = `Ubah status ke ${newStatus.toUpperCase()}?`;
    }
    const confirmed = await Alert.confirm('Konfirmasi Status', confirmMsg);
    if (!confirmed) return;

    const payload = { status: newStatus };

    if (newStatus === 'disetujui' && workflowForm.approvalNote?.trim()) {
      payload.approval_note = workflowForm.approvalNote.trim();
    }

    if (newStatus === 'diterima') {
      payload.date_arrive = workflowForm.dateArrive;
    }

    if (newStatus === 'selesai') {
      if (!validateInspection()) return;
      
      payload.items = inspectionItems.value.map(item => ({
        id: item.id,
        qty_accepted: Number(item.qtyAccepted) || 0,
        qty_refund: Number(item.qtyRefund) || 0,
        qty_retur: Number(item.qtyRetur) || 0,
        qty_defective: Number(item.qtyDefective) || 0,
        refund_amount: Number(item.refundAmount) || 0,
        retur_amount: Number(item.returAmount) || 0
      }));

      if (workflowForm.completeAction) payload.complete_action = workflowForm.completeAction;
    }
    
    if (newStatus === 'batal') {
      if (!workflowForm.cancelReason) return Alert.error('Validasi', 'Mohon isi alasan pembatalan.');
      payload.cancel_reason = workflowForm.cancelReason;
    }

    await purchaseStore.updateStatus(route.params.id, payload);
    Alert.success('Berhasil', 'Status pembelian diperbarui.');
  } catch (err) {
    Alert.error('Gagal', getApiErrorMessage(err));
  }
};

const handleDelete = async () => {
  const confirmed = await Alert.confirm('Hapus Draft?', 'Data akan dihapus permanen.');
  if (confirmed) {
    try {
      await purchaseStore.deletePurchase(detail.value.id);
      Alert.success('Berhasil', 'Draft pembelian dihapus.');
      router.push({ name: 'TranPurchases' });
    } catch (err) {
      Alert.error('Gagal', 'Gagal menghapus data.');
    }
  }
};

const handleHardDelete = async () => {
  const confirmed = await Alert.confirm(
    'Hard Delete Pembelian?',
    'Khusus Superadmin: Transaksi berstatus Selesai ini akan dihapus permanen. Stok barang (Accepted + Retur) akan di-rollback otomatis secara transaksional.'
  );
  if (confirmed) {
    try {
      await purchaseStore.hardDeletePurchase(detail.value.id);
      Alert.success('Berhasil', 'Pembelian berhasil di-hard delete dan stok telah di-rollback.');
      router.push({ name: 'TranPurchases' });
    } catch (err) {
      Alert.error('Gagal Hard Delete', getApiErrorMessage(err, 'Gagal menghapus data.'));
    }
  }
};


const formatDate = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
};

const formatDateSmall = (d) => {
  if (!d) return '';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(d));
};

const formatDateFull = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('id-ID', { 
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(d));
};

const formatNumber = (n) => {
  return Number(n).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getStatusColor = (status) => {
  switch (status) {
    case 'draft': return 'light';
    case 'diajukan': return 'info';
    case 'disetujui': return 'primary';
    case 'diterima': return 'warning';
    case 'selesai': return 'success';
    case 'batal': return 'error';
    default: return 'light';
  }
};

const getStepDate = (key) => {
  if (!detail.value) return null;
  switch (key) {
    case 'draft': return detail.value.createdAt;
    case 'diajukan': return detail.value.submittedAt;
    case 'disetujui': return detail.value.approvedAt;
    case 'diterima': return detail.value.dateArrive;
    case 'selesai': return detail.value.completedAt;
    default: return null;
  }
};

onMounted(() => {
  loadData();
});
</script>

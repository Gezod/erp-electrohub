<template>
  <AdminLayout>
    <div v-if="detail" class="max-w-(--breakpoint-2xl) mx-auto space-y-6 pb-20">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div class="flex items-center gap-4">
          <router-link :to="{ name: 'MarketingTransferList' }" class="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"><ArrowLeft class="w-5 h-5 text-gray-400" /></router-link>
          <div>
            <div class="flex items-center gap-3">
              <span class="px-2 py-0.5 bg-brand-500/10 text-brand-500 text-[9px] font-black uppercase tracking-widest rounded">
                {{ detail.assetId ? 'Transfer Aset' : 'Transfer Stok' }}
              </span>
              <h1 class="text-xl font-bold text-gray-800 dark:text-white">{{ detail.code }}</h1>
              <Badge :color="statusColor(detail.status)" class="uppercase text-[9px] font-black px-3 py-1">{{ detail.status.replace('_', ' ') }}</Badge>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">
              {{ detail.fromLocation?.location_name }} <ArrowRight class="w-3 h-3 inline" /> {{ detail.toLocation?.location_name }}
              <span class="text-gray-400 font-medium normal-case ml-2">&bull; {{ formatDate(detail.dateTransfer) }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Stepper alur transfer -->
      <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div
          v-if="detail.status === 'ditolak'"
          class="max-w-md mx-auto text-center text-[11px] font-black uppercase tracking-widest text-red-500"
        >
          Transfer ditolak pada tahap persetujuan
        </div>
        <div v-else class="relative flex justify-between items-center max-w-lg mx-auto">
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-0"></div>
          <div class="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500 transition-all duration-500 -z-0" :style="{ width: `${(stageIndex / (stageLabels.length - 1)) * 100}%` }"></div>
          <div v-for="(s, idx) in stageLabels" :key="s" class="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-gray-900 px-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center border-2" :class="idx <= stageIndex ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300'">
              <Check v-if="idx < stageIndex" class="w-4 h-4" /><span v-else class="text-xs font-bold">{{ idx + 1 }}</span>
            </div>
            <span class="text-[9px] font-black uppercase tracking-widest" :class="idx <= stageIndex ? 'text-gray-800 dark:text-white' : 'text-gray-400'">{{ s }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="lg:col-span-3 space-y-6">
          <!-- Informasi Barang -->
          <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div class="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <component :is="detail.assetId ? Tag : Boxes" class="w-3.5 h-3.5 text-brand-500" /> Informasi Barang
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-5">
              <div class="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 shrink-0">
                <component :is="detail.assetId ? Box : Package" class="w-8 h-8 text-gray-400" />
              </div>
              <div class="flex-1 space-y-2">
                <h4 class="text-xl font-black text-gray-800 dark:text-white leading-tight tracking-tight">
                  {{ detail.asset?.good?.good_name || detail.good?.good_name || 'Barang tidak diketahui' }}
                </h4>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-[11px] font-mono font-bold text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                    {{ detail.assetId ? detail.asset?.code_asset || '-' : detail.good?.good_code || '-' }}
                  </span>
                  <span class="text-[11px] font-black text-brand-600 bg-brand-50 dark:bg-brand-500/5 px-3 py-1 rounded-lg border border-brand-100 dark:border-brand-500/20 uppercase">
                    Qty: {{ detail.qty }} {{ detail.assetId ? 'Unit' : (detail.good?.uom?.name || 'Unit') }}
                  </span>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-50 dark:border-gray-800 space-y-2">
              <div v-if="!detail.assetId && detail.qtySent != null" class="flex justify-between text-xs"><span class="text-gray-500">Qty Dikirim:</span><span class="font-bold text-brand-600">{{ detail.qtySent }}</span></div>
              <div v-if="!detail.assetId && detail.qtyReceived != null" class="flex justify-between text-xs"><span class="text-gray-500">Qty Diterima:</span><span class="font-bold text-emerald-600">{{ detail.qtyReceived }}</span></div>
              <div v-if="detail.diffReason" class="flex justify-between text-xs gap-4"><span class="text-gray-500 shrink-0">Alasan Selisih:</span><span class="font-bold text-amber-600 text-right">{{ detail.diffReason }}</span></div>
              <div v-if="detail.receivedCondition" class="flex justify-between items-center text-xs"><span class="text-gray-500">Kondisi Diterima:</span><Badge :color="detail.receivedCondition === 'bagus' ? 'success' : 'error'" class="uppercase text-[9px] font-black">{{ detail.receivedCondition }}</Badge></div>
              <div v-if="detail.refRequest" class="flex justify-between text-xs"><span class="text-gray-500">Terkait Request:</span>
                <router-link :to="{ name: 'MarketingRequestDetail', params: { id: detail.refRequest.id } }" class="font-bold text-brand-600 hover:underline">{{ detail.refRequest.request_code }}</router-link>
              </div>
            </div>
          </div>

          <!-- Alur Perpindahan: Lokasi & PIC -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <ArrowLeftRight class="w-3.5 h-3.5 text-brand-500" /> Alur Perpindahan
              </div>
              <div class="text-[10px] font-bold text-gray-400 italic">
                Dibuat oleh: <span class="text-brand-500 not-italic">{{ detail.transferredByEmp?.full_name || '-' }}</span>
              </div>
            </div>

            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- ASAL -->
              <div class="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Asal</span>
                  <div class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-gray-500">A</div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-brand-500 shrink-0">
                    <MapPin class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.fromLocation?.location_name || '-' }}</div>
                    <div class="text-[10px] text-gray-500 mt-0.5">Lokasi Asal</div>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-brand-500 shrink-0">
                    <User class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.fromPic?.full_name || 'Stok Umum Lokasi' }}</div>
                    <div class="text-[10px] text-gray-500 mt-0.5">PIC Asal</div>
                  </div>
                </div>
              </div>

              <!-- TUJUAN -->
              <div class="p-5 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Tujuan</span>
                  <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">B</div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-emerald-600 shrink-0">
                    <MapPin class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.toLocation?.location_name || '-' }}</div>
                    <div class="text-[10px] text-gray-500 mt-0.5">Lokasi Tujuan</div>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-emerald-600 shrink-0">
                    <User class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.toPic?.full_name || 'Stok Umum Lokasi' }}</div>
                    <div class="text-[10px] text-gray-500 mt-0.5">PIC Tujuan</div>
                  </div>
                </div>
                <div v-if="detail.receivedByEmp" class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-emerald-600 shrink-0">
                    <CheckCircle class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-sm font-black text-gray-800 dark:text-white leading-tight">{{ detail.receivedByEmp.full_name }}</div>
                    <div class="text-[10px] text-gray-500 mt-0.5">Diterima {{ formatDate(detail.receivedAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Riwayat Perpindahan PIC & Lokasi — DISEMBUNYIKAN SEMENTARA atas permintaan.
               Untuk restore: hapus baris komentar pembuka ini dan baris penutup komentar di bawah blok.
          <div v-if="movementHistory.length" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <History class="w-3.5 h-3.5 text-brand-500" /> Riwayat Perpindahan
              </div>
              <Badge color="info" variant="light">{{ movementHistory.length }} Transfer</Badge>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-gray-50 dark:bg-gray-800 text-[10px] font-black uppercase text-gray-400">
                  <tr>
                    <th class="px-6 py-3">Kode</th>
                    <th class="px-6 py-3">Tanggal</th>
                    <th class="px-6 py-3">Dari (Lokasi / PIC)</th>
                    <th class="px-6 py-3">Ke (Lokasi / PIC)</th>
                    <th class="px-6 py-3">Status</th>
                    <th class="px-6 py-3">Oleh</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  <tr v-for="t in movementHistory" :key="t.id"
                    :class="['hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors', t.id === detail.id ? 'bg-brand-50/40 dark:bg-brand-500/5 font-bold' : '']">
                    <td class="px-6 py-3 font-mono font-bold">{{ t.transfer_code || '-' }}</td>
                    <td class="px-6 py-3 whitespace-nowrap">{{ formatDate(t.date_transfer) }}</td>
                    <td class="px-6 py-3">
                      <div class="font-semibold text-gray-800 dark:text-gray-200">{{ t.from_location?.location_name || '-' }}</div>
                      <div class="text-[10px] text-gray-400">{{ t.from_pic?.full_name || 'Stok Umum' }}</div>
                    </td>
                    <td class="px-6 py-3">
                      <div class="font-semibold text-emerald-600">{{ t.to_location?.location_name || '-' }}</div>
                      <div class="text-[10px] text-gray-400">{{ t.to_pic?.full_name || 'Stok Umum' }}</div>
                    </td>
                    <td class="px-6 py-3">
                      <Badge :color="statusColor(t.status)" class="uppercase text-[8px] font-black">{{ (t.status || '').replace('_', ' ') }}</Badge>
                    </td>
                    <td class="px-6 py-3">{{ t.transferred_by_emp?.full_name || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          -->

          <!-- Audit History -->
          <AuditHistory module="MKT_TRANSFER" :recordId="route.params.id" />
        </div>

        <div class="lg:col-span-2 space-y-6">
          <!-- Aksi -->
          <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Aksi</h3>

            <!-- Tahap persetujuan: Setujui / Tolak oleh admin pusat / manager -->
            <div v-if="detail.status === 'diajukan'" class="space-y-3">
              <p class="text-xs text-gray-500">Transfer menunggu persetujuan admin pusat / manager sebelum bisa dikirim PIC asal.</p>
              <template v-if="canApprove">
                <div class="space-y-1.5">
                  <label class="block text-[10px] font-bold uppercase text-gray-500">Catatan Persetujuan <span class="text-gray-400 normal-case font-medium">(opsional)</span></label>
                  <textarea v-model="approvalNote" rows="2" class="input-base text-sm" placeholder="Catatan untuk PIC asal..."></textarea>
                </div>
                <button v-can="'marketing-transfers:approve'" @click="doApprove" :disabled="busy" class="btn-primary w-full flex items-center justify-center gap-2"><CheckCircle class="w-4 h-4" /> Setujui</button>
                <div class="space-y-1.5">
                  <label class="block text-[10px] font-bold uppercase text-red-500">Alasan Penolakan <span class="text-red-500">*</span></label>
                  <textarea v-model="rejectReason" rows="2" class="input-base text-sm" placeholder="Wajib diisi jika menolak"></textarea>
                </div>
                <button v-can="'marketing-transfers:approve'" @click="doTolak" :disabled="busy" class="w-full border border-red-200 dark:border-red-500/30 text-red-600 rounded-xl py-2 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition"><XCircle class="w-4 h-4" /> Tolak</button>
              </template>
              <p v-else class="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs">Anda tidak memiliki hak menyetujui transfer ini.</p>
              <button v-can="'marketing-transfers:update'" @click="doCancel" :disabled="busy" class="text-xs font-bold text-red-500 hover:underline w-full text-center">Batalkan Transfer</button>
            </div>

            <!-- Tahap kirim: hanya PIC asal (backend menolak selain itu) -->
            <div v-if="detail.status === 'disetujui'" class="space-y-3">
              <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs flex items-start gap-2">
                <CheckCircle class="w-4 h-4 shrink-0 mt-0.5" />
                <span>Disetujui oleh <b>{{ detail.approvedByEmp?.full_name || '-' }}</b>{{ detail.approvedAt ? ` · ${formatDate(detail.approvedAt)}` : '' }}.</span>
              </div>
              <p class="text-xs text-gray-500">Mengirim akan langsung mengurangi stok / menandai aset "dalam pengiriman" di lokasi asal.</p>
              <template v-if="canKirim">
                <div v-if="!detail.assetId" class="space-y-1.5">
                  <label class="block text-[10px] font-bold uppercase text-gray-500">Qty Dikirim</label>
                  <input v-model.number="qtySent" type="number" min="0.001" :max="detail.qty" step="any" class="input-base text-sm" />
                </div>
                <button v-can="'marketing-transfers:update'" @click="doKirim" :disabled="busy" class="btn-primary w-full flex items-center justify-center gap-2"><Truck class="w-4 h-4" /> Kirim</button>
              </template>
              <p v-else class="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs">Hanya PIC asal (<b>{{ detail.fromPic?.full_name || 'Stok Umum Lokasi' }}</b>) yang dapat mengirim transfer ini.</p>
              <button v-can="'marketing-transfers:update'" @click="doCancel" :disabled="busy" class="text-xs font-bold text-red-500 hover:underline w-full text-center">Batalkan Transfer</button>
            </div>

            <div v-if="detail.status === 'dikirim'" class="space-y-3">
              <p class="text-xs text-gray-500">Konfirmasi jumlah yang benar-benar diterima. Stok tujuan hanya bertambah sesuai qty diterima.</p>
              <template v-if="canTerima">
                <template v-if="detail.assetId">
                  <label class="block text-[10px] font-bold uppercase text-gray-500">Kondisi Saat Diterima</label>
                  <select v-model="receivedCondition" class="input-base text-sm">
                    <option value="bagus">Bagus</option>
                    <option value="rusak">Rusak</option>
                    <option value="hilang">Hilang</option>
                  </select>
                </template>
                <template v-else>
                  <label class="block text-[10px] font-bold uppercase text-gray-500">Qty Diterima (dikirim: {{ detail.qtySent }})</label>
                  <input v-model.number="qtyReceived" type="number" min="0" :max="detail.qtySent" step="any" class="input-base text-sm" />
                  <div v-if="qtyReceived < detail.qtySent" class="space-y-1.5">
                    <label class="block text-[10px] font-bold uppercase text-red-500">Alasan Selisih <span class="text-red-500">*</span></label>
                    <textarea v-model="diffReason" rows="2" class="input-base text-sm"></textarea>
                  </div>
                </template>
                <button v-can="'marketing-transfers:update'" @click="doTerima" :disabled="busy" class="btn-primary w-full flex items-center justify-center gap-2"><PackageCheck class="w-4 h-4" /> Konfirmasi Terima</button>
              </template>
              <p v-else class="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs">Hanya PIC tujuan (<b>{{ detail.toPic?.full_name || 'Stok Umum Lokasi' }}</b>) yang dapat mengkonfirmasi penerimaan transfer ini.</p>
            </div>

            <div v-if="detail.status === 'diterima'" class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle class="w-4 h-4" /> Transfer selesai diterima.
            </div>
            <div v-if="detail.status === 'ditolak'" class="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 text-xs font-bold space-y-1">
              <div class="flex items-center gap-2"><XCircle class="w-4 h-4" /> Transfer ditolak.</div>
              <p v-if="detail.rejectedByEmp" class="font-medium text-red-500/90">Oleh {{ detail.rejectedByEmp.full_name }}{{ detail.rejectedAt ? ` · ${formatDate(detail.rejectedAt)}` : '' }}</p>
            </div>
            <div v-if="detail.status === 'dibatalkan'" class="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 text-xs font-bold">Transfer dibatalkan.</div>
          </div>

          <!-- Informasi Transfer -->
          <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
            <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Info class="w-3.5 h-3.5 text-brand-500" /> Informasi Transfer
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                <span class="text-[10px] font-black text-gray-400 uppercase">Tanggal Transfer</span>
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ formatDate(detail.dateTransfer) }}</span>
              </div>
              <div v-if="detail.receivedAt" class="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                <span class="text-[10px] font-black text-emerald-600 uppercase">Tgl Diterima</span>
                <span class="text-xs font-bold text-emerald-600">{{ formatDate(detail.receivedAt) }}</span>
              </div>
              <!-- <div class="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                <span class="text-[10px] font-black text-gray-400 uppercase">Alasan Transfer</span>
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">{{ (detail.transferReason || '-').replace('_', ' ') }}</span>
              </div> -->
              <div class="flex justify-between items-center py-2">
                <span class="text-[10px] font-black text-gray-400 uppercase">Dibuat</span>
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ formatDate(detail.createdAt) }}</span>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-50 dark:border-gray-800 space-y-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catatan</span>
              <p class="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                {{ detail.notes || 'Tidak ada catatan tambahan.' }}
              </p>
            </div>
            <div v-if="detail.reason" class="space-y-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alasan Pembatalan</span>
              <p class="text-xs text-red-600 italic leading-relaxed p-4 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/20">
                {{ detail.reason }}
              </p>
            </div>
            <div v-if="detail.rejectReason" class="space-y-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alasan Penolakan</span>
              <p class="text-xs text-red-600 italic leading-relaxed p-4 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/20">
                {{ detail.rejectReason }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Badge from '@/components/ui/Badge.vue';
import AuditHistory from '@/components/common/AuditHistory.vue';
import {
  ArrowLeft, ArrowRight, ArrowLeftRight, Check, Truck, PackageCheck, CheckCircle, XCircle,
  Tag, Boxes, Box, Package, MapPin, User, Info,
} from 'lucide-vue-next';
import { useMarketingTransferStore } from './marketingTransfer.store';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
// DISEMBUNYIKAN SEMENTARA — dipakai hanya oleh section "Riwayat Perpindahan" (lihat loadMovementHistory & template):
// import { MarketingAssetService } from '@/modules/transaction/marketing-asset/marketingAsset.service';
import { Alert } from '@/plugins/sweetalert';

const route = useRoute();
const store = useMarketingTransferStore();
const authStore = useAuthStore();
const busy = ref(false);
const qtySent = ref(0);
const qtyReceived = ref(0);
const diffReason = ref('');
const receivedCondition = ref('bagus');
const approvalNote = ref('');
const rejectReason = ref('');
const movementHistory = ref([]);

const detail = computed(() => store.transferDetail);

const stageLabels = ['Diajukan', 'Disetujui', 'Dikirim', 'Diterima'];
const stageIndex = computed(() => ({
  diajukan: 0, disetujui: 1, ditolak: 0,
  dikirim: 2,
  diterima: 3, dibatalkan: 0,
}[detail.value?.status] ?? 0));
const statusColor = (s) => ({
  diajukan: 'light', disetujui: 'info', ditolak: 'error',
  dikirim: 'warning',
  diterima: 'success', dibatalkan: 'error',
}[s] || 'light');

const isSuperadmin = computed(() => !!(authStore.user?.isAdmin || authStore.user?.is_superadmin));
const myEmployeeId = computed(() => authStore.user?.employeeId || null);

const canApprove = computed(
  () => isSuperadmin.value || authStore.hasPrivilege('marketing-transfers:approve'),
);
// Backend tetap mem-403 kalau dilanggar — gate ini hanya agar tombol tidak menyesatkan.
const canKirim = computed(() => {
  const d = detail.value;
  if (!d) return false;
  if (isSuperadmin.value) return true;
  if (d.fromPic?.id) return myEmployeeId.value === d.fromPic.id;
  return myEmployeeId.value != null && myEmployeeId.value === d.transferredByEmp?.id;
});
const canTerima = computed(() => {
  const d = detail.value;
  if (!d) return false;
  if (isSuperadmin.value) return true;
  return !!d.toPic?.id && myEmployeeId.value === d.toPic.id;
});

const formatDate = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
};

/**
 * Riwayat perpindahan lokasi & PIC — HANYA untuk transfer aset (asset_id), karena aset
 * punya identitas fisik tunggal yang bisa ditelusuri lintas transfer (endpoint khusus
 * /marketing/assets/:id/transfers, di-scope ke asset_id yang sama).
 *
 * Transfer stok (good_id) SENGAJA tidak ditampilkan di sini: barang non-serial tidak
 * punya identitas unit yang bisa dilacak, jadi query "semua transfer dengan good_id sama"
 * akan menggabungkan transaksi-transaksi yang sama sekali tidak berhubungan (lokasi/PIC/
 * waktu berbeda) hanya karena kebetulan jenis barangnya sama — bukan riwayat perpindahan
 * yang valid untuk transfer spesifik ini.
 */
const loadMovementHistory = async () => {
  // DISEMBUNYIKAN SEMENTARA — section "Riwayat Perpindahan" di-comment di template.
  // Untuk restore: aktifkan kembali badan fungsi di bawah, un-comment blok template,
  // dan kembalikan import MarketingAssetService + ikon History.
  movementHistory.value = [];
  // const d = detail.value;
  // if (!d?.assetId) { movementHistory.value = []; return; }
  // try {
  //   const res = await MarketingAssetService.getTransfers(d.assetId);
  //   movementHistory.value = Array.isArray(res) ? res : res?.data || [];
  // } catch (err) {
  //   console.error('Gagal memuat riwayat perpindahan', err);
  //   movementHistory.value = [];
  // }
};

const doApprove = async () => {
  const confirmed = await Alert.confirm('Setujui Transfer?', 'Transfer akan bisa dikirim oleh PIC asal.', 'Ya, Setujui');
  if (!confirmed) return;
  busy.value = true;
  try {
    await store.approve(route.params.id, { notes: approvalNote.value || undefined });
    Alert.success('Berhasil', 'Transfer disetujui.');
    approvalNote.value = '';
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

const doTolak = async () => {
  if (!rejectReason.value.trim()) {
    Alert.error('Validasi Gagal', 'Alasan penolakan wajib diisi.');
    return;
  }
  const confirmed = await Alert.confirm('Tolak Transfer?', 'Transfer tidak bisa dilanjutkan setelah ditolak.', 'Ya, Tolak');
  if (!confirmed) return;
  busy.value = true;
  try {
    await store.tolak(route.params.id, { reason: rejectReason.value.trim() });
    Alert.success('Berhasil', 'Transfer ditolak.');
    rejectReason.value = '';
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

const doKirim = async () => {
  busy.value = true;
  try {
    await store.kirim(route.params.id, detail.value.assetId ? {} : { qty_sent: qtySent.value });
    Alert.success('Berhasil', 'Transfer dikirim — stok/aset asal sudah dikurangi.');
    await loadMovementHistory();
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

const doTerima = async () => {
  if (!detail.value.assetId && qtyReceived.value < detail.value.qtySent && !diffReason.value) {
    Alert.error('Validasi Gagal', 'Alasan selisih wajib diisi.');
    return;
  }
  busy.value = true;
  try {
    const payload = detail.value.assetId ? { received_condition: receivedCondition.value } : { qty_received: qtyReceived.value, diff_reason: diffReason.value || undefined };
    await store.terima(route.params.id, payload);
    Alert.success('Berhasil', 'Transfer diterima — stok/aset tujuan diperbarui.');
    await loadMovementHistory();
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

const doCancel = async () => {
  const confirmed = await Alert.confirm('Batalkan Transfer?', 'Transfer yang belum dikirim aman dibatalkan.', 'Ya, Batalkan');
  if (!confirmed) return;
  busy.value = true;
  try {
    await store.cancel(route.params.id, {});
    Alert.success('Berhasil', 'Transfer dibatalkan.');
    await loadMovementHistory();
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
  } finally {
    busy.value = false;
  }
};

watch(detail, (d) => {
  if (d) {
    qtySent.value = d.qty;
    qtyReceived.value = d.qtySent ?? d.qty;
  }
});

onMounted(async () => {
  await store.fetchDetail(route.params.id);
  await loadMovementHistory();
});
</script>

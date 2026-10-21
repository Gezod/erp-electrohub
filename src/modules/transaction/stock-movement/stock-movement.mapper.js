/**
 * StockMovementLogMapper — normalisasi baris log pergerakan (stok + perolehan aset)
 * ke bentuk siap tampil di tabel.
 */

// Label Tipe berbahasa Indonesia. Nilai key = movement_type enum backend + 'asset_acquired'.
export const TIPE_LABEL = {
  initial: 'Stok Awal',
  in: 'Stok Masuk',
  out: 'Stok Keluar',
  adjustment: 'Penyesuaian',
  transfer_in: 'Transfer Masuk',
  transfer_out: 'Transfer Keluar',
  asset_acquired: 'Perolehan Aset',
};

// Opsi filter Tipe, dikelompokkan per kategori (untuk <optgroup>).
export const TIPE_OPTIONS = {
  stok: ['initial', 'in', 'out', 'adjustment', 'transfer_in', 'transfer_out'],
  aset: ['asset_acquired'],
};

const NEGATIVE_TYPES = new Set(['out', 'transfer_out']);
const POSITIVE_TYPES = new Set(['initial', 'in', 'transfer_in', 'asset_acquired']);

const numberFmt = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
const currencyFmt = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const formatCurrency = (v) => {
  if (v === null || v === undefined || isNaN(Number(v))) return '-';
  return `Rp ${currencyFmt.format(Number(v))}`;
};

const formatDateTime = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(d);
};

const resolveSign = (tipe, qty) => {
  if (NEGATIVE_TYPES.has(tipe)) return '-';
  if (POSITIVE_TYPES.has(tipe)) return '+';
  // adjustment: tentukan dari tanda qty (bisa negatif untuk koreksi turun, 0 untuk pindah lokasi)
  if (Number(qty) < 0) return '-';
  if (Number(qty) > 0) return '+';
  return '';
};

const toUIRow = (r) => {
  const qtyNum = Number(r.qty) || 0;
  const sign = resolveSign(r.tipe, qtyNum);
  const absQty = Math.abs(qtyNum);
  const stockTipe = r.stock_tipe || (r.is_stok_opening ? 'opening' : 'biasa');
  const valued = r.stock_tipe ? r.stock_tipe !== 'retur' : r.is_valued !== false;

  return {
    id: r.id,
    kategori: r.kategori, // 'stok' | 'aset'
    kategoriLabel: r.kategori === 'aset' ? 'Aset' : 'Stok',
    tanggal: r.tanggal,
    tanggalLabel: formatDateTime(r.tanggal),
    tipe: r.tipe,
    tipeLabel: TIPE_LABEL[r.tipe] || r.tipe || '-',
    stockTipe,
    isStokOpening: stockTipe === 'opening',
    namaBarang: r.nama_barang || '-',
    qtySign: sign,
    qtyValue: numberFmt.format(absQty),
    qtyDisplay: `${sign}${numberFmt.format(absQty)}`,
    qtyIsNegative: sign === '-',
    avgCostBefore: valued ? formatCurrency(r.unit_cost_before) : '-',
    avgCostAfter: valued ? formatCurrency(r.unit_cost_after) : '-',
    lokasi: r.lokasi || '-',
    keterangan: r.keterangan || '-',
    oleh: r.oleh || '-',
  };
};

export const StockMovementLogMapper = {
  toUIList(response) {
    const rows = Array.isArray(response?.data) ? response.data : [];
    const pagination = response?.pagination || {
      totalData: rows.length, currentPage: 1, totalPages: 1, dataPerPage: rows.length || 10,
    };
    return { data: rows.map(toUIRow), pagination };
  },
};

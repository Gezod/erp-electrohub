// Tipe baris stok GA — pengganti pasangan boolean is_valued + is_stok_opening.
//   biasa / opening / parfum  → bernilai (punya unit cost, ikut WAC)
//   retur                     → Rp 0 / tidak bernilai
// Modul Marketing TIDAK memakai ini (masih `is_valued` boolean).

export const STOCK_TYPES = ['biasa', 'opening', 'parfum', 'retur']

export const STOCK_TYPE_OPTIONS = [
  { value: 'biasa', label: 'Stok Biasa' },
  { value: 'opening', label: 'Stok Opening' },
  { value: 'parfum', label: 'Parfum' },
  { value: 'retur', label: 'Stok Return' },
]

export const STOCK_TYPE_LABEL = STOCK_TYPE_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label
  return acc
}, {})

// true kalau baris stok bertipe ini membawa nilai (unit cost > 0 & ikut WAC).
export const isValuedTipe = (tipe) => tipe !== 'retur'

// true kalau baris stok bertipe ini masuk bucket "stok opening".
export const isOpeningTipe = (tipe) => tipe === 'opening'

// Normalisasi nilai tipe apa pun jadi salah satu STOCK_TYPES, fallback ke `fallback`.
export const normalizeTipe = (tipe, fallback = 'biasa') =>
  STOCK_TYPES.includes(tipe) ? tipe : fallback

// Turunkan `tipe` dari payload lama (bila backend/URL masih mengirim boolean).
export const tipeFromLegacy = ({ is_stok_opening, is_valued } = {}) => {
  if (is_stok_opening === true) return 'opening'
  if (is_valued === false) return 'retur'
  return 'biasa'
}

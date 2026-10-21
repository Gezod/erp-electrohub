/**
 * Konstanta domain Purchase (Pembelian).
 *
 * Ambang nominal tiered approval — HARUS sinkron dengan backend
 * (`erp-backend/src/modules/GA/Purchase/purchase.service.js` → APPROVAL_TIER_A / APPROVAL_TIER_B).
 *
 * - <= TIER_A            : auto-approve, tanpa pencatatan approver.
 * - TIER_A < x <= TIER_B : butuh persetujuan Level A.
 * - > TIER_B             : berjenjang Level A lalu Level B (orang berbeda).
 */
export const APPROVAL_TIER_A = 1_000_000
export const APPROVAL_TIER_B = 5_000_000

/**
 * Urutan tahapan workflow pembelian (draft → selesai). Satu sumber untuk:
 * - stepper di `detail.vue`
 * - tab strip status di `index.vue`
 * `batal` sengaja tidak masuk (bukan tahapan alur normal).
 */
export const PURCHASE_WORKFLOW_STEPS = [
  { key: 'draft', label: 'Draft' },
  { key: 'diajukan', label: 'Diajukan' },
  { key: 'disetujui', label: 'Disetujui' },
  { key: 'diterima', label: 'Diterima' },
  { key: 'selesai', label: 'Selesai' },
]

/**
 * Label badge untuk `t_purchases.tipe` (bucket stok tujuan hasil pembelian).
 */
export const PURCHASE_TIPE_OPENING_LABEL = {
  biasa: 'Reguler',
  opening: 'Opening',
  parfum: 'Parfum',
  retur: 'Return',
}

/**
 * Opsi filter "Tipe Pembelian" pada modal filter index.
 * `value` cocok dengan query param backend (`?tipe=biasa|opening|parfum`).
 */
export const PURCHASE_TIPE_OPENING_OPTIONS = [
  { label: 'Semua Tipe', value: '' },
  { label: 'Reguler', value: 'biasa' },
  { label: 'Opening', value: 'opening' },
  { label: 'Parfum', value: 'parfum' },
]

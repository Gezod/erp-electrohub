/**
 * Konstanta domain Purchase Marketing.
 *
 * Ambang nominal approval — HARUS sinkron dengan backend
 * (`erp-backend/src/modules/Marketing/Purchase/purchase.service.js` → APPROVAL_TIER_A).
 *
 * - <= TIER_A : auto-approve, tanpa mencatat approver.
 * - >  TIER_A : butuh persetujuan 1 level (marketing-purchases:approve_level_a / superadmin),
 *               satu tanda tangan langsung final.
 */
export const APPROVAL_TIER_A = 1_000_000

/**
 * Urutan tahapan workflow purchase marketing (draft → selesai). `batal` sengaja tidak
 * masuk (bukan tahapan alur normal).
 */
export const PURCHASE_WORKFLOW_STEPS = [
  { key: 'draft', label: 'Draft' },
  { key: 'diajukan', label: 'Diajukan' },
  { key: 'disetujui', label: 'Disetujui' },
  { key: 'diterima', label: 'Diterima' },
  { key: 'selesai', label: 'Selesai' },
]

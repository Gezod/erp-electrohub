/**
 * Konstanta domain Dashboard.
 *
 * MAX_DATE_RANGE_DAYS — HARUS sinkron dengan backend
 * (`erp-backend/src/modules/Marketing/Dashboard/dashboard.service.js` → MAX_DATE_RANGE_DAYS).
 * Dipakai untuk validasi kartu "Total Pengajuan oleh PIC" (rentang maksimal ±3 bulan).
 */
export const MAX_DATE_RANGE_DAYS = 92

export const DATE_RANGE_ERR_REQUIRED = 'Tanggal mulai dan tanggal akhir wajib diisi.'
export const DATE_RANGE_ERR_ORDER = 'Tanggal mulai tidak boleh setelah tanggal akhir.'
export const DATE_RANGE_ERR_TOO_WIDE = `Rentang tanggal maksimal ${MAX_DATE_RANGE_DAYS} hari (±3 bulan).`

/**
 * isValidDateRange
 * Validasi client-side sebelum request dikirim — mencerminkan validasi backend.
 * @param {string} startDate - format YYYY-MM-DD
 * @param {string} endDate - format YYYY-MM-DD
 * @returns {{ valid: boolean, message?: string }}
 */
export const isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: false, message: DATE_RANGE_ERR_REQUIRED }
  }
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start) || isNaN(end)) {
    return { valid: false, message: DATE_RANGE_ERR_REQUIRED }
  }
  if (start > end) {
    return { valid: false, message: DATE_RANGE_ERR_ORDER }
  }
  const diffDays = (end - start) / (1000 * 60 * 60 * 24)
  if (diffDays > MAX_DATE_RANGE_DAYS) {
    return { valid: false, message: DATE_RANGE_ERR_TOO_WIDE }
  }
  return { valid: true }
}

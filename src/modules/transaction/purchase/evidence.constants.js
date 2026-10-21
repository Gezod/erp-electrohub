/**
 * Konstanta Dokumen Pendukung Pembelian (GA Purchase)
 *
 * Mencerminkan batasan backend pada POST /ga/purchases/:id/evidences.
 * Divalidasi di klien agar user dapat pesan yang jelas sebelum request dikirim.
 * Lihat: erp-backend/docs/api/purchase-evidences.md §6
 */

/** Ukuran maksimal per file: 5 MB */
export const EVIDENCE_MAX_FILE_SIZE_MB = 5;
export const EVIDENCE_MAX_FILE_SIZE = EVIDENCE_MAX_FILE_SIZE_MB * 1024 * 1024;

/** Batas per satu request (multer .fields) */
export const EVIDENCE_MAX_FILES_PER_REQUEST = 10;
export const EVIDENCE_MAX_LINKS_PER_REQUEST = 10;

/** Batas total entri tersimpan per kategori per purchase */
export const EVIDENCE_MAX_TOTAL_PER_KIND = 20;

/** Batas panjang kolom */
export const EVIDENCE_MAX_URL_LENGTH = 500;
export const EVIDENCE_MAX_NOTES_LENGTH = 1000;
export const EVIDENCE_MAX_FILE_NAME_LENGTH = 255;

/**
 * Tipe file yang diizinkan.
 * Backend memeriksa mimetype DAN ekstensi — mengganti ekstensi saja tidak lolos,
 * jadi validasi klien pun harus mengecek keduanya.
 * Catatan: WEBP adalah tipe baru; UI lama hanya mengizinkan pdf/jpeg/png.
 */
export const EVIDENCE_ALLOWED_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf'
];
export const EVIDENCE_ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
export const EVIDENCE_ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,.pdf';

/** Kategori dokumen */
export const EVIDENCE_KINDS = ['evidence_purchase', 'evidence_done'];

export const EVIDENCE_KIND_LABELS = {
  evidence_purchase: 'Nota / Faktur Pembelian',
  evidence_done: 'BAST / Bukti Selesai'
};

export const EVIDENCE_KIND_HINTS = {
  evidence_purchase: 'Bukti pembelian awal, invoice, atau nota vendor',
  evidence_done: 'Berita acara serah terima atau bukti penyelesaian PO'
};

/** Pesan validasi (bahasa Indonesia, dipakai di beberapa tempat) */
export const EVIDENCE_ERR_FILE_TYPE = 'Format tidak didukung. Hanya JPG, PNG, WEBP, dan PDF.';
export const EVIDENCE_ERR_FILE_SIZE = `Ukuran file maksimal ${EVIDENCE_MAX_FILE_SIZE_MB} MB.`;
export const EVIDENCE_ERR_LINK_SCHEME = 'Link harus diawali http:// atau https://';
export const EVIDENCE_ERR_LINK_LENGTH = `Link maksimal ${EVIDENCE_MAX_URL_LENGTH} karakter.`;

/**
 * isAllowedEvidenceFile
 * Cek tipe file dari mimetype DAN ekstensi sekaligus.
 * @param {File} file
 * @returns {boolean}
 */
export const isAllowedEvidenceFile = (file) => {
  if (!file) return false;
  const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
  const mimeOk = EVIDENCE_ALLOWED_MIME.includes((file.type || '').toLowerCase());
  const extOk = EVIDENCE_ALLOWED_EXT.includes(ext);
  return mimeOk && extOk;
};

/**
 * isValidEvidenceLink
 * @param {string} url
 * @returns {boolean}
 */
export const isValidEvidenceLink = (url) => {
  const value = (url || '').trim();
  if (!value || value.length > EVIDENCE_MAX_URL_LENGTH) return false;
  return /^https?:\/\//i.test(value);
};

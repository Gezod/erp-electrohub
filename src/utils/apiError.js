/**
 * Kamus nama field teknis ke label bahasa Indonesia yang ramah pengguna
 */
const FIELD_LABELS = {
  'location_id': 'Lokasi tujuan',
  'pic_ga': 'PIC GA',
  'pic_marketing': 'PIC Marketing',
  'vendor_name': 'Vendor / Toko',
  'date_purchase': 'Tanggal Pembelian',
  'date_arrive': 'Tanggal Estimasi Tiba',
  'payment': 'Jenis Pembayaran',
  'payment_method': 'Metode Pembayaran',
  'notes': 'Catatan',
  'discount_type': 'Tipe Diskon',
  'discount_percent': 'Diskon Persen',
  'discount_nominal': 'Diskon Nominal',
  'shipping_cost': 'Biaya Ongkir',
  'packaging_cost': 'Biaya Lainnya',
  'request_id': 'Tiket Pengajuan',
  'source_type': 'Sumber Pengadaan',
  'purchase_type': 'Tipe Pembelian',
  'tipe': 'Tipe Stok',
  'from_tipe': 'Tipe Stok Sumber',
  'email': 'Email',
  'password': 'Kata Sandi',
  'phone': 'Nomor Telepon',
  'name': 'Nama',
  'code': 'Kode',
};

/**
 * Format path field seperti items.0.unit_price menjadi "Harga satuan item ke-1"
 */
const formatFieldPath = (pathStr) => {
  if (!pathStr) return '';

  // Format items array path: items.0.xxx atau details.0.xxx
  const itemMatch = pathStr.match(/^(?:items|details)\.(\d+)\.(.+)$/);
  if (itemMatch) {
    const itemIndex = Number(itemMatch[1]) + 1;
    const itemField = itemMatch[2];

    switch (itemField) {
      case 'unit_price':
      case 'price':
        return `Harga satuan item ke-${itemIndex}`;
      case 'subtotal_discounted':
        return `Subtotal diskon item ke-${itemIndex}`;
      case 'subtotal_raw':
      case 'subtotal':
        return `Total harga item ke-${itemIndex}`;
      case 'qty_purchase':
      case 'quantity':
      case 'qty':
        return `Jumlah (QTY) item ke-${itemIndex}`;
      case 'good_id':
        return `Barang pada item ke-${itemIndex}`;
      case 'item_name':
        return `Nama item ke-${itemIndex}`;
      case 'notes':
        return `Catatan item ke-${itemIndex}`;
      default:
        return `Item ke-${itemIndex} (${itemField})`;
    }
  }

  return FIELD_LABELS[pathStr] || pathStr.replace(/_/g, ' ');
};

/**
 * Terjemahkan pesan error validasi Zod ke bahasa Indonesia
 */
const translateValidationMessage = (fieldLabel, rawMessage) => {
  const msg = (rawMessage || '').trim();
  if (!msg) return fieldLabel ? `${fieldLabel} tidak valid` : 'Data tidak valid';

  // Pattern >= 0 (e.g. Too small: expected number to be >=0)
  if (/>=\s*0|greater than or equal to 0/i.test(msg) || /too small.*>=0/i.test(msg)) {
    return fieldLabel ? `${fieldLabel} tidak boleh kurang dari 0` : 'Nilai tidak boleh kurang dari 0';
  }

  // Pattern > 0 (e.g. Too small: expected number to be >0)
  if (/>\s*0|greater than 0/i.test(msg) || /too small.*>0/i.test(msg)) {
    return fieldLabel ? `${fieldLabel} harus lebih dari 0` : 'Nilai harus lebih dari 0';
  }

  // Pattern <= 100
  if (/<=?\s*100|less than or equal to 100/i.test(msg) || /too big.*<=100/i.test(msg)) {
    return fieldLabel ? `${fieldLabel} maksimal 100%` : 'Nilai maksimal 100%';
  }

  // Required / empty
  if (/required|expected string, received null|expected number, received null|received undefined|is required/i.test(msg)) {
    return fieldLabel ? `${fieldLabel} wajib diisi` : 'Wajib diisi';
  }

  // Invalid type (nan / string)
  if (/expected number, received nan/i.test(msg)) {
    return fieldLabel ? `${fieldLabel} harus berupa angka` : 'Harus berupa angka';
  }

  // Invalid URL
  if (/invalid url/i.test(msg)) {
    return fieldLabel ? `${fieldLabel} harus berupa link URL yang valid` : 'Format link URL tidak valid';
  }

  // String length
  if (/must contain at least (\d+) character/i.test(msg)) {
    const min = msg.match(/must contain at least (\d+) character/i)?.[1] || '';
    return fieldLabel ? `${fieldLabel} minimal ${min} karakter` : `Minimal ${min} karakter`;
  }

  if (/must contain at most (\d+) character/i.test(msg)) {
    const max = msg.match(/must contain at most (\d+) character/i)?.[1] || '';
    return fieldLabel ? `${fieldLabel} maksimal ${max} karakter` : `Maksimal ${max} karakter`;
  }

  return fieldLabel ? `${fieldLabel}: ${msg}` : msg;
};

/**
 * Humanize satu issue (baik object Zod maupun string issue)
 */
const humanizeIssue = (issue) => {
  if (typeof issue === 'string') {
    const colonIdx = issue.indexOf(':');
    if (colonIdx > -1) {
      const pathPart = issue.substring(0, colonIdx).trim();
      const msgPart = issue.substring(colonIdx + 1).trim();
      const label = formatFieldPath(pathPart);
      return translateValidationMessage(label, msgPart);
    }
    return issue.trim();
  }

  const rawPath = Array.isArray(issue?.path)
    ? issue.path.filter((p) => p !== '' && p !== null && p !== undefined).join('.')
    : (issue?.path || '');
  const fieldLabel = formatFieldPath(rawPath);
  const rawText = typeof issue?.message === 'string' ? issue.message.trim() : '';

  return translateValidationMessage(fieldLabel, rawText);
};

/**
 * getApiErrorMessage
 * Backend membalas { message } di mana `message` bisa berupa STRING biasa
 * ATAU array issue Zod: [{ code, path, message }].
 *
 * Menerjemahkan issue validasi teknis Zod / database ke bahasa Indonesia yang jelas.
 *
 * @param {any} err - Error dari axios (atau Error biasa)
 * @param {string} fallback - Pesan cadangan bila tidak ada message yang terbaca
 * @returns {string}
 */
export const getApiErrorMessage = (err, fallback = 'Terjadi kesalahan.') => {
  const message = err?.response?.data?.message ?? err?.message;

  if (Array.isArray(message)) {
    const parts = message
      .map((issue) => humanizeIssue(issue))
      .filter(Boolean);

    return parts.length ? parts.join(' • ') : fallback;
  }

  if (typeof message === 'string' && message.trim()) {
    const trimmed = message.trim();
    // Jika string berisi pemisah ' • ' dari Zod string issues
    if (trimmed.includes(' • ') || trimmed.includes(':')) {
      const subParts = trimmed.split(' • ').map((part) => humanizeIssue(part)).filter(Boolean);
      return subParts.length ? subParts.join(' • ') : trimmed;
    }
    return trimmed;
  }

  return fallback;
};

export default getApiErrorMessage;

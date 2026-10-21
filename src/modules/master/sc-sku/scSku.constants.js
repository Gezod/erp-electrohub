/**
 * Constants & Configurations for Master SKU & Harga (Supply Chain)
 */

export const TIPE_SKU_OPTIONS = [
  { value: 'raw_material', label: 'Bahan Baku (Raw Material)' },
  { value: 'finished_good', label: 'Barang Jadi (Finished Good)' }
];

export const STATUS_SKU_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'true', label: 'Aktif' },
  { value: 'false', label: 'Nonaktif' }
];

export const TIPE_TABS = [
  { key: '', label: 'Semua Tipe' },
  { key: 'raw_material', label: 'Bahan Baku' },
  { key: 'finished_good', label: 'Barang Jadi' }
];

export const FILTER_SCHEMA = [
  {
    label: 'Kata Kunci',
    key: 'search',
    type: 'text',
    placeholder: 'Cari kode atau nama SKU...'
  },
  {
    label: 'Kategori SKU',
    key: 'category_id',
    type: 'searchable-select',
    master: 'sc-categories',
    placeholder: 'Semua Kategori'
  },
  {
    label: 'Status SKU',
    // key pakai is_active sesuai API contract: ?is_active='true'|'false'
    key: 'is_active',
    type: 'select',
    placeholder: 'Semua Status',
    options: [
      { label: 'Semua Status', value: '' },
      { label: 'Aktif', value: 'true' },
      { label: 'Nonaktif', value: 'false' }
    ]
  }
];

export const TABLE_COLUMNS = [
  { key: 'no',                  label: 'No',            width: '60px' },
  { key: 'code',                label: 'Kode SKU',      width: '140px' },
  { key: 'name',                label: 'Nama SKU' },
  { key: 'categoryName',        label: 'Kategori' },
  { key: 'tipeSku',             label: 'Tipe SKU' },
  { key: 'supplierName',        label: 'Supplier' },
  { key: 'moq',                 label: 'MOQ',           width: '90px' },
  { key: 'hargaUnit',           label: 'Harga Unit' },
  { key: 'kelompokTokoName',    label: 'Kelompok Toko' },
  { key: 'isActive',            label: 'Status',        width: '100px' },
  { key: 'action',              label: 'Aksi',          width: '90px' }
];

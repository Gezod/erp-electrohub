/**
 * ScSkuMapper
 * Mapper 3-layer (DDD Pattern) untuk modul Master SKU & Harga (Supply Chain).
 * Mengikuti pola yang sama dengan marketingRequest.mapper.js.
 */

export const ScSkuMapper = {
  /**
   * toUIList
   * Map field snake_case dari API -> camelCase untuk tabel.
   * Null-safe menggunakan `|| '-'`.
   */
  toUIList: (apiData) => {
    if (!apiData) return null;

    const categoryObj = apiData.category || apiData.sc_category_sku;
    let categoryName = '-';
    if (categoryObj?.name) {
      categoryName = categoryObj.code ? `${categoryObj.name} (${categoryObj.code})` : categoryObj.name;
    } else if (apiData.category_name) {
      categoryName = apiData.category_name;
    }

    const supplierObj = apiData.supplier || apiData.suppliers;
    let supplierName = '-';
    if (supplierObj?.name) {
      supplierName = supplierObj.name;
    } else if (apiData.supplier_name) {
      supplierName = apiData.supplier_name;
    } else if (apiData.tipe_sku === 'finished_good') {
      supplierName = 'Produksi Sendiri';
    }

    const kelompokTokoObj = apiData.kelompok_toko || apiData.store_group;
    let kelompokTokoName = '-';
    if (kelompokTokoObj?.name) {
      kelompokTokoName = kelompokTokoObj.name;
    } else if (apiData.kelompok_toko_name) {
      kelompokTokoName = apiData.kelompok_toko_name;
    }

    return {
      id: apiData.id,
      code: apiData.code || '-',
      name: apiData.name || '-',
      categoryId: apiData.category_id || categoryObj?.id || null,
      categoryName: categoryName,
      tipeSku: apiData.tipe_sku || 'raw_material',
      isActive: typeof apiData.is_active === 'boolean' ? apiData.is_active : true,
      supplierId: apiData.supplier_id || null,
      supplierName: supplierName,
      leadTimeDays: apiData.lead_time_days != null ? Number(apiData.lead_time_days) : null,
      reviewPeriodDays: apiData.review_period_days != null ? Number(apiData.review_period_days) : null,
      bufferDefaultDays: apiData.buffer_default_days != null ? Number(apiData.buffer_default_days) : null,
      extraBufferDays: apiData.extra_buffer_days != null ? Number(apiData.extra_buffer_days) : 0,
      moq: apiData.moq != null ? Number(apiData.moq) : 1,
      moqEffectiveDate: apiData.moq_effective_date ? apiData.moq_effective_date.split('T')[0] : '-',
      hargaUnit: apiData.harga_unit != null ? Number(apiData.harga_unit) : null,
      kelompokTokoId: apiData.kelompok_toko_id || null,
      kelompokTokoName: kelompokTokoName,
      createdAt: apiData.created_at || null,
      updatedAt: apiData.updated_at || null,
    };
  },

  /**
   * toUIDetail
   * Mapping lengkap untuk form edit (semua field mentah + id-id untuk dropdown).
   */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    const cat = apiData.category || apiData.sc_category_sku;
    const sup = apiData.supplier || apiData.suppliers;
    const grp = apiData.kelompok_toko || apiData.store_group;

    return {
      id: apiData.id,
      code: apiData.code || '',
      name: apiData.name || '',
      categoryId: apiData.category_id || cat?.id || null,
      categoryName: cat?.name || apiData.category_name || '',
      category: cat || null,
      tipeSku: apiData.tipe_sku || 'raw_material',
      isActive: typeof apiData.is_active === 'boolean' ? apiData.is_active : true,
      supplierId: apiData.supplier_id || sup?.id || null,
      supplierName: sup?.name || apiData.supplier_name || '',
      supplier: sup || null,
      leadTimeDays: apiData.lead_time_days != null ? Number(apiData.lead_time_days) : null,
      reviewPeriodDays: apiData.review_period_days != null ? Number(apiData.review_period_days) : null,
      bufferDefaultDays: apiData.buffer_default_days != null ? Number(apiData.buffer_default_days) : null,
      extraBufferDays: apiData.extra_buffer_days != null ? Number(apiData.extra_buffer_days) : 0,
      moq: apiData.moq != null ? Number(apiData.moq) : 1,
      moqEffectiveDate: apiData.moq_effective_date ? apiData.moq_effective_date.split('T')[0] : '',
      hargaUnit: apiData.harga_unit != null ? Number(apiData.harga_unit) : null,
      kelompokTokoId: apiData.kelompok_toko_id || grp?.id || null,
      kelompokTokoName: grp?.name || apiData.kelompok_toko_name || '',
      kelompokToko: grp || null,
      createdAt: apiData.created_at || null,
      updatedAt: apiData.updated_at || null,
    };
  },

  /**
   * toPayload
   * Menyiapkan payload API sesuai contract OpenAPI Create & Edit.
   * Semua field snake_case sesuai contract backend.
   */
toPayload: (form) => {
  const tipeSku = form.tipe_sku || form.tipeSku || 'raw_material';

  // Tanggal MOQ wajib diisi manual — TIDAK ada fallback ke hari ini.
  const effectiveDate = (form.moq_effective_date || form.moqEffectiveDate || '').substring(0, 10);

  let isActive = true;
  if (typeof form.is_active === 'boolean') {
    isActive = form.is_active;
  } else if (typeof form.isActive === 'boolean') {
    isActive = form.isActive;
  }

  return {
    code: (form.code || '').trim().toUpperCase(),
    name: (form.name || '').trim(),
    category_id: form.category_id || form.categoryId || null,
    tipe_sku: tipeSku,
    is_active: isActive,
    supplier_id: tipeSku === 'finished_good' ? null : (form.supplier_id || form.supplierId || null),
    lead_time_days: Math.max(0, parseFloat(form.lead_time_days ?? form.leadTimeDays) || 0),
    review_period_days: Math.max(0, parseFloat(form.review_period_days ?? form.reviewPeriodDays) || 0),
    buffer_default_days: Math.max(0, parseFloat(form.buffer_default_days ?? form.bufferDefaultDays) || 0),
    extra_buffer_days: Math.max(0, parseFloat(form.extra_buffer_days ?? form.extraBufferDays) || 0),
    moq: Math.max(1, parseFloat(form.moq) || 1),
    moq_effective_date: effectiveDate,
    harga_unit: Math.max(0, parseFloat(form.harga_unit ?? form.hargaUnit) || 0),
    kelompok_toko_id: form.kelompok_toko_id || form.kelompokTokoId || null,
  };
},
};

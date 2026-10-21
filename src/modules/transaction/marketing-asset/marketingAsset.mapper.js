const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '-';
  const num = Number(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
  return `Rp ${formatted}`;
};

/**
 * MarketingAssetMapper
 * Menormalkan bentuk API (snake_case) ke bentuk UI (camelCase) dan sebaliknya.
 */
export const MarketingAssetMapper = {
  /** toUIList — satu baris tabel */
  toUIList: (apiData) => {
    if (!apiData) return null;
    const cost = Number(apiData.acquisition_cost) || 0;
    return {
      id: apiData.id,
      codeAsset: apiData.code_asset || '-',
      goodName: apiData.good?.good_name || '-',
      goodCode: apiData.good?.good_code || '-',
      locationId: apiData.location_id || apiData.location?.id || null,
      locationName: apiData.location?.location_name || '-',
      assetTypeId: apiData.asset_type_id || apiData.asset_type?.id || null,
      assetTypeName: apiData.asset_type?.name_type || '-',
      picId: apiData.pic_id || null,
      picName: apiData.pic?.full_name || 'Umum',
      condition: apiData.condition || 'baik',
      status: apiData.status || 'tersedia',
      isActive: apiData.is_active ?? false,
      acquisitionCost: cost,
      formattedAcquisitionCost: formatCurrency(cost),
      dateAcquired: apiData.date_acquired ? String(apiData.date_acquired).split('T')[0] : '',
    };
  },

  /**
   * toUIDetail — detail lengkap untuk halaman detail & form edit.
   */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    const cost = Number(apiData.acquisition_cost) || 0;
    return {
      id: apiData.id,
      codeAsset: apiData.code_asset || '',
      goodId: apiData.good_id || apiData.good?.id || '',
      goodName: apiData.good?.good_name || '-',
      goodCode: apiData.good?.good_code || '-',
      locationId: apiData.location_id || apiData.location?.id || '',
      locationName: apiData.location?.location_name || '-',
      assetTypeId: apiData.asset_type_id || apiData.asset_type?.id || '',
      assetTypeName: apiData.asset_type?.name_type || '-',
      picId: apiData.pic_id || '',
      picName: apiData.pic?.full_name || 'Umum',
      condition: apiData.condition || 'baik',
      status: apiData.status || 'tersedia',
      isActive: apiData.is_active ?? true,
      acquisitionCost: cost,
      formattedAcquisitionCost: formatCurrency(cost),
      dateAcquired: apiData.date_acquired ? String(apiData.date_acquired).split('T')[0] : '',
      handoverDate: apiData.handover_date ? String(apiData.handover_date).split('T')[0] : '',
      description: apiData.description || '',
      detailPurchaseId: apiData.detail_purchase_id || null,
      good: apiData.good || null,
      location: apiData.location || null,
      assetType: apiData.asset_type || null,
      pic: apiData.pic || null,
      detailPurchase: apiData.detail_purchase || null,
    };
  },

  /** toCreatePayload — body POST /marketing/assets */
  toCreatePayload: (form) => {
    if (!form) return {};
    const payload = {
      good_id: form.goodId || null,
      location_id: form.locationId || null,
      acquisition_cost: Number(form.acquisitionCost) || 0,
    };
    if (form.picId) payload.pic_id = form.picId;
    if (form.assetTypeId) payload.asset_type_id = form.assetTypeId;
    if (form.codeAsset) payload.code_asset = form.codeAsset;
    if (form.dateAcquired) payload.date_acquired = form.dateAcquired;
    if (form.handoverDate) payload.handover_date = form.handoverDate;
    if (form.condition) payload.condition = form.condition;
    if (form.description) payload.description = form.description;
    if (form.isActive !== undefined) payload.is_active = form.isActive;
    return payload;
  },

  /** toUpdatePayload — body PUT /marketing/assets/:id (partial) */
  toUpdatePayload: (form) => {
    if (!form) return {};
    const payload = {};
    if (form.locationId !== undefined && form.locationId) payload.location_id = form.locationId;
    if (form.assetTypeId !== undefined && form.assetTypeId) payload.asset_type_id = form.assetTypeId;
    if (form.picId !== undefined) payload.pic_id = form.picId || null;
    if (form.codeAsset !== undefined) payload.code_asset = form.codeAsset || null;
    if (form.acquisitionCost !== undefined) payload.acquisition_cost = Number(form.acquisitionCost) || 0;
    if (form.dateAcquired !== undefined) payload.date_acquired = form.dateAcquired || null;
    if (form.handoverDate !== undefined) payload.handover_date = form.handoverDate || null;
    if (form.condition !== undefined) payload.condition = form.condition;
    if (form.description !== undefined) payload.description = form.description;
    if (form.isActive !== undefined) payload.is_active = form.isActive;
    return payload;
  },
};

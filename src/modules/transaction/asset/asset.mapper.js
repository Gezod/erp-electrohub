const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '-';
  const num = Number(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
  return `Rp ${formatted}`;
};

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

/**
 * AssetMapper
 * Transforms data between API Asset structures and frontend UI.
 * Aligned with API spec: acquisition_cost, book_value, status_asset, etc.
 */
export const AssetMapper = {
  /**
   * toUIList — Map asset for table display
   */
  toUIList: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      codeAsset: apiData.code_asset || '-',
      assetLabel: apiData.good?.good_name || '-',
      goodName: apiData.good?.good_name || '-',
      merk: apiData.good?.merk || '-',
      goodCode: apiData.good?.good_code || '-',
      categoryName: apiData.good?.category?.name_category || '-',
      locationId: apiData.location_id || apiData.location?.id || null,
      locationName: apiData.location?.location_name || '-',
      divisionName: apiData.division?.name || apiData.division?.name_division || '-',
      picId: apiData.pic_id || null,
      picName: apiData.pic?.full_name || apiData.employee?.full_name || '-',
      pjId: apiData.pj_id || null,
      pjName: apiData.pj?.full_name || '-',
      condition: apiData.condition || '-',
      isActive: apiData.is_active ?? false,
      tipe: apiData.tipe || 'biasa',
      isStokOpening: apiData.tipe === 'opening',
      acquisitionCost: formatCurrency(Number(apiData.acquisition_cost) || 0),
      rawAcquisitionCost: Number(apiData.acquisition_cost) || 0,
      bookValue: formatCurrency(Number(apiData.book_value) || 0),
      rawBookValue: Number(apiData.book_value) || 0,
      dateAcquired: apiData.date_acquired ? apiData.date_acquired.split('T')[0] : '',
      dateAcquiredFormatted: formatDate(apiData.date_acquired),
      handoverDate: apiData.handover_date ? apiData.handover_date.split('T')[0] : '',
      soldPrice: Number(apiData.sold_price) || 0,
    };
  },

  /**
   * toUIDetail — Full asset detail for detail/form pages
   */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      codeAsset: apiData.code_asset || '',
      assetLabel: apiData.good?.good_name || '',
      goodId: apiData.good_id || apiData.good?.id || '',
      locationId: apiData.location_id || apiData.location?.id || '',
      picId: apiData.pic_id || '',
      pjId: apiData.pj_id || '',
      divisionId: apiData.division_id || '',
      picName: apiData.pic?.full_name || apiData.employee?.full_name || '-',
      pjName: apiData.pj?.full_name || '-',
      assetTypeId: apiData.asset_type_id || '',
      detailPurchaseId: apiData.detail_purchase_id || null,
      condition: apiData.condition || 'good',
      acquisitionCost: Number(apiData.acquisition_cost) || 0,
      bookValue: Number(apiData.book_value) || 0,
      soldPrice: Number(apiData.sold_price) || 0,
      economicLifeMonths: apiData.economic_life_months || null,
      dateAcquired: apiData.date_acquired ? apiData.date_acquired.split('T')[0] : '',
      handoverDate: apiData.handover_date ? apiData.handover_date.split('T')[0] : '',
      description: apiData.description || '',
      isActive: apiData.is_active ?? true,
      tipe: apiData.tipe || 'biasa',
      isStokOpening: apiData.tipe === 'opening',
      disposeReason: apiData.dispose_reason || '',
      disposedAt: apiData.disposed_at ? apiData.disposed_at.split('T')[0] : '',
      good: apiData.good || null,
      location: apiData.location || null,
      pj: apiData.pj || null,
      transfers: apiData.transfers || [],
      maintenances: apiData.maintenances || [],
      detailPurchase: apiData.detail_purchase || null,
    };
  },

  /**
   * toCreatePayload — Payload for POST /ga/assets
   */
  toCreatePayload: (form) => {
    if (!form) return {};
    const payload = {
      good_id: form.goodId || null,
      location_id: form.locationId || null,
      acquisition_cost: Number(form.acquisitionCost) || 0,
    };
    if (form.picId) payload.pic_id = form.picId;
    if (form.pjId) payload.pj_id = form.pjId;
    if (form.divisionId) payload.division_id = form.divisionId;
    if (form.assetTypeId) payload.asset_type_id = form.assetTypeId;
    if (form.codeAsset) payload.code_asset = form.codeAsset;
    if (form.bookValue) payload.book_value = Number(form.bookValue);
    if (form.economicLifeMonths) payload.economic_life_months = Number(form.economicLifeMonths);
    if (form.dateAcquired) payload.date_acquired = form.dateAcquired;
    if (form.handoverDate) payload.handover_date = form.handoverDate;
    if (form.condition) payload.condition = form.condition;
    if (form.description) payload.description = form.description;
    if (form.isActive !== undefined) payload.is_active = form.isActive;
    if (form.soldPrice) payload.sold_price = Number(form.soldPrice);
    // Bucket baris stok yang dipilih user di form; backend memakainya untuk memilih baris T_Stock yang dipotong.
    if (form.tipe) payload.tipe = form.tipe;
    return payload;
  },

  /**
   * toUpdatePayload — Payload for PUT /ga/assets/:id (partial)
   */
  toUpdatePayload: (form) => {
    if (!form) return {};
    const payload = {};
    if (form.picId !== undefined) payload.pic_id = form.picId || null;
    if (form.pjId !== undefined) payload.pj_id = form.pjId || null;
    if (form.divisionId !== undefined) payload.division_id = form.divisionId || null;
    if (form.bookValue !== undefined) payload.book_value = Number(form.bookValue) || 0;
    if (form.economicLifeMonths !== undefined) payload.economic_life_months = Number(form.economicLifeMonths);
    if (form.description !== undefined) payload.description = form.description;
    if (form.condition !== undefined) payload.condition = form.condition;
    if (form.isActive !== undefined) payload.is_active = form.isActive;
    if (form.acquisitionCost !== undefined) payload.acquisition_cost = Number(form.acquisitionCost) || 0;
    if (form.codeAsset !== undefined) payload.code_asset = form.codeAsset || null;
    if (form.handoverDate !== undefined) payload.handover_date = form.handoverDate || null;
    if (form.soldPrice !== undefined) payload.sold_price = Number(form.soldPrice) || 0;
    return payload;
  },

  /**
   * toTransferUI — Map transfer record for display
   */
  toTransferUI: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      fromLocation: apiData.from_location?.location_name || '-',
      toLocation: apiData.to_location?.location_name || '-',
      dateTransfer: apiData.date_transfer || '-',
      transferredBy: apiData.transferred_by_employee?.full_name || '-',
      reason: apiData.reason || '-',
      evidencePhoto: apiData.evidence_photo || null,
    };
  },

  /**
   * toMaintenanceUI — Map maintenance record for display
   */
  toMaintenanceUI: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      dateService: apiData.date_service || '-',
      cost: Number(apiData.cost) || 0,
      vendorName: apiData.vendor_name || '-',
      notes: apiData.notes || '-',
      evidencePhoto: apiData.evidence_photo || null,
    };
  },
};

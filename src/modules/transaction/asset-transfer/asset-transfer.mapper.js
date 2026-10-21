/**
 * AssetTransferMapper
 * Transforms data between Asset Transfer API and UI.
 */
export const AssetTransferMapper = {
  /** Standardize transfer object for list */
  toUIList: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      code: apiData.transfer_code || apiData.code || '-',
      transferType: apiData.asset_id || apiData.asset ? 'asset' : 'stock',
      itemName: apiData.asset?.good?.good_name || apiData.good?.good_name || apiData.asset_name || apiData.good_name || '-',
      assetName: apiData.asset?.good?.good_name || apiData.asset_name || '-',
      assetCode: apiData.asset?.code_asset || apiData.asset_code || '-',
      fromLocationName: apiData.from_location?.location_name || '-',
      toLocationName: apiData.to_location?.location_name || '-',
      fromDivisionName: apiData.from_division?.name || '-',
      toDivisionName: apiData.to_division?.name || '-',
      fromPicName: apiData.from_pic?.full_name || apiData.from_employee?.full_name || '-',
      toPicName: apiData.to_pic?.full_name || apiData.to_employee?.full_name || '-',
      fromPjName: apiData.from_pj?.full_name || '-',
      toPjName: apiData.to_pj?.full_name || '-',
      transferredBy: apiData.transferred_by_emp?.full_name || '-',
      transferDate: apiData.date_transfer || apiData.transfer_date || apiData.created_at || null,
      status: apiData.status || 'pending',
      notes: apiData.notes || '',
      qty: Number(apiData.qty) || 0,
      tipe: apiData.tipe || 'biasa',
      isValued: apiData.tipe ? apiData.tipe !== 'retur' : apiData.is_valued === true,
      isStokOpening: apiData.tipe === 'opening',
    };
  },

  /** Standardize transfer object for detail/form */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      code: apiData.transfer_code || apiData.code || '-',
      transferType: apiData.asset_id || apiData.asset ? 'asset' : 'stock',
      itemName: apiData.asset?.good?.good_name || apiData.good?.good_name || apiData.asset_name || apiData.good_name || '-',
      assetId: apiData.asset_id || '',
      asset: apiData.asset || null,
      fromLocationId: apiData.from_location_id || '',
      toLocationId: apiData.to_location_id || '',
      fromDivisionId: apiData.from_division_id || '',
      toDivisionId: apiData.to_division_id || '',
      fromPicId: apiData.from_pic_id || apiData.from_employee_id || '',
      toPicId: apiData.to_pic_id || apiData.to_employee_id || '',
      fromPjId: apiData.from_pj_id || '',
      toPjId: apiData.to_pj_id || '',
      fromLocationName: apiData.from_location?.location_name || '-',
      toLocationName: apiData.to_location?.location_name || '-',
      fromDivisionName: apiData.from_division?.name || '-',
      toDivisionName: apiData.to_division?.name || '-',
      fromPicName: apiData.from_pic?.full_name || '-',
      toPicName: apiData.to_pic?.full_name || '-',
      fromPjName: apiData.from_pj?.full_name || '-',
      toPjName: apiData.to_pj?.full_name || '-',
      transferredBy: apiData.transferred_by_emp?.full_name || '-',
      transferDate: (apiData.date_transfer || apiData.transfer_date) ? (apiData.date_transfer || apiData.transfer_date).split('T')[0] : null,
      receivedAt: apiData.received_at ? apiData.received_at.split('T')[0] : null,
      status: apiData.status || 'pending',
      notes: apiData.notes || '',
      evidence: apiData.evidence_url || apiData.evidence || null,
      qty: Number(apiData.qty) || 0,
      tipe: apiData.tipe || 'biasa',
      isValued: apiData.tipe ? apiData.tipe !== 'retur' : apiData.is_valued === true,
      isStokOpening: apiData.tipe === 'opening',
      good: apiData.good || null,
    };
  },

  /** Map form to API payload */
  toPayload: (form) => {
    const payload = {
      to_location_id: form.toLocationId,
      to_pic_id: form.toPicId || null,
      to_pj_id: form.toPjId || null,
      to_division_id: form.toDivisionId || null,
      date_transfer: form.transferDate,
      notes: form.notes,
      // Toggle "Pindah Beserta Nilai": true = tujuan warisi tipe sumber, false = mendarat sebagai retur (Rp 0).
      bawa_nilai: form.isValued ?? true,
      status: form.status || 'completed',
    };

    if (form.type === 'asset') {
      payload.asset_id = form.assetId;
    } else {
      payload.from_stock_id = form.goodId;
      payload.from_location_id = form.fromLocationId;
      payload.from_pic_id = form.fromPicId || null;
      payload.qty = Number(form.qty || 1);
      // Tipe baris sumber — dipakai backend untuk mencari baris T_Stock saat from_stock_id tidak dikirim.
      payload.from_tipe = form.fromTipe || form.tipe || 'biasa';
    }

    return payload;
  }
};

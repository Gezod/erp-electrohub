export const MarketingTransferMapper = {
  toUIList: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      code: apiData.transfer_code || '-',
      status: apiData.status || 'diajukan',
      isAsset: !!apiData.asset_id,
      transferType: apiData.asset_id ? 'asset' : 'stock',
      itemName: apiData.asset
        ? `${apiData.asset.good?.good_name || ''} (${apiData.asset.code_asset || ''})`
        : (apiData.good?.good_name || '-'),
      goodName: apiData.asset?.good?.good_name || apiData.good?.good_name || '-',
      goodCode: apiData.asset?.code_asset || apiData.good?.good_code || '-',
      qty: Number(apiData.qty) || 0,
      uomName: apiData.good?.uom?.name || 'Unit',
      transferDate: apiData.date_transfer || null,
      fromLocationName: apiData.from_location?.location_name || '-',
      toLocationName: apiData.to_location?.location_name || '-',
      fromPicName: apiData.from_pic?.full_name || 'Stok Umum',
      toPicName: apiData.to_pic?.full_name || 'Stok Umum',
      createdAt: apiData.created_at || null,
    };
  },

  toUIDetail: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      code: apiData.transfer_code || '-',
      status: apiData.status || 'diajukan',
      transferReason: apiData.transfer_reason || 'normal',
      assetId: apiData.asset_id || null,
      asset: apiData.asset || null,
      goodId: apiData.good_id || null,
      good: apiData.good || null,
      qty: Number(apiData.qty) || 0,
      qtySent: apiData.qty_sent != null ? Number(apiData.qty_sent) : null,
      qtyReceived: apiData.qty_received != null ? Number(apiData.qty_received) : null,
      diffReason: apiData.diff_reason || '',
      receivedCondition: apiData.received_condition || null,
      fromLocation: apiData.from_location || null,
      toLocation: apiData.to_location || null,
      fromPic: apiData.from_pic || null,
      toPic: apiData.to_pic || null,
      transferredByEmp: apiData.transferred_by_emp || null,
      receivedByEmp: apiData.received_by_emp || null,
      receivedAt: apiData.received_at || null,
      approvedByEmp: apiData.approved_by_emp || null,
      approvedAt: apiData.approved_at || null,
      rejectedByEmp: apiData.rejected_by_emp || null,
      rejectedAt: apiData.rejected_at || null,
      rejectReason: apiData.reject_reason || '',
      refRequest: apiData.ref_request || null,
      dateTransfer: apiData.date_transfer ? String(apiData.date_transfer).split('T')[0] : null,
      notes: apiData.notes || '',
      reason: apiData.reason || '',
      evidencePhoto: apiData.evidence_photo || null,
      createdAt: apiData.created_at || null,
    };
  },

  toPayload: (form) => ({
    transfer_reason: form.transferReason || 'normal',
    asset_id: form.assetId || undefined,
    good_id: form.goodId || undefined,
    qty: form.assetId ? 1 : Number(form.qty || 1),
    from_location_id: form.fromLocationId,
    to_location_id: form.toLocationId,
    from_pic_id: form.fromPicId || undefined,
    to_pic_id: form.toPicId || undefined,
    date_transfer: form.transferDate || form.dateTransfer || undefined,
    ref_request_id: form.refRequestId || undefined,
    notes: form.notes || undefined,
    reason: form.reason || undefined,
  }),
};

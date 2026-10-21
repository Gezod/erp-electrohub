/**
 * RequestMapper
 * Transforms data between API Request structures and frontend UI.
 * Aligned with API: code_request, purpose, evidence_doc, has_stock, 
 * all_items_in_master, checked_by, delivered_by, etc.
 */
export const RequestMapper = {
  /** Map request for list table */
  toUIList: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      requestCode: apiData.code_request || '-',
      status: apiData.status || 'dalam_pengajuan',
      dateRequest: apiData.date_request || null,
      purpose: apiData.purpose || '',
      tipe: apiData.tipe || 'biasa',
      isStokOpening: apiData.tipe === 'opening',
      employeeName: apiData.employee?.full_name || '-',
      divisionName: apiData.division?.name || '-',
      locationName: apiData.location?.location_name || '-',
      checkerName: apiData.checker?.full_name || null,
      itemCount: apiData.details?.length || 0,
    };
  },

  /** Map full request detail */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      requestCode: apiData.code_request || '-',
      status: apiData.status || 'dalam_pengajuan',
      dateRequest: apiData.date_request || null,
      purpose: apiData.purpose || '',
      evidenceDoc: apiData.evidence_doc || null,
      tipe: apiData.tipe || 'biasa',
      isStokOpening: apiData.tipe === 'opening',
      hasStock: apiData.has_stock ?? null,
      allItemsInMaster: apiData.all_items_in_master ?? null,

      // People
      employeeId: apiData.employee?.id || null,
      employeeName: apiData.employee?.full_name || '-',
      divisionId: apiData.division_id || null,
      divisionName: apiData.division?.name || '-',
      locationId: apiData.location?.id || apiData.location_id || '',
      locationName: apiData.location?.location_name || '-',
      checkerName: apiData.checker?.full_name || null,
      checkedAt: apiData.checked_at || null,
      delivererName: apiData.deliverer?.full_name || null,
      deliveredAt: apiData.delivered_at || null,
      deliveryNotes: apiData.delivery_notes || '',
      cancelNote: apiData.cancel_note || '',

      // Items
      items: (apiData.details || []).map((item) => ({
        id: item.id,
        goodId: item.good_id || null,
        goodName: item.good?.good_name || null,
        goodCode: item.good?.good_code || null,
        merk: item.good?.merk || null,
        isManual: !!item.is_manual,
        itemNameManual: item.item_name_manual || '',
        picId: item.pic_id || null,
        picName: item.pic?.full_name || null,
        categoryId: item.category_id || null,
        categoryName: item.category?.name_category || '-',
        qtyRequest: item.qty_request || 0,
        qtyFulfilled: item.qty_fulfilled || 0,
        stockStatus: item.stock_status || null,
        qtyCurrent: item.qty_current || 0,
        stockId: item.stock_id || null,
        sourceLocationName: item.stock?.location?.location_name || null,
        notes: item.notes || '',
        linkRef: item.link_ref || '',
        destinationDivisionId: item.destination_division_id || null,
        destinationDivisionName: item.destination_division?.name || '',
      })),

      // Linked purchases
      purchases: apiData.purchases || [],
    };
  },

  /** Build create payload */
  toCreatePayload: (formHeader, formItems) => {
    if (!formHeader || !formItems) return {};
    const isDraft = formHeader.status === 'draft';
    const activeItems = isDraft
      ? formItems.filter((item) => item.isManual ? !!item.itemNameManual : !!item.goodId)
      : formItems;

    return {
      location_id: formHeader.locationId,
      employee_id: formHeader.employeeId || formHeader.picGaId || null,
      division_id: formHeader.divisionId || null,
      date_request: formHeader.dateRequest,
      purpose: formHeader.purpose || '',
      tipe: formHeader.tipe || 'biasa',
      status: formHeader.status || 'dalam_pengajuan',
      items: activeItems.map((item) => {
        if (item.isManual) {
          return {
            is_manual: true,
            item_name_manual: item.itemNameManual,
            pic_id: item.picId || null,
            category_id: item.categoryId || null,
            qty_request: Number(item.qtyRequest),
            notes: item.notes || null,
            link_ref: item.linkRef || item.linkReference || null,
            destination_division_id: item.destinationDivisionId || null,
          };
        }
        return {
          good_id: item.goodId,
          pic_id: item.picId || null,
          is_manual: false,
          qty_request: Number(item.qtyRequest),
          notes: item.notes || null,
          link_ref: item.linkRef || item.linkReference || null,
          destination_division_id: item.destinationDivisionId || null,
        };
      }),
    };
  },
};

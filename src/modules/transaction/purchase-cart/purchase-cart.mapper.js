/**
 * PurchaseCartMapper
 * Transforms data between Purchase Cart API structure and UI needs.
 */
export const PurchaseCartMapper = {
  /** Standardize a single cart item for UI list rendering */
  toUIList: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      ownerId: apiData.owner_id || null,
      goodId: apiData.good_id || null,
      itemName: apiData.good?.good_name || apiData.item_name_manual || '-',
      merk: apiData.good?.merk || null,
      goodCode: apiData.good?.good_code || null,
      categoryId: apiData.category_id || null,
      categoryName: apiData.category?.name_category || null,
      locationId: apiData.location_id || null,
      locationName: apiData.location?.location_name || '-',
      qty: Number(apiData.qty) || 0,
      notes: apiData.notes || '',
      createdAt: apiData.created_at || null,
      updatedAt: apiData.updated_at || null,
      sources: (apiData.sources || []).map((s) => ({
        id: s.id,
        requestId: s.request_id || null,
        detailRequestId: s.detail_request_id || null,
        qtyContributed: Number(s.qty_contributed) || 0,
        requestCode: s.request?.code_request || '-',
      })),
    };
  }
};

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
 * MarketingStockMapper
 * Transforms data between API Marketing Stock structures and frontend UI needs.
 * Catatan: barang Marketing bertipe temporary, tidak memiliki merk/kategori/stok minimum seperti stok GA.
 */
export const MarketingStockMapper = {
  /**
   * toUIList — Map stock list item for table display
   */
  toUIList: (apiData) => {
    if (!apiData) return null;
    const qtyCurrent = Number(apiData.qty_current) || 0;
    const unitCost = Number(apiData.unit_cost) || 0;
    const totalValue = qtyCurrent * unitCost;

    return {
      id: apiData.id,
      goodId: apiData.good_id || apiData.good?.id || '',
      locationId: apiData.location_id || apiData.location?.id || '',
      employeeId: apiData.employee_id || '',
      goodName: apiData.good?.good_name || '-',
      goodCode: apiData.good?.good_code || '-',
      locationName: apiData.location?.location_name || '-',
      picName: apiData.employee?.full_name || 'Stok Umum',
      qtyFirst: Number(apiData.qty_first) || 0,
      qtyIn: Number(apiData.qty_in) || 0,
      qtyOut: Number(apiData.qty_out) || 0,
      qtyCurrent,
      unitCost: formatCurrency(unitCost),
      rawUnitCost: unitCost,
      totalValue: formatCurrency(totalValue),
      rawTotalValue: totalValue,
      returnBadge: 'Rp 0 • Tidak Bernilai',
      uomName: apiData.good?.uom?.name || apiData.good?.uom?.code || '-',
      isValued: apiData.is_valued !== false,
    };
  },

  /**
   * toUIDetail — Bentuk camelCase untuk prefill form modal & detail
   */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      goodId: apiData.good_id || apiData.good?.id || '',
      locationId: apiData.location_id || apiData.location?.id || '',
      employeeId: apiData.employee_id || '',
      goodName: apiData.good?.good_name || '',
      goodCode: apiData.good?.good_code || '',
      locationName: apiData.location?.location_name || '',
      picName: apiData.employee?.full_name || '',
      qtyFirst: Number(apiData.qty_first) || 0,
      qtyIn: Number(apiData.qty_in) || 0,
      qtyOut: Number(apiData.qty_out) || 0,
      qtyCurrent: Number(apiData.qty_current) || 0,
      unitCost: Number(apiData.unit_cost) || 0,
      uomName: apiData.good?.uom?.name || apiData.good?.uom?.code || '-',
      isValued: apiData.is_valued !== false,
    };
  },

  /**
   * toCreatePayload — Build POST body for creating a marketing stock record
   */
  toCreatePayload: (form) => ({
    good_id: form.goodId || null,
    location_id: form.locationId || null,
    employee_id: form.employeeId || null,
    is_valued: form.isValued !== false,
    qty_first: Number(form.qtyFirst) || 0,
    unit_cost: form.isValued !== false ? (Number(form.unitCost) || 0) : 0,
  }),

  /**
   * toUpdatePayload — Build PUT body for updating a marketing stock record
   */
  toUpdatePayload: (form) => ({
    location_id: form.locationId || null,
    employee_id: form.employeeId || null,
    qty_first: Number(form.qtyFirst) || 0,
    unit_cost: form.isValued !== false ? (Number(form.unitCost) || 0) : 0,
  }),

  /**
   * toMovementUI — Map movement record for display
   */
  toMovementUI: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      dateMovement: apiData.date_movement || '-',
      movementType: apiData.movement_type || '-',
      qty: Number(apiData.qty) || 0,
      costPerUnit: Number(apiData.cost_per_unit) || 0,
      balanceAfter: Number(apiData.balance_after) || 0,
      notes: apiData.notes || '-',
      refTable: apiData.ref_table || null,
      refId: apiData.ref_id || null,
      locationName: apiData.location?.location_name || '-',
    };
  },

  /**
   * toMovementPayload — Body untuk POST /marketing/stocks/:id/movements
   */
  toMovementPayload: (form) => {
    if (!form) return {};
    const payload = {
      location_id: form.locationId || null,
      movement_type: form.movementType || 'in',
      qty: Number(form.qty) || 0,
      notes: form.notes || '',
    };
    if (payload.movement_type === 'in') {
      payload.cost_per_unit = Number(form.costPerUnit) || 0;
    }
    if (form.movementType === 'adjustment') {
      payload.adjustment_field = form.adjustmentField || 'qty_first';
      payload.adjustment_value = Number(form.adjustmentValue) || 0;
    }
    return payload;
  },
};

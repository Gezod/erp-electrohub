import { STOCK_TYPES } from '@/utils/stockType';

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
 * StockMapper
 * Transforms data between API Stock structures and frontend UI needs.
 * Aligned with API spec: unit_cost, qty_current, notes, ref_table, ref_id, etc.
 */
export const StockMapper = {
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
      merk: apiData.good?.merk || '-',
      goodCode: apiData.good?.good_code || '-',
      categoryName: apiData.good?.category?.name_category || '-',
      locationName: apiData.location?.location_name || '-',
      qtyFirst: Number(apiData.qty_first) || 0,
      qtyIn: Number(apiData.qty_in) || 0,
      qtyOut: Number(apiData.qty_out) || 0,
      qtyCurrent: qtyCurrent,
      unitCost: formatCurrency(unitCost),
      totalValue: formatCurrency(totalValue),
      returnBadge: 'Rp 0 • Tidak Bernilai',
      uomName: apiData.good?.uom?.name || apiData.good?.uom?.abbreviation || '-',
      picName: apiData.employee?.full_name || '-',
      tipe: apiData.tipe || 'biasa',
      isValued: apiData.tipe ? apiData.tipe !== 'retur' : apiData.is_valued !== false,
      isStokOpening: apiData.tipe === 'opening',
    };
  },

  /**
   * toUIDetail — Full stock detail for detail/form page
   */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      // Raw snake_case fields — used directly in detail.vue template
      good_id: apiData.good_id || '',
      location_id: apiData.location_id || '',
      employee_id: apiData.employee_id || '',
      qty_first: Number(apiData.qty_first) || 0,
      qty_in: Number(apiData.qty_in) || 0,
      qty_out: Number(apiData.qty_out) || 0,
      qty_current: Number(apiData.qty_current) || 0,
      unit_cost: Number(apiData.unit_cost) || 0,
      tipe: apiData.tipe || 'biasa',
      is_valued: apiData.tipe ? apiData.tipe !== 'retur' : apiData.is_valued !== false,
      is_stok_opening: apiData.tipe === 'opening',
      isStokOpening: apiData.tipe === 'opening',
      // Nested relations
      good: apiData.good || null,
      location: apiData.location || null,
      employee: apiData.employee || null,
      // camelCase aliases — used by form.vue
      tipeStok: apiData.tipe || 'biasa',
      goodId: apiData.good_id || apiData.good?.id || '',
      locationId: apiData.location_id || apiData.location?.id || '',
      qtyFirst: Number(apiData.qty_first) || 0,
      qtyIn: Number(apiData.qty_in) || 0,
      qtyOut: Number(apiData.qty_out) || 0,
      qtyCurrent: Number(apiData.qty_current) || 0,
      unitCost: Number(apiData.unit_cost) || 0,
      picGaId: apiData.employee_id || '',
    };
  },

  /**
   * toCreatePayload — Payload for POST /stocks
   */
  toCreatePayload: (form) => {
    if (!form) return {};
    return {
      good_id: form.goodId || null,
      location_id: form.locationId || null,
      employee_id: form.picGaId || null,
      tipe: STOCK_TYPES.includes(form.tipe) ? form.tipe : 'biasa',
      qty_first: Number(form.qtyFirst) || 0,
      unit_cost: form.tipe !== 'retur' ? (Number(form.unitCost) || 0) : 0,
    };
  },

  toUpdatePayload: (form) => {
    if (!form) return {};
    const payload = {};
    if (form.locationId !== undefined) payload.location_id = form.locationId || null;
    if (form.qtyFirst !== undefined) payload.qty_first = Number(form.qtyFirst) || 0;
    if (form.unitCost !== undefined) payload.unit_cost = Number(form.unitCost) || 0;
    if (form.picGaId !== undefined) payload.employee_id = form.picGaId || null;
    return payload;
  },

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
      notes: apiData.notes || '-',
      refNotes: apiData.refNotes || null,
      refTable: apiData.ref_table || null,
      refId: apiData.ref_id || null,
      adjustmentField: apiData.adjustment_field || null,
      adjustmentValue: apiData.adjustment_value != null ? Number(apiData.adjustment_value) : null,
      locationName: apiData.location?.location_name || '-',
    };
  },

  /**
   * toMovementPayload — Payload for POST /stocks/:id/movements
   */
  toMovementPayload: (form) => {
    if (!form) return {};
    const payload = {
      location_id: form.locationId || null,
      movement_type: form.movementType || 'in',
      qty: Number(form.qty) || 0,
      notes: form.notes || '',
    };

    // Optional reference fields
    if (form.refTable) payload.ref_table = form.refTable;
    if (form.refId) payload.ref_id = form.refId;

    // Adjustment-specific fields
    if (form.movementType === 'adjustment') {
      payload.adjustment_field = form.adjustmentField || 'qty_first';
      payload.adjustment_value = Number(form.adjustmentValue) || 0;
    }

    return payload;
  },
};

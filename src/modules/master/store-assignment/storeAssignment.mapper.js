/**
 * StoreAssignmentMapper
 * Mentransformasi data antara struktur API Store Assignment dan kebutuhan UI.
 */
export const StoreAssignmentMapper = {
  toUIList: (item) => {
    if (!item) return null;
    return {
      id: item.id,
      employeeId: item.employee_id,
      storeLocationId: item.store_location_id,
      employeeName: item.employee?.full_name || '-',
      employeeInitials: item.employee?.full_name?.charAt(0) || '?',
      employeePosition: item.employee?.position?.name || '-',
      storeName: item.store_location?.location_name || '-',
      storeDistrict: item.store_location?.location_district || 'Toko',
      assignedAt: item.assigned_at || null,
      unassignedAt: item.unassigned_at || null,
      status: item.status || (item.unassigned_at ? 'nonaktif' : 'aktif'),
      notes: item.notes || '',
      employee: item.employee || null,
      store_location: item.store_location || null,
      raw: item
    };
  },

  toUIDetail: (item) => {
    if (!item) return null;
    return {
      id: item.id,
      employee_id: item.employee_id || '',
      store_location_id: item.store_location_id || '',
      notes: item.notes || '',
      status: item.status || 'aktif',
      employee: item.employee || null,
      store_location: item.store_location || null
    };
  },

  toPayload: (form, isEdit = false, original = {}) => {
    if (!isEdit) {
      return {
        employee_id: form.employee_id,
        store_location_id: form.store_location_id,
        notes: (form.notes || '').trim() || null
      };
    }
    const payload = {};
    if (form.employee_id !== original.employee_id) payload.employee_id = form.employee_id;
    if (form.store_location_id !== original.store_location_id) payload.store_location_id = form.store_location_id;
    const notes = (form.notes || '').trim();
    if (notes !== (original.notes || '').trim()) payload.notes = notes || null;
    return payload;
  }
};

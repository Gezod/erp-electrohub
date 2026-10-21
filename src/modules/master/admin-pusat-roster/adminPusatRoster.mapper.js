/**
 * AdminPusatRosterMapper
 * Mentransformasi data antara struktur API Roster Admin Pusat dan kebutuhan UI.
 */
export const AdminPusatRosterMapper = {
  toUIList: (item) => {
    if (!item) return null;
    return {
      id: item.id,
      employeeId: item.employee_id,
      officeLocationId: item.office_location_id,
      employeeName: item.employee?.full_name || '-',
      employeeInitials: item.employee?.full_name?.charAt(0) || '?',
      employeePosition: item.employee?.position?.name || '-',
      officeName: item.office_location?.location_name || '-',
      officeDistrict: item.office_location?.location_district || 'Office',
      assignedAt: item.assigned_at || null,
      unassignedAt: item.unassigned_at || null,
      status: item.status || (item.unassigned_at ? 'nonaktif' : 'aktif'),
      notes: item.notes || '',
      employee: item.employee || null,
      office_location: item.office_location || null,
      raw: item
    };
  },

  toUIDetail: (item) => {
    if (!item) return null;
    return {
      id: item.id,
      employee_id: item.employee_id || '',
      office_location_id: item.office_location_id || '',
      notes: item.notes || '',
      status: item.status || 'aktif',
      employee: item.employee || null,
      office_location: item.office_location || null
    };
  },

  toPayload: (form, isEdit = false, original = {}) => {
    if (!isEdit) {
      return {
        employee_id: form.employee_id,
        office_location_id: form.office_location_id,
        notes: (form.notes || '').trim() || null
      };
    }
    const payload = {};
    if (form.employee_id !== original.employee_id) payload.employee_id = form.employee_id;
    if (form.office_location_id !== original.office_location_id) payload.office_location_id = form.office_location_id;
    const notes = (form.notes || '').trim();
    if (notes !== (original.notes || '').trim()) payload.notes = notes || null;
    return payload;
  }
};

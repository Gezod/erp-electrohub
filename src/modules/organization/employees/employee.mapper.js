/**
 * EmployeeMapper
 * Handles transformations between backend API models and standardized UI frontend objects (Domain HR).
 * Supports accounts, personal info, placement, payroll, mutation tracking, and historical data.
 */
export const EmployeeMapper = {
  /**
   * toUI / toUIDetail
   * Maps detailed nested employee data from response.data.
   */
  toUI: (apiData) => {
    if (!apiData) return null;

    const core = apiData || {};
    const emp = apiData?.employee || {};

    const fullName = emp.full_name || core.full_name || core.name || '-';
    const employeeNumber = emp.employee_number || core.employee_number || '';
    const nik = emp.nik || core.nik || emp.national_id || core.national_id || '-';

    // Format Emergency Contact
    let ecName = emp.emergency_contact_name || '';
    let ecPhone = emp.emergency_contact_phone || '';
    if (!ecName && emp.emergency_contact) {
      const parts = String(emp.emergency_contact).split(' - ');
      ecName = parts[0] || '';
      ecPhone = parts[1] || '';
    }

    return {
      // Core Account Info
      id: core.id || '',
      employeeId: emp.id || core.employee_id || core.id || '',
      value: emp.id || core.employee_id || core.id || '',

      // Detailed Employee Info
      employeeNumber: employeeNumber,
      nik: nik,
      fullName: fullName,
      name: fullName,
      full_name: fullName,
      label: employeeNumber ? `${fullName} (${employeeNumber})` : fullName,
      nickname: emp.nickname || core.nickname || '',
      gender: emp.gender || core.gender || 'male',
      dateOfBirth: emp.date_of_birth
        ? emp.date_of_birth.split('T')[0]
        : core.date_of_birth
        ? core.date_of_birth.split('T')[0]
        : null,
      placeOfBirth: emp.place_of_birth || core.place_of_birth || '',
      nationalId: emp.national_id || core.national_id || '',
      phone: emp.phone || core.phone || '',

      // Email Mapping
      email: core.email || '',
      employeeEmail: emp.email || core.employee_email || emp.employee_email || '',

      address: emp.address || core.address || '',
      emergencyContact: emp.emergency_contact || core.emergency_contact || '',
      emergencyContactName: ecName,
      emergencyContactPhone: ecPhone,
      photoUrl: emp.photo_url || core.photo_url || null,

      // Financial & Payroll
      bankName: emp.bank_name || '',
      bankAccountNumber: emp.bank_account_number || '',
      bankAccountHolder: emp.bank_account_holder || '',
      trainingNotes: emp.training_notes || '',

      // Operational & Placement Info
      locationId: emp.location?.id || core.location?.id || emp.location_id || core.location_id || null,
      divisionId: emp.division?.id || core.division?.id || emp.division_id || core.division_id || null,
      positionId: emp.position?.id || emp.position_id || core.position_id || null,
      supervisorId: emp.supervisor?.id || emp.supervisor_id || core.supervisor_id || null,
      hrgaPicId: emp.hrga_pic?.id || emp.hrga_pic_id || core.hrga_pic_id || null,
      status: emp.status || core.status || 'active',
      isChief: !!(emp.is_chief || core.is_chief),
      joinDate: emp.join_date
        ? emp.join_date.split('T')[0]
        : core.join_date
        ? core.join_date.split('T')[0]
        : null,
      notes: emp.notes || core.notes || '',

      // Relational Metadata
      location: emp.location || core.location || null,
      division: emp.division || core.division || null,
      position: emp.position || core.position || null,
      supervisor: emp.supervisor || core.supervisor || null,
      hrgaPic: emp.hrga_pic || core.hrga_pic || null,

      // Display Helpers
      locationName: emp.location?.location_name || core.location?.location_name || '-',
      divisionName: emp.division?.name || core.division?.name || '-',
      positionName: emp.position?.name || core.position?.name || (emp.is_chief ? 'Chief Executive' : '-'),

      // Historical Data
      histories: (emp.histories || core.histories || []).map((h) => ({
        id: h.id,
        changeType: h.change_type,
        effectiveDate: h.effective_date,
        reason: h.reason,
        notes: h.notes,
        createdAt: h.created_at,
      })),
    };
  },

  /**
   * toUIList
   * Alias untuk list item.
   */
  toUIList: (data) => EmployeeMapper.toUI(data),

  /**
   * toUIDetail
   * Alias untuk detail data.
   */
  toUIDetail: (data) => EmployeeMapper.toUI(data),

  /**
   * toPagination
   * Format metadata paginasi dari response API backend.
   */
  toPagination: (apiPagination, fallbackTotal = 0) => {
    if (!apiPagination) {
      return {
        currentPage: 1,
        dataPerPage: 10,
        totalData: fallbackTotal,
        totalPages: Math.ceil(fallbackTotal / 10) || 1,
      };
    }

    const page = Number(apiPagination.currentPage || apiPagination.page || 1);
    const limit = Number(apiPagination.dataPerPage || apiPagination.limit || 10);
    const total = Number(apiPagination.totalData ?? apiPagination.total ?? fallbackTotal);
    const totalPages = Number(apiPagination.totalPages || Math.ceil(total / limit) || 1);

    return {
      currentPage: page,
      dataPerPage: limit,
      totalData: total,
      totalPages: totalPages,
    };
  },

  /**
   * toPayloadCreate
   * Maps combined payload for POST /users.
   */
  toPayloadCreate: (form) => {
    const toNull = (val) => (val === '' || val === undefined ? null : val);
    const emergencyContact = [form.emergencyContactName, form.emergencyContactPhone]
      .filter(Boolean)
      .join(' - ');

    return {
      // Account Data
      email: form.email ? String(form.email).trim() : '',
      password: form.password || undefined,

      // Employee Detailed Data
      employee_number: toNull(form.employeeNumber),
      full_name: toNull(form.fullName),
      nickname: toNull(form.nickname),
      gender: toNull(form.gender),
      date_of_birth: toNull(form.dateOfBirth),
      place_of_birth: toNull(form.placeOfBirth),
      national_id: toNull(form.nationalId),
      phone: toNull(form.phone),
      employee_email: toNull(form.employeeEmail),
      address: toNull(form.address),
      emergency_contact: toNull(emergencyContact),
      emergency_contact_name: toNull(form.emergencyContactName),
      emergency_contact_phone: toNull(form.emergencyContactPhone),

      // Operational Data
      location_id: toNull(form.locationId),
      division_id: toNull(form.divisionId),
      position_id: toNull(form.positionId),
      status: toNull(form.status),
      is_chief: !!form.isChief,
      join_date: toNull(form.joinDate),
      notes: toNull(form.notes),

      // Financial & Hierarchy
      bank_name: toNull(form.bankName),
      bank_account_number: toNull(form.bankAccountNumber),
      bank_account_holder: toNull(form.bankAccountHolder),
      training_notes: toNull(form.trainingNotes),
      supervisor_id: toNull(form.supervisorId),
      hrga_pic_id: toNull(form.hrgaPicId),
    };
  },

  /**
   * toPayloadUpdate
   * Maps data for PATCH /users/:id/employee including mutation metadata.
   */
  toPayloadUpdate: (form) => {
    const toNull = (val) => (val === '' || val === undefined ? null : val);
    const emergencyContact = [form.emergencyContactName, form.emergencyContactPhone]
      .filter(Boolean)
      .join(' - ');

    const payload = {
      // Base Profile
      full_name: toNull(form.fullName),
      nickname: toNull(form.nickname),
      gender: toNull(form.gender),
      date_of_birth: toNull(form.dateOfBirth),
      place_of_birth: toNull(form.placeOfBirth),
      national_id: toNull(form.nationalId),
      phone: toNull(form.phone),
      employee_email: toNull(form.employeeEmail),
      address: toNull(form.address),
      emergency_contact: toNull(emergencyContact),
      emergency_contact_name: toNull(form.emergencyContactName),
      emergency_contact_phone: toNull(form.emergencyContactPhone),

      // Operational
      employee_number: toNull(form.employeeNumber),
      location_id: toNull(form.locationId),
      division_id: toNull(form.divisionId),
      position_id: toNull(form.positionId),
      status: toNull(form.status),
      is_chief: !!form.isChief,
      join_date: toNull(form.joinDate),
      notes: toNull(form.notes),

      // Financial & Hierarchy
      bank_name: toNull(form.bankName),
      bank_account_number: toNull(form.bankAccountNumber),
      bank_account_holder: toNull(form.bankAccountHolder),
      training_notes: toNull(form.trainingNotes),
      supervisor_id: toNull(form.supervisorId),
      hrga_pic_id: toNull(form.hrgaPicId),

      // Account Info
      email: toNull(form.email),
      is_superadmin: !!form.isSuperadmin,
    };

    // Mutation Metadata (if selected)
    if (form.changeType) {
      payload.change_type = form.changeType;
      payload.effective_date = toNull(form.effectiveDate);
      payload.reason = toNull(form.reason);
    }

    return payload;
  },

  /**
   * toPayloadHistory
   * Maps manual history entry payload.
   */
  toPayloadHistory: (form) => {
    const toNull = (val) => (val === '' || val === undefined ? null : val);
    return {
      change_type: toNull(form.changeType),
      effective_date: toNull(form.effectiveDate),
      reason: toNull(form.reason),
      notes: toNull(form.notes),
    };
  },

  /**
   * toPhotoFormData
   * Maps image file to FormData for multipart upload.
   */
  toPhotoFormData: (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return formData;
  },
};

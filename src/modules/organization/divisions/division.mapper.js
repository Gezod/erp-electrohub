/**
 * DivisionMapper
 * Transformasi data antara format API backend dan standar UI frontend (DDD Pattern).
 * Sesuai spesifikasi endpoint /api/divisions (struktur flat tanpa parent/children).
 */
export const DivisionMapper = {
  /**
   * toUI / toUIDetail
   * Menstandarisasi model satu divisi dari API untuk komponen Vue.
   */
  toUI: (data) => {
    if (!data) return null;

    // Resolusi nama pimpinan dengan null-safety bertingkat
    let chiefDisplay = '-';
    if (data.chief) {
      chiefDisplay =
        data.chief.employee?.full_name ||
        data.chief.employee?.name ||
        data.chief.employee_name ||
        data.chief.title ||
        (typeof data.chief === 'string' ? data.chief : '-');
    }

    // Resolusi daftar manager divisi
    const managers = (data.managers || []).map((m) => {
      const emp = m.manager || m.employee || m;
      return {
        id: emp.id || m.employee_id || '',
        employeeId: emp.id || m.employee_id || '',
        fullName: emp.full_name || emp.fullName || emp.name || '-',
        employeeNumber: emp.employee_number || emp.employeeNumber || '',
        positionName: emp.position?.name || '',
      };
    });

    // Resolusi daftar employees jika ada di response detail
    const employees = (data.employees || []).map((e) => ({
      id: e.id || '',
      fullName: e.full_name || e.fullName || '-',
      employeeNumber: e.employee_number || e.employeeNumber || '',
      status: e.status || 'active',
      positionName: e.position?.name || '-',
    }));

    return {
      id: data.id || '',
      name: data.name || '-',
      description: data.description || '-',
      is_active: data.is_active ?? true,
      status: data.is_active === false ? 'Nonaktif' : 'Aktif',
      chief_id: data.chief_id || null,
      chief_name: chiefDisplay,
      chief_title: data.chief?.title || '',
      employee_count: data._count?.employees ?? (Array.isArray(data.employees) ? data.employees.length : 0),
      employees,
      managers,
      manager_ids: managers.map((m) => m.id),
      created_at: data.created_at || null,
      updated_at: data.updated_at || null,
    };
  },

  /**
   * toUIList
   * Alias untuk item list
   */
  toUIList: (data) => DivisionMapper.toUI(data),

  /**
   * toUIDetail
   * Alias untuk data detail
   */
  toUIDetail: (data) => DivisionMapper.toUI(data),

  /**
   * toUIFlatten
   * Mengonversi raw list dari API ke list UI standar (semua divisi flat).
   */
  toUIFlatten: (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map(DivisionMapper.toUI).filter(Boolean);
  },

  /**
   * toPagination
   * Format metadata paginasi dari response API backend.
   * Mendukung format:
   * 1. { "totalData": 101, "currentPage": 1, "totalPages": 11, "dataPerPage": 10 }
   * 2. { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
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
   * toPayload
   * Menyiapkan data form untuk dikirim ke API (POST / PUT).
   */
  toPayload: (formData) => {
    return {
      name: formData.name ? String(formData.name).trim() : '',
      description: formData.description ? String(formData.description).trim() : null,
      is_active: formData.is_active !== undefined ? Boolean(formData.is_active) : undefined,
      chief_id: formData.chief_id || null,
      manager_ids: Array.isArray(formData.manager_ids) ? formData.manager_ids : [],
    };
  },
};

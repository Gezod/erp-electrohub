/**
 * ChiefMapper
 * Transformasi data antara format API backend dan standar UI frontend (DDD Pattern).
 */
export const ChiefMapper = {
  /**
   * toUI / toUIDetail
   * Menstandarisasi model satu chief dari API untuk komponen Vue.
   */
  toUI: (data) => {
    if (!data) return null;

    const fullName =
      data.employee?.full_name ||
      data.employee?.name ||
      data.employee_name ||
      '-';

    const nik =
      data.employee?.employee_number ||
      data.employee?.nik ||
      data.employee_nik ||
      '-';

    const divisionNames = Array.isArray(data.divisions)
      ? data.divisions.map((div) => div.name).filter(Boolean).join(', ') || '-'
      : '-';

    return {
      id: data.id || '',
      title: data.title || '-',
      employee_id: data.employee_id || data.employee?.id || null,
      employee_name: fullName,
      employee_nik: nik,
      divisions_list: divisionNames,
      is_active: data.is_active ?? true,
      status: data.is_active === false ? 'Nonaktif' : 'Aktif',
      created_at: data.created_at || null,
      updated_at: data.updated_at || null,
    };
  },

  /**
   * toUIList
   * Alias untuk item list
   */
  toUIList: (data) => ChiefMapper.toUI(data),

  /**
   * toUIDetail
   * Alias untuk data detail
   */
  toUIDetail: (data) => ChiefMapper.toUI(data),

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
   * toPayload
   * Menyiapkan data form untuk dikirim ke API (POST / PUT).
   */
  toPayload: (formData) => {
    return {
      title: formData.title ? String(formData.title).trim() : '',
      employee_id: formData.employee_id || null,
      is_active: formData.is_active !== undefined ? Boolean(formData.is_active) : undefined,
    };
  },
};

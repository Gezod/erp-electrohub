/**
 * PositionMapper
 * Mentransformasi data antara struktur API dan kebutuhan UI untuk modul Position.
 */
export const PositionMapper = {
  /**
   * toUI
   * Pemetaan dari data API (snake_case) ke format UI (camelCase).
   */
  toUI: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      code: apiData.code || '',
      name: apiData.name || '',
      isActive: !!apiData.is_active,
      sortOrder: apiData.sort_order || 0,
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at
    };
  },

  /**
   * toPayload
   * Pemetaan dari state form (camelCase) ke payload API (snake_case).
   */
  toPayload: (form) => {
    if (!form) return {};
    return {
      code: form.code,
      name: form.name,
      is_active: !!form.isActive,
      sort_order: parseInt(form.sortOrder) || 0
    };
  }
};

/**
 * PermissionsMapper
 * Mentransformasi data antara struktur API dan kebutuhan UI untuk Master Permissions.
 */
export const PermissionsMapper = {
  /**
   * toUI
   * Menstandarisasi objek permission untuk tampilan tabel.
   */
  toUI: (apiData) => {
    return {
      id: apiData.id || '',
      code: apiData.code || '',
      name: apiData.name || '',
      description: apiData.description || '',
      module: apiData.module || '',
      action: apiData.action || '',
      createdAt: apiData.created_at || null
    };
  },

  /**
   * toPayloadCreate
   * Menyusun payload untuk pembuatan permission baru.
   */
  toPayloadCreate: (form) => {
    return {
      code: form.code,
      name: form.name,
      description: form.description,
      module: form.module,
      action: form.action
    };
  }
};

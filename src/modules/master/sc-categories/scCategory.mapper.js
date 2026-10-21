/**
 * ScCategoryMapper
 * Mentransformasi data antara API dan UI untuk modul Master Kategori SKU (Supply Chain).
 */
export const ScCategoryMapper = {
  toUI: (data) => {
    if (!data) return null;
    return {
      id: data.id || '',
      code: (data.code || '').toUpperCase(),
      name: data.name || data.name_category || '',
      description: data.description && data.description !== '-' ? data.description : '-',
      is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
      created_at: data.created_at || null,
      updated_at: data.updated_at || null,
    };
  },

  toPayload: (formData) => {
    return {
      code: (formData.code || '').trim().toUpperCase(),
      name: (formData.name || '').trim(),
      description: formData.description ? formData.description.trim() : null,
      is_active: typeof formData.is_active === 'boolean' ? formData.is_active : true,
    };
  }
};

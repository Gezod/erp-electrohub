/**
 * UomMapper
 * Berfungsi untuk mentransformasi data antara API dan UI (DDD Pattern).
 */
export const UomMapper = {
  /**
   * toUI
   * Menstandarisasi model data dari API agar aman digunakan di UI.
   */
  toUI: (data) => {
    return {
      id: data.id || '',
      code: data.code || '',
      name: data.name || '',
      description: data.description || '-',
      is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
      goods_count: data._count?.goods || 0,
      created_at: data.created_at || null,
      updated_at: data.updated_at || null
    };
  },

  /**
   * toUIList
   * Transformasi array data dari API.
   */
  toUIList: (rawData) => {
    if (!Array.isArray(rawData)) return [];
    return rawData.map(item => UomMapper.toUI(item));
  },

  /**
   * toPayload
   * Menyiapkan data form untuk dikirim ke API (POST/PUT).
   */
  toPayload: (formData) => {
    return {
      code: formData.code,
      name: formData.name,
      description: formData.description,
      is_active: formData.is_active
    };
  }
};

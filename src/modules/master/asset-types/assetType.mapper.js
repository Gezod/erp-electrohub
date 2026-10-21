/**
 * AssetTypeMapper
 * Berfungsi untuk mentransformasi data antara API dan UI (DDD Pattern).
 */
export const AssetTypeMapper = {
  /**
   * toUI
   * Menstandarisasi model data dari API agar aman digunakan di UI.
   */
  toUI: (data) => {
    return {
      ...data,
      id: data.id || data.type?.id || '',
      name_type: data.name_type || data.type?.name_type || '',
      is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
    }
  },

  /**
   * toPayload
   * Menyiapkan data form untuk dikirim ke API (POST/PUT).
   * Memastikan field dipetakan ke property 'name_type' sesuai spesifikasi.
   */
  toPayload: (formData) => {
    return {
      name_type: formData.name_type,
      is_active: formData.is_active,
    }
  },
}

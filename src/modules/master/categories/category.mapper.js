/**
 * CategoryMapper
 * Berfungsi untuk mentransformasi data antara API dan UI (DDD Pattern).
 */
export const CategoryMapper = {
  /**
   * toUI
   * Menstandarisasi model data dari API agar aman digunakan di UI.
   * Memastikan array children tersedia dan field memiliki default value.
   */
  toUI: (data) => {
    return {
      id: data.id || '',
      name_category: data.name_category || '',
      description: data.description || '-',
      parent_id: data.parent_id || null,
      is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
      is_asset: typeof data.is_asset === 'boolean' ? data.is_asset : false,
      level: data.level || 0, 
      children_count: data.count_children !== undefined ? data.count_children : (Array.isArray(data.children) ? data.children.length : 0),
      children: Array.isArray(data.children) 
        ? data.children.map(CategoryMapper.toUI)
        : []
    };
  },

  /**
   * toUIFlatten
   * Mengonversi struktur pohon (tree) ke list datar (flattened list) 
   * dengan informasi level untuk indentasi.
   */
  toUIFlatten: (items) => {
    const flattened = [];

    const recurse = (list, level = 0) => {
      list.forEach((item) => {
        // Ensure item is standardized but don't deep map children here 
        // because we are flattening anyway
        item.level = level;
        flattened.push(item);

        if (item.children && item.children.length > 0) {
          recurse(item.children, level + 1);
        }
      });
    };

    recurse(items);
    return flattened;
  },

  /**
   * toPayload
   * Menyiapkan data form untuk dikirim ke API (POST/PUT).
   * Disederhanakan untuk hanya mendukung 1 kategori/sub-kategori per request.
   */
  toPayload: (formData) => {
    return {
      name_category: formData.name_category,
      parent_id: formData.parent_id || null, // Mendukung single parent_id
      description: formData.description,
      is_active: formData.is_active,
      is_asset: formData.is_asset
    };
  }
};

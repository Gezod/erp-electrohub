/**
 * Category Mapper
 * Menstandarisasi response API kategori yang beragam menjadi format yang konsisten untuk UI.
 */
export const CategoryMapper = {
  /**
   * Mengonversi data dari API ke format UI.
   * - name_type atau name_category menjadi 'name'.
   * - Menjamin properti 'children' selalu ada sebagai array.
   */
  toUI: (apiData) => {
    if (!Array.isArray(apiData)) return [];

    return apiData.map((item) => ({
      id: item.id,
      name: item.name_type || item.name_category || 'N/A',
      is_active: item.is_active !== undefined ? item.is_active : true,
      is_asset: item.is_asset === true,
      children: Array.isArray(item.children)
        ? item.children.map((child) => ({
            id: child.id,
            name: child.name_category || child.name_type || 'N/A',
            is_active: child.is_active !== undefined ? child.is_active : true,
            is_asset: child.is_asset === true,
          }))
        : [],
    }));
  },
};

// src/mappers/goods.mapper.js

export const GoodsMapper = {
  /**
   * toPayload
   * Menerjemahkan data dari form UI ke format yang diminta API (Create/Update).
   */
  toPayload: (formData) => {
    return {
      category_id: formData.category_id,
      asset_type_id: formData.asset_type_id || null,
      good_code: formData.good_code,
      good_name: formData.good_name,
      code_abbr: formData.code_abbr?.trim() || null,
      merk: formData.merk || '-',
      is_active: formData.is_active === false ? false : true,
      stock_first: Number(formData.stock_first || 0),
      stock_minimum: Number(formData.stock_minimum || 0),
      uom_id: formData.uom_id || null,
    }
  },

  /**
   * toUI
   * Menerjemahkan response API ke format yang digunakan di tabel/form UI.
   * Menangani struktur category nested (category.parent).
   */
  toUI: (item) => {
    if (!item) return null

    // Logika resolusi Kategori Utama dan Sub-Kategori
    // Jika item.category memiliki parent, maka parent = Kategori Utama, category = Sub-Kategori.
    const category = item.category
    const parent = category?.parent

    return {
      ...item,
      id: item.id || item.good?.id || '',
      goodName: item.good_name || item.good?.good_name || '',
      goodCode: item.good_code || item.good?.good_code || '',
      categoryName: parent ? parent.name_category : category?.name_category || '-',

      // Tetap sediakan snake_case jika ada komponen lama yang memakainya
      good_name: item.good_name || item.good?.good_name || '',
      good_code: item.good_code || item.good?.good_code || '',
      category_name: parent ? parent.name_category : category?.name_category || '-',
      sub_category_name: parent ? category.name_category : '-',

      // Simpan ID aslinya untuk keperluan dropdown/edit
      category_id: item.category_id,
      asset_type_id: item.asset_type_id,
      uom_id: item.uom_id,
      is_active:
        item.is_active !== undefined ? item.is_active === 1 || item.is_active === true : true,
    }
  },
}

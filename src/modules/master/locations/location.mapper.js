/**
 * LocationMapper
 * Berfungsi untuk mentransformasi data antara server (API) dan antarmuka (UI).
 */
export const LocationMapper = {
  /**
   * toUI
   * Menstandarisasi format data lokasi dari API untuk dikonsumsi komponen Vue.
   */
  toUI: (data) => {
    const rawChildren = Array.isArray(data.children) 
      ? data.children 
      : (Array.isArray(data.sub_locations) ? data.sub_locations : (Array.isArray(data.childs) ? data.childs : []));

    const countChildren = data.count_children !== undefined 
      ? Number(data.count_children) 
      : (data.children_count !== undefined ? Number(data.children_count) : rawChildren.length);

    const locName = data.location_name || data.location?.location_name || data.name || '';
    const locId = data.id || data.location?.id || '';

    return {
      ...data,
      id: locId,
      value: locId,
      location_name: locName,
      name: locName,
      label: locName,
      location_type: data.location_type || 'office',
      location_district: data.location_district || '',
      maps_url: data.maps_url || '',
      parent_id: data.parent_id || null,
      parent: data.parent ? { id: data.parent.id, location_name: data.parent.location_name } : null,
      is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
      level: data.level || 0,
      children_count: countChildren,
      children: rawChildren.map(LocationMapper.toUI),
      // Metadata tambahan untuk UI
      display_type: {
        'office': 'Kantor',
        'gudang': 'Gudang',
        'store': 'Toko'
      }[data.location_type] || data.location_type
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
   * Menyiapkan objek payload untuk POST/PUT sesuai spesifikasi API.
   */
  toPayload: (formData) => {
    return {
      location_name: formData.location_name,
      location_type: formData.location_type,
      location_district: formData.location_district,
      parent_id: formData.parent_id || null,
      maps_url: formData.maps_url,
      is_active: !!formData.is_active
    };
  }
};

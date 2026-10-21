export const MarketingGoodsMapper = {
  toPayload: (form) => ({
    good_code: form.good_code?.trim() || undefined,
    good_name: form.good_name,
    uom_id: form.uom_id,
    tipe_barang: form.tipe_barang,
    asset_type_id: form.tipe_barang === 'permanent' ? (form.asset_type_id || null) : null,
    code_abbr: form.tipe_barang === 'permanent' ? (form.code_abbr?.trim() || null) : null,
    is_active: form.is_active !== false,
  }),

  toUI: (item) => {
    if (!item) return null
    return {
      ...item,
      uom_name: item.uom?.name || '-',
      asset_type_name: item.asset_type?.name_type || '-',
    }
  },
}

/**
 * VehicleMapper
 * Mentransformasi data antara struktur API Vehicles dan kebutuhan UI.
 */
export const VehicleMapper = {
  /**
   * toUIList
   * Menstandarisasi objek vehicle untuk tampilan tabel list.
   */
  toUIList: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      vehicleType: apiData.vehicle_type || '-',
      plateNumber: apiData.plate_number || '-',
      nameStnk: apiData.name_stnk || '-',
      dateStnk: apiData.date_stnk || null,
      dateService: apiData.date_service || null,
      dateChangePlate: apiData.date_change_plate || null,
      intervalService: apiData.interval_service ? `${apiData.interval_service} Bulan` : '-',
      intervalServiceRaw: apiData.interval_service || 0,
      isActive: apiData.is_active ?? false,
      isDraft: apiData.is_draft ?? false,
      status: apiData.is_draft ? 'Draft' : (apiData.is_active ? 'Aktif' : 'Nonaktif'),
      alertDaysBefore: apiData.alert_days_before || []
    };
  },

  /**
   * toUIDetail
   * Melakukan transformasi detail lengkap untuk kebutuhan form/view detail.
   */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      vehicleType: apiData.vehicle_type || '',
      plateNumber: apiData.plate_number || '',
      nameStnk: apiData.name_stnk || '',
      dateStnk: apiData.date_stnk ? apiData.date_stnk.split('T')[0] : '',
      dateService: apiData.date_service ? apiData.date_service.split('T')[0] : '',
      dateChangePlate: apiData.date_change_plate ? apiData.date_change_plate.split('T')[0] : '',
      intervalService: apiData.interval_service || 6,
      isActive: apiData.is_active ?? true,
      isDraft: apiData.is_draft ?? false,
      alertDaysBefore: apiData.alert_days_before || []
    };
  },

  /**
   * toPayload
   * Payload untuk create/update (POST/PUT).
   */
  toPayload: (form) => {
    if (!form) return {};
    return {
      vehicle_type: form.vehicleType || '',
      plate_number: form.plateNumber || '',
      name_stnk: form.nameStnk || '',
      date_stnk: form.dateStnk || null,
      date_service: form.dateService || null,
      date_change_plate: form.dateChangePlate || null,
      interval_service: parseInt(form.intervalService, 10) || 0,
      is_active: form.isActive ?? true,
      is_draft: form.isDraft ?? false,
      alert_days_before: Array.isArray(form.alertDaysBefore)
        ? form.alertDaysBefore.map(Number).filter(n => !isNaN(n))
        : (typeof form.alertDaysBefore === 'string'
            ? form.alertDaysBefore.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
            : [30, 7, 1])
    };
  }
};

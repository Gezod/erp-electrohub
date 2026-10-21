/**
 * LicenseMapper
 * Mentransformasi data antara struktur API Licenses dan kebutuhan UI.
 */
export const LicenseMapper = {
  /**
   * toUIList
   * Menstandarisasi objek license untuk tampilan tabel list.
   */
  toUIList: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      appName: apiData.app_name || '-',
      numberLicense: apiData.number_license || '-',
      locationName: apiData.location?.location_name || apiData.location?.name || '-',
      dateExpired: apiData.date_expired || null,
      dateActive: apiData.date_active || null,
      pricePeriode: Number(apiData.price_period || apiData.price_periode) || 0,
      statusPayment: apiData.status_payment || 'unpaid',
      isActive: apiData.is_active ?? false,
      isDraft: apiData.is_draft ?? false,
      status: apiData.is_draft ? 'Draft' : (apiData.is_active ? 'Aktif' : 'Nonaktif'),
      isRecurring: apiData.is_recurring ?? false
    };
  },

  /**
   * toUIDetail
   * Melakukan transformasi detail lengkap untuk kebutuhan form.
   */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      appName: apiData.app_name || '',
      numberLicense: apiData.number_license || '',
      locationId: apiData.location_id || '',
      dateActive: apiData.date_active ? apiData.date_active.split('T')[0] : '',
      dateExpired: apiData.date_expired ? apiData.date_expired.split('T')[0] : '',
      pricePeriode: Number(apiData.price_period || apiData.price_periode) || 0,
      statusPayment: apiData.status_payment || 'unpaid',
      isActive: apiData.is_active ?? true,
      isDraft: apiData.is_draft ?? false,
      isRecurring: apiData.is_recurring ?? false,
      intervalReminder: apiData.interval_reminder || 30,
      alertDaysBefore: Array.isArray(apiData.alert_days_before) ? apiData.alert_days_before : [7, 3, 1],
      location: apiData.location || null
    };
  },

  /**
   * toPayload
   * Menghasilkan payload untuk Create/Update (POST/PUT).
   */
  toPayload: (form) => {
    if (!form) return {};
    return {
      app_name: form.appName || '',
      number_license: form.numberLicense || '',
      location_id: form.locationId || null,
      date_active: form.dateActive || null,
      date_expired: form.dateExpired || null,
      price_period: parseInt(form.pricePeriode, 10) || 0,
      status_payment: form.statusPayment || 'unpaid',
      is_active: form.isActive ?? true,
      is_draft: form.isDraft ?? false,
      is_recurring: form.isRecurring ?? false,
      interval_reminder: parseInt(form.intervalReminder, 10) || 0,
      alert_days_before: Array.isArray(form.alertDaysBefore)
        ? form.alertDaysBefore.map(Number).filter(n => !isNaN(n))
        : (typeof form.alertDaysBefore === 'string'
            ? form.alertDaysBefore.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
            : [7, 3, 1])
    };
  }
};

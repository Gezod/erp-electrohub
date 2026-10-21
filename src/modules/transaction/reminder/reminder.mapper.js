/**
 * ReminderMapper
 * Mentransformasi data antara struktur API Reminders dan kebutuhan UI.
 */
export const ReminderMapper = {
  /**
   * toUIList
   * Menstandarisasi objek reminder untuk tampilan tabel list.
   */
  toUIList: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      reminderType: apiData.reminder_type || '-',
      dueDate: apiData.due_date || null,
      alertDateBefore: Array.isArray(apiData.alert_date_before) ? apiData.alert_date_before : (apiData.alert_date_before ? [apiData.alert_date_before] : []),
      status: apiData.status || 'active',
      description: apiData.description || '-',
      intervalReminder: apiData.interval_reminder || null,
      lastNotifiedAt: apiData.last_notified_at || null,
      tableReference: apiData.table_reference || '-'
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
      referenceId: apiData.reference_id || '',
      tableReference: apiData.table_reference || '',
      reminderType: apiData.reminder_type || 'other',
      dueDate: apiData.due_date ? apiData.due_date.split('T')[0] : '',
      alertDateBefore: Array.isArray(apiData.alert_date_before) 
        ? apiData.alert_date_before.join(', ') 
        : (apiData.alert_date_before ?? 7),
      description: apiData.description || '',
      status: apiData.status || 'active'
    };
  },

  /**
   * toPayload
   * Payload untuk create/update umum (POST/PUT/PATCH).
   */
  toPayload: (form) => {
    if (!form) return {};
    return {
      reference_id: form.referenceId || null,
      table_reference: form.tableReference || null,
      reminder_type: form.reminderType || 'other',
      due_date: form.dueDate || null,
      alert_date_before: Array.isArray(form.alertDateBefore)
        ? form.alertDateBefore.map(Number)
        : (typeof form.alertDateBefore === 'string'
            ? form.alertDateBefore.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
            : [parseInt(form.alertDateBefore) || 0]),
      description: form.description || '',
      status: form.status || 'active'
    };
  },

  /**
   * toMarkDonePayload
   */
  toMarkDonePayload: () => {
    return { status: 'done' };
  }
};

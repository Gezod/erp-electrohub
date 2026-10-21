/**
 * MaintenanceMapper
 * Mentransformasi data antara struktur API Maintenance (Ticketing) dan kebutuhan UI.
 */
export const MaintenanceMapper = {
  /**
   * toUIList
   * Menstandarisasi objek maintenance untuk tampilan tabel list.
   */
  toUIList: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id || '',
      ticketNumber: apiData.kode_maintenance || '-',
      eventItem: apiData.event_item || '-',
      location: apiData.location?.location_name || apiData.location_id || '-',
      requester: apiData.employee?.full_name || apiData.employee_id || '-',
      date: apiData.date_maintenance || null,
      status: apiData.status || 'open', // Valid: open, hold, done
      currentStage: apiData.current_stage || 'request', // Valid: request, screening, payment, work, done
      description: apiData.description || '',
      progressPercent: apiData.progress_percent || 0,
      paymentAmount: Number(apiData.payment_total) || 0,
      isHold: apiData.is_hold || false
    };
  },

  /**
   * toPayloadHeader
   * Menyusun JSON untuk create/update request utama (Header).
   */
  toPayloadHeader: (form) => {
    if (!form) return {};
    return {
      location_id: form.locationId || null,
      event_item: form.eventItem || '',
      date_maintenance: form.dateMaintenance || new Date().toISOString().split('T')[0],
      description: form.descriptionMaintenance || '',
      pic_ga_id: form.picGaId || null,
      status: form.status || undefined
    };
  },

  /**
   * toPayloadUpdateHeader
   * Menyusun JSON untuk update header maintenance.
   */
  toPayloadUpdateHeader: (form) => {
    if (!form) return {};
    return {
      location_id: form.locationId || undefined,
      event_item: form.eventItem || undefined,
      date_maintenance: form.dateMaintenance || undefined,
      description: form.descriptionMaintenance || undefined,
      pic_ga_id: form.picGaId || undefined,
      is_hold: form.isHold !== undefined ? form.isHold : undefined,
      status: form.status || undefined,
      current_stage: form.currentStage || undefined,
      progress_percent: form.progressPercent !== undefined ? form.progressPercent : undefined,
      payment_total: form.paymentInfo !== undefined ? form.paymentInfo : undefined
    };
  },

  /**
   * buildProgressPayload
   * Membangun FormData secara eksplisit berdasarkan stage untuk menghindari pengiriman field sampah.
   */
  buildProgressPayload: (stage, formState, file) => {
    const formData = new FormData();

    // Helper untuk append nilai jika ada (menangani string kosong, null, undefined)
    const appendIfValue = (key, value) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else {
          formData.append(key, value);
        }
      }
    };

    // Stage dan is_done wajib ada di setiap payload progress
    formData.append('stage', stage);
    formData.append('is_done', formState.is_done ? 'true' : 'false');

    switch (stage) {
      case 'request':
        appendIfValue('date_stage', formState.date_stage);
        appendIfValue('notes', formState.notes);
        if (file) formData.append('evidence_photo', file);
        break;

      case 'screening':
        appendIfValue('date_stage', formState.date_stage);
        appendIfValue('date_survey', formState.date_survey);
        appendIfValue('vendor_name', formState.vendor_name);
        appendIfValue('screening_result', formState.screening_result);
        appendIfValue('need_vendor_schedule', formState.need_vendor_schedule);
        if (formState.need_vendor_schedule) {
          appendIfValue('date_work_schedule', formState.date_work_schedule);
        }
        appendIfValue('notes', formState.notes);
        break;

      case 'payment':
        appendIfValue('date_stage', formState.date_stage);
        appendIfValue('down_payment', String(formState.down_payment || 0));
        appendIfValue('done_payment', String(formState.done_payment || 0));
        appendIfValue('total_payment', String(formState.total_payment || 0));
        appendIfValue('notes', formState.notes);
        break;

      case 'work':
        appendIfValue('date_stage', formState.date_stage);
        appendIfValue('date_work_start', formState.date_work_start);
        appendIfValue('work_progress_note', formState.work_progress_note);
        if (file) formData.append('evidence_photo', file);
        break;

      case 'done':
        appendIfValue('date_stage', formState.date_stage);
        appendIfValue('date_done', formState.date_done);
        appendIfValue('down_payment', String(formState.down_payment || 0));
        appendIfValue('done_payment', String(formState.done_payment || 0));
        appendIfValue('total_payment', String(formState.total_payment || 0));
        appendIfValue('notes', formState.notes);
        if (file) formData.append('evidence_photo', file);
        break;
    }

    return formData;
  },

  /**
   * buildUpdateProgressPayload
   * Membangun FormData khusus untuk PUT update progress (hanya field tertentu).
   */
  buildUpdateProgressPayload: (formState, file) => {
    const formData = new FormData();
    if (formState.notes !== undefined) formData.append('notes', formState.notes);
    formData.append('is_done', formState.is_done ? 'true' : 'false');
    if (file) formData.append('evidence_photo', file);
    return formData;
  }
};

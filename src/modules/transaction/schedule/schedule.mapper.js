/**
 * ScheduleMapper
 * Mentransformasi data antara struktur API Schedules dan kebutuhan UI.
 */
export const ScheduleMapper = {
  /**
   * toUIList
   * Menstandarisasi objek schedule untuk tampilan tabel list.
   */
  toUIList: (apiData) => {
    if (!apiData) return null;
    let rawDesc = apiData.description || apiData.description_schedule || '';
    
    // Parse start time tag
    const timeMatch = rawDesc.match(/\[WAKTU:\s*(\d{2}:\d{2})\]/i);
    const timeSchedule = timeMatch ? timeMatch[1] : null;
    if (timeMatch) rawDesc = rawDesc.replace(timeMatch[0], '');

    // Parse end time tag
    const endTimeMatch = rawDesc.match(/\[JAM_SELESAI:\s*(\d{2}:\d{2})\]/i);
    const endTimeSchedule = endTimeMatch ? endTimeMatch[1] : null;
    if (endTimeMatch) rawDesc = rawDesc.replace(endTimeMatch[0], '');

    // Parse end date tag
    const endMatch = rawDesc.match(/\[SELESAI:\s*(\d{4}-\d{2}-\d{2})\]/i);
    const endDateSchedule = endMatch ? endMatch[1] : null;
    if (endMatch) rawDesc = rawDesc.replace(endMatch[0], '');

    // Parse keperluan tag
    const reqMatch = rawDesc.match(/\[KEPERLUAN:\s*([^\]]+)\]/i);
    const otherPerihalDetail = reqMatch ? reqMatch[1] : '';
    if (reqMatch) rawDesc = rawDesc.replace(reqMatch[0], '');

    const cleanDescription = rawDesc.trim();

    return {
      id: apiData.id,
      dateSchedule: apiData.date_schedule || null,
      endDateSchedule: endDateSchedule,
      timeSchedule: timeSchedule,
      endTimeSchedule: endTimeSchedule,
      perihal: apiData.perihal || '-',
      otherPerihalDetail: otherPerihalDetail,
      locationName: apiData.location?.location_name || '-',
      kodeMaintenance: apiData.maintenance?.kode_maintenance || '-',
      picExternal: apiData.pic_external || '-',
      descriptionSchedule: cleanDescription,
      status: apiData.status || 'pending'
    };
  },

  /**
   * toUIDetail
   * Melakukan transformasi detail lengkap untuk kebutuhan form/view detail.
   */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    let rawDesc = apiData.description_schedule || apiData.description || '';

    // Parse start time tag
    const timeMatch = rawDesc.match(/\[WAKTU:\s*(\d{2}:\d{2})\]/i);
    const timeSchedule = timeMatch ? timeMatch[1] : '';
    if (timeMatch) rawDesc = rawDesc.replace(timeMatch[0], '');

    // Parse end time tag
    const endTimeMatch = rawDesc.match(/\[JAM_SELESAI:\s*(\d{2}:\d{2})\]/i);
    const endTimeSchedule = endTimeMatch ? endTimeMatch[1] : '';
    if (endTimeMatch) rawDesc = rawDesc.replace(endTimeMatch[0], '');

    // Parse end date tag
    const endMatch = rawDesc.match(/\[SELESAI:\s*(\d{4}-\d{2}-\d{2})\]/i);
    const endDateSchedule = endMatch ? endMatch[1] : '';
    if (endMatch) rawDesc = rawDesc.replace(endMatch[0], '');

    // Parse keperluan tag
    const reqMatch = rawDesc.match(/\[KEPERLUAN:\s*([^\]]+)\]/i);
    const otherPerihalDetail = reqMatch ? reqMatch[1] : '';
    if (reqMatch) rawDesc = rawDesc.replace(reqMatch[0], '');

    const cleanDescription = rawDesc.trim();

    return {
      id: apiData.id,
      dateSchedule: apiData.date_schedule ? apiData.date_schedule.split('T')[0] : '',
      endDateSchedule: endDateSchedule,
      timeSchedule: timeSchedule,
      endTimeSchedule: endTimeSchedule,
      perihal: apiData.perihal || 'other',
      otherPerihalDetail: otherPerihalDetail,
      locationId: apiData.location_id || (apiData.location?.id) || '',
      maintenanceId: apiData.maintenance_id || (apiData.maintenance?.id) || null,
      picExternal: apiData.pic_external || '',
      noHpPic: apiData.no_hp_pic || '',
      descriptionSchedule: cleanDescription,
      status: apiData.status || 'need_reminder',
      intervalReminder: apiData.interval_reminder || 0,
      alertDaysBefore: Array.isArray(apiData.alert_days_before) 
        ? apiData.alert_days_before.join(', ') 
        : (apiData.alert_days_before ?? '7, 1'),
      location: apiData.location || null,
      maintenance: apiData.maintenance || null
    };
  },

  /**
   * toPayload
   * Menyusun JSON payload untuk create/update request sesuai spesifikasi API terbaru.
   */
  toPayload: (form) => {
    if (!form) return {};
    let desc = form.descriptionSchedule || form.description_schedule || '';
    
    // Clean existing tags
    desc = desc.replace(/\[WAKTU:\s*\d{2}:\d{2}\]/gi, '')
               .replace(/\[JAM_SELESAI:\s*\d{2}:\d{2}\]/gi, '')
               .replace(/\[SELESAI:\s*\d{4}-\d{2}-\d{2}\]/gi, '')
               .replace(/\[KEPERLUAN:\s*([^\]]+)\]/gi, '')
               .trim();

    // Add KEPERLUAN tag if perihal is 'other' and otherPerihalDetail is filled
    if (form.perihal === 'other' && form.otherPerihalDetail && form.otherPerihalDetail.trim()) {
      desc = `[KEPERLUAN: ${form.otherPerihalDetail.trim()}] ${desc}`;
    }

    // Add optional SELESAI tag if present and different from dateSchedule
    if (form.endDateSchedule && form.endDateSchedule.trim() && form.endDateSchedule !== form.dateSchedule) {
      desc = `[SELESAI: ${form.endDateSchedule.trim()}] ${desc}`;
    }

    // Add JAM_SELESAI tag if endTimeSchedule is present
    if (form.endTimeSchedule && form.endTimeSchedule.trim()) {
      desc = `[JAM_SELESAI: ${form.endTimeSchedule.trim()}] ${desc}`;
    }

    // Add WAKTU tag if timeSchedule is present
    if (form.timeSchedule && form.timeSchedule.trim()) {
      desc = `[WAKTU: ${form.timeSchedule.trim()}] ${desc}`;
    }

    const payload = {
      maintenance_id: form.maintenanceId || form.maintenance_id || null,
      location_id: form.locationId || form.location_id || null,
      date_schedule: form.dateSchedule || form.date_schedule || null,
      perihal: form.perihal || 'other',
      description_schedule: desc.trim(),
      pic_external: form.picExternal || form.pic_external || '',
      no_hp_pic: form.noHpPic || form.no_hp_pic || '',
      status: form.status || 'need_reminder'
    };

    if (form.status === 'need_reminder' || form.status === 'draft') {
      payload.interval_reminder = parseInt(form.intervalReminder || form.interval_reminder) || null;
      payload.alert_days_before = Array.isArray(form.alertDaysBefore || form.alert_days_before)
        ? (form.alertDaysBefore || form.alert_days_before).map(Number)
        : (typeof (form.alertDaysBefore || form.alert_days_before) === 'string'
            ? (form.alertDaysBefore || form.alert_days_before).split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
            : []);
    }

    return payload;
  }
};

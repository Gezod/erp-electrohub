/**
 * BroadcastMapper
 * Handles payload transformations for the WhatsApp Broadcast system.
 * Supports 3 modes: All Employees, By Locations, and Custom Selection.
 */
export const BroadcastMapper = {
  /**
   * toPayloadAllEmployees
   * Maps form to payload for all active employees.
   */
  toPayloadAllEmployees: (form) => {
    return {
      name: form.name,
      subject: form.subject,
      body: form.body,
      all_employees: true
    };
  },

  /**
   * toPayloadByLocations
   * Maps form to payload for specific locations.
   */
  toPayloadByLocations: (form, locationIds) => {
    return {
      name: form.name,
      subject: form.subject,
      body: form.body,
      location_ids: locationIds || []
    };
  },

  /**
   * toPayloadCustom
   * Maps form to payload for specific employee selections.
   */
  toPayloadCustom: (form, employeeIds) => {
    return {
      name: form.name,
      subject: form.subject,
      body: form.body,
      employee_ids: employeeIds || []
    };
  }
};

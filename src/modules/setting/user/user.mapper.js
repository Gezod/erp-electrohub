/**
 * UserMapper
 * Mentransformasi data antara struktur API Akun (IT/System) dan kebutuhan UI.
 * Fokus pada manajemen akses, keamanan, dan profil dasar user.
 */
export const UserMapper = {
  /**
   * toUI
   * Menstandarisasi objek user untuk tampilan tabel dan detail profil.
   */
  toUI: (apiData) => {
    return {
      id: apiData.id || '',
      nik: apiData.nik || apiData.employee?.nik || '',
      email: apiData.email || '',
      fullName: apiData.full_name || apiData.fullName || '',
      phone: apiData.phone || '',
      avatarUrl: apiData.avatar_url || null,
      employeeId: apiData.employee_id || null,
      locationId: apiData.location_id || apiData.locationId || apiData.employee?.location?.id || apiData.employee?.location_id || null,
      isSuperadmin: !!apiData.is_superadmin,
      permissions: (apiData.user_permissions)
        ? (apiData.user_permissions || apiData.permissions).map(p => p.permission_id || p.id || p) 
        : [],
      createdAt: apiData.created_at || null,
      updatedAt: apiData.updated_at || null
    };
  },

  /**
   * toPayloadCreate
   * Menyusun payload untuk pendaftaran user baru melalui domain IT.
   */
  toPayloadCreate: (form, selectedPermissionIds = []) => {
    return {
      nik: form.nik,
      location_id: form.locationId,
      email: form.email,
      password: form.password,
      full_name: form.fullName,
      is_superadmin: !!form.isSuperadmin,
      permission_ids: selectedPermissionIds
    };
  },

  /**
   * toPayloadUpdateBasic
   * Menyusun payload untuk pembaruan profil dasar (BUKAN HR/Employee).
   */
  toPayloadUpdateBasic: (form) => {
    return {
      nik: form.nik,
      full_name: form.fullName,
      phone: form.phone,
      avatar_url: form.avatarUrl,
      location_id: form.locationId
    };
  },

  /**
   * toPayloadUpdateSuperadmin
   * Payload minimal untuk mengubah status superadmin user.
   */
  toPayloadUpdateSuperadmin: (isSuperadmin) => {
    return {
      is_superadmin: !!isSuperadmin
    };
  },

  /**
   * toPayloadUpdatePassword
   * Menyusun payload khusus untuk pergantian kata sandi.
   */
  toPayloadUpdatePassword: (form) => {
    return {
      old_password: form.oldPassword,
      new_password: form.newPassword
    };
  },

  /**
   * toPayloadPermissions
   * Menyusun payload untuk sinkronisasi hak akses user.
   */
  toPayloadPermissions: (selectedIds) => {
    return {
      permission_ids: selectedIds || []
    };
  }
};

export const mapAuthResponse = (apiResponse) => {
  // Sesuai OpenAPI: { message, token, user }
  
  // Helper to flatten permission object if it exists
  const flattenPermissions = (perms) => {
    if (!perms) return [];
    if (Array.isArray(perms)) return perms;
    
    const flattened = [];
    Object.keys(perms).forEach(module => {
      const actions = perms[module];
      if (Array.isArray(actions)) {
        actions.forEach(action => flattened.push(`${module}:${action}`));
      } else if (typeof actions === 'object' && actions !== null) {
        Object.keys(actions).forEach(action => {
          if (actions[action]) flattened.push(`${module}:${action}`);
        });
      } else {
        flattened.push(module);
      }
    });
    return flattened;
  };

  const privileges = flattenPermissions(apiResponse.user?.permissions);

  return {
    token: apiResponse.token || null,
    refreshToken: apiResponse.refresh_token || null,
    user: apiResponse.user ? {
      id: apiResponse.user.id,
      email: apiResponse.user.email,
      displayName: apiResponse.user.full_name,
      isAdmin: apiResponse.user.is_superadmin || false,
      isSuperadmin: apiResponse.user.is_superadmin || false,
      is_superadmin: apiResponse.user.is_superadmin || false,
      employeeId: apiResponse.user.employee_id || null,
      employee: apiResponse.user.employee || null,
      divisionName: apiResponse.user.division_name || apiResponse.user.employee?.division?.name || null,
      divisionId: apiResponse.user.division_id || apiResponse.user.employee?.division_id || null,
    } : null,
    privileges: privileges
  };
};

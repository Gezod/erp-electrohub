export const mockUser = {
  id: 'usr_superadmin_01',
  email: 'refangga@electrohub.demo',
  full_name: 'Refangga Lintar (Admin)',
  is_superadmin: true,
  isAdmin: true,
  isSuperadmin: true,
  employee_id: 'emp_001',
  division_id: 'div_01',
  division_name: 'General Affair & Operasional',
  employee: {
    id: 'emp_001',
    nik: 'EH-2024-001',
    full_name: 'Refangga Lintar',
    email: 'refangga@electrohub.demo',
    phone: '081298765432',
    division_id: 'div_01',
    division: { id: 'div_01', name: 'General Affair' },
    position: { id: 'pos_01', name: 'GA Supervisor' }
  },
  permissions: {
    'dashboard-ga': ['read'],
    'dashboard-marketing': ['read'],
    organization: ['read', 'create', 'update', 'delete'],
    master: ['read', 'create', 'update', 'delete'],
    'master-goods': ['read', 'create', 'update', 'delete'],
    'master-location': ['read', 'create', 'update', 'delete'],
    transaksi: ['read', 'create', 'update', 'delete'],
    'transaksi-ga': ['read', 'create', 'update', 'delete'],
    'transaksi-marketing': ['read', 'create', 'update', 'delete'],
    todo: ['read', 'create', 'update', 'delete'],
    hr: ['read', 'create', 'update', 'delete'],
    setting: ['read', 'create', 'update', 'delete']
  }
};

export const mockAuthResponse = {
  success: true,
  message: 'Login demo berhasil',
  token: 'mock-token-demo-superadmin-portfolio',
  refresh_token: 'mock-refresh-token-demo-superadmin-portfolio',
  user: mockUser
};

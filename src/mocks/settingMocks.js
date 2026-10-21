export const mockPermissions = [
  { id: 'perm_01', name: 'Dashboard Access', module: 'dashboard-ga', actions: ['read'] },
  { id: 'perm_02', name: 'Marketing Dashboard Access', module: 'dashboard-marketing', actions: ['read'] },
  { id: 'perm_03', name: 'Master Data Management', module: 'master', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'perm_04', name: 'Organization Structure', module: 'organization', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'perm_05', name: 'Operational GA Transactions', module: 'transaksi', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'perm_06', name: 'Marketing Procurement', module: 'transaksi-marketing', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'perm_07', name: 'Todo & Gantt Project Manager', module: 'todo', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'perm_08', name: 'Human Resources & Payroll', module: 'hr', actions: ['read', 'create', 'update', 'delete'] },
  { id: 'perm_09', name: 'System Settings & Users', module: 'setting', actions: ['read', 'create', 'update', 'delete'] }
];

export const mockContactGroups = [
  { id: 'cg_01', name: 'Vendor IT & Komputasi', description: 'Distributor laptop, server, dan jaringan', members_count: 5 },
  { id: 'cg_02', name: 'Vendor Interior & Furnitur', description: 'Pengrajin meja kasir, partisi, dan rak toko', members_count: 3 },
  { id: 'cg_03', name: 'Teknisi AC & Utilitas Gedung', description: 'Kontraktor maintenance genset, lift, dan pendingin ruangan', members_count: 4 },
  { id: 'cg_04', name: 'Ekspedisi & Logistik Eksternal', description: 'Partner cargo antar pulau dan armada sewa', members_count: 3 }
];

export const mockManageContacts = [
  {
    id: 'cnt_01',
    name: 'PT Mitra Solusi Infotama',
    contact_person: 'Agus Setiawan',
    phone: '021-58901234',
    email: 'sales@mitrasolusi.co.id',
    group_id: 'cg_01',
    group_name: 'Vendor IT & Komputasi',
    address: 'Komp. Ruko Mangga Dua Mall No. 15, Jakarta Pusat'
  },
  {
    id: 'cnt_02',
    name: 'CV Sentra Interior Kantor',
    contact_person: 'Hendra Saputra',
    phone: '022-7201990',
    email: 'info@sentrainterior.com',
    group_id: 'cg_02',
    group_name: 'Vendor Interior & Furnitur',
    address: 'Jl. Soekarno Hatta No. 420, Bandung'
  },
  {
    id: 'cnt_03',
    name: 'PT Daikin Airconditioning Indonesia',
    contact_person: 'Yusuf Ramadhan',
    phone: '021-29648000',
    email: 'service.daikin@daikin.co.id',
    group_id: 'cg_03',
    group_name: 'Teknisi AC & Utilitas Gedung',
    address: 'Wisma Keiai Lt. 18, Jl. Jend. Sudirman Kav. 3, Jakarta Pusat'
  },
  {
    id: 'cnt_04',
    name: 'PT JNE Cargo & Logistics Express',
    contact_person: 'Rina Kusuma',
    phone: '021-5665262',
    email: 'corporate@jne.co.id',
    group_id: 'cg_04',
    group_name: 'Ekspedisi & Logistik Eksternal',
    address: 'Jl. Tomang Raya No. 11, Jakarta Barat'
  }
];

export const mockStoreContacts = [
  { id: 'sc_01', store_name: 'ElectroHub Head Office SCBD', phone: '021-5150000', email: 'support@electrohub.demo', city: 'Jakarta Selatan' },
  { id: 'sc_02', store_name: 'ElectroHub Flagship Store Bandung Dago', phone: '022-4230000', email: 'dago@electrohub.demo', city: 'Bandung' },
  { id: 'sc_03', store_name: 'ElectroHub Store Surabaya Gubeng', phone: '031-5030000', email: 'gubeng@electrohub.demo', city: 'Surabaya' },
  { id: 'sc_04', store_name: 'ElectroHub Experience Store Bali Sunset', phone: '0361-750000', email: 'bali@electrohub.demo', city: 'Denpasar' }
];

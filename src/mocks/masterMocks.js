export const mockCategories = [
  { id: 'cat_01', name: 'Elektronik & Gadget', category_name: 'Elektronik & Gadget', code: 'CAT-ELK', is_active: true, description: 'Perangkat elektronik operasional dan gadget kantor' },
  { id: 'cat_02', name: 'Furnitur & Interior', category_name: 'Furnitur & Interior', code: 'CAT-FRN', is_active: true, description: 'Meja, kursi, lemari arsip, dan partisi' },
  { id: 'cat_03', name: 'Perlengkapan IT', category_name: 'Perlengkapan IT', code: 'CAT-ITC', is_active: true, description: 'Server, kabel LAN, router, dan aksesori komputer' },
  { id: 'cat_04', name: 'Alat Tulis Kantor (ATK)', category_name: 'Alat Tulis Kantor (ATK)', code: 'CAT-ATK', is_active: true, description: 'Kertas, pena, map, dan consumable office' },
  { id: 'cat_05', name: 'Mesin & Utilitas', category_name: 'Mesin & Utilitas', code: 'CAT-UTL', is_active: true, description: 'Genset, AC, dispenser air, dan pompa' },
  { id: 'cat_06', name: 'Kebersihan & Sanitasi', category_name: 'Kebersihan & Sanitasi', code: 'CAT-KBS', is_active: true, description: 'Alat pel, desinfektan, sabun cuci tangan' }
];

export const mockLocations = [
  { id: 'loc_01', location_code: 'HO-JKT', location_name: 'Kantor Pusat Jakarta', address: 'Jl. Sudirman Kav. 52-53, SCBD, Jakarta Selatan', city: 'Jakarta', is_active: true, type: 'head_office' },
  { id: 'loc_02', location_code: 'WH-CKR', location_name: 'Gudang Logistik Cikarang', address: 'Kawasan Industri GIIC Blok AA No. 12, Cikarang', city: 'Bekasi', is_active: true, type: 'warehouse' },
  { id: 'loc_03', location_code: 'STR-BDG', location_name: 'Store Bandung Dago', address: 'Jl. Ir. H. Juanda No. 115, Coblong, Bandung', city: 'Bandung', is_active: true, type: 'store' },
  { id: 'loc_04', location_code: 'STR-SBY', location_name: 'Store Surabaya Gubeng', address: 'Jl. Raya Gubeng No. 45, Gubeng, Surabaya', city: 'Suraya', is_active: true, type: 'store' },
  { id: 'loc_05', location_code: 'STR-DPS', location_name: 'Store Bali Kuta', address: 'Jl. Sunset Road No. 88, Kuta, Badung', city: 'Denpasar', is_active: true, type: 'store' },
  { id: 'loc_06', location_code: 'STR-MDN', location_name: 'Store Medan Petisah', address: 'Jl. Gatot Subroto No. 230, Petisah, Medan', city: 'Medan', is_active: true, type: 'store' }
];

export const mockUom = [
  { id: 'uom_01', uom_code: 'UNIT', uom_name: 'Unit', name: 'Unit', is_active: true },
  { id: 'uom_02', uom_code: 'PCS', uom_name: 'Pieces', name: 'Pieces', is_active: true },
  { id: 'uom_03', uom_code: 'BOX', uom_name: 'Box / Kotak', name: 'Box', is_active: true },
  { id: 'uom_04', uom_code: 'RIM', uom_name: 'Rim', name: 'Rim', is_active: true },
  { id: 'uom_05', uom_code: 'SET', uom_name: 'Set / Paket', name: 'Set', is_active: true },
  { id: 'uom_06', uom_code: 'ROLL', uom_name: 'Roll', name: 'Roll', is_active: true }
];

export const mockAssetTypes = [
  { id: 'ast_01', name: 'Aset Komputasi & Gadget', code: 'AST-KMP', depreciation_rate: 25, is_active: true },
  { id: 'ast_02', name: 'Aset Operasional Kendaraan', code: 'AST-KND', depreciation_rate: 20, is_active: true },
  { id: 'ast_03', name: 'Aset Interior & Furnitur', code: 'AST-FNT', depreciation_rate: 15, is_active: true },
  { id: 'ast_04', name: 'Aset Mesin & Peralatan Toko', code: 'AST-MSN', depreciation_rate: 20, is_active: true }
];

export const mockDivisions = [
  { id: 'div_01', name: 'General Affair & Facility', code: 'DIV-GA', is_active: true, description: 'Pengelolaan aset, fasilitas, dan operasional gedung' },
  { id: 'div_02', name: 'Marketing & Komunikasi', code: 'DIV-MKT', is_active: true, description: 'Promosi, campaign retail, branding toko, dan event' },
  { id: 'div_03', name: 'Human Capital & Kepegawaian', code: 'DIV-HR', is_active: true, description: 'Rekrutmen, presensi, absensi, payroll, dan disiplin' },
  { id: 'div_04', name: 'Information Technology', code: 'DIV-IT', is_active: true, description: 'Infrastruktur IT, software ERP, server, dan jaringan' },
  { id: 'div_05', name: 'Finance & Accounting', code: 'DIV-FIN', is_active: true, description: 'Anggaran belanja, verifikasi faktur, dan pembukuan' },
  { id: 'div_06', name: 'Operasional Store & Ritel', code: 'DIV-OPS', is_active: true, description: 'Pengelolaan cabang ritel fisik dan pelayanan toko' }
];

export const mockPositions = [
  { id: 'pos_01', name: 'GA Supervisor', code: 'POS-GASPV', division_id: 'div_01', is_active: true },
  { id: 'pos_02', name: 'GA Facility Officer', code: 'POS-GAOFC', division_id: 'div_01', is_active: true },
  { id: 'pos_03', name: 'Marketing Campaign Lead', code: 'POS-MKTLD', division_id: 'div_02', is_active: true },
  { id: 'pos_04', name: 'Retail Branding Specialist', code: 'POS-MKTBR', division_id: 'div_02', is_active: true },
  { id: 'pos_05', name: 'HR Operations Manager', code: 'POS-HRMGR', division_id: 'div_03', is_active: true },
  { id: 'pos_06', name: 'Fullstack IT Specialist', code: 'POS-ITSPL', division_id: 'div_04', is_active: true },
  { id: 'pos_07', name: 'Store Area Manager', code: 'POS-STRMGR', division_id: 'div_06', is_active: true },
  { id: 'pos_08', name: 'Warehouse Supervisor', code: 'POS-WHSUP', division_id: 'div_01', is_active: true }
];

export const mockEmployees = [
  {
    id: 'emp_001',
    nik: 'EH-2024-001',
    full_name: 'Refangga Lintar',
    email: 'refangga@electrohub.demo',
    phone: '081298765432',
    gender: 'Laki-laki',
    join_date: '2023-01-15',
    division_id: 'div_01',
    division: { id: 'div_01', name: 'General Affair & Facility' },
    position_id: 'pos_01',
    position: { id: 'pos_01', name: 'GA Supervisor' },
    location_id: 'loc_01',
    location: { id: 'loc_01', location_name: 'Kantor Pusat Jakarta' },
    employment_status: 'Tetap',
    is_active: true
  },
  {
    id: 'emp_002',
    nik: 'EH-2024-002',
    full_name: 'Dewi Lestari',
    email: 'dewi.lestari@electrohub.demo',
    phone: '081387654321',
    gender: 'Perempuan',
    join_date: '2023-03-01',
    division_id: 'div_01',
    division: { id: 'div_01', name: 'General Affair & Facility' },
    position_id: 'pos_02',
    position: { id: 'pos_02', name: 'GA Facility Officer' },
    location_id: 'loc_02',
    location: { id: 'loc_02', location_name: 'Gudang Logistik Cikarang' },
    employment_status: 'Tetap',
    is_active: true
  },
  {
    id: 'emp_003',
    nik: 'EH-2024-003',
    full_name: 'Siti Rahma',
    email: 'siti.rahma@electrohub.demo',
    phone: '081576543210',
    gender: 'Perempuan',
    join_date: '2023-05-10',
    division_id: 'div_02',
    division: { id: 'div_02', name: 'Marketing & Komunikasi' },
    position_id: 'pos_03',
    position: { id: 'pos_03', name: 'Marketing Campaign Lead' },
    location_id: 'loc_01',
    location: { id: 'loc_01', location_name: 'Kantor Pusat Jakarta' },
    employment_status: 'Tetap',
    is_active: true
  },
  {
    id: 'emp_004',
    nik: 'EH-2024-004',
    full_name: 'Fajar Nugroho',
    email: 'fajar.nugroho@electrohub.demo',
    phone: '081665432109',
    gender: 'Laki-laki',
    join_date: '2023-07-20',
    division_id: 'div_02',
    division: { id: 'div_02', name: 'Marketing & Komunikasi' },
    position_id: 'pos_04',
    position: { id: 'pos_04', name: 'Retail Branding Specialist' },
    location_id: 'loc_03',
    location: { id: 'loc_03', location_name: 'Store Bandung Dago' },
    employment_status: 'Tetap',
    is_active: true
  },
  {
    id: 'emp_005',
    nik: 'EH-2024-005',
    full_name: 'Bambang Sudibyo',
    email: 'bambang.sudibyo@electrohub.demo',
    phone: '081754321098',
    gender: 'Laki-laki',
    join_date: '2022-11-01',
    division_id: 'div_01',
    division: { id: 'div_01', name: 'General Affair & Facility' },
    position_id: 'pos_08',
    position: { id: 'pos_08', name: 'Warehouse Supervisor' },
    location_id: 'loc_02',
    location: { id: 'loc_02', location_name: 'Gudang Logistik Cikarang' },
    employment_status: 'Tetap',
    is_active: true
  },
  {
    id: 'emp_006',
    nik: 'EH-2024-006',
    full_name: 'Rudi Hermawan',
    email: 'rudi.hermawan@electrohub.demo',
    phone: '081843210987',
    gender: 'Laki-laki',
    join_date: '2023-09-15',
    division_id: 'div_06',
    division: { id: 'div_06', name: 'Operasional Store & Ritel' },
    position_id: 'pos_07',
    position: { id: 'pos_07', name: 'Store Area Manager' },
    location_id: 'loc_04',
    location: { id: 'loc_04', location_name: 'Store Surabaya Gubeng' },
    employment_status: 'Tetap',
    is_active: true
  },
  {
    id: 'emp_007',
    nik: 'EH-2024-007',
    full_name: 'Jessica Melania',
    email: 'jessica.m@electrohub.demo',
    phone: '081932109876',
    gender: 'Perempuan',
    join_date: '2024-01-10',
    division_id: 'div_03',
    division: { id: 'div_03', name: 'Human Capital & Kepegawaian' },
    position_id: 'pos_05',
    position: { id: 'pos_05', name: 'HR Operations Manager' },
    location_id: 'loc_01',
    location: { id: 'loc_01', location_name: 'Kantor Pusat Jakarta' },
    employment_status: 'Tetap',
    is_active: true
  }
];

export const mockGoods = [
  {
    id: 'gd_01',
    good_code: 'BRG-ELK-001',
    goodCode: 'BRG-ELK-001',
    good_name: 'MacBook Pro M3 Max 16"',
    goodName: 'MacBook Pro M3 Max 16"',
    name: 'MacBook Pro M3 Max 16"',
    merk: 'Apple',
    category_id: 'cat_01',
    category: { id: 'cat_01', name: 'Elektronik & Gadget' },
    uom_id: 'uom_01',
    uom: { id: 'uom_01', uom_name: 'Unit' },
    min_stock: 3,
    current_stock: 8,
    price: 42500000,
    is_active: true,
    description: 'Laptop standar developer & creative workstation'
  },
  {
    id: 'gd_02',
    good_code: 'BRG-ELK-002',
    goodCode: 'BRG-ELK-002',
    good_name: 'Monitor Dell UltraSharp 27" 4K',
    goodName: 'Monitor Dell UltraSharp 27" 4K',
    name: 'Monitor Dell UltraSharp 27" 4K',
    merk: 'Dell',
    category_id: 'cat_01',
    category: { id: 'cat_01', name: 'Elektronik & Gadget' },
    uom_id: 'uom_01',
    uom: { id: 'uom_01', uom_name: 'Unit' },
    min_stock: 5,
    current_stock: 14,
    price: 9800000,
    is_active: true,
    description: 'Monitor high color accuracy IPS Type-C Hub'
  },
  {
    id: 'gd_03',
    good_code: 'BRG-FRN-001',
    goodCode: 'BRG-FRN-001',
    good_name: 'Kursi Ergonomis Mesh V2',
    goodName: 'Kursi Ergonomis Mesh V2',
    name: 'Kursi Ergonomis Mesh V2',
    merk: 'Steelcase',
    category_id: 'cat_02',
    category: { id: 'cat_02', name: 'Furnitur & Interior' },
    uom_id: 'uom_01',
    uom: { id: 'uom_01', uom_name: 'Unit' },
    min_stock: 5,
    current_stock: 19,
    price: 4200000,
    is_active: true,
    description: 'Kursi kerja ergonomis lumbar support breathable mesh'
  },
  {
    id: 'gd_04',
    good_code: 'BRG-FRN-002',
    goodCode: 'BRG-FRN-002',
    good_name: 'Standing Desk Elektrik Dual Motor',
    goodName: 'Standing Desk Elektrik Dual Motor',
    name: 'Standing Desk Elektrik Dual Motor',
    merk: 'Stramm',
    category_id: 'cat_02',
    category: { id: 'cat_02', name: 'Furnitur & Interior' },
    uom_id: 'uom_01',
    uom: { id: 'uom_01', uom_name: 'Unit' },
    min_stock: 2,
    current_stock: 6,
    price: 5800000,
    is_active: true,
    description: 'Meja kerja adjustable height memory button 140x70'
  },
  {
    id: 'gd_05',
    good_code: 'BRG-ITC-001',
    goodCode: 'BRG-ITC-001',
    good_name: 'Cisco Catalyst Switch 24-Port Gigabit',
    goodName: 'Cisco Catalyst Switch 24-Port Gigabit',
    name: 'Cisco Catalyst Switch 24-Port Gigabit',
    merk: 'Cisco',
    category_id: 'cat_03',
    category: { id: 'cat_03', name: 'Perlengkapan IT' },
    uom_id: 'uom_01',
    uom: { id: 'uom_01', uom_name: 'Unit' },
    min_stock: 2,
    current_stock: 4,
    price: 15400000,
    is_active: true,
    description: 'Managed network switch layer 2 enterprise grade'
  },
  {
    id: 'gd_06',
    good_code: 'BRG-ATK-001',
    goodCode: 'BRG-ATK-001',
    good_name: 'Kertas A4 PaperOne 80gr',
    goodName: 'Kertas A4 PaperOne 80gr',
    name: 'Kertas A4 PaperOne 80gr',
    merk: 'PaperOne',
    category_id: 'cat_04',
    category: { id: 'cat_04', name: 'Alat Tulis Kantor (ATK)' },
    uom_id: 'uom_03',
    uom: { id: 'uom_03', uom_name: 'Box' },
    min_stock: 10,
    current_stock: 35,
    price: 245000,
    is_active: true,
    description: 'Box isi 5 Rim kertas cetak putih kualitas tinggi'
  },
  {
    id: 'gd_07',
    good_code: 'BRG-ATK-002',
    goodCode: 'BRG-ATK-002',
    good_name: 'Toner Cartridge Canon 325 Hitam',
    goodName: 'Toner Cartridge Canon 325 Hitam',
    name: 'Toner Cartridge Canon 325 Hitam',
    merk: 'Canon',
    category_id: 'cat_04',
    category: { id: 'cat_04', name: 'Alat Tulis Kantor (ATK)' },
    uom_id: 'uom_02',
    uom: { id: 'uom_02', uom_name: 'Pieces' },
    min_stock: 4,
    current_stock: 2, // low stock trigger
    price: 780000,
    is_active: true,
    description: 'Toner original printer Canon LBP6030'
  },
  {
    id: 'gd_08',
    good_code: 'BRG-UTL-001',
    goodCode: 'BRG-UTL-001',
    good_name: 'AC Daikin Inverter 2 PK Flash',
    goodName: 'AC Daikin Inverter 2 PK Flash',
    name: 'AC Daikin Inverter 2 PK Flash',
    merk: 'Daikin',
    category_id: 'cat_05',
    category: { id: 'cat_05', name: 'Mesin & Utilitas' },
    uom_id: 'uom_01',
    uom: { id: 'uom_01', uom_name: 'Unit' },
    min_stock: 2,
    current_stock: 5,
    price: 8900000,
    is_active: true,
    description: 'AC hemat listrik refrigerant R32 pendingin ruang server/office'
  },
  {
    id: 'gd_09',
    good_code: 'BRG-ELK-003',
    goodCode: 'BRG-ELK-003',
    good_name: 'Handheld Barcode Scanner Wireless 2D',
    goodName: 'Handheld Barcode Scanner Wireless 2D',
    name: 'Handheld Barcode Scanner Wireless 2D',
    merk: 'Zebra',
    category_id: 'cat_01',
    category: { id: 'cat_01', name: 'Elektronik & Gadget' },
    uom_id: 'uom_01',
    uom: { id: 'uom_01', uom_name: 'Unit' },
    min_stock: 5,
    current_stock: 1, // low stock trigger
    price: 2150000,
    is_active: true,
    description: 'Scanner barcode QR dan 1D wireless Bluetooth & Dongle'
  },
  {
    id: 'gd_10',
    good_code: 'BRG-ITC-002',
    goodCode: 'BRG-ITC-002',
    good_name: 'UPS APC Smart-UPS 1500VA LCD 230V',
    goodName: 'UPS APC Smart-UPS 1500VA LCD 230V',
    name: 'UPS APC Smart-UPS 1500VA LCD 230V',
    merk: 'APC Schneider',
    category_id: 'cat_03',
    category: { id: 'cat_03', name: 'Perlengkapan IT' },
    uom_id: 'uom_01',
    uom: { id: 'uom_01', uom_name: 'Unit' },
    min_stock: 2,
    current_stock: 3,
    price: 11200000,
    is_active: true,
    description: 'Backup daya uninterrupted server room & switch rack'
  }
];

export const mockMarketingGoods = [
  { id: 'mg_01', name: 'Neon Box Akrilik LED Store 2x1m', code: 'MKT-NB-01', category: 'Signage Toko', uom: 'Unit', min_stock: 2, current_stock: 6, price: 5500000, is_active: true },
  { id: 'mg_02', name: 'Roll Up Banner Promosi Aluminium 60x160', code: 'MKT-RB-02', category: 'Banner Event', uom: 'Pcs', min_stock: 10, current_stock: 45, price: 280000, is_active: true },
  { id: 'mg_03', name: 'Brosur Katalog Retail Q2 Art Paper 150gr', code: 'MKT-BR-03', category: 'Print Material', uom: 'Rim', min_stock: 20, current_stock: 80, price: 320000, is_active: true },
  { id: 'mg_04', name: 'Goodie Bag Spunbond Eksklusif ElectroHub', code: 'MKT-GB-04', category: 'Merchandise', uom: 'Pcs', min_stock: 100, current_stock: 350, price: 15000, is_active: true },
  { id: 'mg_05', name: 'Booth Portable Pop-Up Display Magnetik', code: 'MKT-BT-05', category: 'Pameran & Expo', uom: 'Set', min_stock: 1, current_stock: 3, price: 4700000, is_active: true },
  { id: 'mg_06', name: 'Seragam Kaos Polo Sales Staff Retail', code: 'MKT-PL-06', category: 'Apparel', uom: 'Pcs', min_stock: 25, current_stock: 90, price: 95000, is_active: true }
];

export const mockChiefs = [
  { id: 'chf_01', full_name: 'Ir. Hendra Gunawan', division_id: 'div_01', division_name: 'General Affair & Facility', phone: '08111223344', email: 'hendra.gunawan@electrohub.demo' },
  { id: 'chf_02', full_name: 'Clarissa Natalia, M.M', division_id: 'div_02', division_name: 'Marketing & Komunikasi', phone: '08112233445', email: 'clarissa.natalia@electrohub.demo' },
  { id: 'chf_03', full_name: 'Dr. Surya Wibowo, S.H', division_id: 'div_03', division_name: 'Human Capital', phone: '08113344556', email: 'surya.wibowo@electrohub.demo' }
];

export const mockUsers = [
  {
    id: 'usr_superadmin_01',
    email: 'refangga@electrohub.demo',
    full_name: 'Refangga Lintar (Admin)',
    is_superadmin: true,
    is_active: true,
    employee_id: 'emp_001',
    employee: mockEmployees[0],
    role: 'Superadmin',
    created_at: '2023-01-15T08:00:00Z'
  },
  {
    id: 'usr_02',
    email: 'dewi.lestari@electrohub.demo',
    full_name: 'Dewi Lestari',
    is_superadmin: false,
    is_active: true,
    employee_id: 'emp_002',
    employee: mockEmployees[1],
    role: 'GA Staff',
    created_at: '2023-03-01T09:00:00Z'
  },
  {
    id: 'usr_03',
    email: 'siti.rahma@electrohub.demo',
    full_name: 'Siti Rahma',
    is_superadmin: false,
    is_active: true,
    employee_id: 'emp_003',
    employee: mockEmployees[2],
    role: 'Marketing Lead',
    created_at: '2023-05-10T10:00:00Z'
  },
  {
    id: 'usr_04',
    email: 'jessica.m@electrohub.demo',
    full_name: 'Jessica Melania',
    is_superadmin: false,
    is_active: true,
    employee_id: 'emp_007',
    employee: mockEmployees[6],
    role: 'HR Officer',
    created_at: '2024-01-10T11:00:00Z'
  }
];

export const mockScCategories = [
  { id: 'scc_01', name: 'Smartphone & Wearable', code: 'SC-SMART', is_active: true },
  { id: 'scc_02', name: 'Laptop & Komputer Desktop', code: 'SC-PC', is_active: true },
  { id: 'scc_03', name: 'Audio, Speaker & Headset', code: 'SC-AUDIO', is_active: true },
  { id: 'scc_04', name: 'Smart Home & IoT Appliances', code: 'SC-IOT', is_active: true }
];

export const mockScSkus = [
  { id: 'sku_01', sku_code: 'SKU-APL-IP16P', product_name: 'iPhone 16 Pro 256GB Black Titanium', sc_category_id: 'scc_01', supplier_name: 'PT Apple Retail Indonesia', base_price: 19500000, retail_price: 21999000, is_active: true },
  { id: 'sku_02', sku_code: 'SKU-SMS-S25U', product_name: 'Samsung Galaxy S25 Ultra 512GB Titanium Gray', sc_category_id: 'scc_01', supplier_name: 'PT Samsung Electronics Indonesia', base_price: 18900000, retail_price: 20999000, is_active: true },
  { id: 'sku_03', sku_code: 'SKU-SNY-WH1000XM5', product_name: 'Sony WH-1000XM5 Wireless Noise Cancelling', sc_category_id: 'scc_03', supplier_name: 'PT Sony Music & Tech Indonesia', base_price: 4500000, retail_price: 5299000, is_active: true },
  { id: 'sku_04', sku_code: 'SKU-ASU-ROGZ16', product_name: 'ASUS ROG Zephyrus G16 OLED Ultra 9', sc_category_id: 'scc_02', supplier_name: 'PT Synnex Metrodata', base_price: 31000000, retail_price: 34999000, is_active: true }
];

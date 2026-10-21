import { mockGoods, mockLocations, mockEmployees } from './masterMocks';

export const mockStocks = [
  {
    id: 'stk_01',
    good_id: 'gd_01',
    good: mockGoods[0],
    location_id: 'loc_01',
    location: mockLocations[0],
    quantity: 6,
    min_stock: 3,
    status: 'aman',
    last_restock: '2026-03-20T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z'
  },
  {
    id: 'stk_02',
    good_id: 'gd_02',
    good: mockGoods[1],
    location_id: 'loc_01',
    location: mockLocations[0],
    quantity: 12,
    min_stock: 5,
    status: 'aman',
    last_restock: '2026-03-18T14:00:00Z',
    updated_at: '2026-03-18T14:00:00Z'
  },
  {
    id: 'stk_03',
    good_id: 'gd_03',
    good: mockGoods[2],
    location_id: 'loc_02',
    location: mockLocations[1],
    quantity: 18,
    min_stock: 5,
    status: 'aman',
    last_restock: '2026-03-15T09:30:00Z',
    updated_at: '2026-03-15T09:30:00Z'
  },
  {
    id: 'stk_04',
    good_id: 'gd_04',
    good: mockGoods[3],
    location_id: 'loc_02',
    location: mockLocations[1],
    quantity: 5,
    min_stock: 2,
    status: 'aman',
    last_restock: '2026-03-10T11:00:00Z',
    updated_at: '2026-03-10T11:00:00Z'
  },
  {
    id: 'stk_05',
    good_id: 'gd_06',
    good: mockGoods[5],
    location_id: 'loc_01',
    location: mockLocations[0],
    quantity: 28,
    min_stock: 10,
    status: 'aman',
    last_restock: '2026-03-28T08:15:00Z',
    updated_at: '2026-03-28T08:15:00Z'
  },
  {
    id: 'stk_06',
    good_id: 'gd_07',
    good: mockGoods[6],
    location_id: 'loc_01',
    location: mockLocations[0],
    quantity: 2,
    min_stock: 4,
    status: 'menipis', // low stock
    last_restock: '2026-02-14T10:00:00Z',
    updated_at: '2026-04-01T09:00:00Z'
  },
  {
    id: 'stk_07',
    good_id: 'gd_09',
    good: mockGoods[8],
    location_id: 'loc_02',
    location: mockLocations[1],
    quantity: 1,
    min_stock: 5,
    status: 'kritis', // low stock
    last_restock: '2026-01-20T11:20:00Z',
    updated_at: '2026-04-02T16:00:00Z'
  }
];

export const mockStockMovements = [
  {
    id: 'sm_01',
    stock_id: 'stk_01',
    movement_type: 'in',
    type: 'Masuk',
    quantity: 5,
    reference_number: 'PO-2026-001',
    notes: 'Penerimaan laptop workstation dari vendor Apple Retail',
    created_at: '2026-03-20T10:00:00Z',
    user: { full_name: 'Refangga Lintar' }
  },
  {
    id: 'sm_02',
    stock_id: 'stk_05',
    movement_type: 'out',
    type: 'Keluar',
    quantity: 10,
    reference_number: 'REQ-2026-008',
    notes: 'Pengeluaran ATK untuk keperluan operasional Store Bandung',
    created_at: '2026-03-28T14:30:00Z',
    user: { full_name: 'Dewi Lestari' }
  },
  {
    id: 'sm_03',
    stock_id: 'stk_03',
    movement_type: 'transfer',
    type: 'Transfer',
    quantity: 6,
    reference_number: 'TRF-2026-003',
    notes: 'Transfer kursi ergonomis dari Gudang Cikarang ke Store Surabaya',
    created_at: '2026-03-30T11:15:00Z',
    user: { full_name: 'Bambang Sudibyo' }
  }
];

export const mockRequests = [
  {
    id: 'req_01',
    request_code: 'REQ-2026-001',
    request_date: '2026-04-01',
    status: 'dalam_pengajuan',
    requester_id: 'emp_003',
    requester: mockEmployees[2],
    location_id: 'loc_01',
    location: mockLocations[0],
    purpose: 'Kebutuhan tim creative marketing campaign Ramadhan',
    items: [
      { id: 'item_01', good_id: 'gd_01', good_name: 'MacBook Pro M3 Max 16"', qty: 1, uom: 'Unit' }
    ],
    total_items: 1,
    notes: 'Mohon proses prioritas untuk render video promosi',
    created_at: '2026-04-01T08:30:00Z'
  },
  {
    id: 'req_02',
    request_code: 'REQ-2026-002',
    request_date: '2026-04-02',
    status: 'disetujui',
    requester_id: 'emp_004',
    requester: mockEmployees[3],
    location_id: 'loc_03',
    location: mockLocations[2],
    purpose: 'Restok ATK dan kertas kasir toko Store Bandung Dago',
    items: [
      { id: 'item_02', good_id: 'gd_06', good_name: 'Kertas A4 PaperOne 80gr', qty: 5, uom: 'Box' }
    ],
    total_items: 5,
    notes: 'Stok di store tersisa 1 box',
    created_at: '2026-04-02T09:15:00Z'
  },
  {
    id: 'req_03',
    request_code: 'REQ-2026-003',
    request_date: '2026-04-03',
    status: 'diserahkan',
    requester_id: 'emp_006',
    requester: mockEmployees[5],
    location_id: 'loc_04',
    location: mockLocations[3],
    purpose: 'Penggantian scanner barcode kasir yang rusak fisik',
    items: [
      { id: 'item_03', good_id: 'gd_09', good_name: 'Handheld Barcode Scanner Wireless 2D', qty: 2, uom: 'Unit' }
    ],
    total_items: 2,
    notes: 'Sudah diserahterimakan dan tanda tangan BAST',
    created_at: '2026-04-03T13:45:00Z'
  }
];

export const mockPurchases = [
  {
    id: 'pur_01',
    purchase_code: 'PO-2026-001',
    purchase_date: '2026-03-25',
    supplier_name: 'PT Mitra Solusi Infotama',
    location_id: 'loc_01',
    location: mockLocations[0],
    status: 'selesai',
    total_amount: 38500000,
    payment_method: 'Transfer Bank Mandiri',
    pic_ga: mockEmployees[0],
    items: [
      { id: 'pi_01', good_name: 'MacBook Pro M3 Max 16"', qty: 1, unit_price: 38500000, subtotal: 38500000 }
    ],
    created_at: '2026-03-25T10:00:00Z'
  },
  {
    id: 'pur_02',
    purchase_code: 'PO-2026-002',
    purchase_date: '2026-03-28',
    supplier_name: 'CV Sentra Interior Kantor',
    location_id: 'loc_02',
    location: mockLocations[1],
    status: 'disetujui',
    total_amount: 25200000,
    payment_method: 'Tempo 30 Hari',
    pic_ga: mockEmployees[1],
    items: [
      { id: 'pi_02', good_name: 'Kursi Ergonomis Mesh V2', qty: 6, unit_price: 4200000, subtotal: 25200000 }
    ],
    created_at: '2026-03-28T14:20:00Z'
  },
  {
    id: 'pur_03',
    purchase_code: 'PO-2026-003',
    purchase_date: '2026-04-02',
    supplier_name: 'PT Daikin Airconditioning Indonesia',
    location_id: 'loc_04',
    location: mockLocations[3],
    status: 'diajukan',
    total_amount: 17800000,
    payment_method: 'Transfer BCA',
    pic_ga: mockEmployees[0],
    items: [
      { id: 'pi_03', good_name: 'AC Daikin Inverter 2 PK Flash', qty: 2, unit_price: 8900000, subtotal: 17800000 }
    ],
    created_at: '2026-04-02T11:00:00Z'
  }
];

export const mockMaintenances = [
  {
    id: 'mnt_01',
    ticket_code: 'MNT-2026-001',
    title: 'Perawatan Berkala Genset 50kVA Cikarang',
    item_name: 'Genset Cummins 50kVA Standby',
    location_id: 'loc_02',
    location: mockLocations[1],
    pic_ga: mockEmployees[4],
    priority: 'high',
    status: 'in_progress',
    cost: 4500000,
    description: 'Penggantian oli pelumas, filter solar, dan pembersihan aki starter',
    created_at: '2026-04-01T09:00:00Z'
  },
  {
    id: 'mnt_02',
    ticket_code: 'MNT-2026-002',
    title: 'AC Ruang Server Kantor Pusat Tidak Dingin',
    item_name: 'AC Split Daikin Inverter 2 PK',
    location_id: 'loc_01',
    location: mockLocations[0],
    pic_ga: mockEmployees[0],
    priority: 'urgent',
    status: 'open',
    cost: 1200000,
    description: 'Pipa kondensor bocor halus, freon habis suhu ruangan naik ke 28°C',
    created_at: '2026-04-03T10:15:00Z'
  },
  {
    id: 'mnt_03',
    ticket_code: 'MNT-2026-003',
    title: 'Pembersihan & Kalibrasi CCTV Area Kasir',
    item_name: 'IP Camera Hikvision 4K Dome',
    location_id: 'loc_03',
    location: mockLocations[2],
    pic_ga: mockEmployees[1],
    priority: 'medium',
    status: 'done',
    cost: 750000,
    description: 'Fokus lensa kabur terkena debu, sudah dibersihkan dan sudut pandang disesuaikan',
    created_at: '2026-03-29T14:00:00Z'
  }
];

export const mockVehicles = [
  {
    id: 'veh_01',
    vehicle_name: 'Toyota Hilux Single Cabin 4x4',
    license_plate: 'B 9142 SXZ',
    plate_number: 'B 9142 SXZ',
    type: 'Mobil Operasional',
    vehicle_type: 'Mobil Operasional',
    name_stnk: 'PT ElectroHub Retail Indonesia',
    date_stnk: '2027-11-15',
    date_service: '2026-05-10',
    date_change_plate: '2028-11-15',
    interval_service: 6,
    is_active: true,
    is_draft: false,
    brand: 'Toyota',
    year: 2023,
    driver: mockEmployees[4],
    location_id: 'loc_02',
    location: mockLocations[1],
    odometer: 32450,
    tax_due_date: '2026-11-15',
    status: 'Tersedia'
  },
  {
    id: 'veh_02',
    vehicle_name: 'Isuzu Elf Box Pendingin 4 Roda',
    license_plate: 'B 9510 PQR',
    plate_number: 'B 9510 PQR',
    type: 'Truk Box Logistik',
    vehicle_type: 'Truk Box Logistik',
    name_stnk: 'PT ElectroHub Retail Indonesia',
    date_stnk: '2027-08-20',
    date_service: '2026-04-28',
    date_change_plate: '2027-08-20',
    interval_service: 3,
    is_active: true,
    is_draft: false,
    brand: 'Isuzu',
    year: 2022,
    driver: mockEmployees[4],
    location_id: 'loc_02',
    location: mockLocations[1],
    odometer: 64120,
    tax_due_date: '2026-08-20',
    status: 'Digunakan'
  },
  {
    id: 'veh_03',
    vehicle_name: 'Honda Vario 160 CBS (Kurir Dokumen)',
    license_plate: 'B 3821 TKV',
    plate_number: 'B 3821 TKV',
    type: 'Motor Operasional',
    vehicle_type: 'Motor Operasional',
    name_stnk: 'PT ElectroHub Retail Indonesia',
    date_stnk: '2028-02-10',
    date_service: '2026-06-15',
    date_change_plate: '2029-02-10',
    interval_service: 2,
    is_active: true,
    is_draft: false,
    brand: 'Honda',
    year: 2024,
    driver: mockEmployees[0],
    location_id: 'loc_01',
    location: mockLocations[0],
    odometer: 11200,
    tax_due_date: '2027-02-10',
    status: 'Tersedia'
  }
];

export const mockAssets = [
  {
    id: 'ast_item_01',
    asset_code: 'AST-KMP-2024-001',
    code_asset: 'AST-KMP-2024-001',
    asset_name: 'MacBook Pro M3 Max 16" (CTO)',
    serial_number: 'C02G90XXMD6M',
    asset_type: { name: 'Aset Komputasi & Gadget' },
    good: mockGoods[0],
    purchase_date: '2024-02-15',
    purchase_cost: 42500000,
    acquisition_cost: 42500000,
    location_id: 'loc_01',
    location: mockLocations[0],
    custodian: mockEmployees[0],
    condition: 'Baik',
    is_active: true,
    status: 'Aktif'
  },
  {
    id: 'ast_item_02',
    asset_code: 'AST-MSN-2023-014',
    code_asset: 'AST-MSN-2023-014',
    asset_name: 'Genset Silent Cummins 50kVA',
    serial_number: 'CUM-50-88129',
    asset_type: { name: 'Aset Mesin & Peralatan Toko' },
    good: { good_name: 'Genset Silent Cummins 50kVA' },
    purchase_date: '2023-08-10',
    purchase_cost: 115000000,
    acquisition_cost: 115000000,
    location_id: 'loc_02',
    location: mockLocations[1],
    custodian: mockEmployees[4],
    condition: 'Baik',
    is_active: true,
    status: 'Aktif'
  },
  {
    id: 'ast_item_03',
    asset_code: 'AST-KND-2023-005',
    code_asset: 'AST-KND-2023-005',
    asset_name: 'Isuzu Elf Box Logistik Cikarang',
    serial_number: 'MHIE7182900192',
    asset_type: { name: 'Aset Operasional Kendaraan' },
    good: { good_name: 'Isuzu Elf Box Logistik Cikarang' },
    purchase_date: '2023-05-20',
    purchase_cost: 385000000,
    acquisition_cost: 385000000,
    location_id: 'loc_02',
    location: mockLocations[1],
    custodian: mockEmployees[4],
    condition: 'Baik',
    is_active: true,
    status: 'Aktif'
  }
];

export const mockTransfers = [
  {
    id: 'trf_01',
    transfer_code: 'TRF-2026-001',
    code: 'TRF-2026-001',
    transfer_date: '2026-03-28',
    date_transfer: '2026-03-28',
    from_location: mockLocations[1],
    to_location: mockLocations[3],
    from_pic: mockEmployees[4],
    to_pic: mockEmployees[5],
    status: 'terima',
    notes: 'Pengiriman unit display dan perlengkapan opening store',
    good_name: 'Kursi Ergonomis Mesh V2',
    qty: 6,
    items: [
      { id: 'ti_01', good_name: 'Kursi Ergonomis Mesh V2', qty: 6 }
    ],
    good: mockGoods[2],
    created_at: '2026-03-28T09:00:00Z'
  },
  {
    id: 'trf_02',
    transfer_code: 'TRF-2026-002',
    code: 'TRF-2026-002',
    transfer_date: '2026-04-02',
    date_transfer: '2026-04-02',
    from_location: mockLocations[0],
    to_location: mockLocations[2],
    from_pic: mockEmployees[0],
    to_pic: mockEmployees[3],
    status: 'kirim',
    notes: 'Transfer cadangan kertas kasir dan toner printer',
    good_name: 'Toner Cartridge Canon 325 Hitam',
    qty: 3,
    items: [
      { id: 'ti_02', good_name: 'Toner Cartridge Canon 325 Hitam', qty: 3 }
    ],
    good: mockGoods[6],
    created_at: '2026-04-02T14:30:00Z'
  }
];

export const mockLicenses = [
  {
    id: 'lic_01',
    app_name: 'Microsoft 365 Business Standard (100 Seat)',
    number_license: 'MS365-ENT-88219-JKT',
    software_name: 'Microsoft 365 Business Standard (100 Seat)',
    license_key: 'MS365-ENT-88219-JKT',
    vendor: 'Microsoft Indonesia',
    location: mockLocations[0],
    location_id: 'loc_01',
    date_active: '2025-06-01',
    date_expired: '2026-06-01',
    start_date: '2025-06-01',
    expire_date: '2026-06-01',
    price_period: 165000000,
    price_periode: 165000000,
    cost: 165000000,
    status_payment: 'paid',
    is_active: true,
    is_draft: false,
    is_recurring: true,
    status: 'Aktif'
  },
  {
    id: 'lic_02',
    app_name: 'Adobe Creative Cloud All Apps (10 Seat)',
    number_license: 'ADOBE-CC-9901-MKT',
    software_name: 'Adobe Creative Cloud All Apps (10 Seat)',
    license_key: 'ADOBE-CC-9901-MKT',
    vendor: 'PT Synnex Metrodata',
    location: mockLocations[0],
    location_id: 'loc_01',
    date_active: '2025-08-15',
    date_expired: '2026-08-15',
    start_date: '2025-08-15',
    expire_date: '2026-08-15',
    price_period: 84000000,
    price_periode: 84000000,
    cost: 84000000,
    status_payment: 'paid',
    is_active: true,
    is_draft: false,
    is_recurring: true,
    status: 'Aktif'
  }
];

export const mockSchedules = [
  {
    id: 'sch_01',
    date_schedule: '2026-04-15',
    perihal: 'service',
    title: 'Service AC Triwulan Seluruh Store Jabodetabek',
    description_schedule: '[WAKTU: 09:00][JAM_SELESAI: 12:00] Service berkala 12 unit AC Daikin di area Office & Meeting Room',
    start_date: '2026-04-15',
    end_date: '2026-04-20',
    location_id: 'loc_01',
    location: mockLocations[0],
    locationName: 'Kantor Pusat Jakarta',
    pic: mockEmployees[0],
    pic_external: 'PT Daikin Airconditioning Indonesia',
    status: 'terjadwal'
  },
  {
    id: 'sch_02',
    date_schedule: '2026-04-25',
    perihal: 'cctv',
    title: 'Pemeriksaan Tabung APAR & Jalur Evakuasi Kebakaran',
    description_schedule: '[WAKTU: 10:00][JAM_SELESAI: 14:00] Pengujian tekanan 24 tabung pemadam api dan kelayakan sensor asap',
    start_date: '2026-04-25',
    end_date: '2026-04-26',
    location_id: 'loc_02',
    location: mockLocations[1],
    locationName: 'Gudang Logistik Cikarang',
    pic: mockEmployees[4],
    pic_external: 'Dinas Penanggulangan Kebakaran & Penyelamatan',
    status: 'terjadwal'
  }
];

export const mockPurchaseCartItems = [
  {
    id: 'cart_01',
    good_id: 'gd_02',
    good: mockGoods[1],
    location_id: 'loc_01',
    location: mockLocations[0],
    itemName: 'Monitor Dell UltraSharp 27" 4K',
    goodCode: 'BRG-ELK-002',
    merk: 'Dell',
    categoryId: 'cat_01',
    categoryName: 'Elektronik & Gadget',
    locationId: 'loc_01',
    locationName: 'Kantor Pusat Jakarta',
    qty: 3,
    sources: [{ id: 's_01', request_id: 'req_01', detail_request_id: 'dreq_01', requestCode: 'REQ-2026-001', qtyContributed: 3, qty_contributed: 3, request: { code_request: 'REQ-2026-001' } }]
  },
  {
    id: 'cart_02',
    good_id: 'gd_06',
    good: mockGoods[5],
    location_id: 'loc_03',
    location: mockLocations[2],
    itemName: 'Kertas A4 PaperOne 80gr (Box)',
    goodCode: 'BRG-ATK-001',
    merk: 'PaperOne',
    categoryId: 'cat_04',
    categoryName: 'Alat Tulis Kantor (ATK)',
    locationId: 'loc_03',
    locationName: 'Store Bandung Dago',
    qty: 10,
    sources: [{ id: 's_02', request_id: 'req_02', detail_request_id: 'dreq_02', requestCode: 'REQ-2026-002', qtyContributed: 10, qty_contributed: 10, request: { code_request: 'REQ-2026-002' } }]
  },
  {
    id: 'cart_03',
    good_id: 'gd_09',
    good: mockGoods[8],
    location_id: 'loc_03',
    location: mockLocations[2],
    itemName: 'Handheld Barcode Scanner Wireless 2D',
    goodCode: 'BRG-ELK-004',
    merk: 'Zebra Tech',
    categoryId: 'cat_01',
    categoryName: 'Elektronik & Gadget',
    locationId: 'loc_03',
    locationName: 'Store Bandung Dago',
    qty: 2,
    sources: [{ id: 's_03', request_id: 'req_03', detail_request_id: 'dreq_03', requestCode: 'REQ-2026-003', qtyContributed: 2, qty_contributed: 2, request: { code_request: 'REQ-2026-003' } }]
  }
];

export const mockTransactionReminders = [
  {
    id: 'rem_tx_01',
    reminder_type: 'stnk',
    reference_id: 'veh_01',
    table_reference: 'vehicles',
    due_date: new Date().toISOString().split('T')[0], // Jatuh tempo hari ini
    alert_date_before: [14, 7, 3, 1],
    status: 'active',
    description: 'Perpanjangan STNK Tahunan Avanza Veloz B 1234 ABC (HO)',
    interval_reminder: 12,
    last_notified_at: '2026-04-01 08:00:00'
  },
  {
    id: 'rem_tx_02',
    reminder_type: 'service_vehicle',
    reference_id: 'veh_02',
    table_reference: 'vehicles',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Besok
    alert_date_before: [7, 3, 1],
    status: 'active',
    description: 'Servis Berkala 40.000 KM & Ganti Oli Isuzu Giga Box B 9012 DEF',
    interval_reminder: 6,
    last_notified_at: '2026-04-10 09:00:00'
  },
  {
    id: 'rem_tx_03',
    reminder_type: 'license_expired',
    reference_id: 'lic_01',
    table_reference: 'licenses',
    due_date: new Date().toISOString().split('T')[0], // Hari ini
    alert_date_before: [30, 14, 7],
    status: 'active',
    description: 'Pembaruan Lisensi SAP S/4HANA ERP Cloud Enterprise Edition',
    interval_reminder: 12,
    last_notified_at: '2026-04-05 08:30:00'
  },
  {
    id: 'rem_tx_04',
    reminder_type: 'license_expired',
    reference_id: 'lic_03',
    table_reference: 'licenses',
    due_date: '2026-06-20',
    alert_date_before: [14, 7],
    status: 'active',
    description: 'Perpanjangan Langganan Microsoft 365 E5 250 Seats',
    interval_reminder: 12,
    last_notified_at: null
  },
  {
    id: 'rem_tx_05',
    reminder_type: 'schedule',
    reference_id: 'sch_01',
    table_reference: 'schedules',
    due_date: '2026-04-25',
    alert_date_before: [3, 1],
    status: 'active',
    description: 'Audit Keselamatan Kerja & Pemadam Api Ringan (APAR) Seluruh Toko',
    interval_reminder: 6,
    last_notified_at: '2026-04-12 10:00:00'
  },
  {
    id: 'rem_tx_06',
    reminder_type: 'cctv',
    reference_id: 'ast_item_04',
    table_reference: 'assets',
    due_date: '2026-04-28',
    alert_date_before: [7, 3],
    status: 'active',
    description: 'Pemeriksaan DVR & Penyimpanan NVR Rekaman CCTV Gudang Cikarang',
    interval_reminder: 3,
    last_notified_at: null
  },
  {
    id: 'rem_tx_07',
    reminder_type: 'stnk',
    reference_id: 'veh_04',
    table_reference: 'vehicles',
    due_date: '2026-03-30',
    alert_date_before: [7, 1],
    status: 'overdue',
    description: 'Perpanjangan Uji KIR Truk Box Hino Dutro B 9555 KLG (Overdue)',
    interval_reminder: 6,
    last_notified_at: '2026-03-29 08:00:00'
  },
  {
    id: 'rem_tx_08',
    reminder_type: 'service_vehicle',
    reference_id: 'veh_03',
    table_reference: 'vehicles',
    due_date: '2026-03-15',
    alert_date_before: [7],
    status: 'done',
    description: 'Tune Up & Spooring Daihatsu Gran Max Blind Van B 5678 GHI (Selesai)',
    interval_reminder: 6,
    last_notified_at: '2026-03-10 14:00:00'
  }
];



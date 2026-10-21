export const mockGaDashboard = {
  purchases: {
    total_spent: 148500000,
    stats: {
      draft: 2,
      diajukan: 5,
      disetujui: 4,
      diterima: 6,
      selesai: 18,
      batal: 1,
      retur: 0,
      refund: 0
    },
    recent: [
      {
        id: 'pur_01',
        purchase_code: 'PO-2026-001',
        item_name: 'MacBook Pro M3 Max 32GB',
        total_amount: 38500000,
        status: 'selesai',
        pic_ga: { full_name: 'Refangga Lintar' },
        location: { location_name: 'Kantor Pusat Jakarta' },
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'pur_02',
        purchase_code: 'PO-2026-002',
        item_name: 'Kursi Ergonomis Mesh Steelcase',
        total_amount: 14200000,
        status: 'disetujui',
        pic_ga: { full_name: 'Dewi Lestari' },
        location: { location_name: 'Gudang Logistik Cikarang' },
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'pur_03',
        purchase_code: 'PO-2026-003',
        item_name: 'AC Daikin Inverter 2 PK',
        total_amount: 9800000,
        status: 'diajukan',
        pic_ga: { full_name: 'Rudi Hermawan' },
        location: { location_name: 'Store Surabaya Gubeng' },
        created_at: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ]
  },
  requests: {
    stats: {
      draft: 1,
      dalam_pengajuan: 4,
      proses_ga: 3,
      disetujui: 6,
      diserahkan: 14,
      batal: 1
    },
    recent: [
      {
        id: 'req_01',
        request_code: 'REQ-2026-008',
        item_name: 'Kertas A4 PaperOne 80gr (10 Rim)',
        status: 'dalam_pengajuan',
        pic_ga: { full_name: 'Refangga Lintar' },
        location: { location_name: 'Kantor Pusat Jakarta' },
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'req_02',
        request_code: 'REQ-2026-009',
        item_name: 'Toner Cartridge Canon 325 Hitam',
        status: 'disetujui',
        pic_ga: { full_name: 'Dewi Lestari' },
        location: { location_name: 'Store Bandung Dago' },
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ]
  },
  maintenances: {
    stats: {
      open: 3,
      hold: 1,
      in_progress: 4,
      done: 15,
      cancel: 1
    },
    recent: [
      {
        id: 'mnt_01',
        ticket_code: 'MNT-2026-012',
        item_name: 'Genset Cummins 50kVA (Service Berkala)',
        status: 'in_progress',
        pic_ga: { full_name: 'Bambang Sudibyo' },
        location: { location_name: 'Gudang Logistik Cikarang' },
        created_at: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        id: 'mnt_02',
        ticket_code: 'MNT-2026-013',
        item_name: 'Perbaikan Lift Penumpang Gedung A',
        status: 'open',
        pic_ga: { full_name: 'Refangga Lintar' },
        location: { location_name: 'Kantor Pusat Jakarta' },
        created_at: new Date(Date.now() - 3600000 * 30).toISOString()
      }
    ]
  },
  low_stocks: 4,
  purchase_trend_percent: 14.8,
  trends: [
    { month: 'Nov', year: 2025, purchase: 18500000, request: 12 },
    { month: 'Des', year: 2025, purchase: 22000000, request: 16 },
    { month: 'Jan', year: 2026, purchase: 19800000, request: 14 },
    { month: 'Feb', year: 2026, purchase: 26400000, request: 19 },
    { month: 'Mar', year: 2026, purchase: 23100000, request: 15 },
    { month: 'Apr', year: 2026, purchase: 36050000, request: 22 }
  ],
  viewer: {
    canFilterByPic: true,
    staffOptions: [
      { id: 'pic_01', full_name: 'Refangga Lintar' },
      { id: 'pic_02', full_name: 'Dewi Lestari' },
      { id: 'pic_03', full_name: 'Rudi Hermawan' },
      { id: 'pic_04', full_name: 'Bambang Sudibyo' }
    ]
  },
  top_pic: [
    { id: 'pic_01', full_name: 'Refangga Lintar', count: 24 },
    { id: 'pic_02', full_name: 'Dewi Lestari', count: 18 },
    { id: 'pic_03', full_name: 'Rudi Hermawan', count: 12 },
    { id: 'pic_04', full_name: 'Bambang Sudibyo', count: 9 }
  ]
};

export const mockMarketingDashboard = {
  purchases: {
    total_spent: 94200000,
    committed_count: 8,
    stats: {
      draft: 1,
      diajukan: 3,
      disetujui: 4,
      diterima: 5,
      selesai: 12,
      batal: 0
    },
    recent: [
      {
        id: 'mpur_01',
        purchase_code: 'MKT-PO-001',
        item_name: 'Neon Sign Acrylic Billboard 3x2m',
        total_amount: 18500000,
        status: 'selesai',
        pic: { full_name: 'Siti Rahma' },
        location: { location_name: 'Store Surabaya Gubeng' },
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'mpur_02',
        purchase_code: 'MKT-PO-002',
        item_name: 'Roll Up Banner Promosi Ramadhan 2026 (50 Pcs)',
        total_amount: 12500000,
        status: 'disetujui',
        pic: { full_name: 'Fajar Nugroho' },
        location: { location_name: 'Kantor Pusat Jakarta' },
        created_at: new Date(Date.now() - 3600000 * 20).toISOString()
      }
    ]
  },
  requests: {
    stats: {
      draft: 2,
      dalam_pengajuan: 3,
      proses_marketing: 2,
      disetujui: 5,
      diserahkan: 11,
      batal: 0
    },
    recent: [
      {
        id: 'mreq_01',
        request_code: 'MKT-REQ-005',
        item_name: 'Brochure Katalog Gadget Q2',
        status: 'dalam_pengajuan',
        pic: { full_name: 'Siti Rahma' },
        location: { location_name: 'Store Bali Kuta' },
        created_at: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ]
  },
  transfers: {
    stats: {
      draft: 1,
      kirim: 2,
      terima: 7,
      batal: 0
    }
  },
  purchase_trend_percent: 8.5,
  trends: [
    { month: 'Nov', year: 2025, purchase: 12000000, request: 9 },
    { month: 'Des', year: 2025, purchase: 17500000, request: 14 },
    { month: 'Jan', year: 2026, purchase: 14000000, request: 11 },
    { month: 'Feb', year: 2026, purchase: 19000000, request: 13 },
    { month: 'Mar', year: 2026, purchase: 16500000, request: 10 },
    { month: 'Apr', year: 2026, purchase: 22000000, request: 17 }
  ],
  viewer: {
    canFilterByPic: true,
    staffOptions: [
      { id: 'mpic_01', full_name: 'Siti Rahma' },
      { id: 'mpic_02', full_name: 'Fajar Nugroho' },
      { id: 'mpic_03', full_name: 'Rian Pratama' }
    ]
  },
  top_pic: [
    { id: 'mpic_01', full_name: 'Siti Rahma', count: 19 },
    { id: 'mpic_02', full_name: 'Fajar Nugroho', count: 14 },
    { id: 'mpic_03', full_name: 'Rian Pratama', count: 9 }
  ]
};

export const mockPicSubmissions = [
  { id: 'sub_01', employee_id: 'sub_01', location_name: 'Kantor Pusat Jakarta', full_name: 'Kantor Pusat Jakarta', total_pengajuan: 42, total: 42 },
  { id: 'sub_02', employee_id: 'sub_02', location_name: 'Gudang Logistik Cikarang', full_name: 'Gudang Logistik Cikarang', total_pengajuan: 31, total: 31 },
  { id: 'sub_03', employee_id: 'sub_03', location_name: 'Store Bandung Dago', full_name: 'Store Bandung Dago', total_pengajuan: 24, total: 24 },
  { id: 'sub_04', employee_id: 'sub_04', location_name: 'Store Surabaya Gubeng', full_name: 'Store Surabaya Gubeng', total_pengajuan: 19, total: 19 },
  { id: 'sub_05', employee_id: 'sub_05', location_name: 'Store Bali Kuta', full_name: 'Store Bali Kuta', total_pengajuan: 15, total: 15 },
  { id: 'sub_06', employee_id: 'sub_06', location_name: 'Store Medan Petisah', full_name: 'Store Medan Petisah', total_pengajuan: 11, total: 11 }
];

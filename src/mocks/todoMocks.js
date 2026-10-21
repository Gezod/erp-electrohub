import { mockEmployees } from './masterMocks';

export const mockBoards = [
  {
    id: 'brd_01',
    name: 'Ekspansi Ritel & Renovasi Store Q2',
    description: 'Koordinasi pengadaan furnitur, infrastruktur IT, dan perizinan outlet baru',
    color: '#3b82f6',
    is_active: true,
    tasks_count: 5,
    created_at: '2026-03-01T08:00:00Z'
  },
  {
    id: 'brd_02',
    name: 'Implementasi Barcode & Stock Audit Cikarang',
    description: 'Digitalisasi pelacakan stok barang masuk, keluar, dan penomoran rak logistik',
    color: '#10b981',
    is_active: true,
    tasks_count: 4,
    created_at: '2026-03-10T09:00:00Z'
  },
  {
    id: 'brd_03',
    name: 'Audit Fasilitas & K3 Gedung Pusat',
    description: 'Pemeriksaan genset, APAR, instalasi kelistrikan, dan sertifikasi lift',
    color: '#f59e0b',
    is_active: true,
    tasks_count: 3,
    created_at: '2026-03-15T10:00:00Z'
  }
];

export const mockTasks = [
  {
    id: 'tsk_01',
    board_id: 'brd_01',
    title: 'Survei Layout & Instalasi Listrik Store Surabaya',
    description: 'Pengecekan daya kelistrikan PLN 33.000 VA dan penempatan titik panel AC',
    status: 'done',
    priority: 'high',
    start_date: '2026-03-02',
    due_date: '2026-03-12',
    end_date: '2026-03-12',
    progress: 100,
    assignees: [mockEmployees[0], mockEmployees[5]],
    comments: [
      { id: 'com_01', author: 'Refangga Lintar', message: 'Survei selesai, laporan approved oleh Chief GA.', created_at: '2026-03-12T14:20:00Z' }
    ]
  },
  {
    id: 'tsk_02',
    board_id: 'brd_01',
    title: 'Pengadaan Meja Kasir & Display Showcase Akrilik',
    description: 'Proses PO dan pemilihan vendor interior retail sesuai standar branding',
    status: 'in_progress',
    priority: 'urgent',
    start_date: '2026-03-14',
    due_date: '2026-04-20',
    end_date: '2026-04-20',
    progress: 65,
    assignees: [mockEmployees[1], mockEmployees[2]],
    comments: [
      { id: 'com_02', author: 'Dewi Lestari', message: 'Sampel bahan akrilik sudah lolos uji ketahanan beban.', created_at: '2026-03-25T11:00:00Z' }
    ]
  },
  {
    id: 'tsk_03',
    board_id: 'brd_01',
    title: 'Instalasi Access Point Wi-Fi 6 & Switch 24-Port',
    description: 'Pemasangan 4 unit Ubiquiti AP di area penjualan dan backoffice',
    status: 'todo',
    priority: 'medium',
    start_date: '2026-04-22',
    due_date: '2026-05-02',
    end_date: '2026-05-02',
    progress: 10,
    assignees: [mockEmployees[0]],
    comments: []
  },
  {
    id: 'tsk_04',
    board_id: 'brd_02',
    title: 'Pemasangan QR Barcode Label pada 500 Rak Pallet',
    description: 'Cetak dan laminasi stiker barcode tahan gores & cuaca lembap',
    status: 'done',
    priority: 'high',
    start_date: '2026-03-11',
    due_date: '2026-03-22',
    end_date: '2026-03-22',
    progress: 100,
    assignees: [mockEmployees[4]],
    comments: []
  },
  {
    id: 'tsk_05',
    board_id: 'brd_02',
    title: 'Training Penggunaan Scanner Zebra bagi Operator Gudang',
    description: 'Workshop singkat scan penerimaan barang masuk dan mutasi stok',
    status: 'in_progress',
    priority: 'medium',
    start_date: '2026-03-24',
    due_date: '2026-04-10',
    end_date: '2026-04-10',
    progress: 50,
    assignees: [mockEmployees[0], mockEmployees[4]],
    comments: []
  },
  {
    id: 'tsk_06',
    board_id: 'brd_03',
    title: 'Uji Beban & Penggantian Filter Solar Genset 50kVA',
    description: 'Maintenance rutin semesteran bersama vendor resmi Cummins',
    status: 'todo',
    priority: 'urgent',
    start_date: '2026-04-05',
    due_date: '2026-04-18',
    end_date: '2026-04-18',
    progress: 0,
    assignees: [mockEmployees[1]],
    comments: []
  }
];

export const mockMilestones = [
  { id: 'mls_01', board_id: 'brd_01', title: 'Grand Opening Store Surabaya', date: '2026-05-15', completed: false },
  { id: 'mls_02', board_id: 'brd_02', title: 'Go-Live WMS Barcode System', date: '2026-04-15', completed: false },
  { id: 'mls_03', board_id: 'brd_03', title: 'Audit Sertifikasi K3 Lolos', date: '2026-04-30', completed: false }
];

export const mockReminders = [
  {
    id: 'rem_01',
    task_id: 'tsk_02',
    title: 'Deadline Finalisasi Vendor Interior Meja Kasir',
    due_date: '2026-04-20',
    is_dismissed: false,
    task: { title: 'Pengadaan Meja Kasir & Display Showcase Akrilik' }
  },
  {
    id: 'rem_02',
    task_id: 'tsk_06',
    title: 'Jadwal Service Genset Cummins bersama Vendor',
    due_date: '2026-04-18',
    is_dismissed: false,
    task: { title: 'Uji Beban & Penggantian Filter Solar Genset 50kVA' }
  }
];

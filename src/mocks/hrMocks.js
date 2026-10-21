import { mockEmployees } from './masterMocks';

export const mockAttendanceHolidays = [
  { id: 'hol_01', holiday_date: '2026-01-01', holiday_name: 'Tahun Baru 2026 Masehi', is_active: true },
  { id: 'hol_02', holiday_date: '2026-03-21', holiday_name: 'Hari Raya Idul Fitri 1447 H', is_active: true },
  { id: 'hol_03', holiday_date: '2026-03-22', holiday_name: 'Cuti Bersama Idul Fitri', is_active: true },
  { id: 'hol_04', holiday_date: '2026-05-01', holiday_name: 'Hari Buruh Internasional', is_active: true },
  { id: 'hol_05', holiday_date: '2026-08-17', holiday_name: 'Hari Kemerdekaan RI', is_active: true }
];

export const mockAttendanceLocations = [
  { id: 'atloc_01', location_name: 'Radius Geofence Kantor Pusat Jakarta', latitude: -6.2255, longitude: 106.8095, radius_meters: 100, is_active: true },
  { id: 'atloc_02', location_name: 'Radius Geofence Gudang Cikarang', latitude: -6.3450, longitude: 107.1520, radius_meters: 250, is_active: true },
  { id: 'atloc_03', location_name: 'Radius Geofence Store Bandung Dago', latitude: -6.8920, longitude: 107.6105, radius_meters: 80, is_active: true }
];

export const mockAttendanceSettings = {
  check_in_start: '07:30',
  check_in_time: '08:30',
  check_out_time: '17:30',
  tolerance_minutes: 15,
  flexible_hours: false
};

export const mockRegulations = [
  {
    id: 'reg_01',
    code: 'PP-2025-01',
    title: 'Peraturan Perusahaan Mengenai Disiplin & Jam Kerja',
    category: 'Kedisiplinan',
    effective_date: '2025-01-01',
    description: 'Panduan batas toleransi keterlambatan, hak cuti tahunan, dan presensi',
    file_url: '#'
  },
  {
    id: 'reg_02',
    code: 'SOP-K3-02',
    title: 'Standar Operasional Keselamatan & Kesehatan Kerja (K3) Gudang',
    category: 'K3 & Fasilitas',
    effective_date: '2025-06-01',
    description: 'Kewajiban penggunaan helm keselamatan, rompi reflektor, dan sepatu safety',
    file_url: '#'
  }
];

export const mockFineTypes = [
  { id: 'ft_01', name: 'Keterlambatan Hadir > 30 Menit', amount: 50000, is_active: true },
  { id: 'ft_02', name: 'Tidak Memakai ID Card / Seragam', amount: 25000, is_active: true },
  { id: 'ft_03', name: 'Mangkir Tanpa Surat Dokter (Alpa)', amount: 150000, is_active: true }
];

export const mockEmployeeFines = [
  {
    id: 'ef_01',
    employee_id: 'emp_002',
    employee: mockEmployees[1],
    fine_type_id: 'ft_01',
    fine_type: { name: 'Keterlambatan Hadir > 30 Menit' },
    date: '2026-03-24',
    amount: 50000,
    status: 'Lunas Potong Gaji',
    reason: 'Keterlambatan 45 menit karena kendala transportasi KRL'
  }
];

export const mockOvertimeApprovals = [
  {
    id: 'ovt_01',
    employee_id: 'emp_005',
    employee: mockEmployees[4],
    date: '2026-04-02',
    start_time: '18:00',
    end_time: '21:30',
    total_hours: 3.5,
    purpose: 'Bongkar muat kontainer barang masuk logistik Cikarang',
    status: 'Disetujui',
    approved_by: 'Refangga Lintar'
  },
  {
    id: 'ovt_02',
    employee_id: 'emp_002',
    employee: mockEmployees[1],
    date: '2026-04-03',
    start_time: '18:00',
    end_time: '20:00',
    total_hours: 2,
    purpose: 'Rekapitulasi berkas audit inventaris semesteran',
    status: 'Menunggu Persetujuan',
    approved_by: '-'
  }
];

export const mockPayrollRuns = [
  {
    id: 'pr_01',
    period_month: 'Maret',
    period_year: 2026,
    batch_name: 'Gaji Bulanan All Staff - Maret 2026',
    total_employees: 48,
    total_gross: 365000000,
    total_deductions: 18500000,
    total_net: 346500000,
    status: 'Selesai Dibayar',
    payment_date: '2026-03-27'
  },
  {
    id: 'pr_02',
    period_month: 'Februari',
    period_year: 2026,
    batch_name: 'Gaji Bulanan All Staff - Februari 2026',
    total_employees: 47,
    total_gross: 358000000,
    total_deductions: 17200000,
    total_net: 340800000,
    status: 'Selesai Dibayar',
    payment_date: '2026-02-27'
  }
];

export const mockResignations = [
  {
    id: 'rsg_01',
    employee_id: 'emp_006',
    employee: mockEmployees[5],
    submission_date: '2026-03-01',
    effective_date: '2026-04-01',
    reason: 'Mendapat penawaran karir di luar kota',
    handover_status: 'Selesai',
    status: 'Disetujui'
  }
];

export const mockViolations = [
  {
    id: 'vio_01',
    employee_id: 'emp_004',
    employee: mockEmployees[3],
    violation_date: '2026-02-15',
    sp_level: 'Surat Peringatan I (SP 1)',
    reason: 'Meninggalkan area store tanpa izin atasan saat jam operasional berlangsung',
    status: 'Aktif',
    valid_until: '2026-08-15'
  }
];

export const mockTrainingEmployees = [
  {
    id: 'tr_01',
    employee_id: 'emp_004',
    employee: mockEmployees[3],
    training_title: 'Sertifikasi Keunggulan Retail Sales & Service Omnichannel',
    trainer: 'MarkPlus Institute',
    start_date: '2026-04-10',
    end_date: '2026-04-12',
    cost: 3500000,
    status: 'Terdaftar'
  },
  {
    id: 'tr_02',
    employee_id: 'emp_005',
    employee: mockEmployees[4],
    training_title: 'Sertifikasi Operator Forklift & Manajemen K3 Gudang',
    trainer: 'Kemnaker RI / PJK3 Resmi',
    start_date: '2026-04-18',
    end_date: '2026-04-20',
    cost: 4800000,
    status: 'Terdaftar'
  }
];

export const mockBroadcasts = [
  {
    id: 'bc_01',
    subject: 'Pengumuman Libur dan Cuti Bersama Hari Raya Idul Fitri 2026',
    target_division: 'Semua Karyawan',
    sent_at: '2026-03-15T09:00:00Z',
    status: 'Terkirim',
    read_count: 46
  },
  {
    id: 'bc_02',
    subject: 'Himbauan Pengisian Evaluasi Kinerja (KPI) Triwulan I',
    target_division: 'Semua Karyawan',
    sent_at: '2026-03-28T10:00:00Z',
    status: 'Terkirim',
    read_count: 39
  }
];

export const routes = [
  {
    path: '/',
    redirect: '/welcome',
    meta: { requiresAuth: true },
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('@/modules/welcome/index.vue'),
    meta: { title: 'Beranda', requiresAuth: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/modules/dashboard/index.vue'),
    meta: { title: 'Dashboard', requiresAuth: true, privilege: 'dashboard-ga:read' },
  },
  {
  path: '/dashboard/marketing',
  name: 'MarketingDashboard',
  component: () => import('@/modules/dashboard/marketing.vue'),
  meta: { title: 'Dashboard Marketing', requiresAuth: true, privilege: 'dashboard-marketing:read' },
},

  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/pages/login.vue'),
    meta: { title: 'Login', requiresGuest: true },
  },
  {
    path: '/absen',
    name: 'PublicAttendance',
    component: () => import('@/modules/public/attendance/index.vue'),
    meta: { title: 'Absensi Karyawan Training' },
  },


  // Organization Routes
  {
    path: '/organization',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'divisions',
        name: 'DivisionList',
        component: () => import('@/modules/organization/divisions/index.vue'),
        meta: { title: 'Divisions', privilege: 'organization:read' },
      },
      {
        path: 'employees',
        name: 'EmployeeList',
        component: () => import('@/modules/organization/employees/index.vue'),
        meta: { title: 'Employees', privilege: 'organization:read' },
      },
      {
        // Detail View for Employee Lifecycle
        path: 'employees/detail/:id',
        name: 'EmployeeDetail',
        component: () => import('@/modules/organization/employees/detail.vue'),
        meta: { title: 'Employee Detail', privilege: 'organization:read' },
      },
      {
        path: 'chiefs',
        name: 'ChiefList',
        component: () => import('@/modules/organization/chiefs/index.vue'),
        meta: { title: 'Chiefs', privilege: 'organization:read' },
      },
    ],
  },

  // Master Routes
  {
    path: '/master',
    meta: { requiresAuth: true },
    children: [
      // 1. Halaman Tabel List (Parent level di dalam master)
      {
        path: 'goods',
        name: 'GoodsList',
        component: () => import('@/modules/master/goods/index.vue'),
        meta: { title: 'Goods', privilege: 'goods:read' },
      },

      // 2. Halaman Create (Sejajar dengan List)
      {
        path: 'goods/create',
        name: 'GoodsCreate',
        // Saran: Jika ini sudah jadi halaman utuh (bukan modal),
        // pertimbangkan rename file menjadi form.vue agar logis.
        component: () => import('@/modules/master/goods/components/GoodsFormModal.vue'),
        meta: { requiresAuth: true, privilege: 'goods:read' },
      },

      // 3. Halaman Edit (Sejajar dengan List)
      {
        path: 'goods/edit/:id',
        name: 'GoodsEdit',
        component: () => import('@/modules/master/goods/components/GoodsFormModal.vue'),
        meta: { requiresAuth: true, privilege: 'goods:read' },
      },
      // Supply Chain — Master Data SKU & Harga
      {
        path: 'sc-sku',
        name: 'ScSkuList',
        component: () => import('@/modules/master/sc-sku/index.vue'),
        meta: { title: 'Master SKU & Harga', privilege: 'sc-sku:read' },
      },
      // Supply Chain — Master Kategori SKU
      {
        path: 'sc-categories',
        name: 'ScCategoryList',
        component: () => import('@/modules/master/sc-categories/index.vue'),
        meta: { title: 'Kategori SKU', privilege: 'sc-categories:read' },
      },
      // Marketing Operasional — Master Data
      {
        path: 'marketing-goods',
        name: 'MarketingGoodsList',
        component: () => import('@/modules/master/marketing-goods/index.vue'),
        meta: { title: 'Data Barang Marketing', privilege: 'marketing-goods:read' },
      },
      {
        path: 'store-assignments',
        name: 'StoreAssignmentList',
        component: () => import('@/modules/master/store-assignment/index.vue'),
        meta: { title: 'Store Assignment', privilege: 'marketing-store-assignments:read' },
      },
      {
        path: 'admin-pusat-roster',
        name: 'AdminPusatRosterList',
        component: () => import('@/modules/master/admin-pusat-roster/index.vue'),
        meta: { title: 'Roster Admin Pusat', privilege: 'marketing-admin-pusat-roster:read' },
      },
      {
        path: 'categories',
        name: 'MasterCategories',
        component: () => import('@/modules/master/categories/index.vue'),
        meta: { title: 'Categories', privilege: 'categories:read' },
      },
      {
        path: 'categories/create',
        redirect: { name: 'MasterCategories' },
      },
      {
        path: 'categories/edit/:id',
        redirect: { name: 'MasterCategories' },
      },
      {
        path: 'locations',
        name: 'MasterLocations',
        component: () => import('@/modules/master/locations/index.vue'),
        meta: { title: 'Locations', privilege: 'locations:read' },
      },
      {
        path: 'locations/create',
        redirect: { name: 'MasterLocations' },
      },
      {
        path: 'locations/edit/:id',
        redirect: { name: 'MasterLocations' },
      },
      {
        path: 'asset-types',
        name: 'MasterAssetTypes',
        component: () => import('@/modules/master/asset-types/index.vue'),
        meta: { title: 'Asset Types', privilege: 'asset-types:read' },
      },
      {
        path: 'asset-types/create',
        redirect: { name: 'MasterAssetTypes' },
      },
      {
        path: 'asset-types/edit/:id',
        redirect: { name: 'MasterAssetTypes' },
      },
      {
        path: 'positions',
        name: 'MasterPositions',
        component: () => import('@/modules/master/positions/index.vue'),
        meta: { title: 'Positions', privilege: 'positions:read' },
      },
      {
        path: 'positions/create',
        redirect: { name: 'MasterPositions' },
      },
      {
        path: 'positions/edit/:id',
        redirect: { name: 'MasterPositions' },
      },
      {
        path: 'uom',
        name: 'UomList',
        component: () => import('@/modules/master/uom/index.vue'),
        meta: { title: 'Units of Measurement', privilege: 'uom:read' },
      },
      {
        path: 'uom/create',
        redirect: { name: 'UomList' },
      },
      {
        path: 'uom/edit/:id',
        redirect: { name: 'UomList' },
      },
    ],
  },
  // Transaction Routes
  {
    path: '/transaction',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'assets',
        name: 'TranAssets',
        component: () => import('@/modules/transaction/asset/index.vue'),
        meta: { title: 'Assets', privilege: 'assets:read' },
      },
      {
        path: 'assets/detail/:id',
        name: 'AssetDetail',
        component: () => import('@/modules/transaction/asset/detail.vue'),
        meta: { title: 'Detail Aset', privilege: 'assets:read' },
      },
      {
        path: 'stocks',
        name: 'TranStocks',
        component: () => import('@/modules/transaction/stock/index.vue'),
        meta: { title: 'Stock Monitor', privilege: 'stock:read' },
      },
      {
        path: 'stocks/detail/:id',
        name: 'StockDetail',
        component: () => import('@/modules/transaction/stock/detail.vue'),
        meta: { title: 'Detail & Mutasi Stok', privilege: 'stock:read' },
      },
      {
        path: 'stock-movements',
        name: 'StockMovementLog',
        component: () => import('@/modules/transaction/stock-movement/index.vue'),
        meta: { title: 'Log Pergerakan Stok', privilege: 'stock-movement-log:read' },
      },
      {
        path: 'asset-transfers',
        name: 'TranAssetTransfers',
        component: () => import('@/modules/transaction/asset-transfer/index.vue'),
        meta: { title: 'Asset Transfers', privilege: 'assets:read' },
      },
      {
        path: 'asset-transfers/detail/:id',
        name: 'TranAssetTransferDetail',
        component: () => import('@/modules/transaction/asset-transfer/detail.vue'),
        meta: { title: 'Detail Mutasi Aset', privilege: 'assets:read' },
      },
      {
        path: 'purchases',
        name: 'TranPurchases',
        component: () => import('@/modules/transaction/purchase/index.vue'),
        meta: { title: 'Daftar Pembelian', privilege: 'purchases:read' },
      },
      {
        path: 'purchases/detail/:id',
        name: 'TranPurchaseDetail',
        component: () => import('@/modules/transaction/purchase/detail.vue'),
        meta: { title: 'Detail Pembelian', privilege: 'purchases:read' },
      },
      {
        path: 'requests',
        name: 'TranRequests',
        component: () => import('@/modules/transaction/request/index.vue'),
        meta: { title: 'Daftar Permintaan Barang', privilege: 'requests:read' },
      },
      {
        path: 'requests/detail/:id',
        name: 'RequestDetail',
        component: () => import('@/modules/transaction/request/detail.vue'),
        meta: { title: 'Detail Permintaan Barang', privilege: 'requests:read' },
      },
      // Marketing Operasional — Transaksi
      {
        path: 'marketing-purchases',
        name: 'MarketingPurchaseList',
        component: () => import('@/modules/transaction/marketing-purchase/index.vue'),
        meta: { title: 'Purchase Marketing', privilege: 'marketing-purchases:read' },
      },
      {
        path: 'marketing-purchases/detail/:id',
        name: 'MarketingPurchaseDetail',
        component: () => import('@/modules/transaction/marketing-purchase/detail.vue'),
        meta: { title: 'Detail Purchase Marketing', privilege: 'marketing-purchases:read' },
      },
      {
        path: 'marketing-requests',
        name: 'MarketingRequestList',
        component: () => import('@/modules/transaction/marketing-request/index.vue'),
        meta: { title: 'Pengajuan Marketing', privilege: 'marketing-requests:read', requiresAuth: true },
      },
      {
        path: 'marketing-requests/detail/:id',
        name: 'MarketingRequestDetail',
        component: () => import('@/modules/transaction/marketing-request/detail.vue'),
        meta: { title: 'Detail Pengajuan Marketing', privilege: 'marketing-requests:read' },
      },
      {
        path: 'marketing-transfers',
        name: 'MarketingTransferList',
        component: () => import('@/modules/transaction/marketing-transfer/index.vue'),
        meta: { title: 'Transfer Marketing', privilege: 'marketing-transfers:read' },
      },
      {
        path: 'marketing-transfers/detail/:id',
        name: 'MarketingTransferDetail',
        component: () => import('@/modules/transaction/marketing-transfer/detail.vue'),
        meta: { title: 'Detail Transfer Marketing', privilege: 'marketing-transfers:read' },
      },
      {
        path: 'marketing-stocks',
        name: 'MarketingStockList',
        component: () => import('@/modules/transaction/marketing-stock/index.vue'),
        meta: { title: 'Stock Monitoring Marketing', privilege: 'marketing-stock:read' },
      },
      {
        path: 'marketing-stocks/detail/:id',
        name: 'MarketingStockDetail',
        component: () => import('@/modules/transaction/marketing-stock/detail.vue'),
        meta: { title: 'Detail Stok Marketing', privilege: 'marketing-stock:read' },
      },
      {
        path: 'marketing-stock-movements',
        name: 'MarketingStockMovementLog',
        component: () => import('@/modules/transaction/marketing-stock-movement/index.vue'),
        meta: { title: 'Log Pergerakan Stok', privilege: 'marketing-stock-movement-log:read' },
      },
      {
        path: 'marketing-assets',
        name: 'MarketingAssetList',
        component: () => import('@/modules/transaction/marketing-asset/index.vue'),
        meta: { title: 'Aset Marketing', privilege: 'marketing-assets:read' },
      },
      {
        path: 'marketing-assets/detail/:id',
        name: 'MarketingAssetDetail',
        component: () => import('@/modules/transaction/marketing-asset/detail.vue'),
        meta: { title: 'Detail Aset Marketing', privilege: 'marketing-assets:read' },
      },
      {
        path: 'purchase-cart',
        name: 'TranPurchaseCart',
        component: () => import('@/modules/transaction/purchase-cart/index.vue'),
        meta: { title: 'Keranjang Pembelian', privilege: 'purchase-cart:read' },
      },
      {
        path: 'maintenance',
        name: 'TranMaintenance',
        component: () => import('@/modules/transaction/maintenance/index.vue'),
        meta: { title: 'Maintenance', privilege: 'maintenance:read' },
      },
      {
        path: 'maintenance/detail/:id',
        name: 'MaintenanceDetail',
        component: () => import('@/modules/transaction/maintenance/detail.vue'),
        meta: { title: 'Detail Maintenance', privilege: 'maintenance:read' },
      },
      {
        path: 'schedules',
        name: 'TranSchedules',
        component: () => import('@/modules/transaction/schedule/index.vue'),
        meta: { title: 'Schedules', privilege: 'schedules:read' },
      },
      {
        path: 'vehicles',
        name: 'TranVehicles',
        component: () => import('@/modules/transaction/vehicle/index.vue'),
        meta: { title: 'Vehicles', privilege: 'vehicles:read' },
      },
      {
        path: 'licenses',
        name: 'TranLicenses',
        component: () => import('@/modules/transaction/license/index.vue'),
        meta: { title: 'Licenses', privilege: 'licenses:read' },
      },
      {
        path: 'reminders',
        name: 'TranReminders',
        component: () => import('@/modules/transaction/reminder/index.vue'),
        meta: { title: 'Reminders', privilege: 'reminders:read' },
      },
      {
        path: 'reminders/create',
        name: 'ReminderCreate',
        component: () => import('@/modules/transaction/reminder/form.vue'),
        meta: { title: 'Tambah Pengingat', privilege: 'reminders:read' },
      },
      {
        path: 'reminders/edit/:id',
        name: 'ReminderEdit',
        component: () => import('@/modules/transaction/reminder/form.vue'),
        meta: { title: 'Ubah Pengingat', privilege: 'reminders:read' },
      },
    ],
  },


  // Todo Routes
  {
    path: '/todo',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'my-tasks',
        name: 'TodoMyTasks',
        component: () => import('@/modules/todo/my-tasks.vue'),
        meta: { title: 'My Tasks' },
      },
      {
        path: 'boards',
        name: 'TodoBoards',
        component: () => import('@/modules/todo/boards.vue'),
        meta: { title: 'Boards' },
      },
      {
        path: 'boards/:id',
        name: 'TodoBoardDetail',
        component: () => import('@/modules/todo/board-detail.vue'),
        meta: { title: 'Board Detail' },
      },
      {
        path: 'boards/:id/gantt',
        name: 'TodoGanttChart',
        component: () => import('@/modules/todo/GanttChart.vue'),
        meta: { title: 'Gantt Chart' },
      },
      {
        path: 'team-tasks',
        name: 'TodoTeamTasks',
        component: () => import('@/modules/todo/team-tasks.vue'),
        meta: { title: 'Team Tasks' },
      },
    ],
  },

  // HR Routes
  {
    path: '/hr',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'broadcasts',
        name: 'HrBroadcasts',
        component: () => import('@/modules/hr/broadcast/index.vue'),
        meta: { title: 'WhatsApp Broadcast', privilege: 'hr:read' },
      },
      {
        path: 'broadcasts/create',
        name: 'HrBroadcastCreate',
        component: () => import('@/modules/hr/broadcast/form.vue'),
        meta: { title: 'Buat Broadcast', privilege: 'hr:read' },
      },
      {
        path: 'email-broadcasts',
        name: 'HrEmailBroadcast',
        component: () => import('@/modules/hr/email-broadcast/form.vue'),
        meta: { title: 'Email Broadcast', privilege: 'hr:read' },
      },
      {
        path: 'resignations',
        name: 'HrResignation',
        component: () => import('@/modules/hr/resignation/index.vue'),
        meta: { title: 'Daftar Resign', privilege: 'hr:read' },
      },
      {
        path: 'regulations',
        name: 'HrRegulation',
        component: () => import('@/modules/hr/regulation/index.vue'),
        meta: { title: 'Peraturan Perusahaan', privilege: 'hr:read' },
      },
      {
        path: 'violations',
        name: 'HrViolation',
        component: () => import('@/modules/hr/violation/index.vue'),
        meta: { title: 'Pelanggaran Karyawan', privilege: 'hr:read' },
      },
      {
        path: 'violations/create',
        name: 'HrViolationCreate',
        component: () => import('@/modules/hr/violation/form.vue'),
        meta: { title: 'Input Pelanggaran', privilege: 'hr:create' },
      },
      {
        path: 'violations/edit/:id',
        name: 'HrViolationEdit',
        component: () => import('@/modules/hr/violation/form.vue'),
        meta: { title: 'Edit Pelanggaran', privilege: 'hr:update' },
      },
      {
        path: 'stsp',
        name: 'HrStsp',
        component: () => import('@/modules/hr/stsp/index.vue'),
        meta: { title: 'Data ST/SP', privilege: 'hr:read' },
      },
      {
        path: 'stsp/create',
        name: 'HrStspCreate',
        component: () => import('@/modules/hr/stsp/form.vue'),
        meta: { title: 'Input ST/SP', privilege: 'hr:create' },
      },
      {
        path: 'stsp/edit/:id',
        name: 'HrStspEdit',
        component: () => import('@/modules/hr/stsp/form.vue'),
        meta: { title: 'Edit ST/SP', privilege: 'hr:update' },
      },

      // Attendance & Payroll (Karyawan Training)
      {
        path: 'attendance-locations',
        name: 'HrAttendanceLocations',
        component: () => import('@/modules/hr/attendance-location/index.vue'),
        meta: { title: 'Lokasi Absen', privilege: 'attendance-locations:read' },
      },
      {
        path: 'attendance-locations/create',
        name: 'HrAttendanceLocationCreate',
        component: () => import('@/modules/hr/attendance-location/form.vue'),
        meta: { title: 'Tambah Lokasi Absen', privilege: 'attendance-locations:create' },
      },
      {
        path: 'attendance-locations/edit/:id',
        name: 'HrAttendanceLocationEdit',
        component: () => import('@/modules/hr/attendance-location/form.vue'),
        meta: { title: 'Edit Lokasi Absen', privilege: 'attendance-locations:update' },
      },
      {
        path: 'training-employees',
        name: 'HrTrainingEmployees',
        component: () => import('@/modules/hr/training-employee/index.vue'),
        meta: { title: 'Karyawan Training', privilege: 'training-employees:read' },
      },
      {
        path: 'training-employees/create',
        name: 'HrTrainingEmployeeCreate',
        component: () => import('@/modules/hr/training-employee/form.vue'),
        meta: { title: 'Tambah Karyawan Training', privilege: 'training-employees:create' },
      },
      {
        path: 'training-employees/edit/:id',
        name: 'HrTrainingEmployeeEdit',
        component: () => import('@/modules/hr/training-employee/form.vue'),
        meta: { title: 'Edit Karyawan Training', privilege: 'training-employees:update' },
      },
      {
        path: 'training-employees/detail/:id',
        name: 'HrTrainingEmployeeDetail',
        component: () => import('@/modules/hr/training-employee/detail.vue'),
        meta: { title: 'Detail Karyawan Training', privilege: 'training-employees:read' },
      },
      {
        path: 'attendance/rekap',
        name: 'HrAttendanceRekap',
        component: () => import('@/modules/hr/attendance/rekap.vue'),
        meta: { title: 'Rekap Absensi', privilege: 'attendance:read' },
      },
      {
        path: 'attendance/rekap/:employeeId',
        name: 'HrAttendanceRekapDetail',
        component: () => import('@/modules/hr/attendance/rekap-detail.vue'),
        meta: { title: 'Detail Rekap Absensi', privilege: 'attendance:read' },
      },
      {
        path: 'attendance/harian',
        name: 'HrAttendanceHarian',
        component: () => import('@/modules/hr/attendance/harian.vue'),
        meta: { title: 'Absen Harian', privilege: 'attendance:read' },
      },
      {
        path: 'attendance/harian/:employeeId/:date',
        name: 'HrAttendanceHarianDetail',
        component: () => import('@/modules/hr/attendance/harian-detail.vue'),
        meta: { title: 'Detail Absen Harian', privilege: 'attendance:read' },
      },
      {
        path: 'attendance/harian/:employeeId/:date/edit',
        name: 'HrAttendanceHarianEdit',
        component: () => import('@/modules/hr/attendance/harian-edit.vue'),
        meta: { title: 'Edit Absen Harian', privilege: 'attendance:update' },
      },
      {
        path: 'overtime-approvals',
        name: 'HrOvertimeApprovals',
        component: () => import('@/modules/hr/overtime-approval/index.vue'),
        meta: { title: 'Persetujuan Lembur', privilege: 'overtime-approvals:read' },
      },
      {
        path: 'fine-types',
        name: 'HrFineTypes',
        component: () => import('@/modules/hr/fine-type/index.vue'),
        meta: { title: 'Master Denda', privilege: 'fine-types:read' },
      },
      {
        path: 'fine-types/create',
        name: 'HrFineTypeCreate',
        component: () => import('@/modules/hr/fine-type/form.vue'),
        meta: { title: 'Tambah Denda', privilege: 'fine-types:create' },
      },
      {
        path: 'fine-types/edit/:id',
        name: 'HrFineTypeEdit',
        component: () => import('@/modules/hr/fine-type/form.vue'),
        meta: { title: 'Edit Denda', privilege: 'fine-types:update' },
      },
      {
        path: 'employee-fines',
        name: 'HrEmployeeFines',
        component: () => import('@/modules/hr/employee-fine/index.vue'),
        meta: { title: 'Denda Karyawan', privilege: 'employee-fines:read' },
      },
      {
        path: 'employee-fines/create',
        name: 'HrEmployeeFineCreate',
        component: () => import('@/modules/hr/employee-fine/form.vue'),
        meta: { title: 'Input Denda Karyawan', privilege: 'employee-fines:create' },
      },
      {
        path: 'employee-fines/edit/:id',
        name: 'HrEmployeeFineEdit',
        component: () => import('@/modules/hr/employee-fine/form.vue'),
        meta: { title: 'Edit Denda Karyawan', privilege: 'employee-fines:update' },
      },
      {
        path: 'payroll',
        name: 'HrPayroll',
        component: () => import('@/modules/hr/payroll/index.vue'),
        meta: { title: 'Payroll', privilege: 'payroll:read' },
      },
      {
        path: 'payroll/create',
        name: 'HrPayrollCreate',
        component: () => import('@/modules/hr/payroll/create.vue'),
        meta: { title: 'Payroll Run Baru', privilege: 'payroll:create' },
      },
      {
        path: 'payroll/:id',
        name: 'HrPayrollShow',
        component: () => import('@/modules/hr/payroll/show.vue'),
        meta: { title: 'Detail Payroll', privilege: 'payroll:read' },
      },
      {
        path: 'email-batches',
        name: 'HrEmailBatches',
        component: () => import('@/modules/hr/email-batch/index.vue'),
        meta: { title: 'Kirim Email Slip', privilege: 'email-batches:read' },
      },
      {
        path: 'email-batches/create',
        name: 'HrEmailBatchCreate',
        component: () => import('@/modules/hr/email-batch/create.vue'),
        meta: { title: 'Buat Broadcast Email', privilege: 'email-batches:create' },
      },
      {
        path: 'email-batches/:id',
        name: 'HrEmailBatchShow',
        component: () => import('@/modules/hr/email-batch/show.vue'),
        meta: { title: 'Detail Batch Email', privilege: 'email-batches:read' },
      },
      {
        path: 'attendance-settings',
        name: 'HrAttendanceSettings',
        component: () => import('@/modules/hr/attendance-setting/edit.vue'),
        meta: { title: 'Pengaturan Absensi', privilege: 'attendance-settings:read' },
      },
      {
        path: 'attendance-holidays',
        name: 'HrAttendanceHolidays',
        component: () => import('@/modules/hr/attendance-holiday/index.vue'),
        meta: { title: 'Kalender Hari Libur', privilege: 'attendance-holidays:read' },
      },
      {
        path: 'attendance-holidays/create',
        name: 'HrAttendanceHolidayCreate',
        component: () => import('@/modules/hr/attendance-holiday/form.vue'),
        meta: { title: 'Tambah Hari Libur', privilege: 'attendance-holidays:create' },
      },
      {
        path: 'attendance-holidays/edit/:id',
        name: 'HrAttendanceHolidayEdit',
        component: () => import('@/modules/hr/attendance-holiday/form.vue'),
        meta: { title: 'Edit Hari Libur', privilege: 'attendance-holidays:update' },
      },
    ],
  },

  // Setting Routes
  {
    path: '/setting',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/modules/setting/user/index.vue'),
        meta: { title: 'User Management', privilege: 'rbac:read' },
      },
      {
        path: 'users/create',
        name: 'UserCreate',
        component: () => import('@/modules/setting/user/form.vue'),
        meta: { title: 'Create User', privilege: 'rbac:read' },
      },
      {
        path: 'users/edit/:id',
        name: 'UserEdit',
        component: () => import('@/modules/setting/user/form.vue'),
        meta: { title: 'Edit User', privilege: 'rbac:read' },
      },
      {
        path: 'permissions',
        name: 'PermissionsList',
        component: () => import('@/modules/setting/permissions/index.vue'),
        meta: { title: 'Permissions', privilege: 'permissions:read' },
      },
      {
        path: 'permissions/create',
        name: 'PermissionsCreate',
        component: () => import('@/modules/setting/permissions/form.vue'),
        meta: { title: 'Create Permission', privilege: 'permissions:read' },
      },
      {
        path: 'permissions/edit/:id',
        name: 'PermissionsEdit',
        component: () => import('@/modules/setting/permissions/form.vue'),
        meta: { title: 'Edit Permission', privilege: 'permissions:read' },
      },
      {
        path: 'store-contacts/template',
        name: 'StoreContactTemplate',
        component: () => import('@/modules/setting/contact-group/index.vue'),
        meta: { title: 'Master Template Kontak', privilege: 'store-contacts:update' },
      },
      {
        path: 'manage-contact',
        name: 'ManageContact',
        component: () => import('@/modules/setting/manage-contact/index.vue'),
        meta: { title: 'Kelola Kontak', privilege: 'manage-contact:read' },
      },
      {
        path: 'manage-contact/edit/:store_id',
        name: 'ManageContactEdit',
        component: () => import('@/modules/setting/manage-contact/form.vue'),
        meta: { title: 'Edit Kontak Toko', privilege: 'manage-contact:read' },
      },
    ],
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/modules/setting/user/profile.vue'),
    meta: { title: 'Profile', requiresAuth: true },
  },


  // Contact Routes
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/Contact/index.vue'),
  },

  // Error Routes
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/Errors/FourZeroFour.vue'),
  },
]

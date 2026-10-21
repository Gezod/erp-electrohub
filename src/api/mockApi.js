/**
 * Mock API Service & Axios Adapter
 * Mencegat seluruh HTTP request ke backend Express dan menyajikan data dari mock & LocalStorage.
 */

import { storage } from '@/mocks/storage';
import { mockUser, mockAuthResponse } from '@/mocks/authMocks';
import { mockGaDashboard, mockMarketingDashboard, mockPicSubmissions } from '@/mocks/dashboardMocks';
import {
  mockGoods,
  mockCategories,
  mockLocations,
  mockPositions,
  mockUom,
  mockAssetTypes,
  mockDivisions,
  mockEmployees,
  mockChiefs,
  mockUsers,
  mockMarketingGoods,
  mockScCategories,
  mockScSkus
} from '@/mocks/masterMocks';
import {
  mockBoards,
  mockTasks,
  mockMilestones,
  mockReminders
} from '@/mocks/todoMocks';
import {
  mockStocks,
  mockStockMovements,
  mockRequests,
  mockPurchases,
  mockMaintenances,
  mockVehicles,
  mockAssets,
  mockTransfers,
  mockLicenses,
  mockSchedules
} from '@/mocks/transactionMocks';
import {
  mockAttendanceHolidays,
  mockAttendanceLocations,
  mockAttendanceSettings,
  mockRegulations,
  mockFineTypes,
  mockEmployeeFines,
  mockOvertimeApprovals,
  mockPayrollRuns,
  mockResignations,
  mockViolations,
  mockTrainingEmployees,
  mockBroadcasts
} from '@/mocks/hrMocks';
import {
  mockPermissions,
  mockContactGroups,
  mockManageContacts,
  mockStoreContacts
} from '@/mocks/settingMocks';

// Artificial delay untuk mensimulasikan latency network riil
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Normalisasi URL Axios untuk pencocokan endpoint
 */
function normalizeUrl(rawUrl = '') {
  let url = rawUrl
    .replace(/^https?:\/\/[^/]+/i, '') // Hapus host & protocol jika ada
    .replace(/^\/?api\/?/, '/')         // Hapus prefix /api jika ada
    .replace(/^\/?/, '/');              // Pastikan diawali dengan slash

  return url.split('?')[0].replace(/\/+$/, '') || '/';
}

/**
 * Parse data payload dari Axios config
 */
function parsePayload(data) {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (_) {
      return { raw: data };
    }
  }
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const obj = {};
    data.forEach((val, key) => {
      obj[key] = val;
    });
    return obj;
  }
  return data;
}

/**
 * Handle routing dan logika mock
 */
async function routeMockRequest(config) {
  const method = (config.method || 'get').toLowerCase();
  const path = normalizeUrl(config.url);
  const params = config.params || {};
  const payload = parsePayload(config.data);

  // ── 1. AUTHENTICATION ────────────────────────────────────────────────────────
  if (path === '/auth/login' || path === '/auth/refresh') {
    return {
      ...mockAuthResponse,
      user: {
        ...mockUser,
        ...(payload.email ? { email: payload.email } : {})
      }
    };
  }
  if (path === '/auth/logout') {
    return { success: true, message: 'Logout berhasil' };
  }

  // ── 2. DASHBOARD ─────────────────────────────────────────────────────────────
  if (path === '/ga/dashboard') {
    return { success: true, data: mockGaDashboard };
  }
  if (path === '/marketing/dashboard') {
    return { success: true, data: mockMarketingDashboard };
  }
  if (path === '/marketing/dashboard/pic-submissions') {
    return { success: true, data: mockPicSubmissions };
  }

  // ── 3. TODO & GANTT ──────────────────────────────────────────────────────────
  if (path === '/todo/boards') {
    if (method === 'post') return storage.create('todo_boards', mockBoards, payload);
    return storage.getAll('todo_boards', mockBoards, params);
  }
  if (path.startsWith('/todo/boards/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('todo_boards', mockBoards, id, payload);
    if (method === 'delete') return storage.delete('todo_boards', mockBoards, id);
    const item = storage.getById('todo_boards', mockBoards, id);
    return { data: item };
  }

  if (path === '/todo/tasks') {
    if (method === 'post') return storage.create('todo_tasks', mockTasks, payload);
    return storage.getAll('todo_tasks', mockTasks, params);
  }
  if (path === '/todo/tasks/assignable') {
    return { data: storage.get('employees', mockEmployees) };
  }
  if (path === '/todo/reminders') {
    return { data: storage.get('todo_reminders', mockReminders) };
  }
  if (path.startsWith('/todo/reminders/') && path.endsWith('/dismiss')) {
    const id = path.split('/')[3];
    return storage.update('todo_reminders', mockReminders, id, { is_dismissed: true });
  }
  if (path.startsWith('/todo/tasks/')) {
    const segments = path.split('/');
    const id = segments[3];
    const action = segments[4];

    if (action === 'comments' && method === 'post') {
      const task = storage.getById('todo_tasks', mockTasks, id) || {};
      const comments = task.comments || [];
      const newComment = {
        id: `com_${Date.now()}`,
        author: mockUser.full_name,
        message: payload.message || payload.comment || '',
        created_at: new Date().toISOString()
      };
      comments.push(newComment);
      storage.update('todo_tasks', mockTasks, id, { comments });
      return { data: newComment };
    }
    if (action === 'assign' && method === 'post') {
      const task = storage.update('todo_tasks', mockTasks, id, {
        assignee_ids: payload.employee_ids || []
      });
      return { data: task };
    }
    if (method === 'put') return storage.update('todo_tasks', mockTasks, id, payload);
    if (method === 'delete') return storage.delete('todo_tasks', mockTasks, id);
    return { data: storage.getById('todo_tasks', mockTasks, id) };
  }

  if (path.startsWith('/gantt/board/')) {
    const boardId = path.split('/')[3];
    if (path.endsWith('/milestones')) {
      if (method === 'post') return storage.create('milestones', mockMilestones, { ...payload, board_id: boardId });
      return { data: storage.get('milestones', mockMilestones).filter(m => m.board_id === boardId) };
    }
    const allTasks = storage.get('todo_tasks', mockTasks).filter(t => t.board_id === boardId);
    const allMilestones = storage.get('milestones', mockMilestones).filter(m => m.board_id === boardId);
    return {
      data: {
        board: storage.getById('todo_boards', mockBoards, boardId) || mockBoards[0],
        tasks: allTasks,
        milestones: allMilestones
      }
    };
  }
  if (path.startsWith('/gantt/task/')) {
    const taskId = path.split('/')[3];
    if (path.endsWith('/dates')) {
      return storage.update('todo_tasks', mockTasks, taskId, {
        start_date: payload.start_date,
        end_date: payload.end_date
      });
    }
    if (path.endsWith('/progress')) {
      return storage.update('todo_tasks', mockTasks, taskId, { progress: payload.progress });
    }
  }

  // ── 4. MASTER DATA ───────────────────────────────────────────────────────────
  // Goods (Barang)
  if (path === '/goods') {
    if (method === 'post') return storage.create('goods', mockGoods, payload);
    return storage.getAll('goods', mockGoods, params);
  }
  if (path.startsWith('/goods/import/')) {
    return { success: true, message: 'Operasi import barang demo berhasil', total: 10, valid: true };
  }
  if (path.startsWith('/goods/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('goods', mockGoods, id, payload);
    if (method === 'delete') return storage.delete('goods', mockGoods, id);
    return { data: storage.getById('goods', mockGoods, id) };
  }

  // Categories
  if (path === '/categories') {
    if (method === 'post') return storage.create('categories', mockCategories, payload);
    return storage.getAll('categories', mockCategories, params);
  }
  if (path.startsWith('/categories/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('categories', mockCategories, id, payload);
    if (method === 'delete') return storage.delete('categories', mockCategories, id);
    return { data: storage.getById('categories', mockCategories, id) };
  }

  // Locations
  if (path === '/locations') {
    if (method === 'post') return storage.create('locations', mockLocations, payload);
    return storage.getAll('locations', mockLocations, params);
  }
  if (path.startsWith('/locations/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('locations', mockLocations, id, payload);
    if (method === 'delete') return storage.delete('locations', mockLocations, id);
    return { data: storage.getById('locations', mockLocations, id) };
  }

  // Positions
  if (path === '/positions') {
    if (method === 'post') return storage.create('positions', mockPositions, payload);
    return storage.getAll('positions', mockPositions, params);
  }
  if (path.startsWith('/positions/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('positions', mockPositions, id, payload);
    if (method === 'delete') return storage.delete('positions', mockPositions, id);
    return { data: storage.getById('positions', mockPositions, id) };
  }

  // UOM
  if (path === '/uom') {
    if (method === 'post') return storage.create('uom', mockUom, payload);
    return storage.getAll('uom', mockUom, params);
  }
  if (path.startsWith('/uom/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('uom', mockUom, id, payload);
    if (method === 'delete') return storage.delete('uom', mockUom, id);
    return { data: storage.getById('uom', mockUom, id) };
  }

  // Asset Types
  if (path === '/asset-types') {
    if (method === 'post') return storage.create('asset_types', mockAssetTypes, payload);
    return storage.getAll('asset_types', mockAssetTypes, params);
  }
  if (path.startsWith('/asset-types/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('asset_types', mockAssetTypes, id, payload);
    if (method === 'delete') return storage.delete('asset_types', mockAssetTypes, id);
    return { data: storage.getById('asset_types', mockAssetTypes, id) };
  }

  // Divisions
  if (path === '/divisions') {
    if (method === 'post') return storage.create('divisions', mockDivisions, payload);
    return storage.getAll('divisions', mockDivisions, params);
  }
  if (path.startsWith('/divisions/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('divisions', mockDivisions, id, payload);
    if (method === 'delete') return storage.delete('divisions', mockDivisions, id);
    return { data: storage.getById('divisions', mockDivisions, id) };
  }

  // Employees & Organization
  if (path === '/employees' || path === '/organization/employees') {
    if (method === 'post') return storage.create('employees', mockEmployees, payload);
    return storage.getAll('employees', mockEmployees, params);
  }
  if (path.startsWith('/employees/') || path.startsWith('/organization/employees/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('employees', mockEmployees, id, payload);
    if (method === 'delete') return storage.delete('employees', mockEmployees, id);
    return { data: storage.getById('employees', mockEmployees, id) };
  }

  // Chiefs
  if (path === '/chiefs') {
    if (method === 'post') return storage.create('chiefs', mockChiefs, payload);
    return storage.getAll('chiefs', mockChiefs, params);
  }
  if (path.startsWith('/chiefs/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('chiefs', mockChiefs, id, payload);
    if (method === 'delete') return storage.delete('chiefs', mockChiefs, id);
    return { data: storage.getById('chiefs', mockChiefs, id) };
  }

  // Users Management
  if (path === '/users') {
    if (method === 'post') return storage.create('users', mockUsers, payload);
    return storage.getAll('users', mockUsers, params);
  }
  if (path.startsWith('/users/')) {
    const id = path.split('/')[2];
    if (path.includes('/permissions')) {
      return { success: true, message: 'Hak akses user diperbarui' };
    }
    if (path.includes('/histories')) {
      return { data: [] };
    }
    if (method === 'put' || method === 'patch') return storage.update('users', mockUsers, id, payload);
    if (method === 'delete') return storage.delete('users', mockUsers, id);
    return { data: storage.getById('users', mockUsers, id) };
  }

  // Marketing Goods & SC Modules
  if (path === '/marketing/goods') {
    if (method === 'post') return storage.create('marketing_goods', mockMarketingGoods, payload);
    return storage.getAll('marketing_goods', mockMarketingGoods, params);
  }
  if (path.startsWith('/marketing/goods/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('marketing_goods', mockMarketingGoods, id, payload);
    if (method === 'delete') return storage.delete('marketing_goods', mockMarketingGoods, id);
    return { data: storage.getById('marketing_goods', mockMarketingGoods, id) };
  }

  if (path === '/sc/categories') {
    return storage.getAll('sc_categories', mockScCategories, params);
  }
  if (path === '/sc/skus') {
    return storage.getAll('sc_skus', mockScSkus, params);
  }
  if (path === '/marketing/admin-pusat-roster' || path === '/marketing/store-assignments') {
    return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  }

  // ── 5. TRANSAKSI (GA & MARKETING) ────────────────────────────────────────────
  // Stocks
  if (path === '/ga/stocks' || path === '/marketing/stocks' || path === '/stocks') {
    if (method === 'post') return storage.create('stocks', mockStocks, payload);
    return storage.getAll('stocks', mockStocks, params);
  }
  if (path.includes('/stocks/low-stock')) {
    const all = storage.get('stocks', mockStocks);
    return { data: all.filter(s => s.quantity <= s.min_stock || s.status !== 'aman') };
  }
  if (path.includes('/stocks/summary')) {
    const all = storage.get('stocks', mockStocks);
    return {
      data: {
        total_items: all.length,
        total_stock: all.reduce((a, b) => a + (b.quantity || 0), 0),
        low_stock: all.filter(s => s.quantity <= s.min_stock).length
      }
    };
  }
  if (path.includes('/stocks/import/') || path.includes('/stocks/snapshot')) {
    return { success: true, message: 'Operasi stok demo berhasil', valid: true };
  }
  if (path.includes('/stock-movement-log') || path.includes('/movements/all')) {
    return storage.getAll('stock_movements', mockStockMovements, params);
  }
  if (path.startsWith('/ga/stocks/') || path.startsWith('/marketing/stocks/')) {
    const id = path.split('/')[3];
    if (path.endsWith('/movements')) {
      if (method === 'post') return storage.create('stock_movements', mockStockMovements, payload);
      return { data: storage.get('stock_movements', mockStockMovements) };
    }
    if (method === 'put') return storage.update('stocks', mockStocks, id, payload);
    if (method === 'delete') return storage.delete('stocks', mockStocks, id);
    return { data: storage.getById('stocks', mockStocks, id) };
  }

  // Requests (Pengajuan Barang)
  if (path === '/ga/requests' || path === '/marketing/requests' || path === '/requests') {
    if (method === 'post') return storage.create('requests', mockRequests, payload);
    return storage.getAll('requests', mockRequests, params);
  }
  if (path.startsWith('/ga/requests/') || path.startsWith('/marketing/requests/')) {
    const segments = path.split('/');
    const id = segments[3];
    const subAction = segments[4];

    if (subAction === 'stock-check') {
      return { success: true, is_available: true, message: 'Stok tersedia di gudang logistik' };
    }
    if (subAction === 'status' || subAction === 'items') {
      return storage.update('requests', mockRequests, id, payload);
    }
    if (subAction === 'purchase' && method === 'post') {
      return { success: true, message: 'Purchase Order dari pengajuan berhasil digenerate' };
    }
    if (method === 'put' || method === 'patch') return storage.update('requests', mockRequests, id, payload);
    if (method === 'delete') return storage.delete('requests', mockRequests, id);
    return { data: storage.getById('requests', mockRequests, id) };
  }

  // Purchases (Pengadaan)
  if (path === '/ga/purchases' || path === '/marketing/purchases' || path === '/purchases') {
    if (method === 'post') return storage.create('purchases', mockPurchases, payload);
    return storage.getAll('purchases', mockPurchases, params);
  }
  if (path.startsWith('/ga/purchases/') || path.startsWith('/marketing/purchases/')) {
    const segments = path.split('/');
    const id = segments[3];
    if (method === 'put' || method === 'patch') return storage.update('purchases', mockPurchases, id, payload);
    if (method === 'delete') return storage.delete('purchases', mockPurchases, id);
    return { data: storage.getById('purchases', mockPurchases, id) };
  }

  // Maintenances (Perawatan)
  if (path === '/maintenance') {
    if (method === 'post') return storage.create('maintenances', mockMaintenances, payload);
    return storage.getAll('maintenances', mockMaintenances, params);
  }
  if (path.startsWith('/maintenance/')) {
    const id = path.split('/')[2];
    if (path.includes('/progress')) {
      return { success: true, message: 'Progress maintenance dicatat' };
    }
    if (method === 'put') return storage.update('maintenances', mockMaintenances, id, payload);
    if (method === 'delete') return storage.delete('maintenances', mockMaintenances, id);
    return { data: storage.getById('maintenances', mockMaintenances, id) };
  }

  // Vehicles (Kendaraan)
  if (path === '/vehicles') {
    if (method === 'post') return storage.create('vehicles', mockVehicles, payload);
    return storage.getAll('vehicles', mockVehicles, params);
  }
  if (path.startsWith('/vehicles/')) {
    const id = path.split('/')[2];
    if (method === 'put') return storage.update('vehicles', mockVehicles, id, payload);
    if (method === 'delete') return storage.delete('vehicles', mockVehicles, id);
    return { data: storage.getById('vehicles', mockVehicles, id) };
  }

  // Assets (Aset Tetap)
  if (path === '/ga/assets' || path === '/marketing/assets' || path === '/assets') {
    if (method === 'post') return storage.create('assets', mockAssets, payload);
    return storage.getAll('assets', mockAssets, params);
  }
  if (path.startsWith('/ga/assets/') || path.startsWith('/marketing/assets/')) {
    const id = path.split('/')[3];
    if (method === 'put' || method === 'patch') return storage.update('assets', mockAssets, id, payload);
    if (method === 'delete') return storage.delete('assets', mockAssets, id);
    return { data: storage.getById('assets', mockAssets, id) };
  }

  // Transfers (Mutasi Aset / Stok)
  if (path === '/ga/transfers' || path === '/marketing/transfers' || path === '/transfers') {
    if (method === 'post') return storage.create('transfers', mockTransfers, payload);
    return storage.getAll('transfers', mockTransfers, params);
  }
  if (path.startsWith('/ga/transfers/') || path.startsWith('/marketing/transfers/')) {
    const id = path.split('/')[3];
    if (method === 'put' || method === 'patch') return storage.update('transfers', mockTransfers, id, payload);
    if (method === 'delete') return storage.delete('transfers', mockTransfers, id);
    return { data: storage.getById('transfers', mockTransfers, id) };
  }

  // Licenses, Schedules, Reminders
  if (path === '/licenses') {
    if (method === 'post') return storage.create('licenses', mockLicenses, payload);
    return storage.getAll('licenses', mockLicenses, params);
  }
  if (path.startsWith('/licenses/')) {
    const id = path.split('/')[2];
    if (method === 'put') return storage.update('licenses', mockLicenses, id, payload);
    if (method === 'delete') return storage.delete('licenses', mockLicenses, id);
    return { data: storage.getById('licenses', mockLicenses, id) };
  }

  if (path === '/schedules') {
    if (method === 'post') return storage.create('schedules', mockSchedules, payload);
    return storage.getAll('schedules', mockSchedules, params);
  }
  if (path.startsWith('/schedules/')) {
    const id = path.split('/')[2];
    if (method === 'put') return storage.update('schedules', mockSchedules, id, payload);
    if (method === 'delete') return storage.delete('schedules', mockSchedules, id);
    return { data: storage.getById('schedules', mockSchedules, id) };
  }

  // ── 6. HR MODULE ─────────────────────────────────────────────────────────────
  if (path === '/hr/attendance-holidays') {
    if (method === 'post') return storage.create('attendance_holidays', mockAttendanceHolidays, payload);
    return storage.getAll('attendance_holidays', mockAttendanceHolidays, params);
  }
  if (path.startsWith('/hr/attendance-holidays/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('attendance_holidays', mockAttendanceHolidays, id, payload);
    if (method === 'delete') return storage.delete('attendance_holidays', mockAttendanceHolidays, id);
    return { data: storage.getById('attendance_holidays', mockAttendanceHolidays, id) };
  }

  if (path === '/hr/attendance-locations') {
    if (method === 'post') return storage.create('attendance_locations', mockAttendanceLocations, payload);
    return storage.getAll('attendance_locations', mockAttendanceLocations, params);
  }
  if (path.startsWith('/hr/attendance-locations/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('attendance_locations', mockAttendanceLocations, id, payload);
    if (method === 'delete') return storage.delete('attendance_locations', mockAttendanceLocations, id);
    return { data: storage.getById('attendance_locations', mockAttendanceLocations, id) };
  }

  if (path === '/hr/attendance-settings' || path === '/hr/attendance-setting') {
    if (method === 'put' || method === 'post') {
      storage.set('attendance_settings', payload);
      return { success: true, data: payload };
    }
    return { data: storage.get('attendance_settings', mockAttendanceSettings) };
  }

  if (path === '/hr/regulations') {
    if (method === 'post') return storage.create('regulations', mockRegulations, payload);
    return storage.getAll('regulations', mockRegulations, params);
  }
  if (path.startsWith('/hr/regulations/')) {
    const id = path.split('/').pop();
    if (method === 'put' || method === 'patch') return storage.update('regulations', mockRegulations, id, payload);
    if (method === 'delete') return storage.delete('regulations', mockRegulations, id);
    return { data: storage.getById('regulations', mockRegulations, id) };
  }

  if (path === '/hr/fine-types') {
    if (method === 'post') return storage.create('fine_types', mockFineTypes, payload);
    return storage.getAll('fine_types', mockFineTypes, params);
  }
  if (path === '/hr/fine-types/active') {
    return { data: storage.get('fine_types', mockFineTypes).filter(f => f.is_active) };
  }

  if (path === '/hr/employee-fines') {
    if (method === 'post') return storage.create('employee_fines', mockEmployeeFines, payload);
    return storage.getAll('employee_fines', mockEmployeeFines, params);
  }

  if (path === '/hr/overtime-approvals') {
    return storage.getAll('overtime_approvals', mockOvertimeApprovals, params);
  }
  if (path.includes('/overtime-approvals/') && path.endsWith('/approve')) {
    const id = path.split('/')[3];
    return storage.update('overtime_approvals', mockOvertimeApprovals, id, { status: 'Disetujui' });
  }

  if (path === '/hr/payroll-runs') {
    if (method === 'post') return storage.create('payroll_runs', mockPayrollRuns, payload);
    return storage.getAll('payroll_runs', mockPayrollRuns, params);
  }
  if (path.startsWith('/hr/payroll-runs/')) {
    const id = path.split('/')[3];
    return { data: storage.getById('payroll_runs', mockPayrollRuns, id) || mockPayrollRuns[0] };
  }

  if (path === '/hr/resignations') {
    if (method === 'post') return storage.create('resignations', mockResignations, payload);
    return storage.getAll('resignations', mockResignations, params);
  }

  if (path === '/hr/violations') {
    if (method === 'post') return storage.create('violations', mockViolations, payload);
    return storage.getAll('violations', mockViolations, params);
  }

  if (path === '/hr/training-employees') {
    if (method === 'post') return storage.create('training_employees', mockTrainingEmployees, payload);
    return storage.getAll('training_employees', mockTrainingEmployees, params);
  }

  if (path === '/hr/broadcasts') {
    if (method === 'post') return storage.create('broadcasts', mockBroadcasts, payload);
    return storage.getAll('broadcasts', mockBroadcasts, params);
  }

  if (path.startsWith('/hr/public/')) {
    return { success: true, message: 'Absensi / data publik training berhasil dicatat (Demo)', data: {} };
  }

  // ── 7. SETTINGS & PUBLIC CONTACTS ────────────────────────────────────────────
  if (path === '/permissions') {
    return storage.getAll('permissions', mockPermissions, params);
  }
  if (path === '/opa/contact-groups') {
    if (method === 'post') return storage.create('contact_groups', mockContactGroups, payload);
    return storage.getAll('contact_groups', mockContactGroups, params);
  }
  if (path === '/manage-contacts') {
    if (method === 'post') return storage.create('manage_contacts', mockManageContacts, payload);
    return storage.getAll('manage_contacts', mockManageContacts, params);
  }
  if (path.startsWith('/manage-contacts/')) {
    const id = path.split('/').pop();
    if (method === 'put') return storage.update('manage_contacts', mockManageContacts, id, payload);
    if (method === 'delete') return storage.delete('manage_contacts', mockManageContacts, id);
    return { data: storage.getById('manage_contacts', mockManageContacts, id) };
  }
  if (path === '/public/store-contacts') {
    return { success: true, data: storage.get('store_contacts', mockStoreContacts) };
  }

  // ── 8. EXPORT DOWNLOAD FALLBACK ──────────────────────────────────────────────
  if (path.endsWith('/export') || path.endsWith('/template') || config.responseType === 'blob') {
    const dummyBlob = typeof Blob !== 'undefined'
      ? new Blob(['No,Kode,Nama,Tanggal,Status\n1,DEMO-001,Demo Item,2026-04-01,Aktif\n'], { type: 'text/csv' })
      : 'dummy-export-data';
    return dummyBlob;
  }

  // ── 9. SILENT CATCH-ALL FALLBACK ─────────────────────────────────────────────
  // Menjamin tidak ada request yang gagal dengan error merah jika rute belum terdaftar
  console.info(`[MockApi] Fallback matched for: ${method.toUpperCase()} ${path}`);
  return {
    success: true,
    data: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    message: 'Operation simulated successfully (Frontend-Only Demo)'
  };
}

/**
 * Custom Axios Adapter yang mencegat seluruh request
 */
export async function mockAxiosAdapter(config) {
  // Simulasi latency jaringan realistis
  await delay(350 + Math.random() * 150);

  try {
    const responseData = await routeMockRequest(config);

    return {
      data: responseData,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: {}
    };
  } catch (error) {
    console.warn('[MockApi] Mock Handler Warning:', error);
    return {
      data: { success: true, data: [] },
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: {}
    };
  }
}

/**
 * Pasang Mock Adapter pada instance Axios
 */
export function setupMockApi(axiosInstance) {
  if (axiosInstance) {
    axiosInstance.defaults.adapter = mockAxiosAdapter;
  }
}

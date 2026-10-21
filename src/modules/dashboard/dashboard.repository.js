const prisma = require("../../../../config/db");

// ── Purchase Marketing — terkonfirmasi dari schema (08_marketing.prisma) ──
const groupPurchasesByStatus = (where) => prisma.t_PurchaseMarketing.groupBy({ by: ["status"], _count: { id: true }, where });
const aggregatePurchaseTotal = async (where) => {
  console.log("[DEBUG aggregatePurchaseTotal] WHERE:", JSON.stringify(where));
  const result = await prisma.t_PurchaseMarketing.aggregate({ _sum: { price_final_total: true }, where });
  console.log("[DEBUG aggregatePurchaseTotal] RESULT:", JSON.stringify(result));
  return result;
};
const findRecentPurchases = (where, take) => prisma.t_PurchaseMarketing.findMany({
  where, orderBy: { created_at: "desc" }, take,
  include: { pic: { select: { full_name: true } }, location: { select: { location_name: true } } },
});

// Leaderboard PIC berdasarkan total nilai pembelian FINAL (setelah diskon/biaya tambahan)
const groupPurchasesByPic = (where, take) => prisma.t_PurchaseMarketing.groupBy({
  by: ["pic_marketing"],
  where,
  _sum: { price_final_total: true },
  _count: { id: true },
  orderBy: { _sum: { price_final_total: "desc" } },
  take,
});

// Kartu baru: kuantitas pengajuan per PIC dalam rentang tanggal (pakai date_purchase)
const groupPurchasesByPicCount = (where, take) => prisma.t_PurchaseMarketing.groupBy({
  by: ["pic_marketing"],
  where,
  _count: { id: true },
  orderBy: { _count: { id: "desc" } },
  take,
});

const findEmployeesByIds = (ids) => prisma.employee.findMany({
  where: { id: { in: ids } },
  select: { id: true, full_name: true },
});

// Division match untuk Marketing — analog isGaDivision() tapi keyword "marketing"
const listMarketingStaff = () => prisma.employee.findMany({
  where: {
    status: "active",
    division: { name: { contains: "marketing", mode: "insensitive" } },
  },
  select: { id: true, full_name: true },
  orderBy: { full_name: "asc" },
});

// ── Request Marketing — terkonfirmasi dari data (t_requests_marketing) ──
// PIC = requester_employee_id (siapa yang mengajukan), bukan processor_employee_id
// (siapa yang memproses) — konsisten dengan makna "pengajuan oleh PIC" di kartu lain.
const groupRequestsByStatus = (where) => prisma.t_RequestMarketing.groupBy({ by: ["status"], _count: { id: true }, where });
const countRequests = (where) => prisma.t_RequestMarketing.count({ where });
const findRecentRequests = (where, take) => prisma.t_RequestMarketing.findMany({
  where, orderBy: { created_at: "desc" }, take,
  include: {
    requester_employee: { select: { full_name: true } },
    requester_location: { select: { location_name: true } },
  },
});

// ── Transfer Marketing — terkonfirmasi dari data (t_transfers_marketing) ──
// PIC ada DUA kolom (from_pic_id & to_pic_id) — dicocokkan pakai OR lewat buildPicFilter([...]).
const groupTransfersByStatus = (where) => prisma.t_TransferMarketing.groupBy({ by: ["status"], _count: { id: true }, where });
const findRecentTransfers = (where, take) => prisma.t_TransferMarketing.findMany({
  where, orderBy: { created_at: "desc" }, take,
  include: {
    from_location: { select: { location_name: true } },
    to_location: { select: { location_name: true } },
  },
});

// Stok Menipis dihapus dari dashboard Marketing (fitur belum siap — aturan ambang
// batas stok minimum untuk Marketing belum dikonfirmasi).

module.exports = {
  groupPurchasesByStatus, aggregatePurchaseTotal, findRecentPurchases,
  groupPurchasesByPic, groupPurchasesByPicCount, findEmployeesByIds, listMarketingStaff,
  groupRequestsByStatus, countRequests, findRecentRequests,
  groupTransfersByStatus, findRecentTransfers,
};

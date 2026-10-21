import { ref } from 'vue';
import { MarketingRequestService } from '../marketingRequest.service';

const STATUS_LIST = ['draft', 'diajukan', 'diproses', 'menunggu_pemenuhan', 'selesai', 'ditolak', 'batal'];

// Backend mengembalikan total lewat res.meta.total (lihat store: fetchRequests),
// tapi beberapa endpoint lama pakai res.pagination.totalData — jaga-jaga dua-duanya.
const extractTotal = (res) => res?.meta?.total ?? res?.pagination?.totalData ?? 0;

// PENTING: jangan pakai d.toISOString() -> itu konversi ke UTC dulu, bisa geser
// tanggal untuk zona waktu WIB/WITA/WIT di jam-jam tertentu. Ambil tanggal LOKAL murni.
const toISODate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayRange = () => {
  const today = new Date();
  const iso = toISODate(today);
  return { date_from: iso, date_to: iso };
};

const getThisMonthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return { date_from: toISODate(first), date_to: toISODate(now) };
};

export function useMarketingRequestSummary() {
  const summaryStats = ref({
    todayCount: 0,
    thisMonthCount: 0,
    statusBreakdown: [],
  });

  const isLoadingSummary = ref(false);

  const fetchSummaryStats = async () => {
    isLoadingSummary.value = true;
    try {
      // limit: 1 -> kita cuma butuh angka total dari meta, bukan datanya
      const [todayRes, monthRes, ...statusResList] = await Promise.all([
        MarketingRequestService.getAll({ ...getTodayRange(), limit: 1 }),
        MarketingRequestService.getAll({ ...getThisMonthRange(), limit: 1 }),
        ...STATUS_LIST.map((status) => MarketingRequestService.getAll({ status, limit: 1 })),
      ]);

      summaryStats.value = {
        todayCount: extractTotal(todayRes),
        thisMonthCount: extractTotal(monthRes),
        statusBreakdown: STATUS_LIST.map((status, i) => ({
          status,
          count: extractTotal(statusResList[i]),
        })),
      };
    } catch (err) {
      console.error('Gagal memuat ringkasan pengajuan marketing:', err);
      summaryStats.value = { todayCount: 0, thisMonthCount: 0, statusBreakdown: [] };
    } finally {
      isLoadingSummary.value = false;
    }
  };

  return {
    summaryStats,
    isLoadingSummary,
    fetchSummaryStats,
  };
}

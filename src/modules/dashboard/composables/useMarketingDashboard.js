import { reactive, ref, computed } from 'vue';
import { MarketingDashboardService } from '../dashboard.service';
import { isValidDateRange } from '../dashboard.constants';

export function useMarketingDashboard() {
  // ── Ringkasan utama (top summary, status breakdown, trends, recent activities) ──
  const summary = ref(null);
  const isLoadingSummary = ref(false);
  const summaryError = ref('');

  const loadSummary = async (params = {}) => {
    isLoadingSummary.value = true;
    summaryError.value = '';
    try {
      summary.value = await MarketingDashboardService.getSummary(params);
    } catch (err) {
      summaryError.value = err?.response?.data?.message || 'Gagal memuat ringkasan dashboard Marketing.';
    } finally {
      isLoadingSummary.value = false;
    }
  };

  // ── Kartu " Total Pengajuan oleh PIC\ — state terpisah, filter tanggal sendiri ──
 const picFilters = reactive({
 start_date: '',
 end_date: '',
 });
 const picSubmissions = ref([]);
 const isLoadingPicSubmissions = ref(false);
 const picSubmissionsError = ref('');

 const canLoadPicSubmissions = computed(() => {
 // Jika kedua tanggal kosong: valid (ambil semua waktu)
 if (!picFilters.start_date && !picFilters.end_date) return true;
 // Jika hanya satu yang diisi: belum valid
 if (!picFilters.start_date || !picFilters.end_date) return false;
 const { valid } = isValidDateRange(picFilters.start_date, picFilters.end_date);
 return valid;
 });

 const loadPicSubmissions = async () => {
 const hasDates = !!(picFilters.start_date || picFilters.end_date);
 if (hasDates) {
 const { valid, message } = isValidDateRange(picFilters.start_date, picFilters.end_date);
 if (!valid) {
 picSubmissionsError.value = message;
 picSubmissions.value = [];
 return;
 }
 }
 isLoadingPicSubmissions.value = true;
 picSubmissionsError.value = '';
 try {
 const params = {};
 if (picFilters.start_date && picFilters.end_date) {
 params.start_date = picFilters.start_date;
 params.end_date = picFilters.end_date;
 }
 const result = await MarketingDashboardService.getPicSubmissions(params);
 picSubmissions.value = result?.data || [];
 } catch (err) {
 picSubmissionsError.value = err?.response?.data?.message || 'Gagal memuat data pengajuan per PIC.';
 picSubmissions.value = [];
 } finally {
 isLoadingPicSubmissions.value = false;
 }
 };

 return {
 summary,
 isLoadingSummary,
 summaryError,
 loadSummary,

 picFilters,
 picSubmissions,
 isLoadingPicSubmissions,
 picSubmissionsError,
 canLoadPicSubmissions,
 loadPicSubmissions,
 };
}

import axios from '@/plugins/axios';

/**
 * GADashboardService
 * API communication for GA Dashboard.
 */
export const GADashboardService = {
  /** Get Dashboard Summary Statistics */
  getSummary: async (params = {}) => {
    const response = await axios.get('ga/dashboard', { params });
    return response.data;
  },
};

/**
 * MarketingDashboardService
 * API communication for Marketing Dashboard.
 */
export const MarketingDashboardService = {
  /** Get Dashboard Summary Statistics */
  getSummary: async (params = {}) => {
    const response = await axios.get('marketing/dashboard', { params });
    return response.data;
  },
  /** Get "Total Pengajuan oleh PIC" — wajib start_date & end_date, maks 3 bulan (divalidasi juga di backend) */
  getPicSubmissions: async (params = {}) => {
    const response = await axios.get('marketing/dashboard/pic-submissions', { params });
    return response.data;
  },
};

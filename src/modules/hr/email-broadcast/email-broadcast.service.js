import axios from '@/plugins/axios';

export const EmailBroadcastService = {
  /**
   * Preview data dari file Excel sebelum broadcast.
   */
  previewExcel: async (excelFile) => {
    const formData = new FormData();
    formData.append('excel', excelFile);

    const response = await axios.post('/hr/email-broadcasts/preview-excel', formData, {
      timeout: 30000,
    });
    return response.data;
  },

  /**
   * Kirim broadcast email (async — langsung return batch_id).
   */
  sendBroadcast: async ({ excelFile, documents, subject, body }) => {
    const formData = new FormData();
    formData.append('excel', excelFile);
    formData.append('subject', subject);
    formData.append('body', body);

    documents.forEach((doc) => {
      formData.append('documents', doc);
    });

    const response = await axios.post('/hr/email-broadcasts/send', formData, {
      timeout: 120000, // 2 menit timeout untuk upload file besar
    });
    return response.data;
  },

  /**
   * Cek status/progress batch broadcast.
   */
  getBatchStatus: async (batchId) => {
    const response = await axios.get(`/hr/email-broadcasts/status/${batchId}`);
    return response.data;
  },
};

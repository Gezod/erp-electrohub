/**
 * Utility to handle file downloads from Blob/Axios response
 * @param {Blob} blob - The file content
 * @param {string} filename - Desired filename
 */
export const downloadFile = (blob, filename) => {
  if (!blob) return;
  
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * resolveFileUrl
 * Mengubah path file dari backend menjadi URL absolut yang bisa dibuka browser.
 *
 * Catatan: VITE_API_BASE_URL SUDAH mengandung '/api' (mis. https://host/api),
 * sedangkan file statis disajikan di luar prefix itu (mis. /uploads/x.pdf).
 * Karena itu '/api' di ujung base harus dibuang dulu — menempelkan path
 * langsung ke base akan menghasilkan https://host/api/uploads/x.pdf yang salah.
 *
 * @param {string} path - URL absolut atau path relatif dari backend
 * @returns {string} URL absolut, atau '' bila path kosong
 */
export const resolveFileUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(
    /\/api\/?$/,
    ''
  );

  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

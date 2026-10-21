/**
 * formatThousand
 * Mengubah angka menjadi string dengan pemisah ribuan titik.
 * Contoh: 1000000 -> "1.000.000"
 */
export const formatThousand = (val) => {
  if (val === undefined || val === null || val === '') return '';
  
  // Convert to string and handle both dot and comma as decimal separators
  let str = val.toString().replace(/,/g, '.');
  
  const parts = str.split('.');
  // Keep only digits for the integer part
  const integerPart = parts[0].replace(/\D/g, '');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  if (parts.length > 1) {
    // Keep only digits for the decimal part and limit to 2 decimal places
    const decimalPart = parts[1].replace(/\D/g, '').substring(0, 2);
    return `${formattedInteger},${decimalPart}`;
  }
  
  return formattedInteger;
};

/**
 * parseThousand
 * Mengubah string berformat titik (ribuan) dan koma (desimal) menjadi angka murni.
 * Contoh: "1.000.000,50" -> 1000000.5
 */
export const parseThousand = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  
  // Hapus titik (ribuan) dan ganti koma dengan titik (desimal)
  const cleanValue = val.toString()
    .replace(/\./g, '')
    .replace(',', '.');
    
  return Number(cleanValue) || 0;
};

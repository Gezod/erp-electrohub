/**
 * FileHelper
 * Utility to handle file-related operations such as Base64 conversion.
 */
export const FileHelper = {
  /**
   * toBase64
   * Converts a File object to a Base64 string.
   * @param {File} file 
   * @returns {Promise<string>}
   */
  toBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
};

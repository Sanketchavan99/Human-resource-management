import api from './api';

const PAYSLIP_BASE_URL = '/payslips';

/**
 * Upload Excel file with payslip data
 * @param {File} file - Excel file
 * @param {Number} month - Month (1-12)
 * @param {Number} year - Year
 * @returns {Promise} Response data
 */
export const uploadPayslipExcel = async (file, month, year) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', month);
    formData.append('year', year);

    const response = await api.post(`${PAYSLIP_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to upload payslip Excel' };
  }
};

/**
 * Get all payslips for authenticated employee
 * @returns {Promise} Response data with payslips array
 */
export const getMyPayslips = async () => {
  try {
    const response = await api.get(`${PAYSLIP_BASE_URL}/my`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch payslips' };
  }
};

/**
 * Check if current month payslip is available
 * @returns {Promise} Response data with availability status
 */
export const checkCurrentMonthAvailability = async () => {
  try {
    const response = await api.get(`${PAYSLIP_BASE_URL}/current-available`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to check availability' };
  }
};

/**
 * Download payslip PDF
 * @param {String} payslipId - Payslip ID
 * @returns {Promise} Blob data
 */
export const downloadPayslip = async (payslipId) => {
  try {
    const response = await api.get(`${PAYSLIP_BASE_URL}/${payslipId}/download`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payslip_${payslipId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Payslip downloaded successfully' };
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to download payslip' };
  }
};

/**
 * Get all payslips (Admin/Employer)
 * @param {Object} filters - Filter options (month, year, empCode)
 * @returns {Promise} Response data with payslips array
 */
export const getAllPayslips = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.month) queryParams.append('month', filters.month);
    if (filters.year) queryParams.append('year', filters.year);
    if (filters.empCode) queryParams.append('empCode', filters.empCode);

    const response = await api.get(`${PAYSLIP_BASE_URL}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch payslips' };
  }
};

/**
 * Generate PDF for a payslip
 * @param {String} payslipId - Payslip ID
 * @returns {Promise} Response data
 */
export const generatePayslipPDF = async (payslipId) => {
  try {
    const response = await api.post(`${PAYSLIP_BASE_URL}/${payslipId}/generate-pdf`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to generate PDF' };
  }
};

/**
 * Delete a payslip
 * @param {String} payslipId - Payslip ID
 * @returns {Promise} Response data
 */
export const deletePayslip = async (payslipId) => {
  try {
    const response = await api.delete(`${PAYSLIP_BASE_URL}/${payslipId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete payslip' };
  }
};

export default {
  uploadPayslipExcel,
  getMyPayslips,
  checkCurrentMonthAvailability,
  downloadPayslip,
  getAllPayslips,
  generatePayslipPDF,
  deletePayslip,
};

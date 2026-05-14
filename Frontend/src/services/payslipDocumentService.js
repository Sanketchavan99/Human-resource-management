import api from './api';

const BASE_URL = '/payslip-documents';

/**
 * Upload single payslip document
 */
const uploadSinglePayslip = async (userId, month, year, file) => {
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('month', month);
    formData.append('year', year);
    formData.append('file', file);

    const response = await api.post(`${BASE_URL}/single-upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Upload bulk payslip documents
 */
const uploadBulkPayslips = async (month, year, files) => {
  try {
    const formData = new FormData();
    formData.append('month', month);
    formData.append('year', year);

    // Append all files
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    const response = await api.post(`${BASE_URL}/bulk-upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all payslip documents (filtered by user's company)
 */
const getAllPayslipDocuments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);

    const response = await api.get(`${BASE_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get authenticated user's payslip documents
 */
const getMyPayslipDocuments = async () => {
  try {
    const response = await api.get(`${BASE_URL}/my`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Download a payslip document
 */
const downloadPayslipDocument = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}/download`, {
      responseType: 'blob',
    });

    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Extract filename from response headers if available, otherwise use a default name
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'payslip.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Download started' };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a payslip document
 */
const deletePayslipDocument = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const payslipDocumentService = {
  uploadSinglePayslip,
  uploadBulkPayslips,
  getAllPayslipDocuments,
  getMyPayslipDocuments,
  downloadPayslipDocument,
  deletePayslipDocument,
};

export default payslipDocumentService;

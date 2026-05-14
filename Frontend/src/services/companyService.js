import api from './api';

/**
 * Company Service
 * Handles all company-related API calls
 */

// ==================== CREATE COMPANY (Admin Only) ====================
/**
 * Create a new company - Admin only
 * @param {Object} data - Company data
 * @param {string} data.code - Company code (required, unique)
 * @param {string} [data.name] - Company name
 * @returns {Promise<Object>} Response with created company
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created company object
 */
const createCompany = async (data) => {
  try {
    const response = await api.post('/companies', data);
    return response;
  } catch (error) {
    console.error('Create company error:', error);
    return error.response;
  }
};

// ==================== GET ALL COMPANIES ====================
/**
 * Get all companies
 * @returns {Promise<Object>} Response with array of companies
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of company objects
 */
const getAllCompanies = async () => {
  try {
    const response = await api.get('/companies');
    return response;
  } catch (error) {
    console.error('Get all companies error:', error);
    return error.response;
  }
};

// ==================== GET COMPANY BY ID ====================
/**
 * Get company by ID
 * @param {string} companyId - Company UUID
 * @returns {Promise<Object>} Response with company data
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Company object
 */
const getCompanyById = async (companyId) => {
  try {
    const response = await api.get(`/companies/${companyId}`);
    return response;
  } catch (error) {
    console.error('Get company by ID error:', error);
    return error.response;
  }
};

// ==================== UPDATE COMPANY (Admin Only) ====================
/**
 * Update company - Admin only
 * @param {string} companyId - Company UUID
 * @param {Object} data - Company data to update
 * @param {string} [data.code] - Company code (unique)
 * @param {string} [data.name] - Company name
 * @returns {Promise<Object>} Response with updated company
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated company object
 */
const updateCompany = async (companyId, data) => {
  try {
    const response = await api.put(`/companies/${companyId}`, data);
    return response;
  } catch (error) {
    console.error('Update company error:', error);
    return error.response;
  }
};

// ==================== DELETE COMPANY (Admin Only) ====================
/**
 * Delete company - Admin only
 * @param {string} companyId - Company UUID
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 */
const deleteCompany = async (companyId) => {
  try {
    const response = await api.delete(`/companies/${companyId}`);
    return response;
  } catch (error) {
  return error.response;
  }
};

// ==================== EMPLOYER-SPECIFIC ENDPOINTS ====================

/**
 * Get my company dashboard data - Employer only
 * @returns {Promise<Object>} Response with company dashboard data
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Dashboard data including company info, stats, and recent employees
 */
const getMyCompanyDashboard = async () => {
  try {
    const response = await api.get('/companies/my/dashboard');
    return response;
  } catch (error) {
    console.error('Get my company dashboard error:', error);
    return error.response;
  }
};

const getMyCompanyLogo = async () => {
  try {
    const response = await api.get('/companies/logo');
    return response;
  } catch (error) {
    console.error('Get my company logo error:', error);
    return error.response;
  }
};

/**
 * Get my company employees - Employer only
 * @param {Object} params - Query parameters
 * @param {string} [params.search] - Search query for filtering employees
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=50] - Number of employees per page
 * @returns {Promise<Object>} Response with employees list and pagination
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Employees array and pagination info
 */
const getMyCompanyEmployees = async (params = {}) => {
  try {
    const response = await api.get('/companies/my/employees', { params });
    return response;
  } catch (error) {
    console.error('Get my company employees error:', error);
    return error.response;
  }
};

/**
 * Upload company logo - Employer only
 * @param {FormData} formData - Form data containing logo file
 * @returns {Promise<Object>} Response with uploaded logo path
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Logo path
 */
const uploadCompanyLogo = async (formData) => {
  try {
    const response = await api.post('/companies/my/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Upload company logo error:', error);
    return error.response;
  }
};

/**
 * Export company employees to Excel - Employer only
 * @returns {Promise<Blob>} Excel file blob
 */
const exportEmployeesToExcel = async () => {
  try {
    const response = await api.get('/companies/my/employees/export', {
      responseType: 'blob', // Important for file download
    });
    return response;
  } catch (error) {
    console.error('Export employees to Excel error:', error);
    return error.response;
  }
};

/**
 * Get employee complete profile - Employer only
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<Object>} Response with employee complete profile
 */
const getEmployeeCompleteProfile = async (employeeId) => {
  try {
    const response = await api.get(`/companies/my/employees/${employeeId}/profile`);
    return response;
  } catch (error) {
    console.error('Get employee complete profile error:', error);
    return error.response;
  }
};

/**
 * Generate employee ID card - Employer only
 * @param {string} employeeId - Employee UUID
 * @returns {Promise<Object>} Response with ID card generation status
 */
const generateEmployeeIdCard = async (employeeId) => {
  try {
    const response = await api.post(`/companies/my/employees/${employeeId}/generate-id-card`);
    return response;
  } catch (error) {
    console.error('Generate employee ID card error:', error);
    return error.response;
  }
};

/**
 * Upload employee ESIC card - Employer only
 * @param {string} employeeId - Employee UUID
 * @param {FormData} formData - Form data containing ESIC card file
 * @returns {Promise<Object>} Response with upload status
 */
const uploadEmployeeEsicCard = async (employeeId, formData) => {
  try {
    const response = await api.post(`/companies/my/employees/${employeeId}/esic-card`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Upload employee ESIC card error:', error);
    return error.response;
  }
};

const companyService = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getMyCompanyLogo,
  // Employer-specific methods
  getMyCompanyDashboard,
  getMyCompanyEmployees,
  getEmployeeCompleteProfile,
  generateEmployeeIdCard,
  uploadEmployeeEsicCard,
  uploadCompanyLogo,
  exportEmployeesToExcel,
};

export default companyService;


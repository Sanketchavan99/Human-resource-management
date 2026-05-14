import api from './api';

/**
 * Bank Detail Service
 * Handles all bank detail-related API calls
 * Note: One-to-One relationship - One bank detail per user
 */

// ==================== CREATE BANK DETAIL ====================
/**
 * Create bank detail
 * @param {Object} data - Bank detail data
 * @param {string} data.userId - User UUID (required)
 * @param {string} [data.bankName] - Bank name
 * @param {string} [data.accountNumber] - Bank account number
 * @param {string} [data.ifscCode] - IFSC code
 * @param {string} [data.accountType] - Account type (Savings/Current)
 * @returns {Promise<Object>} Response with created bank detail
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created bank detail object
 */
const createBankDetail = async (data) => {
  try {
    const response = await api.post('/bank-details', data);
    return response;
  } catch (error) {
    console.error('Create bank detail error:', error);
    return error.response;
  }
};

// ==================== GET ALL BANK DETAILS (Admin Only) ====================
/**
 * Get all bank details - Admin only
 * @returns {Promise<Object>} Response with array of bank details
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of bank detail objects
 */
const getAllBankDetails = async () => {
  try {
    const response = await api.get('/bank-details');
    return response;
  } catch (error) {
    console.error('Get all bank details error:', error);
    return error.response;
  }
};

// ==================== GET MY BANK DETAIL ====================
/**
 * Get current user's bank detail
 * @returns {Promise<Object>} Response with user's bank detail
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Bank detail object (or null if not found)
 */
const getMyBankDetail = async () => {
  try {
    const response = await api.post('/bank-details/my');
    return response;
  } catch (error) {
    console.error('Get my bank detail error:', error);
    return error.response;
  }
};

// ==================== GET BANK DETAIL BY USER ID (Admin Only) ====================
/**
 * Get bank detail by user ID - Admin only
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Response with user's bank detail
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Bank detail object
 */
const getBankDetailByUserId = async (userId) => {
  try {
    const response = await api.get(`/bank-details/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Get bank detail by user ID error:', error);
    return error.response;
  }
};

// ==================== GET BANK DETAIL BY ID ====================
/**
 * Get bank detail by ID
 * @param {string} bankDetailId - Bank detail UUID
 * @returns {Promise<Object>} Response with bank detail data
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Bank detail object
 */
const getBankDetailById = async (bankDetailId) => {
  try {
    const response = await api.get(`/bank-details/${bankDetailId}`);
    return response;
  } catch (error) {
    console.error('Get bank detail by ID error:', error);
    return error.response;
  }
};

// ==================== UPDATE BANK DETAIL ====================
/**
 * Update bank detail
 * @param {string} bankDetailId - Bank detail UUID
 * @param {Object} data - Bank detail data to update
 * @param {string} [data.bankName] - Bank name
 * @param {string} [data.accountNumber] - Bank account number
 * @param {string} [data.ifscCode] - IFSC code
 * @param {string} [data.accountType] - Account type
 * @returns {Promise<Object>} Response with updated bank detail
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated bank detail object
 */
const updateBankDetail = async (bankDetailId, data) => {
  try {
    const response = await api.put(`/bank-details/${bankDetailId}`, data);
    return response;
  } catch (error) {
    console.error('Update bank detail error:', error);
    return error.response;
  }
};

// ==================== DELETE BANK DETAIL ====================
/**
 * Delete bank detail
 * @param {string} bankDetailId - Bank detail UUID
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 */
const deleteBankDetail = async (bankDetailId) => {
  try {
    const response = await api.delete(`/bank-details/${bankDetailId}`);
    return response;
  } catch (error) {
    console.error('Delete bank detail error:', error);
    return error.response;
  }
};

const bankDetailService = {
  createBankDetail,
  getAllBankDetails,
  getMyBankDetail,
  getBankDetailByUserId,
  getBankDetailById,
  updateBankDetail,
  deleteBankDetail,
};

export default bankDetailService;


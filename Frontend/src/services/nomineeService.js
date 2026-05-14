import api from './api';

/**
 * Nominee Service
 * Handles all nominee-related API calls
 * Note: One-to-One relationship - One nominee per user
 */

// ==================== CREATE NOMINEE ====================
/**
 * Create nominee
 * @param {Object} data - Nominee data
 * @param {string} data.userId - User UUID (required)
 * @param {string} [data.name] - Nominee name
 * @param {string} [data.city] - City name
 * @param {string} [data.state] - State name
 * @param {string} [data.relation] - Relation to user
 * @returns {Promise<Object>} Response with created nominee
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created nominee object
 */
const createNominee = async (data) => {
  try {
    const response = await api.post('/nominees', data);
    return response;
  } catch (error) {
    console.error('Create nominee error:', error);
    return error.response;
  }
};

// ==================== GET ALL NOMINEES (Admin Only) ====================
/**
 * Get all nominees - Admin only
 * @returns {Promise<Object>} Response with array of nominees
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of nominee objects
 */
const getAllNominees = async () => {
  try {
    const response = await api.get('/nominees');
    return response;
  } catch (error) {
    console.error('Get all nominees error:', error);
    return error.response;
  }
};

// ==================== GET MY NOMINEE ====================
/**
 * Get current user's nominee
 * @returns {Promise<Object>} Response with user's nominee
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Nominee object (or null if not found)
 */
const getMyNominee = async () => {
  try {
    const response = await api.get('/nominees/my');
    return response;
  } catch (error) {
    console.error('Get my nominee error:', error);
    return error.response;
  }
};

// ==================== GET NOMINEE BY USER ID (Admin Only) ====================
/**
 * Get nominee by user ID - Admin only
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Response with user's nominee
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Nominee object
 */
const getNomineeByUserId = async (userId) => {
  try {
    const response = await api.get(`/nominees/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Get nominee by user ID error:', error);
    return error.response;
  }
};

// ==================== GET NOMINEE BY ID ====================
/**
 * Get nominee by ID
 * @param {string} nomineeId - Nominee UUID
 * @returns {Promise<Object>} Response with nominee data
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Nominee object
 */
const getNomineeById = async (nomineeId) => {
  try {
    const response = await api.get(`/nominees/${nomineeId}`);
    return response;
  } catch (error) {
    console.error('Get nominee by ID error:', error);
    return error.response;
  }
};

// ==================== UPDATE NOMINEE ====================
/**
 * Update nominee
 * @param {string} nomineeId - Nominee UUID
 * @param {Object} data - Nominee data to update
 * @param {string} [data.name] - Nominee name
 * @param {string} [data.city] - City name
 * @param {string} [data.state] - State name
 * @param {string} [data.relation] - Relation to user
 * @returns {Promise<Object>} Response with updated nominee
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated nominee object
 */
const updateNominee = async (nomineeId, data) => {
  try {
    const response = await api.put(`/nominees/${nomineeId}`, data);
    return response;
  } catch (error) {
    console.error('Update nominee error:', error);
    return error.response;
  }
};

// ==================== DELETE NOMINEE ====================
/**
 * Delete nominee
 * @param {string} nomineeId - Nominee UUID
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 */
const deleteNominee = async (nomineeId) => {
  try {
    const response = await api.delete(`/nominees/${nomineeId}`);
    return response;
  } catch (error) {
    console.error('Delete nominee error:', error);
    return error.response;
  }
};

const nomineeService = {
  createNominee,
  getAllNominees,
  getMyNominee,
  getNomineeByUserId,
  getNomineeById,
  updateNominee,
  deleteNominee,
};

export default nomineeService;


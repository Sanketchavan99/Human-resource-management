import api from './api';

/**
 * Center Service
 * Handles all center-related API calls
 */

// ==================== CREATE CENTER (Admin Only) ====================
/**
 * Create a new center - Admin only
 * @param {Object} data - Center data
 * @param {string} data.name - Center name (required)
 * @param {string} [data.city] - City name
 * @param {string} [data.state] - State name
 * @param {string} [data.zone] - Zone name
 * @returns {Promise<Object>} Response with created center
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created center object
 */
const createCenter = async (data) => {
  try {
    const response = await api.post('/centers', data);
    return response;
  } catch (error) {
    console.error('Create center error:', error);
    return error.response;
  }
};

// ==================== GET ALL CENTERS ====================
/**
 * Get all centers
 * @returns {Promise<Object>} Response with array of centers
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of center objects
 */
const getAllCenters = async () => {
  try {
    const response = await api.get('/centers');
    return response;
  } catch (error) {
    console.error('Get all centers error:', error);
    return error.response;
  }
};

// ==================== GET CENTER BY ID ====================
/**
 * Get center by ID
 * @param {string} centerId - Center UUID
 * @returns {Promise<Object>} Response with center data
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Center object
 */
const getCenterById = async (centerId) => {
  try {
    const response = await api.get(`/centers/${centerId}`);
    return response;
  } catch (error) {
    console.error('Get center by ID error:', error);
    return error.response;
  }
};

// ==================== UPDATE CENTER (Admin Only) ====================
/**
 * Update center - Admin only
 * @param {string} centerId - Center UUID
 * @param {Object} data - Center data to update
 * @param {string} [data.name] - Center name
 * @param {string} [data.city] - City name
 * @param {string} [data.state] - State name
 * @param {string} [data.zone] - Zone name
 * @returns {Promise<Object>} Response with updated center
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated center object
 */
const updateCenter = async (centerId, data) => {
  try {
    const response = await api.put(`/centers/${centerId}`, data);
    return response;
  } catch (error) {
    console.error('Update center error:', error);
    return error.response;
  }
};

// ==================== DELETE CENTER (Admin Only) ====================
/**
 * Delete center - Admin only
 * @param {string} centerId - Center UUID
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 */
const deleteCenter = async (centerId) => {
  try {
    const response = await api.delete(`/centers/${centerId}`);
    return response;
  } catch (error) {
    console.error('Delete center error:', error);
    return error.response;
  }
};

const centerService = {
  createCenter,
  getAllCenters,
  getCenterById,
  updateCenter,
  deleteCenter,
};

export default centerService;


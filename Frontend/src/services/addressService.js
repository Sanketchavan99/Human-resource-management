import api from './api';

/**
 * Address Service
 * Handles all address-related API calls
 */

// ==================== CREATE ADDRESS ====================
/**
 * Create a new address
 * @param {Object} data - Address data
 * @param {string} data.userId - User UUID (required)
 * @param {string} data.type - Address type: 'Temporary' | 'Permanent' (required)
 * @param {string} [data.addressLine] - Full address line
 * @param {string} [data.city] - City name
 * @param {string} [data.state] - State name
 * @returns {Promise<Object>} Response with created address
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created address object
 */
const createAddress = async (data) => {
  try {
    const response = await api.post('/addresses', data);
    return response;
  } catch (error) {
    console.error('Create address error:', error);
    return error.response;
  }
};

// ==================== GET ALL ADDRESSES (Admin Only) ====================
/**
 * Get all addresses - Admin only
 * @returns {Promise<Object>} Response with array of addresses
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of address objects
 */
const getAllAddresses = async () => {
  try {
    const response = await api.get('/addresses');
    return response;
  } catch (error) {
    console.error('Get all addresses error:', error);
    return error.response;
  }
};

// ==================== GET MY ADDRESSES ====================
/**
 * Get current user's addresses
 * @returns {Promise<Object>} Response with array of user's addresses
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of address objects
 */
const getMyAddresses = async () => {
  try {
    const response = await api.get('/addresses/my');
    return response;
  } catch (error) {
    console.error('Get my addresses error:', error);
    return error.response;
  }
};

// ==================== GET ADDRESSES BY USER ID (Admin Only) ====================
/**
 * Get addresses by user ID - Admin only
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Response with array of user's addresses
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of address objects
 */
const getAddressesByUserId = async (userId) => {
  try {
    const response = await api.get(`/addresses/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Get addresses by user ID error:', error);
    return error.response;
  }
};

// ==================== GET ADDRESS BY ID ====================
/**
 * Get address by ID
 * @param {string} addressId - Address UUID
 * @returns {Promise<Object>} Response with address data
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Address object
 */
const getAddressById = async (addressId) => {
  try {
    const response = await api.get(`/addresses/${addressId}`);
    return response;
  } catch (error) {
    console.error('Get address by ID error:', error);
    return error.response;
  }
};

// ==================== UPDATE ADDRESS ====================
/**
 * Update address
 * @param {string} addressId - Address UUID
 * @param {Object} data - Address data to update
 * @param {string} [data.type] - Address type: 'Temporary' | 'Permanent'
 * @param {string} [data.addressLine] - Full address line
 * @param {string} [data.city] - City name
 * @param {string} [data.state] - State name
 * @returns {Promise<Object>} Response with updated address
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated address object
 */
const updateAddress = async (addressId, data) => {
  try {
    const response = await api.put(`/addresses/${addressId}`, data);
    return response;
  } catch (error) {
    console.error('Update address error:', error);
    return error.response;
  }
};

// ==================== DELETE ADDRESS ====================
/**
 * Delete address
 * @param {string} addressId - Address UUID
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 */
const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`/addresses/${addressId}`);
    return response;
  } catch (error) {
    console.error('Delete address error:', error);
    return error.response;
  }
};

const addressService = {
  createAddress,
  getAllAddresses,
  getMyAddresses,
  getAddressesByUserId,
  getAddressById,
  updateAddress,
  deleteAddress,
};

export default addressService;


import api from './api';

/**
 * Emergency Contact Service
 * Handles all emergency contact-related API calls
 * Note: One-to-One relationship - One emergency contact per user
 */

// ==================== CREATE EMERGENCY CONTACT ====================
/**
 * Create emergency contact
 * @param {Object} data - Emergency contact data
 * @param {string} data.userId - User UUID (required)
 * @param {string} [data.name] - Contact person name
 * @param {string} [data.phoneNumber] - Contact phone number
 * @param {string} [data.relation] - Relation to user
 * @returns {Promise<Object>} Response with created emergency contact
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created emergency contact object
 */
const createEmergencyContact = async (data) => {
  try {
    const response = await api.post('/emergency-contacts', data);
    return response;
  } catch (error) {
    console.error('Create emergency contact error:', error);
    return error.response;
  }
};

// ==================== GET ALL EMERGENCY CONTACTS (Admin Only) ====================
/**
 * Get all emergency contacts - Admin only
 * @returns {Promise<Object>} Response with array of emergency contacts
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of emergency contact objects
 */
const getAllEmergencyContacts = async () => {
  try {
    const response = await api.get('/emergency-contacts');
    return response;
  } catch (error) {
    console.error('Get all emergency contacts error:', error);
    return error.response;
  }
};

// ==================== GET MY EMERGENCY CONTACT ====================
/**
 * Get current user's emergency contact
 * @returns {Promise<Object>} Response with user's emergency contact
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Emergency contact object (or null if not found)
 */
const getMyEmergencyContact = async () => {
  try {
    const response = await api.get('/emergency-contacts/my');
    return response;
  } catch (error) {
    console.error('Get my emergency contact error:', error);
    return error.response;
  }
};

// ==================== GET EMERGENCY CONTACT BY USER ID (Admin Only) ====================
/**
 * Get emergency contact by user ID - Admin only
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Response with user's emergency contact
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Emergency contact object
 */
const getEmergencyContactByUserId = async (userId) => {
  try {
    const response = await api.get(`/emergency-contacts/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Get emergency contact by user ID error:', error);
    return error.response;
  }
};

// ==================== GET EMERGENCY CONTACT BY ID ====================
/**
 * Get emergency contact by ID
 * @param {string} contactId - Emergency contact UUID
 * @returns {Promise<Object>} Response with emergency contact data
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Emergency contact object
 */
const getEmergencyContactById = async (contactId) => {
  try {
    const response = await api.get(`/emergency-contacts/${contactId}`);
    return response;
  } catch (error) {
    console.error('Get emergency contact by ID error:', error);
    return error.response;
  }
};

// ==================== UPDATE EMERGENCY CONTACT ====================
/**
 * Update emergency contact
 * @param {string} contactId - Emergency contact UUID
 * @param {Object} data - Emergency contact data to update
 * @param {string} [data.name] - Contact person name
 * @param {string} [data.phoneNumber] - Contact phone number
 * @param {string} [data.relation] - Relation to user
 * @returns {Promise<Object>} Response with updated emergency contact
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated emergency contact object
 */
const updateEmergencyContact = async (contactId, data) => {
  try {
    const response = await api.put(`/emergency-contacts/${contactId}`, data);
    return response;
  } catch (error) {
    console.error('Update emergency contact error:', error);
    return error.response;
  }
};

// ==================== DELETE EMERGENCY CONTACT ====================
/**
 * Delete emergency contact
 * @param {string} contactId - Emergency contact UUID
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 */
const deleteEmergencyContact = async (contactId) => {
  try {
    const response = await api.delete(`/emergency-contacts/${contactId}`);
    return response;
  } catch (error) {
    console.error('Delete emergency contact error:', error);
    return error.response;
  }
};

const emergencyContactService = {
  createEmergencyContact,
  getAllEmergencyContacts,
  getMyEmergencyContact,
  getEmergencyContactByUserId,
  getEmergencyContactById,
  updateEmergencyContact,
  deleteEmergencyContact,
};

export default emergencyContactService;


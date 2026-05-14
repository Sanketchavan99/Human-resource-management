import api from './api';

/**
 * Family Member Service
 * Handles all family member-related API calls
 * Note: One-to-Many relationship - Multiple family members per user
 */

// ==================== CREATE FAMILY MEMBER ====================
/**
 * Create family member
 * @param {Object} data - Family member data
 * @param {string} data.userId - User UUID (required)
 * @param {string} [data.name] - Family member name
 * @param {string} [data.dob] - Date of birth (YYYY-MM-DD)
 * @param {string} [data.relation] - Relation to user (Father/Mother/Spouse/Child/etc.)
 * @returns {Promise<Object>} Response with created family member
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created family member object
 */
const createFamilyMember = async (data) => {
  try {
    const response = await api.post('/family-members', data);
    return response;
  } catch (error) {
    console.error('Create family member error:', error);
    return error.response;
  }
};

// ==================== GET ALL FAMILY MEMBERS (Admin Only) ====================
/**
 * Get all family members - Admin only
 * @returns {Promise<Object>} Response with array of family members
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of family member objects
 */
const getAllFamilyMembers = async () => {
  try {
    const response = await api.get('/family-members');
    return response;
  } catch (error) {
    console.error('Get all family members error:', error);
    return error.response;
  }
};

// ==================== GET MY FAMILY MEMBERS ====================
/**
 * Get current user's family members
 * @returns {Promise<Object>} Response with array of user's family members
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of family member objects
 */
const getMyFamilyMembers = async () => {
  try {
    const response = await api.get('/family-members/my');
    return response;
  } catch (error) {
    console.error('Get my family members error:', error);
    return error.response;
  }
};

// ==================== GET FAMILY MEMBERS BY USER ID (Admin Only) ====================
/**
 * Get family members by user ID - Admin only
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Response with array of user's family members
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of family member objects
 */
const getFamilyMembersByUserId = async (userId) => {
  try {
    const response = await api.get(`/family-members/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Get family members by user ID error:', error);
    return error.response;
  }
};

// ==================== GET FAMILY MEMBER BY ID ====================
/**
 * Get family member by ID
 * @param {string} memberId - Family member UUID
 * @returns {Promise<Object>} Response with family member data
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Family member object
 */
const getFamilyMemberById = async (memberId) => {
  try {
    const response = await api.get(`/family-members/${memberId}`);
    return response;
  } catch (error) {
    console.error('Get family member by ID error:', error);
    return error.response;
  }
};

// ==================== UPDATE FAMILY MEMBER ====================
/**
 * Update family member
 * @param {string} memberId - Family member UUID
 * @param {Object} data - Family member data to update
 * @param {string} [data.name] - Family member name
 * @param {string} [data.dob] - Date of birth (YYYY-MM-DD)
 * @param {string} [data.relation] - Relation to user
 * @returns {Promise<Object>} Response with updated family member
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated family member object
 */
const updateFamilyMember = async (memberId, data) => {
  try {
    const response = await api.put(`/family-members/${memberId}`, data);
    return response;
  } catch (error) {
    console.error('Update family member error:', error);
    return error.response;
  }
};

// ==================== DELETE FAMILY MEMBER ====================
/**
 * Delete family member
 * @param {string} memberId - Family member UUID
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 */
const deleteFamilyMember = async (memberId) => {
  try {
    const response = await api.delete(`/family-members/${memberId}`);
    return response;
  } catch (error) {
    console.error('Delete family member error:', error);
    return error.response;
  }
};

const familyMemberService = {
  createFamilyMember,
  getAllFamilyMembers,
  getMyFamilyMembers,
  getFamilyMembersByUserId,
  getFamilyMemberById,
  updateFamilyMember,
  deleteFamilyMember,
};

export default familyMemberService;


import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

// ==================== REGISTER ====================
/**
 * Register a new user
 * @param {Object} data - Registration data
 * @param {string} data.phoneNumber - User's phone number (required)
 * @param {string} data.name - User's full name (optional)
 * @param {string} data.role - User role: 'employee' | 'teamMember' | 'admin' | 'employer' (optional)
 * @returns {Promise<Object>} Axios response object
 */
const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return error.response;
  }
};

// ==================== VERIFY OTP ====================
/**
 * Verify OTP and complete login
 * @param {Object} data - OTP verification data
 * @param {string} data.phoneNumber - User's phone number (required)
 * @param {string} data.otp - 6-digit OTP code (required)
 * @returns {Promise<Object>} Axios response object with token and user data
 */

// ==================== LOGOUT ====================
/**
 * Logout current user
 * @returns {Promise<Object>} Axios response object
 */
const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    // Clear token from localStorage
    localStorage.removeItem('token');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Clear token even if request fails
    localStorage.removeItem('token');
    return error.response;
  }
};

// ==================== GET CURRENT USER ====================
/**
 * Get current authenticated user details
 * @returns {Promise<Object>} Axios response object with user data
 */
const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response;
  } catch (error) {
    console.error('Get current user error:', error);
    return error.response;
  }
};

// ==================== RESEND OTP ====================
/**
 * Resend OTP to user's phone
 * @param {Object} data - Data for resending OTP
 * @param {string} data.phoneNumber - User's phone number (required)
 * @returns {Promise<Object>} Axios response object
 */
const resendOTP = async (data) => {
  try {
    const response = await api.post('/auth/resend-otp', data);
    return response;
  } catch (error) {
    console.error('Resend OTP error:', error);
    return error.response;
  }
};

// ==================== SET PASSWORD ====================
/**
 * Set/Create password for user after OTP verification
 * @param {Object} data - Password data
 * @param {string} data.password - New password (required)
 * @returns {Promise<Object>} Axios response object
 */
const setPassword = async (data) => {
  try {
    const response = await api.post('/auth/set-password', data);
    return response;
  } catch (error) {
    console.error('Set password error:', error);
    return error.response;
  }
};

// ==================== LOGIN WITH PASSWORD ====================
/**
 * Login with employee code and password
 * @param {Object} data - Login data
 * @param {string} data.empCode - Employee code (required)
 * @param {string} data.password - Password (required)
 * @returns {Promise<Object>} Axios response object with token and user data
 */
const loginWithPassword = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return response;
  } catch (error) {
    console.error('Login with password error:', error);
    return error.response;
  }
};

// ==================== CREATE ENQUIRY ====================
/**
 * Create a new enquiry
 * @param {Object} data - Enquiry data
 * @param {string} data.name - Contact person name (required)
 * @param {string} data.mailId - Contact email (required)
 * @param {string} data.phoneNumber - Contact phone number (required)
 * @param {string} data.companyName - Company name (required)
 * @returns {Promise<Object>} Axios response object
 */
const createEnquiry = async (data) => {
  try {
    const response = await api.post('/auth/create-enquiry', data);
    return response;
  } catch (error) {
    console.error('Create enquiry error:', error);
    return error.response;
  }
};

// ==================== GET ENQUIRIES ====================
/**
 * Get all enquiries (Admin only)
 * @returns {Promise<Object>} Axios response object with enquiries array
 */
const getEnquiries = async () => {
  try {
    const response = await api.get('/auth/get-enquiries');
    return response;
  } catch (error) {
    console.error('Get enquiries error:', error);
    return error.response;
  }
};

const authService = {
  register,
  logout,
  getCurrentUser,
  resendOTP,
  setPassword,
  loginWithPassword,
  createEnquiry,
  getEnquiries,
};

export default authService;


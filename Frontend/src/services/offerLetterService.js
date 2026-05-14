import api from './api';

/**
 * Offer Letter Service
 * Handles all offer letter-related API calls
 * Note: Employees can view/download/accept their own offer letter
 *       Employers/Admins can upload and manage offer letters
 */

// ==================== UPLOAD OFFER LETTER (Employer/Admin) ====================
/**
 * Upload offer letter for an employee
 * @param {string} userId - User UUID (required)
 * @param {File} file - PDF file to upload (required)
 * @returns {Promise<Object>} Response with upload confirmation
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Upload details including timestamps
 */
const uploadOfferLetter = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/offer-letters/upload/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Upload offer letter error:', error);
    return error.response;
  }
};

// ==================== GET MY OFFER LETTER (Employee) ====================
/**
 * Get current user's offer letter details
 * @returns {Promise<Object>} Response with offer letter information
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - Offer letter details
 * @returns {string} response.data.filename - Offer letter filename
 * @returns {Date} response.data.uploadedAt - Upload timestamp
 * @returns {boolean} response.data.accepted - Acceptance status
 * @returns {Date} response.data.acceptedAt - Acceptance timestamp (if accepted)
 */
const getMyOfferLetter = async () => {
  try {
    const response = await api.get('/offer-letters/my');
    return response;
  } catch (error) {
    console.error('Get my offer letter error:', error);
    return error.response;
  }
};

// ==================== ACCEPT OFFER LETTER (Employee) ====================
/**
 * Accept offer letter
 * @returns {Promise<Object>} Response with acceptance confirmation
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Acceptance details
 * @returns {Date} response.data.acceptedAt - Acceptance timestamp
 */
const acceptOfferLetter = async () => {
  try {
    const response = await api.post('/offer-letters/accept');
    return response;
  } catch (error) {
    console.error('Accept offer letter error:', error);
    return error.response;
  }
};

// ==================== DOWNLOAD OFFER LETTER (Employee) ====================
/**
 * Download offer letter PDF
 * @returns {Promise<Blob>} PDF file blob for download
 */
const downloadOfferLetter = async () => {
  try {
    const response = await api.get('/offer-letters/download', {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    console.error('Download offer letter error:', error);
    return error.response;
  }
};

// ==================== GET ALL OFFER LETTERS (Employer/Admin) ====================
/**
 * Get all offer letters
 * Employer sees only their company employees
 * Admin sees all employees
 * @returns {Promise<Object>} Response with array of offer letters
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of offer letter records
 * @returns {number} response.count - Total count of records
 */
const getAllOfferLetters = async () => {
  try {
    const response = await api.get('/offer-letters/all');
    return response;
  } catch (error) {
    console.error('Get all offer letters error:', error);
    return error.response;
  }
};

const offerLetterService = {
  uploadOfferLetter,
  getMyOfferLetter,
  acceptOfferLetter,
  downloadOfferLetter,
  getAllOfferLetters,
};

export default offerLetterService;

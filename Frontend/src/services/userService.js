import api from './api';

/**
 * User Service
 * Handles all user-related API calls
 */

// ==================== GET ALL USERS (Admin Only) ====================
/**
 * Get all users - Admin only
 * @returns {Promise<Object>} Response with array of users
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of user objects (excludes password, otp, otpExpiry)
 */
const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response;
  } catch (error) {
    console.error('Get all users error:', error);
    return error.response;
  }
};

// ==================== GET USER BY ID ====================
/**
 * Get user by ID
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Response with user data
 * @returns {boolean} response.success - Operation success status
 * @returns {Object} response.data - User object (excludes password, otp, otpExpiry)
 */
const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response;
  } catch (error) {
    console.error('Get user by ID error:', error);
    return error.response;
  }
};

// ==================== UPDATE USER ====================
/**
 * Update user details
 * @param {string} userId - User UUID
 * @param {Object} data - User data to update
 * @param {string} [data.name] - User's full name
 * @param {string} [data.firstName] - First name
 * @param {string} [data.lastName] - Last name
 * @param {string} [data.fatherName] - Father's name
 * @param {string} [data.dob] - Date of birth (YYYY-MM-DD)
 * @param {string} [data.gender] - Gender
 * @param {string} [data.maritalStatus] - Marital status
 * @param {string} [data.education] - Education qualification
 * @param {string} [data.email] - Email address
 * @param {string} [data.phoneNumber] - Phone number
 * @param {string} [data.altPhoneNumber] - Alternate phone number
 * @param {string} [data.designation] - Job designation
 * @param {string} [data.dateOfJoining] - Date of joining (YYYY-MM-DD)
 * @param {number} [data.salary] - Basic salary
 * @param {string} [data.panCardNumber] - PAN card number
 * @param {string} [data.drivingLicenseNumber] - Driving license number
 * @param {string} [data.aadharNumber] - Aadhar number
 * @returns {Promise<Object>} Response with updated user data
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated user object
 */
const updateUser = async (userId, data) => {
  try {
    const response = await api.put(`/users/${userId}`, data);
    return response;
  } catch (error) {
    console.error('Update user error:', error);
    return error.response;
  }
};

// ==================== DELETE USER (Admin Only) ====================
/**
 * Delete user - Admin only
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Response with success status
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 */
const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response;
  } catch (error) {
    console.error('Delete user error:', error);
    return error.response;
  }
};

// ==================== BULK UPLOAD USERS (Admin Only) ====================
/**
 * Bulk upload users via Excel file - Admin only
 * @param {File} file - Excel file (.xlsx or .xls)
 * @returns {Promise<Object>} Response with upload results
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.results - Upload statistics
 * @returns {number} response.results.success - Number of successful imports
 * @returns {number} response.results.failed - Number of failed imports
 * @returns {Array<string>} response.results.errors - Array of error messages
 */
const bulkUploadUsers = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/users/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Bulk upload error:', error);
    return error.response;
  }
};

// ==================== UPLOAD DOCUMENTS ====================
/**
 * Upload user documents (Aadhar, PAN, Driving License)
 * @param {string} userId - User UUID
 * @param {Object} files - Document files
 * @param {File} [files.aadhar] - Aadhar card file (image or PDF)
 * @param {File} [files.panCard] - PAN card file (image or PDF)
 * @param {File} [files.drivingLicense] - Driving license file (image or PDF)
 * @returns {Promise<Object>} Response with uploaded file paths
 * @returns {boolean} response.success - Operation success status
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Uploaded document paths
 * @returns {string} [response.data.aadharPath] - Aadhar file path
 * @returns {string} [response.data.panCardPath] - PAN card file path
 * @returns {string} [response.data.drivingLicensePath] - Driving license file path
 */
const uploadDocuments = async (userId, files) => {
  try {
    const formData = new FormData();
    
    if (files.aadhar) {
      formData.append('aadhar', files.aadhar);
    }
    if (files.panCard) {
      formData.append('panCard', files.panCard);
    }
    if (files.drivingLicense) {
      formData.append('drivingLicense', files.drivingLicense);
    }
    if (files.educationDoc) {
      formData.append('educationDoc', files.educationDoc);
    }
    if (files.passportPhoto) {
      formData.append('passportPhoto', files.passportPhoto);
    }
    if (files.passbook) {
      formData.append('passbook', files.passbook);
    }
    if (files.cheque) {
      formData.append('cheque', files.cheque);
    }
    
    const response = await api.post(`/users/${userId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Upload documents error:', error);
    return error.response;
  }
};

// ==================== GET MY DOCUMENTS ====================
/**
 * Get current user's documents
 * @returns {Promise<Object>} Response with array of documents
 * @returns {boolean} response.success - Operation success status
 * @returns {Array<Object>} response.data - Array of document objects
 */
const getMyDocuments = async () => {
  try {
    const response = await api.get('/users/my/documents');
    return response;
  } catch (error) {
    console.error('Get my documents error:', error);
    return error.response;
  }
};

// ==================== DOWNLOAD DOCUMENT ====================
/**
 * Download a specific document
 * @param {string} filename - Document filename
 * @returns {Promise<Blob>} Document file
 */
const downloadDocument = async (filename) => {
  try {
    const response = await api.get(`/users/documents/${filename}`, {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    console.error('Download document error:', error);
    return error.response;
  }
};

// ==================== GET PROFILE COMPLETION ====================
/**
 * Get current user's profile completion status
 * @returns {Promise<Object>} Response with profile completion data
 */
const getProfileCompletion = async () => {
  try {
    const response = await api.get('/users/my/profile-completion');
    return response;
  } catch (error) {
    console.error('Get profile completion error:', error);
    return error.response;
  }
};

// ==================== GET MY COMPLETE PROFILE ====================
/**
 * Get complete profile with all related data
 * @returns {Promise<Object>} Response with complete profile data
 */
const getMyCompleteProfile = async () => {
  try {
    const response = await api.get('/users/my/complete-profile');
    return response;
  } catch (error) {
    console.error('Get complete profile error:', error);
    return error.response;
  }
};

// ==================== UPLOAD AVATAR ====================
/**
 * Upload user avatar
 * @param {string} userId - User UUID
 * @param {File} file - Image file
 * @returns {Promise<Object>} Response with avatar URL
 */
const uploadAvatar = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Upload avatar error:', error);
    return error.response;
  }
};

// ==================== DELETE AVATAR ====================
/**
 * Delete user avatar
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Response with success status
 */
const deleteAvatar = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}/avatar`);
    return response;
  } catch (error) {
    console.error('Delete avatar error:', error);
    return error.response;
  }
};



// ==================== DOWNLOAD MY ID CARD ====================
/**
 * Download my ID card
 * @returns {Promise<Blob>} ID card PDF file
 */
const downloadMyIdCard = async () => {
  try {
    const response = await api.get('/users/my/id-card', {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    console.error('Download ID card error:', error);
    return error.response;
  }
};

// ==================== DOWNLOAD MY ESIC CARD ====================
/**
 * Download my ESIC card
 * @returns {Promise<Blob>} ESIC card file
 */
const downloadMyEsicCard = async () => {
  try {
    const response = await api.get('/users/my/esic-card', {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    console.error('Download ESIC card error:', error);
    return error.response;
  }
};

// ==================== GET ALL USER DOCUMENTS (Admin Only) ====================
/**
 * Get all user documents - Admin only
 * @returns {Promise<Object>} Response with array of users and their documents
 */
const getAllUserDocuments = async () => {
  try {
    const response = await api.get('/users/documents/all');
    return response;
  } catch (error) {
    console.error('Get all user documents error:', error);
    return error.response;
  }
};

// ==================== GET EMPLOYER DETAILS (Admin Only) ====================
/**
 * Get employer details with company info - Admin only
 * @param {string} userId - Employer user UUID
 * @returns {Promise<Object>} Response with employer and company data
 */
const getEmployerDetails = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/employer-details`);
    return response;
  } catch (error) {
    console.error('Get employer details error:', error);
    return error.response;
  }
};

// ==================== GET EMPLOYEE DETAILS (Admin Only) ====================
/**
 * Get employee complete profile - Admin only
 * @param {string} userId - Employee user UUID
 * @returns {Promise<Object>} Response with employee complete profile
 */
const getEmployeeDetails = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/employee-details`);
    return response;
  } catch (error) {
    console.error('Get employee details error:', error);
    return error.response;
  }
};

const userService = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkUploadUsers,
  uploadDocuments,
  getMyDocuments,
  downloadDocument,
  getProfileCompletion,
  getMyCompleteProfile,
  uploadAvatar,
  deleteAvatar,
  downloadMyIdCard,
  downloadMyEsicCard,
  getAllUserDocuments,
  getEmployerDetails,
  getEmployeeDetails,
};

export default userService;


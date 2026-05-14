const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/upload');




router.post('/bulk-upload', authMiddleware, upload.single('file'), userController.bulkUploadEmployees); // Admin only

// Upload documents (Aadhar, PAN, Driving License)
router.post('/:id/documents', 
  authMiddleware,
  upload.fields([
    { name: 'aadhar', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'educationDoc', maxCount: 1 },
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'passbook', maxCount: 1 },
    { name: 'cheque', maxCount: 1 }
  ]), 
  userController.uploadDocuments
);

// Avatar management
router.post('/:id/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);
router.delete('/:id/avatar', authMiddleware, userController.deleteAvatar);

// Document management routes
router.get('/my/documents', authMiddleware, userController.getMyDocuments); // Get own documents
router.get('/documents/all', authMiddleware, adminOnly, userController.getAllUserDocuments); // Admin only - get all user documents
router.get('/documents/:filename', authMiddleware, userController.downloadDocument); // Download document

// Profile management routes
router.get('/my/profile-completion', authMiddleware, userController.getProfileCompletion); // Get profile completion status
router.get('/my/complete-profile', authMiddleware, userController.getMyCompleteProfile); // Get complete profile with all data
router.get('/my/id-card', authMiddleware, userController.downloadMyIdCard); // Download ID card
router.get('/my/esic-card', authMiddleware, userController.downloadMyEsicCard); // Download ESIC card


// User CRUD routes (No Create - handled through auth/bulk upload)
router.get('/', authMiddleware, adminOnly, userController.getAllUsers); // Admin only
router.get('/:id', authMiddleware, userController.getUserById); // Anyone can view by ID
router.get('/:id/employer-details', authMiddleware, adminOnly, userController.getEmployerDetails); // Admin only - get employer company details
router.get('/:id/employee-details', authMiddleware, adminOnly, userController.getEmployeeDetails); // Admin only - get employee complete profile
router.put('/:id', authMiddleware, userController.updateUser); // Users can update their own
router.delete('/:id', authMiddleware, adminOnly, userController.deleteUser); // Admin only

module.exports = router;

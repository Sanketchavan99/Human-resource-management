const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/verify-phone', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/set-password', authMiddleware, authController.setPassword);
router.post('/update-password', authMiddleware, authController.updatePassword);
router.post('/create-enquiry', authController.createEnquiry);
router.get('/get-enquiries', authController.getEnquiries);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;

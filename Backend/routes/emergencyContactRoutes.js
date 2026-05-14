const express = require('express');
const router = express.Router();
const emergencyContactController = require('../controllers/emergencyContactController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// Emergency Contact routes
router.post('/', authMiddleware, emergencyContactController.createEmergencyContact);
router.get('/', authMiddleware, adminOnly, emergencyContactController.getAllEmergencyContacts); // Admin only
router.get('/my', authMiddleware, emergencyContactController.getMyEmergencyContact); // Get own emergency contact
router.get('/user/:userId', authMiddleware, adminOnly, emergencyContactController.getEmergencyContactByUserId); // Admin only
router.get('/:id', authMiddleware, emergencyContactController.getEmergencyContactById);
router.put('/:id', authMiddleware, emergencyContactController.updateEmergencyContact);
router.delete('/:id', authMiddleware, emergencyContactController.deleteEmergencyContact);

module.exports = router;

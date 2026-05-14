const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// Address routes
router.post('/', authMiddleware, addressController.createAddress);
router.get('/', authMiddleware, adminOnly, addressController.getAllAddresses); // Admin only
router.get('/my', authMiddleware, addressController.getMyAddresses); // Get own addresses
router.get('/user/:userId', authMiddleware, adminOnly, addressController.getAddressesByUserId); // Admin only
router.get('/:id', authMiddleware, addressController.getAddressById);
router.put('/:id', authMiddleware, addressController.updateAddress);
router.delete('/:id', authMiddleware, addressController.deleteAddress);

module.exports = router;

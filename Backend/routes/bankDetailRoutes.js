const express = require('express');
const router = express.Router();
const bankDetailController = require('../controllers/bankDetailController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// Bank Detail routes
router.post('/', authMiddleware, bankDetailController.createBankDetail);
router.get('/', authMiddleware, adminOnly, bankDetailController.getAllBankDetails); // Admin only
router.post('/my', authMiddleware, bankDetailController.getMyBankDetail); // Get own bank detail
router.get('/user/:userId', authMiddleware, adminOnly, bankDetailController.getBankDetailByUserId); // Admin only
router.get('/:id', authMiddleware, bankDetailController.getBankDetailById);
router.put('/:id', authMiddleware, bankDetailController.updateBankDetail);
router.delete('/:id', authMiddleware, bankDetailController.deleteBankDetail);

module.exports = router;

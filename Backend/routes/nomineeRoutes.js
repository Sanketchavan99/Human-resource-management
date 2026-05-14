const express = require('express');
const router = express.Router();
const nomineeController = require('../controllers/nomineeController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// Nominee routes
router.post('/', authMiddleware, nomineeController.createNominee);
router.get('/', authMiddleware, adminOnly, nomineeController.getAllNominees); // Admin only
router.get('/my', authMiddleware, nomineeController.getMyNominees); // Get own nominee
router.get('/user/:userId', authMiddleware, adminOnly, nomineeController.getNomineesByUserId); // Admin only
router.get('/:id', authMiddleware, nomineeController.getNomineeById);
router.put('/:id', authMiddleware, nomineeController.updateNominee);
router.delete('/:id', authMiddleware, nomineeController.deleteNominee);

module.exports = router;

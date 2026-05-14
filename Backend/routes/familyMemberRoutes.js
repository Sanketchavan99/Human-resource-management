const express = require('express');
const router = express.Router();
const familyMemberController = require('../controllers/familyMemberController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// Family Member routes
router.post('/', authMiddleware, familyMemberController.createFamilyMember);
router.get('/', authMiddleware, adminOnly, familyMemberController.getAllFamilyMembers); // Admin only
router.get('/my', authMiddleware, familyMemberController.getMyFamilyMembers); // Get own family members
router.get('/user/:userId', authMiddleware, adminOnly, familyMemberController.getFamilyMembersByUserId); // Admin only
router.get('/:id', authMiddleware, familyMemberController.getFamilyMemberById);
router.put('/:id', authMiddleware, familyMemberController.updateFamilyMember);
router.delete('/:id', authMiddleware, familyMemberController.deleteFamilyMember);

module.exports = router;

const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// Center routes - Admin only
router.post('/', authMiddleware, adminOnly, centerController.createCenter);
router.get('/', authMiddleware, centerController.getAllCenters); // Anyone can view
router.get('/:id', authMiddleware, centerController.getCenterById); // Anyone can view
router.put('/:id', authMiddleware, adminOnly, centerController.updateCenter);
router.delete('/:id', authMiddleware, adminOnly, centerController.deleteCenter);

module.exports = router;

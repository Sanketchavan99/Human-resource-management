const express = require("express");
const router = express.Router();
const offerLetterController = require("../controllers/offerLetterController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

// Middleware to check if user is employer or admin
const employerOrAdminMiddleware = (req, res, next) => {
  if (req.user.role === 'employer' || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Employer or Admin role required.'
    });
  }
};

// Middleware to check if user is employee
const employeeMiddleware = (req, res, next) => {
  if (req.user.role === 'employee') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Employee role required.'
    });
  }
};

// Employee routes
router.get("/my", authMiddleware, employeeMiddleware, offerLetterController.getMyOfferLetter);
router.post("/accept", authMiddleware, employeeMiddleware, offerLetterController.acceptOfferLetter);
router.get("/download", authMiddleware, employeeMiddleware, offerLetterController.downloadOfferLetter);

// Employer/Admin routes
router.post("/upload/:userId", authMiddleware, employerOrAdminMiddleware, upload.single('file'), offerLetterController.uploadOfferLetter);
router.get("/all", authMiddleware, employerOrAdminMiddleware, offerLetterController.getAllOfferLetters);

module.exports = router;

const express = require("express");
const router = express.Router();
const payslipDocumentController = require("../controllers/payslipDocumentController");
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
router.get("/my", authMiddleware, employeeMiddleware, payslipDocumentController.getMyPayslipDocuments);

// Download route (accessible by both employees and employers/admins)
router.get("/:id/download", authMiddleware, payslipDocumentController.downloadPayslipDocument);

// Employer/Admin routes
router.post("/single-upload", authMiddleware, employerOrAdminMiddleware, upload.single('file'), payslipDocumentController.uploadSinglePayslip);
router.post("/bulk-upload", authMiddleware, employerOrAdminMiddleware, upload.array('files', 100), payslipDocumentController.uploadBulkPayslips);
router.get("/", authMiddleware, employerOrAdminMiddleware, payslipDocumentController.getAllPayslipDocuments);
router.delete("/:id", authMiddleware, employerOrAdminMiddleware, payslipDocumentController.deletePayslipDocument);

module.exports = router;

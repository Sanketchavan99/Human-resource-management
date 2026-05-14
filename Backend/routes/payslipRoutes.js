const express = require("express");
const router = express.Router();
const payslipController = require("../controllers/payslipController");
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
router.get("/my", authMiddleware, employeeMiddleware, payslipController.getMyPayslips);
router.get("/current-available", authMiddleware, employeeMiddleware, payslipController.checkCurrentMonthAvailability);
router.get("/:id/download", authMiddleware, payslipController.downloadPayslipPDF);

// Employer/Admin routes
router.post("/upload", authMiddleware, employerOrAdminMiddleware, upload.single('file'), payslipController.uploadPayslipExcel);
router.post("/:id/generate-pdf", authMiddleware, employerOrAdminMiddleware, payslipController.generatePayslipPDF);
router.get("/", authMiddleware, employerOrAdminMiddleware, payslipController.getAllPayslips);
router.delete("/:id", authMiddleware, employerOrAdminMiddleware, payslipController.deletePayslip);

module.exports = router;

const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');
const employerOnly = require('../middlewares/employerMiddleware');
const upload = require('../middlewares/upload');

// Company routes - Admin only
router.post('/', authMiddleware, adminOnly, companyController.createCompany);
router.get('/', authMiddleware, companyController.getAllCompanies); // Anyone can view
router.get('/logo', authMiddleware, companyController.getMyCompanyLogo); // Anyone can view
router.get('/:id', authMiddleware, companyController.getCompanyById); // Anyone can view
router.put('/:id', authMiddleware, adminOnly, companyController.updateCompany);
router.delete('/:id', authMiddleware, adminOnly, companyController.deleteCompany);

// Employer-specific routes
router.get('/my/dashboard', authMiddleware, employerOnly, companyController.getMyCompanyDashboard);
router.get('/my/employees', authMiddleware, employerOnly, companyController.getMyCompanyEmployees);
router.get('/my/employees/:employeeId/profile', authMiddleware, employerOnly, companyController.getEmployeeCompleteProfile);
router.post('/my/employees/:employeeId/generate-id-card', authMiddleware, employerOnly, companyController.generateEmployeeIdCard);
router.post('/my/employees/:employeeId/esic-card', authMiddleware, employerOnly, upload.single('esicCard'), companyController.uploadEmployeeEsicCard);
router.post('/my/logo', authMiddleware, employerOnly, upload.single('logo'), companyController.uploadCompanyLogo);
router.get('/my/employees/export', authMiddleware, employerOnly, companyController.exportEmployeesToExcel);

module.exports = router;


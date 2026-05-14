const { Company, User, Address, BankDetail, EmergencyContact, FamilyMember, Nominee } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');


const generateCompanyCode = (companyName) => {
  if (!companyName) return "";

  // 1. Remove confusing characters
  const confusingChars = /[IiLl1Oo0Ss5Bb8]/g;
  let clean = companyName.replace(confusingChars, "");

  // 2. Keep only alphabets
  clean = clean.replace(/[^a-zA-Z]/g, "");

  // 3. Uppercase
  clean = clean.toUpperCase();

  // 4. Pick first 3 letters (fallback to XXX)
  let letters = clean.substring(0, 3) || "XXX";

  // 5. Generate 3 random digits
  const numbers = Math.floor(100 + Math.random() * 900); // Always 3 digits

  return `${letters}${numbers}`;
};




exports.createCompany = async (req, res) => {
  const transaction = await sequelize.transaction(); // start transaction

  try {
    console.log(req.body);
    const { email, companyName, phoneNumber, name } = req.body;

    let code = generateCompanyCode(companyName);

    let duplicateCode = await User.findOne({ where: { empCode:code } });
    while (duplicateCode) {
      code = generateCompanyCode(companyName);
      duplicateCode = await User.findOne({ where: { empCode:code } });
    }
    // Create user
    const user = await User.create(
      {
        email,
        phoneNumber,
        name,
        role: "employer",
        empCode:code, 
      },
      { transaction }
    );

    // Create company
    const company = await Company.create(
      {
        userId: user.id,
        name: companyName,
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Company created successfully",
      user,
      company,
    });
  } catch (err) {
    // Rollback transaction
    await transaction.rollback();
    console.error(err);

    return res.status(500).json({
      success: false,
      error: "Failed to create company",
      details: err.message,
    });
  }
};


// Get all Companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({ order: [['createdAt', 'DESC']], include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'empCode'] }] });
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching companies', error: error.message });
  }
};


//Get My Company
exports.getMyCompanyLogo = async (req, res) => {
  try {
    let company = await Company.findOne({ where: { userId: req.user.id } });
    if(!company){
      company = await Company.findByPk(req.user.companyId);
    }
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    res.status(200).json({ success: true, logoPath: company.logoPath });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching company', error: error.message });
  }
};

// Get Company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findByPk(id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching company', error: error.message });
  }
};
// Update Company
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // If updating code, check if new code already exists
    if (code && code !== company.code) {
      const existingCompany = await Company.findOne({ where: { code } });
      if (existingCompany) {
        return res.status(400).json({ success: false, message: 'Company with this code already exists' });
      }
    }

    await company.update({ code: code || company.code, name: name || company.name });
    res.status(200).json({ success: true, message: 'Company updated successfully', data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating company', error: error.message });
  }
};

// Delete Company
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findByPk(id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    await company.destroy();
    res.status(200).json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting company', error: error.message });
  }
};

// ==================== EMPLOYER-SPECIFIC ENDPOINTS ====================

// Get My Company Dashboard (Employer Only)
exports.getMyCompanyDashboard = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const userId = req.user.id;
    
    // Find company owned by this employer
    const company = await Company.findOne({ 
      where: { userId },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'empCode']
      }]
    });

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'No company found for this employer' 
      });
    }

    // Get total employee count for this company
    const totalEmployees = await User.count({
      where: { 
        companyId: company.id,
        role: 'employee' // Only count employees, not the employer
      }
    });

    // Get recent employees (last 5 joined)
    const recentEmployees = await User.findAll({
      where: { 
        companyId: company.id,
        role: 'employee'
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'firstName', 'lastName', 'empCode', 'designation', 'dateOfJoining', 'email', 'phoneNumber', 'createdAt']
    });

    // Calculate active employees (those without lastWorkingDate or future lastWorkingDate)
    const activeEmployees = await User.count({
      where: {
        companyId: company.id,
        role: 'employee',
        [Op.or]: [
          { lastWorkingDate: null },
          { lastWorkingDate: { [Op.gt]: new Date() } }
        ]
      }
    });

    res.status(200).json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.name,
          logoPath: company.logoPath,
          createdAt: company.createdAt,
          owner: company.owner
        },
        stats: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees: totalEmployees - activeEmployees
        },
        recentEmployees
      }
    });
  } catch (error) {
    console.error('Get my company dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching company dashboard', 
      error: error.message 
    });
  }
};

// Get My Company Employees (Employer Only)
exports.getMyCompanyEmployees = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, page = 1, limit = 50 } = req.query;

    // Find company owned by this employer
    const company = await Company.findOne({ where: { userId } });

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'No company found for this employer' 
      });
    }

    // Build where clause
    const whereClause = {
      companyId: company.id,
      role: 'employee'
    };

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { empCode: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { designation: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch employees with pagination
    const { count, rows: employees } = await User.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id', 'empCode', 'name', 'firstName', 'lastName', 'email', 
        'phoneNumber', 'designation', 'dateOfJoining', 'lastWorkingDate',
        'salary', 'gender', 'maritalStatus', 'dob', 'createdAt', 'updatedAt',
        'idCardPath', 'idCardGeneratedAt', 'esicCardPath', 'esicUploadedAt', 'offerLetterPath', 'offerLetterUploadedAt',
        'offerLetterAccepted', 'offerLetterAcceptedAt'
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        employees,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my company employees error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching company employees', 
      error: error.message 
    });
  }
};

// Get Employee Complete Profile (Employer Only)
exports.getEmployeeCompleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { employeeId } = req.params;

    // Find company owned by this employer
    const company = await Company.findOne({ where: { userId } });

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'No company found for this employer' 
      });
    }

    // Find employee and verify they belong to this company
    const employee = await User.findOne({
      where: { 
        id: employeeId,
        companyId: company.id,
        role: 'employee'
      },
      include: [
        { model: Address, as: 'addresses' },
        { model: BankDetail, as: 'bankDetail' },
        { model: EmergencyContact, as: 'emergencyContact' },
        { model: FamilyMember, as: 'familyMembers' },
        { model: Nominee, as: 'nominees' }
      ]
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found or does not belong to your company' 
      });
    }

    // Get document paths
    const documents = [];
    if (employee.aadharPath) documents.push({ type: 'aadhar', filename: path.basename(employee.aadharPath) });
    if (employee.panCardPath) documents.push({ type: 'panCard', filename: path.basename(employee.panCardPath) });
    if (employee.drivingLicensePath) documents.push({ type: 'drivingLicense', filename: path.basename(employee.drivingLicensePath) });
    if (employee.educationDocPath) documents.push({ type: 'educationDoc', filename: path.basename(employee.educationDocPath) });
    if (employee.passportPhotoPath) documents.push({ type: 'passportPhoto', filename: path.basename(employee.passportPhotoPath) });
    if (employee.passbookPath) documents.push({ type: 'passbook', filename: path.basename(employee.passbookPath) });
    if (employee.chequePath) documents.push({ type: 'cheque', filename: path.basename(employee.chequePath) });

    res.status(200).json({
      success: true,
      data: {
        user: employee,
        documents
      }
    });
  } catch (error) {
    console.error('Get employee complete profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching employee profile', 
      error: error.message 
    });
  }
};

// Generate Employee ID Card (Employer Only)
exports.generateEmployeeIdCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { employeeId } = req.params;

    // Find company owned by this employer
    const company = await Company.findOne({ where: { userId } });

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'No company found for this employer' 
      });
    }

    // Find employee and verify they belong to this company
    const employee = await User.findOne({
      where: { 
        id: employeeId,
        companyId: company.id,
        role: 'employee'
      }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found or does not belong to your company' 
      });
    }

    // Import Puppeteer and ID card template
    const puppeteer = require('puppeteer');
    const { generateIdCardHTML } = require('../utils/idCardTemplate');
    
    // Create uploads directory
    const uploadsDir = path.join(__dirname, '../uploads/id-cards');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `id-card-${employee.empCode}-${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);

    // Generate HTML content
    const htmlContent = generateIdCardHTML(employee, company, req.protocol, req.get('host'));

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set content and wait for images to load
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0' 
    });

    // Generate PDF
    await page.pdf({
      path: filepath,
      width: '350px',
      height: '550px',
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });

    await browser.close();

    // Update employee record
    await employee.update({
      idCardPath: `uploads/id-cards/${filename}`,
      idCardGeneratedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'ID card generated successfully',
      data: {
        idCardPath: `uploads/id-cards/${filename}`,
        idCardGeneratedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Generate employee ID card error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating ID card', 
      error: error.message 
    });
  }
};

// Upload Employee ESIC Card (Employer Only)
exports.uploadEmployeeEsicCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { employeeId } = req.params;

    // Find company owned by this employer
    const company = await Company.findOne({ where: { userId } });

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'No company found for this employer' 
      });
    }

    // Find employee and verify they belong to this company
    const employee = await User.findOne({
      where: { 
        id: employeeId,
        companyId: company.id,
        role: 'employee'
      }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found or does not belong to your company' 
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Update employee ESIC card path
    await employee.update({
      esicCardPath: req.file.path,
      esicUploadedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'ESIC card uploaded successfully',
      data: {
        esicCardPath: req.file.path,
        esicUploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Upload employee ESIC card error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading ESIC card', 
      error: error.message 
    });
  }
};

// Upload Company Logo (Employer Only)
exports.uploadCompanyLogo = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find company owned by this employer
    const company = await Company.findOne({ where: { userId } });

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'No company found for this employer' 
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Update company logo path
    const logoPath = req.file.path;
    await company.update({ logoPath });

    res.status(200).json({
      success: true,
      message: 'Company logo uploaded successfully',
      data: {
        logoPath: company.logoPath
      }
    });
  } catch (error) {
    console.error('Upload company logo error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading company logo', 
      error: error.message 
    });
  }
};

// Export Company Employees to Excel (Employer Only)
exports.exportEmployeesToExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const XLSX = require('xlsx');

    // Find company owned by this employer
    const company = await Company.findOne({ where: { userId } });

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'No company found for this employer' 
      });
    }

    // Fetch all employees for this company
    const employees = await User.findAll({
      where: { 
        companyId: company.id,
        role: 'employee'
      },
      order: [['empCode', 'ASC']],
      attributes: [
        'empCode', 'name', 'firstName', 'lastName', 'email', 
        'phoneNumber', 'designation', 'dateOfJoining', 'lastWorkingDate',
        'salary', 'gender', 'maritalStatus', 'dob', 'education',
        'panCardNumber', 'aadharNumber', 'uanNumber', 'esicNumber'
      ]
    });

    // Prepare data for Excel
    const excelData = employees.map(emp => ({
      'Employee Code': emp.empCode || '',
      'Name': emp.name || '',
      'First Name': emp.firstName || '',
      'Last Name': emp.lastName || '',
      'Email': emp.email || '',
      'Phone Number': emp.phoneNumber || '',
      'Designation': emp.designation || '',
      'Date of Joining': emp.dateOfJoining || '',
      'Last Working Date': emp.lastWorkingDate || '',
      'Salary': emp.salary || '',
      'Gender': emp.gender || '',
      'Marital Status': emp.maritalStatus || '',
      'Date of Birth': emp.dob || '',
      'Education': emp.education || '',
      'PAN Card': emp.panCardNumber || '',
      'Aadhar Number': emp.aadharNumber || '',
      'UAN Number': emp.uanNumber || '',
      'ESIC Number': emp.esicNumber || ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=employees_${company.name.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);

    // Send the file
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export employees to Excel error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error exporting employees to Excel', 
      error: error.message 
    });
  }
};

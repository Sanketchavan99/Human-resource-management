const XLSX = require('xlsx');
const { User, Center, Company } = require('../models/index');
const fs = require('fs');
const { Op } = require('sequelize');
const {PDFParse} = require('pdf-parse');

exports.bulkUploadEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    const company = await Company.findOne({ where: { userId: req.user.id } });

    for (const row of data) {
      try {
        // Map Excel columns to DB fields
        // Assuming headers match what we saw earlier or close to it.
        // We need to be careful with exact header names.
        // Based on previous analysis:
        // 'Emp Code', 'Client Emp Name', 'Mobile No.', 'Designation', 'D.O.J', 'Basic Salary', 'Location', 'City', 'State'
        
        const empCode = row['Emp Code'];
        if (!empCode) continue; // Skip empty rows

        // Find or Create Center
        let center = null;
        if (row['Location']) {
          center = await Center.findOne({ where: { name: row['Location'] } });
          if (!center) {
            center = await Center.create({
              name: row['Location'],
              city: row['City'] || row['Location'], // Fallback
              state: row['State'],
              zone: row['Zone'] // Assuming Zone column exists or is optional
            });
          }
        }

        // Create User
        // Check if user exists
        let user = await User.findOne({ where: { empCode } });
        if (user) {
          results.failed++;
          results.errors.push(`User ${empCode} already exists`);
          continue;
        }

        await User.create({
          empCode: String(empCode),
          name: row['Client Emp Name'],
          phoneNumber: String(row['Mobile No.']),
          designation: row['Designation'],
          dateOfJoining: row['D.O.J'], // Ensure date format is compatible or parse it
          salary: row['Basic Salary'],
          centerId: center ? center.id : null,
          centerName: row['Location'],
          centerCity: row['City'],
          centerState: row['State'],
          role: 'employee',
          companyId: company.id,
          // Add other fields as needed
        });

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Error processing row for ${row['Emp Code']}: ${err.message}`);
      }
    }

    // Cleanup temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ 
      success: true,
      message: 'Bulk upload processed', 
      results 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing bulk upload', error: error.message });
  }
};

// Get all Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      order: [['createdAt', 'DESC']],
      where: {
        role: {
          [Op.ne]: 'admin'
        }
      },
      attributes: { exclude: ['password', 'phoneOtpHash', 'phoneOtpExpires', 'lastLogin'] } // Exclude sensitive fields
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'otp', 'otpExpiry'] } // Exclude sensitive fields
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    console.log(updateData);

    // Remove fields that should not be updated through this endpoint
    delete updateData.password;
    delete updateData.otp;
    delete updateData.otpExpiry;
    delete updateData.role;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If updating empCode, check if new empCode already exists
    if (updateData.empCode && updateData.empCode !== user.empCode) {
      const existingUser = await User.findOne({ where: { empCode: updateData.empCode } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this employee code already exists' });
      }
    }

    // If updating phoneNumber, check if new phoneNumber already exists
    if (updateData.phoneNumber && updateData.phoneNumber !== user.phoneNumber) {
      const existingUser = await User.findOne({ where: { phoneNumber: updateData.phoneNumber } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this phone number already exists' });
      }
    }

    await user.update(updateData);
    
    // Return user without sensitive fields
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password', 'otp', 'otpExpiry'] }
    });

    res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deletion of admin users
    if (user.role === 'Admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
  }
};

// Upload Documents (Aadhar, PAN, Driving License)
exports.uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check authorization: User can only upload their own documents unless admin
    if (req.user.role !== 'Admin' && user.id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only upload your own documents.' 
      });
    }

    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Update file paths for uploaded documents
    const updateData = {};
    
    if (req.files.aadhar) {
      updateData.aadharPath = req.files.aadhar[0].path;
      const parser = new PDFParse({url: req.files.aadhar[0].path});
      console.log(await parser.getText());
    }
    
    if (req.files.panCard) {
      updateData.panCardPath = req.files.panCard[0].path;
    }
    
    if (req.files.drivingLicense) {
      updateData.drivingLicensePath = req.files.drivingLicense[0].path;
    }
    
    if (req.files.educationDoc) {
      updateData.educationDocPath = req.files.educationDoc[0].path;
    }
    
    if (req.files.passportPhoto) {
      updateData.passportPhotoPath = req.files.passportPhoto[0].path;
    }
    
    if (req.files.passbook) {
      updateData.passbookPath = req.files.passbook[0].path;
    }
    
    if (req.files.cheque) {
      updateData.chequePath = req.files.cheque[0].path;
    }

    

    // Update user with new document paths
    await user.update(updateData);

    res.status(200).json({ 
      success: true, 
      message: 'Documents uploaded successfully', 
      data: {
        aadharPath: user.aadharPath,
        panCardPath: user.panCardPath,
        drivingLicensePath: user.drivingLicensePath,
        educationDocPath: user.educationDocPath,
        passportPhotoPath: user.passportPhotoPath,
        passbookPath: user.passbookPath,
        chequePath: user.chequePath
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading documents', error: error.message });
  }
};

// Get My Documents
exports.getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    
    const user = await User.findByPk(userId, {
      attributes: ['aadharPath', 'panCardPath', 'drivingLicensePath', 'educationDocPath', 'passportPhotoPath', 'passbookPath', 'chequePath']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const documents = [];
    
    if (user.aadharPath) {
      documents.push({
        type: 'aadhar',
        filename: user.aadharPath.split('\\').pop(),
        path: user.aadharPath
      });
    }
    
    if (user.panCardPath) {
      documents.push({
        type: 'panCard',
        filename: user.panCardPath.split('\\').pop(),
        path: user.panCardPath
      });
    }
    
    if (user.drivingLicensePath) {
      documents.push({
        type: 'drivingLicense',
        filename: user.drivingLicensePath.split('\\').pop(),
        path: user.drivingLicensePath
      });
    }

    if (user.educationDocPath) {
      documents.push({
        type: 'educationDoc',
        filename: user.educationDocPath.split('\\').pop(),
        path: user.educationDocPath
      });
    }

    if (user.passportPhotoPath) {
      documents.push({
        type: 'passportPhoto',
        filename: user.passportPhotoPath.split('\\').pop(),
        path: user.passportPhotoPath
      });
    }

    if (user.passbookPath) {
      documents.push({
        type: 'passbook',
        filename: user.passbookPath.split('\\').pop(),
        path: user.passbookPath
      });
    }

    if (user.chequePath) {
      documents.push({
        type: 'cheque',
        filename: user.chequePath.split('\\').pop(),
        path: user.chequePath
      });
    }

    res.status(200).json({ 
      success: true, 
      data: documents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching documents', error: error.message });
  }
};

// Download Document
exports.downloadDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    // Get user's document paths
    const user = await User.findByPk(userId, {
      attributes: ['aadharPath', 'panCardPath', 'drivingLicensePath', 'educationDocPath', 'passportPhotoPath', 'passbookPath', 'chequePath']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the requested file belongs to the user
    const filePath = [
      user.aadharPath, 
      user.panCardPath, 
      user.drivingLicensePath,
      user.educationDocPath,
      user.passportPhotoPath,
      user.passbookPath,
      user.chequePath
    ]
      .find(path => path && path.includes(filename));

    if (!filePath) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    // Send the file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ success: false, message: 'Error downloading file' });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error downloading document', error: error.message });
  }
};

// Get Profile Completion Status
exports.getProfileCompletion = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const profileCompletionService = require('../services/profileCompletionService');
    
    const result = await profileCompletionService.calculateProfileCompletion(userId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting profile completion', error: error.message });
  }
};

// Get My Complete Profile (with all relations)
exports.getMyCompleteProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const { Address, BankDetail, EmergencyContact, FamilyMember, Nominee } = require('../models');
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'otp', 'otpExpiry'] },
      include: [
        { model: Address, as: 'addresses' },
        { model: BankDetail, as: 'bankDetail' },
        { model: EmergencyContact, as: 'emergencyContact' },
        { model: FamilyMember, as: 'familyMembers' },
        { model: Nominee, as: 'nominees' },
        { model: Company, as: 'company', attributes: ['id', 'name'] }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get profile completion
    const profileCompletionService = require('../services/profileCompletionService');
    const completionResult = await profileCompletionService.calculateProfileCompletion(userId);

    // Prepare documents info
    const documents = [];
    if (user.aadharPath) documents.push({ type: 'aadhar', filename: user.aadharPath.split('\\').pop(), path: user.aadharPath });
    if (user.panCardPath) documents.push({ type: 'panCard', filename: user.panCardPath.split('\\').pop(), path: user.panCardPath });
    if (user.drivingLicensePath) documents.push({ type: 'drivingLicense', filename: user.drivingLicensePath.split('\\').pop(), path: user.drivingLicensePath });
    if (user.educationDocPath) documents.push({ type: 'educationDoc', filename: user.educationDocPath.split('\\').pop(), path: user.educationDocPath });
    if (user.passportPhotoPath) documents.push({ type: 'passportPhoto', filename: user.passportPhotoPath.split('\\').pop(), path: user.passportPhotoPath });
    if (user.passbookPath) documents.push({ type: 'passbook', filename: user.passbookPath.split('\\').pop(), path: user.passbookPath });
    if (user.chequePath) documents.push({ type: 'cheque', filename: user.chequePath.split('\\').pop(), path: user.chequePath });

    const response = {
      success: true,
      data: {
        user: user.toJSON(),
        documents,
        profileCompletion: completionResult.success ? completionResult.data : null
      }
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching complete profile', error: error.message });
  }
};

// Upload Avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role !== 'Admin' && user.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No avatar file uploaded' });
    }

    // Delete old avatar if exists
    if (user.avatarUrl && fs.existsSync(user.avatarUrl)) {
      try {
        fs.unlinkSync(user.avatarUrl);
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    // Update user with new avatar path
    // Assuming we store the full path or relative path. 
    // Since other docs store path, we'll store path.
    // Ideally we should return a URL accessible from frontend.
    // For now, storing path as per other docs.
    await user.update({ avatarUrl: req.file.path });

    res.status(200).json({ 
      success: true, 
      message: 'Avatar uploaded successfully', 
      data: { avatarUrl: req.file.path } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading avatar', error: error.message });
  }
};

// Delete Avatar
exports.deleteAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role !== 'Admin' && user.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (user.avatarUrl) {
      if (fs.existsSync(user.avatarUrl)) {
        try {
          fs.unlinkSync(user.avatarUrl);
        } catch (err) {
          console.error('Error deleting avatar file:', err);
        }
      }
      await user.update({ avatarUrl: null });
    }

    res.status(200).json({ success: true, message: 'Avatar deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting avatar', error: error.message });
  }
};


// Download My ID Card (Employee)
exports.downloadMyIdCard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.idCardPath) {
      return res.status(404).json({ success: false, message: 'ID card not generated yet' });
    }

    // Check if file exists
    if (!fs.existsSync(user.idCardPath)) {
      return res.status(404).json({ success: false, message: 'ID card file not found on server' });
    }

    // Send file for download
    res.download(user.idCardPath, `ID-Card-${user.empCode}.pdf`, (err) => {
      if (err) {
        console.error('Error downloading ID card:', err);
        res.status(500).json({ success: false, message: 'Error downloading ID card' });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error downloading ID card', error: error.message });
  }
};

// Download My ESIC Card (Employee)
exports.downloadMyEsicCard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.esicCardPath) {
      return res.status(404).json({ success: false, message: 'ESIC card not uploaded yet' });
    }

    // Check if file exists
    if (!fs.existsSync(user.esicCardPath)) {
      return res.status(404).json({ success: false, message: 'ESIC card file not found on server' });
    }

    // Get file extension
    const ext = user.esicCardPath.split('.').pop();
    const filename = `ESIC-Card-${user.empCode}.${ext}`;

    // Send file for download
    res.download(user.esicCardPath, filename, (err) => {
      if (err) {
        console.error('Error downloading ESIC card:', err);
        res.status(500).json({ success: false, message: 'Error downloading ESIC card' });
      }
    });
  } catch (error) {
  }
};

// Get All User Documents (Admin Only)
exports.getAllUserDocuments = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        role: 'employee'
      },
      attributes: [
        'id', 'empCode', 'name', 'email', 'role', 'companyId', 'designation',
        'idCardPath', 'idCardGeneratedAt',
        'esicCardPath', 'esicUploadedAt',
        'offerLetterPath', 'offerLetterUploadedAt', 'offerLetterAccepted', 'offerLetterAcceptedAt',
        'aadharPath', 'panCardPath', 'drivingLicensePath', 
        'educationDocPath', 'passportPhotoPath', 'passbookPath', 'chequePath'
      ],
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Get all user documents error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user documents', 
      error: error.message 
    });
  }
};

// Get Employer Details (Admin Only)
exports.getEmployerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user and verify they are an employer
    const user = await User.findOne({
      where: {
        id,
        role: 'employer'
      },
      attributes: ['id', 'name', 'email', 'empCode', 'phoneNumber', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employer not found' 
      });
    }

    // Find company owned by this employer
    const company = await Company.findOne({
      where: { userId: id },
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

    // Get employee statistics
    const totalEmployees = await User.count({
      where: { 
        companyId: company.id,
        role: 'employee'
      }
    });

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

    // Get recent employees
    const recentEmployees = await User.findAll({
      where: { 
        companyId: company.id,
        role: 'employee'
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'empCode', 'designation', 'dateOfJoining', 'createdAt']
    });




    // Prepare documents info
    const documents = [];
    if (user.aadharPath) documents.push({ type: 'aadhar', filename: require('path').basename(user.aadharPath), path: user.aadharPath, uploadedAt: user.updatedAt });
    if (user.panCardPath) documents.push({ type: 'panCard', filename: require('path').basename(user.panCardPath), path: user.panCardPath, uploadedAt: user.updatedAt });
    if (user.drivingLicensePath) documents.push({ type: 'drivingLicense', filename: require('path').basename(user.drivingLicensePath), path: user.drivingLicensePath, uploadedAt: user.updatedAt });
    if (user.passportPhotoPath) documents.push({ type: 'passportPhoto', filename: require('path').basename(user.passportPhotoPath), path: user.passportPhotoPath, uploadedAt: user.updatedAt });

    res.status(200).json({
      success: true,
      data: {
        user,
        company: {
          id: company.id,
          name: company.name,
          code: company.code,
          logoPath: company.logoPath,
          createdAt: company.createdAt,
          owner: company.owner
        },
        stats: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees: totalEmployees - activeEmployees
        },
        recentEmployees,
        documents
      }
    });
  } catch (error) {
    console.error('Get employer details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching employer details', 
      error: error.message 
    });
  }
};


// Get Employee Details (Admin Only)
exports.getEmployeeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { Address, BankDetail, EmergencyContact, FamilyMember, Nominee } = require('../models');
    const path = require('path');

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'otp', 'otpExpiry'] },
      include: [
        { model: Address, as: 'addresses' },
        { model: BankDetail, as: 'bankDetail' },
        { model: EmergencyContact, as: 'emergencyContact' },
        { model: FamilyMember, as: 'familyMembers' },
        { model: Nominee, as: 'nominees' },
        { model: Company, as: 'company', attributes: ['id', 'name'] }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get profile completion
    const profileCompletionService = require('../services/profileCompletionService');
    const completionResult = await profileCompletionService.calculateProfileCompletion(id);

    // Prepare documents info
    const documents = [];
    if (user.aadharPath) documents.push({ name: 'Aadhar', filename: path.basename(user.aadharPath), path: user.aadharPath,  });
    if (user.panCardPath) documents.push({ name: 'Pan Card', filename: path.basename(user.panCardPath), path: user.panCardPath, });
    if (user.drivingLicensePath) documents.push({ name: 'Driving License', filename: path.basename(user.drivingLicensePath), path: user.drivingLicensePath, });
    if (user.educationDocPath) documents.push({ name: 'Education Document', filename: path.basename(user.educationDocPath), path: user.educationDocPath, });
    if (user.passportPhotoPath) documents.push({ name: 'Passport Photo', filename: path.basename(user.passportPhotoPath), path: user.passportPhotoPath, });
    if (user.passbookPath) documents.push({ name: 'Passbook', filename: path.basename(user.passbookPath), path: user.passbookPath, });
    if (user.chequePath) documents.push({ name: 'Cheque', filename: path.basename(user.chequePath), path: user.chequePath, });
    
    // Add specific docs with their specific timestamps
    if (user.idCardPath) documents.push({ name: 'ID Card', filename: path.basename(user.idCardPath), path: user.idCardPath, uploadedAt: user.idCardGeneratedAt });
    if (user.esicCardPath) documents.push({ name: 'ESIC Card', filename: path.basename(user.esicCardPath), path: user.esicCardPath, uploadedAt: user.esicUploadedAt });
    if (user.offerLetterPath) documents.push({ name: 'Offer Letter', filename: path.basename(user.offerLetterPath), path: user.offerLetterPath, uploadedAt: user.offerLetterUploadedAt });

    const response = {
      success: true,
      data: {
        user: user.toJSON(),
        documents,
        profileCompletion: completionResult.success ? completionResult.data : null
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get employee details error:', error);
    res.status(500).json({ success: false, message: 'Error fetching employee details', error: error.message });
  }
};

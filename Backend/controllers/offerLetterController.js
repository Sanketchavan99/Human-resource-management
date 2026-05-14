const { User, Company } = require('../models/index');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// Upload Offer Letter (Employer/Admin only)
exports.uploadOfferLetter = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Validate file type (PDF only)
    if (req.file.mimetype !== 'application/pdf') {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        message: 'Only PDF files are allowed' 
      });
    }

    // Find the employee
    const employee = await User.findByPk(userId);
    if (!employee) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Check authorization
    // Employer can only upload for their company employees
    if (req.user.role === 'employer') {
      const company = await Company.findOne({ where: { userId: req.user.id } });
      if (!company || employee.companyId !== company.id) {
        // Delete uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You can only upload offer letters for your company employees.' 
        });
      }
    }

    // Delete old offer letter if exists
    if (employee.offerLetterPath && fs.existsSync(employee.offerLetterPath)) {
      try {
        fs.unlinkSync(employee.offerLetterPath);
      } catch (err) {
        console.error('Error deleting old offer letter:', err);
      }
    }

    // Update employee with new offer letter
    await employee.update({
      offerLetterPath: req.file.path,
      offerLetterUploadedAt: new Date(),
      offerLetterAccepted: false, // Reset acceptance status
      offerLetterAcceptedAt: null
    });

    // Send email notification if employee has email
    const { sendOfferLetterNotification } = require('../services/emailService');
    let emailSent = false;
    let emailError = null;
    
    if (employee.email) {
      try {
        // Get company details for email
        let companyDetails = null;
        if (req.user.role === 'employer') {
          companyDetails = await Company.findOne({ where: { userId: req.user.id } });
        } else if (employee.companyId) {
          companyDetails = await Company.findByPk(employee.companyId);
        }
        
        const emailResult = await sendOfferLetterNotification(employee, companyDetails, req.file.path);
        emailSent = emailResult.success;
        if (!emailResult.success) {
          emailError = emailResult.error;
        }
      } catch (error) {
        console.error('Error sending email notification:', error);
        emailError = error.message;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Offer letter uploaded successfully',
      data: {
        employeeId: employee.id,
        employeeName: employee.name,
        uploadedAt: employee.offerLetterUploadedAt,
        emailSent: emailSent,
        emailError: emailError
      }
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading offer letter', 
      error: error.message 
    });
  }
};

// Get My Offer Letter (Employee only)
exports.getMyOfferLetter = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 
        'name', 
        'empCode', 
        'offerLetterPath', 
        'offerLetterUploadedAt', 
        'offerLetterAccepted', 
        'offerLetterAcceptedAt'
      ]
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.offerLetterPath) {
      return res.status(404).json({ 
        success: false, 
        message: 'No offer letter available' 
      });
    }

    // Get filename from path
    const filename = path.basename(user.offerLetterPath);

    res.status(200).json({ 
      success: true, 
      data: {
        id: user.id,
        name: user.name,
        empCode: user.empCode,
        filename: filename,
        uploadedAt: user.offerLetterUploadedAt,
        accepted: user.offerLetterAccepted,
        acceptedAt: user.offerLetterAcceptedAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching offer letter', 
      error: error.message 
    });
  }
};

// Accept Offer Letter (Employee only)
exports.acceptOfferLetter = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.offerLetterPath) {
      return res.status(404).json({ 
        success: false, 
        message: 'No offer letter to accept' 
      });
    }

    if (user.offerLetterAccepted) {
      return res.status(400).json({ 
        success: false, 
        message: 'Offer letter already accepted' 
      });
    }

    // Update acceptance status
    await user.update({
      offerLetterAccepted: true,
      offerLetterAcceptedAt: new Date()
    });

    res.status(200).json({ 
      success: true, 
      message: 'Offer letter accepted successfully',
      data: {
        acceptedAt: user.offerLetterAcceptedAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error accepting offer letter', 
      error: error.message 
    });
  }
};

// Download Offer Letter (Employee only)
exports.downloadOfferLetter = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.offerLetterPath) {
      return res.status(404).json({ 
        success: false, 
        message: 'No offer letter available' 
      });
    }

    // Check if file exists
    if (!fs.existsSync(user.offerLetterPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offer letter file not found on server' 
      });
    }

    // Generate filename
    const filename = `Offer-Letter-${user.empCode || user.id}.pdf`;

    // Send file for download
    res.download(user.offerLetterPath, filename, (err) => {
      if (err) {
        console.error('Error downloading offer letter:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Error downloading offer letter' 
        });
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error downloading offer letter', 
      error: error.message 
    });
  }
};

// Get All Offer Letters (Employer/Admin)
// Employer sees only their company employees
// Admin sees all employees
exports.getAllOfferLetters = async (req, res) => {
  try {
    let whereClause = {};

    // If employer, filter by company
    if (req.user.role === 'employer') {
      const company = await Company.findOne({ where: { userId: req.user.id } });
      if (!company) {
        return res.status(404).json({ 
          success: false, 
          message: 'Company not found' 
        });
      }
      whereClause.companyId = company.id;
    }

    // Get all employees (filtered by company for employers)
    const employees = await User.findAll({
      where: {
        ...whereClause,
        role: 'employee',
        offerLetterPath: {
          [Op.ne]: null
        }
      },
      attributes: [
        'id',
        'empCode',
        'name',
        'designation',
        'offerLetterPath',
        'offerLetterUploadedAt',
        'offerLetterAccepted',
        'offerLetterAcceptedAt',
        'companyId'
      ],
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ]
    });

    // Format response
    const formattedData = employees.map(emp => ({
      id: emp.id,
      empCode: emp.empCode,
      name: emp.name,
      designation: emp.designation,
      company: emp.company ? emp.company.name : null,
      hasOfferLetter: !!emp.offerLetterPath,
      uploadedAt: emp.offerLetterUploadedAt,
      accepted: emp.offerLetterAccepted,
      acceptedAt: emp.offerLetterAcceptedAt,
      status: !emp.offerLetterPath 
        ? 'Not Uploaded' 
        : emp.offerLetterAccepted 
          ? 'Accepted' 
          : 'Pending Acceptance'
    }));

    res.status(200).json({ 
      success: true, 
      data: formattedData,
      count: formattedData.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching offer letters', 
      error: error.message 
    });
  }
};

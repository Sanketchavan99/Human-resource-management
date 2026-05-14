const { PayslipDocument, User, Company } = require("../models");
const path = require("path");
const fs = require("fs").promises;

/**
 * Upload single payslip document
 * POST /payslip-documents/single-upload
 * Access: employer, admin
 */
exports.uploadSinglePayslip = async (req, res) => {
  try {
    const { userId, month, year } = req.body;
    
    // Validate required fields
    if (!userId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "userId, month, and year are required"
      });
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    // Validate month and year
    if (monthInt < 1 || monthInt > 12) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12"
      });
    }

    if (yearInt < 2000 || yearInt > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year"
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payslip file is required"
      });
    }

    // Verify user has a company

    const company = await Company.findOne({
      where: { userId: req.user.id }
    });
    if (!company) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with any company"
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const filePath = req.file.path;

    // Check if payslip document already exists for this user and month
    const existingDoc = await PayslipDocument.findOne({
      where: {
        userId: user.id,
        month: monthInt,
        year: yearInt
      }
    });

    if (existingDoc) {
      // Delete old file
      try {
        await fs.unlink(existingDoc.fileUrl);
      } catch (error) {
        console.error("Failed to delete old file:", error);
      }

      // Update existing document
      await existingDoc.update({
        fileUrl: filePath,
        uploadedBy: req.user.id
      });

      return res.status(200).json({
        success: true,
        message: "Payslip document updated successfully",
        payslipDocument: existingDoc
      });
    } else {
      // Create new document
      const newDoc = await PayslipDocument.create({
        userId: user.id,
        companyId: company.id,
        month: monthInt,
        year: yearInt,
        fileUrl: filePath,
        uploadedBy: req.user.id
      });

      return res.status(201).json({
        success: true,
        message: "Payslip document uploaded successfully",
        payslipDocument: newDoc
      });
    }

  } catch (error) {
    console.error("Upload single payslip error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload payslip document",
      error: error.message
    });
  }
};

/**
 * Upload bulk payslip documents
 * POST /payslip-documents/bulk-upload
 * Access: employer, admin
 */
exports.uploadBulkPayslips = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required"
      });
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    if (monthInt < 1 || monthInt > 12) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12"
      });
    }

    if (yearInt < 2000 || yearInt > 2100) {
      return res.status(400).json({
        success: false,
        message: "Invalid year"
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one file is required"
      });
    }

    const company = await Company.findOne({
      where: { userId: req.user.id }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    const results = {
      total: req.files.length,
      created: 0,
      updated: 0,
      errors: []
    };

    // Process each uploaded file
    for (const file of req.files) {
      try {
        // Extract empCode from filename (remove extension)
        const fileName = path.basename(file.originalname, path.extname(file.originalname));
        const empCode = fileName.trim();

        // Find user by empCode
        const user = await User.findOne({
          where: { empCode: empCode }
        });

        if (!user) {
          results.errors.push({
            fileName: file.originalname,
            empCode: empCode,
            error: "Employee not found in system"
          });
          // Delete uploaded file if user not found
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error("Failed to delete unmatched file:", unlinkError);
          }
          continue;
        }

        // Verify user has a company
        if (!user.companyId) {
          results.errors.push({
            fileName: file.originalname,
            empCode: empCode,
            error: "User is not associated with any company"
          });
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error("Failed to delete file:", unlinkError);
          }
          continue;
        }

        // Check if payslip document already exists
        const existingDoc = await PayslipDocument.findOne({
          where: {
            userId: user.id,
            month: monthInt,
            year: yearInt
          }
        });

        if (existingDoc) {
          // Delete old file
          try {
            await fs.unlink(existingDoc.fileUrl);
          } catch (error) {
            console.error("Failed to delete old file:", error);
          }

          // Update existing document
          await existingDoc.update({
            fileUrl: file.path,
            uploadedBy: req.user.id
          });

          results.updated++;
        } else {
          // Create new document
          await PayslipDocument.create({
            userId: user.id,
            companyId: user.companyId,
            month: monthInt,
            year: yearInt,
            fileUrl: file.path,
            uploadedBy: req.user.id
          });

          results.created++;
        }

      } catch (error) {
        results.errors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk upload completed",
      results
    });

  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload payslip documents",
      error: error.message
    });
  }
};

/**
 * Get payslip documents for user's company
 * GET /payslip-documents
 * Access: employer, admin
 */
exports.getAllPayslipDocuments = async (req, res) => {
  try {
    const { month, year } = req.query;

    const company = await Company.findOne({
      where: { userId: req.user.id }
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with any company"
      });
    }
    

    const where = { companyId: company.id };
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const payslipDocuments = await PayslipDocument.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'empCode', 'name', 'email']
        },
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ],
      order: [['year', 'DESC'], ['month', 'DESC'], ['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      payslipDocuments,
      count: payslipDocuments.length
    });

  } catch (error) {
    console.error("Get all payslip documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payslip documents",
      error: error.message
    });
  }
};

/**
 * Get authenticated user's payslip documents
 * GET /payslip-documents/my
 * Access: employee
 */
exports.getMyPayslipDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const payslipDocuments = await PayslipDocument.findAll({
      where: { userId },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.status(200).json({
      success: true,
      payslipDocuments,
      count: payslipDocuments.length
    });

  } catch (error) {
    console.error("Get my payslip documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payslip documents",
      error: error.message
    });
  }
};

/**
 * Download payslip document
 * GET /payslip-documents/:id/download
 * Access: employee (own documents only), employer, admin
 */
exports.downloadPayslipDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const payslipDoc = await PayslipDocument.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'empCode', 'name']
        }
      ]
    });

    if (!payslipDoc) {
      return res.status(404).json({
        success: false,
        message: "Payslip document not found"
      });
    }

    // Check access: employee can only download their own documents
    if (userRole === 'employee' && payslipDoc.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only download your own payslip documents"
      });
    }

    // Check if file exists
    try {
      await fs.access(payslipDoc.fileUrl);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: "Payslip file not found on server"
      });
    }

    // Send file
    const fileName = `payslip_${payslipDoc.user.empCode}_${payslipDoc.month}_${payslipDoc.year}${path.extname(payslipDoc.fileUrl)}`;
    res.download(payslipDoc.fileUrl, fileName);

  } catch (error) {
    console.error("Download payslip document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download payslip document",
      error: error.message
    });
  }
};

/**
 * Delete payslip document
 * DELETE /payslip-documents/:id
 * Access: employer, admin
 */
exports.deletePayslipDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const payslipDoc = await PayslipDocument.findByPk(id);

    if (!payslipDoc) {
      return res.status(404).json({
        success: false,
        message: "Payslip document not found"
      });
    }

    // Delete file
    try {
      await fs.unlink(payslipDoc.fileUrl);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }

    // Delete database record
    await payslipDoc.destroy();

    res.status(200).json({
      success: true,
      message: "Payslip document deleted successfully"
    });

  } catch (error) {
    console.error("Delete payslip document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete payslip document",
      error: error.message
    });
  }
};

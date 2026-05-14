const { Payslip, User } = require("../models");
const { generatePayslipHTML, generatePDFFromHTML, parseExcelFile } = require("../services/payslipService");
const path = require("path");
const fs = require("fs").promises;

/**
 * Upload Excel file and create payslip records
 * POST /payslips/upload
 * Access: employer, admin
 */
exports.uploadPayslipExcel = async (req, res) => {
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
    console.log(monthInt, yearInt);

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
        message: "Excel file is required"
      });
    }

    const filePath = req.file.path;

    // Parse Excel file
    const payslipData = await parseExcelFile(filePath, monthInt, yearInt);

    if (!payslipData || payslipData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid data found in Excel file"
      });
    }

    // Process each row
    const results = {
      total: payslipData.length,
      created: 0,
      updated: 0,
      errors: []
    };

    for (const data of payslipData) {
      try {
        // Find user by empCode
        const user = await User.findOne({
          where: { empCode: data.empCode }
        });

        if (!user) {
          results.errors.push({
            empCode: data.empCode,
            empName: data.empName,
            error: "Employee not found in system"
          });
          continue;
        }

        // Check if payslip already exists for this user and month
        const existingPayslip = await Payslip.findOne({
          where: {
            userId: user.id,
            month: monthInt,
            year: yearInt
          }
        });

        // Ensure JSON fields are properly formatted
        const earningsActual = data.earningsActual && typeof data.earningsActual === 'object' 
          ? data.earningsActual 
          : {};
        const earningsPayable = data.earningsPayable && typeof data.earningsPayable === 'object' 
          ? data.earningsPayable 
          : {};
        const deductions = data.deductions && typeof data.deductions === 'object' 
          ? data.deductions 
          : {};

        const payslipRecord = {
          userId: user.id,
          month: monthInt,
          year: yearInt,
          empCode: data.empCode,
          empName: data.empName,
          designation: data.designation,
          department: data.department,
          location: data.location,
          company: data.company,
          esiNo: data.esiNo,
          bankName: data.bankName,
          accountNo: data.accountNo,
          uanNo: data.uanNo,
          doj: data.doj,
          workingDays: data.workingDays,
          phDays: data.phDays,
          presentDays: data.presentDays,
          weekOff: data.weekOff,
          absent: data.absent,
          totalDays: data.totalDays,
          // JSON fields - Sequelize will handle JSONB serialization automatically
          earningsActual: earningsActual,
          earningsPayable: earningsPayable,
          deductions: deductions,
          grossIncome: data.grossIncome,
          grossDeduction: data.grossDeduction,
          netAmount: data.netAmount,
          excelFilePath: filePath,
          uploadedBy: req.user.id,
          remarks: data.remarks || null
        };

        if (existingPayslip) {
          await existingPayslip.update(payslipRecord);
          results.updated++;
        } else {
          await Payslip.create(payslipRecord);
          results.created++;
        }

      } catch (error) {
        results.errors.push({
          empCode: data.empCode,
          empName: data.empName,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Payslip upload completed",
      results
    });

  } catch (error) {
    console.error("Upload payslip error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload payslips",
      error: error.message
    });
  }
};

/**
 * Generate PDF for a specific payslip
 * POST /payslips/:id/generate-pdf
 * Access: employer, admin
 */
exports.generatePayslipPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const payslip = await Payslip.findByPk(id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found"
      });
    }

    // Generate HTML
    const html = generatePayslipHTML(payslip);

    // Create PDF path
    const pdfDir = path.join(__dirname, "../uploads/payslips");
    const pdfFileName = `payslip_${payslip.empCode}_${payslip.month}_${payslip.year}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);

    // Generate PDF
    await generatePDFFromHTML(html, pdfPath);

    // Update payslip with PDF path
    await payslip.update({
      pdfFilePath: pdfPath
    });

    res.status(200).json({
      success: true,
      message: "PDF generated successfully",
      pdfPath: pdfPath
    });

  } catch (error) {
    console.error("Generate PDF error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
      error: error.message
    });
  }
};

/**
 * Download payslip PDF
 * GET /payslips/:id/download
 * Access: employee (own payslips only), employer, admin
 */
exports.downloadPayslipPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const payslip = await Payslip.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'empCode', 'name', 'dateOfJoining']
      }]
    });

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found"
      });
    }

    // Check access: employee can only download their own payslips
    if (userRole === 'employee' && payslip.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only download your own payslips"
      });
    }

    // Check if payslip is after date of joining
    if (userRole === 'employee' && payslip.user.dateOfJoining) {
      const doj = new Date(payslip.user.dateOfJoining);
      const payslipDate = new Date(payslip.year, payslip.month - 1, 1);
      
      if (payslipDate < doj) {
        return res.status(403).json({
          success: false,
          message: "Cannot download payslip before your date of joining"
        });
      }
    }

    // Generate PDF if it doesn't exist
    if (!payslip.pdfFilePath || !(await fs.access(payslip.pdfFilePath).then(() => true).catch(() => false))) {
      const html = generatePayslipHTML(payslip);
      const pdfDir = path.join(__dirname, "../uploads/payslips");
      const pdfFileName = `payslip_${payslip.empCode}_${payslip.month}_${payslip.year}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFileName);
      
      await generatePDFFromHTML(html, pdfPath);
      await payslip.update({ pdfFilePath: pdfPath });
      
      payslip.pdfFilePath = pdfPath;
    }

    // Send PDF file
    res.download(payslip.pdfFilePath, `payslip_${payslip.month}_${payslip.year}.pdf`);

  } catch (error) {
    console.error("Download payslip error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download payslip",
      error: error.message
    });
  }
};

/**
 * Get all payslips for authenticated employee
 * GET /payslips/my
 * Access: employee
 */
exports.getMyPayslips = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's date of joining
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const payslips = await Payslip.findAll({
      where: { userId },
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    // Filter payslips after date of joining
    let filteredPayslips = payslips;
    if (user.dateOfJoining) {
      const doj = new Date(user.dateOfJoining);
      filteredPayslips = payslips.filter(payslip => {
        const payslipDate = new Date(payslip.year, payslip.month - 1, 1);
        return payslipDate >= doj;
      });
    }

    res.status(200).json({
      success: true,
      payslips: filteredPayslips,
      count: filteredPayslips.length
    });

  } catch (error) {
    console.error("Get my payslips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payslips",
      error: error.message
    });
  }
};

/**
 * Check if current month payslip is available
 * GET /payslips/current-available
 * Access: employee
 */
exports.checkCurrentMonthAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const payslip = await Payslip.findOne({
      where: {
        userId,
        month: currentMonth,
        year: currentYear
      }
    });

    // Check date of joining
    const user = await User.findByPk(userId);
    let canDownload = true;
    
    if (user && user.dateOfJoining) {
      const doj = new Date(user.dateOfJoining);
      const payslipDate = new Date(currentYear, currentMonth - 1, 1);
      canDownload = payslipDate >= doj;
    }

    res.status(200).json({
      success: true,
      available: !!payslip && canDownload,
      payslip: payslip || null
    });

  } catch (error) {
    console.error("Check availability error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check availability",
      error: error.message
    });
  }
};

/**
 * Get all payslips (admin/employer)
 * GET /payslips
 * Access: employer, admin
 */
exports.getAllPayslips = async (req, res) => {
  try {
    const { month, year, empCode } = req.query;

    const where = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (empCode) where.empCode = empCode;

    const payslips = await Payslip.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'empCode', 'name', 'email']
      }],
      order: [['year', 'DESC'], ['month', 'DESC'], ['empCode', 'ASC']]
    });

    res.status(200).json({
      success: true,
      payslips,
      count: payslips.length
    });

  } catch (error) {
    console.error("Get all payslips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payslips",
      error: error.message
    });
  }
};

/**
 * Delete a payslip
 * DELETE /payslips/:id
 * Access: employer, admin
 */
exports.deletePayslip = async (req, res) => {
  try {
    const { id } = req.params;

    const payslip = await Payslip.findByPk(id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found"
      });
    }

    // Delete PDF file if exists
    if (payslip.pdfFilePath) {
      try {
        await fs.unlink(payslip.pdfFilePath);
      } catch (error) {
        console.error("Failed to delete PDF file:", error);
      }
    }

    await payslip.destroy();

    res.status(200).json({
      success: true,
      message: "Payslip deleted successfully"
    });

  } catch (error) {
    console.error("Delete payslip error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete payslip",
      error: error.message
    });
  }
};

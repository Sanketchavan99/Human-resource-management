const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const xlsx = require('xlsx');

/**
 * Generate HTML template for payslip PDF
 * @param {Object} payslipData - Payslip data from database
 * @returns {String} HTML string
 */
const generatePayslipHTML = (payslipData) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = monthNames[payslipData.month - 1];
  
  // Parse earnings and deductions
  const earningsActual = payslipData.earningsActual || {};
  const earningsPayable = payslipData.earningsPayable || {};
  const deductions = payslipData.deductions || {};

  // Create earnings rows
  const earningComponents = [
    'BASIC', 'HRA', 'OTHERA', 'SBONUS', 'L ENCA', 'GRATUI', 'MOBILE',
    'NIGHT', 'OBONUS', 'EXTPAY', 'NOTICE', 'NATIOH', 'PERINC',
    'REIMBU', 'ATTBON', 'JOBONU', 'GRPINC', 'SHPINC'
  ];

  const earningsRows = earningComponents.map(component => {
    const actual = earningsActual[component] || 0;
    const payable = earningsPayable[component] || 0;
    return `
      <tr>
        <td style="padding: 4px 8px; border: 1px solid #000;">${component}</td>
        <td style="padding: 4px 8px; border: 1px solid #000; text-align: right;">${Number(actual).toFixed(2)}</td>
        <td style="padding: 4px 8px; border: 1px solid #000; text-align: right;">${Number(payable).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  // Create deduction rows
  const deductionComponents = [
    'P.F.', 'ESIC', 'P.T.', 'I.T./TDS', 'L.W.F', 'Advance', 'Loan Inst.', 'Oth.Ded'
  ];

  const deductionRows = deductionComponents.map(component => {
    const amount = deductions[component] || 0;
    return `
      <tr>
        <td style="padding: 4px 8px; border: 1px solid #000;">${component}</td>
        <td style="padding: 4px 8px; border: 1px solid #000; text-align: right;">${Number(amount).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Salary Slip - ${monthName} ${payslipData.year}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          line-height: 1.3;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        .company-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .slip-title {
          font-size: 12px;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        th, td {
          border: 1px solid #000;
          padding: 4px 8px;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: left;
        }
        .info-table td {
          padding: 3px 8px;
        }
        .info-label {
          width: 20%;
          font-weight: 500;
        }
        .info-value {
          width: 30%;
        }
        .earnings-section, .deductions-section {
          display: inline-block;
          vertical-align: top;
        }
        .earnings-section {
          width: 62%;
          margin-right: 2%;
        }
        .deductions-section {
          width: 36%;
        }
        .totals-row {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .footer {
          margin-top: 20px;
          font-size: 10px;
          text-align: justify;
        }
        .three-col {
          display: table;
          width: 100%;
        }
        .three-col > div {
          display: table-cell;
          width: 33.33%;
          vertical-align: top;
        }
        @media print {
          body {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">PVTLTD.</div>
        <div class="slip-title">Salary slip for the month of ${monthName} ${payslipData.year}</div>
      </div>

      <!-- Employee Information -->
      <table class="info-table">
        <tr>
          <td class="info-label">Emp. No.</td>
          <td class="info-value"> ${payslipData.empCode || ''}</td>
          <td class="info-label">ESI No.</td>
          <td class="info-value"> ${payslipData.esiNo || ''}</td>
          <td class="info-label">Company </td>
          <td class="info-value">${payslipData.company || ''}</td>
        </tr>
        <tr>
          <td class="info-label">Emp. Name</td>
          <td class="info-value"> ${payslipData.empName || ''}</td>
          <td class="info-label">ESI No.</td>
          <td class="info-value"> ${payslipData.esiNo || ''}</td>
          <td class="info-label"></td>
          <td class="info-value"></td>
        </tr>
        <tr>
          <td class="info-label">Designation</td>
          <td class="info-value"> ${payslipData.designation || ''}</td>
          <td class="info-label">BANK</td>
          <td class="info-value"> ${payslipData.bankName || ''}</td>
          <td class="info-label"></td>
          <td class="info-value"></td>
        </tr>
        <tr>
          <td class="info-label">Department</td>
          <td class="info-value"> ${payslipData.department || ''}</td>
          <td class="info-label">A/c No</td>
          <td class="info-value"> ${payslipData.accountNo || ''}</td>
          <td class="info-label"></td>
          <td class="info-value"></td>
        </tr>
        <tr>
          <td class="info-label">Location</td>
          <td class="info-value"> ${payslipData.location || ''}</td>
          <td class="info-label">UAN NO.</td>
          <td class="info-value"> ${payslipData.uanNo || ''}</td>
          <td class="info-label">DOJ</td>
          <td class="info-value">${payslipData.doj || ''}</td>
        </tr>
      </table>

      <!-- Days and Earnings/Deductions Section -->
      <table>
        <tr>
          <th rowspan="2" style="width: 15%; text-align: center;">TOTAL DAYS</th>
          <th colspan="3" style="text-align: center;">EARNING DETAILS</th>
          <th colspan="2" style="text-align: center;">DEDUCTION DETAILS</th>
        </tr>
        <tr>
          <th style="width: 20%;">Earnings</th>
          <th style="width: 15%; text-align: center;">Actual</th>
          <th style="width: 15%; text-align: center;">Payable</th>
          <th style="width: 20%;">Deduction</th>
          <th style="width: 15%; text-align: center;">Amount</th>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">Working Days</td>
          <td rowspan="6" colspan="3" style="padding: 0; vertical-align: top;">
            <table style="width: 100%; margin: 0;">
              ${earningsRows}
            </table>
          </td>
          <td rowspan="6" colspan="2" style="padding: 0; vertical-align: top;">
            <table style="width: 100%; margin: 0;">
              ${deductionRows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">${Number(payslipData.workingDays || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">PH Days</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">${Number(payslipData.phDays || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">Present Days</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">${Number(payslipData.presentDays || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">Week off</td>
          <td colspan="3"></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">${Number(payslipData.weekOff || 0).toFixed(2)}</td>
          <td colspan="3"></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">Absent</td>
          <td colspan="3"></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">${Number(payslipData.absent || 0).toFixed(2)}</td>
          <td colspan="3"></td>
          <td colspan="2"></td>
        </tr>
        <tr class="totals-row">
          <td style="padding: 4px 8px;">TOTAL</td>
          <td style="padding: 4px 8px;">Gross Income</td>
          <td colspan="2" style="padding: 4px 8px; text-align: right;">${Number(payslipData.grossIncome || 0).toFixed(2)}</td>
          <td style="padding: 4px 8px;">Gross Ded.</td>
          <td style="padding: 4px 8px; text-align: right;">${Number(payslipData.grossDeduction || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px;">${Number(payslipData.totalDays || 0).toFixed(2)}</td>
          <td colspan="3" style="padding: 4px 8px;">Net Amount</td>
          <td colspan="2" style="padding: 4px 8px; text-align: right; font-weight: bold;">${Number(payslipData.netAmount || 0).toFixed(2)}</td>
        </tr>
      </table>

      <!-- Amount in Words -->
      <table>
        <tr>
          <td style="padding: 8px;">
            <strong>Rupees:</strong> ${amountInWords(payslipData.netAmount || 0)} Only
          </td>
          <td style="padding: 8px; text-align: right; width: 35%;">
            <strong>Net Amount:</strong> ${Number(payslipData.netAmount || 0).toFixed(2)}
          </td>
        </tr>
      </table>

      <!-- Remarks -->
      <table>
        <tr>
          <td style="padding: 8px;">
            <strong>Remark's:</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 8px;"></td>
        </tr>
      </table>

      <div class="footer">
        This is computer generated salary slip hence does not require a signature
      </div>
    </body>
    </html>
  `;

  return html;
};

const amountInWords = (num) => {
  if (!num) return "Zero";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function inWords(num) {
    if (num < 20) return a[num];
    if (num < 100)
      return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
    if (num < 1000)
      return (
        a[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " " + inWords(num % 100) : "")
      );
    return "";
  }

  let result = "";

  const crore = Math.floor(num / 10000000);
  if (crore > 0) {
    result += inWords(crore) + " Crore ";
    num %= 10000000;
  }

  const lakh = Math.floor(num / 100000);
  if (lakh > 0) {
    result += inWords(lakh) + " Lakh ";
    num %= 100000;
  }

  const thousand = Math.floor(num / 1000);
  if (thousand > 0) {
    result += inWords(thousand) + " Thousand ";
    num %= 1000;
  }

  const hundred = Math.floor(num / 100);
  if (hundred > 0) {
    result += inWords(hundred) + " Hundred ";
    num %= 100;
  }

  if (num > 0) result += inWords(num);

  return result.trim();
};

/**
 * Generate PDF from HTML using Puppeteer
 * @param {String} html - HTML string
 * @param {String} outputPath - Output file path
 * @returns {Promise<String>} Path to generated PDF
 */
const generatePDFFromHTML = async (html, outputPath) => {
  let browser;
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      printBackground: true
    });

    await browser.close();
    return outputPath;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

/**
 * Parse Excel file and extract payslip data
 * @param {String} filePath - Path to Excel file
 * @param {Number} month - Month number (1-12)
 * @param {Number} year - Year
 * @returns {Promise<Array>} Array of payslip objects
 */
const parseExcelFile = async (filePath, month, year) => {
  try {
    // Helper function to safely parse float
    const safeParseFloat = (value) => {
      if (value === null || value === undefined || value === '') return 0;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Helper function to clean JSON object (remove zero values)
    const cleanJsonObject = (obj) => {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== 0 && value !== null && value !== undefined) {
          cleaned[key] = value;
        }
      }
      return cleaned;
    };

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

    if (!data || data.length === 0) {
      throw new Error('Excel file is empty or invalid');
    }

    // Map Excel columns to payslip fields
    const payslips = data.map(row => {
      // Extract earnings actual - using safeParseFloat for all values
      const earningsActualRaw = {
        'BASIC': safeParseFloat(row['BASIC'] || row['Basic']),
        'HRA': safeParseFloat(row['HRA']),
        'OTHERA': safeParseFloat(row['OTHERA'] || row['Other Allowance']),
        'SBONUS': safeParseFloat(row['SBONUS'] || row['Bonus']),
        'L ENCA': safeParseFloat(row['L ENCA'] || row['Leave Encashment']),
        'GRATUI': safeParseFloat(row['GRATUI'] || row['Gratuity']),
        'MOBILE': safeParseFloat(row['MOBILE'] || row['Mobile']),
        'NIGHT': safeParseFloat(row['NIGHT'] || row['Night Shift']),
        'OBONUS': safeParseFloat(row['OBONUS']),
        'EXTPAY': safeParseFloat(row['EXTPAY']),
        'NOTICE': safeParseFloat(row['NOTICE']),
        'NATIOH': safeParseFloat(row['NATIOH'] || row['National Holiday']),
        'PERINC': safeParseFloat(row['PERINC'] || row['Performance Incentive']),
        'REIMBU': safeParseFloat(row['REIMBU'] || row['Reimbursement']),
        'ATTBON': safeParseFloat(row['ATTBON'] || row['Attendance Bonus']),
        'JOBONU': safeParseFloat(row['JOBONU'] || row['Joining Bonus']),
        'GRPINC': safeParseFloat(row['GRPINC'] || row['Group Incentive']),
        'SHPINC': safeParseFloat(row['SHPINC'] || row['Shift Incentive'])
      };

      // Extract earnings payable (if separate columns exist, otherwise same as actual)
      const earningsPayableRaw = {
        'BASIC': safeParseFloat(row['BASIC_Payable']) || earningsActualRaw['BASIC'],
        'HRA': safeParseFloat(row['HRA_Payable']) || earningsActualRaw['HRA'],
        'OTHERA': safeParseFloat(row['OTHERA_Payable']) || earningsActualRaw['OTHERA'],
        'SBONUS': safeParseFloat(row['SBONUS_Payable']) || earningsActualRaw['SBONUS'],
        'L ENCA': safeParseFloat(row['L ENCA_Payable']) || earningsActualRaw['L ENCA'],
        'GRATUI': safeParseFloat(row['GRATUI_Payable']) || earningsActualRaw['GRATUI'],
        'MOBILE': safeParseFloat(row['MOBILE_Payable']) || earningsActualRaw['MOBILE'],
        'NIGHT': safeParseFloat(row['NIGHT_Payable']) || earningsActualRaw['NIGHT'],
        'OBONUS': safeParseFloat(row['OBONUS_Payable']) || earningsActualRaw['OBONUS'],
        'EXTPAY': safeParseFloat(row['EXTPAY_Payable']) || earningsActualRaw['EXTPAY'],
        'NOTICE': safeParseFloat(row['NOTICE_Payable']) || earningsActualRaw['NOTICE'],
        'NATIOH': safeParseFloat(row['NATIOH_Payable']) || earningsActualRaw['NATIOH'],
        'PERINC': safeParseFloat(row['PERINC_Payable']) || earningsActualRaw['PERINC'],
        'REIMBU': safeParseFloat(row['REIMBU_Payable']) || earningsActualRaw['REIMBU'],
        'ATTBON': safeParseFloat(row['ATTBON_Payable']) || earningsActualRaw['ATTBON'],
        'JOBONU': safeParseFloat(row['JOBONU_Payable']) || earningsActualRaw['JOBONU'],
        'GRPINC': safeParseFloat(row['GRPINC_Payable']) || earningsActualRaw['GRPINC'],
        'SHPINC': safeParseFloat(row['SHPINC_Payable']) || earningsActualRaw['SHPINC']
      };

      // Extract deductions
      const deductionsRaw = {
        'P.F.': safeParseFloat(row['P.F.'] || row['PF'] || row['Provident Fund']),
        'ESIC': safeParseFloat(row['ESIC']),
        'P.T.': safeParseFloat(row['P.T.'] || row['PT'] || row['Professional Tax']),
        'I.T./TDS': safeParseFloat(row['I.T./TDS'] || row['IT'] || row['TDS'] || row['Income Tax']),
        'L.W.F': safeParseFloat(row['L.W.F'] || row['LWF'] || row['Labour Welfare Fund']),
        'Advance': safeParseFloat(row['Advance']),
        'Loan Inst.': safeParseFloat(row['Loan Inst.'] || row['Loan'] || row['Loan Installment']),
        'Oth.Ded': safeParseFloat(row['Oth.Ded'] || row['Other Deduction'])
      };

      // Clean JSON objects to remove zero values (keeps database cleaner)
      const earningsActual = cleanJsonObject(earningsActualRaw);
      const earningsPayable = cleanJsonObject(earningsPayableRaw);
      const deductions = cleanJsonObject(deductionsRaw);

      return {
        empCode: String(row['Emp. No.'] || row['Emp No'] || row['Employee Code'] || row['EmpCode'] || ''),
        empName: String(row['Emp. Name'] || row['Emp Name'] || row['Employee Name'] || row['Name'] || ''),
        designation: String(row['Designation'] || ''),
        department: String(row['Department'] || ''),
        location: String(row['Location'] || ''),
        company: String(row['Company'] || row['Company '] || ''),
        esiNo: String(row['ESI No.'] || row['ESI No'] || row['ESIC'] || ''),
        bankName: String(row['BANK'] || row['Bank'] || ''),
        accountNo: String(row['A/c No'] || row['Account No'] || row['Account Number'] || ''),
        uanNo: String(row['UAN NO.'] || row['UAN'] || row['UAN Number'] || ''),
        doj: row['DOJ'] || null,
        workingDays: safeParseFloat(row['Working Days'] || row['WorkingDays']),
        phDays: safeParseFloat(row['PH Days'] || row['PHDays']),
        presentDays: safeParseFloat(row['Present Days'] || row['PresentDays']),
        weekOff: safeParseFloat(row['Week off'] || row['WeekOff']),
        absent: safeParseFloat(row['Absent']),
        totalDays: safeParseFloat(row['TOTAL DAYS'] || row['Total Days'] || row['TotalDays']),
        // Cleaned JSON objects (only non-zero values)
        earningsActual,
        earningsPayable,
        deductions,
        grossIncome: safeParseFloat(row['Gross Income'] || row['GrossIncome']),
        grossDeduction: safeParseFloat(row['Gross Ded.'] || row['Gross Deduction'] || row['GrossDeduction']),
        netAmount: safeParseFloat(row['Net Amount'] || row['NetAmount']),
        remarks: String(row['Remarks'] || row['Remark'] || ''),
        month: parseInt(month),
        year: parseInt(year)
      };
    });

    return payslips;
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
};

module.exports = {
  generatePayslipHTML,
  generatePDFFromHTML,
  parseExcelFile
};

const { transporter } = require('../config/nodemailer');

/**
 * Send offer letter notification email to employee with PDF attachment
 * @param {Object} employee - Employee object with email, name, empCode
 * @param {Object} company - Company object with name
 * @param {String} offerLetterPath - Path to the offer letter PDF file
 */
const sendOfferLetterNotification = async (employee, company, offerLetterPath) => {
  // Check if employee has email
  if (!employee.email) {
    console.log(`No email found for employee ${employee.empCode}`);
    return { success: false, message: 'No email address available' };
  }

  const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offer Letter Available</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7fa;
        }
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .header-icon {
          width: 80px;
          height: 80px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .header-icon svg {
          width: 40px;
          height: 40px;
          fill: #ffffff;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header p {
          color: rgba(255, 255, 255, 0.9);
          margin: 10px 0 0 0;
          font-size: 16px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .message {
          font-size: 15px;
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .info-box {
          background-color: #f7fafc;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .info-box h3 {
          margin: 0 0 15px 0;
          color: #2d3748;
          font-size: 16px;
          font-weight: 600;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .info-item:last-child {
          border-bottom: none;
        }
        .info-label {
          color: #718096;
          font-size: 14px;
        }
        .info-value {
          color: #2d3748;
          font-size: 14px;
          font-weight: 500;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .instructions {
          background-color: #fff5f5;
          border: 1px solid #feb2b2;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .instructions h3 {
          color: #c53030;
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        .instructions h3::before {
          content: "⚠️";
          margin-right: 8px;
        }
        .instructions ul {
          margin: 0;
          padding-left: 20px;
          color: #742a2a;
        }
        .instructions li {
          margin: 8px 0;
          font-size: 14px;
        }
        .footer {
          background-color: #f7fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          color: #718096;
          font-size: 13px;
          margin: 5px 0;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        .divider {
          height: 1px;
          background-color: #e2e8f0;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              <path d="M14 2v6h6"/>
              <path d="M12 18v-6"/>
              <path d="m9 15 3 3 3-3"/>
            </svg>
          </div>
          <h1>Offer Letter Available</h1>
          <p>Your employment offer letter is ready for review</p>
        </div>

        <!-- Content -->
        <div class="content">
          <p class="greeting">Dear ${employee.name || employee.firstName || 'Employee'},</p>
          
          <p class="message">
            Congratulations! We are pleased to inform you that your offer letter has been prepared and is attached to this email for your review.
          </p>

          <div class="info-box">
            <h3>📋 Your Details</h3>
            <div class="info-item">
              <span class="info-label">Employee Code${": "}</span>
              <span class="info-value">${employee.empCode}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Name${": "}</span>
              <span class="info-value">${employee.name || `${employee.firstName} ${employee.lastName}`}</span>
            </div>
            ${employee.designation ? `
            <div class="info-item">
              <span class="info-label">Designation${": "}</span>
              <span class="info-value">${employee.designation}</span>
            </div>
            ` : ''}
            ${company ? `
            <div class="info-item">
              <span class="info-label">Company${": "}</span>
              <span class="info-value">${company.name}</span>
            </div>
            ` : ''}
          </div>

          <div class="instructions">
            <h3>Important Instructions</h3>
            <ul>
              <li><strong>Review the attached offer letter carefully</strong></li>
              <li>Ensure all terms and conditions are acceptable to you</li>
              <li><strong>Login to the portal to formally accept the offer</strong></li>
              <li>You must accept the offer letter to access the platform</li>
              <li>Contact HR if you have any questions or concerns</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="cta-button">
              Login to Accept Offer Letter
            </a>
          </div>

          <div class="divider"></div>

          <p class="message" style="font-size: 14px; color: #718096;">
            📎 <strong>Your offer letter is attached to this email.</strong> Please review it carefully. Once you're ready, log in to the portal to formally accept the offer and gain full access to the platform.
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>${company?.name || 'HireLyft'}</strong></p>
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>If you have any questions, please contact your HR department.</p>
          <p style="margin-top: 15px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Visit Portal</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${company?.name || 'HireLyft'}" <${process.env.EMAIL_USER}>`,
      to: employee.email,
      subject: `🎉 Your Offer Letter - ${company?.name || 'HireLyft'}`,
      html: emailTemplate,
      attachments: [
        {
          filename: `Offer-Letter-${employee.empCode}.pdf`,
          path: offerLetterPath,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log(`Offer letter email sent to ${employee.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending offer letter email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOfferLetterNotification,
};

const path = require('path');
const fs = require("fs");

const toBase64 = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const ext = path.extname(filePath).substring(1); // png/jpg/jpeg
  const base64 = fs.readFileSync(filePath, { encoding: "base64" });
  return `data:image/${ext};base64,${base64}`;
};

const generateIdCardHTML = (employee, company, protocol, host) => {
  const fullName = employee.firstName && employee.lastName 
    ? `${employee.firstName} ${employee.lastName}` 
    : employee.name || 'N/A';
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Get absolute paths for images
  const logoPath = company.logoPath ? `${protocol}://${host}/${company.logoPath}` : '';
  const photoPath = employee.passportPhotoPath ? `${protocol}://${host}/${employee.passportPhotoPath}` : '';

  

  console.log(logoPath, photoPath);
  return (`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          width: 350px;
          height: 550px;
          font-family: 'Arial', sans-serif;
          background: white;
          position: relative;
        }
        
        .id-card {
          width: 100%;
          height: 100%;
          border: 2px solid #1e40af;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          padding: 10px 20px; 
          text-align: center;
          color: white;
          position: relative;
          height: 100px;
        }
        
        .company-logo {
          max-width: 80px;
          max-height: 60px;
          object-fit: contain;
          margin: 0 auto;
          display: block;
        }
        
        .company-name {
          font-size: 14px;
          font-weight: bold;
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .id-title {
          background: #f1f5f9;
          padding: 12px;
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          color: #1e40af;
          text-transform: uppercase;
          letter-spacing: 2px;
          border-bottom: 3px solid #1e40af;
        }
        
        .photo-section {
          margin-top: 4px;
          display:grid;
          place-items: center;
          gap:2px;
        }
        
        .employee-photo {
          width: 120px;
          height: 140px;
          object-fit: cover;
          border: 3px solid #1e40af;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .photo-placeholder {
          width: 120px;
          height: 140px;
          border: 3px dashed #cbd5e1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #64748b;
          font-size: 12px;
          margin: 0 auto;
        }
        
        .details {
          padding: 0 20px 20px;
        }
        
        .detail-row {
          margin-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
        }
        
        .detail-label {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        
        .detail-value {
          font-size: 13px;
          color: #1e293b;
          font-weight: 600;
        }
        
        .emp-code {
          background: #1e40af;
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          display: inline-block;
          font-size: 12px;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .footer {
          position: absolute;
          bottom: 0;
          width: 100%;
          background: #f1f5f9;
          padding: 10px;
          text-align: center;
          font-size: 8px;
          color: #64748b;
          border-top: 1px solid #cbd5e1;
        }
        
        .qr-section {
          text-align: center;
          margin: 10px 0;
        }
        
        .barcode {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #1e40af;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="id-card">
        <div class="header">
          ${logoPath ? `<img src="${logoPath}" class="company-logo" alt="Company Logo" />` : ''}
          <div class="company-name">${company.name || 'Company Name'}</div>
        </div>
        
        <div class="id-title">Employee ID Card</div>
        
        <div class="photo-section">
          ${photoPath 
            ? `<img src="${photoPath}" class="employee-photo" alt="Employee Photo" />` 
            : '<div class="photo-placeholder">No Photo</div>'
          }
          <div class="emp-code">${employee.empCode || 'N/A'}</div>
        </div>
        
        <div class="details">
          <div class="detail-row">
            <div class="detail-label">Full Name</div>
            <div class="detail-value">${fullName}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Designation</div>
            <div class="detail-value">${employee.designation || 'N/A'}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Date of Joining</div>
            <div class="detail-value">${formatDate(employee.dateOfJoining)}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Phone Number</div>
            <div class="detail-value">${employee.phoneNumber || 'N/A'}</div>
          </div>
          
        </div>
        <div class="footer">
          This is a computer-generated ID card • Valid for official use only
        </div>
        
       
      </div>
    </body>
    </html>
  `);
}   

module.exports = { generateIdCardHTML };


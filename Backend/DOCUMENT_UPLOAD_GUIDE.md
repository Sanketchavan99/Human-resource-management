# Document Upload Configuration - Aadhar, PAN, Driving License

## 📋 Overview

The multer configuration has been enhanced to support uploading identity documents (Aadhar, PAN Card, Driving License) as both **images** (JPG, PNG) and **PDFs**.

---

## 🗂️ Directory Structure

```
uploads/
├── documents/      # PDF files (Aadhar, PAN, Driving License PDFs)
├── images/         # Image files (Aadhar, PAN, Driving License scans)
└── temp/           # Excel files (bulk uploads)
```

All directories are automatically created on server startup.

---

## 📦 Multer Configuration

**File:** `middlewares/upload.js`

### Supported File Types

| Type | MIME Types | Storage Location | Use Case |
|------|-----------|------------------|----------|
| **PDF** | `application/pdf` | `uploads/documents/` | Document PDFs |
| **Images** | `image/jpeg`, `image/jpg`, `image/png` | `uploads/images/` | Document scans |
| **Excel** | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.ms-excel` | `uploads/temp/` | Bulk upload |

### File Size Limit
- Maximum: **5MB per file**

### File Naming Convention
```
{fieldname}-{timestamp}-{random-number}.{extension}

Examples:
- aadhar-1732351234567-123456789.pdf
- panCard-1732351234567-987654321.jpg
- drivingLicense-1732351234567-456789123.png
```

---

## 🔌 Upload Documents API

### Endpoint
```
POST /api/users/:id/documents
```

### Authorization
- ✅ **Users**: Can upload their own documents
- ✅ **Admins**: Can upload documents for any user

### Request Type
`multipart/form-data`

### Fields
You can upload one or multiple documents in a single request:
- `aadhar` - Aadhar card (image or PDF)
- `panCard` - PAN card (image or PDF)
- `drivingLicense` - Driving license (image or PDF)

### Example Request (cURL)
```bash
curl -X POST http://localhost:5000/api/users/{userId}/documents \
  -H "Authorization: Bearer <token>" \
  -F "aadhar=@/path/to/aadhar.jpg" \
  -F "panCard=@/path/to/pan.pdf" \
  -F "drivingLicense=@/path/to/license.png"
```

### Example Request (JavaScript - Fetch)
```javascript
const formData = new FormData();
formData.append('aadhar', aadharFile);
formData.append('panCard', panCardFile);
formData.append('drivingLicense', licenseFile);

const response = await fetch(`/api/users/${userId}/documents`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
```

### Example Request (JavaScript - Axios)
```javascript
const formData = new FormData();
formData.append('aadhar', aadharFile);
formData.append('panCard', panCardFile);
formData.append('drivingLicense', licenseFile);

const response = await axios.post(`/api/users/${userId}/documents`, formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Documents uploaded successfully",
  "data": {
    "aadharPath": "uploads/images/aadhar-1732351234567-123456789.jpg",
    "panCardPath": "uploads/documents/panCard-1732351234567-987654321.pdf",
    "drivingLicensePath": "uploads/images/drivingLicense-1732351234567-456789123.png"
  }
}
```

### Error Responses

#### 400 Bad Request - No files uploaded
```json
{
  "success": false,
  "message": "No files uploaded"
}
```

#### 400 Bad Request - Invalid file type
```json
{
  "success": false,
  "message": "Only PDF, Excel, JPG, and PNG files are allowed!"
}
```

#### 403 Forbidden - Unauthorized
```json
{
  "success": false,
  "message": "Access denied. You can only upload your own documents."
}
```

#### 404 Not Found - User doesn't exist
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 413 Payload Too Large - File too big
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}
```

---

## 🗄️ Database Fields

The User model stores document paths in these fields:

| Field | Type | Description |
|-------|------|-------------|
| `aadharPath` | STRING | Path to Aadhar document |
| `panCardPath` | STRING | Path to PAN card document |
| `drivingLicensePath` | STRING | Path to Driving License document |

Additionally, these fields store document numbers:
- `aadharNumber` - Aadhar number
- `panCardNumber` - PAN number
- `drivingLicenseNumber` - DL number

---

## 🎯 Usage Scenarios

### Scenario 1: Upload Single Document
```javascript
// Upload only Aadhar
const formData = new FormData();
formData.append('aadhar', aadharFile);

await fetch(`/api/users/${userId}/documents`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Scenario 2: Upload Multiple Documents
```javascript
// Upload all three documents at once
const formData = new FormData();
formData.append('aadhar', aadharFile);
formData.append('panCard', panFile);
formData.append('drivingLicense', licenseFile);

await fetch(`/api/users/${userId}/documents`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Scenario 3: Update Existing Document
```javascript
// Replace existing PAN card
const formData = new FormData();
formData.append('panCard', newPanFile);

await fetch(`/api/users/${userId}/documents`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
// Old PAN path will be overwritten
```

---

## 🔐 Security Features

### 1. **Authorization Check**
- Users can only upload their own documents
- Admins can upload for any user

### 2. **File Type Validation**
- Only allowed file types accepted
- MIME type verification

### 3. **File Size Limit**
- 5MB maximum per file
- Prevents server overload

### 4. **Unique Filenames**
- Timestamp + random number
- Prevents file name collisions

### 5. **Sanitized Field Names**
- Spaces replaced with underscores
- Prevents path traversal attacks

---

## 📱 Frontend Integration Example

### React Component
```jsx
import React, { useState } from 'react';
import axios from 'axios';

function DocumentUpload({ userId, token }) {
  const [aadhar, setAadhar] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [license, setLicense] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    
    if (aadhar) formData.append('aadhar', aadhar);
    if (panCard) formData.append('panCard', panCard);
    if (license) formData.append('drivingLicense', license);

    try {
      const response = await axios.post(
        `/api/users/${userId}/documents`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Success:', response.data);
    } catch (error) {
      console.error('Error:', error.response.data);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => setAadhar(e.target.files[0])}
      />
      <input 
        type="file" 
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => setPanCard(e.target.files[0])}
      />
      <input 
        type="file" 
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => setLicense(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload Documents</button>
    </div>
  );
}
```

---

## 🧪 Testing

### Test with Postman

1. **Create Request**
   - Method: POST
   - URL: `http://localhost:5000/api/users/{userId}/documents`

2. **Add Authorization**
   - Type: Bearer Token
   - Token: Your JWT token

3. **Add Form Data**
   - Key: `aadhar`, Type: File, Value: Select file
   - Key: `panCard`, Type: File, Value: Select file
   - Key: `drivingLicense`, Type: File, Value: Select file

4. **Send Request**

### Test File Types

✅ **Allowed:**
- aadhar.jpg
- pan-card.png
- license.pdf
- document.jpeg

❌ **Not Allowed:**
- document.docx
- image.gif
- file.txt
- video.mp4

---

## ⚠️ Important Notes

### File Overwriting
- Uploading a new document **overwrites** the previous path
- Old files are **NOT automatically deleted** from disk
- Consider implementing cleanup logic

### File Retrieval
- Files are stored with relative paths
- To serve files, create a static route or download endpoint
- Example: `app.use('/uploads', express.static('uploads'))`

### Production Recommendations

1. **Cloud Storage**
   - Use AWS S3, Google Cloud Storage, or Azure Blob
   - Don't store in local filesystem

2. **File Cleanup**
   - Delete old files when new ones are uploaded
   - Implement scheduled cleanup for orphaned files

3. **Virus Scanning**
   - Scan uploaded files for malware
   - Use ClamAV or similar

4. **Image Processing**
   - Compress images to reduce storage
   - Use Sharp or similar library

5. **Access Control**
   - Add endpoint to download documents
   - Verify user owns document before serving

---

## 🔄 Complete Flow

```
1. User selects document file(s)
   ↓
2. Frontend creates FormData with files
   ↓
3. POST request to /api/users/:id/documents
   ↓
4. Multer middleware processes upload
   ↓
5. Files saved to appropriate directory
   ↓
6. Controller updates user record with paths
   ↓
7. Response returns new file paths
   ↓
8. Frontend updates UI with success message
```

---

## 📊 Summary

✅ **Multer Configuration Updated**
- Supports PDF, JPG, PNG files
- 3 directories: documents, images, temp
- 5MB file size limit

✅ **Upload Endpoint Created**
- POST /api/users/:id/documents
- Multiple file upload support
- Authorization checks

✅ **Security Implemented**
- File type validation
- Size limits
- Ownership verification

✅ **User Model Fields**
- aadharPath
- panCardPath  
- drivingLicensePath

**Ready to upload Aadhar, PAN, and Driving License documents!** 🎉

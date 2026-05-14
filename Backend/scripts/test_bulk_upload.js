const axios = require('axios');
const app = require('../app');
const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testBulkUpload() {
  const server = http.createServer(app);
  const PORT = 5002;
  
  try {
    await new Promise((resolve) => server.listen(PORT, resolve));
    const API_URL = `http://localhost:${PORT}/api`;
    
    // 1. Login to get token
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, { 
      empCode: 'ADMIN001', 
      password: 'admin123' 
    });
    const token = loginRes.data.token;
    console.log('Login success.');

    // 2. Upload File
    console.log('Uploading file...');
    const filePath = path.join(__dirname, '../dummy_employees.xlsx');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Dummy file not found. Run create_dummy_excel.js first.');
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const uploadRes = await axios.post(`${API_URL}/users/bulk-upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Upload response:', uploadRes.data);
    if (!uploadRes.data.success) throw new Error('Bulk upload failed');
    
    console.log('Upload success:', uploadRes.data);
    
    server.close();
  } catch (error) {
    console.error('Bulk upload test failed:', error.response ? error.response.data : error.message);
    server.close();
  }
}

testBulkUpload();

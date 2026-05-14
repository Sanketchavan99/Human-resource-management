const axios = require('axios');
const app = require('../app'); // Import app
const http = require('http');

async function testAuth() {
  const server = http.createServer(app);
  const PORT = 5001; // Use different port for testing
  
  try {
    await new Promise((resolve) => server.listen(PORT, resolve));
    const API_URL = `http://localhost:${PORT}/api/auth`;
    
    // 1. Register (Send OTP)
    console.log('Testing Register...');
    const empCode = 'ADMIN001'; 
    const regRes = await axios.post(`${API_URL}/register`, { empCode });
    console.log('Register response:', regRes.data);
    if (!regRes.data.success) throw new Error('Register failed');

    // 2. Login
    console.log('Testing Login...');
    const loginRes = await axios.post(`${API_URL}/login`, { 
      empCode: 'ADMIN001', 
      password: 'admin123' 
    });
    console.log('Login response:', loginRes.data);
    if (!loginRes.data.success) throw new Error('Login failed');
    
    console.log('Login success. Token:', loginRes.data.token ? 'Received' : 'Missing');
    
    server.close();
    return loginRes.data.token;
  } catch (error) {
    console.error('Auth test failed:', error.response ? error.response.data : error.message);
    server.close();
  }
}

testAuth();

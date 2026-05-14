const XLSX = require('xlsx');
const path = require('path');

const data = [
  {
    'Emp Code': 'EMP001',
    'Client Emp Name': 'John Doe',
    'Mobile No.': '9876543210',
    'Designation': 'Software Engineer',
    'D.O.J': '2023-01-01',
    'Basic Salary': 50000,
    'Location': 'Pune',
    'City': 'Pune',
    'State': 'Maharashtra',
    'Zone': 'West'
  },
  {
    'Emp Code': 'EMP002',
    'Client Emp Name': 'Jane Smith',
    'Mobile No.': '9876543211',
    'Designation': 'HR Manager',
    'D.O.J': '2023-02-01',
    'Basic Salary': 60000,
    'Location': 'Mumbai',
    'City': 'Mumbai',
    'State': 'Maharashtra',
    'Zone': 'West'
  }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

const filePath = path.join(__dirname, '../dummy_employees.xlsx');
XLSX.writeFile(workbook, filePath);
console.log('Dummy Excel file created:', filePath);

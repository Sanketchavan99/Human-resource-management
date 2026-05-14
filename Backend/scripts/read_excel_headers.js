const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Master data format.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
  console.log('Total Headers:', headers.length);
  headers.forEach((h, i) => console.log(`${i}: ${h}`));
} catch (error) {
  console.error('Error reading Excel file:', error.message);
}

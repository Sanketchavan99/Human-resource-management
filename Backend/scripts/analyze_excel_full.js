const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Master data format.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
    
    if (headers) {
      console.log(`Total Headers: ${headers.length}`);
      headers.forEach((h, i) => console.log(`${i}: ${h}`));
      
      // Also print first row of data to see if it helps
      const data = XLSX.utils.sheet_to_json(worksheet);
      if (data.length > 0) {
        console.log('Sample Row 1:', JSON.stringify(data[0], null, 2));
      }
    } else {
      console.log('No headers found (empty sheet?)');
    }
  });

} catch (error) {
  console.error('Error reading Excel file:', error.message);
}

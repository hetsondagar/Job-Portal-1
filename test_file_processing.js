const xlsx = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');

// Test CSV processing
async function testCSVProcessing() {
  return new Promise((resolve, reject) => {
    const emails = [];
    
    fs.createReadStream('test_emails.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Look for email in any column
        Object.values(row).forEach(value => {
          if (typeof value === 'string' && value.includes('@')) {
            const emailMatch = value.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if (emailMatch) {
              emails.push(emailMatch[1].toLowerCase());
            }
          }
        });
      })
      .on('end', () => {
        console.log('CSV Processing Results:');
        console.log('Extracted emails:', emails);
        console.log('Unique emails:', [...new Set(emails)]);
        resolve([...new Set(emails)]);
      })
      .on('error', reject);
  });
}

// Test Excel processing
function testExcelProcessing() {
  try {
    const workbook = xlsx.readFile('test_emails.csv'); // Using CSV as Excel for test
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    const emails = [];
    data.forEach(row => {
      Object.values(row).forEach(value => {
        if (typeof value === 'string' && value.includes('@')) {
          const emailMatch = value.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (emailMatch) {
            emails.push(emailMatch[1].toLowerCase());
          }
        }
      });
    });
    
    console.log('Excel Processing Results:');
    console.log('Extracted emails:', emails);
    console.log('Unique emails:', [...new Set(emails)]);
    return [...new Set(emails)];
  } catch (error) {
    console.error('Excel processing error:', error.message);
    return [];
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing File Processing Functionality\n');
  
  try {
    await testCSVProcessing();
    console.log('\n' + '='.repeat(50) + '\n');
    testExcelProcessing();
    
    console.log('\n✅ All file processing tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();


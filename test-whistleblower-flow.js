#!/usr/bin/env node

/**
 * Test Whistleblower Flow
 * 
 * This script tests the complete whistleblower reporting flow:
 * 1. Submit anonymous report
 * 2. Verify it appears in super-admin support
 * 3. Test filtering and categorization
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testWhistleblowerFlow() {
  console.log('🚨 Testing Whistleblower Reporting Flow');
  console.log('=====================================\n');

  try {
    // Test 1: Submit anonymous fraud report
    console.log('1. Testing anonymous fraud report submission...');
    const fraudReport = {
      firstName: 'Anonymous',
      lastName: 'Reporter',
      email: 'anonymous@whistleblower.com',
      subject: 'Whistleblower Report: fraud',
      message: `Type of Misconduct: fraud

Department/Area: Finance Department

Incident Date: 2025-01-23

Description: Employee is embezzling company funds through fake vendor invoices.

Additional Information: This has been going on for several months. I have evidence but fear retaliation.`,
      category: 'fraud'
    };

    const fraudResponse = await fetch(`${API_BASE_URL}/support/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fraudReport)
    });

    const fraudResult = await fraudResponse.json();
    if (fraudResult.success) {
      console.log('✅ Fraud report submitted successfully');
      console.log(`   Report ID: ${fraudResult.data.id}`);
    } else {
      console.log('❌ Failed to submit fraud report:', fraudResult.message);
    }

    // Test 2: Submit anonymous misconduct report
    console.log('\n2. Testing anonymous misconduct report submission...');
    const misconductReport = {
      firstName: 'Anonymous',
      lastName: 'Reporter',
      email: 'anonymous@whistleblower.com',
      subject: 'Whistleblower Report: harassment',
      message: `Type of Misconduct: harassment

Department/Area: HR Department

Incident Date: 2025-01-22

Description: Manager is creating hostile work environment through inappropriate comments and behavior.

Additional Information: Multiple employees have complained but nothing has been done.`,
      category: 'misconduct'
    };

    const misconductResponse = await fetch(`${API_BASE_URL}/support/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(misconductReport)
    });

    const misconductResult = await misconductResponse.json();
    if (misconductResult.success) {
      console.log('✅ Misconduct report submitted successfully');
      console.log(`   Report ID: ${misconductResult.data.id}`);
    } else {
      console.log('❌ Failed to submit misconduct report:', misconductResult.message);
    }

    // Test 3: Submit spam report
    console.log('\n3. Testing spam report submission...');
    const spamReport = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      subject: 'Whistleblower Report: spam',
      message: `Type of Misconduct: spam

Department/Area: Marketing

Incident Date: 2025-01-21

Description: Company is sending unsolicited emails to users who didn't opt-in.

Additional Information: This violates GDPR and company policy.`,
      category: 'spam'
    };

    const spamResponse = await fetch(`${API_BASE_URL}/support/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spamReport)
    });

    const spamResult = await spamResponse.json();
    if (spamResult.success) {
      console.log('✅ Spam report submitted successfully');
      console.log(`   Report ID: ${spamResult.data.id}`);
    } else {
      console.log('❌ Failed to submit spam report:', spamResult.message);
    }

    // Test 4: Verify reports in support system
    console.log('\n4. Testing support message retrieval...');
    const supportResponse = await fetch(`${API_BASE_URL}/support/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real scenario, this would need admin authentication
      }
    });

    if (supportResponse.ok) {
      const supportData = await supportResponse.json();
      console.log('✅ Support messages retrieved successfully');
      console.log(`   Total messages: ${supportData.data.length}`);
      
      // Count whistleblower reports
      const whistleblowerReports = supportData.data.filter(msg => 
        ['fraud', 'spam', 'misconduct', 'whistleblower'].includes(msg.category)
      );
      console.log(`   Whistleblower reports: ${whistleblowerReports.length}`);
      
      // Show report details
      whistleblowerReports.forEach((report, index) => {
        console.log(`\n   Report ${index + 1}:`);
        console.log(`   - ID: ${report.id}`);
        console.log(`   - Category: ${report.category}`);
        console.log(`   - Priority: ${report.priority}`);
        console.log(`   - Subject: ${report.subject}`);
        console.log(`   - Anonymous: ${report.firstName === 'Anonymous' ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('❌ Failed to retrieve support messages (authentication required)');
    }

    console.log('\n🎉 Whistleblower flow test completed!');
    console.log('\nNext steps:');
    console.log('1. Check super-admin support dashboard for new reports');
    console.log('2. Verify notifications were sent to super-admins');
    console.log('3. Test filtering by whistleblower categories');
    console.log('4. Test responding to anonymous reports');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWhistleblowerFlow();

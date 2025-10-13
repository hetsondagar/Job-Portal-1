/**
 * PRODUCTION VERIFICATION SYSTEM TEST
 * Run this script to test the complete employer verification flow
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'https://job-portal-97q3.onrender.com/api';

class VerificationSystemTest {
  constructor() {
    this.results = [];
    this.testEmail = `test-employer-${Date.now()}@example.com`;
    this.token = null;
    this.companyId = null;
  }

  log(test, status, message, data = null) {
    const result = { test, status, message, data, timestamp: new Date().toISOString() };
    this.results.push(result);
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${test}: ${message}`);
    if (data) console.log('   →', JSON.stringify(data, null, 2));
  }

  async request(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${API_URL}${endpoint}`,
        headers: { 'Content-Type': 'application/json', ...headers },
        timeout: 15000
      };
      
      // Only add data for non-GET requests
      if (data && method !== 'GET') {
        config.data = data;
      }
      
      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async test1_EmployerRegistration() {
    console.log('\n🧪 TEST 1: Employer Registration');
    
    const result = await this.request('POST', '/auth/employer-signup', {
      email: this.testEmail,
      password: 'TestPassword123!',
      fullName: 'Test Employer User',
      companyName: `Test Company ${Date.now()}`,
      phone: '+1234567890',
      companySize: '1-50',
      industry: 'technology',
      website: 'https://testcompany.com',
      role: 'hiring_manager',
      region: 'india',
      companyAccountType: 'direct',
      agreeToTerms: true,
      subscribeUpdates: false
    });

    if (result.success && result.data.data?.token) {
      this.token = result.data.data.token;
      this.companyId = result.data.data.company?.id;
      this.log('Registration', 'PASS', 'Employer registered successfully', {
        userId: result.data.data.user?.id,
        companyId: this.companyId
      });
      return true;
    } else {
      this.log('Registration', 'FAIL', 'Registration failed', result.error);
      return false;
    }
  }

  async test2_ProfileAccess() {
    console.log('\n🧪 TEST 2: Profile Access');
    
    const result = await this.request('GET', '/auth/me', null, {
      'Authorization': `Bearer ${this.token}`
    });

    if (result.success) {
      this.log('Profile Access', 'PASS', 'Profile accessible', {
        accountStatus: result.data.data?.user?.accountStatus
      });
      return true;
    } else {
      this.log('Profile Access', 'FAIL', 'Cannot access profile', result.error);
      return false;
    }
  }

  async test3_DocumentSubmission() {
    console.log('\n🧪 TEST 3: Document Verification Submission');
    
    const result = await this.request('POST', '/verification/submit', {
      documents: {
        companyRegistration: 'test-registration.pdf',
        gstCertificate: 'test-gst.pdf',
        panCard: 'test-pan.pdf'
      },
      additionalInfo: 'Test verification documents'
    }, {
      'Authorization': `Bearer ${this.token}`
    });

    if (result.success) {
      this.log('Document Submission', 'PASS', 'Documents submitted successfully');
      return true;
    } else {
      this.log('Document Submission', 'FAIL', 'Document submission failed', result.error);
      return false;
    }
  }

  async test4_DashboardAccess() {
    console.log('\n🧪 TEST 4: Dashboard Access');
    
    const endpoints = [
      { name: 'Jobs', path: '/jobs/employer/manage-jobs' },
      { name: 'Profile', path: '/auth/me' },
      { name: 'Companies', path: '/companies' }
    ];

    let allPass = true;
    for (const { name, path } of endpoints) {
      const result = await this.request('GET', path, null, {
        'Authorization': `Bearer ${this.token}`
      });
      
      if (result.success) {
        this.log(`Dashboard - ${name}`, 'PASS', 'Access granted');
      } else {
        this.log(`Dashboard - ${name}`, 'FAIL', 'Access denied', result.error);
        allPass = false;
      }
    }
    
    return allPass;
  }

  async runAllTests() {
    console.log('🚀 PRODUCTION VERIFICATION SYSTEM TEST');
    console.log('=' .repeat(60));
    console.log(`API URL: ${API_URL}`);
    console.log(`Test Email: ${this.testEmail}`);
    console.log('=' .repeat(60));

    const tests = [
      this.test1_EmployerRegistration.bind(this),
      this.test2_ProfileAccess.bind(this),
      this.test3_DocumentSubmission.bind(this),
      this.test4_DashboardAccess.bind(this)
    ];

    let passed = 0;
    for (const test of tests) {
      try {
        if (await test()) passed++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('❌ Test error:', error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total: ${tests.length} | Passed: ${passed} | Failed: ${tests.length - passed}`);
    console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    return { total: tests.length, passed, failed: tests.length - passed };
  }
}

// Run tests
async function main() {
  const tester = new VerificationSystemTest();
  const results = await tester.runAllTests();
  process.exit(results.failed > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { VerificationSystemTest };

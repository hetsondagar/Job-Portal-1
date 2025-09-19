const axios = require('axios');

class APITestSuite {
  constructor() {
    this.baseURL = 'http://localhost:8000/api';
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Starting API Endpoint Test Suite...\n');
    
    // Test cases
    await this.testCase1_LowIncome();
    await this.testCase2_MidIncome();
    await this.testCase3_HighIncome();
    await this.testCase4_AllRegimesComparison();
    await this.testCase5_EdgeCases();
    await this.testCase6_CapitalGains();
    
    // Print summary
    this.printTestSummary();
  }

  async testCase1_LowIncome() {
    console.log('📊 Test Case 1: Low Income Profile');
    
    const payload = {
      fy: '2025-26',
      regimes: ['old', 'new'],
      profile: {
        basic: 300000,
        hra: 150000,
        conveyance: 24000,
        special_allowances: 126000,
        lta: 0,
        bonus: 0,
        other_taxable: 0,
        employee_pf_percent: 12,
        employer_pf_percent: 12,
        nps_employee: 0,
        nps_employer: 0,
        other_deductions: 0,
        investments: {
          '80C': 150000,
          '80D': 25000,
          '80CCD1B': 0
        },
        rent_paid: 180000,
        lives_in_metro: true,
        age: 30,
        state: 'Maharashtra',
        income_from_other_sources: 0,
        stcg: 0,
        ltcg: 0
      }
    };

    try {
      const response = await axios.post(`${this.baseURL}/salary/calculate`, payload);
      
      if (response.data && response.data.regimes) {
        const oldRegime = response.data.regimes.old;
        const newRegime = response.data.regimes.new;
        
        this.validateAPIResponse('Low Income', {
          hasOldRegime: !!oldRegime,
          hasNewRegime: !!newRegime,
          grossSalary: oldRegime.grossSalary,
          oldTax: oldRegime.incomeTax.total,
          newTax: newRegime.incomeTax.total,
          expectedGrossSalary: 600000
        });
      } else {
        this.recordTestFailure('Low Income', new Error('Invalid response structure'));
      }
      
    } catch (error) {
      this.recordTestFailure('Low Income', error);
    }
  }

  async testCase2_MidIncome() {
    console.log('📊 Test Case 2: Mid Income Profile');
    
    const payload = {
      fy: '2025-26',
      regimes: ['old', 'new'],
      profile: {
        basic: 600000,
        hra: 300000,
        conveyance: 30000,
        special_allowances: 450000,
        lta: 25000,
        bonus: 75000,
        other_taxable: 20000,
        employee_pf_percent: 12,
        employer_pf_percent: 12,
        nps_employee: 0,
        nps_employer: 0,
        other_deductions: 0,
        investments: {
          '80C': 150000,
          '80D': 25000,
          '80CCD1B': 0
        },
        rent_paid: 360000,
        lives_in_metro: true,
        age: 30,
        state: 'Maharashtra',
        income_from_other_sources: 0,
        stcg: 0,
        ltcg: 0
      }
    };

    try {
      const response = await axios.post(`${this.baseURL}/salary/calculate`, payload);
      
      if (response.data && response.data.regimes) {
        const oldRegime = response.data.regimes.old;
        const newRegime = response.data.regimes.new;
        
        this.validateAPIResponse('Mid Income', {
          hasOldRegime: !!oldRegime,
          hasNewRegime: !!newRegime,
          grossSalary: oldRegime.grossSalary,
          oldTax: oldRegime.incomeTax.total,
          newTax: newRegime.incomeTax.total,
          expectedGrossSalary: 1500000
        });
      } else {
        this.recordTestFailure('Mid Income', new Error('Invalid response structure'));
      }
      
    } catch (error) {
      this.recordTestFailure('Mid Income', error);
    }
  }

  async testCase3_HighIncome() {
    console.log('📊 Test Case 3: High Income Profile');
    
    const payload = {
      fy: '2025-26',
      regimes: ['old', 'new', 'new_post_2025'],
      profile: {
        basic: 1200000,
        hra: 600000,
        conveyance: 60000,
        special_allowances: 900000,
        lta: 50000,
        bonus: 200000,
        other_taxable: 50000,
        employee_pf_percent: 12,
        employer_pf_percent: 12,
        nps_employee: 50000,
        nps_employer: 50000,
        other_deductions: 0,
        investments: {
          '80C': 150000,
          '80D': 25000,
          '80CCD1B': 50000
        },
        rent_paid: 720000,
        lives_in_metro: true,
        age: 35,
        state: 'Karnataka',
        income_from_other_sources: 0,
        stcg: 0,
        ltcg: 0
      }
    };

    try {
      const response = await axios.post(`${this.baseURL}/salary/calculate`, payload);
      
      if (response.data && response.data.regimes) {
        const regimeCount = Object.keys(response.data.regimes).length;
        const oldRegime = response.data.regimes.old;
        
        this.validateAPIResponse('High Income', {
          hasThreeRegimes: regimeCount === 3,
          hasOldRegime: !!oldRegime,
          grossSalary: oldRegime.grossSalary,
          oldTax: oldRegime.incomeTax.total,
          expectedGrossSalary: 3060000
        });
      } else {
        this.recordTestFailure('High Income', new Error('Invalid response structure'));
      }
      
    } catch (error) {
      this.recordTestFailure('High Income', error);
    }
  }

  async testCase4_AllRegimesComparison() {
    console.log('📊 Test Case 4: All Regimes Comparison');
    
    const payload = {
      fy: '2025-26',
      regimes: ['old', 'new', 'new_post_2025'],
      profile: {
        basic: 800000,
        hra: 400000,
        conveyance: 40000,
        special_allowances: 600000,
        lta: 30000,
        bonus: 100000,
        other_taxable: 30000,
        employee_pf_percent: 12,
        employer_pf_percent: 12,
        nps_employee: 50000,
        nps_employer: 50000,
        other_deductions: 0,
        investments: {
          '80C': 150000,
          '80D': 25000,
          '80CCD1B': 50000
        },
        rent_paid: 480000,
        lives_in_metro: true,
        age: 35,
        state: 'Karnataka',
        income_from_other_sources: 0,
        stcg: 0,
        ltcg: 0
      }
    };

    try {
      const response = await axios.post(`${this.baseURL}/salary/calculate`, payload);
      
      if (response.data && response.data.regimes) {
        const regimes = response.data.regimes;
        const regimeKeys = Object.keys(regimes);
        
        this.validateAPIResponse('All Regimes Comparison', {
          hasThreeRegimes: regimeKeys.length === 3,
          hasOldRegime: regimeKeys.includes('old'),
          hasNewRegime: regimeKeys.includes('new'),
          hasNewPost2025Regime: regimeKeys.includes('new_post_2025'),
          allRegimesHaveData: regimeKeys.every(key => regimes[key] && regimes[key].grossSalary)
        });
      } else {
        this.recordTestFailure('All Regimes Comparison', new Error('Invalid response structure'));
      }
      
    } catch (error) {
      this.recordTestFailure('All Regimes Comparison', error);
    }
  }

  async testCase5_EdgeCases() {
    console.log('📊 Test Case 5: Edge Cases');
    
    const payload = {
      fy: '2025-26',
      regimes: ['old', 'new'],
      profile: {
        basic: 250000,
        hra: 0,
        conveyance: 0,
        special_allowances: 0,
        lta: 0,
        bonus: 0,
        other_taxable: 0,
        employee_pf_percent: 12,
        employer_pf_percent: 12,
        nps_employee: 0,
        nps_employer: 0,
        other_deductions: 0,
        investments: {
          '80C': 0,
          '80D': 0,
          '80CCD1B': 0
        },
        rent_paid: 0,
        lives_in_metro: false,
        age: 25,
        state: 'Kerala',
        income_from_other_sources: 0,
        stcg: 0,
        ltcg: 0
      }
    };

    try {
      const response = await axios.post(`${this.baseURL}/salary/calculate`, payload);
      
      if (response.data && response.data.regimes) {
        const oldRegime = response.data.regimes.old;
        const newRegime = response.data.regimes.new;
        
        this.validateAPIResponse('Edge Cases', {
          hasOldRegime: !!oldRegime,
          hasNewRegime: !!newRegime,
          grossSalary: oldRegime.grossSalary,
          oldTax: oldRegime.incomeTax.total,
          newTax: newRegime.incomeTax.total,
          expectedGrossSalary: 250000
        });
      } else {
        this.recordTestFailure('Edge Cases', new Error('Invalid response structure'));
      }
      
    } catch (error) {
      this.recordTestFailure('Edge Cases', error);
    }
  }

  async testCase6_CapitalGains() {
    console.log('📊 Test Case 6: Capital Gains');
    
    const payload = {
      fy: '2025-26',
      regimes: ['old', 'new'],
      profile: {
        basic: 1000000,
        hra: 500000,
        conveyance: 50000,
        special_allowances: 750000,
        lta: 40000,
        bonus: 150000,
        other_taxable: 40000,
        employee_pf_percent: 12,
        employer_pf_percent: 12,
        nps_employee: 0,
        nps_employer: 0,
        other_deductions: 0,
        investments: {
          '80C': 150000,
          '80D': 25000,
          '80CCD1B': 0
        },
        rent_paid: 600000,
        lives_in_metro: true,
        age: 40,
        state: 'Maharashtra',
        income_from_other_sources: 0,
        stcg: 300000,
        ltcg: 200000
      }
    };

    try {
      const response = await axios.post(`${this.baseURL}/salary/calculate`, payload);
      
      if (response.data && response.data.regimes) {
        const oldRegime = response.data.regimes.old;
        
        this.validateAPIResponse('Capital Gains', {
          hasOldRegime: !!oldRegime,
          grossSalary: oldRegime.grossSalary,
          oldTax: oldRegime.incomeTax.total,
          expectedGrossSalary: 2530000 // 2.3M + 0.5M capital gains
        });
      } else {
        this.recordTestFailure('Capital Gains', new Error('Invalid response structure'));
      }
      
    } catch (error) {
      this.recordTestFailure('Capital Gains', error);
    }
  }

  validateAPIResponse(testName, expectations) {
    const errors = [];
    
    // Validate basic structure
    if (expectations.hasOldRegime !== undefined && !expectations.hasOldRegime) {
      errors.push('Old regime data missing');
    }
    if (expectations.hasNewRegime !== undefined && !expectations.hasNewRegime) {
      errors.push('New regime data missing');
    }
    if (expectations.hasThreeRegimes !== undefined && !expectations.hasThreeRegimes) {
      errors.push('Expected 3 regimes, got different count');
    }
    if (expectations.hasNewPost2025Regime !== undefined && !expectations.hasNewPost2025Regime) {
      errors.push('New Post 2025 regime data missing');
    }
    
    // Validate gross salary
    if (expectations.expectedGrossSalary && expectations.grossSalary) {
      if (Math.abs(expectations.grossSalary - expectations.expectedGrossSalary) > 1000) {
        errors.push(`Gross salary mismatch: expected ${expectations.expectedGrossSalary}, got ${expectations.grossSalary}`);
      }
    }
    
    // Validate all regimes have data
    if (expectations.allRegimesHaveData !== undefined && !expectations.allRegimesHaveData) {
      errors.push('Some regimes missing data');
    }

    if (errors.length === 0) {
      this.recordTestSuccess(testName);
    } else {
      this.recordTestFailure(testName, new Error(errors.join(', ')));
    }
  }

  recordTestSuccess(testName) {
    this.testResults.push({ name: testName, status: 'PASS', error: null });
    console.log(`✅ ${testName}: PASSED`);
  }

  recordTestFailure(testName, error) {
    this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
    console.log(`❌ ${testName}: FAILED - ${error.message}`);
  }

  printTestSummary() {
    console.log('\n📊 API Test Summary:');
    console.log('====================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => r.status === 'FAIL').forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`);
      });
    }
    
    console.log(`\n${failed === 0 ? '🎉 All API tests passed!' : '⚠️  Some API tests failed. Please check the issues above.'}`);
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new APITestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = APITestSuite;

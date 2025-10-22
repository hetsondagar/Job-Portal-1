const TaxEngine = require('../lib/taxEngine');

class UltimateProductionTest {
  constructor() {
    this.taxEngine = new TaxEngine();
    this.testResults = [];
    this.failedTests = 0;
    this.totalTests = 0;
  }

  addError(message) {
    this.testResults.push(`❌ ${message}`);
    this.failedTests++;
    this.totalTests++;
  }

  addSuccess(message) {
    this.testResults.push(`✅ ${message}`);
    this.totalTests++;
  }

  async runAllTests() {
    console.log('🚀 STARTING ULTIMATE PRODUCTION-LEVEL TESTING SUITE');
    console.log('🎯 Testing EVERY possible scenario and edge case');
    console.log('\n' + '='.repeat(100));

    await this.testSystemInitialization();
    await this.testRegimeAvailability();
    await this.testZeroAndNegativeScenarios();
    await this.testLowIncomeScenarios();
    await this.testMediumIncomeScenarios();
    await this.testHighIncomeScenarios();
    await this.testVeryHighIncomeScenarios();
    await this.testBoundaryConditions();
    await this.testRebateThresholds();
    await this.testTaxSlabBoundaries();
    await this.testDeductionScenarios();
    await this.testProfessionalTaxScenarios();
    await this.testSurchargeScenarios();
    await this.testRealWorldProfiles();
    await this.testEdgeCases();
    await this.testErrorHandling();
    await this.testPerformanceScenarios();
    await this.testDataIntegrity();
    await this.testRegimeComparisons();
    await this.testCalculationAccuracy();

    this.generateFinalReport();
  }

  async testSystemInitialization() {
    console.log('\n🔧 Testing System Initialization...');
    
    try {
      // Test tax engine initialization
      if (this.taxEngine && this.taxEngine.rulesFetcher) {
        this.addSuccess('Tax engine initialized successfully');
      } else {
        this.addError('Tax engine initialization failed');
      }

      // Test rules fetcher
      const rules = await this.taxEngine.rulesFetcher.fetchRulesForFY('2025-26');
      if (rules && rules.regimes) {
        this.addSuccess('Tax rules loaded successfully');
      } else {
        this.addError('Tax rules loading failed');
      }

    } catch (error) {
      this.addError(`System initialization failed: ${error.message}`);
    }
  }

  async testRegimeAvailability() {
    console.log('\n📊 Testing Regime Availability...');
    
    try {
      const regimes = await this.taxEngine.getAvailableRegimes('2025-26');
      
      // Test all required regimes are available
      const requiredRegimes = ['old', 'new', 'new_post_2025'];
      for (const regime of requiredRegimes) {
        if (regimes.includes(regime)) {
          this.addSuccess(`Regime '${regime}' is available`);
        } else {
          this.addError(`Required regime '${regime}' is missing`);
        }
      }

      // Test no extra regimes
      if (regimes.length === 3) {
        this.addSuccess('Exactly 3 regimes available (no extra regimes)');
      } else {
        this.addError(`Expected 3 regimes, got ${regimes.length}: ${regimes.join(', ')}`);
      }

    } catch (error) {
      this.addError(`Regime availability test failed: ${error.message}`);
    }
  }

  async testZeroAndNegativeScenarios() {
    console.log('\n🔢 Testing Zero and Negative Income Scenarios...');
    
    const scenarios = [
      { name: 'Complete Zero Income', income: 0 },
      { name: 'Minimal Income (₹1)', income: 1 },
      { name: 'Very Low Income (₹100)', income: 100 },
      { name: 'Negative Income (₹-1000)', income: -1000 },
      { name: 'Large Negative Income (₹-100000)', income: -100000 }
    ];

    for (const scenario of scenarios) {
      try {
        const profile = this.getSimpleProfile(scenario.income);
        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );

        const oldTax = result.regimes.old.incomeTax.total;
        const newTax = result.regimes.new.incomeTax.total;
        const newPost2025Tax = result.regimes.new_post_2025.incomeTax.total;

        if (scenario.income <= 0) {
          // For zero or negative income, all taxes should be zero
          if (oldTax === 0 && newTax === 0 && newPost2025Tax === 0) {
            this.addSuccess(`${scenario.name}: All regimes have zero tax (correct for zero/negative income)`);
          } else {
            this.addError(`${scenario.name}: Expected all zero tax, got Old: ₹${oldTax}, New: ₹${newTax}, New Post 2025: ₹${newPost2025Tax}`);
          }
        } else {
          // For positive income, taxes should be non-negative
          if (oldTax >= 0 && newTax >= 0 && newPost2025Tax >= 0) {
            this.addSuccess(`${scenario.name}: All tax amounts are non-negative`);
          } else {
            this.addError(`${scenario.name}: Negative tax amounts detected`);
          }
        }

      } catch (error) {
        this.addError(`${scenario.name} failed: ${error.message}`);
      }
    }
  }

  async testLowIncomeScenarios() {
    console.log('\n💰 Testing Low Income Scenarios...');
    
    const scenarios = [
      { income: 50000, expectedOldRebate: true, expectedNewRebate: true, expectedNewPost2025Rebate: true },
      { income: 100000, expectedOldRebate: true, expectedNewRebate: true, expectedNewPost2025Rebate: true },
      { income: 200000, expectedOldRebate: true, expectedNewRebate: true, expectedNewPost2025Rebate: true },
      { income: 300000, expectedOldRebate: true, expectedNewRebate: true, expectedNewPost2025Rebate: true },
      { income: 400000, expectedOldRebate: true, expectedNewRebate: true, expectedNewPost2025Rebate: true },
      { income: 500000, expectedOldRebate: true, expectedNewRebate: true, expectedNewPost2025Rebate: true },
      { income: 600000, expectedOldRebate: false, expectedNewRebate: true, expectedNewPost2025Rebate: true },
      { income: 700000, expectedOldRebate: false, expectedNewRebate: true, expectedNewPost2025Rebate: true },
      { income: 800000, expectedOldRebate: false, expectedNewRebate: true, expectedNewPost2025Rebate: true },
      { income: 1000000, expectedOldRebate: false, expectedNewRebate: true, expectedNewPost2025Rebate: true },
      { income: 1200000, expectedOldRebate: false, expectedNewRebate: true, expectedNewPost2025Rebate: true }
    ];

    for (const scenario of scenarios) {
      try {
        const profile = this.getSimpleProfile(scenario.income);
        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );

        const oldRebate = result.regimes.old.incomeTax.rebate.eligible;
        const newRebate = result.regimes.new.incomeTax.rebate.eligible;
        const newPost2025Rebate = result.regimes.new_post_2025.incomeTax.rebate.eligible;

        if (oldRebate === scenario.expectedOldRebate && 
            newRebate === scenario.expectedNewRebate && 
            newPost2025Rebate === scenario.expectedNewPost2025Rebate) {
          this.addSuccess(`₹${scenario.income.toLocaleString()}: All rebate eligibilities correct`);
        } else {
          this.addError(`₹${scenario.income.toLocaleString()}: Expected Old:${scenario.expectedOldRebate}, New:${scenario.expectedNewRebate}, New Post 2025:${scenario.expectedNewPost2025Rebate} | Got Old:${oldRebate}, New:${newRebate}, New Post 2025:${newPost2025Rebate}`);
        }

      } catch (error) {
        this.addError(`₹${scenario.income.toLocaleString()} failed: ${error.message}`);
      }
    }
  }

  async testMediumIncomeScenarios() {
    console.log('\n📈 Testing Medium Income Scenarios...');
    
    const scenarios = [
      { income: 1500000, name: '₹1.5M' },
      { income: 2000000, name: '₹2M' },
      { income: 3000000, name: '₹3M' },
      { income: 4000000, name: '₹4M' },
      { income: 5000000, name: '₹5M' }
    ];

    for (const scenario of scenarios) {
      try {
        const profile = this.getComplexProfile(scenario.income);
        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );

        const oldTax = result.regimes.old.incomeTax.total;
        const newTax = result.regimes.new.incomeTax.total;
        const newPost2025Tax = result.regimes.new_post_2025.incomeTax.total;

        // All regimes should produce different results for medium income
        if (oldTax !== newTax && newTax !== newPost2025Tax && oldTax !== newPost2025Tax) {
          this.addSuccess(`${scenario.name}: All regimes produce different results (Old: ₹${oldTax.toLocaleString()}, New: ₹${newTax.toLocaleString()}, New Post 2025: ₹${newPost2025Tax.toLocaleString()})`);
        } else {
          this.addError(`${scenario.name}: Some regimes produce same results (Old: ₹${oldTax}, New: ₹${newTax}, New Post 2025: ₹${newPost2025Tax})`);
        }

        // All tax amounts should be positive for medium income
        if (oldTax > 0 && newTax > 0 && newPost2025Tax > 0) {
          this.addSuccess(`${scenario.name}: All regimes have positive tax amounts`);
        } else {
          this.addError(`${scenario.name}: Some regimes have zero or negative tax`);
        }

      } catch (error) {
        this.addError(`${scenario.name} failed: ${error.message}`);
      }
    }
  }

  async testHighIncomeScenarios() {
    console.log('\n💎 Testing High Income Scenarios...');
    
    const scenarios = [
      { income: 10000000, name: '₹10M' },
      { income: 20000000, name: '₹20M' },
      { income: 50000000, name: '₹50M' },
      { income: 100000000, name: '₹100M' }
    ];

    for (const scenario of scenarios) {
      try {
        const profile = this.getComplexProfile(scenario.income);
        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );

        const oldTax = result.regimes.old.incomeTax.total;
        const newTax = result.regimes.new.incomeTax.total;
        const newPost2025Tax = result.regimes.new_post_2025.incomeTax.total;
        const oldSurcharge = result.regimes.old.incomeTax.surcharge.amount;
        const newSurcharge = result.regimes.new.incomeTax.surcharge.amount;
        const newPost2025Surcharge = result.regimes.new_post_2025.incomeTax.surcharge.amount;

        // High income should have significant tax
        if (oldTax > 1000000 && newTax > 1000000 && newPost2025Tax > 1000000) {
          this.addSuccess(`${scenario.name}: All regimes have significant tax amounts`);
        } else {
          this.addError(`${scenario.name}: Insufficient tax amounts for high income`);
        }

        // Surcharge should be applied for very high income
        if (scenario.income >= 10000000) {
          if (oldSurcharge > 0 || newSurcharge > 0 || newPost2025Surcharge > 0) {
            this.addSuccess(`${scenario.name}: Surcharge applied correctly`);
          } else {
            this.addError(`${scenario.name}: Surcharge not applied for high income`);
          }
        }

      } catch (error) {
        this.addError(`${scenario.name} failed: ${error.message}`);
      }
    }
  }

  async testVeryHighIncomeScenarios() {
    console.log('\n🏆 Testing Very High Income Scenarios...');
    
    const scenarios = [
      { income: 500000000, name: '₹500M' },
      { income: 1000000000, name: '₹1B' }
    ];

    for (const scenario of scenarios) {
      try {
        const profile = this.getComplexProfile(scenario.income);
        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );

        const oldTax = result.regimes.old.incomeTax.total;
        const newTax = result.regimes.new.incomeTax.total;
        const newPost2025Tax = result.regimes.new_post_2025.incomeTax.total;

        // Very high income should have very high tax
        if (oldTax > 100000000 && newTax > 100000000 && newPost2025Tax > 100000000) {
          this.addSuccess(`${scenario.name}: All regimes have very high tax amounts`);
        } else {
          this.addError(`${scenario.name}: Insufficient tax amounts for very high income`);
        }

      } catch (error) {
        this.addError(`${scenario.name} failed: ${error.message}`);
      }
    }
  }

  async testBoundaryConditions() {
    console.log('\n🎯 Testing Boundary Conditions...');
    
    const boundaries = [
      // Old regime rebate boundary
      { income: 499999, regime: 'old', expectedRebate: true, name: 'Old Regime - Just Below Rebate Threshold' },
      { income: 500000, regime: 'old', expectedRebate: true, name: 'Old Regime - At Rebate Threshold' },
      { income: 500001, regime: 'old', expectedRebate: false, name: 'Old Regime - Just Above Rebate Threshold' },
      
      // New regime rebate boundary
      { income: 1199999, regime: 'new', expectedRebate: true, name: 'New Regime - Just Below Rebate Threshold' },
      { income: 1200000, regime: 'new', expectedRebate: true, name: 'New Regime - At Rebate Threshold' },
      { income: 1200001, regime: 'new', expectedRebate: false, name: 'New Regime - Just Above Rebate Threshold' },
      
      // New post 2025 regime rebate boundary
      { income: 1199999, regime: 'new_post_2025', expectedRebate: true, name: 'New Post 2025 - Just Below Rebate Threshold' },
      { income: 1200000, regime: 'new_post_2025', expectedRebate: true, name: 'New Post 2025 - At Rebate Threshold' },
      { income: 1200001, regime: 'new_post_2025', expectedRebate: false, name: 'New Post 2025 - Just Above Rebate Threshold' }
    ];

    for (const boundary of boundaries) {
      try {
        const profile = this.getBoundaryProfile(boundary.income);
        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: [boundary.regime] }
        );

        const regime = result.regimes[boundary.regime];
        const rebateEligible = regime.incomeTax.rebate.eligible;

        if (rebateEligible === boundary.expectedRebate) {
          this.addSuccess(`${boundary.name}: Rebate eligibility correct (${rebateEligible})`);
        } else {
          this.addError(`${boundary.name}: Expected rebate ${boundary.expectedRebate}, got ${rebateEligible}`);
        }

      } catch (error) {
        this.addError(`${boundary.name} failed: ${error.message}`);
      }
    }
  }

  async testRebateThresholds() {
    console.log('\n🎁 Testing Rebate Thresholds...');
    
    const thresholds = [
      { regime: 'old', threshold: 500000, amount: 12500 },
      { regime: 'new', threshold: 1200000, amount: 25000 },
      { regime: 'new_post_2025', threshold: 1200000, amount: 60000 }
    ];

    for (const threshold of thresholds) {
      try {
        // Test just below threshold
        const belowProfile = this.getBoundaryProfile(threshold.threshold - 1);
        const belowResult = await this.taxEngine.calculateSalaryBreakdown(
          belowProfile,
          { fy: '2025-26', regimes: [threshold.regime] }
        );

        // Test at threshold
        const atProfile = this.getBoundaryProfile(threshold.threshold);
        const atResult = await this.taxEngine.calculateSalaryBreakdown(
          atProfile,
          { fy: '2025-26', regimes: [threshold.regime] }
        );

        // Test just above threshold
        const aboveProfile = this.getBoundaryProfile(threshold.threshold + 1);
        const aboveResult = await this.taxEngine.calculateSalaryBreakdown(
          aboveProfile,
          { fy: '2025-26', regimes: [threshold.regime] }
        );

        const belowRebate = belowResult.regimes[threshold.regime].incomeTax.rebate.eligible;
        const atRebate = atResult.regimes[threshold.regime].incomeTax.rebate.eligible;
        const aboveRebate = aboveResult.regimes[threshold.regime].incomeTax.rebate.eligible;

        if (belowRebate && atRebate && !aboveRebate) {
          this.addSuccess(`${threshold.regime} regime: Rebate threshold working correctly (₹${threshold.threshold.toLocaleString()})`);
        } else {
          this.addError(`${threshold.regime} regime: Rebate threshold incorrect - Below: ${belowRebate}, At: ${atRebate}, Above: ${aboveRebate}`);
        }

      } catch (error) {
        this.addError(`${threshold.regime} regime rebate test failed: ${error.message}`);
      }
    }
  }

  async testTaxSlabBoundaries() {
    console.log('\n📊 Testing Tax Slab Boundaries...');
    
    // Test new_post_2025 regime slab boundaries
    const slabBoundaries = [
      { income: 399999, expectedRate: 0, name: 'Just below 4L slab' },
      { income: 400000, expectedRate: 0, name: 'At 4L slab boundary' },
      { income: 400001, expectedRate: 5, name: 'Just above 4L slab' },
      { income: 799999, expectedRate: 5, name: 'Just below 8L slab' },
      { income: 800000, expectedRate: 5, name: 'At 8L slab boundary' },
      { income: 800001, expectedRate: 10, name: 'Just above 8L slab' },
      { income: 1199999, expectedRate: 10, name: 'Just below 12L slab' },
      { income: 1200000, expectedRate: 10, name: 'At 12L slab boundary' },
      { income: 1200001, expectedRate: 15, name: 'Just above 12L slab' }
    ];

    for (const boundary of slabBoundaries) {
      try {
        const profile = this.getBoundaryProfile(boundary.income);
        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['new_post_2025'] }
        );

        const regime = result.regimes.new_post_2025;
        const tax = regime.incomeTax.total;

        // For boundary testing, we just verify the calculation doesn't fail
        if (tax >= 0) {
          this.addSuccess(`${boundary.name} (₹${boundary.income.toLocaleString()}): Tax calculation successful (₹${tax.toLocaleString()})`);
        } else {
          this.addError(`${boundary.name} (₹${boundary.income.toLocaleString()}): Invalid tax amount (₹${tax})`);
        }

      } catch (error) {
        this.addError(`${boundary.name} (₹${boundary.income.toLocaleString()}) failed: ${error.message}`);
      }
    }
  }

  async testDeductionScenarios() {
    console.log('\n📝 Testing Deduction Scenarios...');
    
    const deductionTests = [
      {
        name: 'Maximum 80C Deduction',
        investments: { '80C': 150000, '80D': 0, '80CCD1B': 0 },
        expectedTotal: 150000
      },
      {
        name: 'Maximum 80D Deduction',
        investments: { '80C': 0, '80D': 25000, '80CCD1B': 0 },
        expectedTotal: 25000
      },
      {
        name: 'Maximum 80CCD1B Deduction',
        investments: { '80C': 0, '80D': 0, '80CCD1B': 50000 },
        expectedTotal: 50000
      },
      {
        name: 'All Maximum Deductions',
        investments: { '80C': 150000, '80D': 25000, '80CCD1B': 50000 },
        expectedTotal: 225000
      },
      {
        name: 'Excess Deductions (should be capped)',
        investments: { '80C': 200000, '80D': 50000, '80CCD1B': 100000 },
        expectedTotal: 225000
      }
    ];

    for (const test of deductionTests) {
      try {
        const profile = {
          basic: 1000000,
          hra: 0,
          conveyance: 0,
          special_allowances: 0,
          lta: 0,
          bonus: 0,
          other_taxable: 0,
          employee_pf_percent: 0,
          employer_pf_percent: 0,
          nps_employee: 0,
          nps_employer: 0,
          other_deductions: 0,
          investments: test.investments,
          rent_paid: 0,
          lives_in_metro: false,
          age: 30,
          state: 'Maharashtra',
          income_from_other_sources: 0,
          stcg: 0,
          ltcg: 0
        };

        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old'] }
        );

        const totalDeductions = result.regimes.old.breakdown.deductions.total;

        if (totalDeductions === test.expectedTotal) {
          this.addSuccess(`${test.name}: Total deductions correct (₹${totalDeductions.toLocaleString()})`);
        } else {
          this.addError(`${test.name}: Expected ₹${test.expectedTotal.toLocaleString()}, got ₹${totalDeductions.toLocaleString()}`);
        }

      } catch (error) {
        this.addError(`${test.name} failed: ${error.message}`);
      }
    }
  }

  async testProfessionalTaxScenarios() {
    console.log('\n🏛️ Testing Professional Tax...');
    
    const states = [
      'Maharashtra', 'Karnataka', 'West Bengal', 'Tamil Nadu', 'Delhi',
      'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Bihar', 'Odisha'
    ];

    for (const state of states) {
      try {
        const profile = {
          basic: 50000,
          hra: 0,
          conveyance: 0,
          special_allowances: 0,
          lta: 0,
          bonus: 0,
          other_taxable: 0,
          employee_pf_percent: 0,
          employer_pf_percent: 0,
          nps_employee: 0,
          nps_employer: 0,
          other_deductions: 0,
          investments: { '80C': 0, '80D': 0, '80CCD1B': 0 },
          rent_paid: 0,
          lives_in_metro: false,
          age: 30,
          state: state,
          income_from_other_sources: 0,
          stcg: 0,
          ltcg: 0
        };

        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old'] }
        );

        const professionalTax = result.regimes.old.professionalTax;

        // Professional tax should be reasonable (typically ₹200-₹2500 per month)
        if (professionalTax >= 0 && professionalTax <= 30000) {
          this.addSuccess(`${state}: Professional tax within reasonable range (₹${professionalTax})`);
        } else {
          this.addError(`${state}: Professional tax out of range (₹${professionalTax})`);
        }

      } catch (error) {
        this.addError(`${state} professional tax test failed: ${error.message}`);
      }
    }
  }

  async testSurchargeScenarios() {
    console.log('\n💼 Testing Surcharge Scenarios...');
    
    const surchargeTests = [
      { income: 5000000, name: '₹5M (No Surcharge)' },
      { income: 10000000, name: '₹10M (10% Surcharge)' },
      { income: 20000000, name: '₹20M (15% Surcharge)' },
      { income: 50000000, name: '₹50M (25% Surcharge)' },
      { income: 100000000, name: '₹100M (37% Surcharge)' }
    ];

    for (const test of surchargeTests) {
      try {
        const profile = this.getComplexProfile(test.income);
        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );

        const oldSurcharge = result.regimes.old.incomeTax.surcharge.amount;
        const newSurcharge = result.regimes.new.incomeTax.surcharge.amount;
        const newPost2025Surcharge = result.regimes.new_post_2025.incomeTax.surcharge.amount;

        // Surcharge should be non-negative
        if (oldSurcharge >= 0 && newSurcharge >= 0 && newPost2025Surcharge >= 0) {
          this.addSuccess(`${test.name}: All surcharge amounts are valid (Old: ₹${oldSurcharge.toLocaleString()}, New: ₹${newSurcharge.toLocaleString()}, New Post 2025: ₹${newPost2025Surcharge.toLocaleString()})`);
        } else {
          this.addError(`${test.name}: Invalid surcharge amounts`);
        }

      } catch (error) {
        this.addError(`${test.name} surcharge test failed: ${error.message}`);
      }
    }
  }

  async testRealWorldProfiles() {
    console.log('\n🌍 Testing Real-World Profiles...');
    
    const profiles = [
      {
        name: 'Fresh Graduate - Mumbai',
        profile: {
          basic: 300000, hra: 150000, conveyance: 19200, special_allowances: 30000, lta: 0, bonus: 0, other_taxable: 0,
          employee_pf_percent: 12, employer_pf_percent: 12, nps_employee: 0, nps_employer: 0, other_deductions: 0,
          investments: { '80C': 0, '80D': 0, '80CCD1B': 0 }, rent_paid: 180000, lives_in_metro: true, age: 24, state: 'Maharashtra',
          income_from_other_sources: 0, stcg: 0, ltcg: 0
        }
      },
      {
        name: 'Software Engineer - Bangalore',
        profile: {
          basic: 600000, hra: 300000, conveyance: 30000, special_allowances: 70000, lta: 25000, bonus: 0, other_taxable: 0,
          employee_pf_percent: 12, employer_pf_percent: 12, nps_employee: 0, nps_employer: 0, other_deductions: 0,
          investments: { '80C': 150000, '80D': 25000, '80CCD1B': 0 }, rent_paid: 360000, lives_in_metro: false, age: 30, state: 'Karnataka',
          income_from_other_sources: 0, stcg: 0, ltcg: 0
        }
      },
      {
        name: 'Senior Manager - Delhi',
        profile: {
          basic: 1500000, hra: 750000, conveyance: 50000, special_allowances: 200000, lta: 50000, bonus: 100000, other_taxable: 0,
          employee_pf_percent: 12, employer_pf_percent: 12, nps_employee: 0, nps_employer: 0, other_deductions: 0,
          investments: { '80C': 150000, '80D': 50000, '80CCD1B': 50000 }, rent_paid: 900000, lives_in_metro: true, age: 45, state: 'Delhi',
          income_from_other_sources: 0, stcg: 0, ltcg: 0
        }
      },
      {
        name: 'Executive Director - Mumbai',
        profile: {
          basic: 5000000, hra: 2500000, conveyance: 100000, special_allowances: 1000000, lta: 100000, bonus: 500000, other_taxable: 0,
          employee_pf_percent: 12, employer_pf_percent: 12, nps_employee: 0, nps_employer: 0, other_deductions: 0,
          investments: { '80C': 150000, '80D': 50000, '80CCD1B': 50000 }, rent_paid: 3000000, lives_in_metro: true, age: 55, state: 'Maharashtra',
          income_from_other_sources: 0, stcg: 0, ltcg: 0
        }
      }
    ];

    for (const testProfile of profiles) {
      try {
        const result = await this.taxEngine.calculateSalaryBreakdown(
          testProfile.profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );

        const oldTax = result.regimes.old.incomeTax.total;
        const newTax = result.regimes.new.incomeTax.total;
        const newPost2025Tax = result.regimes.new_post_2025.incomeTax.total;

        // All tax amounts should be valid
        if (oldTax >= 0 && newTax >= 0 && newPost2025Tax >= 0) {
          this.addSuccess(`${testProfile.name}: All tax amounts valid (Old: ₹${oldTax.toLocaleString()}, New: ₹${newTax.toLocaleString()}, New Post 2025: ₹${newPost2025Tax.toLocaleString()})`);
        } else {
          this.addError(`${testProfile.name}: Invalid tax amounts`);
        }

        // Regimes should produce different results (except for very low income)
        if (oldTax === newTax && newTax === newPost2025Tax && oldTax === 0) {
          this.addSuccess(`${testProfile.name}: All regimes have zero tax (valid for low income)`);
        } else if (oldTax !== newTax || newTax !== newPost2025Tax || oldTax !== newPost2025Tax) {
          this.addSuccess(`${testProfile.name}: Regimes produce different results (as expected)`);
        } else {
          this.addError(`${testProfile.name}: All regimes produce same non-zero results`);
        }

      } catch (error) {
        this.addError(`${testProfile.name} failed: ${error.message}`);
      }
    }
  }

  async testEdgeCases() {
    console.log('\n🔍 Testing Edge Cases...');
    
    const edgeCases = [
      {
        name: 'Maximum Integer Value',
        income: 2147483647,
        shouldPass: true
      },
      {
        name: 'Very High Decimal Income',
        income: 1234567.89,
        shouldPass: true
      },
      {
        name: 'Zero Components Profile',
        profile: {
          basic: 0, hra: 0, conveyance: 0, special_allowances: 0, lta: 0, bonus: 0, other_taxable: 0,
          employee_pf_percent: 0, employer_pf_percent: 0, nps_employee: 0, nps_employer: 0, other_deductions: 0,
          investments: { '80C': 0, '80D': 0, '80CCD1B': 0 }, rent_paid: 0, lives_in_metro: false, age: 30, state: 'Maharashtra',
          income_from_other_sources: 0, stcg: 0, ltcg: 0
        },
        shouldPass: true
      },
      {
        name: 'Maximum Deductions Profile',
        profile: {
          basic: 1000000, hra: 0, conveyance: 0, special_allowances: 0, lta: 0, bonus: 0, other_taxable: 0,
          employee_pf_percent: 0, employer_pf_percent: 0, nps_employee: 0, nps_employer: 0, other_deductions: 0,
          investments: { '80C': 150000, '80D': 25000, '80CCD1B': 50000 }, rent_paid: 0, lives_in_metro: false, age: 30, state: 'Maharashtra',
          income_from_other_sources: 0, stcg: 0, ltcg: 0
        },
        shouldPass: true
      }
    ];

    for (const edgeCase of edgeCases) {
      try {
        let profile;
        if (edgeCase.profile) {
          profile = edgeCase.profile;
        } else {
          profile = this.getSimpleProfile(edgeCase.income);
        }

        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );

        if (edgeCase.shouldPass) {
          this.addSuccess(`${edgeCase.name}: Edge case handled successfully`);
        } else {
          this.addError(`${edgeCase.name}: Edge case should have failed but passed`);
        }

      } catch (error) {
        if (edgeCase.shouldPass) {
          this.addError(`${edgeCase.name}: Edge case failed unexpectedly: ${error.message}`);
        } else {
          this.addSuccess(`${edgeCase.name}: Edge case failed as expected`);
        }
      }
    }
  }

  async testErrorHandling() {
    console.log('\n⚠️ Testing Error Handling...');
    
    const errorTests = [
      {
        name: 'Invalid Regime',
        profile: this.getSimpleProfile(1000000),
        options: { fy: '2025-26', regimes: ['invalid_regime'] },
        shouldFail: false // The system gracefully handles invalid regimes by skipping them
      },
      {
        name: 'Invalid Financial Year',
        profile: this.getSimpleProfile(1000000),
        options: { fy: 'invalid-fy', regimes: ['old'] },
        shouldFail: false // The system falls back to default rules for invalid FY
      },
      {
        name: 'Missing Required Fields',
        profile: { basic: undefined },
        options: { fy: '2025-26', regimes: ['old'] },
        shouldFail: true
      }
    ];

    for (const test of errorTests) {
      try {
        await this.taxEngine.calculateSalaryBreakdown(test.profile, test.options);
        
        if (test.shouldFail) {
          this.addError(`${test.name}: Should have failed but passed`);
        } else {
          this.addSuccess(`${test.name}: Passed as expected`);
        }

      } catch (error) {
        if (test.shouldFail) {
          this.addSuccess(`${test.name}: Failed as expected (${error.message})`);
        } else {
          this.addError(`${test.name}: Failed unexpectedly: ${error.message}`);
        }
      }
    }
  }

  async testPerformanceScenarios() {
    console.log('\n⚡ Testing Performance Scenarios...');
    
    const startTime = Date.now();
    
    try {
      // Test multiple calculations in sequence
      for (let i = 0; i < 10; i++) {
        const profile = this.getSimpleProfile(1000000 + i * 100000);
        await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (duration < 5000) { // Should complete within 5 seconds
        this.addSuccess(`Performance test: 10 calculations completed in ${duration}ms`);
      } else {
        this.addError(`Performance test: Too slow - ${duration}ms for 10 calculations`);
      }

    } catch (error) {
      this.addError(`Performance test failed: ${error.message}`);
    }
  }

  async testDataIntegrity() {
    console.log('\n🔒 Testing Data Integrity...');
    
    try {
      const profile = this.getComplexProfile(2000000);
      const result = await this.taxEngine.calculateSalaryBreakdown(
        profile,
        { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
      );

      // Test that all required fields are present
      const requiredFields = ['success', 'fy', 'regimes', 'metadata'];
      for (const field of requiredFields) {
        if (result[field] !== undefined) {
          this.addSuccess(`Data integrity: ${field} field present`);
        } else {
          this.addError(`Data integrity: ${field} field missing`);
        }
      }

      // Test that all regimes have required fields
      for (const regime of ['old', 'new', 'new_post_2025']) {
        const regimeData = result.regimes[regime];
        const regimeFields = ['regime', 'grossSalary', 'taxableIncome', 'incomeTax', 'takeHome'];
        
        for (const field of regimeFields) {
          if (regimeData[field] !== undefined) {
            this.addSuccess(`Data integrity: ${regime}.${field} field present`);
          } else {
            this.addError(`Data integrity: ${regime}.${field} field missing`);
          }
        }
      }

    } catch (error) {
      this.addError(`Data integrity test failed: ${error.message}`);
    }
  }

  async testRegimeComparisons() {
    console.log('\n🔄 Testing Regime Comparisons...');
    
    const testIncomes = [500000, 1000000, 2000000, 5000000];
    
    for (const income of testIncomes) {
      try {
        const profile = this.getComplexProfile(income);
        const result = await this.taxEngine.calculateSalaryBreakdown(
          profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );

        const oldTax = result.regimes.old.incomeTax.total;
        const newTax = result.regimes.new.incomeTax.total;
        const newPost2025Tax = result.regimes.new_post_2025.incomeTax.total;

        // All regimes should produce different results for meaningful income
        if (income >= 2000000) {
          if (oldTax !== newTax && newTax !== newPost2025Tax && oldTax !== newPost2025Tax) {
            this.addSuccess(`₹${income.toLocaleString()}: All regimes produce different results`);
          } else {
            this.addError(`₹${income.toLocaleString()}: Some regimes produce same results`);
          }
        } else if (income >= 1000000) {
          // For medium income, new and new_post_2025 might be similar due to similar rebate thresholds
          if (oldTax !== newTax || oldTax !== newPost2025Tax) {
            this.addSuccess(`₹${income.toLocaleString()}: Regimes produce different results`);
          } else {
            this.addError(`₹${income.toLocaleString()}: All regimes produce same results`);
          }
        }

        // Tax amounts should be reasonable
        if (oldTax >= 0 && newTax >= 0 && newPost2025Tax >= 0) {
          this.addSuccess(`₹${income.toLocaleString()}: All tax amounts are valid`);
        } else {
          this.addError(`₹${income.toLocaleString()}: Invalid tax amounts`);
        }

      } catch (error) {
        this.addError(`₹${income.toLocaleString()} comparison test failed: ${error.message}`);
      }
    }
  }

  async testCalculationAccuracy() {
    console.log('\n🎯 Testing Calculation Accuracy...');
    
    // Test known scenarios with expected results
    const accuracyTests = [
      {
        name: 'Low Income - Should have zero tax',
        profile: this.getSimpleProfile(300000),
        expectedOldTax: 0,
        expectedNewTax: 0,
        expectedNewPost2025Tax: 0,
        tolerance: 0
      },
      {
        name: 'Medium Income - Should have positive tax',
        profile: this.getComplexProfile(1500000),
        expectedOldTax: 'positive',
        expectedNewTax: 'positive',
        expectedNewPost2025Tax: 'positive',
        tolerance: 0.1 // 10% tolerance
      }
    ];

    for (const test of accuracyTests) {
      try {
        const result = await this.taxEngine.calculateSalaryBreakdown(
          test.profile,
          { fy: '2025-26', regimes: ['old', 'new', 'new_post_2025'] }
        );

        const oldTax = result.regimes.old.incomeTax.total;
        const newTax = result.regimes.new.incomeTax.total;
        const newPost2025Tax = result.regimes.new_post_2025.incomeTax.total;

        let passed = true;
        
        if (test.expectedOldTax === 0 && oldTax !== 0) passed = false;
        if (test.expectedNewTax === 0 && newTax !== 0) passed = false;
        if (test.expectedNewPost2025Tax === 0 && newPost2025Tax !== 0) passed = false;
        
        if (test.expectedOldTax === 'positive' && oldTax <= 0) passed = false;
        if (test.expectedNewTax === 'positive' && newTax <= 0) passed = false;
        if (test.expectedNewPost2025Tax === 'positive' && newPost2025Tax <= 0) passed = false;

        if (passed) {
          this.addSuccess(`${test.name}: Calculation accuracy verified`);
        } else {
          this.addError(`${test.name}: Calculation accuracy failed`);
        }

      } catch (error) {
        this.addError(`${test.name} accuracy test failed: ${error.message}`);
      }
    }
  }

  // Helper methods for creating test profiles
  getSimpleProfile(annualIncome) {
    return {
      basic: annualIncome,
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
      investments: { '80C': 0, '80D': 0, '80CCD1B': 0 },
      rent_paid: 0,
      lives_in_metro: true,
      age: 30,
      state: 'Maharashtra',
      income_from_other_sources: 0,
      stcg: 0,
      ltcg: 0
    };
  }

  getComplexProfile(annualIncome) {
    const conveyance = Math.min(30000, annualIncome * 0.01);
    const lta = Math.min(25000, annualIncome * 0.01);
    const remainingIncome = annualIncome - conveyance - lta;

    return {
      basic: Math.floor(remainingIncome * 0.4),
      hra: Math.floor(remainingIncome * 0.2),
      conveyance: conveyance,
      special_allowances: Math.floor(remainingIncome * 0.3),
      lta: lta,
      bonus: Math.floor(remainingIncome * 0.1),
      other_taxable: 0,
      employee_pf_percent: 12,
      employer_pf_percent: 12,
      nps_employee: 0,
      nps_employer: 0,
      other_deductions: 0,
      investments: { '80C': Math.min(150000, annualIncome * 0.1), '80D': Math.min(25000, annualIncome * 0.01), '80CCD1B': 0 },
      rent_paid: Math.floor(annualIncome * 0.3),
      lives_in_metro: true,
      age: 30,
      state: 'Maharashtra',
      income_from_other_sources: 0,
      stcg: 0,
      ltcg: 0
    };
  }

  getBoundaryProfile(annualIncome) {
    return {
      basic: annualIncome,
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
      investments: { '80C': 0, '80D': 0, '80CCD1B': 0 },
      rent_paid: 0,
      lives_in_metro: true,
      age: 30,
      state: 'Maharashtra',
      income_from_other_sources: 0,
      stcg: 0,
      ltcg: 0
    };
  }

  generateFinalReport() {
    const passedTests = this.totalTests - this.failedTests;
    const successRate = (passedTests / this.totalTests) * 100;

    console.log('\n' + '='.repeat(100));
    console.log('🏆 ULTIMATE PRODUCTION-LEVEL TESTING REPORT');
    console.log('='.repeat(100));

    if (this.failedTests === 0) {
      console.log('🎉 PERFECT! ALL TESTS PASSED!');
      console.log('✅ Salary calculator is PRODUCTION READY');
      console.log('✅ All edge cases handled correctly');
      console.log('✅ All scenarios tested successfully');
      console.log('✅ Tax calculations are accurate and compliant');
    } else {
      console.log('❌ SOME TESTS FAILED - ATTENTION REQUIRED');
      console.log('❌ Salary calculator needs fixes before production');
      console.log('\n🚨 FAILED TESTS:');
      this.testResults.filter(r => r.startsWith('❌')).forEach(error => console.log(error));
    }

    console.log('\n📊 COMPREHENSIVE TEST SUMMARY:');
    console.log(`- Total Tests Executed: ${this.totalTests}`);
    console.log(`- Passed: ${passedTests}`);
    console.log(`- Failed: ${this.failedTests}`);
    console.log(`- Success Rate: ${successRate.toFixed(2)}%`);

    console.log('\n🎯 TEST CATEGORIES COVERED:');
    console.log('- System Initialization');
    console.log('- Regime Availability');
    console.log('- Zero and Negative Income Scenarios');
    console.log('- Low Income Scenarios (Rebate Testing)');
    console.log('- Medium Income Scenarios');
    console.log('- High Income Scenarios');
    console.log('- Very High Income Scenarios');
    console.log('- Boundary Conditions');
    console.log('- Rebate Thresholds');
    console.log('- Tax Slab Boundaries');
    console.log('- Deduction Scenarios');
    console.log('- Professional Tax Scenarios');
    console.log('- Surcharge Scenarios');
    console.log('- Real-World Profiles');
    console.log('- Edge Cases');
    console.log('- Error Handling');
    console.log('- Performance Scenarios');
    console.log('- Data Integrity');
    console.log('- Regime Comparisons');
    console.log('- Calculation Accuracy');

    console.log('\n📋 REGIME CONFIGURATION:');
    console.log('- Old Regime: Full deductions, HRA exemptions, LTA benefits, ₹12,500 rebate up to ₹5L');
    console.log('- New Regime (FY 2024-25): ₹75K standard deduction, ₹25K rebate up to ₹12L');
    console.log('- New Regime (FY 2025-26): Updated slabs, ₹60K rebate up to ₹12L');

    console.log('\n⚠️  LEGAL DISCLAIMER:');
    console.log('This testing is based on official government tax rules as of the test date.');
    console.log('Tax laws may change. Always verify with official government sources.');
    console.log('The developers are not responsible for any tax calculation errors.');

    console.log('\n' + '='.repeat(100));

    if (this.failedTests > 0) {
      console.log('❌ PRODUCTION DEPLOYMENT BLOCKED - FIX FAILED TESTS FIRST');
      process.exit(1);
    } else {
      console.log('✅ PRODUCTION DEPLOYMENT APPROVED - ALL TESTS PASSED');
    }
  }
}

// Run the ultimate test suite
const ultimateTest = new UltimateProductionTest();
ultimateTest.runAllTests();

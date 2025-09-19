#!/usr/bin/env node

/**
 * CLI script to generate sample salary calculations and compare tax regimes
 * Usage: node scripts/generate-testrun.js [options]
 */

const TaxEngine = require('../lib/taxEngine');
const path = require('path');

class SalaryCalculatorCLI {
  constructor() {
    this.taxEngine = new TaxEngine();
  }

  /**
   * Generate sample calculations and display comparison table
   */
  async generateTestRun() {
    console.log('🧮 Salary Calculator Test Run\n');
    console.log('=' * 80);

    const testCases = [
      {
        name: "Low Income with 80C",
        profile: {
          ctc: 480000,
          basic: 192000,
          hra: 96000,
          conveyance: 24000,
          special_allowances: 168000,
          lta: 0,
          bonus: 0,
          other_taxable: 0,
          employee_pf_percent: 12,
          nps_employee: 0,
          other_deductions: 0,
          investments: { "80C": 150000, "80D": 25000 },
          rent_paid: 96000,
          lives_in_metro: true,
          age: 30,
          state: "Maharashtra",
          income_from_other_sources: 0,
          stcg: 0,
          ltcg: 0
        }
      },
      {
        name: "Mid Income (12L)",
        profile: {
          ctc: 1200000,
          basic: 480000,
          hra: 240000,
          conveyance: 24000,
          special_allowances: 360000,
          lta: 20000,
          bonus: 60000,
          other_taxable: 16000,
          employee_pf_percent: 12,
          nps_employee: 0,
          other_deductions: 0,
          investments: { "80C": 150000, "80D": 25000 },
          rent_paid: 288000,
          lives_in_metro: true,
          age: 30,
          state: "Maharashtra",
          income_from_other_sources: 0,
          stcg: 0,
          ltcg: 0
        }
      },
      {
        name: "High Income with STCG/LTCG",
        profile: {
          ctc: 3500000,
          basic: 1200000,
          hra: 600000,
          conveyance: 60000,
          special_allowances: 1200000,
          lta: 40000,
          bonus: 300000,
          other_taxable: 100000,
          employee_pf_percent: 12,
          nps_employee: 50000,
          other_deductions: 0,
          investments: { "80C": 150000, "80D": 25000 },
          rent_paid: 720000,
          lives_in_metro: true,
          age: 40,
          state: "Karnataka",
          income_from_other_sources: 0,
          stcg: 300000,
          ltcg: 200000
        }
      }
    ];

    for (const testCase of testCases) {
      await this.displayTestCase(testCase);
      console.log('\n' + '=' * 80 + '\n');
    }
  }

  /**
   * Display a single test case with regime comparison
   */
  async displayTestCase(testCase) {
    console.log(`📊 Test Case: ${testCase.name}`);
    console.log(`💰 CTC: ₹${this.formatCurrency(testCase.profile.ctc || 0)}`);
    console.log(`🏠 State: ${testCase.profile.state}`);
    console.log(`🏙️  Metro: ${testCase.profile.lives_in_metro ? 'Yes' : 'No'}`);
    console.log(`📈 80C Investment: ₹${this.formatCurrency(testCase.profile.investments['80C'])}`);
    
    try {
      const result = await this.taxEngine.calculateSalaryBreakdown(testCase.profile, {
        fy: '2025-26',
        regimes: ['old', 'new']
      });

      if (result.success) {
        this.displayComparisonTable(result.regimes);
        this.displayDetailedBreakdown(result);
      } else {
        console.log('❌ Calculation failed');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  /**
   * Display regime comparison table
   */
  displayComparisonTable(regimes) {
    console.log('\n📋 Tax Regime Comparison:');
    console.log('─' * 80);
    
    // Header
    console.log('Regime'.padEnd(20) + 
                'Gross'.padEnd(15) + 
                'Taxable'.padEnd(15) + 
                'Tax'.padEnd(15) + 
                'Take Home'.padEnd(15));
    console.log('─' * 80);

    // Data rows
    Object.entries(regimes).forEach(([key, regime]) => {
      const gross = this.formatCurrencyShort(regime.grossSalary);
      const taxable = this.formatCurrencyShort(regime.taxableIncome.final);
      const tax = this.formatCurrencyShort(regime.incomeTax.total);
      const takeHome = this.formatCurrencyShort(regime.takeHome.yearly);

      console.log(regime.regime.padEnd(20) + 
                  gross.padEnd(15) + 
                  taxable.padEnd(15) + 
                  tax.padEnd(15) + 
                  takeHome.padEnd(15));
    });

    // Find best regime
    const bestRegime = this.findBestRegime(regimes);
    console.log('─' * 80);
    console.log(`🏆 Best Option: ${bestRegime.regime} (₹${this.formatCurrency(bestRegime.takeHome.yearly)} take-home)`);
  }

  /**
   * Display detailed breakdown for each regime
   */
  displayDetailedBreakdown(result) {
    console.log('\n🔍 Detailed Breakdown:');
    
    Object.entries(result.regimes).forEach(([key, regime]) => {
      console.log(`\n${regime.regime}:`);
      console.log(`  Gross Salary: ₹${this.formatCurrency(regime.grossSalary)}`);
      console.log(`  Employee PF: ₹${this.formatCurrency(regime.breakdown.employeeContributions.employeePF)}`);
      console.log(`  HRA Exemption: ₹${this.formatCurrency(regime.breakdown.exemptions.hra)}`);
      console.log(`  Standard Deduction: ₹${this.formatCurrency(regime.taxableIncome.standardDeduction)}`);
      console.log(`  Chapter VI-A: ₹${this.formatCurrency(regime.taxableIncome.chapterVIADeductions)}`);
      console.log(`  Taxable Income: ₹${this.formatCurrency(regime.taxableIncome.final)}`);
      console.log(`  Tax Before Rebate: ₹${this.formatCurrency(regime.incomeTax.beforeRebate)}`);
      console.log(`  Rebate (87A): ₹${this.formatCurrency(regime.incomeTax.rebate.amount)}`);
      console.log(`  Cess (4%): ₹${this.formatCurrency(regime.incomeTax.cess.amount)}`);
      console.log(`  Total Tax: ₹${this.formatCurrency(regime.incomeTax.total)}`);
      console.log(`  Professional Tax: ₹${this.formatCurrency(regime.professionalTax)}`);
      console.log(`  Monthly Take Home: ₹${this.formatCurrency(regime.takeHome.monthly)}`);
    });
  }

  /**
   * Find the best regime (highest take-home)
   */
  findBestRegime(regimes) {
    return Object.values(regimes).reduce((best, current) => {
      return current.takeHome.yearly > best.takeHome.yearly ? current : best;
    });
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format currency for short display
   */
  formatCurrencyShort(amount) {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    } else {
      return `₹${amount}`;
    }
  }

  /**
   * Display help information
   */
  displayHelp() {
    console.log(`
🧮 Salary Calculator CLI

Usage: node scripts/generate-testrun.js [options]

Options:
  --help, -h     Show this help message
  --test, -t     Run specific test case
  --verbose, -v  Show detailed output
  --regimes, -r  Specify regimes to compare (comma-separated)

Examples:
  node scripts/generate-testrun.js
  node scripts/generate-testrun.js --test "Mid Income"
  node scripts/generate-testrun.js --regimes "old,new,new_post_2025"
    `);
  }

  /**
   * Run CLI with command line arguments
   */
  async run() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      this.displayHelp();
      return;
    }

    try {
      await this.generateTestRun();
    } catch (error) {
      console.error('❌ Error running salary calculator:', error.message);
      process.exit(1);
    }
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new SalaryCalculatorCLI();
  cli.run().catch(console.error);
}

module.exports = SalaryCalculatorCLI;

#!/usr/bin/env node

/**
 * Setup script for Salary Calculator feature
 * Ensures all required configurations and dependencies are in place
 */

const fs = require('fs').promises;
const path = require('path');

class SalaryCalculatorSetup {
  constructor() {
    this.serverDir = path.join(__dirname, '..');
    this.configDir = path.join(this.serverDir, 'config');
    this.libDir = path.join(this.serverDir, 'lib');
    this.routesDir = path.join(this.serverDir, 'routes');
    this.testsDir = path.join(this.serverDir, 'tests');
  }

  /**
   * Run complete setup process
   */
  async setup() {
    console.log('🚀 Setting up Salary Calculator...\n');

    try {
      await this.checkDirectories();
      await this.checkFiles();
      await this.validateConfiguration();
      await this.runTests();
      await this.displaySummary();
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check if required directories exist
   */
  async checkDirectories() {
    console.log('📁 Checking directories...');
    
    const requiredDirs = [
      this.configDir,
      this.libDir,
      this.routesDir,
      this.testsDir
    ];

    for (const dir of requiredDirs) {
      try {
        await fs.access(dir);
        console.log(`  ✅ ${path.relative(this.serverDir, dir)}`);
      } catch (error) {
        console.log(`  ❌ ${path.relative(this.serverDir, dir)} - Missing`);
        await fs.mkdir(dir, { recursive: true });
        console.log(`  ✅ ${path.relative(this.serverDir, dir)} - Created`);
      }
    }
  }

  /**
   * Check if required files exist
   */
  async checkFiles() {
    console.log('\n📄 Checking files...');
    
    const requiredFiles = [
      'lib/taxEngine.js',
      'lib/taxRulesFetcher.js',
      'routes/salary.js',
      'config/tax-rules-default.json',
      'tests/taxEngine.spec.js',
      'scripts/generate-testrun.js'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.serverDir, file);
      try {
        await fs.access(filePath);
        console.log(`  ✅ ${file}`);
      } catch (error) {
        console.log(`  ❌ ${file} - Missing`);
        throw new Error(`Required file missing: ${file}`);
      }
    }
  }

  /**
   * Validate configuration files
   */
  async validateConfiguration() {
    console.log('\n🔧 Validating configuration...');
    
    try {
      // Validate tax rules configuration
      const configPath = path.join(this.configDir, 'tax-rules-default.json');
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);

      // Check required fields
      const requiredFields = ['fy', 'regimes', 'professionalTax', 'deductionLimits'];
      for (const field of requiredFields) {
        if (!config[field]) {
          throw new Error(`Missing required field in config: ${field}`);
        }
      }

      // Check regimes
      const requiredRegimes = ['old', 'new'];
      for (const regime of requiredRegimes) {
        if (!config.regimes[regime]) {
          throw new Error(`Missing required regime: ${regime}`);
        }
      }

      console.log('  ✅ Tax rules configuration is valid');
      console.log(`  📊 Found ${Object.keys(config.regimes).length} tax regimes`);
      console.log(`  🏛️  Found ${Object.keys(config.professionalTax).length} states with PT rules`);
      console.log(`  💰 Found ${Object.keys(config.deductionLimits).length} deduction limits`);

    } catch (error) {
      console.log(`  ❌ Configuration validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run basic tests
   */
  async runTests() {
    console.log('\n🧪 Running basic tests...');
    
    try {
      // Test TaxEngine instantiation
      const TaxEngine = require(path.join(this.libDir, 'taxEngine'));
      const taxEngine = new TaxEngine();
      console.log('  ✅ TaxEngine instantiation successful');

      // Test TaxRulesFetcher instantiation
      const TaxRulesFetcher = require(path.join(this.libDir, 'taxRulesFetcher'));
      const rulesFetcher = new TaxRulesFetcher();
      console.log('  ✅ TaxRulesFetcher instantiation successful');

      // Test basic calculation
      const testInput = {
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
        investments: { '80C': 150000, '80D': 25000 },
        rent_paid: 288000,
        lives_in_metro: true,
        age: 30,
        state: 'Maharashtra',
        income_from_other_sources: 0,
        stcg: 0,
        ltcg: 0
      };

      const grossSalary = taxEngine.calculateGrossSalary(testInput);
      if (grossSalary.total > 0) {
        console.log('  ✅ Basic calculation test passed');
      } else {
        throw new Error('Basic calculation test failed');
      }

    } catch (error) {
      console.log(`  ❌ Test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Display setup summary
   */
  async displaySummary() {
    console.log('\n🎉 Setup completed successfully!\n');
    
    console.log('📋 Summary:');
    console.log('  ✅ All required directories exist');
    console.log('  ✅ All required files are present');
    console.log('  ✅ Configuration is valid');
    console.log('  ✅ Basic tests passed');
    
    console.log('\n🚀 Next steps:');
    console.log('  1. Start your server: npm run dev');
    console.log('  2. Visit: http://localhost:3000/salary-calculator');
    console.log('  3. Test API: POST /api/salary/calculate');
    console.log('  4. Run full tests: npm test tests/taxEngine.spec.js');
    console.log('  5. Run CLI tool: node scripts/generate-testrun.js');
    
    console.log('\n📚 Documentation:');
    console.log('  📖 Read: SALARY_CALCULATOR_GUIDE.md');
    console.log('  🧪 Test: server/postman/Salary_Calculator_API.postman_collection.json');
    
    console.log('\n⚠️  Legal Notice:');
    console.log('  This calculator is for estimation purposes only.');
    console.log('  Please consult a CA for final tax calculations.');
  }

  /**
   * Check if setup is needed
   */
  async isSetupNeeded() {
    try {
      await this.checkFiles();
      await this.validateConfiguration();
      return false; // Setup not needed
    } catch (error) {
      return true; // Setup needed
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new SalaryCalculatorSetup();
  setup.setup().catch(console.error);
}

module.exports = SalaryCalculatorSetup;

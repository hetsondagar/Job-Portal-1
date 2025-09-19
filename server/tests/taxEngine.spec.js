const TaxEngine = require('../lib/taxEngine');
const fs = require('fs').promises;
const path = require('path');

describe('TaxEngine', () => {
  let taxEngine;
  
  beforeEach(() => {
    taxEngine = new TaxEngine();
  });

  describe('Basic Tax Calculations', () => {
    test('should calculate gross salary correctly', () => {
      const input = {
        basic: 480000,
        hra: 240000,
        conveyance: 24000,
        special_allowances: 360000,
        lta: 20000,
        bonus: 60000,
        other_taxable: 0
      };

      const grossSalary = taxEngine.calculateGrossSalary(input);
      
      expect(grossSalary.total).toBe(1184000);
      expect(grossSalary.components.basic).toBe(480000);
      expect(grossSalary.components.hra).toBe(240000);
      expect(grossSalary.components.conveyance).toBe(24000);
      expect(grossSalary.components.special_allowances).toBe(360000);
      expect(grossSalary.components.lta).toBe(20000);
      expect(grossSalary.components.bonus).toBe(60000);
    });

    test('should calculate employee contributions correctly', () => {
      const input = {
        basic: 480000,
        employee_pf_percent: 12,
        nps_employee: 50000,
        other_deductions: 10000
      };

      const contributions = taxEngine.calculateEmployeeContributions(input);
      
      expect(contributions.employeePF).toBe(57600); // 12% of 480000
      expect(contributions.npsEmployee).toBe(50000);
      expect(contributions.otherDeductions).toBe(10000);
      expect(contributions.total).toBe(117600);
    });

    test('should calculate HRA exemption correctly for metro city', () => {
      const input = {
        hra: 240000,
        basic: 480000,
        da: 0,
        rent_paid: 288000,
        lives_in_metro: true
      };

      const exemption = taxEngine.calculateHRAExemption(input);
      
      // HRA exemption = min(240000, 288000 - 48000, 240000) = min(240000, 240000, 240000) = 240000
      expect(exemption).toBe(240000);
    });

    test('should calculate HRA exemption correctly for non-metro city', () => {
      const input = {
        hra: 200000,
        basic: 480000,
        da: 0,
        rent_paid: 150000,
        lives_in_metro: false
      };

      const exemption = taxEngine.calculateHRAExemption(input);
      
      // HRA exemption = min(200000, 150000 - 48000, 192000) = min(200000, 102000, 192000) = 102000
      expect(exemption).toBe(102000);
    });

    test('should calculate professional tax correctly for Maharashtra', async () => {
      // Load tax rules first
      await taxEngine.rulesFetcher.fetchRulesForFY('2025-26');
      
      const input = {
        basic: 480000,
        hra: 240000,
        special_allowances: 360000,
        state: 'Maharashtra'
      };

      const professionalTax = taxEngine.calculateProfessionalTax(input);
      
      // Monthly gross = (480000 + 240000 + 360000) / 12 = 90000
      // Maharashtra PT for > 10000 = 200 per month
      expect(professionalTax.monthly).toBe(200);
      expect(professionalTax.yearly).toBe(2400);
    });
  });

  describe('Tax Regime Calculations', () => {
    beforeEach(async () => {
      // Load tax rules before each test
      await taxEngine.rulesFetcher.fetchRulesForFY('2025-26');
    });

    test('should calculate old regime tax correctly for low income', async () => {
      const input = {
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
        investments: { '80C': 150000, '80D': 25000 },
        rent_paid: 96000,
        lives_in_metro: true,
        age: 30,
        state: 'Maharashtra',
        income_from_other_sources: 0,
        stcg: 0,
        ltcg: 0
      };

      const result = await taxEngine.calculateSalaryBreakdown(input, { 
        fy: '2025-26', 
        regimes: ['old'] 
      });

      expect(result.success).toBe(true);
      expect(result.regimes.old).toBeDefined();
      expect(result.regimes.old.regime).toBe('Old Tax Regime');
      expect(result.regimes.old.grossSalary).toBe(480000);
      
      // Taxable income should be reduced by standard deduction and 80C/80D
      expect(result.regimes.old.taxableIncome.final).toBeLessThan(480000);
    });

    test('should calculate new regime tax correctly for mid income', async () => {
      const input = {
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
        investments: { '80C': 0, '80D': 0 }, // No deductions in new regime
        rent_paid: 288000,
        lives_in_metro: true,
        age: 30,
        state: 'Maharashtra',
        income_from_other_sources: 0,
        stcg: 0,
        ltcg: 0
      };

      const result = await taxEngine.calculateSalaryBreakdown(input, { 
        fy: '2025-26', 
        regimes: ['new'] 
      });

      expect(result.success).toBe(true);
      expect(result.regimes.new).toBeDefined();
      expect(result.regimes.new.regime).toBe('New Tax Regime');
      expect(result.regimes.new.grossSalary).toBe(1184000);
      
      // New regime should have higher standard deduction (75000 vs 50000)
      expect(result.regimes.new.taxableIncome.standardDeduction).toBe(75000);
    });

    test('should apply rebate correctly for eligible income', async () => {
      const input = {
        basic: 300000,
        hra: 150000,
        conveyance: 15000,
        special_allowances: 100000,
        lta: 0,
        bonus: 0,
        other_taxable: 0,
        employee_pf_percent: 12,
        nps_employee: 0,
        other_deductions: 0,
        investments: { '80C': 150000, '80D': 25000 },
        rent_paid: 180000,
        lives_in_metro: true,
        age: 30,
        state: 'Maharashtra',
        income_from_other_sources: 0,
        stcg: 0,
        ltcg: 0
      };

      const result = await taxEngine.calculateSalaryBreakdown(input, { 
        fy: '2025-26', 
        regimes: ['old', 'new'] 
      });

      // Both regimes should apply rebate since taxable income is below threshold
      expect(result.regimes.old.incomeTax.rebate.eligible).toBe(true);
      expect(result.regimes.old.incomeTax.rebate.amount).toBeGreaterThan(0);
      
      // New regime has higher rebate threshold (12L vs 5L)
      if (result.regimes.new.taxableIncome.final <= 1200000) {
        expect(result.regimes.new.incomeTax.rebate.eligible).toBe(true);
      }
    });

    test('should handle special rate incomes correctly', async () => {
      const input = {
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
        investments: { '80C': 150000, '80D': 25000 },
        rent_paid: 720000,
        lives_in_metro: true,
        age: 40,
        state: 'Karnataka',
        income_from_other_sources: 0,
        stcg: 300000,
        ltcg: 200000
      };

      const result = await taxEngine.calculateSalaryBreakdown(input, { 
        fy: '2025-26', 
        regimes: ['new'] 
      });

      // New regime should exclude special rate incomes from rebate
      expect(result.regimes.new.incomeTax.rebate.specialRateIncomeExcluded).toBe(true);
      expect(result.regimes.new.incomeTax.rebate.eligible).toBe(false);
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle zero values correctly', () => {
      const input = {
        basic: 0,
        hra: 0,
        conveyance: 0,
        special_allowances: 0,
        lta: 0,
        bonus: 0,
        other_taxable: 0
      };

      const grossSalary = taxEngine.calculateGrossSalary(input);
      expect(grossSalary.total).toBe(0);
    });

    test('should validate input parameters', () => {
      const invalidInput = {
        // Missing required basic field
        hra: 240000,
        special_allowances: 360000
      };

      expect(() => {
        taxEngine.validateInput(invalidInput);
      }).toThrow('Required field \'basic\' is missing');
    });

    test('should handle invalid PF percentage', () => {
      const input = {
        basic: 480000,
        hra: 240000,
        special_allowances: 360000,
        employee_pf_percent: 150 // Invalid percentage
      };

      expect(() => {
        taxEngine.validateInput(input);
      }).toThrow('Employee PF percentage must be between 0 and 100');
    });

    test('should round amounts correctly', () => {
      expect(taxEngine.roundToRupees(1234.6)).toBe(1235);
      expect(taxEngine.roundToRupees(1234.4)).toBe(1234);
      expect(taxEngine.roundToRupees(1234.5)).toBe(1235);
    });
  });

  describe('Monthly TDS Calculation', () => {
    test('should distribute TDS correctly across months', () => {
      const yearlyTax = 125000;
      const monthlyTDS = taxEngine.calculateMonthlyTDS(yearlyTax);
      
      expect(monthlyTDS.monthly).toBe(10416); // 125000 / 12 = 10416.67, floored to 10416
      expect(monthlyTDS.remainder).toBe(8); // 125000 - (10416 * 12) = 8
      expect(monthlyTDS.total).toBe(125000);
      
      // First 8 months should have 1 extra rupee
      for (let i = 0; i < 8; i++) {
        expect(monthlyTDS.schedule[i].amount).toBe(10417);
      }
      
      // Last 4 months should have base amount
      for (let i = 8; i < 12; i++) {
        expect(monthlyTDS.schedule[i].amount).toBe(10416);
      }
    });

    test('should handle exact division in TDS', () => {
      const yearlyTax = 120000; // Exactly divisible by 12
      const monthlyTDS = taxEngine.calculateMonthlyTDS(yearlyTax);
      
      expect(monthlyTDS.monthly).toBe(10000);
      expect(monthlyTDS.remainder).toBe(0);
      
      // All months should have same amount
      monthlyTDS.schedule.forEach(month => {
        expect(month.amount).toBe(10000);
      });
    });
  });

  describe('Integration Tests', () => {
    test('should provide complete salary breakdown', async () => {
      const input = {
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

      const result = await taxEngine.calculateSalaryBreakdown(input, { 
        fy: '2025-26', 
        regimes: ['old', 'new'] 
      });

      expect(result.success).toBe(true);
      expect(result.fy).toBe('2025-26');
      expect(result.regimes.old).toBeDefined();
      expect(result.regimes.new).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.breakdown).toBeDefined();
      expect(result.disclaimer).toBeDefined();
      
      // Verify all regimes have required fields
      Object.values(result.regimes).forEach(regime => {
        expect(regime.grossSalary).toBeGreaterThan(0);
        expect(regime.taxableIncome).toBeDefined();
        expect(regime.incomeTax).toBeDefined();
        expect(regime.monthlyTDS).toBeDefined();
        expect(regime.professionalTax).toBeGreaterThanOrEqual(0);
        expect(regime.takeHome).toBeDefined();
        expect(regime.breakdown).toBeDefined();
      });
    });

    test('should handle multiple financial years', async () => {
      // This test would require multiple FY configs
      const fy2025 = await taxEngine.getAvailableRegimes('2025-26');
      expect(Array.isArray(fy2025)).toBe(true);
      expect(fy2025.length).toBeGreaterThan(0);
    });

    test('should cache and reuse tax rules', async () => {
      // First call
      const rules1 = await taxEngine.rulesFetcher.fetchRulesForFY('2025-26');
      
      // Second call should use cache
      const rules2 = await taxEngine.rulesFetcher.fetchRulesForFY('2025-26');
      
      expect(rules1.fy).toBe(rules2.fy);
      expect(rules1.source).toBe(rules2.source);
    });
  });

  describe('Professional Tax by State', () => {
    beforeEach(async () => {
      await taxEngine.rulesFetcher.fetchRulesForFY('2025-26');
    });

    test('should calculate PT for different states', () => {
      const testCases = [
        { state: 'Maharashtra', monthlyGross: 10000, expectedMonthly: 200 },
        { state: 'Karnataka', monthlyGross: 15000, expectedMonthly: 200 },
        { state: 'Delhi', monthlyGross: 12000, expectedMonthly: 200 },
        { state: 'default', monthlyGross: 50000, expectedMonthly: 0 }
      ];

      testCases.forEach(({ state, monthlyGross, expectedMonthly }) => {
        const input = {
          basic: monthlyGross * 12,
          hra: 0,
          special_allowances: 0,
          state
        };

        const professionalTax = taxEngine.calculateProfessionalTax(input);
        expect(professionalTax.monthly).toBe(expectedMonthly);
      });
    });
  });
});

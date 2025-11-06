/**
 * REAL API TESTING - Test actual endpoints with real data
 */

require('dotenv').config();
const axios = require('axios');
const { sequelize } = require('./config/sequelize');
const { Requirement, User } = require('./config/index');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_EMAIL = 'hxx@gmail.com';
const TEST_PASSWORD = 'Player@123';

async function login() {
  try {
    console.log('🔐 Logging in as:', TEST_EMAIL);
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.data.success && response.data.token) {
      console.log('✅ Login successful');
      return response.data.token;
    } else {
      console.error('❌ Login failed:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetRequirements(token) {
  try {
    console.log('\n📋 TEST 1: Get All Requirements');
    console.log('='.repeat(100));
    
    const response = await axios.get(`${BASE_URL}/api/requirements`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const requirements = response.data.data || [];
      console.log(`✅ Found ${requirements.length} requirements`);
      
      if (requirements.length > 0) {
        requirements.forEach((req, i) => {
          console.log(`\n${i + 1}. ${req.title} (ID: ${req.id})`);
          console.log(`   Total Candidates: ${req.totalCandidates || 0}`);
          console.log(`   Accessed: ${req.accessedCandidates || 0}`);
        });
        
        return requirements;
      }
    } else {
      console.error('❌ Failed to get requirements:', response.data);
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error getting requirements:', error.response?.data || error.message);
    return [];
  }
}

async function testGetRequirementStats(token, requirementId) {
  try {
    console.log(`\n📊 TEST 2: Get Stats for Requirement ${requirementId}`);
    console.log('='.repeat(100));
    
    const response = await axios.get(`${BASE_URL}/api/requirements/${requirementId}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const stats = response.data.data || {};
      console.log('✅ Stats:', JSON.stringify(stats, null, 2));
      return stats;
    } else {
      console.error('❌ Failed to get stats:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting stats:', error.response?.data || error.message);
    return null;
  }
}

async function testGetCandidates(token, requirementId) {
  try {
    console.log(`\n👥 TEST 3: Get Candidates for Requirement ${requirementId}`);
    console.log('='.repeat(100));
    
    const response = await axios.get(`${BASE_URL}/api/requirements/${requirementId}/candidates`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page: 1, limit: 50 }
    });
    
    if (response.data.success) {
      const data = response.data.data || {};
      const candidates = data.candidates || [];
      const total = data.requirement?.totalCandidates || data.pagination?.total || 0;
      
      console.log(`✅ API Response:`);
      console.log(`   Total Candidates (from API): ${total}`);
      console.log(`   Candidates on Page: ${candidates.length}`);
      console.log(`   Pagination:`, data.pagination);
      
      if (candidates.length > 0) {
        console.log(`\n📋 Sample Candidates:`);
        candidates.slice(0, 5).forEach((c, i) => {
          console.log(`   ${i + 1}. ${c.name} - ${c.headline} (${c.experience} exp, ${c.salary || 'N/A'} LPA)`);
        });
      } else {
        console.log('⚠️  NO CANDIDATES RETURNED BY API!');
      }
      
      return { candidates, total, data };
    } else {
      console.error('❌ Failed to get candidates:', response.data);
      return { candidates: [], total: 0, data: null };
    }
  } catch (error) {
    console.error('❌ Error getting candidates:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Full error:', JSON.stringify(error.response.data, null, 2));
    }
    return { candidates: [], total: 0, data: null };
  }
}

async function testDatabaseDirect(requirementId) {
  try {
    console.log(`\n🗄️  TEST 4: Direct Database Check for Requirement ${requirementId}`);
    console.log('='.repeat(100));
    
    const requirement = await Requirement.findByPk(requirementId);
    if (!requirement) {
      console.error('❌ Requirement not found in database');
      return;
    }
    
    console.log('✅ Requirement found:', requirement.title);
    
    const metadata = typeof requirement.metadata === 'string' 
      ? JSON.parse(requirement.metadata) 
      : (requirement.metadata || {});
    
    console.log('\n📦 Metadata:', JSON.stringify(metadata, null, 2));
    
    // Extract and parse fields
    let workExperienceMin = metadata.workExperienceMin || metadata.experienceMin || requirement.experienceMin || null;
    let workExperienceMax = metadata.workExperienceMax || metadata.experienceMax || requirement.experienceMax || null;
    
    if ((workExperienceMin === null) && metadata.experience) {
      const expStr = String(metadata.experience).trim();
      const expMatch = expStr.match(/(\d+)(?:\s*-\s*(\d+))?/);
      if (expMatch) {
        workExperienceMin = parseInt(expMatch[1]);
        if (expMatch[2]) workExperienceMax = parseInt(expMatch[2]);
        console.log(`📊 Parsed experience: ${workExperienceMin}${workExperienceMax ? '-' + workExperienceMax : '+'} years`);
      }
    }
    
    let currentSalaryMin = metadata.currentSalaryMin || metadata.salaryMin || requirement.salaryMin || null;
    let currentSalaryMax = metadata.currentSalaryMax || metadata.salaryMax || requirement.salaryMax || null;
    
    if ((currentSalaryMin === null) && metadata.salary) {
      const salStr = String(metadata.salary).trim();
      const salMatch = salStr.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/);
      if (salMatch) {
        currentSalaryMin = parseFloat(salMatch[1]);
        if (salMatch[2]) currentSalaryMax = parseFloat(salMatch[2]);
        console.log(`📊 Parsed salary: ${currentSalaryMin}${currentSalaryMax ? '-' + currentSalaryMax : '+'} LPA`);
      }
    }
    
    const allRequiredSkills = [
      ...(requirement.skills || []),
      ...(requirement.keySkills || []),
      ...(metadata.includeSkills || [])
    ].filter(Boolean);
    
    console.log('\n🔍 Testing Query with Extracted Values:');
    console.log(`   Experience: ${workExperienceMin || 'null'} - ${workExperienceMax || 'null'}`);
    console.log(`   Salary: ${currentSalaryMin || 'null'} - ${currentSalaryMax || 'null'}`);
    console.log(`   Skills:`, allRequiredSkills);
    
    // Build query
    const { Op } = require('sequelize');
    const whereClause = {
      user_type: 'jobseeker',
      is_active: true,
      account_status: 'active'
    };
    
    const allAndConditions = [];
    const matchingConditions = [];
    
    // Experience
    if (workExperienceMin !== null) {
      allAndConditions.push({
        experience_years: {
          [Op.and]: [
            { [Op.gte]: Number(workExperienceMin) },
            { [Op.lte]: Number(workExperienceMax || 50) }
          ]
        }
      });
    }
    
    // Salary
    if (currentSalaryMin !== null) {
      allAndConditions.push({
        current_salary: {
          [Op.and]: [
            { [Op.gte]: Number(currentSalaryMin) },
            { [Op.lte]: Number(currentSalaryMax || 200) }
          ]
        }
      });
    }
    
    // Skills
    if (allRequiredSkills.length > 0) {
      const skillConditions = allRequiredSkills.flatMap(skill => [
        sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.iLike]: `%${skill}%` }),
        sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.iLike]: `%${skill}%` }),
        { headline: { [Op.iLike]: `%${skill}%` } },
        { summary: { [Op.iLike]: `%${skill}%` } }
      ]);
      matchingConditions.push({ [Op.or]: skillConditions });
    }
    
    // Notice period
    const noticePeriod = metadata.noticePeriod || requirement.noticePeriod || null;
    if (noticePeriod && noticePeriod !== 'Any' && noticePeriod !== 'any') {
      const noticePeriodMap = {
        'Immediately': 0, 'Immediate': 0, '15 days': 15, '30 days': 30, '60 days': 60, '90 days': 90
      };
      const maxNoticeDays = noticePeriodMap[noticePeriod];
      if (maxNoticeDays !== undefined) {
        allAndConditions.push({ notice_period: { [Op.lte]: maxNoticeDays } });
      }
    }
    
    if (matchingConditions.length > 0) {
      allAndConditions.push(...matchingConditions);
    }
    
    if (allAndConditions.length > 0) {
      whereClause[Op.and] = allAndConditions;
    }
    
    const count = await User.count({ where: whereClause });
    console.log(`\n✅ Direct DB Query Result: ${count} candidates`);
    
    if (count > 0) {
      const candidates = await User.findAll({
        where: whereClause,
        limit: 5,
        attributes: ['id', 'first_name', 'last_name', 'headline', 'experience_years', 'current_salary', 'skills', 'key_skills']
      });
      
      console.log('\n📋 Sample Candidates from DB:');
      candidates.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.first_name} ${c.last_name} - ${c.headline}`);
        console.log(`      Experience: ${c.experience_years} years, Salary: ${c.current_salary || 'N/A'} LPA`);
        console.log(`      Skills:`, c.skills);
      });
    }
    
    return count;
  } catch (error) {
    console.error('❌ Database test error:', error);
    console.error(error.stack);
    return 0;
  }
}

async function runTests() {
  console.log('🧪 COMPREHENSIVE API TESTING');
  console.log('='.repeat(100));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Account: ${TEST_EMAIL}`);
  
  try {
    // Login
    const token = await login();
    if (!token) {
      console.error('❌ Cannot proceed without authentication token');
      return;
    }
    
    // Test requirement ID
    const testRequirementId = '94c1cf1f-0fb6-4a30-80bf-80a6d5339033';
    
    // Test 1: Get all requirements
    const requirements = await testGetRequirements(token);
    
    // Test 2: Get stats for test requirement
    const stats = await testGetRequirementStats(token, testRequirementId);
    
    // Test 3: Get candidates for test requirement
    const candidatesResult = await testGetCandidates(token, testRequirementId);
    
    // Test 4: Direct database check
    const dbCount = await testDatabaseDirect(testRequirementId);
    
    // Compare results
    console.log('\n🔍 COMPARISON:');
    console.log('='.repeat(100));
    console.log(`Stats API - Total Candidates: ${stats?.totalCandidates || 0}`);
    console.log(`Candidates API - Total: ${candidatesResult.total}`);
    console.log(`Candidates API - Returned: ${candidatesResult.candidates.length}`);
    console.log(`Direct DB Query - Count: ${dbCount}`);
    
    if (stats?.totalCandidates !== candidatesResult.total) {
      console.log('⚠️  MISMATCH: Stats API and Candidates API return different counts!');
    }
    
    if (candidatesResult.total !== dbCount) {
      console.log('⚠️  MISMATCH: API and Direct DB query return different counts!');
    }
    
    if (candidatesResult.total === 0 && dbCount > 0) {
      console.log('❌ PROBLEM: API returns 0 but database has candidates!');
      console.log('   This means the API logic is filtering them out incorrectly!');
    }
    
    if (candidatesResult.total > 0) {
      console.log('\n✅ SUCCESS: Candidates are being returned!');
    } else {
      console.log('\n❌ FAILURE: No candidates returned!');
      console.log('   Checking why...');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

runTests();



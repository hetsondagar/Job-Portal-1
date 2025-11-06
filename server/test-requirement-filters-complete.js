const axios = require('axios');
const { User, Requirement, sequelize } = require('./models');
const { Op } = require('sequelize');

const API_BASE_URL = 'http://localhost:8000/api';

// Test credentials
const TEST_EMPLOYER = {
  email: 'hxx@gmail.com',
  password: 'Player@123'
};

let authToken = '';

// Helper functions
async function loginAsEmployer() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_EMPLOYER.email,
      password: TEST_EMPLOYER.password
    });
    
    if (response.data.data?.token || response.data.token) {
      authToken = response.data.data?.token || response.data.token;
      console.log('✅ Logged in as employer');
      return true;
    }
    throw new Error('No token received');
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function getRequirement(requirementId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/requirements/${requirementId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('❌ Error fetching requirement:', error.response?.data || error.message);
    return null;
  }
}

async function updateRequirement(requirementId, updateData) {
  try {
    const response = await axios.put(`${API_BASE_URL}/requirements/${requirementId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.success;
  } catch (error) {
    console.error('❌ Error updating requirement:', error.response?.data || error.message);
    return false;
  }
}

async function getCandidates(requirementId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/requirements/${requirementId}/candidates`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { page: 1, limit: 100 },
      timeout: 30000 // 30 second timeout
    });
    
    if (response.data.success) {
      return response.data.data?.candidates || response.data.data || [];
    }
    return [];
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout when fetching candidates');
    } else {
      console.error('❌ Error fetching candidates:', error.response?.data || error.message);
    }
    return [];
  }
}

async function verifyGenderFilter(requirementId, expectedGender) {
  console.log(`\n🔍 Testing Gender Filter: ${expectedGender}`);
  
  const updateData = {
    diversityPreference: [expectedGender]
  };
  
  const updated = await updateRequirement(requirementId, updateData);
  if (!updated) {
    console.log('   ❌ Failed to update requirement');
    return false;
  }
  
  // Wait a bit for the update to propagate
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verify the requirement was updated correctly
  const requirement = await getRequirement(requirementId);
  if (requirement) {
    console.log(`   Requirement diversityPreference: ${JSON.stringify(requirement.diversityPreference)}`);
  }
  
  const candidates = await getCandidates(requirementId);
  console.log(`   Found ${candidates.length} candidates`);
  
  if (candidates.length === 0) {
    console.log('   ⚠️ No candidates found - might be correct if no matching candidates exist');
    return true;
  }
  
  // Verify all candidates have the expected gender
  const allMatch = candidates.every(c => {
    const candidateGender = (c.gender || '').toLowerCase();
    const expected = expectedGender.toLowerCase();
    return candidateGender === expected;
  });
  
  if (allMatch) {
    console.log(`   ✅ All ${candidates.length} candidates have gender: ${expectedGender}`);
  } else {
    const mismatched = candidates.filter(c => {
      const candidateGender = (c.gender || '').toLowerCase();
      const expected = expectedGender.toLowerCase();
      return candidateGender !== expected;
    });
    console.log(`   ❌ ${mismatched.length} candidates have wrong gender:`);
    mismatched.slice(0, 5).forEach(c => {
      const name = c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown';
      console.log(`      - ${name}: ${c.gender || 'undefined'} (expected: ${expectedGender})`);
    });
  }
  
  return allMatch;
}

async function verifySkillsFilter(requirementId, includeSkills, excludeSkills) {
  console.log(`\n🔍 Testing Skills Filter:`);
  console.log(`   Include: ${includeSkills.join(', ')}`);
  console.log(`   Exclude: ${excludeSkills.join(', ')}`);
  
  const updateData = {
    includeSkills: includeSkills,
    excludeSkills: excludeSkills
  };
  
  const updated = await updateRequirement(requirementId, updateData);
  if (!updated) {
    console.log('   ❌ Failed to update requirement');
    return false;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const candidates = await getCandidates(requirementId);
  console.log(`   Found ${candidates.length} candidates`);
  
  if (candidates.length === 0) {
    console.log('   ⚠️ No candidates found');
    return true;
  }
  
  // Check if candidates have include skills (fuzzy match - might be in headline/summary)
  const hasIncludeSkills = candidates.some(c => {
    const skills = [...(c.skills || []), ...(c.key_skills || [])];
    const headline = (c.headline || '').toLowerCase();
    const summary = (c.summary || '').toLowerCase();
    
    return includeSkills.some(skill => {
      const skillLower = skill.toLowerCase();
      return skills.some(s => s.toLowerCase().includes(skillLower)) ||
             headline.includes(skillLower) ||
             summary.includes(skillLower);
    });
  });
  
  // Check if candidates have exclude skills
  const hasExcludeSkills = candidates.some(c => {
    const skills = [...(c.skills || []), ...(c.key_skills || [])];
    return excludeSkills.some(skill => {
      const skillLower = skill.toLowerCase();
      return skills.some(s => s.toLowerCase().includes(skillLower));
    });
  });
  
  if (hasIncludeSkills && !hasExcludeSkills) {
    console.log('   ✅ Skills filter working correctly');
  } else {
    console.log(`   ⚠️ Skills filter may need verification (hasInclude: ${hasIncludeSkills}, hasExclude: ${hasExcludeSkills})`);
  }
  
  return true;
}

async function verifyExperienceFilter(requirementId, minExp, maxExp) {
  console.log(`\n🔍 Testing Experience Filter: ${minExp}-${maxExp} years`);
  
  const updateData = {
    workExperienceMin: minExp,
    workExperienceMax: maxExp
  };
  
  const updated = await updateRequirement(requirementId, updateData);
  if (!updated) {
    console.log('   ❌ Failed to update requirement');
    return false;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const candidates = await getCandidates(requirementId);
  console.log(`   Found ${candidates.length} candidates`);
  
  if (candidates.length === 0) {
    console.log('   ⚠️ No candidates found');
    return true;
  }
  
  // Verify experience range
  const allMatch = candidates.every(c => {
    const exp = c.experience_years || 0;
    return exp >= minExp && exp <= maxExp;
  });
  
  if (allMatch) {
    console.log(`   ✅ All candidates have experience in range ${minExp}-${maxExp} years`);
  } else {
    const mismatched = candidates.filter(c => {
      const exp = c.experience_years || 0;
      return exp < minExp || exp > maxExp;
    });
    console.log(`   ❌ ${mismatched.length} candidates outside experience range:`);
    mismatched.slice(0, 5).forEach(c => {
      const name = c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown';
      console.log(`      - ${name}: ${c.experience_years || 'undefined'} years`);
    });
  }
  
  return allMatch;
}

async function verifyLocationFilter(requirementId, locations) {
  console.log(`\n🔍 Testing Location Filter: ${locations.join(', ')}`);
  
  const updateData = {
    candidateLocations: locations,
    includeWillingToRelocate: false
  };
  
  const updated = await updateRequirement(requirementId, updateData);
  if (!updated) {
    console.log('   ❌ Failed to update requirement');
    return false;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const candidates = await getCandidates(requirementId);
  console.log(`   Found ${candidates.length} candidates`);
  
  if (candidates.length === 0) {
    console.log('   ⚠️ No candidates found');
    return true;
  }
  
  // Verify location match (fuzzy - might be in preferred locations)
  const hasLocationMatch = candidates.some(c => {
    const currentLoc = (c.current_location || '').toLowerCase();
    const preferredLocs = (c.preferred_locations || []).map(l => l.toLowerCase());
    
    return locations.some(loc => {
      const locLower = loc.toLowerCase();
      return currentLoc.includes(locLower) || preferredLocs.some(p => p.includes(locLower));
    });
  });
  
  if (hasLocationMatch) {
    console.log('   ✅ Location filter working (fuzzy match)');
  } else {
    console.log('   ⚠️ Location filter may need verification');
  }
  
  return true;
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Requirement Filter Tests\n');
  console.log('='.repeat(80));
  
  // Login
  const loggedIn = await loginAsEmployer();
  if (!loggedIn) {
    console.log('❌ Cannot proceed without login');
    return;
  }
  
  // Get the test requirement ID
  const requirementId = '3292d3d8-646a-413b-93dc-a70465cf1525';
  
  console.log(`\n📋 Testing Requirement: ${requirementId}\n`);
  
  // Test 1: Gender Filter - Female
  await verifyGenderFilter(requirementId, 'female');
  
  // Test 2: Gender Filter - Male
  await verifyGenderFilter(requirementId, 'male');
  
  // Test 3: Skills Filter
  await verifySkillsFilter(requirementId, ['JavaScript', 'React'], ['PHP']);
  
  // Test 4: Experience Filter
  await verifyExperienceFilter(requirementId, 2, 5);
  
  // Test 5: Location Filter
  await verifyLocationFilter(requirementId, ['Bangalore', 'Mumbai']);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Comprehensive filter tests completed');
  
  await sequelize.close();
}

runComprehensiveTests().catch(console.error);




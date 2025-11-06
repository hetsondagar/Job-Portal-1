/**
 * DIRECT DATABASE TESTING - Test matching logic directly
 */

require('dotenv').config();
const { sequelize } = require('./config/sequelize');
const Requirement = require('./models/Requirement');
const User = require('./models/User');
const { Op } = require('sequelize');

async function testRequirement(requirementId) {
  console.log(`\n🧪 TESTING REQUIREMENT: ${requirementId}`);
  console.log('='.repeat(100));
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Get requirement
    const requirement = await Requirement.findByPk(requirementId);
    if (!requirement) {
      console.error('❌ Requirement not found');
      return;
    }
    
    console.log(`✅ Requirement: ${requirement.title}`);
    
    const metadata = typeof requirement.metadata === 'string' 
      ? JSON.parse(requirement.metadata) 
      : (requirement.metadata || {});
    
    console.log('\n📦 Raw Metadata:', JSON.stringify(metadata, null, 2));
    
    // Extract ALL fields
    let workExperienceMin = metadata.workExperienceMin || metadata.experienceMin || requirement.experienceMin || null;
    let workExperienceMax = metadata.workExperienceMax || metadata.experienceMax || requirement.experienceMax || null;
    
    // Parse experience string if needed
    if ((workExperienceMin === null || workExperienceMin === undefined) && metadata.experience) {
      const expStr = String(metadata.experience).trim();
      const expMatch = expStr.match(/(\d+)(?:\s*-\s*(\d+))?/);
      if (expMatch) {
        workExperienceMin = parseInt(expMatch[1]);
        if (expMatch[2]) {
          workExperienceMax = parseInt(expMatch[2]);
        }
        console.log(`✅ Parsed experience from string: ${workExperienceMin}${workExperienceMax ? '-' + workExperienceMax : '+'} years`);
      }
    }
    
    let currentSalaryMin = metadata.currentSalaryMin || metadata.salaryMin || requirement.salaryMin || null;
    let currentSalaryMax = metadata.currentSalaryMax || metadata.salaryMax || requirement.salaryMax || null;
    
    // Parse salary string if needed
    if ((currentSalaryMin === null || currentSalaryMin === undefined) && metadata.salary) {
      const salStr = String(metadata.salary).trim();
      const salMatch = salStr.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/);
      if (salMatch) {
        currentSalaryMin = parseFloat(salMatch[1]);
        if (salMatch[2]) {
          currentSalaryMax = parseFloat(salMatch[2]);
        }
        console.log(`✅ Parsed salary from string: ${currentSalaryMin}${currentSalaryMax ? '-' + currentSalaryMax : '+'} LPA`);
      }
    }
    
    const candidateLocations = metadata.candidateLocations || requirement.candidateLocations || [];
    const candidateDesignations = metadata.candidateDesignations || requirement.candidateDesignations || [];
    const currentDesignation = metadata.currentDesignation || requirement.currentDesignation || null;
    const education = metadata.education || requirement.education || null;
    const institute = metadata.institute || requirement.institute || null;
    const noticePeriod = metadata.noticePeriod || requirement.noticePeriod || null;
    const remoteWork = metadata.remoteWork || requirement.remoteWork || null;
    const currentCompany = metadata.currentCompany || requirement.currentCompany || null;
    const includeWillingToRelocate = metadata.includeWillingToRelocate !== undefined ? metadata.includeWillingToRelocate : false;
    const includeNotMentioned = metadata.includeNotMentioned !== undefined ? metadata.includeNotMentioned : false;
    const resumeFreshness = metadata.resumeFreshness ? new Date(metadata.resumeFreshness) : null;
    const lastActive = metadata.lastActive !== undefined && metadata.lastActive !== null ? Number(metadata.lastActive) : null;
    const diversityPreference = Array.isArray(metadata.diversityPreference) ? metadata.diversityPreference : (metadata.diversityPreference ? [metadata.diversityPreference] : null);
    
    const allRequiredSkills = [
      ...(requirement.skills || []),
      ...(requirement.keySkills || []),
      ...(Array.isArray(metadata.includeSkills) ? metadata.includeSkills : [])
    ].filter(Boolean);
    
    const excludeSkills = Array.isArray(metadata.excludeSkills) ? metadata.excludeSkills : [];
    
    console.log('\n📊 EXTRACTED VALUES:');
    console.log(`   Experience: ${workExperienceMin || 'null'} - ${workExperienceMax || 'null'}`);
    console.log(`   Salary: ${currentSalaryMin || 'null'} - ${currentSalaryMax || 'null'}`);
    console.log(`   Locations:`, candidateLocations);
    console.log(`   Designations:`, candidateDesignations);
    console.log(`   Current Designation:`, currentDesignation);
    console.log(`   Education:`, education);
    console.log(`   Institute:`, institute);
    console.log(`   Current Company:`, currentCompany);
    console.log(`   Notice Period:`, noticePeriod);
    console.log(`   Remote Work:`, remoteWork);
    console.log(`   Include Willing to Relocate:`, includeWillingToRelocate);
    console.log(`   Include Not Mentioned:`, includeNotMentioned);
    console.log(`   Resume Freshness:`, resumeFreshness);
    console.log(`   Last Active:`, lastActive);
    console.log(`   Diversity Preference:`, diversityPreference);
    console.log(`   Required Skills:`, allRequiredSkills);
    console.log(`   Exclude Skills:`, excludeSkills);
    
    // Check total jobseekers
    const totalJobseekers = await User.count({
      where: {
        user_type: 'jobseeker',
        is_active: true,
        account_status: 'active'
      }
    });
    console.log(`\n👥 Total active jobseekers: ${totalJobseekers}`);
    
    // Build query step by step
    const whereClause = {
      user_type: 'jobseeker',
      is_active: true,
      account_status: 'active'
    };
    
    const allAndConditions = [];
    const matchingConditions = [];
    
    // 1. EXPERIENCE
    if (workExperienceMin !== null && workExperienceMin !== undefined) {
      const minExp = Number(workExperienceMin);
      const maxExp = workExperienceMax !== null && workExperienceMax !== undefined ? Number(workExperienceMax) : 50;
      allAndConditions.push({
        experience_years: {
          [Op.and]: [{ [Op.gte]: minExp }, { [Op.lte]: maxExp }]
        }
      });
      console.log(`\n✅ Added experience filter: ${minExp}-${maxExp} years`);
    }
    
    // 2. SALARY
    if (currentSalaryMin !== null && currentSalaryMin !== undefined) {
      const minSalary = Number(currentSalaryMin);
      const maxSalary = currentSalaryMax !== null && currentSalaryMax !== undefined ? Number(currentSalaryMax) : 200;
      allAndConditions.push({
        current_salary: {
          [Op.and]: [{ [Op.gte]: minSalary }, { [Op.lte]: maxSalary }]
        }
      });
      console.log(`✅ Added salary filter: ${minSalary}-${maxSalary} LPA`);
    }
    
    // 3. SKILLS
    if (allRequiredSkills.length > 0) {
      const skillConditions = allRequiredSkills.flatMap(skill => [
        { skills: { [Op.contains]: [skill] } },
        sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.iLike]: `%${skill}%` }),
        { key_skills: { [Op.contains]: [skill] } },
        sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.iLike]: `%${skill}%` }),
        { headline: { [Op.iLike]: `%${skill}%` } },
        { summary: { [Op.iLike]: `%${skill}%` } }
      ]);
      matchingConditions.push({ [Op.or]: skillConditions });
      console.log(`✅ Added skills filter: ${allRequiredSkills.join(', ')}`);
    }
    
    // 4. EXCLUDE SKILLS
    if (excludeSkills.length > 0 && excludeSkills.filter(s => s).length > 0) {
      for (const excludeSkill of excludeSkills.filter(s => s)) {
        allAndConditions.push({
          [Op.and]: [
            { [Op.or]: [{ skills: null }, sequelize.where(sequelize.cast(sequelize.col('skills'), 'text'), { [Op.not]: { [Op.iLike]: `%${excludeSkill}%` } })] },
            { [Op.or]: [{ key_skills: null }, sequelize.where(sequelize.cast(sequelize.col('key_skills'), 'text'), { [Op.not]: { [Op.iLike]: `%${excludeSkill}%` } })] },
            { [Op.or]: [{ headline: null }, { headline: { [Op.not]: { [Op.iLike]: `%${excludeSkill}%` } } }] },
            { [Op.or]: [{ summary: null }, { summary: { [Op.not]: { [Op.iLike]: `%${excludeSkill}%` } } }] }
          ]
        });
      }
      console.log(`✅ Added exclude skills filter: ${excludeSkills.join(', ')}`);
    }
    
    // 5. NOTICE PERIOD
    if (noticePeriod && noticePeriod !== 'Any' && noticePeriod !== 'any') {
      const noticePeriodMap = {
        'Immediately': 0, 'Immediate': 0, '15 days': 15, '30 days': 30, '60 days': 60, '90 days': 90
      };
      const maxNoticeDays = noticePeriodMap[noticePeriod];
      if (maxNoticeDays !== undefined) {
        allAndConditions.push({
          notice_period: { [Op.lte]: maxNoticeDays }
        });
        console.log(`✅ Added notice period filter: <= ${maxNoticeDays} days`);
      }
    }
    
    // 6. LOCATIONS
    if (candidateLocations.length > 0) {
      const locationConditions = candidateLocations.flatMap(location => [
        { current_location: { [Op.iLike]: `%${location}%` } },
        sequelize.where(sequelize.cast(sequelize.col('preferred_locations'), 'text'), { [Op.iLike]: `%${location}%` })
      ]);
      if (includeWillingToRelocate) {
        locationConditions.push({ willing_to_relocate: true });
      }
      matchingConditions.push({ [Op.or]: locationConditions });
      console.log(`✅ Added locations filter: ${candidateLocations.join(', ')}`);
    }
    
    // 7. DESIGNATIONS
    if (candidateDesignations.length > 0) {
      const designationConditions = candidateDesignations.flatMap(designation => [
        { designation: { [Op.iLike]: `%${designation}%` } },
        { headline: { [Op.iLike]: `%${designation}%` } },
        { summary: { [Op.iLike]: `%${designation}%` } },
        { current_role: { [Op.iLike]: `%${designation}%` } }
      ]);
      matchingConditions.push({ [Op.or]: designationConditions });
      console.log(`✅ Added designations filter: ${candidateDesignations.join(', ')}`);
    }
    
    // 8. CURRENT DESIGNATION
    if (currentDesignation) {
      matchingConditions.push({
        [Op.or]: [
          { designation: { [Op.iLike]: `%${currentDesignation}%` } },
          { headline: { [Op.iLike]: `%${currentDesignation}%` } },
          { current_role: { [Op.iLike]: `%${currentDesignation}%` } }
        ]
      });
      console.log(`✅ Added current designation filter: ${currentDesignation}`);
    }
    
    // 9. GENDER
    if (diversityPreference && Array.isArray(diversityPreference) && diversityPreference.length > 0 && !diversityPreference.includes('all')) {
      const validPreferences = diversityPreference.filter(p => p && ['male', 'female', 'other'].includes(p));
      if (validPreferences.length > 0) {
        allAndConditions.push({
          gender: { [Op.in]: validPreferences }
        });
        console.log(`✅ Added gender filter: ${validPreferences.join(', ')}`);
      }
    }
    
    // Combine conditions
    if (matchingConditions.length > 0) {
      allAndConditions.push({ [Op.and]: matchingConditions });
    }
    
    if (allAndConditions.length > 0) {
      whereClause[Op.and] = allAndConditions;
    }
    
    // Execute query
    console.log('\n🔍 Executing query...');
    const count = await User.count({ where: whereClause });
    console.log(`\n✅ QUERY RESULT: ${count} candidates found`);
    
    if (count > 0) {
      const candidates = await User.findAll({
        where: whereClause,
        limit: 10,
        attributes: ['id', 'first_name', 'last_name', 'headline', 'experience_years', 'current_salary', 'current_location', 'skills', 'key_skills', 'notice_period', 'gender']
      });
      
      console.log('\n📋 Sample Candidates:');
      candidates.forEach((c, i) => {
        console.log(`\n   ${i + 1}. ${c.first_name} ${c.last_name}`);
        console.log(`      Headline: ${c.headline}`);
        console.log(`      Experience: ${c.experience_years} years`);
        console.log(`      Salary: ${c.current_salary || 'N/A'} LPA`);
        console.log(`      Location: ${c.current_location || 'N/A'}`);
        console.log(`      Notice Period: ${c.notice_period || 'N/A'} days`);
        console.log(`      Gender: ${c.gender || 'N/A'}`);
        console.log(`      Skills:`, c.skills);
        console.log(`      Key Skills:`, c.key_skills);
      });
    } else {
      console.log('\n❌ NO CANDIDATES FOUND!');
      console.log('   This means the query is too strict or data is missing.');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

// Test the specific requirement
const testRequirementId = '94c1cf1f-0fb6-4a30-80bf-80a6d5339033';
testRequirement(testRequirementId);


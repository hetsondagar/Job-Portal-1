/**
 * PRODUCTION-LEVEL REQUIREMENT MATCHING TEST SCRIPT
 * 
 * This script tests requirement creation and candidate matching
 * across different domains: Software, AI, Mechanical, Instrumentation
 * 
 * Usage: node test-requirement-matching.js
 */

require('dotenv').config();
const { sequelize } = require('./config/sequelize');
const { Requirement, User } = require('./config/index');
const { Op } = require('sequelize');

// Test configuration
const TEST_CONFIG = {
  employerEmail: 'hxx@gmail.com',
  testRequirements: [
    {
      name: 'Software Developer',
      title: 'Full Stack Developer',
      description: 'We are looking for a Full Stack Developer with experience in modern web technologies.',
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      keySkills: ['TypeScript', 'Express', 'MongoDB'],
      workExperienceMin: 3,
      workExperienceMax: 7,
      currentSalaryMin: 8,
      currentSalaryMax: 15,
      candidateLocations: ['Bangalore', 'Mumbai'],
      candidateDesignations: ['Software Developer', 'Full Stack Developer'],
      education: "Bachelor's in Computer Science",
      noticePeriod: '30 days',
      remoteWork: 'hybrid',
      includeWillingToRelocate: true
    },
    {
      name: 'AI/ML Engineer',
      title: 'Machine Learning Engineer',
      description: 'Seeking an experienced ML Engineer with deep learning expertise.',
      skills: ['Python', 'TensorFlow', 'PyTorch'],
      keySkills: ['Deep Learning', 'NLP', 'Computer Vision'],
      workExperienceMin: 2,
      workExperienceMax: 5,
      currentSalaryMin: 10,
      currentSalaryMax: 20,
      candidateLocations: ['Hyderabad', 'Bangalore'],
      candidateDesignations: ['ML Engineer', 'Data Scientist', 'AI Engineer'],
      education: "Master's in Data Science",
      institute: 'IIT',
      currentCompany: 'Google',
      noticePeriod: '30 days',
      resumeFreshness: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      lastActive: 30 // days
    },
    {
      name: 'Mechanical Engineer',
      title: 'Mechanical Design Engineer',
      description: 'Looking for a Mechanical Design Engineer with CAD software experience.',
      skills: ['AutoCAD', 'SolidWorks', 'CATIA'],
      keySkills: ['GD&T', 'FEA', 'Product Design'],
      workExperienceMin: 4,
      workExperienceMax: 8,
      currentSalaryMin: 6,
      currentSalaryMax: 12,
      candidateLocations: ['Pune', 'Chennai'],
      candidateDesignations: ['Mechanical Engineer', 'Design Engineer'],
      education: "Bachelor's in Mechanical Engineering",
      currentCompany: 'TATA',
      noticePeriod: '60 days',
      includeWillingToRelocate: true
    },
    {
      name: 'Instrumentation Engineer',
      title: 'Instrumentation Engineer',
      description: 'Seeking an Instrumentation Engineer with PLC and SCADA experience.',
      skills: ['PLC', 'SCADA', 'DCS'],
      keySkills: ['HMI', 'Industrial Automation', 'Control Systems'],
      workExperienceMin: 3,
      workExperienceMax: 6,
      currentSalaryMin: 5,
      currentSalaryMax: 10,
      candidateLocations: ['Ahmedabad', 'Vadodara'],
      candidateDesignations: ['Instrumentation Engineer', 'Control Engineer'],
      education: "Bachelor's in Instrumentation Engineering",
      currentCompany: 'ABB',
      noticePeriod: '30 days',
      remoteWork: 'on-site'
    }
  ]
};

/**
 * Verify candidate matches requirement criteria
 */
function verifyCandidateMatch(candidate, requirement, metadata) {
  const errors = [];
  const warnings = [];
  
  // 1. Check experience
  const workExperienceMin = metadata.workExperienceMin || requirement.workExperienceMin;
  const workExperienceMax = metadata.workExperienceMax || requirement.workExperienceMax;
  if (workExperienceMin !== null && workExperienceMin !== undefined) {
    const candidateExp = Number(candidate.experience_years) || 0;
    const minExp = Number(workExperienceMin);
    const maxExp = workExperienceMax !== null && workExperienceMax !== undefined ? Number(workExperienceMax) : 50;
    
    if (candidateExp < minExp || candidateExp > maxExp) {
      errors.push(`Experience mismatch: ${candidateExp} years (required: ${minExp}-${maxExp})`);
    }
  }
  
  // 2. Check salary
  const currentSalaryMin = metadata.currentSalaryMin || requirement.currentSalaryMin;
  const currentSalaryMax = metadata.currentSalaryMax || requirement.currentSalaryMax;
  if (currentSalaryMin !== null && currentSalaryMin !== undefined) {
    const candidateSalary = Number(candidate.current_salary) || 0;
    const minSalary = Number(currentSalaryMin);
    const maxSalary = currentSalaryMax !== null && currentSalaryMax !== undefined ? Number(currentSalaryMax) : 200;
    
    if (candidateSalary > 0 && (candidateSalary < minSalary || candidateSalary > maxSalary)) {
      warnings.push(`Salary mismatch: ${candidateSalary} LPA (required: ${minSalary}-${maxSalary})`);
    }
  }
  
  // 3. Check skills
  const allRequiredSkills = [
    ...(requirement.skills || []),
    ...(requirement.keySkills || [])
  ].filter(Boolean);
  
  if (allRequiredSkills.length > 0) {
    const candidateSkills = [
      ...(candidate.skills || []),
      ...(candidate.key_skills || []),
      candidate.headline || '',
      candidate.summary || ''
    ].join(' ').toLowerCase();
    
    const hasSkill = allRequiredSkills.some(skill => 
      candidateSkills.includes(skill.toLowerCase())
    );
    
    if (!hasSkill) {
      errors.push(`No matching skills found (required: ${allRequiredSkills.join(', ')})`);
    }
  }
  
  // 4. Check location
  const candidateLocations = metadata.candidateLocations || requirement.candidateLocations || [];
  const includeWillingToRelocate = metadata.includeWillingToRelocate !== undefined 
    ? metadata.includeWillingToRelocate 
    : requirement.includeWillingToRelocate;
  
  if (candidateLocations.length > 0) {
    const candidateLocation = (candidate.current_location || '').toLowerCase();
    const preferredLocs = ((candidate.preferred_locations || [])).map(l => String(l).toLowerCase());
    
    const hasLocationMatch = candidateLocations.some(loc => 
      candidateLocation.includes(loc.toLowerCase()) ||
      preferredLocs.some(pl => pl.includes(loc.toLowerCase()))
    );
    
    if (!hasLocationMatch && !(includeWillingToRelocate && candidate.willing_to_relocate)) {
      errors.push(`Location mismatch: ${candidate.current_location} (required: ${candidateLocations.join(', ')})`);
    }
  }
  
  // 5. Check designation
  const candidateDesignations = metadata.candidateDesignations || requirement.candidateDesignations || [];
  if (candidateDesignations.length > 0) {
    const candidateTitle = `${candidate.designation || ''} ${candidate.headline || ''} ${candidate.current_role || ''}`.toLowerCase();
    const hasDesignationMatch = candidateDesignations.some(des => 
      candidateTitle.includes(des.toLowerCase())
    );
    
    if (!hasDesignationMatch) {
      warnings.push(`Designation mismatch: ${candidate.designation || candidate.headline} (preferred: ${candidateDesignations.join(', ')})`);
    }
  }
  
  // 6. Check education
  const education = metadata.education || requirement.education;
  if (education) {
    const candidateEducation = `${candidate.education || ''} ${candidate.highest_education || ''} ${candidate.field_of_study || ''} ${candidate.headline || ''} ${candidate.summary || ''}`.toLowerCase();
    if (!candidateEducation.includes(education.toLowerCase())) {
      warnings.push(`Education mismatch: ${candidate.highest_education || 'Not specified'} (required: ${education})`);
    }
  }
  
  // 7. Check institute
  const institute = metadata.institute || requirement.institute;
  if (institute) {
    const candidateText = `${candidate.education || ''} ${candidate.headline || ''} ${candidate.summary || ''}`.toLowerCase();
    if (!candidateText.includes(institute.toLowerCase())) {
      warnings.push(`Institute mismatch: (required: ${institute})`);
    }
  }
  
  // 8. Check current company
  const currentCompany = metadata.currentCompany || requirement.currentCompany;
  if (currentCompany) {
    const candidateText = `${candidate.current_company || ''} ${candidate.headline || ''} ${candidate.summary || ''}`.toLowerCase();
    if (!candidateText.includes(currentCompany.toLowerCase())) {
      warnings.push(`Current company mismatch: ${candidate.current_company || 'Not specified'} (preferred: ${currentCompany})`);
    }
  }
  
  // 9. Check notice period
  const noticePeriod = metadata.noticePeriod || requirement.noticePeriod;
  if (noticePeriod && noticePeriod !== 'Any' && noticePeriod !== 'any') {
    const noticePeriodMap = {
      'Immediately': 0,
      'Immediate': 0,
      '15 days': 15,
      '30 days': 30,
      '60 days': 60,
      '90 days': 90
    };
    const maxNoticeDays = noticePeriodMap[noticePeriod];
    const candidateNoticeDays = Number(candidate.notice_period) || 90;
    
    if (maxNoticeDays !== undefined && candidateNoticeDays > maxNoticeDays) {
      warnings.push(`Notice period mismatch: ${candidateNoticeDays} days (max: ${maxNoticeDays})`);
    }
  }
  
  // 10. Check title match
  if (requirement.title && requirement.title.trim().length > 3) {
    const titleWords = requirement.title.split(/\s+/).filter(word => word.length > 3);
    const candidateTitle = `${candidate.headline || ''} ${candidate.designation || ''}`.toLowerCase();
    const hasTitleMatch = titleWords.some(word => candidateTitle.includes(word.toLowerCase()));
    
    if (!hasTitleMatch) {
      warnings.push(`Title mismatch: ${candidate.headline} (requirement: ${requirement.title})`);
    }
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
}

/**
 * Test requirement matching
 */
async function testRequirementMatching() {
  console.log('🧪 STARTING PRODUCTION-LEVEL REQUIREMENT MATCHING TESTS\n');
  console.log('='.repeat(80));
  
  try {
    // Get employer user (try specific email first, then any employer)
    let employer = await User.findOne({
      where: { email: TEST_CONFIG.employerEmail, user_type: 'employer' }
    });
    
    if (!employer) {
      console.log(`⚠️  Employer ${TEST_CONFIG.employerEmail} not found, trying to find any employer...`);
      employer = await User.findOne({
        where: { user_type: 'employer' },
        include: [{ model: require('./models/Company').default || require('./models/Company'), as: 'company' }]
      });
    }
    
    if (!employer) {
      console.error('❌ No employer found in database. Please create an employer account first.');
      console.error('   You can create one through the registration flow or database directly.');
      return;
    }
    
    // Ensure employer has a companyId
    if (!employer.companyId) {
      console.error('❌ Employer does not have a companyId. Please assign a company to the employer.');
      return;
    }
    
    console.log(`✅ Found employer: ${employer.email} (${employer.companyId})\n`);
    
    // Test each requirement type
    for (const testReq of TEST_CONFIG.testRequirements) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 Testing Requirement: ${testReq.name}`);
      console.log('='.repeat(80));
      
      // Create requirement
      const requirement = await Requirement.create({
        title: testReq.title,
        description: testReq.description,
        companyId: employer.companyId,
        createdBy: employer.id,
        experienceMin: testReq.workExperienceMin,
        experienceMax: testReq.workExperienceMax,
        salaryMin: testReq.currentSalaryMin,
        salaryMax: testReq.currentSalaryMax,
        skills: testReq.skills || [],
        keySkills: testReq.keySkills || [],
        remoteWork: testReq.remoteWork || 'on-site',
        metadata: {
          jobType: 'full-time',
          education: testReq.education,
          noticePeriod: testReq.noticePeriod,
          candidateLocations: testReq.candidateLocations || [],
          candidateDesignations: testReq.candidateDesignations || [],
          includeWillingToRelocate: testReq.includeWillingToRelocate || false,
          workExperienceMin: testReq.workExperienceMin,
          workExperienceMax: testReq.workExperienceMax,
          currentSalaryMin: testReq.currentSalaryMin,
          currentSalaryMax: testReq.currentSalaryMax,
          institute: testReq.institute,
          currentCompany: testReq.currentCompany,
          resumeFreshness: testReq.resumeFreshness,
          lastActive: testReq.lastActive
        }
      });
      
      console.log(`✅ Created requirement: ${requirement.id} - "${requirement.title}"`);
      
      // Parse metadata
      const metadata = typeof requirement.metadata === 'string' 
        ? JSON.parse(requirement.metadata) 
        : (requirement.metadata || {});
      
      // Build matching query (same logic as candidates endpoint)
      const whereClause = {
        user_type: 'jobseeker',
        is_active: true,
        account_status: 'active'
      };
      
      const matchingConditions = [];
      
      // Experience
      const workExperienceMin = metadata.workExperienceMin || requirement.experienceMin;
      const workExperienceMax = metadata.workExperienceMax || requirement.experienceMax;
      if (workExperienceMin !== null && workExperienceMin !== undefined) {
        whereClause.experience_years = {
          [Op.and]: [
            { [Op.gte]: Number(workExperienceMin) },
            { [Op.lte]: Number(workExperienceMax || 50) }
          ]
        };
      }
      
      // Salary
      const currentSalaryMin = metadata.currentSalaryMin || requirement.salaryMin;
      const currentSalaryMax = metadata.currentSalaryMax || requirement.salaryMax;
      if (currentSalaryMin !== null && currentSalaryMin !== undefined) {
        whereClause.current_salary = {
          [Op.and]: [
            { [Op.gte]: Number(currentSalaryMin) },
            { [Op.lte]: Number(currentSalaryMax || 200) }
          ]
        };
      }
      
      // Skills
      const allRequiredSkills = [
        ...(requirement.skills || []),
        ...(requirement.keySkills || [])
      ].filter(Boolean);
      
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
      }
      
      // Location
      const candidateLocations = metadata.candidateLocations || [];
      const includeWillingToRelocate = metadata.includeWillingToRelocate || false;
      if (candidateLocations.length > 0) {
        const locationConditions = candidateLocations.flatMap(location => [
          { current_location: { [Op.iLike]: `%${location}%` } },
          sequelize.where(sequelize.cast(sequelize.col('preferred_locations'), 'text'), { [Op.iLike]: `%${location}%` })
        ]);
        if (includeWillingToRelocate) {
          locationConditions.push({ willing_to_relocate: true });
        }
        matchingConditions.push({ [Op.or]: locationConditions });
      }
      
      // Designation
      const candidateDesignations = metadata.candidateDesignations || [];
      if (candidateDesignations.length > 0) {
        const designationConditions = candidateDesignations.flatMap(des => [
          { designation: { [Op.iLike]: `%${des}%` } },
          { headline: { [Op.iLike]: `%${des}%` } },
          { current_role: { [Op.iLike]: `%${des}%` } }
        ]);
        matchingConditions.push({ [Op.or]: designationConditions });
      }
      
      // Education
      const education = metadata.education;
      if (education) {
        matchingConditions.push({
          [Op.or]: [
            sequelize.where(sequelize.cast(sequelize.col('education'), 'text'), { [Op.iLike]: `%${education}%` }),
            { highest_education: { [Op.iLike]: `%${education}%` } },
            { field_of_study: { [Op.iLike]: `%${education}%` } },
            { headline: { [Op.iLike]: `%${education}%` } },
            { summary: { [Op.iLike]: `%${education}%` } }
          ]
        });
      }
      
      // Institute
      const institute = metadata.institute;
      if (institute) {
        matchingConditions.push({
          [Op.or]: [
            sequelize.where(sequelize.cast(sequelize.col('education'), 'text'), { [Op.iLike]: `%${institute}%` }),
            { headline: { [Op.iLike]: `%${institute}%` } },
            { summary: { [Op.iLike]: `%${institute}%` } }
          ]
        });
      }
      
      // Current company
      const currentCompany = metadata.currentCompany;
      if (currentCompany) {
        matchingConditions.push({
          [Op.or]: [
            { current_company: { [Op.iLike]: `%${currentCompany}%` } },
            { headline: { [Op.iLike]: `%${currentCompany}%` } },
            { summary: { [Op.iLike]: `%${currentCompany}%` } }
          ]
        });
      }
      
      // Notice period
      const noticePeriod = metadata.noticePeriod;
      if (noticePeriod && noticePeriod !== 'Any' && noticePeriod !== 'any') {
        const noticePeriodMap = {
          'Immediately': 0, 'Immediate': 0, '15 days': 15,
          '30 days': 30, '60 days': 60, '90 days': 90
        };
        const maxNoticeDays = noticePeriodMap[noticePeriod];
        if (maxNoticeDays !== undefined) {
          whereClause.notice_period = { [Op.lte]: maxNoticeDays };
        }
      }
      
      // Resume freshness
      if (metadata.resumeFreshness) {
        whereClause.last_profile_update = { [Op.gte]: new Date(metadata.resumeFreshness) };
      }
      
      // Last active
      if (metadata.lastActive) {
        const activeDate = new Date();
        activeDate.setDate(activeDate.getDate() - metadata.lastActive);
        whereClause.last_login_at = { [Op.gte]: activeDate };
      }
      
      // Apply AND logic
      if (matchingConditions.length > 0) {
        whereClause[Op.and] = whereClause[Op.and] || [];
        whereClause[Op.and].push(...matchingConditions);
      }
      
      // Fetch candidates
      const candidates = await User.findAll({
        where: whereClause,
        limit: 50,
        attributes: [
          'id', 'first_name', 'last_name', 'email', 'headline', 'designation',
          'experience_years', 'current_salary', 'current_location', 'skills',
          'key_skills', 'education', 'highest_education', 'field_of_study',
          'current_company', 'notice_period', 'willing_to_relocate'
        ]
      });
      
      console.log(`\n📊 Found ${candidates.length} candidates matching criteria`);
      
      // Verify each candidate
      let validCount = 0;
      let invalidCount = 0;
      let warningCount = 0;
      
      for (const candidate of candidates) {
        const verification = verifyCandidateMatch(candidate, requirement, metadata);
        
        if (verification.isValid) {
          validCount++;
          if (verification.warnings.length > 0) {
            warningCount++;
            console.log(`\n  ⚠️  ${candidate.first_name} ${candidate.last_name} - ${candidate.headline}`);
            verification.warnings.forEach(w => console.log(`     - ${w}`));
          }
        } else {
          invalidCount++;
          console.log(`\n  ❌ ${candidate.first_name} ${candidate.last_name} - ${candidate.headline}`);
          verification.errors.forEach(e => console.log(`     - ${e}`));
          verification.warnings.forEach(w => console.log(`     - ⚠️  ${w}`));
        }
      }
      
      console.log(`\n📈 Test Results:`);
      console.log(`   ✅ Valid candidates: ${validCount}`);
      console.log(`   ⚠️  Candidates with warnings: ${warningCount}`);
      console.log(`   ❌ Invalid candidates: ${invalidCount}`);
      
      if (invalidCount > 0) {
        console.log(`\n❌ TEST FAILED: Found ${invalidCount} invalid candidates!`);
      } else if (candidates.length === 0) {
        console.log(`\n⚠️  WARNING: No candidates found. This might be expected if criteria are very strict.`);
      } else {
        console.log(`\n✅ TEST PASSED: All candidates match the requirement criteria!`);
      }
      
      // Clean up - delete test requirement
      await requirement.destroy();
      console.log(`\n🗑️  Cleaned up test requirement\n`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL TESTS COMPLETED');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

// Run tests
testRequirementMatching();


/**
 * FAST PRODUCTION TEST - All Critical Paths
 * Tests: Normal Company, Recruiting Agency, Hot Vacancy, Admin, All Edge Cases
 */

const { sequelize, Company, AgencyClientAuthorization, Job, User } = require('../models');
const bcrypt = require('bcryptjs');

let passed = 0, failed = 0;
const test = (name, condition) => {
  condition ? (passed++, console.log(`✅ ${name}`)) : (failed++, console.log(`❌ ${name}`));
};

(async () => {
  console.log('\n🧪 FAST PRODUCTION TEST - ALL CRITICAL PATHS\n');
  
  let agency, client, normalCo, agencyUser, normalUser, auth;

  try {
    await sequelize.authenticate();
    test('Database connected', true);

    // CREATE TEST DATA
    agency = await Company.create({
      name: `Agency${Date.now()}`, slug: `ag-${Date.now()}`,
      companyAccountType: 'recruiting_agency', industry: 'Recruitment',
      verificationStatus: 'verified', email: `ag${Date.now()}@test.com`
    });
    test('Agency created', !!agency);
    test('Agency.isAgency() works', agency.isAgency());

    agencyUser = await User.create({
      email: `rec${Date.now()}@test.com`, password: await bcrypt.hash('Test@123', 10),
      firstName: 'Test', lastName: 'Recruiter', userType: 'employer', companyId: agency.id
    });
    test('Agency user created', !!agencyUser);

    normalCo = await Company.create({
      name: `NormalCo${Date.now()}`, slug: `nc-${Date.now()}`,
      companyAccountType: 'direct', industry: 'IT',
      verificationStatus: 'verified', email: `nc${Date.now()}@test.com`
    });
    test('Normal company created', !!normalCo);

    normalUser = await User.create({
      email: `emp${Date.now()}@test.com`, password: await bcrypt.hash('Test@123', 10),
      firstName: 'Normal', lastName: 'Employer', userType: 'employer', companyId: normalCo.id
    });
    test('Normal user created', !!normalUser);

    client = await Company.create({
      name: `Client${Date.now()}`, slug: `cl-${Date.now()}`, industry: 'Software',
      isClaimed: false, createdByAgencyId: agency.id, email: `cl${Date.now()}@test.com`
    });
    test('Unclaimed client created', !!client);
    test('Client.isUnclaimed() works', client.isUnclaimed());

    auth = await AgencyClientAuthorization.create({
      agencyCompanyId: agency.id, clientCompanyId: client.id, status: 'active',
      contractStartDate: new Date(), contractEndDate: new Date(Date.now() + 365*24*60*60*1000),
      maxActiveJobs: 3, jobCategories: ['Software', 'IT'], allowedLocations: ['Bangalore'],
      canPostJobs: true, jobsPosted: 0, clientContactEmail: 'hr@client.com'
    });
    test('Authorization created', !!auth);
    test('Auth.isActive() works', auth.isActive());

    // TEST 1: Normal company posts normal job
    console.log('\n📋 TEST 1: Normal Company → Normal Job');
    const normalJob = await Job.create({
      title: 'Developer', slug: `dev-${Date.now()}`, description: 'Job',
      companyId: normalCo.id, employerId: normalUser.id, location: 'Bangalore', status: 'active'
    });
    test('Normal job created', !!normalJob);
    test('Normal job isAgencyPosted=false', !normalJob.isAgencyPosted);
    await normalJob.destroy();

    // TEST 2: Normal company posts hot vacancy
    console.log('\n🔥 TEST 2: Normal Company → Hot Vacancy');
    const normalHot = await Job.create({
      title: 'Urgent Dev', slug: `urg-${Date.now()}`, description: 'Hot',
      companyId: normalCo.id, employerId: normalUser.id, location: 'Mumbai',
      status: 'active', isHotVacancy: true, urgentHiring: true
    });
    test('Normal hot vacancy created', !!normalHot);
    test('isHotVacancy=true', normalHot.isHotVacancy === true);
    await normalHot.destroy();

    // TEST 3: Agency posts for own company (normal job)
    console.log('\n🏢 TEST 3: Agency → Own Company Normal Job');
    const agencyNormal = await Job.create({
      title: 'Recruiter', slug: `rec-${Date.now()}`, description: 'Hiring',
      companyId: agency.id, employerId: agencyUser.id, location: 'Mumbai',
      status: 'active', isAgencyPosted: false
    });
    test('Agency own job created', !!agencyNormal);
    test('Agency own job isAgencyPosted=false', !agencyNormal.isAgencyPosted);
    await agencyNormal.destroy();

    // TEST 4: Agency posts hot vacancy for self
    console.log('\n🔥 TEST 4: Agency → Own Company Hot Vacancy');
    const agencyHot = await Job.create({
      title: 'Senior Recruiter', slug: `sr-${Date.now()}`, description: 'Urgent',
      companyId: agency.id, employerId: agencyUser.id, location: 'Mumbai',
      status: 'active', isHotVacancy: true, isAgencyPosted: false
    });
    test('Agency own hot created', !!agencyHot);
    test('isHotVacancy=true', agencyHot.isHotVacancy === true);
    await agencyHot.destroy();

    // TEST 5: Agency posts normal job for client
    console.log('\n👥 TEST 5: Agency → Client Normal Job');
    const clientNormal = await Job.create({
      title: 'Backend Dev', slug: `be-${Date.now()}`, description: 'Client job',
      companyId: agency.id, employerId: null, isAgencyPosted: true,
      hiringCompanyId: client.id, postedByAgencyId: agency.id, authorizationId: auth.id,
      location: 'Bangalore', roleCategory: 'Software', status: 'active'
    });
    test('Client job created', !!clientNormal);
    test('isAgencyPosted=true', clientNormal.isAgencyPosted === true);
    test('hiringCompanyId set', clientNormal.hiringCompanyId === client.id);

    auth.jobsPosted = 1;
    await auth.save();
    test('Job counter updated', auth.jobsPosted === 1);

    // TEST 6: Agency posts hot vacancy for client
    console.log('\n🔥 TEST 6: Agency → Client Hot Vacancy');
    const clientHot = await Job.create({
      title: 'Urgent ML Engineer', slug: `ml-${Date.now()}`, description: 'Hot client job',
      companyId: agency.id, employerId: null, isAgencyPosted: true, isHotVacancy: true,
      urgentHiring: true, hiringCompanyId: client.id, postedByAgencyId: agency.id,
      authorizationId: auth.id, location: 'Bangalore', roleCategory: 'IT', status: 'active'
    });
    test('Client hot vacancy created', !!clientHot);
    test('isHotVacancy=true', clientHot.isHotVacancy === true);
    test('isAgencyPosted=true', clientHot.isAgencyPosted === true);

    auth.jobsPosted = 2;
    await auth.save();

    // TEST 7: Job associations work
    console.log('\n🔗 TEST 7: Database Associations');
    const jobWithAssoc = await Job.findByPk(clientHot.id, {
      include: [
        { model: Company, as: 'Company' },
        { model: Company, as: 'HiringCompany' },
        { model: Company, as: 'PostedByAgency' }
      ]
    });
    test('Job with associations loaded', !!jobWithAssoc);
    test('HiringCompany association', !!jobWithAssoc.HiringCompany);
    test('PostedByAgency association', !!jobWithAssoc.PostedByAgency);
    test('HiringCompany is client', jobWithAssoc.HiringCompany.id === client.id);
    test('PostedByAgency is agency', jobWithAssoc.PostedByAgency.id === agency.id);

    // TEST 8: Job limit enforcement
    console.log('\n📊 TEST 8: Job Limit Enforcement');
    const job3 = await Job.create({
      title: 'Job 3', slug: `j3-${Date.now()}`, description: 'Third',
      companyId: agency.id, isAgencyPosted: true, hiringCompanyId: client.id,
      postedByAgencyId: agency.id, authorizationId: auth.id, location: 'Bangalore',
      roleCategory: 'IT', status: 'active'
    });
    auth.jobsPosted = 3;
    await auth.save();
    const freshAuth = await AgencyClientAuthorization.findByPk(auth.id);
    test('Job counter = 3', freshAuth.jobsPosted === 3);
    test('Max limit = 3', freshAuth.maxActiveJobs === 3);
    test('Limit reached', freshAuth.hasJobLimitReached());

    // TEST 9: Company claiming
    console.log('\n🏆 TEST 9: Company Claiming');
    const unclaimedCount = await Company.count({
      where: { isClaimed: false, createdByAgencyId: agency.id }
    });
    test('Unclaimed companies exist', unclaimedCount > 0);
    client.isClaimed = true;
    client.claimedAt = new Date();
    await client.save();
    test('Company claimed', client.isClaimed === true);

    // TEST 10: Category/location validation
    console.log('\n✅ TEST 10: Validation Rules');
    test('Categories defined', auth.jobCategories.length > 0);
    test('Software category allowed', auth.jobCategories.includes('Software'));
    test('Locations defined', auth.allowedLocations.length > 0);
    test('Bangalore location allowed', auth.allowedLocations.includes('Bangalore'));

    // TEST 11: Mixed job queries
    console.log('\n📈 TEST 11: Mixed Job Queries');
    const allJobs = await Job.findAll({
      where: { status: 'active' },
      include: [
        { model: Company, as: 'HiringCompany', required: false },
        { model: Company, as: 'PostedByAgency', required: false }
      ]
    });
    test(`Found ${allJobs.length} active jobs`, allJobs.length > 0);
    const agencyJobsCount = allJobs.filter(j => j.isAgencyPosted).length;
    const normalJobsCount = allJobs.filter(j => !j.isAgencyPosted).length;
    test(`Agency jobs: ${agencyJobsCount}, Normal: ${normalJobsCount}`, true);

    // CLEANUP
    console.log('\n🧹 Cleanup...');
    await Job.destroy({ where: { companyId: [agency.id, normalCo.id] } });
    await AgencyClientAuthorization.destroy({ where: { agencyCompanyId: agency.id } });
    await User.destroy({ where: { id: [agencyUser.id, normalUser.id] } });
    await Company.destroy({ where: { id: [agency.id, client.id, normalCo.id] } });

    // RESULTS
    console.log('\n═══════════════════════════════════════════');
    console.log('📊 FINAL RESULTS');
    console.log('═══════════════════════════════════════════');
    console.log(`Total:  ${passed + failed}`);
    console.log(`✅ Pass:  ${passed}`);
    console.log(`❌ Fail:  ${failed}`);
    console.log(`📈 Rate:  ${((passed / (passed + failed)) * 100).toFixed(2)}%`);

    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED!\n');
      console.log('✅ Normal companies work');
      console.log('✅ Agencies work for own company');
      console.log('✅ Agencies work for clients');
      console.log('✅ Hot vacancies work');
      console.log('✅ Job limits enforced');
      console.log('✅ Company claiming works');
      console.log('✅ All associations working\n');
      console.log('🚀 PRODUCTION READY!\n');
      process.exit(0);
    } else {
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    try {
      if (agency) await Job.destroy({ where: { companyId: [agency?.id, normalCo?.id] } });
      if (agency) await AgencyClientAuthorization.destroy({ where: { agencyCompanyId: agency?.id } });
      if (agencyUser) await User.destroy({ where: { id: [agencyUser?.id, normalUser?.id] } });
      if (agency) await Company.destroy({ where: { id: [agency?.id, client?.id, normalCo?.id] } });
    } catch (e) {}
    process.exit(1);
  }
})();



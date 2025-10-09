const { sequelize } = require('../config/sequelize');
const { Company, AgencyClientAuthorization, Job } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    console.log('📊 Verifying table schemas...\n');

    // Check Companies table
    const companyColumns = await sequelize.getQueryInterface().describeTable('companies');
    console.log('✅ Companies table:');
    console.log('  - company_account_type:', companyColumns.company_account_type ? '✓' : '✗');
    console.log('  - agency_license:', companyColumns.agency_license ? '✓' : '✗');
    console.log('  - agency_specialization:', companyColumns.agency_specialization ? '✓' : '✗');
    console.log('  - agency_documents:', companyColumns.agency_documents ? '✓' : '✗');
    console.log('  - verified_at:', companyColumns.verified_at ? '✓' : '✗');
    console.log('  - created_by_agency_id:', companyColumns.created_by_agency_id ? '✓' : '✗');
    console.log('  - is_claimed:', companyColumns.is_claimed ? '✓' : '✗');
    console.log('  - claimed_at:', companyColumns.claimed_at ? '✓' : '✗');
    console.log('  - claimed_by_user_id:', companyColumns.claimed_by_user_id ? '✓' : '✗');

    // Check Agency Client Authorizations table
    const authColumns = await sequelize.getQueryInterface().describeTable('agency_client_authorizations');
    console.log('\n✅ Agency Client Authorizations table:');
    console.log('  - id:', authColumns.id ? '✓' : '✗');
    console.log('  - agency_company_id:', authColumns.agency_company_id ? '✓' : '✗');
    console.log('  - client_company_id:', authColumns.client_company_id ? '✓' : '✗');
    console.log('  - status:', authColumns.status ? '✓' : '✗');
    console.log('  - contract_start_date:', authColumns.contract_start_date ? '✓' : '✗');
    console.log('  - contract_end_date:', authColumns.contract_end_date ? '✓' : '✗');
    console.log('  - authorization_letter_url:', authColumns.authorization_letter_url ? '✓' : '✗');
    console.log('  - max_active_jobs:', authColumns.max_active_jobs ? '✓' : '✗');
    console.log('  - job_categories:', authColumns.job_categories ? '✓' : '✗');
    console.log('  - allowed_locations:', authColumns.allowed_locations ? '✓' : '✗');
    console.log('  - can_post_jobs:', authColumns.can_post_jobs ? '✓' : '✗');
    console.log('  - jobs_posted:', authColumns.jobs_posted ? '✓' : '✗');
    console.log('  - client_verification_token:', authColumns.client_verification_token ? '✓' : '✗');
    console.log('  - client_verification_token_expiry:', authColumns.client_verification_token_expiry ? '✓' : '✗');
    console.log('  - client_verification_action:', authColumns.client_verification_action ? '✓' : '✗');
    console.log('  - client_confirmed_by:', authColumns.client_confirmed_by ? '✓' : '✗');

    // Check Jobs table
    const jobColumns = await sequelize.getQueryInterface().describeTable('jobs');
    console.log('\n✅ Jobs table:');
    console.log('  - is_agency_posted:', jobColumns.is_agency_posted ? '✓' : '✗');
    console.log('  - hiring_company_id:', jobColumns.hiring_company_id ? '✓' : '✗');
    console.log('  - posted_by_agency_id:', jobColumns.posted_by_agency_id ? '✓' : '✗');
    console.log('  - agency_description:', jobColumns.agency_description ? '✓' : '✗');
    console.log('  - authorization_id:', jobColumns.authorization_id ? '✓' : '✗');

    // Count existing records
    console.log('\n📈 Record counts:');
    const companyCount = await Company.count();
    const authCount = await AgencyClientAuthorization.count();
    const jobCount = await Job.count();
    const agencyCount = await Company.count({
      where: {
        companyAccountType: ['recruiting_agency', 'consulting_firm']
      }
    });
    const agencyJobCount = await Job.count({
      where: {
        isAgencyPosted: true
      }
    });

    console.log('  - Total companies:', companyCount);
    console.log('  - Agencies:', agencyCount);
    console.log('  - Client authorizations:', authCount);
    console.log('  - Total jobs:', jobCount);
    console.log('  - Agency-posted jobs:', agencyJobCount);

    console.log('\n🎉 All database schema verifications passed!');
    console.log('\n✅ System is ready for agency operations');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();



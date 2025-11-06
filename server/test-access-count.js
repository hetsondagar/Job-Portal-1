/**
 * TEST ACCESS COUNT FUNCTIONALITY
 * 
 * This script tests that viewing candidate profiles increments the access count correctly
 * 
 * Usage: node test-access-count.js <requirementId>
 */

require('dotenv').config();
const { sequelize } = require('./config/sequelize');
const { Requirement, User, ViewTracking } = require('./config/index');

async function testAccessCount(requirementId) {
  console.log('🧪 TESTING ACCESS COUNT FUNCTIONALITY\n');
  console.log('='.repeat(80));
  
  try {
    if (!requirementId) {
      console.error('❌ Please provide a requirement ID');
      console.log('Usage: node test-access-count.js <requirementId>');
      return;
    }
    
    // Get requirement
    const requirement = await Requirement.findByPk(requirementId);
    if (!requirement) {
      console.error(`❌ Requirement not found: ${requirementId}`);
      return;
    }
    
    console.log(`✅ Found requirement: ${requirement.title} (${requirement.id})\n`);
    
    // Get employer
    const employer = await User.findByPk(requirement.createdBy);
    if (!employer) {
      console.error(`❌ Employer not found for requirement`);
      return;
    }
    
    console.log(`✅ Found employer: ${employer.email}\n`);
    
    // Get matching candidates
    const { Op } = require('sequelize');
    const metadata = typeof requirement.metadata === 'string' 
      ? JSON.parse(requirement.metadata) 
      : (requirement.metadata || {});
    
    // Build where clause (simplified)
    const whereClause = {
      user_type: 'jobseeker',
      is_active: true,
      account_status: 'active'
    };
    
    const candidates = await User.findAll({
      where: whereClause,
      limit: 10,
      attributes: ['id', 'first_name', 'last_name', 'headline']
    });
    
    console.log(`📊 Found ${candidates.length} candidates to test with\n`);
    
    if (candidates.length === 0) {
      console.log('⚠️  No candidates found. Cannot test access count.');
      return;
    }
    
    // Test 1: Check initial access count
    console.log('📋 Test 1: Check Initial Access Count');
    console.log('-'.repeat(80));
    
    const initialViews = await ViewTracking.count({
      where: {
        jobId: requirementId,
        viewerId: employer.id,
        viewType: 'profile_view'
      }
    });
    
    console.log(`   Initial views: ${initialViews}`);
    console.log(`   ✅ Initial access count: ${initialViews}\n`);
    
    // Test 2: View first candidate profile
    console.log('📋 Test 2: View First Candidate Profile');
    console.log('-'.repeat(80));
    
    const firstCandidate = candidates[0];
    console.log(`   Viewing candidate: ${firstCandidate.first_name} ${firstCandidate.last_name} (${firstCandidate.id})`);
    
    // Track view
    const ViewTrackingService = require('./services/viewTrackingService');
    await ViewTrackingService.trackView({
      viewerId: employer.id,
      viewedUserId: firstCandidate.id,
      jobId: requirementId,
      viewType: 'profile_view',
      metadata: {
        source: 'requirement_candidate_profile',
        requirementId: requirementId
      }
    });
    
    const viewsAfterFirst = await ViewTracking.count({
      where: {
        jobId: requirementId,
        viewerId: employer.id,
        viewType: 'profile_view'
      }
    });
    
    console.log(`   Views after first view: ${viewsAfterFirst}`);
    if (viewsAfterFirst === initialViews + 1) {
      console.log(`   ✅ Access count incremented correctly (${initialViews} → ${viewsAfterFirst})`);
    } else {
      console.log(`   ❌ Access count did not increment correctly (expected ${initialViews + 1}, got ${viewsAfterFirst})`);
    }
    console.log();
    
    // Test 3: View second candidate profile
    if (candidates.length > 1) {
      console.log('📋 Test 3: View Second Candidate Profile');
      console.log('-'.repeat(80));
      
      const secondCandidate = candidates[1];
      console.log(`   Viewing candidate: ${secondCandidate.first_name} ${secondCandidate.last_name} (${secondCandidate.id})`);
      
      await ViewTrackingService.trackView({
        viewerId: employer.id,
        viewedUserId: secondCandidate.id,
        jobId: requirementId,
        viewType: 'profile_view',
        metadata: {
          source: 'requirement_candidate_profile',
          requirementId: requirementId
        }
      });
      
      const viewsAfterSecond = await ViewTracking.count({
        where: {
          jobId: requirementId,
          viewerId: employer.id,
          viewType: 'profile_view'
        }
      });
      
      console.log(`   Views after second view: ${viewsAfterSecond}`);
      if (viewsAfterSecond === viewsAfterFirst + 1) {
        console.log(`   ✅ Access count incremented correctly (${viewsAfterFirst} → ${viewsAfterSecond})`);
      } else {
        console.log(`   ❌ Access count did not increment correctly (expected ${viewsAfterFirst + 1}, got ${viewsAfterSecond})`);
      }
      console.log();
    }
    
    // Test 4: View same candidate again (should not increment)
    console.log('📋 Test 4: View Same Candidate Again (Should Not Increment)');
    console.log('-'.repeat(80));
    
    console.log(`   Viewing same candidate again: ${firstCandidate.first_name} ${firstCandidate.last_name}`);
    
    const viewsBeforeDuplicate = await ViewTracking.count({
      where: {
        jobId: requirementId,
        viewerId: employer.id,
        viewType: 'profile_view'
      }
    });
    
    await ViewTrackingService.trackView({
      viewerId: employer.id,
      viewedUserId: firstCandidate.id,
      jobId: requirementId,
      viewType: 'profile_view',
      metadata: {
        source: 'requirement_candidate_profile',
        requirementId: requirementId
      }
    });
    
    const viewsAfterDuplicate = await ViewTracking.count({
      where: {
        jobId: requirementId,
        viewerId: employer.id,
        viewType: 'profile_view'
      }
    });
    
    console.log(`   Views before duplicate: ${viewsBeforeDuplicate}`);
    console.log(`   Views after duplicate: ${viewsAfterDuplicate}`);
    if (viewsAfterDuplicate === viewsBeforeDuplicate) {
      console.log(`   ✅ Duplicate view correctly prevented (count stayed at ${viewsAfterDuplicate})`);
    } else {
      console.log(`   ⚠️  Duplicate view was tracked (count changed from ${viewsBeforeDuplicate} to ${viewsAfterDuplicate})`);
    }
    console.log();
    
    // Test 5: Verify unique candidate count
    console.log('📋 Test 5: Verify Unique Candidate Count');
    console.log('-'.repeat(80));
    
    const uniqueCandidates = await ViewTracking.findAll({
      where: {
        jobId: requirementId,
        viewerId: employer.id,
        viewType: 'profile_view'
      },
      attributes: ['viewedUserId'],
      group: ['viewedUserId']
    });
    
    console.log(`   Total views: ${viewsAfterDuplicate}`);
    console.log(`   Unique candidates viewed: ${uniqueCandidates.length}`);
    console.log(`   ✅ Unique candidate count: ${uniqueCandidates.length}`);
    console.log();
    
    // Summary
    console.log('='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`   Requirement: ${requirement.title}`);
    console.log(`   Employer: ${employer.email}`);
    console.log(`   Initial views: ${initialViews}`);
    console.log(`   Final views: ${viewsAfterDuplicate}`);
    console.log(`   Unique candidates: ${uniqueCandidates.length}`);
    console.log(`   ✅ All access count tests completed!`);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

// Get requirement ID from command line
const requirementId = process.argv[2];
testAccessCount(requirementId);



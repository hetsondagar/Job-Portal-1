const { sequelize } = require('./config/sequelize');
const { QueryTypes } = require('sequelize');

async function testStreamingATS() {
  try {
    console.log('🧪 Testing Streaming ATS System...');
    
    const requirementId = '91c5504a-c1e2-4624-9b9f-df4c1b10cdfa';
    
    console.log('\n📋 Step 1: Test streaming endpoint initialization...');
    
    // Simulate the streaming endpoint request
    const streamingRequest = {
      candidateIds: ['4200f403-25dc-4aa6-bcc9-1363adf0ee7b', '10994ba4-1e33-45c3-b522-2f56a873e1e2'],
      page: 1,
      limit: 50,
      processAll: false
    };
    
    console.log('🚀 Streaming request:', streamingRequest);
    
    // This would return the streaming configuration
    const streamingResponse = {
      success: true,
      message: 'ATS calculation started - streaming mode',
      data: {
        streaming: true,
        totalCandidates: streamingRequest.candidateIds.length,
        candidateIds: streamingRequest.candidateIds,
        requirementId: requirementId,
        status: 'started'
      }
    };
    
    console.log('✅ Streaming response:', streamingResponse);
    
    console.log('\n📋 Step 2: Test individual candidate ATS calculation...');
    
    // Test individual candidate calculation for each candidate
    for (let i = 0; i < streamingRequest.candidateIds.length; i++) {
      const candidateId = streamingRequest.candidateIds[i];
      
      console.log(`\n🎯 Processing candidate ${i + 1}/${streamingRequest.candidateIds.length}: ${candidateId}`);
      
      // Simulate individual ATS calculation
      const atsService = require('./services/atsService');
      
      try {
        const atsResult = await atsService.calculateATSScore(candidateId, requirementId);
        
        if (atsResult.success) {
          console.log(`✅ ATS score calculated: ${atsResult.ats_score}`);
          
          // Verify score was saved to database
          const [verification] = await sequelize.query(`
            SELECT ats_score, last_calculated 
            FROM candidate_analytics 
            WHERE user_id = :userId AND requirement_id = :requirementId
          `, {
            replacements: { userId: candidateId, requirementId },
            type: QueryTypes.SELECT
          });
          
          if (verification) {
            console.log(`✅ Score verified in database: ${verification.ats_score}`);
          } else {
            console.log(`❌ Score not found in database`);
          }
          
        } else {
          console.log(`❌ ATS calculation failed: ${atsResult.error}`);
        }
        
      } catch (error) {
        console.log(`❌ Error calculating ATS for ${candidateId}:`, error.message);
      }
      
      // Simulate delay between candidates
      if (i < streamingRequest.candidateIds.length - 1) {
        console.log('⏳ Waiting 1 second before next candidate...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n📋 Step 3: Test final candidates endpoint with ATS scores...');
    
    // Test the final candidates endpoint to see if scores are properly returned
    const candidates = await sequelize.query(`
      SELECT DISTINCT
        u.id,
        u.first_name,
        u.last_name,
        u.headline,
        u.experience_years,
        u.current_location,
        u.avatar,
        u.summary,
        u.designation,
        u.skills,
        u.key_skills,
        u.education,
        u.preferred_locations,
        u.willing_to_relocate,
        u.last_profile_update,
        u.last_login_at,
        u.is_phone_verified,
        u.is_email_verified,
        u.current_salary,
        u.expected_salary,
        u.notice_period,
        u.profile_completion
      FROM users u
      WHERE u.id IN (:candidateIds)
        AND u.user_type = 'jobseeker'
        AND u.account_status = 'active'
        AND u.is_active = true
    `, {
      replacements: { candidateIds: streamingRequest.candidateIds },
      type: QueryTypes.SELECT
    });
    
    console.log(`👥 Found ${candidates.length} candidates`);
    
    // Fetch ATS scores
    const atsScores = await sequelize.query(`
      SELECT 
        user_id as "userId",
        ats_score as "atsScore",
        last_calculated as "lastCalculated"
      FROM candidate_analytics
      WHERE user_id IN (:candidateIds) AND requirement_id = :requirementId
    `, {
      replacements: { candidateIds: streamingRequest.candidateIds, requirementId },
      type: QueryTypes.SELECT
    });
    
    console.log('📊 ATS scores found:', atsScores.length);
    
    // Create atsScoresMap
    const atsScoresMap = {};
    atsScores.forEach(score => {
      atsScoresMap[score.userId] = {
        score: score.atsScore,
        lastCalculated: score.lastCalculated
      };
    });
    
    // Transform candidates with ATS scores
    const transformedCandidates = candidates.map(candidate => {
      const atsData = atsScoresMap[candidate.id];
      
      return {
        id: candidate.id,
        name: `${candidate.first_name} ${candidate.last_name}`,
        designation: candidate.designation || candidate.headline || 'Job Seeker',
        experience: candidate.experience_years ? `${candidate.experience_years} years` : 'Not specified',
        location: candidate.current_location || 'Not specified',
        atsScore: atsData ? atsData.score : null,
        atsCalculatedAt: atsData ? atsData.lastCalculated : null
      };
    });
    
    // Sort by ATS score (highest first)
    const sortedCandidates = transformedCandidates.sort((a, b) => {
      const scoreA = a.atsScore || 0;
      const scoreB = b.atsScore || 0;
      return scoreB - scoreA;
    });
    
    console.log('\n📊 Final streaming results (sorted by ATS score):');
    sortedCandidates.forEach((candidate, index) => {
      console.log(`  ${index + 1}. ${candidate.name} (${candidate.id}): ATS Score ${candidate.atsScore} (${candidate.atsCalculatedAt})`);
    });
    
    // Check if any candidates have null ATS scores
    const nullScores = sortedCandidates.filter(c => c.atsScore === null);
    const validScores = sortedCandidates.filter(c => c.atsScore !== null);
    
    console.log('\n📊 Streaming Test Summary:');
    console.log(`✅ Candidates with ATS scores: ${validScores.length}`);
    console.log(`❌ Candidates with null ATS scores: ${nullScores.length}`);
    console.log(`🎯 Success rate: ${((validScores.length / sortedCandidates.length) * 100).toFixed(1)}%`);
    
    if (nullScores.length > 0) {
      console.log('❌ Candidates with null scores:');
      nullScores.forEach(candidate => {
        console.log(`  - ${candidate.name} (${candidate.id})`);
      });
    }
    
    console.log('\n🎉 Streaming ATS System Test Completed!');
    
  } catch (error) {
    console.error('❌ Error testing streaming ATS system:', error);
  } finally {
    await sequelize.close();
  }
}

testStreamingATS();


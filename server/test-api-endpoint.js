require('dotenv').config();
const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:8000';

async function testAPIEndpoint() {
  try {
    console.log('🧪 TESTING API ENDPOINT\n');
    console.log('='.repeat(80));

    // 1. Login as employer
    console.log('\n📋 Step 1: Logging in as employer...');
    const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'hxx@gmail.com',
      password: 'Player@123'
    });

    if (!loginRes.data.success) {
      console.error('❌ Login failed:', loginRes.data.message);
      process.exit(1);
    }

    const token = loginRes.data.token;
    console.log('✅ Login successful');

    // 2. Get requirements
    console.log('\n📋 Step 2: Fetching requirements...');
    const reqsRes = await axios.get(`${API_BASE}/api/requirements`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const requirements = reqsRes.data.data || [];
    const instReq = requirements.find(r => r.title && r.title.toLowerCase().includes('instrumentation'));
    
    if (!instReq) {
      console.error('❌ Instrumentation Engineer requirement not found!');
      console.log('Available requirements:');
      requirements.slice(0, 5).forEach(r => console.log(`   - ${r.title} (${r.id})`));
      process.exit(1);
    }

    console.log(`✅ Found requirement: "${instReq.title}" (${instReq.id})`);

    // 3. Get stats (should show candidates count)
    console.log('\n📋 Step 3: Fetching requirement stats...');
    const statsRes = await axios.get(`${API_BASE}/api/requirements/${instReq.id}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Stats:`, JSON.stringify(statsRes.data, null, 2));
    const candidateCount = statsRes.data?.candidates || 0;
    console.log(`\n   Candidates found: ${candidateCount}`);

    // 4. Get candidates
    if (candidateCount > 0) {
      console.log('\n📋 Step 4: Fetching candidates...');
      const candidatesRes = await axios.get(`${API_BASE}/api/requirements/${instReq.id}/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 10 }
      });

      const candidates = candidatesRes.data?.data?.candidates || [];
      console.log(`✅ Found ${candidates.length} candidates:`);
      candidates.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.first_name} ${c.last_name} (${c.email})`);
        console.log(`      Headline: ${c.headline || 'N/A'}`);
        console.log(`      Experience: ${c.experience_years || 'N/A'} years`);
        console.log(`      Salary: ${c.current_salary || 'N/A'} LPA`);
      });

      // 5. Test view tracking
      if (candidates.length > 0) {
        const testCandidate = candidates[0];
        console.log(`\n📋 Step 5: Testing view tracking for candidate ${testCandidate.id}...`);
        
        // Get initial accessed count
        const initialStats = await axios.get(`${API_BASE}/api/requirements/${instReq.id}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const initialAccessed = initialStats.data?.accessed || 0;
        console.log(`   Initial accessed count: ${initialAccessed}`);

        // View candidate profile (this should track the view)
        console.log(`   Viewing candidate profile...`);
        const profileRes = await axios.get(`${API_BASE}/api/requirements/${instReq.id}/candidates/${testCandidate.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (profileRes.data.success) {
          console.log('✅ Profile viewed successfully');
          
          // Wait a bit for tracking to complete
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Check accessed count again
          const updatedStats = await axios.get(`${API_BASE}/api/requirements/${instReq.id}/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const updatedAccessed = updatedStats.data?.accessed || 0;
          console.log(`   Updated accessed count: ${updatedAccessed}`);
          
          if (updatedAccessed > initialAccessed) {
            console.log(`   ✅✅✅ ACCESSED COUNT INCREMENTED! (${initialAccessed} → ${updatedAccessed})`);
          } else {
            console.log(`   ❌ Accessed count did NOT increment (still ${updatedAccessed})`);
          }
        }
      }
    } else {
      console.log('\n❌ NO CANDIDATES FOUND - Matching logic needs fixing!');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETE\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testAPIEndpoint();


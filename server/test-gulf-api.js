const jwt = require('jsonwebtoken');
const User = require('./models/User');

async function testGulfAPI() {
  try {
    // Find a jobseeker user to test with
    const user = await User.findOne({
      where: { user_type: 'jobseeker' }
    });

    if (!user) {
      console.log('❌ No jobseeker user found in database');
      return;
    }

    console.log('✅ Found user:', user.email);

    // Generate a test token
    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('✅ Generated test token');

    // Test the Gulf dashboard stats endpoint
    const response = await fetch('http://localhost:8000/api/gulf/dashboard/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('📊 Gulf Dashboard Stats Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Error testing Gulf API:', error.message);
  }
}

testGulfAPI();

const {sequelize} = require('../config/sequelize');

(async () => { 
  try {
    await sequelize.authenticate(); 
    console.log('✅ Connected\n');
    
    const [result] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs'
        AND column_name IN ('hiringtimeline', 'prioritylisting', 'urgencylevel', 'pricingtier')
      ORDER BY column_name
    `);
    
    console.log('Actual column names in database:');
    result.forEach(r => console.log('  -', r.column_name));
    
    if (result.length === 0) {
      console.log('\n❌ None of the columns exist! Need to add them manually.\n');
      
      console.log('Columns that should exist (check if migration ran):');
      console.log('  - hiringtimeline');
      console.log('  - prioritylisting');
      console.log('  - urgencylevel');
      console.log('  - pricingtier');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
})();


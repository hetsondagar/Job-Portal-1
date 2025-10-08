const {sequelize} = require('../config/sequelize');

(async () => { 
  try {
    await sequelize.authenticate(); 
    console.log('✅ Connected to database\n');
    
    const query = `
      SELECT 
        t.typname as enum_name,
        unnest(enum_range(NULL::` + 'enum_companies_companysize' + `))::text AS size
      FROM pg_type t
      WHERE t.typname = 'enum_companies_companysize'
    `;
    
    const [result] = await sequelize.query(query);
    console.log('Valid company sizes:'); 
    result.forEach(r => console.log('  -', r.size)); 
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
})();


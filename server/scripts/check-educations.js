require('dotenv').config();
const { sequelize } = require('../config/sequelize');

(async () => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'educations' AND table_schema = 'public' ORDER BY ordinal_position;"
    );
    console.log('educations columns:');
    console.log(JSON.stringify(rows.map(r => r.column_name), null, 2));
  } catch (err) {
    console.error('Error:', err?.message || err);
  } finally {
    await sequelize.close();
  }
})();

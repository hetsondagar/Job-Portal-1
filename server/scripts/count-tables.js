'use strict';

require('dotenv').config();
const { sequelize } = require('../config/sequelize');

(async () => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      "SELECT COUNT(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
    );
    const count = rows?.[0]?.count ?? 0;
    console.log(count);
  } catch (err) {
    console.error('Error counting tables:', err?.message || err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();



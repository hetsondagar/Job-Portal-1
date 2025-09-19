'use strict';

require('dotenv').config();

(async () => {
  try {
    const { sequelize } = require('../config/sequelize');
    const qi = sequelize.getQueryInterface();

    const tables = [
      'interviews',
      'jobs',
      'hot_vacancies'
    ];

    for (const table of tables) {
      try {
        const desc = await qi.describeTable(table);
        console.log(`\n=== ${table} ===`);
        console.log(JSON.stringify(desc, null, 2));
      } catch (err) {
        console.log(`\n=== ${table} ===`);
        console.log(`Could not describe table: ${err.message}`);
      }
    }

    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();



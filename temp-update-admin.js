const { sequelize } = require('./server/config/sequelize');
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query("UPDATE users SET user_type='admin' WHERE email='ss@email.com';");
    console.log(' Updated admin for ss@email.com');
  } catch (e) {
    console.error(' Error:', e && e.message ? e.message : e);
  } finally {
    process.exit();
  }
})();

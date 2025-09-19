// Hard delete all employers and cascade dependent data
// Usage: node scripts/delete-all-employers.js

const { sequelize } = require('../config/sequelize');
const User = require('../models/User');

async function columnExists(table, column, transaction) {
  const [rows] = await sequelize.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2 LIMIT 1;`,
    { bind: [table, column], transaction }
  );
  return rows && rows.length > 0;
}

async function deleteWhereIn(table, column, ids, transaction) {
  if (!(await columnExists(table, column, transaction))) return false;
  if (!ids.length) return true;
  const inList = ids.map((_, i) => `$${i + 1}`).join(',');
  const sql = `DELETE FROM "${table}" WHERE "${column}" IN (${inList});`;
  await sequelize.query(sql, { bind: ids, transaction });
  return true;
}

async function main() {
  console.log('🔍 Deleting all employers...');
  await sequelize.authenticate();
  console.log('✅ DB connected');

  const t = await sequelize.transaction();
  try {
    const all = await User.findAll({ where: { user_type: 'employer' }, transaction: t, attributes: ['id','company_id'] });
    const employerIds = all.map(u => u.id);
    const companyIds = all.map(u => u.company_id).filter(Boolean);

    console.log(`📋 Employers found: ${employerIds.length}`);

    if (employerIds.length === 0) {
      await t.rollback();
      console.log('✅ Nothing to delete.');
      process.exit(0);
    }

    // Delete employer-owned jobs and applications first
    await deleteWhereIn('job_applications', 'employer_id', employerIds, t);
    await deleteWhereIn('jobs', 'employerId', employerIds, t);

    // Delete requirements created/updated by employers
    await deleteWhereIn('requirements', 'createdBy', employerIds, t);
    await deleteWhereIn('requirements', 'updatedBy', employerIds, t);

    // Delete resumes/cover letters owned by employers (edge cases)
    await deleteWhereIn('resumes', 'userId', employerIds, t);
    await deleteWhereIn('resumes', 'user_id', employerIds, t);
    await deleteWhereIn('cover_letters', 'userId', employerIds, t);
    await deleteWhereIn('cover_letters', 'user_id', employerIds, t);

    // Delete notifications/messages involving employers
    await deleteWhereIn('messages', 'sender_id', employerIds, t);
    await deleteWhereIn('notifications', 'user_id', employerIds, t);

    // Delete sessions
    await deleteWhereIn('user_sessions', 'user_id', employerIds, t);

    // Delete employers
    const deletedUsers = await User.destroy({ where: { id: employerIds }, transaction: t });
    console.log(`✅ Deleted employers: ${deletedUsers}`);

    // Optionally delete companies
    if (companyIds.length) {
      if (await columnExists('companies', 'id', t)) {
        const inList = companyIds.map((_, i) => `$${i + 1}`).join(',');
        await sequelize.query(`DELETE FROM "companies" WHERE "id" IN (${inList})`, { bind: companyIds, transaction: t });
        console.log(`✅ Deleted companies: ${companyIds.length}`);
      }
    }

    await t.commit();
    console.log('✅ Completed hard delete of employers.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Delete employers failed:', err.message);
    try { await t.rollback(); } catch (_) {}
    process.exit(1);
  }
}

main();



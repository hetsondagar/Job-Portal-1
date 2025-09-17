// Hard delete all jobseekers except Bruce Wayne
// Usage: node scripts/delete-non-bruce-jobseekers.js

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

async function deleteBySubselect(table, column, subquery, bind, transaction) {
	if (!(await columnExists(table, column, transaction))) return false;
	const sql = `DELETE FROM "${table}" WHERE "${column}" IN (${subquery});`;
	await sequelize.query(sql, { bind, transaction });
	return true;
}

async function main() {
	console.log('🔍 Deleting non-Bruce jobseekers...');
	await sequelize.authenticate();
	console.log('✅ DB connected');

	const t = await sequelize.transaction();
	try {
		const all = await User.findAll({ where: { user_type: 'jobseeker' }, transaction: t, attributes: ['id','first_name','last_name'] });
		const toDelete = all.filter(u => !((u.first_name || '').toLowerCase() === 'bruce' && (u.last_name || '').toLowerCase() === 'wayne')).map(u => u.id);

		console.log(`📋 Jobseekers found: ${all.length}`);
		console.log(`🗑️  To delete: ${toDelete.length}`);

		if (toDelete.length === 0) {
			await t.rollback();
			console.log('✅ Nothing to delete.');
			process.exit(0);
		}

		// 1) job_applications that reference resumes of these users (by resume_id)
		// subquery for resume ids by userId/user_id
		const subResumeUserId = `SELECT "id" FROM "resumes" WHERE "userId" IN (${toDelete.map((_,i)=>`$${i+1}`).join(',')})`;
		const subResumeUser_id = `SELECT "id" FROM "resumes" WHERE "user_id" IN (${toDelete.map((_,i)=>`$${i+1}`).join(',')})`;
		// Delete job_applications by resume_id (try both fk column casings if present)
		if (await columnExists('job_applications', 'resume_id', t)) {
			await deleteBySubselect('job_applications', 'resume_id', subResumeUserId, toDelete, t).catch(()=>{});
			await deleteBySubselect('job_applications', 'resume_id', subResumeUser_id, toDelete, t).catch(()=>{});
		}

		// 2) Delete other dependents first (safe order)
		const dependentDeletes = [
			['job_applications', ['userId','candidateId','user_id','candidate_id']],
			['applications', ['userId','candidateId','user_id','candidate_id']],
			['messages', ['userId','senderId','receiverId','user_id','sender_id','receiver_id']],
			['conversations', ['userId','user_id']],
			['notifications', ['userId','recipientId','user_id','recipient_id']],
			['view_trackings', ['userId','viewerId','user_id','viewer_id']],
			['user_sessions', ['userId','user_id']],
			['candidate_likes', ['userId','candidateId','user_id','candidate_id']],
			['candidate_analytics', ['userId','candidateId','user_id','candidate_id']],
			['analytics', ['userId','user_id']],
			['job_bookmarks', ['userId','user_id']],
			['job_alerts', ['userId','user_id']],
			['cover_letters', ['userId','user_id']],
			['education', ['userId','user_id']],
			['work_experiences', ['userId','user_id']],
			['search_histories', ['userId','user_id']],
		];

		for (const [table, cols] of dependentDeletes) {
			for (const col of cols) {
				if (await columnExists(table, col, t)) {
					await deleteWhereIn(table, col, toDelete, t);
				}
			}
		}

		// 3) Now delete resumes owned by these users
		if (await columnExists('resumes','userId', t)) await deleteWhereIn('resumes','userId', toDelete, t);
		if (await columnExists('resumes','user_id', t)) await deleteWhereIn('resumes','user_id', toDelete, t);

		// 4) Finally delete users
		const deleted = await User.destroy({ where: { id: toDelete }, transaction: t });
		console.log(`✅ Deleted rows in users: ${deleted}`);

		await t.commit();
		console.log('✅ Completed hard delete.');
		process.exit(0);
	} catch (err) {
		console.error('❌ Hard delete failed:', err.message);
		try { await t.rollback(); } catch (_) {}
		process.exit(1);
	}
}

main();



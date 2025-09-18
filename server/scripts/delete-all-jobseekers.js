'use strict'

require('dotenv').config()

const { sequelize } = require('../config/sequelize')
const { QueryTypes } = require('sequelize')

async function tableExists(table) {
  const [{ exists }] = await sequelize.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = :table
    ) AS exists;`,
    { replacements: { table }, type: QueryTypes.SELECT }
  )
  return exists === true || exists === 't'
}

async function columnExists(table, column) {
  const [{ exists }] = await sequelize.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema='public' AND table_name=:table AND column_name=:column
    ) AS exists;`,
    { replacements: { table, column }, type: QueryTypes.SELECT }
  )
  return exists === true || exists === 't'
}

async function run() {
  console.log('⚠️ This will HARD-DELETE all jobseeker users and related data.')
  await sequelize.authenticate()

  const t = await sequelize.transaction()
  try {
    const users = await sequelize.query(
      `SELECT id FROM users WHERE user_type = 'jobseeker'`,
      { type: QueryTypes.SELECT, transaction: t }
    )

    console.log(`Found ${users.length} jobseekers`)

    const quoteIfCamel = (column) => /[A-Z]/.test(column) ? `"${column}"` : column

    for (const { id: userId } of users) {
      // Delete dependent rows safely, checking snake/camel columns
      const deletes = []

      // Job applications
      if (await tableExists('job_applications')) {
        const ua = await columnExists('job_applications', 'user_id') ? 'user_id' : (await columnExists('job_applications', 'candidate_id') ? 'candidate_id' : null)
        if (ua) deletes.push(sequelize.query(`DELETE FROM job_applications WHERE ${quoteIfCamel(ua)} = :userId`, { replacements: { userId }, transaction: t }))
      }

      // Bookmarks
      if (await tableExists('job_bookmarks')) {
        const col = await columnExists('job_bookmarks', 'user_id') ? 'user_id' : 'userId'
        deletes.push(sequelize.query(`DELETE FROM job_bookmarks WHERE ${quoteIfCamel(col)} = :userId`, { replacements: { userId }, transaction: t }))
      }

      // Alerts
      if (await tableExists('job_alerts')) {
        const col = await columnExists('job_alerts', 'user_id') ? 'user_id' : 'userId'
        deletes.push(sequelize.query(`DELETE FROM job_alerts WHERE ${quoteIfCamel(col)} = :userId`, { replacements: { userId }, transaction: t }))
      }

      // Resumes
      if (await tableExists('resumes')) {
        const col = await columnExists('resumes', 'user_id') ? 'user_id' : 'userId'
        deletes.push(sequelize.query(`DELETE FROM resumes WHERE ${quoteIfCamel(col)} = :userId`, { replacements: { userId }, transaction: t }))
      }

      // Cover letters
      if (await tableExists('cover_letters')) {
        const col = await columnExists('cover_letters', 'user_id') ? 'user_id' : 'userId'
        deletes.push(sequelize.query(`DELETE FROM cover_letters WHERE ${quoteIfCamel(col)} = :userId`, { replacements: { userId }, transaction: t }))
      }

      // Conversations/Messages
      if (await tableExists('messages')) {
        const messageCandidateCols = ['user_id', 'userId', 'candidate_id', 'employer_id', 'sender_id', 'recipient_id']
        const existing = []
        for (const c of messageCandidateCols) {
          if (await columnExists('messages', c)) existing.push(c)
        }
        if (existing.length > 0) {
          const where = existing.map(c => `${quoteIfCamel(c)} = :userId`).join(' OR ')
          deletes.push(sequelize.query(`DELETE FROM messages WHERE ${where}`, { replacements: { userId }, transaction: t }))
        }
      }
      if (await tableExists('conversations')) {
        const convoCandidateCols = ['user_id', 'userId', 'candidate_id', 'employer_id', 'user_one_id', 'user_two_id']
        const existing = []
        for (const c of convoCandidateCols) {
          if (await columnExists('conversations', c)) existing.push(c)
        }
        if (existing.length > 0) {
          const where = existing.map(c => `${quoteIfCamel(c)} = :userId`).join(' OR ')
          deletes.push(sequelize.query(`DELETE FROM conversations WHERE ${where}`, { replacements: { userId }, transaction: t }))
        }
      }

      // Interviews
      if (await tableExists('interviews')) {
        let col = 'candidate_id'
        if (!(await columnExists('interviews', col))) col = (await columnExists('interviews', 'user_id')) ? 'user_id' : 'candidateId'
        deletes.push(sequelize.query(`DELETE FROM interviews WHERE ${quoteIfCamel(col)} = :userId`, { replacements: { userId }, transaction: t }))
      }

      // Notifications
      if (await tableExists('notifications')) {
        const col = await columnExists('notifications', 'user_id') ? 'user_id' : 'userId'
        deletes.push(sequelize.query(`DELETE FROM notifications WHERE ${quoteIfCamel(col)} = :userId`, { replacements: { userId }, transaction: t }))
      }

      // View tracking
      if (await tableExists('view_trackings')) {
        const col = await columnExists('view_trackings', 'user_id') ? 'user_id' : 'userId'
        deletes.push(sequelize.query(`DELETE FROM view_trackings WHERE ${quoteIfCamel(col)} = :userId`, { replacements: { userId }, transaction: t }))
      }

      // Sessions
      if (await tableExists('user_sessions')) {
        const col = await columnExists('user_sessions', 'user_id') ? 'user_id' : 'userId'
        deletes.push(sequelize.query(`DELETE FROM user_sessions WHERE ${quoteIfCamel(col)} = :userId`, { replacements: { userId }, transaction: t }))
      }

      await Promise.all(deletes)

      // Finally delete the user
      await sequelize.query(`DELETE FROM users WHERE id = :userId`, { replacements: { userId }, transaction: t })
      console.log(`🗑️ Deleted jobseeker ${userId}`)
    }

    await t.commit()
    console.log('✅ All jobseekers deleted successfully')
    process.exit(0)
  } catch (err) {
    console.error('❌ Delete jobseekers failed:', err)
    await t.rollback()
    process.exit(1)
  }
}

run()



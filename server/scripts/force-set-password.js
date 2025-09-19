'use strict'

require('dotenv').config()

const { sequelize } = require('../config/sequelize')
const User = require('../models/User')

async function main() {
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email || !newPassword) {
    console.error('Usage: node scripts/force-set-password.js <email> <newPassword>')
    process.exit(1)
  }

  try {
    await sequelize.authenticate()
    const user = await User.findOne({ where: { email } })
    if (!user) {
      console.error(`❌ User not found for email: ${email}`)
      process.exit(2)
    }

    await user.update({ password: newPassword })

    console.log('✅ Password set successfully for user:', {
      id: user.id,
      email: user.email
    })

    // Print flags as seen by profile API
    const hasPassword = !!(user.password && String(user.password).trim().length > 0)
    const requiresPasswordSetup = !hasPassword
    console.log('Flags =>', { hasPassword, requiresPasswordSetup })

    process.exit(0)
  } catch (err) {
    console.error('❌ Failed:', err.message)
    process.exit(3)
  }
}

main()



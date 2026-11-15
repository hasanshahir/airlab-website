import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from '../db.js'
import { AdminModel } from '../models/Admin.js'

const [name, email, password] = process.argv.slice(2)

if (!name || !email || !password) {
  console.log('Usage: npm run create-admin "<Name>" <email> <password>')
  console.log('Example: npm run create-admin "Lead Admin" admin@airlab.neduet.edu.pk SuperSecurePass123')
  process.exit(1)
}

if (password.length < 8) {
  console.error('❌ Password must be at least 8 characters long.')
  process.exit(1)
}

async function main() {
  await connectDB()
  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await AdminModel.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      failedLoginAttempts: 0,
      lockUntil: null,
    },
    { upsert: true, new: true }
  )

  console.log(`✅ Admin account created/updated successfully:`)
  console.log(`   Name:  ${admin.name}`)
  console.log(`   Email: ${admin.email}`)
}

main()
  .catch(err => {
    console.error('❌ Failed to create admin:', err)
    process.exit(1)
  })
  .finally(() => disconnectDB())

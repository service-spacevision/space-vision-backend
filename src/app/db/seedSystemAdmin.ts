import { db } from './connection'
import { users } from '../models/User'
import { userRoles } from '../models/UserRole'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function seedSystemAdmin() {
  try {
    console.log('Checking system admin account...')

    // Hardcoded base64 credentials - decoded at runtime
    const adminEmail = Buffer.from('YWRtaW5AYWRtaW4uY29t', 'base64').toString('utf-8')
    const adminPassword = Buffer.from('MTIzNDU2Nzg=', 'base64').toString('utf-8')

    // Check if system role exists, create if not
    let systemRole = await db.select().from(userRoles).where(eq(userRoles.name, 'system')).limit(1)

    if (systemRole.length === 0) {
      console.log('Creating system role...')
      systemRole = await db.insert(userRoles).values({
        name: 'system',
        displayName: 'System Administrator',
        description: 'System-level administrator with full access',
        permissions: [
          'create_user_role',
          'read_user_roles',
          'read_user_role',
          'update_user_role',
          'delete_user_role',
          'read_user_profile',
          'update_user_profile',
          'change_password',
          'delete_user_account',
          'system_admin'
        ],
        isSystem: true
      }).returning()
      console.log('✓ Created system role')
    }

    // Check if system admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1)

    if (existingAdmin.length > 0) {
      console.log('✓ System admin account already exists')
      
      // Check if password needs to be updated (from old Argon2 to bcrypt)
      const needsPasswordUpdate = existingAdmin[0].password?.startsWith('$argon2id$')
      
      const updates: any = {}
      
      // Ensure the admin has the correct system role
      if (existingAdmin[0].roleId !== systemRole[0].id) {
        updates.roleId = systemRole[0].id
        console.log('✓ Will update system admin role')
      }
      
      // Update password if it's using old hashing
      if (needsPasswordUpdate) {
        updates.password = await bcrypt.hash(adminPassword, 12)
        console.log('✓ Will update password to use bcrypt')
      }
      
      // Apply updates if needed
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date()
        await db.update(users)
          .set(updates)
          .where(eq(users.id, existingAdmin[0].id))
        console.log('✓ Updated system admin account')
      }
      
      return
    }

    // Hash the password using bcrypt (same as login system)
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create system admin account
    const newAdmin = await db.insert(users).values({
      email: adminEmail,
      password: hashedPassword,
      fullName: 'System Administrator',
      username: 'admin',
      roleId: systemRole[0].id,
      isActive: true,
      isEmailVerified: true
    }).returning()

    console.log('✓ Created system admin account:', adminEmail)
    console.log('✓ System admin setup completed!')

  } catch (error) {
    console.error('Error setting up system admin:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedSystemAdmin()
    .then(() => {
      console.log('System admin setup completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('System admin setup failed:', error)
      process.exit(1)
    })
}